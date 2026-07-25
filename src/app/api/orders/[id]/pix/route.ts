import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { orderCode } from "@/lib/db/queries";
import { isPixPayment } from "@/lib/payment";
import { generateOrderPix } from "@/lib/pix";
import { apiHandler } from "@/lib/api";

/**
 * Regera o QR Code Pix de um pedido que ainda não foi pago. Serve para o
 * cliente que fechou a tela de pagamento antes de pagar: o BR Code é estático e
 * derivado da chave do restaurante + valor + código do pedido, então gerar de
 * novo dá exatamente o mesmo código.
 *
 * A chave Pix em si nunca é devolvida — só o BR Code, que é o que o cliente
 * precisa e já era exposto no checkout.
 */
export const GET = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await getSession();
  if (!session || session.role !== "cliente") {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return Response.json({ message: "Pedido inválido." }, { status: 400 });
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { restaurant: { columns: { name: true, pixKey: true } } },
  });

  if (!order) {
    return Response.json({ message: "Pedido não encontrado." }, { status: 404 });
  }
  if (order.customerId !== Number(session.sub)) {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }
  if (!isPixPayment(order.paymentMethod)) {
    return Response.json(
      { message: "Este pedido não foi feito no Pix." },
      { status: 400 }
    );
  }
  // Depois de confirmado o restaurante já recebeu — não faz sentido cobrar de novo.
  if (order.status !== "pendente") {
    return Response.json(
      { message: "Este pedido não está mais aguardando pagamento." },
      { status: 409 }
    );
  }

  const pix = await generateOrderPix({
    pixKey: order.restaurant.pixKey,
    restaurantName: order.restaurant.name,
    amountCents: order.totalCents,
    orderCode: orderCode(order.id),
  });

  if (!pix) {
    return Response.json(
      { message: "O restaurante não tem chave Pix cadastrada." },
      { status: 404 }
    );
  }

  return Response.json({ pix });
});
