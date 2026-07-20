import { getSession } from "@/lib/auth";

export async function GET() {
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
}
