import { ilike, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const q = new URL(request.url).searchParams.get("q")?.trim();
  const rows = await db.query.users.findMany({
    where: q
      ? or(
          ilike(users.name, `%${q}%`),
          ilike(users.email, `%${q}%`),
          ilike(users.phone, `%${q}%`)
        )
      : undefined,
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: (u, { desc }) => [desc(u.createdAt)],
    limit: 100,
  });
  return Response.json({
    users: rows.map((u) => ({
      ...u,
      id: String(u.id),
      createdAt: u.createdAt.toISOString(),
    })),
  });
}
