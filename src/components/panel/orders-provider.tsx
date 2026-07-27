"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GA_EVENTS, trackOnce } from "@/lib/analytics-events";
import { formatBRL, type Order, type OrderStatus } from "@/lib/mock/types";
import { playOrderChime } from "@/lib/notification-sound";

// Backstop: além do push via SSE, refaz a busca a cada 60s (rede de segurança
// caso algum evento se perca) e imediatamente ao reconectar após uma queda.
const BACKSTOP_INTERVAL_MS = 60000;

type OrdersContextValue = {
  orders: Order[];
  pendingCount: number;
  updateStatus: (id: string, status: OrderStatus) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const knownIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // O momento WOW do produto: o restaurante vendo o primeiro pedido de
    // verdade cair na tela. Disparado aqui, no painel do vendedor, e não no
    // checkout do cliente — no checkout quem está no navegador é o
    // consumidor, numa sessão que não tem relação com a origem que trouxe o
    // restaurante. Medido aqui, o marco fica na sessão de quem importa.
    const trackFirstOrder = (list: Order[]) => {
      if (list.length === 0) return;
      // A lista vem do mais recente para o mais antigo — o primeiro pedido da
      // vida do restaurante é o último item.
      const first = list[list.length - 1];
      trackOnce(GA_EVENTS.primeiroPedido, first.restaurantId, {
        valor: first.total,
        tipo_entrega: first.deliveryType,
      });
    };

    const load = async () => {
      const res = await fetch("/api/orders?scope=restaurant").catch(() => null);
      const data = await res?.json().catch(() => null);
      if (cancelled || !res?.ok || !Array.isArray(data?.orders)) return;
      const incoming: Order[] = data.orders;

      if (knownIds.current) {
        const fresh = incoming.filter((o) => !knownIds.current!.has(o.id));
        for (const o of fresh) {
          playOrderChime();
          toast("🔔 Pedido novo!", {
            description: `${o.code} · ${o.customerName} · ${formatBRL(o.total)}`,
            action: {
              label: "Ver pedido",
              onClick: () => router.push("/vendedor/pedidos"),
            },
          });
        }
      }
      knownIds.current = new Set(incoming.map((o) => o.id));
      setOrders(incoming);
      trackFirstOrder(incoming);
    };

    load();

    // Push em tempo real: chega um pedido novo ou muda de status em qualquer
    // lugar (outra aba, o próprio painel), e este componente é avisado na
    // hora — sem precisar perguntar ao servidor a cada X segundos.
    const source = new EventSource("/api/orders/stream?scope=restaurant");
    let connectedBefore = false;

    source.addEventListener("open", () => {
      // Reconectou depois de uma queda: refaz a busca pra fechar qualquer
      // brecha (eventos perdidos enquanto a conexão estava fora do ar).
      if (connectedBefore) load();
      connectedBefore = true;
    });

    source.addEventListener("order", (e: MessageEvent<string>) => {
      const msg: { type: "order_created" | "order_updated"; order: Order } =
        JSON.parse(e.data);
      if (msg.type === "order_created" && !knownIds.current?.has(msg.order.id)) {
        // `knownIds` já foi preenchido pelo load inicial com todos os pedidos
        // da vida do restaurante: vazio aqui significa que este é o primeiro.
        const isFirstEver = knownIds.current?.size === 0;
        playOrderChime();
        toast("🔔 Pedido novo!", {
          description: `${msg.order.code} · ${msg.order.customerName} · ${formatBRL(msg.order.total)}`,
          action: {
            label: "Ver pedido",
            onClick: () => router.push("/vendedor/pedidos"),
          },
        });
        knownIds.current?.add(msg.order.id);
        // Com o painel aberto, o marco é registrado na hora em que o pedido
        // cai — sem esperar o backstop de 60s.
        if (isFirstEver) trackFirstOrder([msg.order]);
      }
      setOrders((prev) => {
        const idx = prev.findIndex((o) => o.id === msg.order.id);
        if (idx === -1) return [msg.order, ...prev];
        const next = prev.slice();
        next[idx] = msg.order;
        return next;
      });
    });

    // Rede de segurança de baixa frequência — cobre lacunas raras que o SSE
    // e o refetch de reconexão não peguem (ex.: aba em segundo plano).
    const backstop = setInterval(load, BACKSTOP_INTERVAL_MS);

    return () => {
      cancelled = true;
      source.close();
      clearInterval(backstop);
    };
  }, [router]);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          toast.error(data?.message ?? "Não foi possível atualizar o pedido.");
        }
      })
      .catch(() => toast.error("Não foi possível atualizar o pedido."));
  }, []);

  const value = useMemo<OrdersContextValue>(() => {
    const pendingCount = orders.filter((o) => o.status === "pendente").length;
    return { orders, pendingCount, updateStatus };
  }, [orders, updateStatus]);

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders deve ser usado dentro de OrdersProvider");
  }
  return ctx;
}
