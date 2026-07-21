import { compare } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { normalizePhone } from "@/lib/phone";

const loginSchema = z.object({
  profile: z.enum(["admin", "restaurante", "cliente"]).default("cliente"),
  senha: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

const roleLabel: Record<string, string> = {
  admin: "administrador",
  restaurante: "restaurante",
  cliente: "cliente",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const { profile, senha } = parsed.data;

  // Cliente entra com o WhatsApp; vendedor/admin entram com e-mail.
  if (profile === "cliente") {
    const phone = normalizePhone(parsed.data.phone ?? "");
    if (phone.length < 10) {
      return Response.json(
        { message: "Informe um WhatsApp válido com DDD." },
        { status: 400 }
      );
    }

    const user = await db.query.users.findFirst({
      where: and(eq(users.phone, phone), eq(users.role, "cliente")),
    });
    if (!user) {
      return Response.json(
        {
          message:
            "Não encontramos uma conta com esse número. Ela é criada automaticamente no seu primeiro pedido.",
        },
        { status: 404 }
      );
    }

    // Conta criada no checkout ainda não tem senha → manda definir uma.
    if (!user.passwordHash) {
      return Response.json({ needsPassword: true, phone });
    }

    if (!senha || !(await compare(senha, user.passwordHash))) {
      return Response.json({ message: "Senha incorreta." }, { status: 401 });
    }

    await setSession(user);
    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  // Vendedor / Admin — e-mail obrigatório.
  const email = (parsed.data.email ?? "").trim().toLowerCase();
  if (!email) {
    return Response.json({ message: "Informe seu e-mail." }, { status: 400 });
  }
  if (!senha) {
    return Response.json({ message: "Informe sua senha." }, { status: 400 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  const invalid = Response.json(
    { message: "E-mail ou senha incorretos." },
    { status: 401 }
  );
  if (!user || !user.passwordHash) return invalid;

  const passwordOk = await compare(senha, user.passwordHash);
  if (!passwordOk) return invalid;

  if (profile !== user.role) {
    return Response.json(
      {
        message: `Esta conta é do perfil ${roleLabel[user.role]}. Entre pela aba correspondente.`,
      },
      { status: 403 }
    );
  }

  await setSession(user);
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
