import { describe, expect, it } from "vitest";
import { formatBRL, isAvailable, stockLevel } from "./types";

describe("isAvailable", () => {
  it("disponível por padrão", () => {
    expect(isAvailable({})).toBe(true);
  });

  it("respeita o toggle manual", () => {
    expect(isAvailable({ available: false })).toBe(false);
  });

  it("sem estoque quando rastreado e zerado", () => {
    expect(isAvailable({ trackStock: true, stock: 0 })).toBe(false);
    expect(isAvailable({ trackStock: true, stock: null })).toBe(false);
  });

  it("disponível quando rastreado com estoque", () => {
    expect(isAvailable({ trackStock: true, stock: 5 })).toBe(true);
  });

  it("não rastrear estoque ignora a quantidade", () => {
    expect(isAvailable({ trackStock: false, stock: 0 })).toBe(true);
  });
});

describe("stockLevel", () => {
  it("ilimitado quando não rastreia", () => {
    expect(stockLevel({ trackStock: false })).toBe("unlimited");
    expect(stockLevel({})).toBe("unlimited");
  });

  it("esgotado / baixo / ok conforme a quantidade", () => {
    expect(stockLevel({ trackStock: true, stock: 0 })).toBe("out");
    expect(stockLevel({ trackStock: true, stock: 3 })).toBe("low");
    expect(stockLevel({ trackStock: true, stock: 4 })).toBe("ok");
  });
});

describe("formatBRL", () => {
  // toLocaleString usa espaço não-separável (U+00A0) entre "R$" e o valor;
  // normalizamos para comparar de forma estável.
  const brl = (v: number) => formatBRL(v).replace(/\u00a0/g, " ");

  it("formata em reais", () => {
    expect(brl(10)).toBe("R$ 10,00");
    expect(brl(27.9)).toBe("R$ 27,90");
  });
});
