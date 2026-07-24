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

# Variáveis NEXT_PUBLIC_* são embutidas pelo Next.js no BUILD (não em runtime).
# Defina-as como build args no Easypanel se quiser analytics/OG ativos.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
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
