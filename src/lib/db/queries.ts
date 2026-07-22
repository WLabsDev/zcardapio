/**
 * Consultas de leitura que convertem as linhas do banco para os tipos
 * usados pelo frontend (ids como string, centavos → reais).
 * Use em Server Components e Route Handlers.
 */
import { avg, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { deliveryZones, orders, restaurants, reviews } from "./schema";
import type {
  DeliveryZone,
  Order,
  Product,
  Restaurant,
  Review,
} from "@/lib/mock/types";

const centsToReais = (v: number) => v / 100;

type RestaurantRow = typeof restaurants.$inferSelect & {
  categories: { id: number; name: string }[];
  plan: { name: string } | null;
};

function mapRestaurant(r: RestaurantRow): Restaurant {
  return {
    id: String(r.id),
    slug: r.slug,
    name: r.name,
    description: r.description,
    segment: r.segment,
    logo: r.logoUrl,
    cover: r.coverUrl,
    address: r.address,
    phone: r.phone,
    openingHours: r.openingHours,
    isOpen: r.isOpen,
    deliveryFee: centsToReais(r.deliveryFeeCents),
    minOrder: centsToReais(r.minOrderCents),
    deliveryTime: r.deliveryTime,
    rating: Number(r.rating),
    categories: r.categories.map((c) => ({ id: String(c.id), name: c.name })),
    plan: r.plan?.name ?? "Grátis",
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    primaryColor: r.primaryColor,
    hours: r.hours,
    pauseMessage: r.pauseMessage,
    bannerText: r.bannerText,
    whatsapp: r.whatsapp,
    confirmMessage: r.confirmMessage,
    paymentMethods: r.paymentMethods,
    theme: r.theme as Restaurant["theme"],
    font: r.font as Restaurant["font"],
    buttonStyle: r.buttonStyle as Restaurant["buttonStyle"],
    headingColor: r.headingColor,
    productTitleColor: r.productTitleColor,
    bodyColor: r.bodyColor,
    mutedColor: r.mutedColor,
    bgColor: r.bgColor,
    cardColor: r.cardColor,
    badgeColor: r.badgeColor,
    badgeTextColor: r.badgeTextColor,
    acceptsScheduled: r.acceptsScheduled,
  };
}

export async function getRestaurantBySlugDb(slug: string) {
  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
    with: {
      categories: { orderBy: (c, { asc }) => [asc(c.position)] },
      plan: { columns: { name: true } },
    },
  });
  return row ? mapRestaurant(row) : null;
}

export async function listActiveRestaurants(): Promise<Restaurant[]> {
  const rows = await db.query.restaurants.findMany({
    where: eq(restaurants.status, "ativo"),
    with: {
      categories: { orderBy: (c, { asc }) => [asc(c.position)] },
      plan: { columns: { name: true } },
    },
    orderBy: (r, { asc }) => [asc(r.id)],
  });
  return rows.map(mapRestaurant);
}

export async function getProductsByRestaurantDb(
  restaurantId: number
): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where: (p, { eq }) => eq(p.restaurantId, restaurantId),
    with: { optionGroups: { with: { options: true } } },
    orderBy: (p, { asc }) => [asc(p.id)],
  });
  return rows.map((p) => ({
    id: String(p.id),
    restaurantId: String(p.restaurantId),
    categoryId: String(p.categoryId),
    name: p.name,
    description: p.description,
    price: centsToReais(p.priceCents),
    image: p.imageUrl,
    available: p.available,
    popular: p.popular,
    optionGroups:
      p.optionGroups.length > 0
        ? p.optionGroups.map((g) => ({
            id: String(g.id),
            name: g.name,
            required: g.required,
            max: g.max,
            options: g.options.map((o) => ({
              id: String(o.id),
              name: o.name,
              price: centsToReais(o.priceCents),
            })),
          }))
        : undefined,
  }));
}

export async function listPlans() {
  const rows = await db.query.plans.findMany({
    orderBy: (p, { asc }) => [asc(p.priceCents)],
  });
  return rows.map((p) => ({
    id: String(p.id),
    name: p.name,
    price: p.priceCents / 100,
    description: p.description,
    features: p.features,
    highlighted: p.highlighted,
  }));
}

export function orderCode(id: number) {
  return `#${String(id).padStart(4, "0")}`;
}

type OrderRow = typeof orders.$inferSelect & {
  items: {
    productId: number | null;
    name: string;
    quantity: number;
    unitPriceCents: number;
    notes: string;
    options: { groupName: string; name: string; priceCents: number }[];
  }[];
  restaurant?: { name: string; slug: string } | null;
  review?: { id: number } | null;
};

export function mapOrder(o: OrderRow): Order {
  return {
    id: String(o.id),
    code: orderCode(o.id),
    restaurantId: String(o.restaurantId),
    restaurantName: o.restaurant?.name,
    restaurantSlug: o.restaurant?.slug,
    customerName: o.customerName,
    customerPhone: o.customerPhone || undefined,
    items: o.items.map((i) => ({
      productId: i.productId ? String(i.productId) : "",
      name: i.name,
      quantity: i.quantity,
      unitPrice: centsToReais(
        i.unitPriceCents + i.options.reduce((a, op) => a + op.priceCents, 0)
      ),
      notes: i.notes || undefined,
      options:
        i.options.length > 0
          ? i.options.map((op) => ({
              groupName: op.groupName,
              name: op.name,
              price: centsToReais(op.priceCents),
            }))
          : undefined,
    })),
    subtotal: centsToReais(o.subtotalCents),
    deliveryFee: centsToReais(o.deliveryFeeCents),
    discount: o.discountCents > 0 ? centsToReais(o.discountCents) : undefined,
    couponCode: o.couponCode || undefined,
    total: centsToReais(o.totalCents),
    status: o.status,
    paymentMethod: o.paymentMethod,
    deliveryType: o.deliveryType,
    address: o.address || undefined,
    zoneName: o.zoneName || undefined,
    scheduledFor: o.scheduledFor ? o.scheduledFor.toISOString() : undefined,
    createdAt: o.createdAt.toISOString(),
    reviewed: o.review !== undefined ? Boolean(o.review) : undefined,
  };
}

const orderWith = {
  items: { with: { options: true } },
  restaurant: { columns: { name: true, slug: true } },
  review: { columns: { id: true } },
} as const;

export async function getOrdersByCustomer(customerId: number): Promise<Order[]> {
  const rows = await db.query.orders.findMany({
    where: eq(orders.customerId, customerId),
    with: orderWith,
    orderBy: [desc(orders.createdAt)],
  });
  return rows.map(mapOrder);
}

export async function getOrdersByRestaurant(
  restaurantId: number
): Promise<Order[]> {
  const rows = await db.query.orders.findMany({
    where: eq(orders.restaurantId, restaurantId),
    with: orderWith,
    orderBy: [desc(orders.createdAt)],
  });
  return rows.map(mapOrder);
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: orderWith,
  });
  return row ? mapOrder(row) : null;
}

/** Cria a avaliação de um pedido e recalcula a média (rating) do restaurante. */
export async function createReview(input: {
  restaurantId: number;
  orderId: number;
  customerId: number | null;
  customerName: string;
  rating: number;
  comment: string;
}) {
  const [created] = await db
    .insert(reviews)
    .values({
      restaurantId: input.restaurantId,
      orderId: input.orderId,
      customerId: input.customerId,
      customerName: input.customerName,
      rating: input.rating,
      comment: input.comment,
    })
    .returning();

  const [agg] = await db
    .select({ avgRating: avg(reviews.rating) })
    .from(reviews)
    .where(eq(reviews.restaurantId, input.restaurantId));

  await db
    .update(restaurants)
    .set({ rating: String(Number(agg?.avgRating ?? 0).toFixed(1)) })
    .where(eq(restaurants.id, input.restaurantId));

  return created;
}

export async function getReviewsByRestaurant(
  restaurantId: number
): Promise<Review[]> {
  const rows = await db.query.reviews.findMany({
    where: eq(reviews.restaurantId, restaurantId),
    orderBy: [desc(reviews.createdAt)],
  });
  return rows.map((r) => ({
    id: String(r.id),
    restaurantId: String(r.restaurantId),
    orderId: String(r.orderId),
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment || undefined,
    createdAt: r.createdAt.toISOString(),
  }));
}

/** Restaurante do vendedor logado (primeiro por ownerId). */
export async function getRestaurantByOwner(ownerId: number) {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, ownerId),
  });
}

export async function getRestaurantByOwnerMapped(
  ownerId: number
): Promise<Restaurant | null> {
  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, ownerId),
    with: {
      categories: { orderBy: (c, { asc }) => [asc(c.position)] },
      plan: { columns: { name: true } },
    },
  });
  return row ? mapRestaurant(row) : null;
}

export async function getDeliveryZonesDb(
  restaurantId: number
): Promise<DeliveryZone[]> {
  const rows = await db.query.deliveryZones.findMany({
    where: eq(deliveryZones.restaurantId, restaurantId),
    orderBy: (z, { asc }) => [asc(z.id)],
  });
  return rows.map((z) => ({
    id: String(z.id),
    name: z.name,
    fee: centsToReais(z.feeCents),
  }));
}
