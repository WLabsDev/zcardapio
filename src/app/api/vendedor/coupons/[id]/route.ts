import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const putSchema = z.object({
  code: z
    .string()
    .min(2, "Informe o código.")
    .max(40)
    .transform((c) => c.trim().toUpperCase())
    .optional(),
  type: z.enum(["percent", "fixed"]).optional(),
  value: z.number().positive("Informe um valor válido.").optional(),
  active: z.boolean().optional(),
  // Limites (null = remove o limite). Ver POST /api/vendedor/coupons.
  expiresAt: z.string().max(10).nullable().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  maxUsesPerCustomer: z.number().int().min(1).nullable().optional(),
  minOrder: z.number().min(0).optional(),
});

/** Fim do dia da data informada — o cupom vale durante todo o último dia. */
function parseExpiry(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date;
}

type Ctx = { params: Promise<{ id: string }> };

/** Cupom de resgate pertence a um cliente — o vendedor não mexe nele por aqui. */
const LOYALTY_COUPON_MESSAGE =
  "Este cupom foi gerado pela fidelidade de um cliente e não pode ser alterado aqui.";

async function parseId(params: Ctx["params"]) {
  const { id } = await params;
  const couponId = Number(id);
  return Number.isInteger(couponId) ? couponId : null;
}

export const PUT = apiHandler(async (request: Request, { params }: Ctx) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const couponId = await parseId(params);
  if (!couponId) {
    return Response.json({ message: "Cupom inválido." }, { status: 400 });
  }

  const current = await db.query.coupons.findFirst({
    where: and(eq(coupons.id, couponId), eq(coupons.restaurantId, restaurant.id)),
  });
  if (!current) {
    return Response.json({ message: "Cupom não encontrado." }, { status: 404 });
  }
  if (current.customerId !== null) {
    return Response.json({ message: LOYALTY_COUPON_MESSAGE }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const type = d.type ?? current.type;
  const value = d.value ?? (current.type === "fixed" ? current.value / 100 : current.value);
  if (type === "percent" && value > 100) {
    return Response.json({ message: "O percentual máximo é 100%." }, { status: 400 });
  }
  const valueStored = type === "fixed" ? Math.round(value * 100) : Math.round(value);

  await db
    .update(coupons)
    .set({
      ...(d.code !== undefined && { code: d.code }),
      ...(d.type !== undefined && { type: d.type }),
      ...(d.value !== undefined && { value: valueStored }),
      ...(d.active !== undefined && { active: d.active }),
      ...(d.expiresAt !== undefined && { expiresAt: parseExpiry(d.expiresAt) }),
      ...(d.maxUses !== undefined && { maxUses: d.maxUses }),
      ...(d.maxUsesPerCustomer !== undefined && {
        maxUsesPerCustomer: d.maxUsesPerCustomer,
      }),
      ...(d.minOrder !== undefined && {
        minOrderCents: Math.round(d.minOrder * 100),
      }),
    })
    .where(eq(coupons.id, couponId));

  return Response.json({ ok: true });
});

export const DELETE = apiHandler(async (_request: Request, { params }: Ctx) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const couponId = await parseId(params);
  if (!couponId) {
    return Response.json({ message: "Cupom inválido." }, { status: 400 });
  }

  const current = await db.query.coupons.findFirst({
    where: and(eq(coupons.id, couponId), eq(coupons.restaurantId, restaurant.id)),
    columns: { id: true, customerId: true },
  });
  if (!current) {
    return Response.json({ message: "Cupom não encontrado." }, { status: 404 });
  }
  if (current.customerId !== null) {
    return Response.json({ message: LOYALTY_COUPON_MESSAGE }, { status: 409 });
  }

  await db.delete(coupons).where(eq(coupons.id, couponId));
  return Response.json({ ok: true });
});
