import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conteúdo para donos de restaurante: como vender mais pelo WhatsApp, cardápio digital, delivery e fidelização de clientes.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog do zCardápio",
    description:
      "Guias práticos para o seu restaurante vender mais: WhatsApp, cardápio digital, delivery e fidelidade.",
    url: "/blog",
  },
};

const longDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

export default async function BlogIndexPage() {
  const published = await db.query.posts.findMany({
    where: eq(posts.published, true),
    orderBy: (p, { desc }) => [desc(p.publishedAt)],
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
          Blog do <span className="text-primary">zCardápio</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Guias práticos para o seu restaurante vender mais — sem comissão por
          pedido e sem complicação.
        </p>
      </header>

      {published.length === 0 ? (
        <p className="mt-12 rounded-xl border-2 border-dashed border-foreground/15 p-8 text-center text-muted-foreground">
          Em breve, novos artigos por aqui.
        </p>
      ) : (
        <div className="mt-12 space-y-5">
          {published.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border-2 border-foreground/15 p-6 transition-all hover:-translate-y-0.5 hover:border-foreground hover:shadow-offset-sm"
            >
              <h2 className="font-display text-2xl font-bold leading-snug">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-foreground/75">{post.excerpt}</p>
              )}
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{longDate(post.publishedAt)}</time>}
                <span className="font-semibold text-primary">Ler artigo →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
