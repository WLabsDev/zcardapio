import { timingSafeEqual } from "node:crypto";
import { and, count, eq, gt, isNotNull, lt, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, products, restaurants, users } from "@/lib/db/schema";
import { sendActivationNudge, type SendResult } from "@/lib/marketing-email";
import { apiHandler } from "@/lib/api";

/**
 * Job de ativação por e-mail. Um agendador externo (ex.: cron do Easypanel)
 * chama este endpoint todo dia com o header `x-cron-secret: <CRON_SECRET>`.
 *
 * Ele dispara, no máximo uma vez cada (dedupe na tabela emailEvents):
 *  - "nudge_no_products": vendedor com 2+ dias de cadastro e nenhum produto;
 *  - "nudge_share_menu":  vendedor que já tem produtos, mas nenhum pedido.
 * Respeita o opt-out (LGPD) e mira só cadastros dos últimos 90 dias, para não
 * dar um disparo em massa nos históricos na primeira execução.
 */

const DAY = 24 * 60 * 60 * 1000;
const NUDGE_AFTER_DAYS = 2; // dá um tempo antes de cobrar a primeira ação
const RECENT_WINDOW_DAYS = 90; // só ativação de cadastros recentes

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = request.headers.get("x-cron-secret") ?? "";
  const expected = Buffer.from(secret);
  const received = Buffer.from(given);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(expected, received);
}

const run = apiHandler(async (request: Request) => {
  if (!authorized(request)) {
    return Response.json({ message: "Não autorizado." }, { status: 401 });
  }

  const now = Date.now();
  const candidates = await db.query.users.findMany({
    where: and(
      eq(users.role, "restaurante"),
      eq(users.emailOptOut, false),
      isNotNull(users.email),
      gt(users.createdAt, new Date(now - RECENT_WINDOW_DAYS * DAY)),
      lt(users.createdAt, new Date(now - NUDGE_AFTER_DAYS * DAY))
    ),
  });

  let sent = 0;
  let skipped = 0;

  for (const user of candidates) {
    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.ownerId, user.id),
    });
    if (!restaurant) {
      skipped++;
      continue;
    }

    const [productRow] = await db
      .select({ value: count() })
      .from(products)
      .where(eq(products.restaurantId, restaurant.id));
    const productCount = productRow?.value ?? 0;

    const [orderRow] = await db
      .select({ value: count() })
      .from(orders)
      .where(
        and(eq(orders.restaurantId, restaurant.id), ne(orders.status, "cancelado"))
      );
    const orderCount = orderRow?.value ?? 0;

    const vendor = { id: user.id, name: user.name, email: user.email };
    const rest = { name: restaurant.name, slug: restaurant.slug };

    let result: SendResult;
    if (productCount === 0) {
      result = await sendActivationNudge(vendor, rest, "nudge_no_products");
    } else if (orderCount === 0) {
      result = await sendActivationNudge(vendor, rest, "nudge_share_menu");
    } else {
      skipped++; // já ativado: tem produto e pedido
      continue;
    }

    if (result === "sent") sent++;
    else skipped++;
  }

  return Response.json({ candidates: candidates.length, sent, skipped });
});

// Cron services variam entre GET e POST — aceito os dois.
export const GET = run;
export const POST = run;
