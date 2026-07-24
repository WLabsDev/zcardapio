import { describe, expect, it } from "vitest";
import { computeOpenState } from "./hours";

// 2026-07-22 é uma quarta-feira (day=3)
const at = (h: number, m = 0) => new Date(2026, 6, 22, h, m);

const hours = [
  { day: 3, open: "18:00", close: "23:30", closed: false }, // quarta
];

describe("computeOpenState", () => {
  it("pausa temporária fecha com mensagem", () => {
    const r = { isOpen: true, hours, pauseMessage: "Férias" };
    expect(computeOpenState(r, at(19))).toEqual({ open: false, pauseMessage: "Férias" });
  });

  it("isOpen=false fecha independentemente da agenda", () => {
    expect(computeOpenState({ isOpen: false, hours }, at(19)).open).toBe(false);
  });

  it("sem agenda e isOpen=true permanece aberto", () => {
    expect(computeOpenState({ isOpen: true, hours: [] }, at(3)).open).toBe(true);
  });

  it("aberto dentro do horário", () => {
    expect(computeOpenState({ isOpen: true, hours }, at(18)).open).toBe(true);
    expect(computeOpenState({ isOpen: true, hours }, at(23, 29)).open).toBe(true);
  });

  it("fechado fora do horário", () => {
    expect(computeOpenState({ isOpen: true, hours }, at(17, 59)).open).toBe(false);
    expect(computeOpenState({ isOpen: true, hours }, at(23, 30)).open).toBe(false);
  });

  it("dia marcado como fechado", () => {
    const closed = [{ day: 3, open: "18:00", close: "23:30", closed: true }];
    expect(computeOpenState({ isOpen: true, hours: closed }, at(19)).open).toBe(false);
  });

  it("faixa que vira a meia-noite (18:00–02:00)", () => {
    const overnight = [{ day: 3, open: "18:00", close: "02:00", closed: false }];
    expect(computeOpenState({ isOpen: true, hours: overnight }, at(23)).open).toBe(true);
    expect(computeOpenState({ isOpen: true, hours: overnight }, at(1, 30)).open).toBe(true);
    expect(computeOpenState({ isOpen: true, hours: overnight }, at(3)).open).toBe(false);
  });

  it("horário que começou ontem e atravessou a noite", () => {
    // terça (day=2) aberta 18:00–02:00; quarta 01:00 ainda está dentro
    const yesterday = [{ day: 2, open: "18:00", close: "02:00", closed: false }];
    expect(computeOpenState({ isOpen: true, hours: yesterday }, at(1, 30)).open).toBe(true);
  });
});
