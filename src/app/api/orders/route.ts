import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItemOptions, orderItems, orders, products, restaurants } from "@/lib/db/schema";
import {
  getOrdersByCustomer,
  getOrdersByRestaurant,
  getRestaurantByOwner,
  orderCode,
} from "@/lib/db/queries";

const createOrderSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  customerName: z.string().min(2, "Informe seu nome."),
  customerPhone: z.string().min(8, "Informe um telefone válido."),
  deliveryType: z.enum(["entrega", "retirada"]),
  address: z.string().default(""),
  paymentMethod: z.enum(["pix", "cartao", "dinheiro"]),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
        notes: z.string().max(500).optional(),
        options: z
          .array(z.object({ groupName: z.string(), name: z.string() }))
          .default([]),
      })
    )
    .min(1, "O carrinho está vazio."),
});

const PAYMENT_LABEL: Record<string, string> = {
  pix: "Pix",
  cartao: "Cartão na entrega",
  dinheiro: "Dinheiro",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.deliveryType === "entrega" && data.address.trim().length < 5) {
    return Response.json(
      { message: "Informe o endereço de entrega." },
      { status: 400 }
    );
  }

  const restaurant = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, data.restaurantId),
  });
  if (!restaurant || restaurant.status !== "ativo") {
    return Response.json(
      { message: "Restaurante não encontrado." },
      { status: 404 }
    );
  }
  if (!restaurant.isOpen) {
    return Response.json(
      { message: "O restaurante está fechado no momento." },
      { status: 409 }
    );
  }

  // Preços sempre do banco — nunca do cliente.
  const productRows = await db.query.products.findMany({
    where: inArray(
      products.id,
      data.items.map((i) => i.productId)
    ),
    with: { optionGroups: { with: { options: true } } },
  });
  const productById = new Map(productRows.map((p) => [p.id, p]));

  type PricedOption = { groupName: string; name: string; priceCents: number };
  const pricedItems: {
    productId: number;
    name: string;
    quantity: number;
    unitPriceCents: number;
    notes: string;
    options: PricedOption[];
  }[] = [];

  for (const item of data.items) {
    const product = productById.get(item.productId);
    if (
      !product ||
      product.restaurantId !== restaurant.id ||
      !product.available
    ) {
      return Response.json(
        { message: "Um dos produtos do carrinho não está mais disponível." },
        { status: 409 }
      );
    }
    const options: PricedOption[] = [];
    for (const chosen of item.options) {
      const group = product.optionGroups.find((g) => g.name === chosen.groupName);
      const option = group?.options.find((o) => o.name === chosen.name);
      if (!option) {
        return Response.json(
          { message: `Opção inválida em ${product.name}.` },
          { status: 400 }
        );
      }
      options.push({
        groupName: chosen.groupName,
        name: option.name,
        priceCents: option.priceCents,
      });
    }
    pricedItems.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
      notes: item.notes ?? "",
      options,
    });
  }

  const subtotalCents = pricedItems.reduce(
    (acc, i) =>
      acc +
      (i.unitPriceCents + i.options.reduce((a, o) => a + o.priceCents, 0)) *
        i.quantity,
    0
  );
  const deliveryFeeCents =
    data.deliveryType === "entrega" ? restaurant.deliveryFeeCents : 0;

  if (subtotalCents < restaurant.minOrderCents) {
    return Response.json(
      { message: "O pedido não atinge o valor mínimo do restaurante." },
      { status: 400 }
    );
  }

  const session = await getSession();

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        restaurantId: restaurant.id,
        customerId:
          session?.role === "cliente" ? Number(session.sub) : null,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        address: data.deliveryType === "entrega" ? data.address.trim() : "",
        paymentMethod: PAYMENT_LABEL[data.paymentMethod],
        subtotalCents,
        deliveryFeeCents,
        totalCents: subtotalCents + deliveryFeeCents,
      })
      .returning();

    for (const item of pricedItems) {
      const [createdItem] = await tx
        .insert(orderItems)
        .values({
          orderId: created.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          notes: item.notes,
        })
        .returning();
      if (item.options.length > 0) {
        await tx.insert(orderItemOptions).values(
          item.options.map((o) => ({
            orderItemId: createdItem.id,
            groupName: o.groupName,
            name: o.name,
            priceCents: o.priceCents,
          }))
        );
      }
    }
    return created;
  });

  return Response.json(
    {
      order: {
        id: String(order.id),
        code: orderCode(order.id),
        total: (subtotalCents + deliveryFeeCents) / 100,
      },
    },
    { status: 201 }
  );
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const scope = new URL(request.url).searchParams.get("scope") ?? "me";

  if (scope === "restaurant") {
    if (session.role !== "restaurante") {
      return Response.json({ message: "Acesso negado." }, { status: 403 });
    }
    const restaurant = await getRestaurantByOwner(Number(session.sub));
    if (!restaurant) {
      return Response.json({ orders: [] });
    }
    return Response.json({ orders: await getOrdersByRestaurant(restaurant.id) });
  }

  return Response.json({
    orders: await getOrdersByCustomer(Number(session.sub)),
  });
}
