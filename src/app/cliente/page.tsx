import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarClock,
  Clock,
  Heart,
  ShoppingBag,
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
import { formatBRL, type Restaurant } from "@/lib/mock/types";

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

  // Só conta pedidos que de fato viraram compra (ignora cancelados).
  const validOrders = orders.filter((o) => o.status !== "cancelado");
  const now = new Date();
  const monthOrders = validOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const itemsThisMonth = monthOrders.reduce(
    (acc, o) => acc + o.items.reduce((a, i) => a + i.quantity, 0),
    0
  );
  const restaurantIdsThisMonth = new Set(monthOrders.map((o) => o.restaurantId));
  const spentThisMonth = monthOrders.reduce((acc, o) => acc + o.total, 0);

  // Restaurante favorito: o que mais se repete no histórico de pedidos.
  const restaurantById = new Map(restaurants.map((r) => [r.id, r]));
  const orderCountByRestaurant = new Map<string, number>();
  for (const o of validOrders) {
    orderCountByRestaurant.set(
      o.restaurantId,
      (orderCountByRestaurant.get(o.restaurantId) ?? 0) + 1
    );
  }
  const favoriteEntry = [...orderCountByRestaurant.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];
  const favoriteRestaurant = favoriteEntry
    ? {
        id: favoriteEntry[0],
        count: favoriteEntry[1],
        name:
          restaurantById.get(favoriteEntry[0])?.name ??
          validOrders.find((o) => o.restaurantId === favoriteEntry[0])
            ?.restaurantName ??
          "Restaurante",
        slug:
          restaurantById.get(favoriteEntry[0])?.slug ??
          validOrders.find((o) => o.restaurantId === favoriteEntry[0])
            ?.restaurantSlug,
        cover: restaurantById.get(favoriteEntry[0])?.cover,
      }
    : null;

  // "Peça de novo": restaurantes onde o cliente já comprou, mais recentes primeiro.
  const orderedRestaurants: Restaurant[] = [];
  const seen = new Set<string>();
  for (const o of validOrders) {
    if (seen.has(o.restaurantId)) continue;
    const r = restaurantById.get(o.restaurantId);
    if (r) {
      seen.add(o.restaurantId);
      orderedRestaurants.push(r);
    }
    if (orderedRestaurants.length >= 6) break;
  }
  const hasOrderHistory = orderedRestaurants.length > 0;
  const restaurantsToShow = hasOrderHistory ? orderedRestaurants : restaurants;

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

      {validOrders.length > 0 && (
        <Card>
          <CardContent className="grid gap-3 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 bg-accent/40 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/15 bg-background">
                <ShoppingBag className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-none">
                  {itemsThisMonth}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {itemsThisMonth === 1 ? "item comido" : "itens comidos"} esse mês
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 bg-accent/40 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/15 bg-background">
                <Store className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-none">
                  {restaurantIdsThisMonth.size}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {restaurantIdsThisMonth.size === 1
                    ? "restaurante esse mês"
                    : "restaurantes esse mês"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/10 bg-accent/40 p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/15 bg-background">
                <UtensilsCrossed className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold leading-none">
                  {formatBRL(spentThisMonth)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  gastos esse mês
                </p>
              </div>
            </div>

            {favoriteRestaurant && (
              <Link
                href={
                  favoriteRestaurant.slug ? `/r/${favoriteRestaurant.slug}` : "#"
                }
                className="group flex items-center gap-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-3 transition-colors hover:border-primary/60 sm:col-span-3"
              >
                {favoriteRestaurant.cover ? (
                  <div
                    className="size-10 shrink-0 rounded-lg border-2 border-foreground/15 bg-cover bg-center"
                    style={{ backgroundImage: `url(${favoriteRestaurant.cover})` }}
                  />
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-foreground/15 bg-background">
                    <Heart className="size-4 text-primary" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Seu favorito
                  </p>
                  <p className="truncate text-sm font-semibold">
                    {favoriteRestaurant.name}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · {favoriteRestaurant.count}{" "}
                      {favoriteRestaurant.count === 1 ? "pedido" : "pedidos"}
                    </span>
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {hasOrderHistory ? "Peça de novo" : "Descubra restaurantes"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {restaurantsToShow.map((r) => (
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
