"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { orders as mockOrders } from "@/lib/mock/data";
import { formatBRL, type Order, type OrderStatus } from "@/lib/mock/types";

type OrdersContextValue = {
  orders: Order[];
  pendingCount: number;
  updateStatus: (id: string, status: OrderStatus) => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

/** Simula a chegada de um pedido novo (antes do backend existir). */
let hasSimulatedIncomingOrder = false;

function buildIncomingOrder(): Order {
  return {
    id: `o-${Date.now()}`,
    code: "#1043",
    restaurantId: "r1",
    customerName: "Rafael Nunes",
    items: [
      { productId: "p1", name: "Zé Clássico", quantity: 1, unitPrice: 29.9 },
      { productId: "p15", name: "Açaí na Tigela (500ml, Nutella)", quantity: 1, unitPrice: 29.9 },
    ],
    total: 59.8,
    status: "pendente",
    paymentMethod: "Pix",
    deliveryType: "entrega",
    createdAt: new Date().toISOString(),
  };
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  useEffect(() => {
    if (hasSimulatedIncomingOrder) return;
    const timer = setTimeout(() => {
      hasSimulatedIncomingOrder = true;
      const incoming = buildIncomingOrder();
      setOrders((prev) => [incoming, ...prev]);
      toast("🔔 Pedido novo!", {
        description: `${incoming.code} · ${incoming.customerName} · ${formatBRL(incoming.total)}`,
        action: {
          label: "Ver pedido",
          onClick: () => router.push("/vendedor/pedidos"),
        },
      });
    }, 12000);
    return () => clearTimeout(timer);
  }, [router]);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
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
