import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { getSession, startImpersonation } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { apiHandler } from "@/lib/api";

const bodySchema = z.discriminatedUnion("target", [
  z.object({ target: z.literal("cliente") }),
  z.object({ target: z.literal("restaurante"), restaurantId: z.number().int() }),
]);

export const POST = apiHandler(async (request: Request) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Dados inválidos." }, { status: 400 });
  }

  if (parsed.data.target === "cliente") {
    // Usa o próprio id do admin (linha válida em users) para satisfazer a FK
    // de orders/addresses — só o papel na sessão muda para "cliente".
    const session = await getSession();
    if (!session) {
      return Response.json({ message: "Sessão inválida." }, { status: 401 });
    }
    await startImpersonation({
      id: Number(session.sub),
      name: session.name,
      email: session.email || null,
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
});
