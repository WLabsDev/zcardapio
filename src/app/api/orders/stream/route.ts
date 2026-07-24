import { getSession } from "@/lib/auth";
import { getOrderById } from "@/lib/db/queries";
import { subscribeToOrderEvents } from "@/lib/realtime";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

// Precisa do runtime Node (não edge) pra manter a conexão Postgres de LISTEN.
export const runtime = "nodejs";
// SSE nunca pode ser cacheado/prerenderizado.
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25_000;

export const GET = apiHandler(async (request: Request) => {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get("scope");

  let filter: { restaurantId: number } | { customerId: number };
  if (scope === "restaurant") {
    const { error, restaurant } = await requireVendedorRestaurant();
    if (error) return error;
    filter = { restaurantId: restaurant.id };
  } else {
    filter = { customerId: Number(session.sub) };
  }

  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      unsubscribe = await subscribeToOrderEvents(filter, async (event) => {
        const order = await getOrderById(event.orderId).catch(() => null);
        if (!order) return;
        send("order", { type: event.type, order });
      });

      heartbeat = setInterval(() => send("ping", {}), HEARTBEAT_MS);

      const cleanup = () => {
        if (heartbeat) clearInterval(heartbeat);
        unsubscribe?.();
      };
      request.signal.addEventListener("abort", cleanup);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
});
