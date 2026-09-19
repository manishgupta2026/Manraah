import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_USER_ROUTES = [
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
  "/profile",
  "/settings",
  "/crisis-support",
  "/call",
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

  // 1. Regular User Session Detection
  let hasSession = false;
  const manraahSessionCookie = request.cookies.get("manraah_session")?.value;
  if (manraahSessionCookie) {
    try {
      let raw = manraahSessionCookie;
      try {
        raw = decodeURIComponent(raw);
      } catch (e) {}
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.isAuthenticated || parsed.user?.id) && parsed.user && parsed.user.id) {
        hasSession = true;
      }
    } catch (err) {
      hasSession = false;
    }
  }

  if (
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token")
  ) {
    hasSession = true;
  }

  // 2. Companion / Admin Role Detection
  const companionRoleCookie = request.cookies.get("manraah_companion_role")?.value?.toLowerCase();
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
      let raw = companionSessionCookie;
      try {
        raw = decodeURIComponent(raw);
      } catch (e) {}
      const parsed = JSON.parse(raw);
      const role = (parsed?.companion?.role || (parsed?.isAuthenticated ? "listener" : null))?.toLowerCase();
      if (role === "admin" || role === "listener" || role === "user") {
        companionRole = role;
      }
    } catch {
      companionRole = null;
    }
  }

  // 3. Public Admin & Companion Login Routes
  if (pathname === "/admin/login" || pathname === "/companion/login") {
    if (companionRole === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (companionRole === "listener") {
      return NextResponse.redirect(new URL("/listener/human-companion", request.url));
    }
    return NextResponse.next();
  }

  // 4. Admin Route Gateway (/admin/*) — Gated strictly for role === 'admin'
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

  // 5. Listener Route Gateway (/listener/* & /companion/dashboard) — Gated strictly for role === 'listener'
  if (pathname.startsWith("/listener") || pathname.startsWith("/companion/dashboard")) {
    if (!companionRole || companionRole !== "listener") {
      // If admin tries to access listener action screens -> send to admin dashboard (oversight view)
      if (companionRole === "admin") {
        return NextResponse.redirect(new URL("/admin/human-companion-network", request.url));
      }
      // Unauthenticated or regular user -> send to admin login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  // 6. Protected User Routes — Gated for authenticated users or companions
  const isProtectedUserRoute = PROTECTED_USER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedUserRoute && !hasSession && !companionRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 7. Regular Auth Routes (/login, /signup) for authenticated users -> redirect to /dashboard
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|_document|_error|favicon.ico|images|logo|category).*)",
  ],
};
