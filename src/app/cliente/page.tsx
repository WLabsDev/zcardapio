import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarClock,
  Clock,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
import { OrderStatusTimeline } from "@/components/panel/order-status-timeline";
import { getSession } from "@/lib/auth";
import { getOrdersByCustomer, listActiveRestaurants } from "@/lib/db/queries";
import { formatBRL } from "@/lib/mock/types";

export default async function ClienteHome() {
  const session = await getSession();
  const [orders, restaurants] = await Promise.all([
    session ? getOrdersByCustomer(Number(session.sub)) : Promise.resolve([]),
    listActiveRestaurants(),
  ]);
  const activeOrder = orders.find(
    (o) => o.status !== "entregue" && o.status !== "cancelado"
  );
  const name = session?.name ?? "Visitante";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold">
          Olá, {name.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          Com fome? Seus restaurantes favoritos estão aqui.
        </p>
      </div>

      {activeOrder && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="space-y-3 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Pedido em andamento
                </p>
                <p className="truncate font-semibold">
                  {activeOrder.restaurantName ?? "Restaurante"} ·{" "}
                  {activeOrder.code}
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
                ) : (
                  <Store className="size-3.5" />
                )}
                {activeOrder.deliveryType === "entrega"
                  ? "Entrega"
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
              className="w-full rounded-full font-semibold shadow-offset-sm transition-transform hover:-translate-y-0.5 sm:w-auto"
              asChild
            >
              <Link href="/cliente/pedidos">
                Acompanhar pedido
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peça de novo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {restaurants.map((r) => (
            <Link
              key={r.id}
              href={`/r/${r.slug}`}
              className="group overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
            >
              <div
                className="h-24 bg-cover bg-center"
                style={{ backgroundImage: `url(${r.cover})` }}
              />
              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.name}</p>
                  <Badge variant={r.isOpen ? "default" : "secondary"} className="text-[10px]">
                    {r.isOpen ? "Aberto" : "Fechado"}
                  </Badge>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {r.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="size-3" />
                    {r.deliveryTime}
                  </span>
                </p>
                <p className="flex items-center gap-1 text-xs font-medium text-primary">
                  Ver cardápio
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
