import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { loyaltyPrograms } from "@/lib/db/schema";
import { getRestaurantPlanStatus } from "@/lib/db/queries";
import { isProUnlocked } from "@/lib/plan-limits";
import { requireVendedorRestaurant } from "@/lib/vendedor";
import { apiHandler } from "@/lib/api";

const putSchema = z.object({
  mechanic: z.enum(["none", "points", "cashback", "stamps"]),
  pointsPerReal: z.number().int().min(1).max(100).optional(),
  pointsRequired: z.number().int().min(1).optional(),
  pointsRewardType: z.enum(["percent", "fixed"]).optional(),
  pointsRewardValue: z.number().int().min(0).optional(),
  cashbackPercent: z.number().int().min(1).max(100).optional(),
  stampsRequired: z.number().int().min(1).optional(),
  stampsRewardType: z.enum(["percent", "fixed"]).optional(),
  stampsRewardValue: z.number().int().min(0).optional(),
});

async function isPro(restaurantId: number) {
  return isProUnlocked(await getRestaurantPlanStatus(restaurantId));
}

export const GET = apiHandler(async () => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const program = await db.query.loyaltyPrograms.findFirst({
    where: eq(loyaltyPrograms.restaurantId, restaurant.id),
  });

  return Response.json({
    program: program ?? {
      mechanic: "none",
      pointsPerReal: 1,
      pointsRequired: 100,
      pointsRewardType: "fixed",
      pointsRewardValue: 0,
      cashbackPercent: 5,
      stampsRequired: 10,
      stampsRewardType: "fixed",
      stampsRewardValue: 0,
    },
    isFree: !(await isPro(restaurant.id)),
  });
});

export const PUT = apiHandler(async (request: Request) => {
  const { error, restaurant } = await requireVendedorRestaurant();
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (d.mechanic !== "none" && !(await isPro(restaurant.id))) {
    return Response.json(
      {
        message:
          "Programa de fidelidade é um recurso do plano Pro ou superior.",
      },
      { status: 403 }
    );
  }

  const existing = await db.query.loyaltyPrograms.findFirst({
    where: eq(loyaltyPrograms.restaurantId, restaurant.id),
    columns: { id: true },
  });

  const values = {
    mechanic: d.mechanic,
    ...(d.pointsPerReal !== undefined && { pointsPerReal: d.pointsPerReal }),
    ...(d.pointsRequired !== undefined && { pointsRequired: d.pointsRequired }),
    ...(d.pointsRewardType !== undefined && {
      pointsRewardType: d.pointsRewardType,
    }),
    ...(d.pointsRewardValue !== undefined && {
      pointsRewardValue: d.pointsRewardValue,
    }),
    ...(d.cashbackPercent !== undefined && {
      cashbackPercent: d.cashbackPercent,
    }),
    ...(d.stampsRequired !== undefined && { stampsRequired: d.stampsRequired }),
    ...(d.stampsRewardType !== undefined && {
      stampsRewardType: d.stampsRewardType,
    }),
    ...(d.stampsRewardValue !== undefined && {
      stampsRewardValue: d.stampsRewardValue,
    }),
  };

  if (existing) {
    await db
      .update(loyaltyPrograms)
      .set(values)
      .where(eq(loyaltyPrograms.restaurantId, restaurant.id));
  } else {
    await db
      .insert(loyaltyPrograms)
      .values({ restaurantId: restaurant.id, ...values });
  }

  return Response.json({ ok: true });
});
