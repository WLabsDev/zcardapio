import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { plans, restaurants } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { apiHandler } from "@/lib/api";

const putSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(300).optional(),
  features: z.array(z.string().min(1).max(120)).optional(),
  highlighted: z.boolean().optional(),
});

export const PUT = apiHandler(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const planId = Number(id);
  if (!Number.isInteger(planId)) {
    return Response.json({ message: "Plano inválido." }, { status: 400 });
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

  const [updated] = await db
    .update(plans)
    .set({
      ...(d.name !== undefined && { name: d.name }),
      ...(d.price !== undefined && { priceCents: Math.round(d.price * 100) }),
      ...(d.description !== undefined && { description: d.description }),
      ...(d.features !== undefined && { features: d.features }),
      ...(d.highlighted !== undefined && { highlighted: d.highlighted }),
    })
    .where(eq(plans.id, planId))
    .returning({ id: plans.id });

  if (!updated) {
    return Response.json({ message: "Plano não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
});

export const DELETE = apiHandler(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const planId = Number(id);
  if (!Number.isInteger(planId)) {
    return Response.json({ message: "Plano inválido." }, { status: 400 });
  }

  // A FK restaurants.plan_id impede a exclusão; bloqueia antes com uma mensagem
  // clara se houver restaurantes (de qualquer status) nesse plano.
  const [sub] = await db
    .select({ value: count() })
    .from(restaurants)
    .where(eq(restaurants.planId, planId));
  if ((sub?.value ?? 0) > 0) {
    return Response.json(
      {
        message:
          "Este plano tem restaurantes assinantes e não pode ser excluído.",
      },
      { status: 409 }
    );
  }

  const [deleted] = await db
    .delete(plans)
    .where(eq(plans.id, planId))
    .returning({ id: plans.id });
  if (!deleted) {
    return Response.json({ message: "Plano não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
});
