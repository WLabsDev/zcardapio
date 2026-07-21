import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { groupOptions } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reaisToCents = (v: number) => Math.round(v * 100);

const putSchema = z.object({
  name: z.string().min(1, "Informe o nome da opção.").max(80),
  price: z.number().min(0, "Preço inválido."),
});

type Ctx = { params: Promise<{ id: string }> };

async function getOptionWithOwnership(optionId: number, restaurantId: number) {
  const option = await db.query.groupOptions.findFirst({
    where: eq(groupOptions.id, optionId),
    with: {
      group: {
        with: { product: { columns: { restaurantId: true } } },
      },
    },
  });
  if (!option || option.group.product.restaurantId !== restaurantId) return null;
  return option;
}

export async function PUT(request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const optionId = Number(id);
  if (!Number.isInteger(optionId)) {
    return Response.json({ message: "Opção inválida." }, { status: 400 });
  }

  const option = await getOptionWithOwnership(optionId, restaurant.id);
  if (!option) {
    return Response.json({ message: "Opção não encontrada." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  await db
    .update(groupOptions)
    .set({
      name: parsed.data.name.trim(),
      priceCents: reaisToCents(parsed.data.price),
    })
    .where(eq(groupOptions.id, optionId));

  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const { id } = await params;
  const optionId = Number(id);
  if (!Number.isInteger(optionId)) {
    return Response.json({ message: "Opção inválida." }, { status: 400 });
  }

  const option = await getOptionWithOwnership(optionId, restaurant.id);
  if (!option) {
    return Response.json({ message: "Opção não encontrada." }, { status: 404 });
  }

  await db.delete(groupOptions).where(eq(groupOptions.id, optionId));

  return Response.json({ ok: true });
}
