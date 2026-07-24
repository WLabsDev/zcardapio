import { db } from "@/lib/db";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => {
  const rows = await db.query.plans.findMany({
    orderBy: (p, { asc }) => [asc(p.priceCents)],
  });
  return Response.json({
    plans: rows.map((p) => ({
      id: String(p.id),
      name: p.name,
      price: p.priceCents / 100,
      description: p.description,
      features: p.features,
      highlighted: p.highlighted,
    })),
  });
});
