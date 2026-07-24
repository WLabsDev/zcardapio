import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";
import { createPlanPreference, isBillingConfigured } from "@/lib/billing";

const schema = z.object({
  planId: z.coerce.number().int().positive(),
});

/** Cria a preferência de pagamento no MercadoPago e devolve a URL do checkout. */
export const POST = apiHandler(async (request: Request) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  if (!isBillingConfigured()) {
    return Response.json(
      { message: "Pagamento de plano indisponível no momento." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Plano inválido." }, { status: 400 });
  }

  const plan = await db.query.plans.findFirst({
    where: eq(plans.id, parsed.data.planId),
    columns: { id: true, name: true, priceCents: true },
  });
  if (!plan) {
    return Response.json({ message: "Plano não encontrado." }, { status: 404 });
  }
  if (plan.priceCents <= 0) {
    return Response.json(
      { message: "O plano grátis não precisa de pagamento." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;
  const { initPoint } = await createPlanPreference({
    origin,
    restaurant: { id: String(restaurant.id), name: restaurant.name },
    plan: { id: String(plan.id), name: plan.name, priceCents: plan.priceCents },
  });

  return Response.json({ initPoint });
});
