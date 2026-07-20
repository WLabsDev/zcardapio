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
import { formatBRL, type Order, type OrderStatus } from "@/lib/mock/types";

const POLL_INTERVAL_MS = 15000;

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

    const load = async () => {
      const res = await fetch("/api/orders?scope=restaurant").catch(() => null);
      const data = await res?.json().catch(() => null);
      if (cancelled || !res?.ok || !Array.isArray(data?.orders)) return;
      const incoming: Order[] = data.orders;

      if (knownIds.current) {
        const fresh = incoming.filter((o) => !knownIds.current!.has(o.id));
        for (const o of fresh) {
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
    };

    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
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
