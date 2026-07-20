import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  verifyToken,
  type SessionRole,
} from "@/lib/session";

const ROLE_HOME: Record<SessionRole, string> = {
  admin: "/admin",
  restaurante: "/vendedor",
  cliente: "/cliente",
};

const PROTECTED: { prefix: string; role: SessionRole }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/vendedor", role: "restaurante" },
  { prefix: "/cliente", role: "cliente" },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rule = PROTECTED.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)
  );
  if (!rule) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.role !== rule.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendedor/:path*", "/cliente/:path*"],
};
