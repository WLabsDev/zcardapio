import { describe, expect, it } from "vitest";
import {
  FREE_PLAN_MONTHLY_ORDER_LIMIT,
  GRACE_PERIOD_DAYS,
  getPlanStatus,
  isFreePlan,
  isProUnlocked,
} from "./plan-limits";

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

const DAY = 24 * 60 * 60 * 1000;
const now = new Date("2026-07-25T12:00:00Z");
const daysFromNow = (d: number) => new Date(now.getTime() + d * DAY).toISOString();

describe("getPlanStatus", () => {
  it("plano grátis é sempre 'free'", () => {
    expect(getPlanStatus("Grátis", daysFromNow(10), now)).toBe("free");
    expect(getPlanStatus(null, daysFromNow(10), now)).toBe("free");
  });

  it("plano pago sem vigência registrada é 'expired'", () => {
    expect(getPlanStatus("Pro", null, now)).toBe("expired");
  });

  it("dentro da vigência é 'active'", () => {
    expect(getPlanStatus("Pro", daysFromNow(10), now)).toBe("active");
    // limite exato (agora == validUntil) ainda é active
    expect(getPlanStatus("Pro", now.toISOString(), now)).toBe("active");
  });

  it("venceu mas está na carência é 'grace'", () => {
    expect(getPlanStatus("Pro", daysFromNow(-1), now)).toBe("grace");
    // limite exato da carência ainda é grace
    expect(getPlanStatus("Pro", daysFromNow(-GRACE_PERIOD_DAYS), now)).toBe("grace");
  });

  it("passou da carência é 'expired'", () => {
    expect(getPlanStatus("Pro", daysFromNow(-GRACE_PERIOD_DAYS - 1), now)).toBe(
      "expired"
    );
  });
});

describe("isProUnlocked", () => {
  it("liberado em active e grace; travado em free e expired", () => {
    expect(isProUnlocked("active")).toBe(true);
    expect(isProUnlocked("grace")).toBe(true);
    expect(isProUnlocked("free")).toBe(false);
    expect(isProUnlocked("expired")).toBe(false);
  });
});
