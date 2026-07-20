import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const putSchema = z.object({
  name: z.string().min(2, "Informe o nome da categoria.").max(80),
});

type Ctx = { params: Promise<{ id: string }> };

async function parseCategoryId(params: Ctx["params"]) {
  const { id } = await params;
  const categoryId = Number(id);
  return Number.isInteger(categoryId) ? categoryId : null;
}

export async function PUT(request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const categoryId = await parseCategoryId(params);
  if (!categoryId) {
    return Response.json({ message: "Categoria inválida." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(categories)
    .set({ name: parsed.data.name.trim() })
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.restaurantId, restaurant.id)
      )
    )
    .returning({ id: categories.id });

  if (!updated) {
    return Response.json({ message: "Categoria não encontrada." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const categoryId = await parseCategoryId(params);
  if (!categoryId) {
    return Response.json({ message: "Categoria inválida." }, { status: 400 });
  }

  const hasProducts = await db.query.products.findFirst({
    where: and(
      eq(products.categoryId, categoryId),
      eq(products.restaurantId, restaurant.id)
    ),
    columns: { id: true },
  });
  if (hasProducts) {
    return Response.json(
      { message: "Mova ou exclua os produtos desta categoria antes de removê-la." },
      { status: 409 }
    );
  }

  const [deleted] = await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.restaurantId, restaurant.id)
      )
    )
    .returning({ id: categories.id });

  if (!deleted) {
    return Response.json({ message: "Categoria não encontrada." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
