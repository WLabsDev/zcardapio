import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";
import { getPlanStatus } from "@/lib/plan-limits";

/** Situação atual do plano do restaurante (free/active/grace/expired + vigência). */
export const GET = apiHandler(async () => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const plan = restaurant.planId
    ? await db.query.plans.findFirst({
        where: eq(plans.id, restaurant.planId),
        columns: { name: true },
      })
    : null;
  const planName = plan?.name ?? "Grátis";
  const status = getPlanStatus(planName, restaurant.planValidUntil);

  return Response.json({
    status,
    planName,
    planValidUntil: restaurant.planValidUntil
      ? restaurant.planValidUntil.toISOString()
      : null,
  });
});
