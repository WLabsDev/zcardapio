import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reaisToCents = (v: number) => Math.round(v * 100);

const putSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto.").max(120),
  description: z.string().max(500).default(""),
  price: z.number().positive("Informe um preço válido."),
  categoryId: z.coerce.number().int().positive(),
  image: z.union([z.url(), z.literal("")]).default(""),
  popular: z.boolean().optional(),
});

const patchSchema = z.object({ available: z.boolean() });

async function parseProductId(params: Promise<{ id: string }>) {
  const { id } = await params;
  const productId = Number(id);
  return Number.isInteger(productId) ? productId : null;
}

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const productId = await parseProductId(params);
  if (!productId) {
    return Response.json({ message: "Produto inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
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

  const [updated] = await db
    .update(products)
    .set({
      name: d.name,
      description: d.description,
      priceCents: reaisToCents(d.price),
      categoryId: d.categoryId,
      imageUrl: d.image,
      ...(d.popular !== undefined && { popular: d.popular }),
    })
    .where(
      and(eq(products.id, productId), eq(products.restaurantId, restaurant.id))
    )
    .returning({ id: products.id });

  if (!updated) {
    return Response.json({ message: "Produto não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const productId = await parseProductId(params);
  if (!productId) {
    return Response.json({ message: "Produto inválido." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Dados inválidos." }, { status: 400 });
  }

  const [updated] = await db
    .update(products)
    .set({ available: parsed.data.available })
    .where(
      and(eq(products.id, productId), eq(products.restaurantId, restaurant.id))
    )
    .returning({ id: products.id });

  if (!updated) {
    return Response.json({ message: "Produto não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const productId = await parseProductId(params);
  if (!productId) {
    return Response.json({ message: "Produto inválido." }, { status: 400 });
  }

  const [deleted] = await db
    .delete(products)
    .where(
      and(eq(products.id, productId), eq(products.restaurantId, restaurant.id))
    )
    .returning({ id: products.id });

  if (!deleted) {
    return Response.json({ message: "Produto não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
