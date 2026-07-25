import { apiHandler } from "@/lib/api";
import { activatePlanFromPayment, isBillingConfigured } from "@/lib/billing";
import { verifyWebhookSignature } from "@/lib/mp-webhook";

let warnedMissingSecret = false;

/**
 * Webhook do MercadoPago. Recebe notificações de pagamento e ativa o plano do
 * restaurante quando aprovado. Responde 200 nos casos válidos para o
 * MercadoPago não reenviar indefinidamente (a ativação é idempotente); só
 * assinatura inválida devolve 401.
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
  // O manifesto assinado usa o `data.id` da query; o corpo é o plano B para
  // encaminhamentos que perdem a query string.
  const signedId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  const paymentId = body?.data?.id ?? signedId;

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (secret) {
    const valid = verifyWebhookSignature({
      secret,
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId: signedId ?? (paymentId ? String(paymentId) : null),
    });
    if (!valid) {
      console.warn(
        "[webhook mercadopago] assinatura inválida — notificação descartada",
        { paymentId: paymentId ? String(paymentId) : null }
      );
      return Response.json({ message: "Assinatura inválida." }, { status: 401 });
    }
  } else if (!warnedMissingSecret) {
    // Sem o segredo o endpoint aceita qualquer POST. O estrago é limitado (o
    // pagamento é buscado na API do MercadoPago pelo id antes de ativar
    // qualquer coisa), mas configure MP_WEBHOOK_SECRET assim mesmo.
    warnedMissingSecret = true;
    console.warn(
      "[webhook mercadopago] MP_WEBHOOK_SECRET não definido — as notificações não estão sendo validadas."
    );
  }

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
