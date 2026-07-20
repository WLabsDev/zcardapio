import { and, count, eq, gte, isNotNull, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, plans, restaurants, users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [[active], [userCount], [monthOrders], mrrRows] = await Promise.all([
    db
      .select({ value: count() })
      .from(restaurants)
      .where(eq(restaurants.status, "ativo")),
    db.select({ value: count() }).from(users),
    db
      .select({ value: count() })
      .from(orders)
      .where(gte(orders.createdAt, monthStart)),
    db
      .select({ value: sum(plans.priceCents) })
      .from(restaurants)
      .innerJoin(plans, eq(restaurants.planId, plans.id))
      .where(and(eq(restaurants.status, "ativo"), isNotNull(restaurants.planId))),
  ]);

  return Response.json({
    metrics: {
      activeRestaurants: active.value,
      users: userCount.value,
      monthOrders: monthOrders.value,
      mrr: Number(mrrRows[0]?.value ?? 0) / 100,
    },
  });
}
