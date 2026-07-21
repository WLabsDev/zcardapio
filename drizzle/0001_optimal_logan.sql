CREATE TYPE "public"."coupon_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"code" varchar(40) NOT NULL,
	"type" "coupon_type" DEFAULT 'percent' NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "delivery_zones" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"name" varchar(80) NOT NULL,
	"fee_cents" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_code" varchar(40) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "zone_name" varchar(80) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "scheduled_for" timestamp;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "hours" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "pause_message" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "banner_text" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "whatsapp" varchar(20) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "confirm_message" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "payment_methods" text[] DEFAULT '{"pix","cartao","dinheiro"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "theme" varchar(10) DEFAULT 'claro' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "font" varchar(20) DEFAULT 'bricolage' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "button_style" varchar(12) DEFAULT 'arredondado' NOT NULL;--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "accepts_scheduled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_zones" ADD CONSTRAINT "delivery_zones_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupons_restaurant_idx" ON "coupons" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "delivery_zones_restaurant_idx" ON "delivery_zones" USING btree ("restaurant_id");