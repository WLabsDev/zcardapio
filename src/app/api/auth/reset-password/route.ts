import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { apiHandler } from "@/lib/api";

const schema = z.object({
  token: z.string().min(1, "Token inválido."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

/** Aplica a nova senha de vendedor/admin a partir do link enviado por e-mail. */
export const POST = apiHandler(async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");

  const record = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.tokenHash, tokenHash),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date())
    ),
  });
  if (!record) {
    return Response.json(
      { message: "Este link é inválido ou já expirou. Solicite um novo." },
      { status: 400 }
    );
  }

  const passwordHash = await hash(parsed.data.senha, 10);
  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, record.userId));
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));
  });

  return Response.json({ ok: true });
});
