/**
 * Pub/sub de eventos de pedido via Postgres LISTEN/NOTIFY.
 *
 * Por quê Postgres em vez de um EventEmitter em memória: o app roda hoje num
 * único container, mas um NOTIFY disparado nesta instância chega a qualquer
 * instância que esteja com LISTEN aberto — então o pub/sub continua
 * funcionando corretamente se um dia isso escalar para múltiplas réplicas,
 * sem precisar de Redis/Pusher/Ably (Postgres já é uma dependência obrigatória).
 *
 * Fluxo: as rotas de escrita (`POST /api/orders`, `PATCH /api/orders/[id]`)
 * chamam `publishOrderEvent` logo após o commit. O canal `order_events` carrega
 * só identificadores (nunca o pedido inteiro, respeitando o limite de ~8000
 * bytes do NOTIFY). Quem consome (`/api/orders/stream`) rebusca o pedido pelos
 * helpers existentes (`getOrderById`) e envia o dado completo por SSE.
 */
import postgres from "postgres";
import type { OrderStatus } from "@/lib/mock/types";

export type OrderEvent =
  | {
      type: "order_created";
      orderId: number;
      restaurantId: number;
      customerId: number | null;
    }
  | {
      type: "order_updated";
      orderId: number;
      restaurantId: number;
      customerId: number | null;
      status: OrderStatus;
    };

type Listener = (event: OrderEvent) => void;

const ORDER_EVENTS_CHANNEL = "order_events";

// Em dev, o hot-reload recria este módulo a cada mudança; sem o cache no
// globalThis cada reload abriria uma conexão LISTEN nova (mesmo padrão usado
// em src/lib/db/index.ts para o cliente pooled do Drizzle).
type RealtimeGlobals = {
  listenClient?: ReturnType<typeof postgres>;
  listeners?: Set<Listener>;
  listening?: boolean;
};
const globalForRealtime = globalThis as unknown as { __realtime?: RealtimeGlobals };
const store: RealtimeGlobals = globalForRealtime.__realtime ?? {};
if (process.env.NODE_ENV !== "production") globalForRealtime.__realtime = store;

function getListenClient() {
  if (!store.listenClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não está definido (confira o arquivo .env).");
    }
    // Conexão dedicada e mínima (max: 1) — só pra LISTEN/NOTIFY, separada do
    // pool do Drizzle (que é pra queries transacionais, não pra manter uma
    // conexão longa reservada).
    store.listenClient = postgres(process.env.DATABASE_URL, { max: 1 });
  }
  return store.listenClient;
}

function getListeners() {
  if (!store.listeners) store.listeners = new Set();
  return store.listeners;
}

async function ensureListening() {
  if (store.listening) return;
  store.listening = true;
  const client = getListenClient();
  await client.listen(ORDER_EVENTS_CHANNEL, (payload) => {
    let event: OrderEvent;
    try {
      event = JSON.parse(payload);
    } catch {
      return;
    }
    for (const listener of getListeners()) listener(event);
  });
}

/** Publica um evento de pedido (chamado pelas rotas de escrita, depois do commit). */
export async function publishOrderEvent(event: OrderEvent) {
  const client = getListenClient();
  await client.notify(ORDER_EVENTS_CHANNEL, JSON.stringify(event));
}

/**
 * Assina eventos de pedido filtrados por restaurante ou cliente. Retorna uma
 * função de cancelamento — chame-a quando a conexão SSE encerrar.
 */
export async function subscribeToOrderEvents(
  filter: { restaurantId: number } | { customerId: number },
  onEvent: (event: OrderEvent) => void
) {
  await ensureListening();
  const listener: Listener = (event) => {
    const matches =
      "restaurantId" in filter
        ? event.restaurantId === filter.restaurantId
        : event.customerId !== null && event.customerId === filter.customerId;
    if (matches) onEvent(event);
  };
  const listeners = getListeners();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
