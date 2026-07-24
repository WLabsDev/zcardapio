import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "./rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("permite tentativas até o limite", () => {
    const key = "test:ate-o-limite";
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).ok).toBe(true);
    }
  });

  it("bloqueia ao exceder o limite na mesma janela", () => {
    const key = "test:excede";
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000);
    const blocked = rateLimit(key, 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("libera novamente após a janela expirar", () => {
    vi.useFakeTimers();
    const key = "test:janela";
    for (let i = 0; i < 2; i++) rateLimit(key, 2, 1000);
    expect(rateLimit(key, 2, 1000).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 2, 1000).ok).toBe(true);
  });

  it("chaves diferentes não interferem entre si", () => {
    for (let i = 0; i < 5; i++) rateLimit("test:a", 5, 60_000);
    expect(rateLimit("test:a", 5, 60_000).ok).toBe(false);
    expect(rateLimit("test:b", 5, 60_000).ok).toBe(true);
  });
});
