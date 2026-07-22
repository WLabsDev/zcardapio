import { getSession } from "@/lib/auth";
import { getOrdersByCustomer } from "@/lib/db/queries";
import { OrdersLive } from "./orders-live";

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

      <OrdersLive initialOrders={orders} />
    </div>
  );
}
