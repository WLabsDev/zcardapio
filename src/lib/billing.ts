import { eq } from "drizzle-orm";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { db } from "@/lib/db";
import { planPayments, restaurants } from "@/lib/db/schema";
import { PLAN_PERIOD_DAYS } from "@/lib/plan-limits";

let client: MercadoPagoConfig | null = null;

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MercadoPago não configurado — defina MP_ACCESS_TOKEN no .env."
    );
  }
  if (!client) {
    client = new MercadoPagoConfig({ accessToken });
  }
  return client;
}

/** True quando o MercadoPago está configurado (checkout de plano disponível). */
export function isBillingConfigured(): boolean {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

type PlanForCheckout = { id: string; name: string; priceCents: number };
type RestaurantForCheckout = { id: string; name: string };

/**
 * Cria uma preferência no Checkout Pro (PIX + cartão) e registra o checkout
 * como pendente, vinculado pela preferência. Retorna a URL para redirecionar o
 * restaurante ao MercadoPago.
 */
export async function createPlanPreference(params: {
  origin: string;
  restaurant: RestaurantForCheckout;
  plan: PlanForCheckout;
}): Promise<{ initPoint: string; preferenceId: string }> {
  const { origin, restaurant, plan } = params;
  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      items: [
        {
          id: `plan-${plan.id}`,
          title: `Plano ${plan.name} — zCardápio (${PLAN_PERIOD_DAYS} dias)`,
          description: `Plano ${plan.name} para ${restaurant.name}. Pagamento avulso com renovação manual.`,
          quantity: 1,
          unit_price: plan.priceCents / 100,
          currency_id: "BRL",
        },
      ],
      // Identifica restaurante e plano na confirmação (webhook/retorno).
      external_reference: `${restaurant.id}:${plan.id}`,
      back_urls: {
        success: `${origin}/vendedor/plano/resultado?outcome=success`,
        failure: `${origin}/vendedor/plano/resultado?outcome=failure`,
        pending: `${origin}/vendedor/plano/resultado?outcome=pending`,
      },
      auto_return: "approved",
      statement_descriptor: "ZCARDAPIO",
      metadata: { restaurantId: restaurant.id, planId: plan.id },
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error("Falha ao criar a preferência de pagamento.");
  }

  await db.insert(planPayments).values({
    restaurantId: Number(restaurant.id),
    planId: Number(plan.id),
    mpPreferenceId: String(result.id),
    status: "pending",
    amountCents: plan.priceCents,
  });

  return { initPoint: result.init_point, preferenceId: String(result.id) };
}

/** Busca um pagamento na API do MercadoPago (fonte da verdade do status). */
export async function getMercadoPagoPayment(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}

/**
 * Confirma um pagamento aprovado e ativa o plano do restaurante.
 * Idempotente: o mesmo pagamento (mpPaymentId) ativa o plano uma única vez,
 * mesmo que o webhook/retorno chame mais de uma vez.
 */
export async function activatePlanFromPayment(
  paymentId: string
): Promise<{ activated: boolean; message?: string }> {
  const mpPayment = await getMercadoPagoPayment(paymentId);
  if (!mpPayment) {
    return { activated: false, message: "Pagamento não encontrado." };
  }
  if (mpPayment.status !== "approved") {
    return {
      activated: false,
      message: `Pagamento não aprovado (status: ${mpPayment.status}).`,
    };
  }

  const [restaurantIdStr, planIdStr] = (mpPayment.external_reference ?? "").split(":");
  const restaurantId = Number(restaurantIdStr);
  const planId = Number(planIdStr);
  if (!restaurantId || !planId) {
    return { activated: false, message: "Referência do pagamento inválida." };
  }

  const mpPaymentId = String(paymentId);
  const amountCents = Math.round((mpPayment.transaction_amount ?? 0) * 100);
  const validUntil = new Date(
    Date.now() + PLAN_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  let activated = false;
  await db.transaction(async (tx) => {
    // Insere o pagamento aprovado; o onConflictDoNothing no mpPaymentId (único)
    // garante a idempotência — o mesmo pagamento ativa o plano uma única vez.
    const [inserted] = await tx
      .insert(planPayments)
      .values({
        restaurantId,
        planId,
        mpPaymentId,
        status: "approved",
        amountCents,
        planValidUntil: validUntil,
      })
      .onConflictDoNothing({ target: planPayments.mpPaymentId })
      .returning({ id: planPayments.id });
    activated = !!inserted;

    if (activated) {
      await tx
        .update(restaurants)
        .set({ planId, planValidUntil: validUntil })
        .where(eq(restaurants.id, restaurantId));
    }
  });

  return { activated };
}
