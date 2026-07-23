import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reorderSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  ids: z
    .array(z.coerce.number().int().positive())
    .min(1, "Informe os produtos."),
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
  const { categoryId, ids } = parsed.data;

  // A categoria precisa ser do restaurante.
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, categoryId),
      eq(categories.restaurantId, restaurant.id)
    ),
    columns: { id: true },
  });
  if (!category) {
    return Response.json({ message: "Categoria não encontrada." }, { status: 404 });
  }

  // Todos os produtos precisam ser do restaurante e da categoria informada.
  const existing = await db.query.products.findMany({
    where: inArray(products.id, ids),
    columns: { id: true, restaurantId: true, categoryId: true },
  });
  const valid = existing.filter(
    (p) => p.restaurantId === restaurant.id && p.categoryId === categoryId
  );
  if (valid.length !== ids.length) {
    return Response.json(
      { message: "Alguns produtos não pertencem a esta categoria." },
      { status: 400 }
    );
  }

  await db.transaction(async (tx) => {
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(products)
        .set({ position: i })
        .where(eq(products.id, ids[i]));
    }
  });

  return Response.json({ ok: true });
}
