import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import {
  getMonthlyHideCount,
  getReviewsForOwner,
} from "@/lib/db/queries";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const FREE_PLAN_MONTHLY_HIDE_LIMIT = 2;

export async function GET() {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const [reviews, hiddenThisMonth, plan] = await Promise.all([
    getReviewsForOwner(restaurant.id),
    getMonthlyHideCount(restaurant.id),
    restaurant.planId
      ? db.query.plans.findFirst({
          where: eq(plans.id, restaurant.planId),
          columns: { name: true },
        })
      : Promise.resolve(null),
  ]);

  const isFree = !plan || plan.name === "Grátis";

  return Response.json({
    reviews,
    quota: {
      unlimited: !isFree,
      limit: FREE_PLAN_MONTHLY_HIDE_LIMIT,
      used: hiddenThisMonth,
    },
    settings: {
      reviewsEnabled: restaurant.reviewsEnabled,
      // Só planos pro+ podem desativar avaliações de clientes.
      canToggle: !isFree,
    },
  });
}
