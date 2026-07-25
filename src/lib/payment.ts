/**
 * O pedido guarda a forma de pagamento já como rótulo ("Pix", "Cartão na
 * entrega", "Dinheiro") — e não a chave do enum ("pix", "cartao", "dinheiro").
 * Comparar direto com "pix" não funciona; use este helper, que aceita as duas
 * formas e ignora caixa e espaços.
 */
export function isPixPayment(paymentMethod: string | undefined | null): boolean {
  return (paymentMethod ?? "").trim().toLowerCase() === "pix";
}
