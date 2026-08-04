import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/ai-chat",
  "/checkin",
  "/journal",
  "/meditation",
  "/sleep",
  "/community",
  "/resources",
  "/professional-care",
  "/journey",
  "/reports",
  "/profile",
  "/crisis-support",
  "/call",
];

const AUTH_ROUTES = ["/login", "/signup"];
const ONBOARDING_ROUTES = ["/", "/category-selection", "/assessment", "/wellness-score"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js system routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const hasSession = 
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token") ||
    request.cookies.has("manraah_session");

  // 1. Unauthenticated users trying to access protected features -> redirect to /login
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users trying to access onboarding or auth routes -> redirect to /dashboard
  const isAuthOrOnboarding = [...AUTH_ROUTES, ...ONBOARDING_ROUTES].some(
    (route) => pathname === route
  );

  if (isAuthOrOnboarding && hasSession) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|_document|_error|favicon.ico|images).*)",
  ],
};
