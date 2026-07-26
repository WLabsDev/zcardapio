import { hash } from "bcryptjs";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { normalizePhone, phoneVariants } from "@/lib/phone";
import { apiHandler } from "@/lib/api";

const schema = z.object({
  phone: z.string().min(10, "Informe um WhatsApp válido com DDD."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

/**
 * Define a senha de uma conta de cliente criada automaticamente no checkout
 * (que nasce sem senha) e já autentica o usuário.
 *
 * NOTA (produção): aqui o ideal é validar a posse do número com um código
 * (OTP via WhatsApp/SMS) antes de permitir definir a senha. Nesta demo a
 * validação é apenas pelo número.
 */
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
    where: and(
      inArray(users.phone, phoneVariants(phone)),
      eq(users.role, "cliente"),
      isNull(users.passwordHash)
    ),
  });
  if (!user) {
    return Response.json(
      { message: "Esta conta já possui senha. Faça login normalmente." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(parsed.data.senha, 10);
  const [updated] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, user.id))
    .returning();

  await setSession(updated);

  return Response.json({
    user: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    },
  });
});
