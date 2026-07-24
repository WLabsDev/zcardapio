import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { plans, restaurants } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const schema = z.object({
  planId: z.coerce.number().int().positive(),
});

export const POST = apiHandler(async (request: Request) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Plano inválido." }, { status: 400 });
  }

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, parsed.data.planId),
    columns: { id: true, name: true },
  });
  if (!plan) {
    return Response.json({ message: "Plano não encontrado." }, { status: 404 });
  }

  await db
    .update(restaurants)
    .set({ planId: plan.id })
    .where(eq(restaurants.id, restaurant.id));

  return Response.json({ ok: true, planName: plan.name });
});
