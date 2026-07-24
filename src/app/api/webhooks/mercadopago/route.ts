import { apiHandler } from "@/lib/api";
import { activatePlanFromPayment, isBillingConfigured } from "@/lib/billing";

/**
 * Webhook do MercadoPago. Recebe notificações de pagamento e ativa o plano do
 * restaurante quando aprovado. Sempre responde 200 para o MercadoPago não
 * reenviar indefinidamente (a ativação é idempotente).
 */
export const POST = apiHandler(async (request: Request) => {
  if (!isBillingConfigured()) {
    return Response.json({ ok: true });
  }

  const body = await request.json().catch(() => null);
  const url = new URL(request.url);

  // Formato atual: { type: "payment", data: { id } }. Fallback para query
  // params (versões/encaminhamentos que mandam topic/id ou type/id).
  const type =
    body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId =
    body?.data?.id ??
    url.searchParams.get("id") ??
    url.searchParams.get("data.id");

  if (type === "payment" && paymentId) {
    const result = await activatePlanFromPayment(String(paymentId)).catch(
      (e) => {
        console.error("[webhook mercadopago] falha ao processar pagamento:", e);
        return { activated: false };
      }
    );
    if (result.activated) {
      console.log("[webhook mercadopago] plano ativado (pagamento", paymentId + ")");
    }
  }

  return Response.json({ ok: true });
});
