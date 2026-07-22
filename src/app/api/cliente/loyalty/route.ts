import { desc, eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons, loyaltyProgress } from "@/lib/db/schema";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "cliente") {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const rows = await db.query.loyaltyProgress.findMany({
    where: eq(loyaltyProgress.customerId, Number(session.sub)),
    with: {
      restaurant: {
        columns: { id: true, name: true, slug: true, logoUrl: true },
        with: { loyaltyProgram: true },
      },
    },
  });

  const items = rows
    .filter((r) => r.restaurant.loyaltyProgram?.mechanic !== "none")
    .map((r) => {
      const program = r.restaurant.loyaltyProgram!;
      const mechanic = program.mechanic;
      const progress =
        mechanic === "points"
          ? r.points
          : mechanic === "cashback"
            ? r.cashbackCents
            : r.stampCount;
      const goal =
        mechanic === "points"
          ? program.pointsRequired
          : mechanic === "cashback"
            ? null
            : program.stampsRequired;
      const eligible =
        mechanic === "cashback" ? r.cashbackCents > 0 : progress >= (goal ?? 0);
      return {
        restaurantId: String(r.restaurant.id),
        restaurantName: r.restaurant.name,
        restaurantSlug: r.restaurant.slug,
        restaurantLogo: r.restaurant.logoUrl,
        mechanic,
        points: r.points,
        cashbackCents: r.cashbackCents,
        stampCount: r.stampCount,
        pointsRequired: program.pointsRequired,
        stampsRequired: program.stampsRequired,
        eligible,
      };
    });

  const redeemedCoupons = await db.query.coupons.findMany({
    where: eq(coupons.customerId, Number(session.sub)),
    orderBy: [desc(coupons.createdAt)],
    with: { restaurant: { columns: { name: true, slug: true } } },
  });

  const mappedCoupons = redeemedCoupons.map((c) => ({
    code: c.code,
    type: c.type,
    value: c.value,
    active: c.active,
    usedAt: c.usedAt ? c.usedAt.toISOString() : null,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    restaurantName: c.restaurant.name,
    restaurantSlug: c.restaurant.slug,
  }));

  return Response.json({ items, coupons: mappedCoupons });
}
