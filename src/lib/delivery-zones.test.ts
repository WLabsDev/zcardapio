import { describe, expect, it } from "vitest";
import { findZoneForAddress, normalizeZoneText } from "./delivery-zones";

const zones = [
  { id: "1", name: "Centro", fee: 5 },
  { id: "2", name: "Jardim América", fee: 8 },
  { id: "3", name: "Jardim", fee: 6 },
  { id: "4", name: "Sul", fee: 12 },
];

describe("normalizeZoneText", () => {
  it("tira acento, pontuação e caixa", () => {
    expect(normalizeZoneText("Jd. América")).toBe("jd america");
    expect(normalizeZoneText("  CENTRO  ")).toBe("centro");
  });

  it("devolve vazio quando não sobra nada", () => {
    expect(normalizeZoneText("")).toBe("");
    expect(normalizeZoneText("---")).toBe("");
  });
});

describe("findZoneForAddress", () => {
  it("encontra a região pelo nome no endereço", () => {
    expect(findZoneForAddress("Rua A, 100 — Centro — São Paulo", zones)?.id).toBe(
      "1"
    );
  });

  it("ignora acento e caixa", () => {
    expect(findZoneForAddress("rua b 20 jardim america sp", zones)?.id).toBe("2");
  });

  it("prefere a região mais específica quando duas casam", () => {
    // "Jardim" e "Jardim América" casam; vence o nome mais longo.
    expect(findZoneForAddress("Rua C, 5 — Jardim América", zones)?.id).toBe("2");
  });

  it("não casa pedaço de palavra", () => {
    // "Sul" não pode casar com "Consulado".
    expect(findZoneForAddress("Rua do Consulado, 30", zones)).toBeUndefined();
  });

  it("devolve undefined quando nenhuma região aparece", () => {
    expect(findZoneForAddress("Rua Z, 900 — Vila Nova", zones)).toBeUndefined();
    expect(findZoneForAddress("", zones)).toBeUndefined();
  });

  it("lida com lista vazia de regiões", () => {
    expect(findZoneForAddress("Rua A — Centro", [])).toBeUndefined();
  });
});
