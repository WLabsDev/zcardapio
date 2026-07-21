import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

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
});

type Ctx = { params: Promise<{ id: string }> };

async function parseId(params: Ctx["params"]) {
  const { id } = await params;
  const couponId = Number(id);
  return Number.isInteger(couponId) ? couponId : null;
}

export async function PUT(request: Request, { params }: Ctx) {
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
    })
    .where(eq(coupons.id, couponId));

  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const couponId = await parseId(params);
  if (!couponId) {
    return Response.json({ message: "Cupom inválido." }, { status: 400 });
  }

  const [deleted] = await db
    .delete(coupons)
    .where(and(eq(coupons.id, couponId), eq(coupons.restaurantId, restaurant.id)))
    .returning({ id: coupons.id });

  if (!deleted) {
    return Response.json({ message: "Cupom não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
