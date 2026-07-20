/**
 * Consultas de leitura que convertem as linhas do banco para os tipos
 * usados pelo frontend (ids como string, centavos → reais).
 * Use em Server Components e Route Handlers.
 */
import { desc, eq } from "drizzle-orm";
import { db } from "./index";
import { orders, restaurants } from "./schema";
import type { Order, Product, Restaurant } from "@/lib/mock/types";

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
    options: { name: string; priceCents: number }[];
  }[];
  restaurant?: { name: string; slug: string } | null;
};

export function mapOrder(o: OrderRow): Order {
  return {
    id: String(o.id),
    code: orderCode(o.id),
    restaurantId: String(o.restaurantId),
    restaurantName: o.restaurant?.name,
    restaurantSlug: o.restaurant?.slug,
    customerName: o.customerName,
    items: o.items.map((i) => ({
      productId: i.productId ? String(i.productId) : "",
      name: i.name,
      quantity: i.quantity,
      unitPrice: centsToReais(
        i.unitPriceCents + i.options.reduce((a, op) => a + op.priceCents, 0)
      ),
      notes: i.notes || undefined,
    })),
    total: centsToReais(o.totalCents),
    status: o.status,
    paymentMethod: o.paymentMethod,
    deliveryType: o.deliveryType,
    createdAt: o.createdAt.toISOString(),
  };
}

const orderWith = {
  items: { with: { options: true } },
  restaurant: { columns: { name: true, slug: true } },
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

/** Restaurante do vendedor logado (primeiro por ownerId). */
export async function getRestaurantByOwner(ownerId: number) {
  return db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, ownerId),
  });
}

export async function getRestaurantByOwnerMapped(
  ownerId: number
): Promise<(Restaurant & { primaryColor: string }) | null> {
  const row = await db.query.restaurants.findFirst({
    where: eq(restaurants.ownerId, ownerId),
    with: {
      categories: { orderBy: (c, { asc }) => [asc(c.position)] },
      plan: { columns: { name: true } },
    },
  });
  return row ? { ...mapRestaurant(row), primaryColor: row.primaryColor } : null;
}
