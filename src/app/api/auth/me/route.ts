import { getSession } from "@/lib/auth";
import { apiHandler } from "@/lib/api";

export const GET = apiHandler(async () => {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Não autenticado." }, { status: 401 });
  }
  return Response.json({
    user: {
      id: Number(session.sub),
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
});
