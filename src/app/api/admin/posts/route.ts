import { eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api";

const postSchema = z.object({
  title: z.string().min(2, "Informe um título.").max(180),
  excerpt: z.string().max(300).default(""),
  content: z.string().default(""),
  published: z.boolean().default(false),
});

/** Minúsculas, sem acentos, tudo que não é alfanumérico vira hífen. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

/**
 * Gera um slug único a partir do título. O slug nasce aqui e não muda mais
 * (editar o título não altera a URL) — trocar slug quebraria links indexados.
 */
async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "post";
  const rows = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(or(eq(posts.slug, base), like(posts.slug, `${base}-%`)));
  const taken = new Set(rows.map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Invalida o blog público e o sitemap para refletirem a mudança já no próximo acesso. */
function revalidateBlog() {
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
}

export const GET = apiHandler(async () => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const rows = await db.query.posts.findMany({
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });

  return Response.json({
    posts: rows.map((p) => ({
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: p.content,
      published: p.published,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      updatedAt: p.updatedAt.toISOString(),
    })),
  });
});

export const POST = apiHandler(async (request: Request) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const [created] = await db
    .insert(posts)
    .values({
      title: d.title.trim(),
      slug: await uniqueSlug(d.title),
      excerpt: d.excerpt.trim(),
      content: d.content,
      published: d.published,
      publishedAt: d.published ? new Date() : null,
    })
    .returning({ id: posts.id });

  revalidateBlog();
  return Response.json({ id: String(created.id) }, { status: 201 });
});
