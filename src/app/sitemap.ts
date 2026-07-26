import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { getSiteUrl } from "@/lib/site-config";

// Sitemap dinâmico: lista a home, o índice do blog e cada post publicado.
// O admin invalida (/blog e /sitemap.xml) ao criar/editar/excluir, então um
// post novo aparece aqui no próximo acesso do robô de busca.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const published = await db.query.posts.findMany({
    where: eq(posts.published, true),
    columns: { slug: true, updatedAt: true },
  });

  return [
    { url: site, changeFrequency: "monthly", priority: 1 },
    { url: `${site}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...published.map((post) => ({
      url: `${site}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
