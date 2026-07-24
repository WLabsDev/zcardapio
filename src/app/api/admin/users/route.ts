import { hash } from "bcryptjs";
import { eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async (request: Request) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const rows = await db.query.users.findMany({
    where: q
      ? or(
          ilike(users.name, `%${q}%`),
          ilike(users.email, `%${q}%`),
          ilike(users.phone, `%${q}%`)
        )
      : undefined,
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    limit: 100,
  });
  return Response.json({
    users: rows.map((u) => ({
      ...u,
      id: String(u.id),
      createdAt: u.createdAt.toISOString(),
    })),
  });
});

const postSchema = z.object({
  name: z.string().min(2, "Informe o nome.").max(120),
  email: z.union([z.email("E-mail inválido."), z.literal("")]).default(""),
  phone: z.string().max(20).default(""),
  role: z.enum(["admin", "restaurante", "cliente"]),
  senha: z.union([z.string().min(8, "Mínimo de 8 caracteres."), z.literal("")]).default(""),
});

export const POST = apiHandler(async (request: Request) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const email = d.email.trim().toLowerCase();
  const phone = d.phone.trim();

  if (email) {
    const taken = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (taken) {
      return Response.json({ message: "Este e-mail já está em uso." }, { status: 409 });
    }
  }
  if (phone) {
    const taken = await db.query.users.findFirst({ where: eq(users.phone, phone) });
    if (taken) {
      return Response.json({ message: "Este telefone já está em uso." }, { status: 409 });
    }
  }

  const [created] = await db
    .insert(users)
    .values({
      name: d.name.trim(),
      email: email || null,
      phone: phone || null,
      role: d.role,
      passwordHash: d.senha ? await hash(d.senha, 10) : null,
    })
    .returning({ id: users.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
});
