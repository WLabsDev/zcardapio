/**
 * Limite de pedidos do plano grátis: passado esse número de pedidos no mês
 * corrente, o restaurante para de aceitar novos pedidos até o mês virar ou
 * até o dono fazer upgrade de plano.
 */
export const FREE_PLAN_MONTHLY_ORDER_LIMIT = 100;

export function isFreePlan(planName: string | null | undefined) {
  return !planName || planName === "Grátis";
}
