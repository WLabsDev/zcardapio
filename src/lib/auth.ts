/**
 * Sessão do lado do servidor (cookies) — use em Route Handlers,
 * Server Components e Server Actions.
 */
import { cookies } from "next/headers";
import {
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
