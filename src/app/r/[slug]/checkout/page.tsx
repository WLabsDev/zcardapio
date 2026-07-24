import { notFound } from "next/navigation";
import { RestaurantThemeProvider } from "@/components/restaurant-theme-provider";
import { getDeliveryZonesDb, getRestaurantBySlugDb } from "@/lib/db/queries";
import { computeOpenState } from "@/lib/hours";
import { CheckoutView } from "./checkout-view";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mesa?: string }>;
}) {
  const { slug } = await params;
  const { mesa } = await searchParams;
  const mesaNum = mesa ? Number(mesa) : NaN;
  const tableNumber =
    Number.isInteger(mesaNum) && mesaNum > 0 ? mesaNum : null;
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
        tableNumber={tableNumber}
      />
    </>
  );
}
