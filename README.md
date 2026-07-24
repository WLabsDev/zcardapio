# zCardápio

Plataforma de cardápio digital: o restaurante monta o cardápio, compartilha um link/QR code e o cliente pede pelo navegador — sem app. Inclui painel do vendedor, área do cliente e administração da plataforma.

## Funcionalidades

- **Cardápio público** (`/r/[slug]`) — vitrine do restaurante com busca, avaliações e carrinho.
- **Checkout** — entrega/retirada, cupons, pedido mínimo, pagamento via PIX (QR code) e criação de conta automática pelo WhatsApp.
- **Área do cliente** (`/cliente`) — pedidos em tempo real, fidelidade (pontos/cashback/carimbos), endereços e perfil.
- **Painel do vendedor** (`/vendedor`) — gestão de cardápio (categorias, produtos, complementos, reordenação), pedidos ao vivo, avaliações, aparência/tema, cupons, fidelidade, QR code e relatórios.
- **Admin** (`/admin`) — restaurantes, usuários, planos e métricas (com impersonation).
- **Autenticação** — login por WhatsApp (cliente) ou e-mail (vendedor/admin), recuperação de senha e definição de senha no primeiro acesso.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Drizzle ORM** + **Postgres** (com LISTEN/NOTIFY para pedidos em tempo real)
- **Tailwind CSS v4** + **Radix UI** (shadcn/ui) + `tw-animate-css`
- **react-hook-form** + **zod** nos formulários
- **jose** (sessão em cookie httpOnly) + **bcryptjs**
- **pix-utils** (BR Code do PIX), **react-qr-code**, **nodemailer** (SMTP), **sonner** (toasts)

## Requisitos

- Node.js 20+
- Postgres 14+

## Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env   # preencha DATABASE_URL e AUTH_SECRET (obrigatórias)

# 3. Crie o schema e popule dados de exemplo
npm run db:migrate
npm run db:seed

# 4. Suba o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

> Sem `SMTP_*` / `EVOLUTION_API_*`, e-mails e mensagens de WhatsApp não são enviados — ficam apenas no log do servidor (ótimo para testar em dev). O admin vê um aviso no painel quando o WhatsApp não está configurado.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run db:generate` | Gera migrações a partir do schema (Drizzle) |
| `npm run db:migrate` | Aplica as migrações no banco |
| `npm run db:seed` | Popula dados de exemplo |
| `npm run db:studio` | Abre o Drizzle Studio |

## Variáveis de ambiente

Veja [`.env.example`](./.env.example). Obrigatórias: `DATABASE_URL` e `AUTH_SECRET`. Opcionais: `SMTP_*` (e-mail) e `EVOLUTION_API_*` (WhatsApp).

## Contas de exemplo (seed)

A senha de todas as contas do seed é `12345678`.

| Perfil | Acesso |
| --- | --- |
| Admin | `admin@zcardapio.com.br` (e-mail) |
| Vendedor | `ze@burguerdoze.com.br` (e-mail) |
| Cliente | WhatsApp `11 99999-1234` (Mariana Souza) |

## Estrutura

```
src/
  app/            # rotas (páginas e API handlers)
    r/[slug]/     # cardápio público + checkout
    cliente/      # área do cliente
    vendedor/     # painel do vendedor
    admin/        # administração
    api/          # rotas de API
  components/     # componentes (ui/ = shadcn, panel/ = painéis, cart/ = carrinho)
  lib/            # db (schema/queries/seed), auth, pix, mailer, whatsapp, etc.
  hooks/          # hooks customizados
drizzle/          # migrações geradas
```
