/**
 * Regras de uso do cupom, num lugar só.
 *
 * O checkout consulta para mostrar o desconto e a criação do pedido consulta de
 * novo para valer — as duas precisam decidir igual, senão o cliente vê um
 * desconto que some na hora de enviar.
 *
 * Cupom manual nasceu sem limite nenhum: o mesmo código valia para sempre e o
 * mesmo cliente podia usar quantas vezes quisesse. Os campos de limite são
 * opcionais (null = sem limite) para não mudar o comportamento dos cupons já
 * cadastrados sem o vendedor pedir.
 */
import { formatBRL } from "@/lib/mock/types";

export type CouponRules = {
  active: boolean;
  /** Validade; null = não expira. */
  expiresAt: Date | null;
  /** Cupom de resgate de fidelidade: vale uma vez só, no primeiro pedido. */
  singleUse: boolean;
  usedAt: Date | null;
  /** Valor mínimo do pedido, em centavos. */
  minOrderCents: number;
  /** Limite total de usos; null = ilimitado. */
  maxUses: number | null;
  /** Limite por cliente; null = ilimitado. */
  maxUsesPerCustomer: number | null;
};

/** Quantas vezes o cupom já foi usado — no total e por este cliente. */
export type CouponUsage = { total: number; byCustomer: number };

export type CouponCheck = { ok: true } | { ok: false; message: string };

const OK: CouponCheck = { ok: true };

/**
 * Decide se o cupom pode ser aplicado. A mensagem devolvida é a que o cliente
 * vê, então diz o motivo — "cupom inválido" para tudo faz o cliente tentar de
 * novo sem entender.
 */
export function checkCoupon(
  coupon: CouponRules,
  context: {
    subtotalCents: number;
    usage: CouponUsage;
    /** Injetável para os testes; padrão é agora. */
    now?: Date;
  }
): CouponCheck {
  const now = context.now ?? new Date();

  if (!coupon.active) {
    return { ok: false, message: "Este cupom está inativo." };
  }
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now.getTime()) {
    return { ok: false, message: "Este cupom expirou." };
  }
  if (coupon.singleUse && coupon.usedAt) {
    return { ok: false, message: "Este cupom já foi utilizado." };
  }
  if (context.subtotalCents < coupon.minOrderCents) {
    return {
      ok: false,
      message: `Este cupom vale para pedidos a partir de ${formatBRL(
        coupon.minOrderCents / 100
      )}.`,
    };
  }
  if (coupon.maxUses !== null && context.usage.total >= coupon.maxUses) {
    return { ok: false, message: "Este cupom atingiu o limite de usos." };
  }
  if (
    coupon.maxUsesPerCustomer !== null &&
    context.usage.byCustomer >= coupon.maxUsesPerCustomer
  ) {
    return {
      ok: false,
      message:
        coupon.maxUsesPerCustomer === 1
          ? "Você já usou este cupom."
          : `Você já usou este cupom ${coupon.maxUsesPerCustomer} vezes.`,
    };
  }
  return OK;
}
