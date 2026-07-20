import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const rows = await db.query.restaurants.findMany({
    with: { plan: { columns: { name: true } } },
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  });
  return Response.json({
    restaurants: rows.map((r) => ({
      id: String(r.id),
      slug: r.slug,
      name: r.name,
      segment: r.segment,
      logo: r.logoUrl,
      plan: r.plan?.name ?? "Grátis",
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    })),
  });
}
