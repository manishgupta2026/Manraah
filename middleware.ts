import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/appointments",
  "/journey",
  "/my-journey",
  "/resources",
  "/ai-companion",
  "/messages",
  "/human-companion",
  "/journal",
  "/community",
  "/sleep-meditation",
  "/sleep",
  "/meditation",
  "/profile",
  "/admin",
];

const AUTH_ROUTES = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js system routes and assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  let hasSession = false;
  const manraahSessionCookie = request.cookies.get("manraah_session")?.value;
  if (manraahSessionCookie && manraahSessionCookie !== "null" && manraahSessionCookie !== "undefined" && manraahSessionCookie.trim() !== "") {
    try {
      let raw = manraahSessionCookie;
      try {
        raw = decodeURIComponent(raw);
      } catch (e) {}
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.isAuthenticated === true &&
        parsed.user &&
        parsed.user.id &&
        typeof parsed.user.id === "string" &&
        parsed.user.id.trim().length > 0
      ) {
        hasSession = true;
      }
    } catch (err) {
      hasSession = false;
    }
  }

  // 1. Unauthenticated users trying to access protected features -> redirect to /login
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users trying to access auth routes (/login, /signup) -> redirect to /dashboard
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && hasSession) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|_document|_error|favicon.ico|images|logo|category).*)",
  ],
};
