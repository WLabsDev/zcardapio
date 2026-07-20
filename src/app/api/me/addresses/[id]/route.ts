import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { addresses } from "@/lib/db/schema";

const putSchema = z.object({
  label: z.string().min(1, "Dê um nome ao endereço.").max(40),
  address: z.string().min(5, "Informe o endereço completo.").max(255),
  isMain: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

async function ownedWhere(params: Ctx["params"], userId: number) {
  const { id } = await params;
  const addressId = Number(id);
  if (!Number.isInteger(addressId)) return null;
  return and(eq(addresses.id, addressId), eq(addresses.userId, userId));
}

export async function PUT(request: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }
  const where = await ownedWhere(params, Number(session.sub));
  if (!where) {
    return Response.json({ message: "Endereço inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  if (parsed.data.isMain) {
    await db
      .update(addresses)
      .set({ isMain: false })
      .where(eq(addresses.userId, Number(session.sub)));
  }
  const [updated] = await db
    .update(addresses)
    .set(parsed.data)
    .where(where)
    .returning({ id: addresses.id });
  if (!updated) {
    return Response.json({ message: "Endereço não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }
  const where = await ownedWhere(params, Number(session.sub));
  if (!where) {
    return Response.json({ message: "Endereço inválido." }, { status: 400 });
  }
  const [deleted] = await db
    .delete(addresses)
    .where(where)
    .returning({ id: addresses.id });
  if (!deleted) {
    return Response.json({ message: "Endereço não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
