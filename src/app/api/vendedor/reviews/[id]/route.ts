import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { setReviewHidden } from "@/lib/db/queries";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const bodySchema = z.object({ hidden: z.boolean() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const reviewId = Number(id);
  if (!Number.isInteger(reviewId)) {
    return Response.json({ message: "Avaliação inválida." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const plan = restaurant.planId
    ? await db.query.plans.findFirst({
        where: eq(plans.id, restaurant.planId),
        columns: { name: true },
      })
    : null;

  const result = await setReviewHidden({
    restaurantId: restaurant.id,
    reviewId,
    hidden: parsed.data.hidden,
    planName: plan?.name ?? null,
  });

  if (!result.ok) {
    return Response.json({ message: result.message }, { status: 403 });
  }
  return Response.json({ ok: true });
}
