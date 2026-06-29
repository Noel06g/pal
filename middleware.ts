import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight gate: redirect unauthenticated visitors away from /admin and
 * /llogaria by checking for the Auth.js session cookie. This is only a cheap
 * first pass — the REAL authorization (isAdmin, ownership, isBanned) is enforced
 * server-side in the page/layout and in every server action. Never rely on this
 * alone.
 */
const PROTECTED = [/^\/admin(\/|$)/, /^\/llogaria(\/|$)/];

const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((re) => re.test(pathname));
  if (!needsAuth) return NextResponse.next();

  const hasSession = SESSION_COOKIES.some((c) => req.cookies.has(c));
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/hyr";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/llogaria/:path*"],
};
