import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reorderSchema = z.object({
  ids: z
    .array(z.coerce.number().int().positive())
    .min(1, "Informe as categorias."),
});

export async function PATCH(request: Request) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const ids = parsed.data.ids;

  // Valida que todas as categorias pertencem ao restaurante
  const existing = await db.query.categories.findMany({
    where: inArray(categories.id, ids),
    columns: { id: true, restaurantId: true },
  });

  const validIds = new Set(
    existing.filter((c) => c.restaurantId === restaurant.id).map((c) => c.id)
  );

  if (validIds.size !== ids.length) {
    return Response.json(
      { message: "Algumas categorias não pertencem ao restaurante." },
      { status: 400 }
    );
  }

  // Atualiza a posição de cada categoria
  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(categories)
        .set({ position: i })
        .where(eq(categories.id, ids[i]));
    }
  });

  return Response.json({ ok: true });
}
