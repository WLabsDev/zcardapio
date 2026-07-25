# syntax=docker/dockerfile:1

# ---- Build ----
FROM node:24-alpine AS builder
WORKDIR /app

# Instala todas as dependências (incluindo dev: drizzle-kit e typescript são
# necessários para o build e para rodar as migrações).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# DATABASE_URL de build apenas para o módulo de banco carregar durante a
# geração das páginas estáticas — nenhuma conexão real é feita no build.
# Em runtime o Easypanel injeta o DATABASE_URL de verdade.
ARG DATABASE_URL=postgres://build:build@localhost:5432/build

# NÃO declare aqui variáveis NEXT_PUBLIC_*: o Next as embute no bundle durante o
# build, e o cache de camadas do Docker faz um redeploy reaproveitar o bundle
# antigo — o valor novo só apareceria com um rebuild sem cache. GA, URL do site e
# verificação do Search Console são lidos em runtime (ver src/lib/site-config.ts),
# então basta definir as envs no Easypanel e reiniciar.
RUN npm run build

# ---- Runtime ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia o app já buildado (com node_modules, necessário p/ drizzle-kit migrate).
COPY --from=builder /app ./

# Os uploads (logo, capa, fotos) ficam em public/uploads. No Easypanel, monte um
# VOLUME persistente nesse caminho para as imagens sobreviverem a redeploys.
VOLUME /app/public/uploads

EXPOSE 3000

# Aplica migrações pendentes e sobe o servidor. `next start` respeita a PORT
# definida pelo Easypanel e escuta em 0.0.0.0 para o proxy reverso alcançar.
CMD ["sh", "-c", "npm run db:migrate && npx next start -H 0.0.0.0"]
