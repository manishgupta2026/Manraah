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

  let hasSession = false;
  const manraahSessionCookie = request.cookies.get("manraah_session")?.value;
  if (manraahSessionCookie) {
    try {
      // Decode and parse the session cookie
      const parsed = JSON.parse(decodeURIComponent(manraahSessionCookie));
      if (parsed && parsed.isAuthenticated && parsed.user && parsed.user.id) {
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
    const userTypeCookie = request.cookies.get("userType")?.value || "student";
    const userType = userTypeCookie === "couples" || userTypeCookie === "couple" ? "couples" : (userTypeCookie === "parents" || userTypeCookie === "parent" ? "parents" : "student");
    const loginUrl = new URL(`/login?redirectTo=/dashboard/${userType}&userType=${userType}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users on the welcome root only -> redirect to their dashboard
  // DO NOT redirect /login or /signup — user may be coming from a fresh assessment
  // and needs to authenticate to save their results.
  if (pathname === "/" && hasSession) {
    const userTypeCookie = request.cookies.get("userType")?.value;
    let targetUserType = userTypeCookie || "";

    if (!userTypeCookie && manraahSessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(manraahSessionCookie));
        if (parsed?.user?.selectedCategory) {
          targetUserType = parsed.user.selectedCategory;
        }
      } catch {}
    }

    const userType = targetUserType === "couples" || targetUserType === "couple" ? "couples" : (targetUserType === "parents" || targetUserType === "parent" ? "parents" : "");
    if (userType) {
      const dashboardUrl = new URL(`/dashboard/${userType}`, request.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      const selectionUrl = new URL("/category-selection", request.url);
      return NextResponse.redirect(selectionUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next|_document|_error|favicon.ico|images).*)",
  ],
};
