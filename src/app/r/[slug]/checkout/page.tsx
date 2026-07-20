import { notFound } from "next/navigation";
import { getRestaurantBySlugDb } from "@/lib/db/queries";
import { CheckoutView } from "./checkout-view";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlugDb(slug);
  if (!restaurant) notFound();

  return <CheckoutView restaurant={restaurant} />;
}
