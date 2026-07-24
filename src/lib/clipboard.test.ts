import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./clipboard";

function stubDocument(execCommand: (...args: unknown[]) => boolean) {
  vi.stubGlobal("document", {
    createElement: () => ({ style: {}, focus() {}, select() {} }),
    body: { appendChild() {}, removeChild() {} },
    execCommand,
  });
}

describe("copyText", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("usa navigator.clipboard quando disponível", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const ok = await copyText("ola");
    expect(writeText).toHaveBeenCalledWith("ola");
    expect(ok).toBe(true);
  });

  it("não lança e usa fallback quando navigator.clipboard não existe", async () => {
    vi.stubGlobal("navigator", {});
    const execCommand = vi.fn().mockReturnValue(true);
    stubDocument(execCommand);
    const ok = await copyText("ola");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(ok).toBe(true);
  });

  it("usa fallback quando clipboard.writeText rejeita", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const execCommand = vi.fn().mockReturnValue(true);
    stubDocument(execCommand);
    const ok = await copyText("ola");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(ok).toBe(true);
  });

  it("retorna false quando nada consegue copiar", async () => {
    vi.stubGlobal("navigator", {});
    stubDocument(() => false);
    const ok = await copyText("ola");
    expect(ok).toBe(false);
  });
});
