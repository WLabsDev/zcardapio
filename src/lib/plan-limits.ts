/**
 * Limite de pedidos do plano grátis: passado esse número de pedidos no mês
 * corrente, o restaurante para de aceitar novos pedidos até o mês virar ou
 * até o dono fazer upgrade de plano.
 */
export const FREE_PLAN_MONTHLY_ORDER_LIMIT = 100;

/** Dias de carência após o vencimento antes de rebaixar para o plano grátis. */
export const GRACE_PERIOD_DAYS = 5;

/** Dias de vigência liberados a cada pagamento aprovado do plano. */
export const PLAN_PERIOD_DAYS = 30;

export function isFreePlan(planName: string | null | undefined) {
  return !planName || planName === "Grátis";
}

export type PlanStatus = "free" | "active" | "grace" | "expired";

/**
 * Situação do plano do restaurante considerando a vigência paga:
 * - "free": plano grátis (sem recursos pro).
 * - "active": plano pago dentro da vigência.
 * - "grace": venceu, mas está na carência (recursos ainda liberados + aviso).
 * - "expired": passou da carência → rebaixa para o grátis.
 */
export function getPlanStatus(
  planName: string | null | undefined,
  planValidUntil: Date | string | null | undefined,
  now: Date = new Date()
): PlanStatus {
  if (isFreePlan(planName)) return "free";
  if (!planValidUntil) return "expired";
  const validUntil = new Date(planValidUntil).getTime();
  const graceUntil = validUntil + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;
  const t = now.getTime();
  if (t <= validUntil) return "active";
  if (t <= graceUntil) return "grace";
  return "expired";
}

/** Recursos pro estão liberados quando o plano está ativo ou em carência. */
export function isProUnlocked(status: PlanStatus): boolean {
  return status === "active" || status === "grace";
}
