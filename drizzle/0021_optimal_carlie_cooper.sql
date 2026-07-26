CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(180) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posts_slug_unique" UNIQUE("slug")
);
