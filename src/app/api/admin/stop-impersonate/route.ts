import { stopImpersonation } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const POST = apiHandler(async () => {
  const restored = await stopImpersonation();
  if (!restored) {
    return Response.json(
      { message: "Nenhuma sessão de admin para restaurar." },
      { status: 400 }
    );
  }
  return Response.json({ ok: true });
});
