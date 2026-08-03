"use client";

import Link from "next/link";
import { ArrowRight, Bike, CalendarClock, Store, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OrderStatusTimeline } from "@/components/panel/order-status-timeline";
import { useLiveOrders } from "@/hooks/use-live-orders";
import { formatBRL, type Order } from "@/lib/mock/types";

export function ActiveOrderLive({ initialOrders }: { initialOrders: Order[] }) {
  const orders = useLiveOrders(initialOrders, "/api/orders/stream", "/api/orders");
  const activeOrder = orders.find(
    (o) => o.status !== "entregue" && o.status !== "cancelado"
  );

  if (!activeOrder) return null;

  return (
    <Card className="bg-primary/5">
      <CardContent className="space-y-3 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Pedido em andamento
            </p>
            <p className="truncate font-semibold">
              {activeOrder.restaurantName ?? "Restaurante"} · {activeOrder.code}
            </p>
          </div>
          <OrderStatusBadge status={activeOrder.status} />
        </div>

        <OrderStatusTimeline status={activeOrder.status} className="py-1" />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="size-3.5" />
            {activeOrder.items.reduce((a, i) => a + i.quantity, 0)}{" "}
            {activeOrder.items.reduce((a, i) => a + i.quantity, 0) === 1
              ? "item"
              : "itens"}
          </span>
          <span className="flex items-center gap-1">
            {activeOrder.deliveryType === "entrega" ? (
              <Bike className="size-3.5" />
            ) : activeOrder.deliveryType === "mesa" ? (
              <UtensilsCrossed className="size-3.5" />
            ) : (
              <Store className="size-3.5" />
            )}
            {activeOrder.deliveryType === "entrega"
              ? "Entrega"
              : activeOrder.deliveryType === "mesa"
                ? `Mesa ${activeOrder.tableNumber ?? ""}`
                : "Retirada"}
          </span>
          <span className="font-semibold text-foreground">
            {formatBRL(activeOrder.total)}
          </span>
          {activeOrder.scheduledFor && (
            <span className="flex items-center gap-1 text-primary">
              <CalendarClock className="size-3.5" />
              Agendado para{" "}
              {new Date(activeOrder.scheduledFor).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          )}
        </div>

        <Button
          size="sm"
          className="w-full rounded-full font-semibold sm:w-auto"
          asChild
        >
          <Link href="/cliente/pedidos">
            Acompanhar pedido
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
