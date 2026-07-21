import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RestaurantThemeProvider } from "@/components/restaurant-theme-provider";
import {
  getProductsByRestaurantDb,
  getRestaurantBySlugDb,
} from "@/lib/db/queries";
import { computeOpenState } from "@/lib/hours";
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
  const openState = computeOpenState(restaurant);

  return (
    <>
      <RestaurantThemeProvider restaurant={restaurant} />
      <MenuView
        restaurant={restaurant}
        products={products}
        user={session ? { name: session.name, role: session.role } : null}
        initiallyOpen={openState.open}
        pauseMessage={openState.pauseMessage}
      />
    </>
  );
}
