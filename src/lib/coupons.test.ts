import { describe, expect, it } from "vitest";
import { formatBRL } from "./mock/types";
import { checkCoupon, type CouponRules } from "./coupons";

const AGORA = new Date("2026-07-26T12:00:00Z");

/** Cupom manual sem limite nenhum — o estado em que os cupons antigos ficam. */
const base: CouponRules = {
  active: true,
  expiresAt: null,
  singleUse: false,
  usedAt: null,
  minOrderCents: 0,
  maxUses: null,
  maxUsesPerCustomer: null,
};

const semUso = { total: 0, byCustomer: 0 };
const check = (coupon: Partial<CouponRules>, ctx: Partial<{ subtotalCents: number; usage: typeof semUso }> = {}) =>
  checkCoupon(
    { ...base, ...coupon },
    { subtotalCents: 5000, usage: semUso, now: AGORA, ...ctx }
  );

describe("checkCoupon", () => {
  it("libera o cupom sem limites", () => {
    expect(check({})).toEqual({ ok: true });
  });

  it("recusa cupom inativo", () => {
    expect(check({ active: false })).toMatchObject({ ok: false });
  });

  it("recusa cupom expirado e libera o que ainda vale", () => {
    expect(check({ expiresAt: new Date("2026-07-25T12:00:00Z") })).toMatchObject({
      ok: false,
      message: "Este cupom expirou.",
    });
    expect(check({ expiresAt: new Date("2026-07-27T12:00:00Z") })).toEqual({
      ok: true,
    });
  });

  it("recusa cupom de fidelidade já consumido", () => {
    expect(check({ singleUse: true, usedAt: new Date() })).toMatchObject({
      ok: false,
      message: "Este cupom já foi utilizado.",
    });
    // Ainda não usado: vale.
    expect(check({ singleUse: true, usedAt: null })).toEqual({ ok: true });
  });

  it("exige o pedido mínimo e diz qual é", () => {
    // formatBRL usa espaço não separável entre "R$" e o valor — montar a
    // mensagem com ele evita comparar com um espaço comum, que não casa.
    expect(check({ minOrderCents: 8000 }, { subtotalCents: 5000 })).toMatchObject({
      ok: false,
      message: `Este cupom vale para pedidos a partir de ${formatBRL(80)}.`,
    });
    // No limite exato o cupom vale.
    expect(check({ minOrderCents: 5000 }, { subtotalCents: 5000 })).toEqual({
      ok: true,
    });
  });

  it("respeita o limite total de usos", () => {
    expect(
      check({ maxUses: 10 }, { usage: { total: 10, byCustomer: 0 } })
    ).toMatchObject({ ok: false, message: "Este cupom atingiu o limite de usos." });
    expect(check({ maxUses: 10 }, { usage: { total: 9, byCustomer: 0 } })).toEqual({
      ok: true,
    });
  });

  it("respeita o limite por cliente — o caso do cupom usado de novo", () => {
    expect(
      check({ maxUsesPerCustomer: 1 }, { usage: { total: 40, byCustomer: 1 } })
    ).toMatchObject({ ok: false, message: "Você já usou este cupom." });
    // Outro cliente, mesmo cupom muito usado: continua valendo.
    expect(
      check({ maxUsesPerCustomer: 1 }, { usage: { total: 40, byCustomer: 0 } })
    ).toEqual({ ok: true });
  });

  it("pluraliza a mensagem quando o limite por cliente é maior que 1", () => {
    expect(
      check({ maxUsesPerCustomer: 3 }, { usage: { total: 3, byCustomer: 3 } })
    ).toMatchObject({ message: "Você já usou este cupom 3 vezes." });
  });

  it("null em maxUses e maxUsesPerCustomer significa sem limite", () => {
    expect(check({}, { usage: { total: 999, byCustomer: 999 } })).toEqual({
      ok: true,
    });
  });
});
