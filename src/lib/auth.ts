/**
 * Sessão do lado do servidor (cookies) — use em Route Handlers,
 * Server Components e Server Actions.
 */
import { cookies } from "next/headers";
import {
  IMPERSONATE_MAX_AGE,
  IMPERSONATE_RETURN_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signToken,
  verifyToken,
  type SessionPayload,
  type SessionRole,
} from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(user: {
  id: number;
  name: string;
  email: string | null;
  role: SessionRole;
}) {
  const token = await signToken({
    sub: String(user.id),
    name: user.name,
    email: user.email ?? "",
    role: user.role,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Admin passa a navegar com a sessão de outro papel (cliente/restaurante),
 * guardando a sessão original numa cookie separada para poder voltar depois.
 */
export async function startImpersonation(target: {
  id: number;
  name: string;
  email: string | null;
  role: SessionRole;
}) {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!currentToken) return;

  const targetToken = await signToken({
    sub: String(target.id),
    name: target.name,
    email: target.email ?? "",
    role: target.role,
  });

  cookieStore.set(IMPERSONATE_RETURN_COOKIE, currentToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: IMPERSONATE_MAX_AGE,
  });
  cookieStore.set(SESSION_COOKIE, targetToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: IMPERSONATE_MAX_AGE,
  });
}

/** Restaura a sessão original do admin, encerrando a visualização como outro papel. */
export async function stopImpersonation() {
  const cookieStore = await cookies();
  const returnToken = cookieStore.get(IMPERSONATE_RETURN_COOKIE)?.value;
  cookieStore.delete(IMPERSONATE_RETURN_COOKIE);
  if (!returnToken) return false;
  cookieStore.set(SESSION_COOKIE, returnToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return true;
}

/** true quando a sessão atual é uma visualização "ver como" iniciada por um admin. */
export async function isImpersonating() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(IMPERSONATE_RETURN_COOKIE)?.value);
}
