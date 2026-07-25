/**
 * Configuração pública do site lida em RUNTIME (no servidor).
 *
 * Por que não usar `NEXT_PUBLIC_*`: o Next.js embute essas variáveis no bundle
 * durante o `next build`. Trocar o valor no Easypanel e reimplantar não muda
 * nada — o valor antigo (ou `undefined`) já está assado no JavaScript, e só um
 * rebuild sem cache resolveria.
 *
 * Aqui os valores são lidos do processo do servidor, então basta reiniciar o
 * container: nenhum rebuild é necessário. Os nomes `NEXT_PUBLIC_*` continuam
 * aceitos como fallback para não quebrar instalações antigas — mas prefira os
 * nomes sem prefixo, e NÃO os passe como build args (isso volta a congelá-los).
 */

const FALLBACK_SITE_URL = "https://zcardapio.com.br";

/** Trata "" (comum no Easypanel: variável criada e deixada vazia) como ausente. */
function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

/**
 * URL pública do site, usada no `metadataBase` (Open Graph, canonical).
 * Aceita valor sem protocolo (`zcardapio.com.br`) e ignora valor inválido em vez
 * de derrubar a aplicação — `new URL()` lançaria erro em toda requisição.
 */
export function getSiteUrl(): string {
  const raw = readEnv("SITE_URL", "NEXT_PUBLIC_SITE_URL");
  if (!raw) return FALLBACK_SITE_URL;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    console.warn(`[site-config] SITE_URL inválida (${raw}); usando ${FALLBACK_SITE_URL}`);
    return FALLBACK_SITE_URL;
  }
}

/** ID de mensuração do Google Analytics 4 (`G-XXXX`). Vazio = GA desativado. */
export function getGaMeasurementId(): string | undefined {
  return readEnv("GA_MEASUREMENT_ID", "NEXT_PUBLIC_GA_MEASUREMENT_ID");
}

/** Token da meta de verificação do Google Search Console. */
export function getGoogleSiteVerification(): string | undefined {
  return readEnv("GOOGLE_SITE_VERIFICATION", "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION");
}
