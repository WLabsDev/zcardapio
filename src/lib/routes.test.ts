import { describe, expect, it } from "vitest";
import { roleHome, safeRedirectPath } from "./routes";

describe("safeRedirectPath", () => {
  it("aceita caminhos internos", () => {
    expect(safeRedirectPath("/cliente")).toBe("/cliente");
    expect(safeRedirectPath("/r/burguer-do-zeca")).toBe("/r/burguer-do-zeca");
  });

  it("rejeita URL protocol-relative (open redirect)", () => {
    expect(safeRedirectPath("//evil.com")).toBeNull();
    expect(safeRedirectPath("//evil.com/x")).toBeNull();
  });

  it("rejeita URLs externas e valores inválidos", () => {
    expect(safeRedirectPath("https://evil.com")).toBeNull();
    expect(safeRedirectPath("evil.com")).toBeNull();
    expect(safeRedirectPath("")).toBeNull();
    expect(safeRedirectPath(null)).toBeNull();
  });
});

describe("roleHome", () => {
  it("mapeia cada perfil para o seu painel", () => {
    expect(roleHome.admin).toBe("/admin");
    expect(roleHome.restaurante).toBe("/vendedor");
    expect(roleHome.cliente).toBe("/cliente");
  });
});
