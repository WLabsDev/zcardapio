"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { formatBRL, type Order } from "@/lib/mock/types";

const BACKSTOP_INTERVAL_MS = 60_000;

type OrderStreamMessage = {
  type: "order_created" | "order_updated";
  order: Order;
};

function mergeOrder(orders: Order[], incoming: Order): Order[] {
  const idx = orders.findIndex((o) => o.id === incoming.id);
  if (idx === -1) return [incoming, ...orders];
  const next = orders.slice();
  next[idx] = incoming;
  return next;
}

/** Avisa o cliente quando um pedido acabou de virar "entregue" e creditou fidelidade. */
function notifyLoyaltyEarned(before: Order | undefined, incoming: Order) {
  if (!before || before.status === "entregue" || incoming.status !== "entregue") {
    return;
  }
  if (incoming.loyaltyPointsEarned) {
    toast.success(
      `Pedido entregue! Você ganhou ${incoming.loyaltyPointsEarned} pontos de fidelidade.`
    );
  } else if (incoming.loyaltyCashbackEarnedCents) {
    toast.success(
      `Pedido entregue! Você ganhou ${formatBRL(incoming.loyaltyCashbackEarnedCents / 100)} de cashback.`
    );
  } else if (incoming.loyaltyStampEarned) {
    toast.success("Pedido entregue! Você ganhou um carimbo de fidelidade.");
  }
}

/**
 * Mantém uma lista de pedidos viva via SSE (`/api/orders/stream`), a partir de
 * uma lista inicial vinda do servidor (primeira renderização sem depender de
 * JS). Depois disso, só recebe deltas (`order_created`/`order_updated`) — sem
 * polling. `refetchUrl` é usado como rede de segurança: uma vez ao reconectar
 * (cobre o que passou enquanto a conexão caiu) e a cada 60s como backstop.
 */
export function useLiveOrders(
  initialOrders: Order[],
  streamUrl: string,
  refetchUrl: string
): Order[] {
  const [orders, setOrders] = useState(initialOrders);
  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    setOrders(initialOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrders]);

  useEffect(() => {
    const refetch = async () => {
      const res = await fetch(refetchUrl).catch(() => null);
      const data = await res?.json().catch(() => null);
      if (Array.isArray(data?.orders)) setOrders(data.orders);
    };

    const source = new EventSource(streamUrl);

    source.addEventListener("open", () => {
      if (hasConnectedBefore.current) refetch();
      hasConnectedBefore.current = true;
    });

    source.addEventListener("order", (e: MessageEvent<string>) => {
      const msg: OrderStreamMessage = JSON.parse(e.data);
      setOrders((prev) => {
        const before = prev.find((o) => o.id === msg.order.id);
        notifyLoyaltyEarned(before, msg.order);
        return mergeOrder(prev, msg.order);
      });
    });

    const backstop = setInterval(refetch, BACKSTOP_INTERVAL_MS);

    return () => {
      source.close();
      clearInterval(backstop);
    };
  }, [streamUrl, refetchUrl]);

  return orders;
}
