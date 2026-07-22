ALTER TABLE "coupons" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD COLUMN "option_id" integer;--> statement-breakpoint
ALTER TABLE "order_item_options" ADD CONSTRAINT "order_item_options_option_id_group_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."group_options"("id") ON DELETE set null ON UPDATE no action;