CREATE TYPE "public"."loyalty_mechanic" AS ENUM('none', 'points', 'cashback', 'stamps');--> statement-breakpoint
CREATE TABLE "loyalty_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"mechanic" "loyalty_mechanic" DEFAULT 'none' NOT NULL,
	"points_per_real" integer DEFAULT 1 NOT NULL,
	"points_required" integer DEFAULT 100 NOT NULL,
	"points_reward_type" "coupon_type" DEFAULT 'fixed' NOT NULL,
	"points_reward_value" integer DEFAULT 0 NOT NULL,
	"cashback_percent" integer DEFAULT 5 NOT NULL,
	"stamps_required" integer DEFAULT 10 NOT NULL,
	"stamps_reward_type" "coupon_type" DEFAULT 'fixed' NOT NULL,
	"stamps_reward_value" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_programs_restaurant_id_unique" UNIQUE("restaurant_id")
);
--> statement-breakpoint
CREATE TABLE "loyalty_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"cashback_cents" integer DEFAULT 0 NOT NULL,
	"stamp_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loyalty_progress_restaurant_customer_unique" UNIQUE("restaurant_id","customer_id")
);
--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "used_at" timestamp;--> statement-breakpoint
ALTER TABLE "group_options" ADD COLUMN "available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "group_options" ADD COLUMN "track_stock" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "group_options" ADD COLUMN "stock" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_points_earned" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_cashback_earned_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "loyalty_stamp_earned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "track_stock" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stock" integer;--> statement-breakpoint
ALTER TABLE "loyalty_programs" ADD CONSTRAINT "loyalty_programs_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_progress" ADD CONSTRAINT "loyalty_progress_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loyalty_progress" ADD CONSTRAINT "loyalty_progress_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "loyalty_progress_customer_idx" ON "loyalty_progress" USING btree ("customer_id");