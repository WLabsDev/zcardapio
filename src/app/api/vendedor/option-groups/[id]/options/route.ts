import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { groupOptions, optionGroups } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const reaisToCents = (v: number) => Math.round(v * 100);

const postSchema = z.object({
  name: z.string().min(1, "Informe o nome da opção.").max(80),
  price: z.number().min(0, "Preço inválido.").default(0),
  trackStock: z.boolean().optional(),
  stock: z.number().int().min(0).nullable().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export const POST = apiHandler(async (request: Request, { params }: Ctx) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const groupId = Number(id);
  if (!Number.isInteger(groupId)) {
    return Response.json({ message: "Grupo inválido." }, { status: 400 });
  }

  const group = await db.query.optionGroups.findFirst({
    where: eq(optionGroups.id, groupId),
    with: { product: { columns: { restaurantId: true } } },
  });
  if (!group || group.product.restaurantId !== restaurant.id) {
    return Response.json({ message: "Grupo não encontrado." }, { status: 404 });
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
    .insert(groupOptions)
    .values({
      groupId,
      name: parsed.data.name.trim(),
      priceCents: reaisToCents(parsed.data.price),
      trackStock: parsed.data.trackStock ?? false,
      stock: parsed.data.stock ?? null,
    })
    .returning({ id: groupOptions.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
});
