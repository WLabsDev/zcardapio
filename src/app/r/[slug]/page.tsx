import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RestaurantThemeProvider } from "@/components/restaurant-theme-provider";
import {
  getMonthlyOrderCount,
  getProductsByRestaurantDb,
  getRestaurantBySlugDb,
  getReviewsByRestaurant,
} from "@/lib/db/queries";
import { computeOpenState } from "@/lib/hours";
import { getMonthlyOrderLimit, getPlanStatus } from "@/lib/plan-limits";
import { MenuView } from "./menu-view";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlugDb(slug);
  if (!restaurant) notFound();
  const products = await getProductsByRestaurantDb(Number(restaurant.id));
  const session = await getSession();
  const reviews = await getReviewsByRestaurant(
    Number(restaurant.id),
    session?.role === "cliente" ? Number(session.sub) : undefined
  );
  const openState = computeOpenState(restaurant);
  const orderLimit = getMonthlyOrderLimit(
    restaurant.plan,
    getPlanStatus(restaurant.plan, restaurant.planValidUntil)
  );
  const overLimit =
    Number.isFinite(orderLimit) &&
    (await getMonthlyOrderCount(Number(restaurant.id))) >= orderLimit;

  return (
    <>
      <RestaurantThemeProvider restaurant={restaurant} />
      <MenuView
        restaurant={restaurant}
        products={products}
        user={session ? { name: session.name, role: session.role } : null}
        initiallyOpen={openState.open && !overLimit}
        pauseMessage={
          overLimit
            ? "Este restaurante está temporariamente indisponível. Volte mais tarde!"
            : openState.pauseMessage
        }
        reviews={reviews}
      />
    </>
  );
}
