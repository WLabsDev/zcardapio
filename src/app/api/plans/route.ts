import { db } from "@/lib/db";

export async function GET() {
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
}
