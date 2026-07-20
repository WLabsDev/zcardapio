import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const postSchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria.").max(80),
});

export async function POST(request: Request) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const existing = await db.query.categories.findMany({
    where: eq(categories.restaurantId, restaurant.id),
    columns: { position: true },
  });
  const [created] = await db
    .insert(categories)
    .values({
      restaurantId: restaurant.id,
      name: parsed.data.name.trim(),
      position: existing.length,
    })
    .returning({ id: categories.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
}
