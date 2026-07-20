/**
 * Popula o banco com os mesmos dados dos mocks do frontend.
 * Rode com: npm run db:seed (idempotente — pula se já houver dados).
 */
import { hash } from "bcryptjs";
import { db } from "./index";
import {
  addresses,
  categories,
  groupOptions,
  optionGroups,
  orderItems,
  orders,
  plans,
  products,
  restaurants,
  users,
} from "./schema";
import {
  orders as mockOrders,
  plans as mockPlans,
  products as mockProducts,
  restaurants as mockRestaurants,
  users as mockUsers,
} from "../mock/data";

const DEMO_PASSWORD = "12345678";
const reaisToCents = (v: number) => Math.round(v * 100);

const ownerByRestaurant: Record<string, string> = { r1: "u2", r2: "u3", r3: "u4" };
const planIdByName: Record<string, string> = {
  "Grátis": "gratis",
  "Pro": "pro",
  "Premium": "premium",
};

async function main() {
  const existing = await db.select({ id: plans.id }).from(plans).limit(1);
  if (existing.length > 0) {
    console.log("Banco já populado — seed ignorado.");
    process.exit(0);
  }

  const passwordHash = await hash(DEMO_PASSWORD, 10);

  // Planos
  const newPlans = await db
    .insert(plans)
    .values(
      mockPlans.map((p) => ({
        name: p.name,
        priceCents: reaisToCents(p.price),
        description: p.description,
        features: p.features,
        highlighted: p.highlighted ?? false,
      }))
    )
    .returning();
  const planIdByMockId = new Map(mockPlans.map((p, i) => [p.id, newPlans[i].id]));

  // Usuários
  const newUsers = await db
    .insert(users)
    .values(
      mockUsers.map((u) => ({
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      }))
    )
    .returning();
  const userIdByMockId = new Map(mockUsers.map((u, i) => [u.id, newUsers[i].id]));
  const userIdByName = new Map(newUsers.map((u) => [u.name, u.id]));

  // Restaurantes
  const newRestaurants = await db
    .insert(restaurants)
    .values(
      mockRestaurants.map((r) => ({
        ownerId: userIdByMockId.get(ownerByRestaurant[r.id])!,
        planId: planIdByMockId.get(planIdByName[r.plan])
          ? planIdByMockId.get(planIdByName[r.plan])!
          : null,
        slug: r.slug,
        name: r.name,
        description: r.description,
        segment: r.segment,
        logoUrl: r.logo,
        coverUrl: r.cover,
        address: r.address,
        phone: r.phone,
        openingHours: r.openingHours,
        isOpen: r.isOpen,
        deliveryFeeCents: reaisToCents(r.deliveryFee),
        minOrderCents: reaisToCents(r.minOrder),
        deliveryTime: r.deliveryTime,
        rating: r.rating.toFixed(1),
        status: r.status,
      }))
    )
    .returning();
  const restaurantIdByMockId = new Map(
    mockRestaurants.map((r, i) => [r.id, newRestaurants[i].id])
  );

  // Categorias (ids mock se repetem entre restaurantes — chave por restaurante)
  const categoryIdByMockKey = new Map<string, number>();
  for (const r of mockRestaurants) {
    const restaurantId = restaurantIdByMockId.get(r.id)!;
    const inserted = await db
      .insert(categories)
      .values(
        r.categories.map((c, i) => ({
          restaurantId,
          name: c.name,
          position: i,
        }))
      )
      .returning();
    r.categories.forEach((c, i) =>
      categoryIdByMockKey.set(`${r.id}:${c.id}`, inserted[i].id)
    );
  }

  // Produtos
  const newProducts = await db
    .insert(products)
    .values(
      mockProducts.map((p) => ({
        restaurantId: restaurantIdByMockId.get(p.restaurantId)!,
        categoryId: categoryIdByMockKey.get(`${p.restaurantId}:${p.categoryId}`)!,
        name: p.name,
        description: p.description,
        priceCents: reaisToCents(p.price),
        imageUrl: p.image,
        available: p.available,
        popular: p.popular ?? false,
      }))
    )
    .returning();
  const productIdByMockId = new Map(mockProducts.map((p, i) => [p.id, newProducts[i].id]));

  // Grupos de opções (ex.: adicionais do açaí)
  for (const p of mockProducts) {
    if (!p.optionGroups?.length) continue;
    const productId = productIdByMockId.get(p.id)!;
    for (const g of p.optionGroups) {
      const [newGroup] = await db
        .insert(optionGroups)
        .values({
          productId,
          name: g.name,
          required: g.required ?? false,
          max: g.max,
        })
        .returning();
      if (g.options.length > 0) {
        await db.insert(groupOptions).values(
          g.options.map((o) => ({
            groupId: newGroup.id,
            name: o.name,
            priceCents: reaisToCents(o.price),
          }))
        );
      }
    }
  }

  // Pedidos + itens
  for (const o of mockOrders) {
    const subtotal = o.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
    const [newOrder] = await db
      .insert(orders)
      .values({
        restaurantId: restaurantIdByMockId.get(o.restaurantId)!,
        customerId: userIdByName.get(o.customerName) ?? null,
        customerName: o.customerName,
        deliveryType: o.deliveryType,
        paymentMethod: o.paymentMethod,
        subtotalCents: reaisToCents(subtotal),
        deliveryFeeCents: o.deliveryType === "entrega" ? 790 : 0,
        totalCents: reaisToCents(o.total),
        status: o.status,
        createdAt: new Date(o.createdAt),
      })
      .returning();
    if (o.items.length > 0) {
      await db.insert(orderItems).values(
        o.items.map((i) => ({
          orderId: newOrder.id,
          productId: productIdByMockId.get(i.productId) ?? null,
          name: i.name,
          quantity: i.quantity,
          unitPriceCents: reaisToCents(i.unitPrice),
        }))
      );
    }
  }

  // Endereços da cliente Mariana
  const marianaId = userIdByName.get("Mariana Souza");
  if (marianaId) {
    await db.insert(addresses).values([
      {
        userId: marianaId,
        label: "Casa",
        address: "Rua das Acácias, 45 — Vila Mariana, São Paulo/SP",
        isMain: true,
      },
      {
        userId: marianaId,
        label: "Trabalho",
        address: "Av. Paulista, 1000 — Bela Vista, São Paulo/SP",
        isMain: false,
      },
    ]);
  }

  console.log("Seed concluído:");
  console.log(
    `  ${newPlans.length} planos · ${newUsers.length} usuários · ${newRestaurants.length} restaurantes · ${newProducts.length} produtos · ${mockOrders.length} pedidos`
  );
  console.log(`  Senha de todos os usuários de demo: "${DEMO_PASSWORD}"`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
