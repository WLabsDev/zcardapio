import { and, count, eq, inArray, isNull, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { coupons, orders } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const reaisToCents = (v: number) => Math.round(v * 100);

/** Campos de limite: null/ausente = sem limite (é o padrão histórico). */
const limitsSchema = {
  /** Data (YYYY-MM-DD) até quando o cupom vale; vazio = não expira. */
  expiresAt: z.string().max(10).optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  maxUsesPerCustomer: z.number().int().min(1).nullable().optional(),
  minOrder: z.number().min(0).optional(),
};

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
  ...limitsSchema,
});

/** Fim do dia da data informada — o cupom vale durante todo o último dia. */
function parseExpiry(value: string | undefined): Date | null {
  if (!value?.trim()) return null;
  const date = new Date(`${value}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const GET = apiHandler(async () => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  // Só os cupons criados à mão pelo vendedor. Os gerados por resgate de
  // fidelidade (customerId preenchido) são de um cliente específico e ficam
  // listados em /vendedor/fidelidade — senão a lista aqui vira um depósito.
  const rows = await db.query.coupons.findMany({
    where: and(
      eq(coupons.restaurantId, restaurant.id),
      isNull(coupons.customerId)
    ),
    orderBy: (c, { desc }) => [desc(c.id)],
  });

  // Quantas vezes cada cupom já foi usado (pedido cancelado não conta).
  const ids = rows.map((c) => c.id);
  const usageRows = ids.length
    ? await db
        .select({ couponId: orders.couponId, value: count() })
        .from(orders)
        .where(and(inArray(orders.couponId, ids), ne(orders.status, "cancelado")))
        .groupBy(orders.couponId)
    : [];
  const usedBy = new Map(usageRows.map((r) => [r.couponId, r.value]));

  return Response.json({
    coupons: rows.map((c) => ({
      id: String(c.id),
      code: c.code,
      type: c.type,
      value: c.type === "fixed" ? c.value / 100 : c.value,
      active: c.active,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      maxUses: c.maxUses,
      maxUsesPerCustomer: c.maxUsesPerCustomer,
      minOrder: c.minOrderCents / 100,
      used: usedBy.get(c.id) ?? 0,
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
      expiresAt: parseExpiry(d.expiresAt),
      maxUses: d.maxUses ?? null,
      maxUsesPerCustomer: d.maxUsesPerCustomer ?? null,
      minOrderCents: reaisToCents(d.minOrder ?? 0),
    })
    .returning({ id: coupons.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
});
