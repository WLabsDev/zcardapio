import { createHash, randomInt } from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { phoneOtpCodes, users } from "@/lib/db/schema";
import { normalizePhone, phoneVariants } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { apiHandler } from "@/lib/api";

const schema = z.object({
  phone: z.string().min(10, "Informe um WhatsApp válido com DDD."),
});

const CODE_TTL_MS = 10 * 60 * 1000;

/** Recuperação de senha de cliente (login por WhatsApp) via código enviado no próprio WhatsApp. */
export const POST = apiHandler(async (request: Request) => {
  // Proteção contra abuso/força bruta: no máx. 5 solicitações/hora por IP.
  const rl = rateLimit(`forgot-cliente:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return Response.json(
      { message: "Muitas solicitações. Aguarde e tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const phone = normalizePhone(parsed.data.phone);

  const user = await db.query.users.findFirst({
    // Aceita o celular com e sem o nono dígito (ver lib/phone.ts).
    where: and(inArray(users.phone, phoneVariants(phone)), eq(users.role, "cliente")),
    columns: { id: true, name: true, phone: true, passwordHash: true },
  });
  if (!user || !user.passwordHash) {
    return Response.json(
      {
        message:
          "Não encontramos uma conta com senha cadastrada para esse número.",
      },
      { status: 404 }
    );
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = createHash("sha256").update(code).digest("hex");

  await db.insert(phoneOtpCodes).values({
    userId: user.id,
    codeHash,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });

  await sendWhatsAppMessage(
    user.phone!,
    `Seu código para redefinir a senha no zCardápio é *${code}*. Ele expira em 10 minutos.`
  ).catch((e) => console.error("[forgot-password-cliente] falha no envio:", e));

  return Response.json({ ok: true });
});
