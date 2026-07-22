import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { startImpersonation } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";

const bodySchema = z.discriminatedUnion("target", [
  z.object({ target: z.literal("cliente") }),
  z.object({ target: z.literal("restaurante"), restaurantId: z.number().int() }),
]);

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Dados inválidos." }, { status: 400 });
  }

  if (parsed.data.target === "cliente") {
    await startImpersonation({
      id: 0,
      name: "Visitante (admin)",
      email: null,
      role: "cliente",
    });
    return Response.json({ redirect: "/cliente" });
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, parsed.data.restaurantId),
    with: { owner: { columns: { id: true, name: true, email: true } } },
  });
  if (!restaurant?.owner) {
    return Response.json(
      { message: "Restaurante sem dono cadastrado." },
      { status: 404 }
    );
  }

  await startImpersonation({
    id: restaurant.owner.id,
    name: restaurant.owner.name,
    email: restaurant.owner.email,
    role: "restaurante",
  });
  return Response.json({ redirect: "/vendedor" });
}
