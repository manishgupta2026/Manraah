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

  // Skip internal Next.js system routes, API handlers, static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/logo")
  ) {
    return NextResponse.next();
  }

  let hasSession = false;
  const manraahSessionCookie = request.cookies.get("manraah_session")?.value;
  if (
    manraahSessionCookie &&
    manraahSessionCookie !== "null" &&
    manraahSessionCookie !== "undefined" &&
    manraahSessionCookie.trim() !== ""
  ) {
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
    } catch {
      hasSession = false;
    }
  }

  // 1. Unauthenticated users trying to access protected features -> redirect immediately to /login
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);
    
    // Clear any invalid or stale cookies if present
    if (manraahSessionCookie) {
      redirectResponse.cookies.delete("manraah_session");
      redirectResponse.cookies.delete("userType");
    }
    redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return redirectResponse;
  }

  // 2. Authenticated users trying to access auth routes (/login, /signup) -> redirect to /dashboard
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && hasSession) {
    const dashboardUrl = new URL("/dashboard", request.url);
    const redirectResponse = NextResponse.redirect(dashboardUrl);
    redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return redirectResponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|_document|_error|favicon.ico|images|logo|category).*)",
  ],
};
