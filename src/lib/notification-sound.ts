let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

/**
 * Toca um chime de duas notas (agradável, curto) para notificar pedido novo.
 * Usa Web Audio API — sem arquivo externo.
 * Respeita a política de autoplay: se o contexto estiver suspenso, tenta
 * retomar (funciona após qualquer interação do usuário na página).
 */
export function playOrderChime() {
  const ac = getCtx();
  if (!ac) return;

  if (ac.state === "suspended") {
    ac.resume().then(() => chime(ac)).catch(() => {});
  } else {
    chime(ac);
  }
}

function chime(ac: AudioContext) {
  const now = ac.currentTime;

  // Nota 1 — E5 (659 Hz)
  playTone(ac, 659, now, 0.12);
  // Nota 2 — G#5 (831 Hz)
  playTone(ac, 831, now + 0.13, 0.18);
}

function playTone(ac: AudioContext, freq: number, start: number, duration: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(0.25, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.start(start);
  osc.stop(start + duration + 0.01);
}
