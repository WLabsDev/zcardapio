import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession, isImpersonating } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { getMonthlyOrderCount } from "@/lib/db/queries";
import { FREE_PLAN_MONTHLY_ORDER_LIMIT, isFreePlan } from "@/lib/plan-limits";
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
  if (!restaurant) redirect("/login");

  const isFree = isFreePlan(restaurant.plan?.name);
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
