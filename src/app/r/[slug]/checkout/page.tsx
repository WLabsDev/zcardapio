import { notFound } from "next/navigation";
import { RestaurantThemeProvider } from "@/components/restaurant-theme-provider";
import { getDeliveryZonesDb, getRestaurantBySlugDb } from "@/lib/db/queries";
import { computeOpenState } from "@/lib/hours";
import { CheckoutView } from "./checkout-view";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlugDb(slug);
  if (!restaurant) notFound();
  const openState = computeOpenState(restaurant);
  const zones = await getDeliveryZonesDb(Number(restaurant.id));

  return (
    <>
      <RestaurantThemeProvider restaurant={restaurant} />
      <CheckoutView
        restaurant={restaurant}
        initiallyOpen={openState.open}
        zones={zones}
      />
    </>
  );
}
