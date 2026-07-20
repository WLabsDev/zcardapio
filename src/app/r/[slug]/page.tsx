import { notFound } from "next/navigation";
import { getProductsByRestaurant, getRestaurantBySlug } from "@/lib/mock/data";
import { MenuView } from "./menu-view";

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = getRestaurantBySlug(slug);
  if (!restaurant) notFound();
  const products = getProductsByRestaurant(restaurant.id);

  return <MenuView restaurant={restaurant} products={products} />;
}
