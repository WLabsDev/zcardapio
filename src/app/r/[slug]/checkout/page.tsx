import { notFound } from "next/navigation";
import { getRestaurantBySlug } from "@/lib/mock/data";
import { CheckoutView } from "./checkout-view";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return <CheckoutView restaurant={restaurant} />;
}
