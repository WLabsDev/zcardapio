import { describe, expect, it } from "vitest";
import {
  canonicalPhone,
  formatPhone,
  normalizePhone,
  phoneVariants,
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

describe("canonicalPhone", () => {
  it("acrescenta o nono dígito no celular escrito à moda antiga", () => {
    expect(canonicalPhone("(11) 8765-4321")).toBe("11987654321");
    expect(canonicalPhone("1176543210")).toBe("11976543210");
  });

  it("mantém o celular que já veio com o nono dígito", () => {
    expect(canonicalPhone("(11) 98765-4321")).toBe("11987654321");
  });

  it("não mexe em telefone fixo (começa em 2–5)", () => {
    expect(canonicalPhone("(11) 3333-4444")).toBe("1133334444");
    expect(canonicalPhone("(11) 2222-4444")).toBe("1122224444");
  });

  it("ignora o DDI 55 quando ele vem junto", () => {
    expect(canonicalPhone("+55 11 98765-4321")).toBe("11987654321");
    expect(canonicalPhone("+55 11 8765-4321")).toBe("11987654321");
  });

  it("deixa passar o que não reconhece, sem inventar dígito", () => {
    expect(canonicalPhone("")).toBe("");
    expect(canonicalPhone("123")).toBe("123");
  });
});

describe("phoneVariants", () => {
  it("aceita as duas grafias do mesmo celular", () => {
    const comNove = phoneVariants("11987654321").sort();
    const semNove = phoneVariants("1187654321").sort();
    expect(comNove).toEqual(["1187654321", "11987654321"]);
    // Quem digita sem o 9 tem que encontrar a conta salva com o 9, e vice-versa.
    expect(semNove).toEqual(comNove);
  });

  it("aceita o número digitado com DDI", () => {
    expect(phoneVariants("+55 11 98765-4321")).toContain("11987654321");
  });

  it("fixo tem uma grafia só", () => {
    expect(phoneVariants("(11) 3333-4444")).toEqual(["1133334444"]);
  });

  it("não devolve variante vazia", () => {
    expect(phoneVariants("")).toEqual([]);
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
