import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildManifest,
  parseSignatureHeader,
  verifyWebhookSignature,
} from "./mp-webhook";

const SECRET = "segredo-do-painel";

/** Assina como o MercadoPago assinaria, para os testes de ponta a ponta. */
function sign(manifest: string, secret = SECRET) {
  return createHmac("sha256", secret).update(manifest).digest("hex");
}

describe("parseSignatureHeader", () => {
  it("lê ts e v1", () => {
    expect(parseSignatureHeader("ts=1704908010,v1=abc123")).toEqual({
      ts: "1704908010",
      v1: "abc123",
    });
  });

  it("aceita espaços e ordem invertida", () => {
    expect(parseSignatureHeader(" v1=abc123 , ts=1704908010 ")).toEqual({
      ts: "1704908010",
      v1: "abc123",
    });
  });

  it("rejeita cabeçalho ausente ou incompleto", () => {
    expect(parseSignatureHeader(null)).toBeNull();
    expect(parseSignatureHeader("")).toBeNull();
    expect(parseSignatureHeader("ts=1704908010")).toBeNull();
    expect(parseSignatureHeader("v1=abc123")).toBeNull();
  });
});

describe("buildManifest", () => {
  it("monta no formato da documentação", () => {
    expect(
      buildManifest({ dataId: "123456", requestId: "req-1", ts: "1704908010" })
    ).toBe("id:123456;request-id:req-1;ts:1704908010;");
  });

  it("passa id alfanumérico para minúsculo", () => {
    expect(
      buildManifest({ dataId: "AbC123", requestId: null, ts: "1" })
    ).toBe("id:abc123;ts:1;");
  });

  it("omite os trechos sem valor", () => {
    expect(buildManifest({ dataId: null, requestId: null, ts: "1" })).toBe(
      "ts:1;"
    );
  });
});

describe("verifyWebhookSignature", () => {
  const base = {
    secret: SECRET,
    requestId: "req-1",
    dataId: "123456",
  };
  const manifest = "id:123456;request-id:req-1;ts:1704908010;";

  it("aceita a assinatura correta", () => {
    expect(
      verifyWebhookSignature({
        ...base,
        signatureHeader: `ts=1704908010,v1=${sign(manifest)}`,
      })
    ).toBe(true);
  });

  it("aceita v1 em maiúsculas", () => {
    expect(
      verifyWebhookSignature({
        ...base,
        signatureHeader: `ts=1704908010,v1=${sign(manifest).toUpperCase()}`,
      })
    ).toBe(true);
  });

  it("recusa segredo errado", () => {
    expect(
      verifyWebhookSignature({
        ...base,
        signatureHeader: `ts=1704908010,v1=${sign(manifest, "outro-segredo")}`,
      })
    ).toBe(false);
  });

  it("recusa quando o ts é trocado (manifesto muda)", () => {
    expect(
      verifyWebhookSignature({
        ...base,
        signatureHeader: `ts=1704908099,v1=${sign(manifest)}`,
      })
    ).toBe(false);
  });

  it("recusa quando o id do pagamento é trocado", () => {
    expect(
      verifyWebhookSignature({
        ...base,
        dataId: "999999",
        signatureHeader: `ts=1704908010,v1=${sign(manifest)}`,
      })
    ).toBe(false);
  });

  it("recusa assinatura ausente, vazia ou de tamanho diferente", () => {
    expect(
      verifyWebhookSignature({ ...base, signatureHeader: null })
    ).toBe(false);
    expect(
      verifyWebhookSignature({ ...base, signatureHeader: "ts=1,v1=" })
    ).toBe(false);
    expect(
      verifyWebhookSignature({ ...base, signatureHeader: "ts=1704908010,v1=ff" })
    ).toBe(false);
  });
});
