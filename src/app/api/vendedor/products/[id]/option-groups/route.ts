import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { optionGroups, products } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const postSchema = z.object({
  name: z.string().min(2, "Informe o nome do grupo.").max(80),
  required: z.boolean().default(false),
  max: z.number().int().min(1).max(20).default(1),
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return Response.json({ message: "Produto inválido." }, { status: 400 });
  }

  const product = await db.query.products.findFirst({
    where: and(
      eq(products.id, productId),
      eq(products.restaurantId, restaurant.id)
    ),
    columns: { id: true },
  });
  if (!product) {
    return Response.json({ message: "Produto não encontrado." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(optionGroups)
    .values({
      productId,
      name: parsed.data.name.trim(),
      required: parsed.data.required,
      max: parsed.data.max,
    })
    .returning({ id: optionGroups.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
}
