import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { plans, restaurants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const postSchema = z.object({
  name: z.string().min(2, "Informe o nome do plano.").max(50),
  price: z.number().min(0, "Preço inválido."),
  description: z.string().max(300).default(""),
  features: z.array(z.string().min(1).max(120)).default([]),
  highlighted: z.boolean().default(false),
});

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const [created] = await db
    .insert(plans)
    .values({
      name: d.name.trim(),
      priceCents: Math.round(d.price * 100),
      description: d.description.trim(),
      features: d.features,
      highlighted: d.highlighted,
    })
    .returning({ id: plans.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
}

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
