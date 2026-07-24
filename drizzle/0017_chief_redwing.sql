CREATE TABLE "plan_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"mp_preference_id" varchar(64),
	"mp_payment_id" varchar(64),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"amount_cents" integer DEFAULT 0 NOT NULL,
	"plan_valid_until" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "plan_payments_mp_payment_id_unique" UNIQUE("mp_payment_id")
);
--> statement-breakpoint
ALTER TABLE "restaurants" ADD COLUMN "plan_valid_until" timestamp;--> statement-breakpoint
ALTER TABLE "plan_payments" ADD CONSTRAINT "plan_payments_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plan_payments" ADD CONSTRAINT "plan_payments_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plan_payments_restaurant_idx" ON "plan_payments" USING btree ("restaurant_id");