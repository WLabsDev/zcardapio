import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/site-config";
import { PostMarkdown } from "@/components/blog/markdown";

type Props = { params: Promise<{ slug: string }> };

/** Só post publicado: rascunho não existe para o público (404). */
function getPublishedPost(slug: string) {
  return db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.published, true)),
  });
}

/** Descrição para o Google: o resumo do autor ou, na falta, o começo do texto. */
function metaDescription(excerpt: string, content: string): string {
  if (excerpt.trim()) return excerpt;
  return content
    .replace(/[#>*_`~\-\[\]()!]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Artigo não encontrado" };

  const description = metaDescription(post.excerpt, post.content);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const description = metaDescription(post.excerpt, post.content);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "zCardápio" },
    publisher: { "@type": "Organization", name: "zCardápio" },
    mainEntityOfPage: `${getSiteUrl()}/blog/${post.slug}`,
  };

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      {/* Dados estruturados: ajudam o Google a entender o artigo (rich results). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href="/blog"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← Todos os artigos
      </Link>

      <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        {post.title}
      </h1>

      {post.publishedAt && (
        <time
          dateTime={post.publishedAt.toISOString()}
          className="mt-4 block text-sm text-muted-foreground"
        >
          {post.publishedAt.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </time>
      )}

      <div className="mt-8">
        <PostMarkdown content={post.content} />
      </div>

      <div className="mt-14 rounded-2xl border-2 border-foreground bg-accent p-8 text-center shadow-offset-sm">
        <p className="font-display text-2xl font-extrabold">
          Pronto para vender mais pelo WhatsApp?
        </p>
        <p className="mt-2 text-muted-foreground">
          Crie o cardápio digital do seu restaurante em minutos, sem comissão
          por pedido.
        </p>
        <Link
          href="/cadastro-restaurante"
          className="mt-5 inline-block rounded-full bg-primary px-7 py-3 font-semibold text-primary-foreground shadow-offset-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Começar grátis
        </Link>
      </div>
    </article>
  );
}
