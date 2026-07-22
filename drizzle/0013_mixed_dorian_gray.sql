ALTER TABLE "coupons" ADD COLUMN "customer_id" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;