import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getPublicOrigin, getSiteUrl } from "./site-config";

const ENV_KEYS = ["SITE_URL", "NEXT_PUBLIC_SITE_URL"] as const;
const saved: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> = {};

beforeEach(() => {
  for (const key of ENV_KEYS) {
    saved[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

/** Requisição como a que chega no container atrás do proxy do Easypanel. */
function req(headers: Record<string, string> = {}, url = "http://0.0.0.0:80/api/x") {
  return new Request(url, { headers });
}

describe("getSiteUrl", () => {
  it("usa a env configurada", () => {
    process.env.SITE_URL = "https://zcardapio.com.br";
    expect(getSiteUrl()).toBe("https://zcardapio.com.br");
  });

  it("aceita valor sem protocolo", () => {
    process.env.SITE_URL = "meurestaurante.com.br";
    expect(getSiteUrl()).toBe("https://meurestaurante.com.br");
  });

  it("cai no padrão quando não há env ou o valor é inválido", () => {
    expect(getSiteUrl()).toBe("https://zcardapio.com.br");
    process.env.SITE_URL = ":::";
    expect(getSiteUrl()).toBe("https://zcardapio.com.br");
  });
});

describe("getPublicOrigin", () => {
  it("prefere a SITE_URL configurada, mesmo com cabeçalhos de proxy", () => {
    process.env.SITE_URL = "https://zcardapio.com.br";
    expect(
      getPublicOrigin(req({ "x-forwarded-host": "outro.com.br" }))
    ).toBe("https://zcardapio.com.br");
  });

  it("aceita o nome antigo NEXT_PUBLIC_SITE_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://zcardapio.com.br";
    expect(getPublicOrigin(req())).toBe("https://zcardapio.com.br");
  });

  it("sem env, usa os cabeçalhos do proxy", () => {
    expect(
      getPublicOrigin(
        req({ "x-forwarded-host": "zcardapio.com.br", "x-forwarded-proto": "https" })
      )
    ).toBe("https://zcardapio.com.br");
  });

  it("pega só o primeiro valor de cabeçalho encadeado", () => {
    expect(
      getPublicOrigin(
        req({
          "x-forwarded-host": "zcardapio.com.br, interno",
          "x-forwarded-proto": "https,http",
        })
      )
    ).toBe("https://zcardapio.com.br");
  });

  it("assume http em localhost (dev)", () => {
    expect(
      getPublicOrigin(req({ host: "localhost:3000" }, "http://localhost:3000/api/x"))
    ).toBe("http://localhost:3000");
  });

  it("ignora o endereço de bind e não devolve 0.0.0.0", () => {
    // O caso do bug: sem env e sem cabeçalho útil, cai no domínio padrão em vez
    // de montar um link para o endereço de bind.
    expect(getPublicOrigin(req({ host: "0.0.0.0:80" }))).toBe(
      "https://zcardapio.com.br"
    );
    process.env.SITE_URL = "https://zcardapio.com.br";
    expect(getPublicOrigin(req({ host: "0.0.0.0:80" }))).toBe(
      "https://zcardapio.com.br"
    );
  });
});
