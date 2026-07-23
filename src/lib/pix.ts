/**
 * Gera o QR Code Pix estático ("copia e cola") do pedido, na hora, sem
 * gateway/API paga — o valor cai direto na chave Pix cadastrada pelo
 * restaurante em `/vendedor/configuracoes`. A plataforma nunca custodia nem
 * repassa o dinheiro.
 */
import { createStaticPix } from "pix-utils";

/** Campos do BR Code exigem ASCII sem acentos, maiúsculo, com limite de tamanho. */
function sanitizeForPix(value: string, maxLength: number) {
  // NFD separa acentos das letras (é → e + ´); o replace seguinte já remove
  // qualquer coisa que não seja letra/número/espaço, incluindo os acentos soltos.
  const ascii = value
    .normalize("NFD")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
  return ascii.slice(0, maxLength) || "ZCARDAPIO";
}

export type PixPayload = { brCode: string; qrImage: string };

/** Retorna null se o restaurante não tem chave Pix cadastrada. */
export async function generateOrderPix(params: {
  pixKey: string;
  restaurantName: string;
  amountCents: number;
  orderCode: string;
}): Promise<PixPayload | null> {
  if (!params.pixKey.trim()) return null;

  const result = createStaticPix({
    merchantName: sanitizeForPix(params.restaurantName, 25),
    // Campo cosmético do BR Code — não afeta o recebimento do pagamento.
    merchantCity: "BRASIL",
    pixKey: params.pixKey.trim(),
    transactionAmount: params.amountCents / 100,
    txid: params.orderCode.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || undefined,
  });

  if ("error" in result) {
    console.error("[pix] falha ao gerar QR Code:", result.message);
    return null;
  }

  return {
    brCode: result.toBRCode(),
    qrImage: await result.toImage(),
  };
}
