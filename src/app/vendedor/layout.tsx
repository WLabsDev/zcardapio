import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { VendedorShell } from "@/components/panel/vendedor-shell";

export default async function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "restaurante") redirect("/login");

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, Number(session.sub)),
    with: { plan: true },
  });
  if (!restaurant) redirect("/login");

  return (
    <VendedorShell
      userName={session.name}
      restaurantName={restaurant.name}
      planName={restaurant.plan?.name ?? null}
    >
      {children}
    </VendedorShell>
  );
}
