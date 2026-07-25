import { describe, expect, it } from "vitest";
import {
  formatPhone,
  normalizePhone,
  toWhatsAppNumber,
  whatsappLink,
} from "./phone";

describe("normalizePhone", () => {
  it("remove tudo que não é dígito", () => {
    expect(normalizePhone("(11) 99999-1234")).toBe("11999991234");
    expect(normalizePhone("+55 11 99999-1234")).toBe("5511999991234");
    expect(normalizePhone("11 99999 1234")).toBe("11999991234");
  });

  it("retorna vazio para entrada sem dígitos", () => {
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone("abc")).toBe("");
  });
});

describe("formatPhone", () => {
  it("formata progressivamente conforme os dígitos entram", () => {
    expect(formatPhone("1")).toBe("(1");
    expect(formatPhone("11")).toBe("(11");
    expect(formatPhone("119")).toBe("(11) 9");
    expect(formatPhone("119999")).toBe("(11) 9999");
    // a partir de 7 dígitos entra o separador "-" (formato 4-4)
    expect(formatPhone("1199999")).toBe("(11) 9999-9");
    // com 11 dígitos vira o formato celular 5-4
    expect(formatPhone("11999991234")).toBe("(11) 99999-1234");
  });

  it("formata um fixo (10 dígitos)", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("limita a 11 dígitos e ignora não-dígitos", () => {
    expect(formatPhone("(11) 99999-12345678")).toBe("(11) 99999-1234");
    expect(formatPhone("abc")).toBe("");
  });
});

describe("toWhatsAppNumber", () => {
  it("adiciona o DDI 55 quando falta", () => {
    expect(toWhatsAppNumber("(11) 99999-1234")).toBe("5511999991234");
  });

  it("não duplica o DDI já digitado", () => {
    expect(toWhatsAppNumber("+55 11 99999-1234")).toBe("5511999991234");
  });

  it("retorna vazio sem dígitos", () => {
    expect(toWhatsAppNumber("")).toBe("");
    expect(toWhatsAppNumber("  ")).toBe("");
  });
});

describe("whatsappLink", () => {
  it("monta o link da conversa", () => {
    expect(whatsappLink("(11) 99999-1234")).toBe("https://wa.me/5511999991234");
  });

  it("codifica a mensagem pronta", () => {
    expect(whatsappLink("11999991234", "Olá, pedido #1")).toBe(
      "https://wa.me/5511999991234?text=Ol%C3%A1%2C%20pedido%20%231"
    );
  });

  it("retorna vazio sem número", () => {
    expect(whatsappLink("")).toBe("");
  });
});
