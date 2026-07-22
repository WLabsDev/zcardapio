/**
 * Assinatura/verificação de JWT — seguro para o runtime Edge (proxy).
 * Não importe banco nem next/headers aqui.
 */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "zcardapio_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias, em segundos

/** Guarda a sessão original do admin enquanto ele visualiza como outro papel. */
export const IMPERSONATE_RETURN_COOKIE = "zcardapio_admin_return";
export const IMPERSONATE_MAX_AGE = 60 * 60; // 1 hora, em segundos

export type SessionRole = "admin" | "restaurante" | "cliente";

export type SessionPayload = {
  /** id do usuário (string, padrão JWT) */
  sub: string;
  name: string;
  email: string;
  role: SessionRole;
};

function getSecret() {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET não está definido (confira o arquivo .env).");
  }
  return new TextEncoder().encode(process.env.AUTH_SECRET);
}

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
