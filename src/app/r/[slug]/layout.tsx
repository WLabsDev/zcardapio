import { CartProvider } from "@/components/cart/cart-context";

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CartProvider restaurantSlug={slug}>{children}</CartProvider>;
}
