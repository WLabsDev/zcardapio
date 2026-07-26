/**
 * E-mails de marketing/lifecycle para vendedores (boas-vindas e nudges de
 * ativação). Usa o transporte SMTP de `mailer.ts` e adiciona o que o marketing
 * exige: template com a marca, link de unsubscribe (LGPD) e dedupe — cada
 * vendedor recebe cada "kind" de e-mail no máximo uma vez (tabela emailEvents).
 *
 * Nada aqui pode derrubar o fluxo que chama: os helpers de envio capturam erro
 * e retornam um resultado em vez de lançar.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailEvents, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/mailer";
import { getSiteUrl } from "@/lib/site-config";

export type EmailKind = "welcome" | "nudge_no_products" | "nudge_share_menu";

type Vendor = { id: number; name: string; email: string | null };
type Restaurant = { name: string; slug: string };

export type SendResult =
  | "sent"
  | "no-email"
  | "opt-out"
  | "already-sent"
  | "failed";

const PRIMARY = "#d6482a";
const INK = "#33261c";
const CREAM = "#f7f2ea";

/** Escapa HTML para os valores dinâmicos (nome etc.) não quebrarem o layout. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const firstName = (name: string) => esc(name.trim().split(/\s+/)[0] || name);

/* ----------------------------- Unsubscribe ----------------------------- */

function getSecret(): string {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET não está definido (confira o arquivo .env).");
  }
  return process.env.AUTH_SECRET;
}

/** Token stateless que prova que o link foi gerado por nós para este usuário. */
export function unsubToken(userId: number): string {
  return createHmac("sha256", getSecret()).update(String(userId)).digest("hex");
}

export function verifyUnsubToken(userId: number, token: string): boolean {
  const expected = Buffer.from(unsubToken(userId), "hex");
  const given = Buffer.from(token, "hex");
  if (given.length !== expected.length) return false;
  return timingSafeEqual(expected, given);
}

function unsubscribeUrl(userId: number): string {
  return `${getSiteUrl()}/api/email/unsubscribe?u=${userId}&t=${unsubToken(userId)}`;
}

/* ------------------------------- Template ------------------------------ */

function cta(href: string, label: string): string {
  return `<p style="margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 30px;border-radius:999px;border:2px solid ${INK};">${label}</a>
  </p>`;
}

/** Envolve o conteúdo no layout da marca, com rodapé e link de unsubscribe. */
function emailShell(preview: string, bodyHtml: string, userId: number): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(preview)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:2px solid ${INK};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:${INK};padding:20px 32px;">
              <span style="color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;">zCardápio<span style="color:${PRIMARY};">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:${INK};font-size:16px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:${CREAM};border-top:1px solid #e5ded2;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#8a7d6d;line-height:1.6;">
              Você recebe este e-mail porque se cadastrou no zCardápio.<br>
              <a href="${unsubscribeUrl(userId)}" style="color:#8a7d6d;text-decoration:underline;">Não quero mais receber estes e-mails</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ------------------------------- Mensagens ----------------------------- */

function welcomeBody(user: Vendor, restaurant: Restaurant): { subject: string; html: string } {
  const site = getSiteUrl();
  const subject = `Bem-vindo ao zCardápio, ${user.name.trim().split(/\s+/)[0]}! Seu cardápio já está no ar`;
  const html = `
    <p style="margin:0 0 16px;">Olá, ${firstName(user.name)}!</p>
    <p style="margin:0 0 16px;">Seu cardápio <strong>${esc(restaurant.name)}</strong> já está no ar. Agora é só divulgar e começar a receber pedidos — sem comissão por pedido.</p>
    <p style="margin:0 0 8px;"><strong>Seus próximos 3 passos:</strong></p>
    <ol style="margin:0 0 16px;padding-left:20px;">
      <li style="margin-bottom:8px;">Adicione seus pratos (comece pelos mais vendidos, com foto).</li>
      <li style="margin-bottom:8px;">Compartilhe o link do cardápio no WhatsApp e na bio do Instagram.</li>
      <li>Acompanhe os pedidos chegando no seu painel.</li>
    </ol>
    ${cta(`${site}/vendedor`, "Montar meu cardápio")}
    <p style="margin:0;font-size:14px;color:#8a7d6d;">Seu link: <a href="${site}/r/${esc(restaurant.slug)}" style="color:${PRIMARY};">${site}/r/${esc(restaurant.slug)}</a></p>`;
  return { subject, html };
}

function nudgeNoProductsBody(user: Vendor, restaurant: Restaurant): { subject: string; html: string } {
  const site = getSiteUrl();
  const subject = `${user.name.trim().split(/\s+/)[0]}, faltam seus pratos no cardápio do ${restaurant.name}`;
  const html = `
    <p style="margin:0 0 16px;">Olá, ${firstName(user.name)}!</p>
    <p style="margin:0 0 16px;">Vi que você criou o cardápio do <strong>${esc(restaurant.name)}</strong>, mas ainda não adicionou seus pratos. Sem pratos, o cardápio não vende — e leva poucos minutos para resolver.</p>
    <p style="margin:0 0 16px;">Dica: comece pelos campeões de venda e capriche na foto. É ela que dá água na boca e faz o cliente pedir.</p>
    ${cta(`${site}/vendedor`, "Adicionar meus pratos")}
    <p style="margin:0;font-size:14px;color:#8a7d6d;">Qualquer dúvida, é só responder este e-mail.</p>`;
  return { subject, html };
}

function nudgeShareMenuBody(user: Vendor, restaurant: Restaurant): { subject: string; html: string } {
  const site = getSiteUrl();
  const subject = `${user.name.trim().split(/\s+/)[0]}, seu cardápio está pronto — agora é só divulgar`;
  const html = `
    <p style="margin:0 0 16px;">Olá, ${firstName(user.name)}!</p>
    <p style="margin:0 0 16px;">Seu cardápio já tem pratos — ótimo! Agora falta o mais importante: <strong>receber o primeiro pedido</strong>.</p>
    <p style="margin:0 0 8px;"><strong>Compartilhe seu link:</strong></p>
    <ul style="margin:0 0 16px;padding-left:20px;">
      <li style="margin-bottom:8px;">Mande no WhatsApp para seus clientes.</li>
      <li style="margin-bottom:8px;">Coloque na bio do Instagram.</li>
      <li>Use o QR code na mesa do salão.</li>
    </ul>
    ${cta(`${site}/r/${esc(restaurant.slug)}`, "Ver e compartilhar meu cardápio")}
    <p style="margin:0;font-size:14px;color:#8a7d6d;">Seu link: <a href="${site}/r/${esc(restaurant.slug)}" style="color:${PRIMARY};">${site}/r/${esc(restaurant.slug)}</a></p>`;
  return { subject, html };
}

/* ----------------------------- Dedupe / log ---------------------------- */

async function alreadySent(userId: number, kind: EmailKind): Promise<boolean> {
  const row = await db.query.emailEvents.findFirst({
    where: and(eq(emailEvents.userId, userId), eq(emailEvents.kind, kind)),
    columns: { id: true },
  });
  return Boolean(row);
}

async function logEmail(userId: number, kind: EmailKind): Promise<void> {
  await db.insert(emailEvents).values({ userId, kind });
}

/* ------------------------------ Envio core ----------------------------- */

/**
 * Envia um e-mail de marketing respeitando opt-out e dedupe, e registra o
 * envio. Nunca lança: retorna o resultado para o chamador decidir.
 */
async function sendMarketingEmail(
  user: Vendor,
  restaurant: Restaurant,
  kind: EmailKind
): Promise<SendResult> {
  if (!user.email) return "no-email";

  const fresh = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { emailOptOut: true },
  });
  if (fresh?.emailOptOut) return "opt-out";
  if (await alreadySent(user.id, kind)) return "already-sent";

  const message =
    kind === "welcome"
      ? welcomeBody(user, restaurant)
      : kind === "nudge_no_products"
        ? nudgeNoProductsBody(user, restaurant)
        : nudgeShareMenuBody(user, restaurant);

  try {
    const html = emailShell(message.subject, message.html, user.id);
    await sendEmail(user.email, message.subject, html);
  } catch (err) {
    console.error(`[marketing-email] falha ao enviar "${kind}" (user ${user.id}):`, err);
    return "failed";
  }

  await logEmail(user.id, kind);
  return "sent";
}

/** Boas-vindas — chamada no cadastro do vendedor. */
export function sendWelcomeEmail(user: Vendor, restaurant: Restaurant): Promise<SendResult> {
  return sendMarketingEmail(user, restaurant, "welcome");
}

/** Nudges de ativação — chamados pelo cron. */
export function sendActivationNudge(
  user: Vendor,
  restaurant: Restaurant,
  kind: Exclude<EmailKind, "welcome">
): Promise<SendResult> {
  return sendMarketingEmail(user, restaurant, kind);
}
