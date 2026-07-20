import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

const patchSchema = z.object({
  status: z.enum(["ativo", "pendente", "bloqueado"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return Response.json({ message: "Restaurante inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Status inválido." }, { status: 400 });
  }

  const [updated] = await db
    .update(restaurants)
    .set({ status: parsed.data.status })
    .where(eq(restaurants.id, restaurantId))
    .returning({ id: restaurants.id, status: restaurants.status });

  if (!updated) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }
  return Response.json({ restaurant: updated });
}
