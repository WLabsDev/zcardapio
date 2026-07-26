import { compare } from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { canonicalPhone, normalizePhone, phoneVariants } from "@/lib/phone";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { apiHandler } from "@/lib/api";

const loginSchema = z.object({
  // "cliente" = entra por WhatsApp; "restaurante" = entra por e-mail (cobre
  // tanto contas de restaurante quanto de admin, já que as duas usam e-mail).
  profile: z.enum(["restaurante", "cliente"]).default("cliente"),
  senha: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export const POST = apiHandler(async (request: Request) => {
  // Proteção contra força bruta: no máx. 10 tentativas/minuto por IP.
  const rl = rateLimit(`login:${clientIp(request)}`, 10, 60_000);
  if (!rl.ok) {
    return Response.json(
      { message: "Muitas tentativas de login. Aguarde instantes e tente novamente." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const { profile, senha } = parsed.data;

  // Cliente entra com o WhatsApp — vale pra qualquer conta que tenha esse
  // número cadastrado, não só perfil "cliente" (ex.: admin que prefira entrar
  // por WhatsApp no futuro).
  if (profile === "cliente") {
    const phone = normalizePhone(parsed.data.phone ?? "");
    if (phone.length < 10) {
      return Response.json(
        { message: "Informe um WhatsApp válido com DDD." },
        { status: 400 }
      );
    }

    // Aceita as duas grafias do celular (com e sem o nono dígito): a conta pode
    // ter sido criada de um jeito e o login vir do outro.
    const user = await db.query.users.findFirst({
      where: inArray(users.phone, phoneVariants(phone)),
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

    // Conta de cliente criada no pedido ainda não tem senha → manda definir
    // uma. Outros perfis sem senha (ex.: criados pelo admin sem senha) não
    // passam por esse fluxo — não faz sentido pra eles e o set-password é
    // cliente-only mesmo.
    if (!user.passwordHash) {
      if (user.role === "cliente") {
        // Devolve na forma canônica: é ela que o fluxo de definir senha usa a
        // seguir, e não faz sentido carregar a grafia solta que o cliente
        // digitou (com DDI, sem o nono dígito etc.).
        return Response.json({ needsPassword: true, phone: canonicalPhone(phone) });
      }
      return Response.json(
        {
          message:
            "Esta conta ainda não tem senha definida. Peça para o administrador configurar uma senha.",
        },
        { status: 401 }
      );
    }

    if (!senha || !(await compare(senha, user.passwordHash))) {
      return Response.json({ message: "Senha incorreta." }, { status: 401 });
    }

    await setSession(user);
    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  }

  // Restaurante / Admin — os dois entram por e-mail, sem aba separada.
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

  if (user.role === "cliente") {
    return Response.json(
      {
        message: "Esta conta é de cliente. Entre pela aba WhatsApp com seu número.",
      },
      { status: 403 }
    );
  }

  await setSession(user);
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});
