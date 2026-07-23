import { clearSession } from "@/lib/auth";

export async function POST() {
  await clearSession();
  return Response.json({ ok: true });
}

/**
 * Variante por GET, pensada para ser usada como alvo de `redirect()` em
 * Server Components (que não podem alterar cookies durante a renderização) —
 * limpa a sessão e manda o navegador para `next` (ou /login). Usada quando a
 * sessão aponta para algo que não existe mais (ex.: restaurante excluído),
 * evitando um loop de redirecionamento entre a página protegida e /login.
 */
export async function GET(request: Request) {
  await clearSession();
  const next = new URL(request.url).searchParams.get("next") || "/login";
  return Response.redirect(new URL(next, request.url));
}
