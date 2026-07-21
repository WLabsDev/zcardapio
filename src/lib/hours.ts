import type { Restaurant } from "@/lib/mock/types";

export type OpenState = {
  open: boolean;
  /** mensagem de pausa temporária, quando aplicável */
  pauseMessage?: string;
};

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Calcula se o restaurante está aberto agora.
 * Prioridade: pausa temporária > interruptor mestre (isOpen) > agenda semanal.
 * - Pausa temporária (pauseMessage) fecha com uma mensagem ao cliente.
 * - isOpen=false fecha o cardápio independentemente da agenda.
 * - Sem agenda estruturada e isOpen=true, permanece aberto.
 * - Faixas que viram a meia-noite (ex.: 18:00–02:00) são suportadas.
 */
export function computeOpenState(
  restaurant: Pick<Restaurant, "hours" | "pauseMessage" | "isOpen">,
  now: Date = new Date()
): OpenState {
  const pause = restaurant.pauseMessage?.trim();
  if (pause) return { open: false, pauseMessage: pause };
  if (!restaurant.isOpen) return { open: false };

  const hours = restaurant.hours ?? [];
  if (hours.length === 0) return { open: true };

  const day = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const today = hours.find((h) => h.day === day);
  if (today && !today.closed) {
    const open = toMin(today.open);
    const close = toMin(today.close);
    const inRange =
      close > open
        ? nowMin >= open && nowMin < close
        : nowMin >= open || nowMin < close; // vira a meia-noite
    if (inRange) return { open: true };
  }

  // Ainda pode estar dentro do horário que começou ontem e atravessou a noite.
  const yesterday = hours.find((h) => h.day === (day + 6) % 7);
  if (yesterday && !yesterday.closed) {
    const open = toMin(yesterday.open);
    const close = toMin(yesterday.close);
    if (close < open && nowMin < close) return { open: true };
  }

  return { open: false };
}
