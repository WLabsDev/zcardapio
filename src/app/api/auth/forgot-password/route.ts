import { randomBytes, createHash } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getPublicOrigin } from "@/lib/site-config";
import { apiHandler } from "@/lib/api";

const schema = z.object({
  email: z.email("Informe um e-mail válido."),
});

const TOKEN_TTL_MS = 30 * 60 * 1000;

/** Recuperação de senha de vendedor/admin (login por e-mail) via link enviado por SMTP. */
export const POST = apiHandler(async (request: Request) => {
  // Proteção contra abuso/força bruta: no máx. 5 solicitações/hora por IP.
  const rl = rateLimit(`forgot:${clientIp(request)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return Response.json(
      { message: "Muitas solicitações. Aguarde e tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const email = parsed.data.email.trim().toLowerCase();

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, name: true, email: true, role: true },
  });

  // Nunca revela se o e-mail existe ou não — resposta sempre igual.
  if (
    user &&
    user.email &&
    (user.role === "restaurante" || user.role === "admin")
  ) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

    const resetUrl = `${getPublicOrigin(request)}/redefinir-senha?token=${token}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl).catch((e) =>
      console.error("[forgot-password] falha ao enviar e-mail:", e)
    );
  }

  return Response.json({
    message:
      "Se existir uma conta com esse e-mail, você receberá um link para redefinir sua senha.",
  });
});
