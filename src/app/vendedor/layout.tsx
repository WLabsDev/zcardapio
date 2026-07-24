import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession, isImpersonating } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { getMonthlyOrderCount } from "@/lib/db/queries";
import { FREE_PLAN_MONTHLY_ORDER_LIMIT, getPlanStatus, isProUnlocked } from "@/lib/plan-limits";
import { VendedorShell } from "@/components/panel/vendedor-shell";

export default async function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "restaurante") redirect("/login");

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, Number(session.sub)),
    with: { plan: true },
  });
  // Sessão de restaurante sem restaurante (ex.: excluído pelo admin) — limpar a
  // sessão antes de mandar pro /login. Só usar redirect("/login") aqui criaria
  // um loop infinito: a sessão de "restaurante" continua válida, então /login
  // mandaria de volta pra /vendedor, que mandaria de volta pra /login...
  if (!restaurant) redirect("/api/auth/logout?next=/login");

  const planStatus = getPlanStatus(restaurant.plan?.name, restaurant.planValidUntil);
  const isFree = !isProUnlocked(planStatus);
  const monthlyOrderCount = isFree
    ? await getMonthlyOrderCount(restaurant.id)
    : 0;
  const overLimit = isFree && monthlyOrderCount >= FREE_PLAN_MONTHLY_ORDER_LIMIT;

  return (
    <VendedorShell
      userName={session.name}
      restaurantName={restaurant.name}
      planName={restaurant.plan?.name ?? null}
      impersonating={await isImpersonating()}
      planStatus={planStatus}
      planValidUntil={
        restaurant.planValidUntil ? restaurant.planValidUntil.toISOString() : null
      }
      orderLimitBanner={
        overLimit
          ? { monthlyOrderCount, limit: FREE_PLAN_MONTHLY_ORDER_LIMIT }
          : null
      }
    >
      {children}
    </VendedorShell>
  );
}
