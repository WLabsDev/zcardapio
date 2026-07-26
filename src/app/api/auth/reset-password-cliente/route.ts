import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { and, desc, eq, gt, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { phoneOtpCodes, users } from "@/lib/db/schema";
import { normalizePhone, phoneVariants } from "@/lib/phone";
import { apiHandler } from "@/lib/api";

const schema = z.object({
  phone: z.string().min(10, "Informe um WhatsApp válido com DDD."),
  code: z.string().length(6, "Informe o código de 6 dígitos."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

const MAX_ATTEMPTS = 5;

/** Verifica o código de WhatsApp e define a nova senha do cliente. */
export const POST = apiHandler(async (request: Request) => {
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
    columns: { id: true },
  });
  if (!user) {
    return Response.json({ message: "Código inválido ou expirado." }, { status: 400 });
  }

  const record = await db.query.phoneOtpCodes.findFirst({
    where: and(
      eq(phoneOtpCodes.userId, user.id),
      isNull(phoneOtpCodes.usedAt),
      gt(phoneOtpCodes.expiresAt, new Date())
    ),
    orderBy: [desc(phoneOtpCodes.createdAt)],
  });
  if (!record || record.attempts >= MAX_ATTEMPTS) {
    return Response.json({ message: "Código inválido ou expirado." }, { status: 400 });
  }

  const codeHash = createHash("sha256").update(parsed.data.code).digest("hex");
  if (codeHash !== record.codeHash) {
    await db
      .update(phoneOtpCodes)
      .set({ attempts: record.attempts + 1 })
      .where(eq(phoneOtpCodes.id, record.id));
    return Response.json({ message: "Código incorreto." }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.senha, 10);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, user.id));
    await tx
      .update(phoneOtpCodes)
      .set({ usedAt: new Date() })
      .where(eq(phoneOtpCodes.id, record.id));
  });

  return Response.json({ ok: true });
});
