import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";
import { getRestaurantByOwnerMapped } from "@/lib/db/queries";
import { requireVendedorRestaurant } from "@/lib/vendedor";

const reaisToCents = (v: number) => Math.round(v * 100);

// Aceita URL completa ou caminho local gerado pelo upload (/uploads/...)
const imageUrl = z.union([z.url(), z.string().regex(/^\/uploads\/[\w.-]+$/)]);

const putSchema = z.object({
  slug: z
    .string()
    .min(3, "O endereço precisa de ao menos 3 caracteres.")
    .max(80)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use apenas letras minúsculas, números e hífens."
    )
    .optional(),
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  openingHours: z.string().max(120).optional(),
  isOpen: z.boolean().optional(),
  deliveryFee: z.number().min(0).optional(),
  minOrder: z.number().min(0).optional(),
  deliveryTime: z.string().max(40).optional(),
  logo: imageUrl.optional(),
  cover: imageUrl.optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida.")
    .optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "restaurante") {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }
  const restaurant = await getRestaurantByOwnerMapped(Number(session.sub));
  if (!restaurant) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }
  return Response.json({ restaurant });
}

export async function PUT(request: Request) {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (d.slug !== undefined && d.slug !== restaurant.slug) {
    const taken = await db.query.restaurants.findFirst({
      where: eq(restaurants.slug, d.slug),
      columns: { id: true },
    });
    if (taken) {
      return Response.json(
        { message: "Este endereço já está em uso por outro restaurante." },
        { status: 409 }
      );
    }
  }

  await db
    .update(restaurants)
    .set({
      ...(d.slug !== undefined && { slug: d.slug }),
      ...(d.name !== undefined && { name: d.name }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.phone !== undefined && { phone: d.phone }),
      ...(d.address !== undefined && { address: d.address }),
      ...(d.openingHours !== undefined && { openingHours: d.openingHours }),
      ...(d.isOpen !== undefined && { isOpen: d.isOpen }),
      ...(d.deliveryFee !== undefined && {
        deliveryFeeCents: reaisToCents(d.deliveryFee),
      }),
      ...(d.minOrder !== undefined && {
        minOrderCents: reaisToCents(d.minOrder),
      }),
      ...(d.deliveryTime !== undefined && { deliveryTime: d.deliveryTime }),
      ...(d.logo !== undefined && { logoUrl: d.logo }),
      ...(d.cover !== undefined && { coverUrl: d.cover }),
      ...(d.primaryColor !== undefined && { primaryColor: d.primaryColor }),
    })
    .where(eq(restaurants.id, restaurant.id));

  return Response.json({ ok: true });
}
