import { stopImpersonation } from "@/lib/auth";

export async function POST() {
  const restored = await stopImpersonation();
  if (!restored) {
    return Response.json(
      { message: "Nenhuma sessão de admin para restaurar." },
      { status: 400 }
    );
  }
  return Response.json({ ok: true });
}
