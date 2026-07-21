import { createPortal } from "react-dom";
import { formatBRL, type Order } from "@/lib/mock/types";

/**
 * Versão do pedido formatada como cupom de cozinha para impressão.
 * Fica oculta na tela (`hidden`) e só aparece com `print:block`. É montada
 * via portal direto no <body> para ser filha direta dele — assim o CSS de
 * impressão oculta todos os outros filhos (painel, modal, toasts) sem deixar
 * páginas em branco, e o ticket pode se estender por quantas folhas precisar.
 * Largura fluida (`w-full` até 80mm): preenche o papel térmico configurado no
 * driver (58mm ou 80mm) e vira coluna de 80mm centralizada se impresso em A4.
 */
export function OrderPrintTicket({ order }: { order: Order }) {
  const scheduled = order.scheduledFor
    ? new Date(order.scheduledFor).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return createPortal(
    <div id="print-ticket" className="hidden print:block">
      <div className="mx-auto w-full max-w-[80mm] font-mono text-[12px] leading-snug text-black">
        {/* Cabeçalho */}
        <div className="text-center">
          <p className="text-[24px] font-extrabold tracking-tight">
            PEDIDO {order.code}
          </p>
          <p>
            {new Date(order.createdAt).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
          {scheduled && (
            <p className="mt-1 border-2 border-black px-2 py-0.5 text-[13px] font-bold">
              *** AGENDADO PARA {scheduled} ***
            </p>
          )}
        </div>

        <div className="my-2 border-t-2 border-dashed border-black" />

        {/* Cliente e entrega */}
        <div className="space-y-0.5">
          <p className="text-[14px] font-bold uppercase">{order.customerName}</p>
          {order.customerPhone && <p>{order.customerPhone}</p>}
          <p className="font-bold">
            {order.deliveryType === "entrega" ? "ENTREGA" : "RETIRADA"}
            {order.zoneName && ` - ${order.zoneName}`}
          </p>
          {order.deliveryType === "entrega" && order.address && (
            <p>{order.address}</p>
          )}
          <p>Pagamento: {order.paymentMethod}</p>
        </div>

        <div className="my-2 border-t-2 border-dashed border-black" />

        {/* Itens */}
        <p className="mb-1 text-[13px] font-extrabold uppercase">
          ** Itens do pedido **
        </p>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={`${item.productId}-${idx}`} className="break-inside-avoid">
              <p className="text-[14px] font-bold">
                {item.quantity}x {item.name}
              </p>
              {item.options && item.options.length > 0 && (
                <ul className="ml-4 list-disc">
                  {item.options.map((op, opIdx) => (
                    <li key={opIdx}>
                      {op.name}
                      {op.price > 0 && ` (+${formatBRL(op.price)})`}
                    </li>
                  ))}
                </ul>
              )}
              {item.notes && (
                <p className="ml-4 mt-0.5 border border-black px-1.5 py-0.5 font-bold">
                  OBS: {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="my-2 border-t-2 border-dashed border-black" />

        {/* Totais */}
        <div className="space-y-0.5">
          {order.subtotal !== undefined && (
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatBRL(order.subtotal)}</span>
            </div>
          )}
          {order.discount !== undefined && order.discount > 0 && (
            <div className="flex justify-between font-bold">
              <span>Desconto{order.couponCode && ` (${order.couponCode})`}</span>
              <span>-{formatBRL(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>
              {order.deliveryType === "entrega" ? "Entrega" : "Retirada"}
            </span>
            <span>
              {order.deliveryType === "retirada" || (order.deliveryFee ?? 0) === 0
                ? "Grátis"
                : formatBRL(order.deliveryFee ?? 0)}
            </span>
          </div>
          <div className="mt-1 flex justify-between border-t-2 border-black pt-1 text-[16px] font-extrabold">
            <span>TOTAL</span>
            <span>{formatBRL(order.total)}</span>
          </div>
        </div>

        {order.restaurantName && (
          <p className="mt-3 text-center text-[13px] font-extrabold uppercase tracking-wide">
            {order.restaurantName}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
