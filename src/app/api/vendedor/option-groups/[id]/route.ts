import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { optionGroups } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const putSchema = z.object({
  name: z.string().min(2, "Informe o nome do grupo.").max(80),
  required: z.boolean(),
  max: z.number().int().min(1).max(20),
});

type Ctx = { params: Promise<{ id: string }> };

async function getGroupWithOwnership(groupId: number, restaurantId: number) {
  const group = await db.query.optionGroups.findFirst({
    where: eq(optionGroups.id, groupId),
    with: { product: { columns: { restaurantId: true } } },
  });
  if (!group || group.product.restaurantId !== restaurantId) return null;
  return group;
}

export const PUT = apiHandler(async (request: Request, { params }: Ctx) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) {
    return Response.json({ message: "Grupo inválido." }, { status: 400 });
  }

  const group = await getGroupWithOwnership(groupId, restaurant.id);
  if (!group) {
    return Response.json({ message: "Grupo não encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  await db
    .update(optionGroups)
    .set({
      name: parsed.data.name.trim(),
      required: parsed.data.required,
      max: parsed.data.max,
    })
    .where(eq(optionGroups.id, groupId));

  return Response.json({ ok: true });
});

export const DELETE = apiHandler(async (_request: Request, { params }: Ctx) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) {
    return Response.json({ message: "Grupo inválido." }, { status: 400 });
  }

  const group = await getGroupWithOwnership(groupId, restaurant.id);
  if (!group) {
    return Response.json({ message: "Grupo não encontrado." }, { status: 404 });
  }

  // Cascade: exclui as opções do grupo automaticamente (onDelete: cascade no schema)
  await db.delete(optionGroups).where(eq(optionGroups.id, groupId));

  return Response.json({ ok: true });
});
