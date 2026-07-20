import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
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
  const session = await getSession();

  return (
    <MenuView
      restaurant={restaurant}
      products={products}
      user={session ? { name: session.name, role: session.role } : null}
    />
  );
}
