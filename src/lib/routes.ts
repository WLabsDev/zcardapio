import type { SessionRole } from "@/lib/session";

/** Painel padrão para onde cada perfil vai após entrar. */
export const roleHome: Record<SessionRole, string> = {
  admin: "/admin",
  restaurante: "/vendedor",
  cliente: "/cliente",
};

/**
 * Valida o destino de redirect pós-login (parâmetro ?next=). Só aceita caminhos
 * internos — começa com "/" mas não "//", que seria uma URL protocol-relative e
 * permitiria open redirect para um domínio externo.
 */
export function safeRedirectPath(next: string | null): string | null {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return null;
}
