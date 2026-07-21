import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reaisToCents = (v: number) => Math.round(v * 100);

const putSchema = z.object({
  name: z.string().min(2, "Informe o nome da região.").max(80),
  fee: z.number().min(0, "Taxa inválida."),
});

type Ctx = { params: Promise<{ id: string }> };

async function parseId(params: Ctx["params"]) {
  const { id } = await params;
  const zoneId = Number(id);
  return Number.isInteger(zoneId) ? zoneId : null;
}

export async function PUT(request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const zoneId = await parseId(params);
  if (!zoneId) {
    return Response.json({ message: "Região inválida." }, { status: 400 });
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
    .update(deliveryZones)
    .set({ name: parsed.data.name.trim(), feeCents: reaisToCents(parsed.data.fee) })
    .where(
      and(
        eq(deliveryZones.id, zoneId),
        eq(deliveryZones.restaurantId, restaurant.id)
      )
    )
    .returning({ id: deliveryZones.id });

  if (!updated) {
    return Response.json({ message: "Região não encontrada." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;
  const zoneId = await parseId(params);
  if (!zoneId) {
    return Response.json({ message: "Região inválida." }, { status: 400 });
  }

  const [deleted] = await db
    .delete(deliveryZones)
    .where(
      and(
        eq(deliveryZones.id, zoneId),
        eq(deliveryZones.restaurantId, restaurant.id)
      )
    )
    .returning({ id: deliveryZones.id });

  if (!deleted) {
    return Response.json({ message: "Região não encontrada." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
