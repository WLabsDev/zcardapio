import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { plans, restaurants } from "@/lib/db/schema";
import { getRestaurantByOwnerMapped } from "@/lib/db/queries";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const reaisToCents = (v: number) => Math.round(v * 100);

// Aceita URL completa ou caminho local gerado pelo upload (/uploads/...)
const imageUrl = z.union([z.url(), z.string().regex(/^\/uploads\/[\w.-]+$/)]);

const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido.");

const dayHoursSchema = z.object({
  day: z.number().int().min(0).max(6),
  open: timeStr,
  close: timeStr,
  closed: z.boolean(),
});

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
  // Paleta de cores personalizada (hex ou vazio para usar o padrão do tema)
  headingColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  productTitleColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  bodyColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  mutedColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  bgColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  cardColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  badgeColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  badgeTextColor: z.string().regex(/^(#[0-9a-fA-F]{6})?$/, "Cor inválida.").optional(),
  // Horário inteligente
  hours: z.array(dayHoursSchema).max(7).optional(),
  pauseMessage: z.string().max(140).optional(),
  // Banner + comunicação
  bannerText: z.string().max(200).optional(),
  whatsapp: z.string().max(20).optional(),
  confirmMessage: z.string().max(300).optional(),
  pixKey: z.string().max(140).optional(),
  // Pagamentos
  paymentMethods: z.array(z.enum(["pix", "cartao", "dinheiro"])).min(1).optional(),
  // Aparência avançada
  theme: z.enum(["claro", "escuro"]).optional(),
  font: z.enum(["bricolage", "jakarta", "mono"]).optional(),
  buttonStyle: z.enum(["arredondado", "reto"]).optional(),
  // Pedidos
  acceptsScheduled: z.boolean().optional(),
  // Desativar avaliações de clientes é recurso do plano pro+.
  reviewsEnabled: z.boolean().optional(),
});

export const GET = apiHandler(async () => {
  const session = await getSession();
  if (!session || session.role !== "restaurante") {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }
  const restaurant = await getRestaurantByOwnerMapped(Number(session.sub));
  if (!restaurant) {
    return Response.json({ message: "Restaurante não encontrado." }, { status: 404 });
  }
  return Response.json({ restaurant });
});

export const PUT = apiHandler(async (request: Request) => {
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

  if (d.reviewsEnabled === false) {
    const plan = restaurant.planId
      ? await db.query.plans.findFirst({
          where: eq(plans.id, restaurant.planId),
          columns: { name: true },
        })
      : null;
    const isFree = !plan || plan.name === "Grátis";
    if (isFree) {
      return Response.json(
        {
          message:
            "Desativar avaliações é um recurso do plano Pro ou superior.",
        },
        { status: 403 }
      );
    }
  }

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
      ...(d.hours !== undefined && { hours: d.hours }),
      ...(d.pauseMessage !== undefined && { pauseMessage: d.pauseMessage }),
      ...(d.bannerText !== undefined && { bannerText: d.bannerText }),
      ...(d.whatsapp !== undefined && { whatsapp: d.whatsapp }),
      ...(d.confirmMessage !== undefined && { confirmMessage: d.confirmMessage }),
      ...(d.pixKey !== undefined && { pixKey: d.pixKey }),
      ...(d.paymentMethods !== undefined && { paymentMethods: d.paymentMethods }),
      ...(d.theme !== undefined && { theme: d.theme }),
      ...(d.font !== undefined && { font: d.font }),
      ...(d.buttonStyle !== undefined && { buttonStyle: d.buttonStyle }),
      ...(d.headingColor !== undefined && { headingColor: d.headingColor }),
      ...(d.productTitleColor !== undefined && {
        productTitleColor: d.productTitleColor,
      }),
      ...(d.bodyColor !== undefined && { bodyColor: d.bodyColor }),
      ...(d.mutedColor !== undefined && { mutedColor: d.mutedColor }),
      ...(d.bgColor !== undefined && { bgColor: d.bgColor }),
      ...(d.cardColor !== undefined && { cardColor: d.cardColor }),
      ...(d.badgeColor !== undefined && { badgeColor: d.badgeColor }),
      ...(d.badgeTextColor !== undefined && { badgeTextColor: d.badgeTextColor }),
      ...(d.acceptsScheduled !== undefined && {
        acceptsScheduled: d.acceptsScheduled,
      }),
      ...(d.reviewsEnabled !== undefined && {
        reviewsEnabled: d.reviewsEnabled,
      }),
    })
    .where(eq(restaurants.id, restaurant.id));

  return Response.json({ ok: true });
});
