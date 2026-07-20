import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getProductsByRestaurantDb,
  getRestaurantBySlugDb,
} from "@/lib/db/queries";
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

  return (
    <MenuView
      restaurant={restaurant}
      products={products}
      user={session ? { name: session.name, role: session.role } : null}
    />
  );
}
