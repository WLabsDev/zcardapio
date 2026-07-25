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
| `MP_WEBHOOK_SECRET` | recomendada com o MP | Segredo do webhook do MercadoPago — valida a assinatura das notificações (veja abaixo). |

### Webhook do MercadoPago

O plano é cobrado pelo **Checkout Pro**: o painel redireciona o restaurante para
o MercadoPago e a ativação acontece quando chega a notificação de pagamento.

1. No painel do MercadoPago: **Suas integrações → sua aplicação → Webhooks**.
2. URL: `https://SEU-DOMINIO/api/webhooks/mercadopago` · evento: **Pagamentos**.
3. Copie o **Segredo** gerado ali e coloque em `MP_WEBHOOK_SECRET`.

Com o segredo definido, notificação sem assinatura válida (`x-signature`) leva
401 e é descartada. Sem o segredo, o endpoint aceita qualquer POST e registra um
aviso no log — o dano é limitado (o pagamento é consultado na API do MercadoPago
pelo id antes de ativar qualquer plano), mas não deixe assim em produção.

## 4. Marketing / Analytics (também runtime)

Estas também vão em **Environment Variables** — **não** as coloque como Build
Arguments:

| Variável | Descrição |
|----------|-----------|
| `SITE_URL` | URL pública (ex.: `https://zcardapio.com.br`). Além das tags Open Graph, é o domínio dos links que saem do servidor: e-mail de recuperação de senha, aviso de pedido no WhatsApp e retorno do MercadoPago. **Defina em produção** — atrás do proxy do Easypanel a requisição chega como `0.0.0.0:80` e o link sairia quebrado. |
| `GA_MEASUREMENT_ID` | ID do Google Analytics 4 (`G-XXXX`). |
| `GOOGLE_SITE_VERIFICATION` | Token de verificação do Search Console. |

Depois de alterar qualquer uma delas, **reiniciar o app já basta** — não precisa
rebuild. Sem elas o app funciona normalmente (analytics desativado, OG com a URL
padrão).

> **Por que não `NEXT_PUBLIC_*`?** O Next.js embute variáveis com esse prefixo no
> JavaScript durante o `next build`. Como o Easypanel reaproveita o cache de
> camadas do Docker, um redeploy depois de mudar o valor reusa o bundle antigo e
> nada muda — era preciso rebuild do zero. Lidas em runtime no servidor
> (`src/lib/site-config.ts`), o problema deixa de existir. Os nomes antigos
> `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` e
> `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` continuam funcionando como env de
> runtime (fallback), mas prefira os nomes novos.

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
