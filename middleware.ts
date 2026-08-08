import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/ai-chat",
  "/checkin",
  "/journal",
  "/mood",
  "/mood-checkin",
  "/mood-tracking",
  "/meditation",
  "/sleep",
  "/community",
  "/resources",
  "/reports",
  "/profile",
  "/settings",
  "/professional-care",
  "/human-companion",
  "/journey",
  "/crisis-support",
  "/call",
  "/listener",
  "/companion",
];

const AUTH_ROUTES = ["/login", "/signup"];
const ONBOARDING_ROUTES = ["/", "/category-selection", "/assessment", "/wellness-score"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js system routes, api & static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_document") ||
    pathname.startsWith("/_error") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasUserSession = 
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token") ||
    request.cookies.has("manraah_session");

  const hasCompanionAdminSession = request.cookies.has("manraah_companion_session");

  // 1. STRICT ADMIN PORTAL SECURITY GATE: /admin/* & /companion/dashboard
  // Regular users (manraah_session) MUST NOT be allowed access.
  // Access requires a dedicated manraah_companion_session cookie.
  if (pathname.startsWith("/admin") || pathname.startsWith("/companion/dashboard")) {
    if (!hasCompanionAdminSession) {
      const loginUrl = new URL("/companion/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();
    // Security Hardening Headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  // 2. Unauthenticated users trying to access protected user features -> redirect to /login
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !hasUserSession && !hasCompanionAdminSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated users trying to access onboarding or auth routes -> redirect to /dashboard
  const isAuthOrOnboarding = [...AUTH_ROUTES, ...ONBOARDING_ROUTES].some(
    (route) => pathname === route
  );

  if (isAuthOrOnboarding && (hasUserSession || hasCompanionAdminSession)) {
    const targetUrl = hasCompanionAdminSession ? "/admin/human-companion" : "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
