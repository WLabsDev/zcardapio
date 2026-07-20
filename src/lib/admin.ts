/** Autorização das rotas /api/admin/*. */
import { getSession } from "./auth";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return Response.json({ message: "Acesso negado." }, { status: 403 });
  }
  return null;
}
