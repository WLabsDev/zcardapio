import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { apiHandler } from "@/lib/api";

const validateSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  code: z.string().min(1).max(40),
});

/**
 * Valida um cupom para exibição no checkout. O desconto real é sempre
 * recalculado no servidor ao criar o pedido (nunca confie no cliente).
 */
export const POST = apiHandler(async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ valid: false }, { status: 400 });
  }
  const { restaurantId, code } = parsed.data;

  const coupon = await db.query.coupons.findFirst({
    where: and(
      eq(coupons.restaurantId, restaurantId),
      eq(coupons.code, code.trim().toUpperCase()),
      eq(coupons.active, true)
    ),
  });

  if (!coupon) {
    return Response.json({ valid: false });
  }

  return Response.json({
    valid: true,
    type: coupon.type,
    value: coupon.type === "fixed" ? coupon.value / 100 : coupon.value,
  });
});
