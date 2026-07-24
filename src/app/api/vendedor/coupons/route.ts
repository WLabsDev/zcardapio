import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const postSchema = z.object({
  code: z
    .string()
    .min(2, "Informe o código.")
    .max(40)
    .transform((c) => c.trim().toUpperCase()),
  type: z.enum(["percent", "fixed"]),
  /** percentual (0-100) ou valor em reais (fixo) */
  value: z.number().positive("Informe um valor válido."),
  active: z.boolean().default(true),
});

export const GET = apiHandler(async () => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const rows = await db.query.coupons.findMany({
    where: eq(coupons.restaurantId, restaurant.id),
    orderBy: (c, { desc }) => [desc(c.id)],
  });
  return Response.json({
    coupons: rows.map((c) => ({
      id: String(c.id),
      code: c.code,
      type: c.type,
      value: c.type === "fixed" ? c.value / 100 : c.value,
      active: c.active,
    })),
  });
});

export const POST = apiHandler(async (request: Request) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (d.type === "percent" && d.value > 100) {
    return Response.json(
      { message: "O percentual máximo é 100%." },
      { status: 400 }
    );
  }

  const existing = await db.query.coupons.findFirst({
    where: (c, { and, eq }) =>
      and(eq(c.restaurantId, restaurant.id), eq(c.code, d.code)),
    columns: { id: true },
  });
  if (existing) {
    return Response.json(
      { message: "Já existe um cupom com este código." },
      { status: 409 }
    );
  }

  const valueStored =
    d.type === "fixed" ? Math.round(d.value * 100) : Math.round(d.value);

  const [created] = await db
    .insert(coupons)
    .values({
      restaurantId: restaurant.id,
      code: d.code,
      type: d.type,
      value: valueStored,
      active: d.active,
    })
    .returning({ id: coupons.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
});
