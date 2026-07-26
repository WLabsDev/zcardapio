ALTER TABLE "coupons" ADD COLUMN "max_uses" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "max_uses_per_customer" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "min_order_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_id" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;