"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/panel/empty-state";
import { useLiveOrders } from "@/hooks/use-live-orders";
import type { Order } from "@/lib/mock/types";
import { OrderCard } from "./order-card";

export function OrdersLive({ initialOrders }: { initialOrders: Order[] }) {
  const orders = useLiveOrders(initialOrders, "/api/orders/stream", "/api/orders");

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Você ainda não fez pedidos"
        description="Quando você pedir em um restaurante, o acompanhamento aparece aqui em tempo real."
        action={
          <Button className="rounded-full font-semibold" asChild>
            <Link href="/cliente">Ver restaurantes</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}
