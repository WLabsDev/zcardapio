import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, restaurants } from "@/lib/db/schema";
import { createReview, getOrderById } from "@/lib/db/queries";
import { apiHandler } from "@/lib/api";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const POST = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await getSession();
  if (!session || session.role !== "cliente") {
    return Response.json({ message: "Faça login para avaliar." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return Response.json({ message: "Pedido inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Avaliação inválida." }, { status: 400 });
  }

  const orderRow = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    columns: { id: true, customerId: true, restaurantId: true, status: true },
  });
  if (!orderRow) {
    return Response.json({ message: "Pedido não encontrado." }, { status: 404 });
  }
  if (orderRow.customerId !== Number(session.sub)) {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }
  if (orderRow.status !== "entregue") {
    return Response.json(
      { message: "Só é possível avaliar pedidos entregues." },
      { status: 400 }
    );
  }

  const existing = await getOrderById(orderId);
  if (existing?.reviewed) {
    return Response.json(
      { message: "Este pedido já foi avaliado." },
      { status: 409 }
    );
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, orderRow.restaurantId),
    columns: { reviewsEnabled: true },
  });
  if (!restaurant?.reviewsEnabled) {
    return Response.json(
      { message: "Este restaurante desativou as avaliações." },
      { status: 403 }
    );
  }

  const created = await createReview({
    restaurantId: orderRow.restaurantId,
    orderId,
    customerId: Number(session.sub),
    customerName: session.name,
    rating: parsed.data.rating,
    comment: parsed.data.comment?.trim() ?? "",
  }).catch(() => null);

  if (!created) {
    return Response.json(
      { message: "Não foi possível salvar a avaliação." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true });
});
