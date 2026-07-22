import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { getSession, setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { normalizePhone } from "@/lib/phone";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }
  const user = await db.query.users.findFirst({
    where: eq(users.id, Number(session.sub)),
    columns: { id: true, name: true, email: true, phone: true, role: true },
  });
  if (!user) {
    return Response.json({ message: "Usuário não encontrado." }, { status: 404 });
  }
  return Response.json({ user: { ...user, id: String(user.id) } });
}

const putSchema = z.object({
  name: z.string().min(2, "Informe seu nome.").max(120),
  phone: z.string().max(20).default(""),
  email: z.union([z.email("Informe um e-mail válido."), z.literal("")]).default(""),
});

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (email) {
    const taken = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, Number(session.sub))),
      columns: { id: true },
    });
    if (taken) {
      return Response.json(
        { message: "Este e-mail já está em uso por outra conta." },
        { status: 409 }
      );
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      name: parsed.data.name,
      phone: normalizePhone(parsed.data.phone) || null,
      email: email || null,
    })
    .where(eq(users.id, Number(session.sub)))
    .returning();

  // Renova o cookie para o nome novo aparecer nos painéis.
  await setSession(updated);
  return Response.json({ ok: true });
}
