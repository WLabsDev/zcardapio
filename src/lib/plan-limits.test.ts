import { describe, expect, it } from "vitest";
import { FREE_PLAN_MONTHLY_ORDER_LIMIT, isFreePlan } from "./plan-limits";

describe("isFreePlan", () => {
  it("considera grátis quando não há plano ou o nome é 'Grátis'", () => {
    expect(isFreePlan(null)).toBe(true);
    expect(isFreePlan(undefined)).toBe(true);
    expect(isFreePlan("Grátis")).toBe(true);
  });

  it("planos pagos não são grátis", () => {
    expect(isFreePlan("Pro")).toBe(false);
    expect(isFreePlan("Premium")).toBe(false);
  });
});

describe("FREE_PLAN_MONTHLY_ORDER_LIMIT", () => {
  it("é um número positivo", () => {
    expect(FREE_PLAN_MONTHLY_ORDER_LIMIT).toBeGreaterThan(0);
  });
});
