import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/panel/empty-state";
import { getSession } from "@/lib/auth";
import { getOrdersByCustomer } from "@/lib/db/queries";
import { OrderCard } from "./order-card";

export default async function ClientePedidosPage() {
  const session = await getSession();
  const orders = session ? await getOrdersByCustomer(Number(session.sub)) : [];
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
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
