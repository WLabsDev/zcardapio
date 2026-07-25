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
 * A URL configurada, normalizada — ou undefined se ninguém definiu. Aceita valor
 * sem protocolo (`zcardapio.com.br`) e ignora valor inválido em vez de derrubar
 * a aplicação (`new URL()` lançaria erro em toda requisição).
 */
function getConfiguredSiteUrl(): string | undefined {
  const raw = readEnv("SITE_URL", "NEXT_PUBLIC_SITE_URL");
  if (!raw) return undefined;

  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    console.warn(`[site-config] SITE_URL inválida (${raw}); ignorando.`);
    return undefined;
  }
}

/**
 * URL pública do site, usada no `metadataBase` (Open Graph, canonical). Sempre
 * devolve algo — metadata não pode ficar sem base.
 */
export function getSiteUrl(): string {
  return getConfiguredSiteUrl() ?? FALLBACK_SITE_URL;
}

/** Host inútil para montar link: o endereço em que o servidor escuta, não o público. */
function isBindAddress(host: string): boolean {
  return /^(0\.0\.0\.0|\[::\]|::)(:\d+)?$/.test(host);
}

/**
 * Origem para montar links absolutos que saem do servidor (e-mail de
 * recuperação, aviso no WhatsApp, back_urls do MercadoPago).
 *
 * Ordem: SITE_URL configurada → cabeçalhos do proxy → URL da requisição. Atrás
 * do proxy do Easypanel a requisição chega como `http://0.0.0.0:80`, então sem a
 * SITE_URL o link sai quebrado; a cadeia de fallback existe só para o dev local
 * (localhost:3000) continuar funcionando sem configurar nada.
 */
export function getPublicOrigin(request: Request): string {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured;

  const first = (value: string | null) => value?.split(",")[0]?.trim() || "";
  const host = first(request.headers.get("x-forwarded-host")) ||
    first(request.headers.get("host"));
  if (host && !isBindAddress(host)) {
    const proto =
      first(request.headers.get("x-forwarded-proto")) ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    return `${proto}://${host}`;
  }

  // Último recurso: a URL da requisição. Se nem ela servir (é o caso atrás do
  // proxy, onde chega o endereço de bind), o domínio padrão é um link ruim
  // porém utilizável — melhor que mandar o cliente para 0.0.0.0.
  const requestOrigin = new URL(request.url);
  return isBindAddress(requestOrigin.host)
    ? FALLBACK_SITE_URL
    : requestOrigin.origin;
}

/** ID de mensuração do Google Analytics 4 (`G-XXXX`). Vazio = GA desativado. */
export function getGaMeasurementId(): string | undefined {
  return readEnv("GA_MEASUREMENT_ID", "NEXT_PUBLIC_GA_MEASUREMENT_ID");
}

/** Token da meta de verificação do Google Search Console. */
export function getGoogleSiteVerification(): string | undefined {
  return readEnv("GOOGLE_SITE_VERIFICATION", "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION");
}
