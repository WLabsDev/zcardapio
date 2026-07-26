import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api";

const putSchema = z.object({
  title: z.string().min(2, "Informe um título.").max(180).optional(),
  excerpt: z.string().max(300).optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
});

function revalidateBlog() {
  revalidatePath("/blog", "layout");
  revalidatePath("/sitemap.xml");
}

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return Response.json({ message: "Post inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!existing) {
    return Response.json({ message: "Post não encontrado." }, { status: 404 });
  }

  // A data de publicação é a da primeira publicação e não muda mais — é a que
  // aparece no JSON-LD e nos resultados de busca.
  let publishedAt = existing.publishedAt;
  if (d.published === true && !publishedAt) publishedAt = new Date();

  const [updated] = await db
    .update(posts)
    .set({
      ...(d.title !== undefined && { title: d.title.trim() }),
      ...(d.excerpt !== undefined && { excerpt: d.excerpt.trim() }),
      ...(d.content !== undefined && { content: d.content }),
      ...(d.published !== undefined && { published: d.published }),
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });

  if (!updated) {
    return Response.json({ message: "Post não encontrado." }, { status: 404 });
  }
  revalidateBlog();
  return Response.json({ ok: true });
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return Response.json({ message: "Post inválido." }, { status: 400 });
  }

  const [deleted] = await db
    .delete(posts)
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });
  if (!deleted) {
    return Response.json({ message: "Post não encontrado." }, { status: 404 });
  }
  revalidateBlog();
  return Response.json({ ok: true });
});
