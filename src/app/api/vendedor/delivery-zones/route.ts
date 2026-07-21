import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { deliveryZones } from "@/lib/db/schema";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reaisToCents = (v: number) => Math.round(v * 100);

const postSchema = z.object({
  name: z.string().min(2, "Informe o nome da região.").max(80),
  fee: z.number().min(0, "Taxa inválida."),
});

export async function GET() {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const zones = await db.query.deliveryZones.findMany({
    where: eq(deliveryZones.restaurantId, restaurant.id),
    orderBy: (z, { asc }) => [asc(z.id)],
  });
  return Response.json({
    zones: zones.map((z) => ({
      id: String(z.id),
      name: z.name,
      fee: z.feeCents / 100,
    })),
  });
}

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

  const [created] = await db
    .insert(deliveryZones)
    .values({
      restaurantId: restaurant.id,
      name: parsed.data.name.trim(),
      feeCents: reaisToCents(parsed.data.fee),
    })
    .returning({ id: deliveryZones.id });

  return Response.json({ id: String(created.id) }, { status: 201 });
}
