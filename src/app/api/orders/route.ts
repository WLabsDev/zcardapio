import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons, deliveryZones, orderItemOptions, orderItems, orders, products, restaurants, users } from "@/lib/db/schema";
import {
  getMonthlyOrderCount,
  getOrdersByCustomer,
  getOrdersByRestaurant,
  getRestaurantByOwner,
  orderCode,
} from "@/lib/db/queries";
import { computeOpenState } from "@/lib/hours";
import { normalizePhone } from "@/lib/phone";
import { FREE_PLAN_MONTHLY_ORDER_LIMIT, isFreePlan } from "@/lib/plan-limits";
import { publishOrderEvent } from "@/lib/realtime";

const createOrderSchema = z.object({
  restaurantId: z.coerce.number().int().positive(),
  customerName: z.string().min(2, "Informe seu nome."),
  customerPhone: z.string().min(8, "Informe um telefone válido."),
  deliveryType: z.enum(["entrega", "retirada"]),
  address: z.string().default(""),
  paymentMethod: z.enum(["pix", "cartao", "dinheiro"]),
  zoneId: z.coerce.number().int().positive().optional(),
  couponCode: z.string().max(40).optional(),
  scheduledFor: z.coerce.date().optional(),
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
    with: { plan: { columns: { name: true } } },
  });
  if (!restaurant || restaurant.status !== "ativo") {
    return Response.json(
      { message: "Restaurante não encontrado." },
      { status: 404 }
    );
  }
  if (isFreePlan(restaurant.plan?.name)) {
    const monthlyOrders = await getMonthlyOrderCount(restaurant.id);
    if (monthlyOrders >= FREE_PLAN_MONTHLY_ORDER_LIMIT) {
      return Response.json(
        {
          message:
            "Este restaurante atingiu o limite de pedidos do plano grátis neste mês. Tente novamente mais tarde.",
        },
        { status: 409 }
      );
    }
  }
  const openState = computeOpenState(restaurant);
  if (!openState.open) {
    return Response.json(
      {
        message:
          openState.pauseMessage ?? "O restaurante está fechado no momento.",
      },
      { status: 409 }
    );
  }

  // Valida método de pagamento aceito pelo restaurante.
  const accepted: string[] =
    restaurant.paymentMethods && restaurant.paymentMethods.length > 0
      ? restaurant.paymentMethods
      : ["pix", "cartao", "dinheiro"];
  if (!accepted.includes(data.paymentMethod)) {
    return Response.json(
      { message: "Forma de pagamento não aceita por este restaurante." },
      { status: 400 }
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
  // Taxa de entrega: por região (se informada) ou a taxa padrão do restaurante.
  let deliveryFeeCents = 0;
  let zoneName = "";
  if (data.deliveryType === "entrega") {
    if (data.zoneId) {
      const zone = await db.query.deliveryZones.findFirst({
        where: and(
          eq(deliveryZones.id, data.zoneId),
          eq(deliveryZones.restaurantId, restaurant.id)
        ),
      });
      if (!zone) {
        return Response.json(
          { message: "Região de entrega inválida." },
          { status: 400 }
        );
      }
      deliveryFeeCents = zone.feeCents;
      zoneName = zone.name;
    } else {
      deliveryFeeCents = restaurant.deliveryFeeCents;
    }
  }

  if (subtotalCents < restaurant.minOrderCents) {
    return Response.json(
      { message: "O pedido não atinge o valor mínimo do restaurante." },
      { status: 400 }
    );
  }

  // Cupom de desconto — sempre recalculado no servidor.
  let discountCents = 0;
  let couponCode = "";
  if (data.couponCode?.trim()) {
    const code = data.couponCode.trim().toUpperCase();
    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.restaurantId, restaurant.id),
        eq(coupons.code, code),
        eq(coupons.active, true)
      ),
    });
    if (!coupon) {
      return Response.json(
        { message: "Cupom inválido ou inativo." },
        { status: 400 }
      );
    }
    discountCents =
      coupon.type === "percent"
        ? Math.round((subtotalCents * coupon.value) / 100)
        : coupon.value;
    discountCents = Math.min(discountCents, subtotalCents);
    couponCode = code;
  }

  // Pedido agendado — somente se o restaurante aceitar.
  let scheduledFor: Date | null = null;
  if (data.scheduledFor) {
    if (!restaurant.acceptsScheduled) {
      return Response.json(
        { message: "Este restaurante não aceita pedidos agendados." },
        { status: 400 }
      );
    }
    if (data.scheduledFor.getTime() <= Date.now()) {
      return Response.json(
        { message: "A data do agendamento deve ser no futuro." },
        { status: 400 }
      );
    }
    scheduledFor = data.scheduledFor;
  }

  const totalCents = subtotalCents - discountCents + deliveryFeeCents;

  const session = await getSession();

  const order = await db.transaction(async (tx) => {
    // Dono do pedido: cliente logado ou conta criada/vinculada pelo WhatsApp.
    let customerId: number | null = null;
    if (session?.role === "cliente") {
      const account = await tx.query.users.findFirst({
        where: eq(users.id, Number(session.sub)),
        columns: { id: true },
      });
      // Sessão pode apontar para um id que não existe mais (ex.: cookie de
      // impersonação antiga) — nesse caso trata como pedido de visitante.
      customerId = account?.id ?? null;
    }
    if (customerId === null) {
      const phone = normalizePhone(data.customerPhone);
      if (phone.length >= 10) {
        let account = await tx.query.users.findFirst({
          where: and(eq(users.phone, phone), eq(users.role, "cliente")),
          columns: { id: true },
        });
        if (!account) {
          [account] = await tx
            .insert(users)
            .values({ name: data.customerName, phone, role: "cliente" })
            .returning({ id: users.id });
        }
        customerId = account.id;
      }
    }

    const [created] = await tx
      .insert(orders)
      .values({
        restaurantId: restaurant.id,
        customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        address: data.deliveryType === "entrega" ? data.address.trim() : "",
        paymentMethod: PAYMENT_LABEL[data.paymentMethod],
        subtotalCents,
        deliveryFeeCents,
        discountCents,
        couponCode,
        zoneName,
        scheduledFor,
        totalCents,
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

  await publishOrderEvent({
    type: "order_created",
    orderId: order.id,
    restaurantId: order.restaurantId,
    customerId: order.customerId,
  }).catch(() => {});

  return Response.json(
    {
      order: {
        id: String(order.id),
        code: orderCode(order.id),
        total: totalCents / 100,
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
