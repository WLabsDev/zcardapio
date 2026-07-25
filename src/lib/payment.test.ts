import { describe, expect, it } from "vitest";
import { isPixPayment } from "./payment";

describe("isPixPayment", () => {
  it("reconhece o rótulo gravado no pedido", () => {
    // É assim que o pedido guarda hoje (PAYMENT_LABEL na criação do pedido).
    expect(isPixPayment("Pix")).toBe(true);
  });

  it("reconhece a chave do enum e variações de caixa/espaço", () => {
    expect(isPixPayment("pix")).toBe(true);
    expect(isPixPayment("PIX")).toBe(true);
    expect(isPixPayment("  Pix  ")).toBe(true);
  });

  it("recusa os outros métodos", () => {
    expect(isPixPayment("Cartão na entrega")).toBe(false);
    expect(isPixPayment("dinheiro")).toBe(false);
  });

  it("recusa valor ausente", () => {
    expect(isPixPayment("")).toBe(false);
    expect(isPixPayment(undefined)).toBe(false);
    expect(isPixPayment(null)).toBe(false);
  });
});
