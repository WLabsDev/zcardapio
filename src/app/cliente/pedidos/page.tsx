import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/panel/empty-state";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OrderStatusTimeline } from "@/components/panel/order-status-timeline";
import { orders } from "@/lib/mock/data";
import { formatBRL, type OrderStatus } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

const isActive = (status: OrderStatus) =>
  status !== "entregue" && status !== "cancelado";

export default function ClientePedidosPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">Meus pedidos</h2>
        <p className="text-sm text-muted-foreground">
          Histórico de pedidos feitos pelo zCardapio.
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Você ainda não fez pedidos"
          description="Quando você pedir em um restaurante, o acompanhamento aparece aqui em tempo real."
          action={
            <Button
              className="rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5"
              asChild
            >
              <Link href="/cliente">Ver restaurantes</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card
              key={o.id}
              className={cn(
                isActive(o.status) && "border-primary/40 bg-primary/5"
              )}
            >
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      Burguer do Zé · Pedido {o.code}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}{" "}
                      · {o.deliveryType === "entrega" ? "Entrega" : "Retirada"} ·{" "}
                      {o.paymentMethod}
                    </p>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </div>

                <OrderStatusTimeline status={o.status} className="py-1" />

                <Separator />
                <div className="space-y-1 text-sm">
                  {o.items.map((i) => (
                    <div key={i.productId} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {i.quantity}x {i.name}
                      </span>
                      <span>{formatBRL(i.unitPrice * i.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold">Total: {formatBRL(o.total)}</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/r/burguer-do-ze">Pedir de novo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
