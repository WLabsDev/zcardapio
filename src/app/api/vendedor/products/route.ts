import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { getProductsByRestaurantDb } from "@/lib/db/queries";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const reaisToCents = (v: number) => Math.round(v * 100);

const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto.").max(120),
  description: z.string().max(500).default(""),
  price: z.number().positive("Informe um preço válido."),
  categoryId: z.coerce.number().int().positive(),
  image: z
    .union([z.url(), z.string().regex(/^\/uploads\/[\w.-]+$/), z.literal("")])
    .default(""),
  popular: z.boolean().optional(),
  available: z.boolean().optional(),
  trackStock: z.boolean().optional(),
  stock: z.number().int().min(0).nullable().optional(),
});

export const GET = apiHandler(async () => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const [items, cats] = await Promise.all([
    getProductsByRestaurantDb(restaurant.id),
    db.query.categories.findMany({
      where: eq(categories.restaurantId, restaurant.id),
      orderBy: (c, { asc }) => [asc(c.position)],
    }),
  ]);
  return Response.json({
    products: items,
    categories: cats.map((c) => ({ id: String(c.id), name: c.name })),
  });
});

export const POST = apiHandler(async (request: Request) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, d.categoryId),
      eq(categories.restaurantId, restaurant.id)
    ),
  });
  if (!category) {
    return Response.json({ message: "Categoria inválida." }, { status: 400 });
  }

  const [created] = await db
    .insert(products)
    .values({
      restaurantId: restaurant.id,
      categoryId: d.categoryId,
      name: d.name,
      description: d.description,
      priceCents: reaisToCents(d.price),
      imageUrl: d.image,
      popular: d.popular ?? false,
      available: d.available ?? true,
      trackStock: d.trackStock ?? false,
      stock: d.stock ?? null,
    })
    .returning({ id: products.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
});
