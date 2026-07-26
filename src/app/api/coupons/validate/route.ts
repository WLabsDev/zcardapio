import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { countCouponUsage } from "@/lib/db/queries";
import { checkCoupon } from "@/lib/coupons";
import { apiHandler } from "@/lib/api";

const validateSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  code: z.string().min(1).max(40),
  /** Subtotal atual do carrinho, em reais — para conferir o pedido mínimo. */
  subtotal: z.number().min(0).optional(),
  /** Telefone do cliente — para conferir o limite de usos por pessoa. */
  phone: z.string().max(30).optional(),
});

/**
 * Valida um cupom para exibição no checkout. O desconto real é sempre
 * recalculado no servidor ao criar o pedido (nunca confie no cliente) — aqui a
 * intenção é só mostrar o resultado antes, com o mesmo critério, para o cliente
 * não ver um desconto que some na hora de enviar.
 */
export const POST = apiHandler(async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ valid: false }, { status: 400 });
  }
  const { restaurantId, code, subtotal, phone } = parsed.data;

  const coupon = await db.query.coupons.findFirst({
    where: and(
      eq(coupons.restaurantId, restaurantId),
      eq(coupons.code, code.trim().toUpperCase())
    ),
  });

  if (!coupon) {
    return Response.json({ valid: false, message: "Cupom inválido." });
  }

  const usage = await countCouponUsage(coupon.id, phone ?? "");
  const verdict = checkCoupon(coupon, {
    subtotalCents: Math.round((subtotal ?? 0) * 100),
    usage,
  });
  if (!verdict.ok) {
    return Response.json({ valid: false, message: verdict.message });
  }

  return Response.json({
    valid: true,
    type: coupon.type,
    value: coupon.type === "fixed" ? coupon.value / 100 : coupon.value,
  });
});
