import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { loyaltyPrograms, loyaltyProgress, orders } from "@/lib/db/schema";
import { mapOrder } from "@/lib/db/queries";
import { isFreePlan } from "@/lib/plan-limits";
import { publishOrderEvent } from "@/lib/realtime";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return Response.json({ message: "Pedido inválido." }, { status: 400 });
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: { with: { options: true } },
      restaurant: {
        columns: { name: true, slug: true, ownerId: true, reviewsEnabled: true },
      },
    },
  });

  if (!order) {
    return Response.json({ message: "Pedido não encontrado." }, { status: 404 });
  }

  // Cliente só pode ver os próprios pedidos
  const isCustomer = session.role === "cliente" && order.customerId === Number(session.sub);
  // Dono do restaurante pode ver pedidos do seu restaurante
  const isOwner = session.role === "restaurante" && order.restaurant.ownerId === Number(session.sub);

  if (!isCustomer && !isOwner) {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }

  return Response.json({ order: mapOrder(order) });
}

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

  const restaurant = await db.query.restaurants.findFirst({
    where: (r, { eq }) => eq(r.ownerId, Number(session.sub)),
    with: { plan: { columns: { name: true } } },
  });
  if (!restaurant) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }

  const loyaltyProgram = isFreePlan(restaurant.plan?.name)
    ? null
    : await db.query.loyaltyPrograms.findFirst({
        where: eq(loyaltyPrograms.restaurantId, restaurant.id),
      });

  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ status: orders.status, subtotalCents: orders.subtotalCents })
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id)));
    if (!existing) return null;

    // Fidelidade só é liberada quando o pedido é efetivamente entregue — e só uma
    // vez (evita creditar de novo se o status for setado como "entregue" outra vez).
    let loyaltyPointsEarned = 0;
    let loyaltyCashbackEarnedCents = 0;
    let loyaltyStampEarned = false;
    if (
      parsed.data.status === "entregue" &&
      existing.status !== "entregue" &&
      loyaltyProgram
    ) {
      if (loyaltyProgram.mechanic === "points") {
        loyaltyPointsEarned = Math.floor(
          (existing.subtotalCents / 100) * loyaltyProgram.pointsPerReal
        );
      } else if (loyaltyProgram.mechanic === "cashback") {
        loyaltyCashbackEarnedCents = Math.round(
          (existing.subtotalCents * loyaltyProgram.cashbackPercent) / 100
        );
      } else if (loyaltyProgram.mechanic === "stamps") {
        loyaltyStampEarned = true;
      }
    }

    const [row] = await tx
      .update(orders)
      .set({
        status: parsed.data.status,
        ...(loyaltyPointsEarned > 0 && { loyaltyPointsEarned }),
        ...(loyaltyCashbackEarnedCents > 0 && { loyaltyCashbackEarnedCents }),
        ...(loyaltyStampEarned && { loyaltyStampEarned }),
      })
      .where(and(eq(orders.id, orderId), eq(orders.restaurantId, restaurant.id)))
      .returning({
        id: orders.id,
        status: orders.status,
        restaurantId: orders.restaurantId,
        customerId: orders.customerId,
        loyaltyPointsEarned: orders.loyaltyPointsEarned,
        loyaltyCashbackEarnedCents: orders.loyaltyCashbackEarnedCents,
        loyaltyStampEarned: orders.loyaltyStampEarned,
      });
    if (!row) return null;

    if (
      row.customerId !== null &&
      (loyaltyPointsEarned > 0 || loyaltyCashbackEarnedCents > 0 || loyaltyStampEarned)
    ) {
      await tx
        .insert(loyaltyProgress)
        .values({
          restaurantId: row.restaurantId,
          customerId: row.customerId,
          points: loyaltyPointsEarned,
          cashbackCents: loyaltyCashbackEarnedCents,
          stampCount: loyaltyStampEarned ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [loyaltyProgress.restaurantId, loyaltyProgress.customerId],
          set: {
            points: sql`${loyaltyProgress.points} + ${loyaltyPointsEarned}`,
            cashbackCents: sql`${loyaltyProgress.cashbackCents} + ${loyaltyCashbackEarnedCents}`,
            stampCount: sql`${loyaltyProgress.stampCount} + ${loyaltyStampEarned ? 1 : 0}`,
            updatedAt: new Date(),
          },
        });
    }

    // Cancelamento reverte a fidelidade que este pedido tinha creditado (só existe
    // algo a reverter se ele já havia sido marcado como entregue antes), sem deixar
    // o saldo do cliente negativo.
    const earnedSomething =
      row.loyaltyPointsEarned > 0 ||
      row.loyaltyCashbackEarnedCents > 0 ||
      row.loyaltyStampEarned;
    if (row.status === "cancelado" && row.customerId !== null && earnedSomething) {
      await tx
        .update(loyaltyProgress)
        .set({
          points: sql`GREATEST(${loyaltyProgress.points} - ${row.loyaltyPointsEarned}, 0)`,
          cashbackCents: sql`GREATEST(${loyaltyProgress.cashbackCents} - ${row.loyaltyCashbackEarnedCents}, 0)`,
          stampCount: sql`GREATEST(${loyaltyProgress.stampCount} - ${row.loyaltyStampEarned ? 1 : 0}, 0)`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(loyaltyProgress.restaurantId, row.restaurantId),
            eq(loyaltyProgress.customerId, row.customerId)
          )
        );
    }
    return row;
  });

  if (!updated) {
    return Response.json({ message: "Pedido não encontrado." }, { status: 404 });
  }

  await publishOrderEvent({
    type: "order_updated",
    orderId: updated.id,
    restaurantId: updated.restaurantId,
    customerId: updated.customerId,
    status: updated.status,
  }).catch(() => {});

  return Response.json({ order: updated });
}
