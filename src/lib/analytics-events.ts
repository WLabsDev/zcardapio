/**
 * Eventos de conversão do funil do vendedor, enviados ao GA4.
 *
 * São quatro marcos, nesta ordem:
 *
 *   cadastro_vendedor → cardapio_montado → primeiro_pedido → assinatura
 *
 * O que o GA4 media sozinho (`page_view`) responde "quanta gente chegou".
 * Estes quatro respondem "quanta gente virou restaurante ativo" — que é o que
 * decide onde investir em mídia. Sem eles, otimizar campanha por visita é
 * otimizar pela métrica errada.
 *
 * Os três últimos são **marcos irreversíveis**: acontecem uma vez na vida de
 * cada restaurante. Por isso passam por `trackOnce`, que só deixa disparar
 * uma vez por escopo — senão um simples F5 na tela inflaria a conversão.
 *
 * Só funciona no navegador (depende do `gtag` carregado em
 * `src/components/analytics.tsx`). Se o GA estiver desativado — sem
 * `GA_MEASUREMENT_ID` no ambiente — as chamadas viram no-op silencioso.
 */

export const GA_EVENTS = {
  /** Restaurante concluiu o cadastro. */
  cadastroVendedor: "cadastro_vendedor",
  /** Cardápio tem produtos suficientes para receber pedido. */
  cardapioMontado: "cardapio_montado",
  /** Primeiro pedido real do restaurante — o momento WOW. */
  primeiroPedido: "primeiro_pedido",
  /** Plano pago ativado. */
  assinatura: "assinatura",
} as const;

/**
 * Quantos produtos contam como "cardápio montado".
 *
 * 1 produto não é um cardápio — é um teste. 5 é o menor número em que o
 * cliente final consegue de fato montar um pedido. Ajuste aqui se a leitura
 * dos dados mostrar outro patamar; o evento é disparado uma única vez, ao
 * cruzar o limite pela primeira vez.
 */
export const CARDAPIO_MONTADO_MIN_PRODUTOS = 5;

type EventParams = Record<string, string | number | boolean | undefined>;

/** Envia um evento ao GA4. Silencioso se o gtag não estiver carregado. */
export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}

/**
 * Envia um evento no máximo uma vez por escopo, lembrando pelo localStorage.
 *
 * O `scopeId` é o que separa um restaurante do outro no mesmo navegador —
 * sem ele, o dono que testa duas contas (ou o suporte que entra na conta de
 * um cliente) perderia o marco da segunda. Use o id do restaurante para os
 * marcos de ativação e o id do pagamento para a assinatura.
 *
 * Retorna `true` se o evento foi enviado agora, `false` se já tinha sido.
 */
export function trackOnce(
  name: string,
  scopeId: string,
  params: EventParams = {}
): boolean {
  if (typeof window === "undefined") return false;

  const key = `zcardapio:ga:${name}:${scopeId}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, new Date().toISOString());
  } catch {
    // localStorage indisponível (aba anônima, cookies bloqueados): manda o
    // evento mesmo assim. Contar duas vezes é menos grave que perder o marco.
  }

  trackEvent(name, params);
  return true;
}
