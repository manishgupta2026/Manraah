import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_USER_ROUTES = [
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
  "/journey",
  "/crisis-support",
  "/call",
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

  // Session Cookies & Roles
  const hasUserSession =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token") ||
    request.cookies.has("manraah_session");

  const companionRoleCookie = request.cookies.get("manraah_companion_role")?.value;
  const companionSessionCookie = request.cookies.get("manraah_companion_session")?.value;

  let companionRole: "admin" | "listener" | "user" | null = null;

  if (
    companionRoleCookie === "admin" ||
    companionRoleCookie === "listener" ||
    companionRoleCookie === "user"
  ) {
    companionRole = companionRoleCookie as any;
  } else if (companionSessionCookie) {
    try {
      const decoded = decodeURIComponent(companionSessionCookie);
      const parsed = JSON.parse(decoded);
      companionRole = parsed?.companion?.role || (parsed?.isAuthenticated ? "listener" : null);
    } catch {
      try {
        const parsed = JSON.parse(companionSessionCookie);
        companionRole = parsed?.companion?.role || (parsed?.isAuthenticated ? "listener" : null);
      } catch {
        companionRole = null;
      }
    }
  }

  // 1. PUBLIC ADMIN & COMPANION LOGIN ROUTES
  if (pathname === "/admin/login" || pathname === "/companion/login") {
    if (companionRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (companionRole === "listener") {
      return NextResponse.redirect(new URL("/listener/human-companion", request.url));
    }
    return NextResponse.next();
  }

  // 2. ADMIN ROUTE GATEWAY (/admin/*) — Gated strictly for role === 'admin'
  if (pathname.startsWith("/admin")) {
    if (!companionRole || companionRole !== "admin") {
      // If listener tries to access admin routes -> send to listener portal
      if (companionRole === "listener") {
        return NextResponse.redirect(new URL("/listener/human-companion", request.url));
      }
      // Unauthenticated or regular user -> send to admin login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  // 3. LISTENER ROUTE GATEWAY (/listener/* & /companion/dashboard) — Gated strictly for role === 'listener'
  if (pathname.startsWith("/listener") || pathname.startsWith("/companion/dashboard")) {
    if (!companionRole || companionRole !== "listener") {
      // If admin tries to access listener action screens -> send to admin dashboard (oversight view)
      if (companionRole === "admin") {
        return NextResponse.redirect(new URL("/admin/human-companion-network", request.url));
      }
      // Unauthenticated or regular user -> send to user login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // 4. PROTECTED USER ROUTES — Gated for authenticated users
  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedUserRoute && !hasUserSession && !companionRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. AUTH / ONBOARDING REDIRECTS FOR LOGGED IN USERS
  const isAuthOrOnboarding = [...AUTH_ROUTES, ...ONBOARDING_ROUTES].some(
    (route) => pathname === route
  );

  if (isAuthOrOnboarding) {
    if (companionRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (companionRole === "listener") {
      return NextResponse.redirect(new URL("/listener/human-companion", request.url));
    }
    if (hasUserSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
