import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
  profile: z.enum(["admin", "restaurante", "cliente"]).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const { email, senha, profile } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });

  const invalid = Response.json(
    { message: "E-mail ou senha incorretos." },
    { status: 401 }
  );
  if (!user) return invalid;

  const passwordOk = await compare(senha, user.passwordHash);
  if (!passwordOk) return invalid;

  if (profile && profile !== user.role) {
    const roleLabel = {
      admin: "administrador",
      restaurante: "restaurante",
      cliente: "cliente",
    }[user.role];
    return Response.json(
      { message: `Esta conta é do perfil ${roleLabel}. Entre pela aba correspondente.` },
      { status: 403 }
    );
  }

  await setSession(user);

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
