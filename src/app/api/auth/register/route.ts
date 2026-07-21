import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { normalizePhone } from "@/lib/phone";

const registerSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  telefone: z.string().min(10, "Informe um WhatsApp válido com DDD."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const { nome, senha, email } = parsed.data;
  const phone = normalizePhone(parsed.data.telefone);
  const normalizedEmail = email ? email.toLowerCase() : null;

  const existing = await db.query.users.findFirst({
    where: eq(users.phone, phone),
  });
  if (existing) {
    return Response.json(
      { message: "Este WhatsApp já está cadastrado. Faça login." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(senha, 10);
  const [user] = await db
    .insert(users)
    .values({
      name: nome,
      email: normalizedEmail,
      phone,
      passwordHash,
      role: "cliente",
    })
    .returning();

  await setSession(user);

  return Response.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
}
