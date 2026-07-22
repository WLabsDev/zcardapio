/**
 * Envio de e-mail via SMTP (usado hoje só pela recuperação de senha de
 * vendedor/admin). Configure as variáveis abaixo no `.env` antes de subir pro
 * servidor — em dev, sem elas configuradas, o envio é pulado e o link/código
 * aparece só no log do servidor (facilita testar sem SMTP real).
 *
 *   SMTP_HOST=
 *   SMTP_PORT=587
 *   SMTP_USER=
 *   SMTP_PASSWORD=
 *   SMTP_FROM="zCardápio <naoresponda@seudominio.com>"
 */
import nodemailer from "nodemailer";

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  const transport = getTransport();
  if (!transport) {
    console.warn(
      `[mailer] SMTP não configurado — e-mail para ${to} não enviado.\nAssunto: ${subject}\n${html}`
    );
    return;
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
) {
  await sendEmail(
    to,
    "Redefinir sua senha — zCardápio",
    `<p>Olá, ${name}!</p>
     <p>Recebemos um pedido para redefinir a senha da sua conta no zCardápio.</p>
     <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a>. Este link expira em 30 minutos.</p>
     <p>Se você não pediu isso, pode ignorar este e-mail.</p>`
  );
}
