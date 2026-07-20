import { eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

const addressSchema = z.object({
  label: z.string().min(1, "Dê um nome ao endereço.").max(40),
  address: z.string().min(5, "Informe o endereço completo.").max(255),
  isMain: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }
  const rows = await db.query.addresses.findMany({
    where: eq(addresses.userId, Number(session.sub)),
    orderBy: (a, { asc }) => [asc(a.id)],
  });
  return Response.json({
    addresses: rows.map((a) => ({ ...a, id: String(a.id) })),
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const userId = Number(session.sub);
  if (parsed.data.isMain) {
    await db.update(addresses).set({ isMain: false }).where(eq(addresses.userId, userId));
  }
  const [created] = await db
    .insert(addresses)
    .values({ userId, ...parsed.data, isMain: parsed.data.isMain ?? false })
    .returning({ id: addresses.id });
  return Response.json({ id: String(created.id) }, { status: 201 });
}
