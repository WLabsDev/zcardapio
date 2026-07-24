/**
 * Rate limiter em memória (janela deslizante por chave). Indicado para deploy em
 * instância única; em múltiplas instâncias o ideal é um store compartilhado
 * (ex.: Redis). Melhor do que nenhuma proteção contra força bruta.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Registra uma tentativa para a `key`. Retorna `ok: false` quando o `limit` de
 * tentativas dentro de `windowMs` é excedido.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();

  // Limpeza preguiçosa: se acumular muitos buckets, descarta os expirados para
  // a memória não crescer indefinidamente.
  if (buckets.size > 10000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterMs: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { ok: true, retryAfterMs: 0 };
}

/** Extrai o IP do cliente (considera proxies via x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
