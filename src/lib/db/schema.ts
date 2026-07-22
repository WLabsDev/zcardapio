import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import type { DayHours, PaymentMethod } from "../mock/types";

export const roleEnum = pgEnum("role", ["admin", "restaurante", "cliente"]);
export const restaurantStatusEnum = pgEnum("restaurant_status", [
  "ativo",
  "pendente",
  "bloqueado",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pendente",
  "confirmado",
  "preparando",
  "saiu_para_entrega",
  "entregue",
  "cancelado",
]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["entrega", "retirada"]);
export const couponTypeEnum = pgEnum("coupon_type", ["percent", "fixed"]);
export const loyaltyMechanicEnum = pgEnum("loyalty_mechanic", [
  "none",
  "points",
  "cashback",
  "stamps",
]);

// Dinheiro é armazenado em centavos (integer) — a API converte para reais.

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  description: text("description").notNull().default(""),
  features: text("features")
    .array()
    .notNull()
    .$defaultFn(() => []),
  highlighted: boolean("highlighted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  // E-mail é obrigatório só para vendedor/admin (validado na API);
  // clientes podem se cadastrar apenas com o WhatsApp.
  email: varchar("email", { length: 255 }).unique(),
  // Senha opcional: contas criadas automaticamente no checkout nascem sem senha.
  passwordHash: text("password_hash"),
  // WhatsApp é o identificador do cliente (único quando preenchido).
  phone: varchar("phone", { length: 20 }).unique(),
  role: roleEnum("role").notNull().default("cliente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const restaurants = pgTable(
  "restaurants",
  {
    id: serial("id").primaryKey(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id),
    planId: integer("plan_id").references(() => plans.id),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    segment: varchar("segment", { length: 60 }).notNull().default(""),
    logoUrl: text("logo_url").notNull().default(""),
    coverUrl: text("cover_url").notNull().default(""),
    address: varchar("address", { length: 255 }).notNull().default(""),
    phone: varchar("phone", { length: 20 }).notNull().default(""),
    openingHours: varchar("opening_hours", { length: 120 }).notNull().default(""),
    isOpen: boolean("is_open").notNull().default(true),
    deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
    minOrderCents: integer("min_order_cents").notNull().default(0),
    deliveryTime: varchar("delivery_time", { length: 40 }).notNull().default(""),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
    primaryColor: varchar("primary_color", { length: 9 }).notNull().default("#ea580c"),
    // Horário inteligente
    hours: jsonb("hours")
      .$type<DayHours[]>()
      .notNull()
      .default([]),
    pauseMessage: text("pause_message").notNull().default(""),
    // Banner + comunicação
    bannerText: text("banner_text").notNull().default(""),
    whatsapp: varchar("whatsapp", { length: 20 }).notNull().default(""),
    confirmMessage: text("confirm_message").notNull().default(""),
    // Pagamentos aceitos
    paymentMethods: text("payment_methods")
      .array()
      .$type<PaymentMethod[]>()
      .notNull()
      .default(["pix", "cartao", "dinheiro"]),
    // Aparência avançada
    theme: varchar("theme", { length: 10 }).notNull().default("claro"),
    font: varchar("font", { length: 20 }).notNull().default("bricolage"),
    buttonStyle: varchar("button_style", { length: 12 }).notNull().default("arredondado"),
    // Paleta de cores personalizada (vazio = usa o padrão do tema)
    headingColor: varchar("heading_color", { length: 9 }).notNull().default(""),
    productTitleColor: varchar("product_title_color", { length: 9 }).notNull().default(""),
    bodyColor: varchar("body_color", { length: 9 }).notNull().default(""),
    mutedColor: varchar("muted_color", { length: 9 }).notNull().default(""),
    bgColor: varchar("bg_color", { length: 9 }).notNull().default(""),
    cardColor: varchar("card_color", { length: 9 }).notNull().default(""),
    badgeColor: varchar("badge_color", { length: 9 }).notNull().default(""),
    badgeTextColor: varchar("badge_text_color", { length: 9 }).notNull().default(""),
    // Pedidos
    acceptsScheduled: boolean("accepts_scheduled").notNull().default(false),
    // Desativar avaliações é recurso de plano pro+ (ver requireProPlan em lib/vendedor.ts).
    reviewsEnabled: boolean("reviews_enabled").notNull().default(true),
    status: restaurantStatusEnum("status").notNull().default("pendente"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("restaurants_owner_idx").on(t.ownerId)]
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("categories_restaurant_idx").on(t.restaurantId)]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    imageUrl: text("image_url").notNull().default(""),
    available: boolean("available").notNull().default(true),
    popular: boolean("popular").notNull().default(false),
    // Estoque automático — opcional (trackStock=false = ilimitado, comportamento padrão).
    trackStock: boolean("track_stock").notNull().default(false),
    stock: integer("stock"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_restaurant_idx").on(t.restaurantId),
    index("products_category_idx").on(t.categoryId),
  ]
);

export const optionGroups = pgTable(
  "option_groups",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    required: boolean("required").notNull().default(false),
    max: integer("max").notNull().default(1),
  },
  (t) => [index("option_groups_product_idx").on(t.productId)]
);

export const groupOptions = pgTable(
  "group_options",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => optionGroups.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    priceCents: integer("price_cents").notNull().default(0),
    available: boolean("available").notNull().default(true),
    trackStock: boolean("track_stock").notNull().default(false),
    stock: integer("stock"),
  },
  (t) => [index("group_options_group_idx").on(t.groupId)]
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    customerId: integer("customer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull().default(""),
    deliveryType: deliveryTypeEnum("delivery_type").notNull().default("entrega"),
    address: text("address").notNull().default(""),
    paymentMethod: varchar("payment_method", { length: 40 }).notNull().default(""),
    subtotalCents: integer("subtotal_cents").notNull(),
    deliveryFeeCents: integer("delivery_fee_cents").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    couponCode: varchar("coupon_code", { length: 40 }).notNull().default(""),
    zoneName: varchar("zone_name", { length: 80 }).notNull().default(""),
    scheduledFor: timestamp("scheduled_for"),
    totalCents: integer("total_cents").notNull(),
    status: orderStatusEnum("status").notNull().default("pendente"),
    // Snapshot do que este pedido creditou de fidelidade — usado para reverter
    // corretamente se o pedido for cancelado depois.
    loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
    loyaltyCashbackEarnedCents: integer("loyalty_cashback_earned_cents")
      .notNull()
      .default(0),
    loyaltyStampEarned: boolean("loyalty_stamp_earned").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("orders_restaurant_idx").on(t.restaurantId),
    index("orders_customer_idx").on(t.customerId),
    index("orders_status_idx").on(t.status),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 120 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    notes: text("notes").notNull().default(""),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)]
);

export const orderItemOptions = pgTable(
  "order_item_options",
  {
    id: serial("id").primaryKey(),
    orderItemId: integer("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    groupName: varchar("group_name", { length: 80 }).notNull().default(""),
    name: varchar("name", { length: 80 }).notNull(),
    priceCents: integer("price_cents").notNull().default(0),
  },
  (t) => [index("order_item_options_item_idx").on(t.orderItemId)]
);

export const addresses = pgTable(
  "addresses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 40 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    isMain: boolean("is_main").notNull().default(false),
  },
  (t) => [index("addresses_user_idx").on(t.userId)]
);

export const deliveryZones = pgTable(
  "delivery_zones",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    feeCents: integer("fee_cents").notNull().default(0),
  },
  (t) => [index("delivery_zones_restaurant_idx").on(t.restaurantId)]
);

export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 40 }).notNull(),
    type: couponTypeEnum("type").notNull().default("percent"),
    /** percentual (0-100) ou valor fixo em centavos */
    value: integer("value").notNull().default(0),
    active: boolean("active").notNull().default(true),
    // true apenas em cupons gerados por resgate de fidelidade — nesse caso o cupom
    // é consumido (usedAt preenchido) no primeiro pedido que o usa. Cupons criados
    // manualmente pelo vendedor ficam sempre singleUse=false/usedAt=null (reutilizáveis).
    singleUse: boolean("single_use").notNull().default(false),
    usedAt: timestamp("used_at"),
  },
  (t) => [index("coupons_restaurant_idx").on(t.restaurantId)]
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    customerId: integer("customer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    customerName: varchar("customer_name", { length: 120 }).notNull(),
    // 1 a 5 estrelas.
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    // Oculta a avaliação do cardápio público; o autor continua vendo a própria.
    hidden: boolean("hidden").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    // Um pedido só pode ser avaliado uma vez.
    unique("reviews_order_unique").on(t.orderId),
    index("reviews_restaurant_idx").on(t.restaurantId),
  ]
);

/** Registro de cada vez que o vendedor ocultou uma avaliação — usado para o limite mensal do plano grátis. */
export const reviewHides = pgTable(
  "review_hides",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    reviewId: integer("review_id")
      .notNull()
      .references(() => reviews.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("review_hides_restaurant_idx").on(t.restaurantId)]
);

/** Configuração de fidelidade do restaurante — um row por restaurante, mecânica única ativa por vez. */
export const loyaltyPrograms = pgTable("loyalty_programs", {
  id: serial("id").primaryKey(),
  restaurantId: integer("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" })
    .unique(),
  mechanic: loyaltyMechanicEnum("mechanic").notNull().default("none"),
  // Mecânica "pontos"
  pointsPerReal: integer("points_per_real").notNull().default(1),
  pointsRequired: integer("points_required").notNull().default(100),
  pointsRewardType: couponTypeEnum("points_reward_type").notNull().default("fixed"),
  pointsRewardValue: integer("points_reward_value").notNull().default(0),
  // Mecânica "cashback"
  cashbackPercent: integer("cashback_percent").notNull().default(5),
  // Mecânica "carimbos"
  stampsRequired: integer("stamps_required").notNull().default(10),
  stampsRewardType: couponTypeEnum("stamps_reward_type").notNull().default("fixed"),
  stampsRewardValue: integer("stamps_reward_value").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Progresso de fidelidade de um cliente em um restaurante — guarda os 3 contadores
 * sempre, independente de qual mecânica está ativa no momento (permite trocar de
 * mecânica sem perder histórico). */
export const loyaltyProgress = pgTable(
  "loyalty_progress",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    customerId: integer("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    points: integer("points").notNull().default(0),
    cashbackCents: integer("cashback_cents").notNull().default(0),
    stampCount: integer("stamp_count").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("loyalty_progress_restaurant_customer_unique").on(
      t.restaurantId,
      t.customerId
    ),
    index("loyalty_progress_customer_idx").on(t.customerId),
  ]
);

// Relations (para queries aninhadas via db.query)
export const plansRelations = relations(plans, ({ many }) => ({
  restaurants: many(restaurants),
}));

export const usersRelations = relations(users, ({ many }) => ({
  restaurants: many(restaurants),
  orders: many(orders),
  addresses: many(addresses),
  loyaltyProgress: many(loyaltyProgress),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, { fields: [restaurants.ownerId], references: [users.id] }),
  plan: one(plans, { fields: [restaurants.planId], references: [plans.id] }),
  categories: many(categories),
  products: many(products),
  orders: many(orders),
  deliveryZones: many(deliveryZones),
  coupons: many(coupons),
  reviews: many(reviews),
  reviewHides: many(reviewHides),
  loyaltyProgram: one(loyaltyPrograms, {
    fields: [restaurants.id],
    references: [loyaltyPrograms.restaurantId],
  }),
  loyaltyProgress: many(loyaltyProgress),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [categories.restaurantId],
    references: [restaurants.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [products.restaurantId],
    references: [restaurants.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  optionGroups: many(optionGroups),
}));

export const optionGroupsRelations = relations(optionGroups, ({ one, many }) => ({
  product: one(products, {
    fields: [optionGroups.productId],
    references: [products.id],
  }),
  options: many(groupOptions),
}));

export const groupOptionsRelations = relations(groupOptions, ({ one }) => ({
  group: one(optionGroups, {
    fields: [groupOptions.groupId],
    references: [optionGroups.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  customer: one(users, { fields: [orders.customerId], references: [users.id] }),
  items: many(orderItems),
  review: one(reviews, { fields: [orders.id], references: [reviews.orderId] }),
}));

export const orderItemsRelations = relations(orderItems, ({ one, many }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  options: many(orderItemOptions),
}));

export const orderItemOptionsRelations = relations(orderItemOptions, ({ one }) => ({
  item: one(orderItems, {
    fields: [orderItemOptions.orderItemId],
    references: [orderItems.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const deliveryZonesRelations = relations(deliveryZones, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [deliveryZones.restaurantId],
    references: [restaurants.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [coupons.restaurantId],
    references: [restaurants.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [reviews.restaurantId],
    references: [restaurants.id],
  }),
  order: one(orders, { fields: [reviews.orderId], references: [orders.id] }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
}));

export const reviewHidesRelations = relations(reviewHides, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [reviewHides.restaurantId],
    references: [restaurants.id],
  }),
  review: one(reviews, {
    fields: [reviewHides.reviewId],
    references: [reviews.id],
  }),
}));

export const loyaltyProgramsRelations = relations(loyaltyPrograms, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [loyaltyPrograms.restaurantId],
    references: [restaurants.id],
  }),
}));

export const loyaltyProgressRelations = relations(loyaltyProgress, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [loyaltyProgress.restaurantId],
    references: [restaurants.id],
  }),
  customer: one(users, {
    fields: [loyaltyProgress.customerId],
    references: [users.id],
  }),
}));
