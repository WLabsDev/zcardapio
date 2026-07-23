import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const patchSchema = z.object({
  status: z.enum(["ativo", "pendente", "bloqueado"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return Response.json({ message: "Restaurante inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Status inválido." }, { status: 400 });
  }

  const [updated] = await db
    .update(restaurants)
    .set({ status: parsed.data.status })
    .where(eq(restaurants.id, restaurantId))
    .returning({ id: restaurants.id, status: restaurants.status });

  if (!updated) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }
  return Response.json({ restaurant: updated });
}

const putSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens.")
    .optional(),
  segment: z.string().max(60).optional(),
  address: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  status: z.enum(["ativo", "pendente", "bloqueado"]).optional(),
  planId: z.number().int().positive().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return Response.json({ message: "Restaurante inválido." }, { status: 400 });
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

  if (d.slug !== undefined) {
    const taken = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, d.slug),
      columns: { id: true },
    });
    if (taken && taken.id !== restaurantId) {
      return Response.json(
        { message: "Este endereço já está em uso por outro restaurante." },
        { status: 409 }
      );
    }
  }

  const [updated] = await db
    .update(restaurants)
    .set({
      ...(d.name !== undefined && { name: d.name }),
      ...(d.slug !== undefined && { slug: d.slug }),
      ...(d.segment !== undefined && { segment: d.segment }),
      ...(d.address !== undefined && { address: d.address }),
      ...(d.phone !== undefined && { phone: d.phone }),
      ...(d.status !== undefined && { status: d.status }),
      ...(d.planId !== undefined && { planId: d.planId }),
    })
    .where(eq(restaurants.id, restaurantId))
    .returning({ id: restaurants.id });

  if (!updated) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return Response.json({ message: "Restaurante inválido." }, { status: 400 });
  }

  const [deleted] = await db
    .delete(restaurants)
    .where(eq(restaurants.id, restaurantId))
    .returning({ id: restaurants.id });

  if (!deleted) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
