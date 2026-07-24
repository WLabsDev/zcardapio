import { z } from "zod";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";
import { activatePlanFromPayment } from "@/lib/billing";

const schema = z.object({ paymentId: z.string().min(1) });

/**
 * Confirma/ativa um pagamento após o retorno do Checkout Pro. Útil sobretudo
 * em dev (onde o webhook não chega sem URL pública) e para o PIX pendente: o
 * restaurante clica em "Verificar pagamento" e ativamos se já foi aprovado.
 */
export const POST = apiHandler(async (request: Request) => {
  const { error } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "paymentId inválido." }, { status: 400 });
  }

  const result = await activatePlanFromPayment(parsed.data.paymentId);
  return Response.json(result);
});
