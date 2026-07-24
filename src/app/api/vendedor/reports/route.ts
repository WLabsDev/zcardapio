import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async (request: Request) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const period =
    new URL(request.url).searchParams.get("period") === "30d" ? "30d" : "7d";
  const days = period === "30d" ? 30 : 7;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await db.query.orders.findMany({
    where: and(
      eq(orders.restaurantId, restaurant.id),
      gte(orders.createdAt, since)
    ),
    with: { items: { with: { product: { columns: { imageUrl: true } } } } },
  });
  const valid = rows.filter((o) => o.status !== "cancelado");

  const revenueCents = valid.reduce((a, o) => a + o.totalCents, 0);
  const count = valid.length;

  // Faturamento por dia (todos os dias do período, mesmo sem pedidos)
  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of valid) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) byDay.set(key, byDay.get(key)! + o.totalCents);
  }
  const revenueByDay = [...byDay.entries()].map(([iso, cents]) => ({
    label: new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    value: cents / 100,
  }));

  // Pedidos por hora (11h–23h, faixa típica de funcionamento)
  const ordersByHour = Array.from({ length: 13 }, (_, i) => {
    const hour = 11 + i;
    return {
      label: `${hour}h`,
      value: valid.filter((o) => o.createdAt.getHours() === hour).length,
    };
  });

  // Produtos mais vendidos
  const byProduct = new Map<
    string,
    { name: string; image: string; value: number }
  >();
  for (const o of valid) {
    for (const item of o.items) {
      const entry = byProduct.get(item.name) ?? {
        name: item.name,
        image: item.product?.imageUrl ?? "",
        value: 0,
      };
      entry.value += item.quantity;
      byProduct.set(item.name, entry);
    }
  }
  const topProducts = [...byProduct.values()]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return Response.json({
    report: {
      revenue: revenueCents / 100,
      orders: count,
      cancelled: rows.length - valid.length,
      avgTicket: count > 0 ? revenueCents / count / 100 : 0,
      revenueByDay,
      ordersByHour,
      topProducts,
    },
  });
});
