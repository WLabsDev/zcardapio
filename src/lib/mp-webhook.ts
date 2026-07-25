/**
 * Validação da assinatura das notificações do MercadoPago.
 *
 * O MercadoPago assina cada webhook com a *chave secreta* que aparece no painel
 * (Suas integrações → a aplicação → Webhooks → "Segredo"). Ele manda dois
 * cabeçalhos:
 *
 *   x-signature: ts=1704908010,v1=618c85345248dd820d5fd456...
 *   x-request-id: <uuid da notificação>
 *
 * O `v1` é um HMAC-SHA256, em hexadecimal, do "manifesto":
 *
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * Cada trecho só entra no manifesto se o valor existir na notificação.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

type SignatureParts = { ts: string; v1: string };

/** Lê o cabeçalho `ts=...,v1=...` — devolve null se faltar qualquer uma das partes. */
export function parseSignatureHeader(header: string | null): SignatureParts | null {
  if (!header) return null;

  const parts: Record<string, string> = {};
  for (const chunk of header.split(",")) {
    const separator = chunk.indexOf("=");
    if (separator === -1) continue;
    const key = chunk.slice(0, separator).trim();
    const value = chunk.slice(separator + 1).trim();
    if (key) parts[key] = value;
  }

  return parts.ts && parts.v1 ? { ts: parts.ts, v1: parts.v1 } : null;
}

/**
 * Monta o manifesto exatamente como o MercadoPago faz. IDs alfanuméricos entram
 * em minúsculo (regra da documentação); IDs numéricos não mudam.
 */
export function buildManifest(params: {
  dataId: string | null;
  requestId: string | null;
  ts: string;
}): string {
  const segments: string[] = [];
  if (params.dataId) segments.push(`id:${params.dataId.toLowerCase()};`);
  if (params.requestId) segments.push(`request-id:${params.requestId};`);
  segments.push(`ts:${params.ts};`);
  return segments.join("");
}

/**
 * True quando a assinatura confere. Não checa a idade do `ts`: reenviar uma
 * notificação antiga só refaz a ativação, que é idempotente — e um limite de
 * tempo rígido descartaria retentativas legítimas do MercadoPago.
 */
export function verifyWebhookSignature(params: {
  secret: string;
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}): boolean {
  const signature = parseSignatureHeader(params.signatureHeader);
  if (!signature) return false;

  const manifest = buildManifest({
    dataId: params.dataId,
    requestId: params.requestId,
    ts: signature.ts,
  });
  const expected = createHmac("sha256", params.secret)
    .update(manifest)
    .digest("hex");

  // O v1 vem em hex; se não tiver o mesmo tamanho nem vale comparar (e o
  // timingSafeEqual exige buffers iguais).
  const received = signature.v1.toLowerCase();
  if (received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
