import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getRestaurantByOwner } from "@/lib/db/queries";

const patchSchema = z.object({
  status: z.enum([
    "pendente",
    "confirmado",
    "preparando",
    "saiu_para_entrega",
    "entregue",
    "cancelado",
  ]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "restaurante") {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return Response.json({ message: "Pedido inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Status inválido." }, { status: 400 });
  }

  const restaurant = await getRestaurantByOwner(Number(session.sub));
  if (!restaurant) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }

  const [updated] = await db
    .update(orders)
    .set({ status: parsed.data.status })
    .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id)))
    .returning({ id: orders.id, status: orders.status });

  if (!updated) {
    return Response.json({ message: "Pedido não encontrado." }, { status: 404 });
  }

  return Response.json({ order: updated });
}
