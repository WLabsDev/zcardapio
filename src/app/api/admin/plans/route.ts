import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans, restaurants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [rows, counts] = await Promise.all([
    db.query.plans.findMany({ orderBy: (p, { asc }) => [asc(p.priceCents)] }),
    db
      .select({ planId: restaurants.planId, value: count() })
      .from(restaurants)
      .where(eq(restaurants.status, "ativo"))
      .groupBy(restaurants.planId),
  ]);
  const countByPlan = new Map(counts.map((c) => [c.planId, c.value]));

  return Response.json({
    plans: rows.map((p) => ({
      id: String(p.id),
      name: p.name,
      price: p.priceCents / 100,
      description: p.description,
      features: p.features,
      highlighted: p.highlighted,
      subscribers: countByPlan.get(p.id) ?? 0,
    })),
  });
}
