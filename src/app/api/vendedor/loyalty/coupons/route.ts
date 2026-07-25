import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

/**
 * Cupons gerados por resgate de fidelidade (os que têm dono). Ficam fora da
 * lista de "Cupons de desconto" das configurações — lá só entram os que o
 * vendedor criou à mão.
 */
export const GET = apiHandler(async () => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const rows = await db.query.coupons.findMany({
    where: and(
      eq(coupons.restaurantId, restaurant.id),
      isNotNull(coupons.customerId)
    ),
    orderBy: [desc(coupons.createdAt)],
    with: { customer: { columns: { name: true, phone: true } } },
  });

  const now = Date.now();
  const items = rows.map((c) => ({
    id: String(c.id),
    code: c.code,
    type: c.type,
    // Igual ao /api/vendedor/coupons: valor fixo sai em reais, percentual cru.
    value: c.type === "fixed" ? c.value / 100 : c.value,
    active: c.active,
    createdAt: c.createdAt.toISOString(),
    usedAt: c.usedAt ? c.usedAt.toISOString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    customerName: c.customer?.name ?? "Cliente removido",
    customerPhone: c.customer?.phone ?? null,
  }));

  const isExpired = (c: (typeof items)[number]) =>
    c.expiresAt !== null && new Date(c.expiresAt).getTime() < now;

  return Response.json({
    coupons: items,
    summary: {
      total: items.length,
      used: items.filter((c) => c.usedAt).length,
      available: items.filter((c) => !c.usedAt && c.active && !isExpired(c))
        .length,
      expired: items.filter((c) => !c.usedAt && isExpired(c)).length,
    },
  });
});
