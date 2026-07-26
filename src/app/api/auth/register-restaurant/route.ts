import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { setSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { restaurants, users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/marketing-email";
import { apiHandler } from "@/lib/api";

const registerRestaurantSchema = z.object({
  nome: z.string().min(3, "Informe seu nome completo."),
  email: z.email("Informe um e-mail válido."),
  telefone: z.string().min(10, "Informe um telefone válido com DDD."),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  restauranteNome: z.string().min(2, "Informe o nome do restaurante."),
  slug: z
    .string()
    .min(3, "Escolha o endereço do seu cardápio.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  segmento: z.string().min(1, "Selecione o segmento."),
  endereco: z.string().min(5, "Informe o endereço."),
  cidade: z.string().min(2, "Informe a cidade."),
  estado: z.string().length(2, "Selecione o estado."),
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json().catch(() => null);
  const parsed = registerRestaurantSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const {
    nome,
    email,
    telefone,
    senha,
    restauranteNome,
    slug,
    segmento,
    endereco,
    cidade,
    estado,
  } = parsed.data;
  const address = `${endereco.trim()} — ${cidade.trim()}/${estado}`;
  const normalizedEmail = email.toLowerCase();

  const existingEmail = await db.query.users.findFirst({
    where: eq(users.email, normalizedEmail),
  });
  if (existingEmail) {
    return Response.json(
      { message: "Este e-mail já está cadastrado. Faça login." },
      { status: 409 }
    );
  }

  const existingSlug = await db.query.restaurants.findFirst({
    where: eq(restaurants.slug, slug),
  });
  if (existingSlug) {
    return Response.json(
      { message: `O endereço ${slug}.zcardapio.com.br já está em uso.` },
      { status: 409 }
    );
  }

  const passwordHash = await hash(senha, 10);

  const result = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        name: nome,
        email: normalizedEmail,
        phone: telefone,
        passwordHash,
        role: "restaurante",
      })
      .returning();

    const [restaurant] = await tx
      .insert(restaurants)
      .values({
        ownerId: user.id,
        // Plano pago só é atribuído após pagamento confirmado (checkout).
        // No registro o restaurante entra sempre no grátis.
        planId: null,
        slug,
        name: restauranteNome,
        segment: segmento,
        address,
        phone: telefone,
        // Novo restaurante já entra no ar — a promessa é "no ar em uma noite".
        status: "ativo",
        isOpen: true,
      })
      .returning();

    return { user, restaurant };
  });

  await setSession(result.user);

  // Boas-vindas por e-mail. Fire-and-forget: é um efeito colateral não crítico,
  // então não pode atrasar nem derrubar o cadastro se o SMTP falhar.
  sendWelcomeEmail(
    { id: result.user.id, name: result.user.name, email: result.user.email },
    { name: result.restaurant.name, slug: result.restaurant.slug }
  ).catch((err) => console.error("[register] e-mail de boas-vindas falhou:", err));

  return Response.json(
    {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      restaurant: {
        id: result.restaurant.id,
        slug: result.restaurant.slug,
        name: result.restaurant.name,
      },
    },
    { status: 201 }
  );
});
