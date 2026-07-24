# Deploy no Easypanel

O zCardapio roda em Docker. Este guia cobre o deploy no [Easypanel](https://easypanel.io).

## 1. Banco de dados (PostgreSQL)

1. No Easypanel, crie um **Service → PostgreSQL** (ex.: `zcardapio-db`).
2. Anote a string de conexão interna (algo como
   `postgres://usuario:senha@zcardapio-db:5432/zcardapio`).

> Use a URL **interna** (nome do serviço como host), não a pública. Dentro da rede
> do Easypanel não precisa de SSL.

## 2. Aplicação

1. Crie um **App** apontando para o repositório Git.
2. Builder: **Dockerfile** (o Easypanel detecta o `Dockerfile` na raiz).
3. Em **Domains**, adicione seu domínio — o Easypanel emite o SSL (Let's Encrypt) automaticamente.

## 3. Variáveis de ambiente (runtime)

Em **App → Environment Variables**, defina:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ | String de conexão do Postgres (do passo 1). |
| `AUTH_SECRET` | ✅ | Segredo das sessões. Gere com:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | opcional | E-mail (recuperação de senha de vendedor/admin). Sem isso, o e-mail é logado no console. |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE` | opcional | WhatsApp (Evolution API). Sem isso, a mensagem é logada no console. |
| `MP_ACCESS_TOKEN` | opcional | MercadoPago (cobrança de plano). Sem isso, o checkout de plano fica indisponível. |

## 4. Build args (variáveis `NEXT_PUBLIC_*`)

As variáveis `NEXT_PUBLIC_*` são embutidas **no build** pelo Next.js. Se quiser
analytics/OG ativos, defina-as como **Build Arguments** no Easypanel (não como
env de runtime):

| Build arg | Descrição |
|-----------|-----------|
| `NEXT_PUBLIC_SITE_URL` | URL pública (ex.: `https://zcardapio.com.br`) — usada nas tags Open Graph. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ID do Google Analytics 4 (`G-XXXX`). |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Token de verificação do Search Console. |

> Sem elas o app funciona normalmente (analytics fica desativado e o OG usa a URL padrão).

## 5. Storage persistente (IMPORTANTE)

Os uploads (logo, capa, fotos dos produtos) ficam em `public/uploads`. Para não
perder as imagens a cada redeploy:

1. Em **App → Storage**, adicione um volume.
2. Monte em `/app/public/uploads`.

## 6. Deploy

Faça o deploy. Em cada start o container:

1. Roda as migrações pendentes (`npm run db:migrate`) — seguro e idempotente.
2. Sobe o servidor (`next start`), escutando na `PORT` definida pelo Easypanel.

## Teste local da imagem (opcional)

```bash
docker build -t zcardapio .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgres://usuario:senha@host:5432/zcardapio" \
  -e AUTH_SECRET="seu-segredo" \
  -v zcardapio-uploads:/app/public/uploads \
  zcardapio
```
