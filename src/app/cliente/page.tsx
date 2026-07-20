import Link from "next/link";
import { ArrowRight, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/panel/order-status-badge";
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
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                Pedido {activeOrder.code} em andamento
              </p>
              <p className="text-sm text-muted-foreground">
                {activeOrder.restaurantName ?? "Restaurante"} ·{" "}
                {formatBRL(activeOrder.total)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <OrderStatusBadge status={activeOrder.status} />
              <Button size="sm" variant="outline" asChild>
                <Link href="/cliente/pedidos">Acompanhar</Link>
              </Button>
            </div>
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
