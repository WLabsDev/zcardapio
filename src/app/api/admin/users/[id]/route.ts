import { hash } from "bcryptjs";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { restaurants, users } from "@/lib/db/schema";
import { canonicalPhone, phoneVariants } from "@/lib/phone";
import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api";

const putSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.union([z.email("E-mail inválido."), z.literal("")]).optional(),
  phone: z.string().max(20).optional(),
  role: z.enum(["admin", "restaurante", "cliente"]).optional(),
  senha: z
    .union([z.string().min(8, "Mínimo de 8 caracteres."), z.literal("")])
    .optional(),
});

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return Response.json({ message: "Usuário inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const email = d.email !== undefined ? d.email.trim().toLowerCase() : undefined;
  // Canônico + busca pelas duas grafias: ver lib/phone.ts (nono dígito).
  const phone = d.phone !== undefined ? canonicalPhone(d.phone) : undefined;

  if (email) {
    const taken = await db.query.users.findFirst({
      where: and(eq(users.email, email), ne(users.id, userId)),
      columns: { id: true },
    });
    if (taken) {
      return Response.json({ message: "Este e-mail já está em uso." }, { status: 409 });
    }
  }
  if (phone) {
    const taken = await db.query.users.findFirst({
      where: and(inArray(users.phone, phoneVariants(phone)), ne(users.id, userId)),
      columns: { id: true },
    });
    if (taken) {
      return Response.json({ message: "Este telefone já está em uso." }, { status: 409 });
    }
  }

  // Não faz sentido manter o perfil "restaurante" pra quem não tem restaurante —
  // evita contas órfãs (e o loop de redirecionamento que isso causava).
  let role = d.role;
  if (role === "restaurante") {
    const ownsRestaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.ownerId, userId),
      columns: { id: true },
    });
    if (!ownsRestaurant) role = "cliente";
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(d.name !== undefined && { name: d.name }),
      ...(email !== undefined && { email: email || null }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(role !== undefined && { role }),
      ...(d.senha && { passwordHash: await hash(d.senha, 10) }),
    })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!updated) {
    return Response.json({ message: "Usuário não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return Response.json({ message: "Usuário inválido." }, { status: 400 });
  }

  const ownsRestaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, userId),
    columns: { id: true, name: true },
  });
  if (ownsRestaurant) {
    return Response.json(
      {
        message: `Este usuário é dono do restaurante "${ownsRestaurant.name}". Exclua o restaurante primeiro.`,
      },
      { status: 409 }
    );
  }

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!deleted) {
    return Response.json({ message: "Usuário não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
});
