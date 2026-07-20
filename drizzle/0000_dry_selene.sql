CREATE TYPE "public"."delivery_type" AS ENUM('entrega', 'retirada');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pendente', 'confirmado', 'preparando', 'saiu_para_entrega', 'entregue', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."restaurant_status" AS ENUM('ativo', 'pendente', 'bloqueado');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'restaurante', 'cliente');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"label" varchar(40) NOT NULL,
	"address" varchar(255) NOT NULL,
	"is_main" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "option_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"max" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"group_name" varchar(80) DEFAULT '' NOT NULL,
	"name" varchar(80) NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer,
	"name" varchar(120) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"notes" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"customer_id" integer,
	"customer_name" varchar(120) NOT NULL,
	"customer_phone" varchar(20) DEFAULT '' NOT NULL,
	"delivery_type" "delivery_type" DEFAULT 'entrega' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"payment_method" varchar(40) DEFAULT '' NOT NULL,
	"subtotal_cents" integer NOT NULL,
	"delivery_fee_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer NOT NULL,
	"status" "order_status" DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"features" text[] NOT NULL,
	"highlighted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_cents" integer NOT NULL,
	"image_url" text DEFAULT '' NOT NULL,
	"available" boolean DEFAULT true NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"plan_id" integer,
	"slug" varchar(80) NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"segment" varchar(60) DEFAULT '' NOT NULL,
	"logo_url" text DEFAULT '' NOT NULL,
	"cover_url" text DEFAULT '' NOT NULL,
	"address" varchar(255) DEFAULT '' NOT NULL,
	"phone" varchar(20) DEFAULT '' NOT NULL,
	"opening_hours" varchar(120) DEFAULT '' NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"delivery_fee_cents" integer DEFAULT 0 NOT NULL,
	"min_order_cents" integer DEFAULT 0 NOT NULL,
	"delivery_time" varchar(40) DEFAULT '' NOT NULL,
	"rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"primary_color" varchar(9) DEFAULT '#ea580c' NOT NULL,
	"status" "restaurant_status" DEFAULT 'pendente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"phone" varchar(20) DEFAULT '' NOT NULL,
	"role" "role" DEFAULT 'cliente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_options" ADD CONSTRAINT "group_options_group_id_option_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."option_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "option_groups" ADD CONSTRAINT "option_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "categories_restaurant_idx" ON "categories" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "group_options_group_idx" ON "group_options" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "option_groups_product_idx" ON "option_groups" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_item_options_item_idx" ON "order_item_options" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_restaurant_idx" ON "orders" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_restaurant_idx" ON "products" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "restaurants_owner_idx" ON "restaurants" USING btree ("owner_id");