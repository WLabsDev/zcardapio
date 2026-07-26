import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyUnsubToken } from "@/lib/marketing-email";

/**
 * Unsubscribe em um clique (LGPD). O link vai no rodapé de todo e-mail de
 * marketing com um token HMAC que prova que fomos nós que geramos para aquele
 * usuário — sem precisar de login. Marca emailOptOut e mostra uma confirmação.
 */
function page(title: string, message: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} — zCardápio</title></head>
<body style="margin:0;background:#f7f2ea;font-family:Arial,Helvetica,sans-serif;color:#33261c;">
  <div style="max-width:480px;margin:80px auto;padding:32px;background:#ffffff;border:2px solid #33261c;border-radius:16px;text-align:center;">
    <p style="font-size:24px;font-weight:800;margin:0 0 16px;">zCardápio<span style="color:#d6482a;">.</span></p>
    <h1 style="font-size:18px;margin:0 0 10px;">${title}</h1>
    <p style="font-size:15px;line-height:1.6;color:#5b4d3f;margin:0;">${message}</p>
  </div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const respond = (title: string, message: string, status = 200) =>
    new Response(page(title, message), {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    });

  const url = new URL(request.url);
  const userId = Number(url.searchParams.get("u"));
  const token = url.searchParams.get("t") ?? "";

  if (!Number.isInteger(userId) || !verifyUnsubToken(userId, token)) {
    return respond(
      "Link inválido",
      "Este link de cancelamento não é válido. Se precisar de ajuda, fale com a gente."
    );
  }

  await db.update(users).set({ emailOptOut: true }).where(eq(users.id, userId));
  return respond(
    "Cancelamento confirmado",
    "Você não receberá mais nossos e-mails de novidades. Seu acesso ao zCardápio continua normal — apenas os e-mails foram desligados."
  );
}
