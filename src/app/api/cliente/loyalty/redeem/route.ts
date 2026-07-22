import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupons, loyaltyPrograms, loyaltyProgress } from "@/lib/db/schema";

const schema = z.object({
  restaurantId: z.coerce.number().int().positive(),
});

function generateCode() {
  return `FID-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "cliente") {
    return Response.json({ message: "Faça login para continuar." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Restaurante inválido." }, { status: 400 });
  }
  const customerId = Number(session.sub);
  const { restaurantId } = parsed.data;

  const program = await db.query.loyaltyPrograms.findFirst({
    where: eq(loyaltyPrograms.restaurantId, restaurantId),
  });
  if (!program || program.mechanic === "none") {
    return Response.json(
      { message: "Este restaurante não tem fidelidade ativa." },
      { status: 400 }
    );
  }

  const progress = await db.query.loyaltyProgress.findFirst({
    where: and(
      eq(loyaltyProgress.restaurantId, restaurantId),
      eq(loyaltyProgress.customerId, customerId)
    ),
  });
  if (!progress) {
    return Response.json({ message: "Nenhum progresso encontrado." }, { status: 400 });
  }

  let couponType: "percent" | "fixed";
  let couponValue: number;
  let decrement: Partial<{ points: number; cashbackCents: number; stampCount: number }>;

  if (program.mechanic === "points") {
    if (progress.points < program.pointsRequired) {
      return Response.json({ message: "Pontos insuficientes." }, { status: 400 });
    }
    couponType = program.pointsRewardType;
    couponValue = program.pointsRewardValue;
    decrement = { points: program.pointsRequired };
  } else if (program.mechanic === "cashback") {
    if (progress.cashbackCents <= 0) {
      return Response.json({ message: "Nenhum crédito disponível." }, { status: 400 });
    }
    couponType = "fixed";
    couponValue = progress.cashbackCents;
    decrement = { cashbackCents: progress.cashbackCents };
  } else {
    if (progress.stampCount < program.stampsRequired) {
      return Response.json({ message: "Carimbos insuficientes." }, { status: 400 });
    }
    couponType = program.stampsRewardType;
    couponValue = program.stampsRewardValue;
    decrement = { stampCount: program.stampsRequired };
  }

  const code = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(coupons)
      .values({
        restaurantId,
        code: generateCode(),
        type: couponType,
        value: couponValue,
        active: true,
        singleUse: true,
      })
      .returning({ code: coupons.code });

    await tx
      .update(loyaltyProgress)
      .set({
        ...(decrement.points !== undefined && {
          points: sql`GREATEST(${loyaltyProgress.points} - ${decrement.points}, 0)`,
        }),
        ...(decrement.cashbackCents !== undefined && {
          cashbackCents: sql`GREATEST(${loyaltyProgress.cashbackCents} - ${decrement.cashbackCents}, 0)`,
        }),
        ...(decrement.stampCount !== undefined && {
          stampCount: sql`GREATEST(${loyaltyProgress.stampCount} - ${decrement.stampCount}, 0)`,
        }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(loyaltyProgress.restaurantId, restaurantId),
          eq(loyaltyProgress.customerId, customerId)
        )
      );

    return created.code;
  });

  return Response.json({ code });
}
