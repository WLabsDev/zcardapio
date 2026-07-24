import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { apiHandler } from "@/lib/api";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z.string().min(8, "A nova senha precisa ter pelo menos 8 caracteres."),
});

export const PUT = apiHandler(async (request: Request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(session.sub)),
  });
  if (!user) {
    return Response.json({ message: "Usuário não encontrado." }, { status: 404 });
  }
  if (!user.passwordHash) {
    return Response.json(
      { message: "Esta conta ainda não possui senha definida." },
      { status: 400 }
    );
  }

  const valid = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return Response.json({ message: "Senha atual incorreta." }, { status: 401 });
  }

  const newHash = await hash(parsed.data.newPassword, 10);
  await db
    .update(users)
    .set({ passwordHash: newHash })
    .where(eq(users.id, user.id));

  return Response.json({ ok: true });
});
