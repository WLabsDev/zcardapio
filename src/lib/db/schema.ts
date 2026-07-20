import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

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
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 20 }).notNull().default(""),
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
    totalCents: integer("total_cents").notNull(),
    status: orderStatusEnum("status").notNull().default("pendente"),
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

// Relations (para queries aninhadas via db.query)
export const plansRelations = relations(plans, ({ many }) => ({
  restaurants: many(restaurants),
}));

export const usersRelations = relations(users, ({ many }) => ({
  restaurants: many(restaurants),
  orders: many(orders),
  addresses: many(addresses),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, { fields: [restaurants.ownerId], references: [users.id] }),
  plan: one(plans, { fields: [restaurants.planId], references: [plans.id] }),
  categories: many(categories),
  products: many(products),
  orders: many(orders),
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
