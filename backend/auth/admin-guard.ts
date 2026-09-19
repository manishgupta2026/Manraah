import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Server-side guard for /api/admin/* route handlers.
 * Verifies that the caller has an active companion session with role === 'admin'.
 */
export function verifyAdminSession(request?: Request): { admin: AuthenticatedAdmin } | { errorResponse: NextResponse } {
  try {
    let companionRole: string | null = null;
    let sessionData: any = null;

    // 1. Try Next.js server cookieStore first
    try {
      const cookieStore = cookies();
      companionRole = cookieStore.get("manraah_companion_role")?.value?.toLowerCase() || null;
      const rawSession = cookieStore.get("manraah_companion_session")?.value;
      if (rawSession) {
        try {
          sessionData = JSON.parse(decodeURIComponent(rawSession));
        } catch {
          sessionData = JSON.parse(rawSession);
        }
      }
    } catch {
      // If cookies() is unavailable, fallback to request headers
    }

    // 2. Fallback to request Cookie header if needed
    if ((!companionRole || !sessionData) && request) {
      const cookieHeader = request.headers.get("cookie") || "";
      const matchRole = cookieHeader.match(/manraah_companion_role=([^;]+)/);
      if (matchRole) {
        companionRole = decodeURIComponent(matchRole[1]).toLowerCase();
      }
      const matchSession = cookieHeader.match(/manraah_companion_session=([^;]+)/);
      if (matchSession) {
        try {
          sessionData = JSON.parse(decodeURIComponent(matchSession[1]));
        } catch {
          sessionData = JSON.parse(matchSession[1]);
        }
      }
    }

    const role = (companionRole || sessionData?.companion?.role || "").toLowerCase();

    if (role !== "admin") {
      return {
        errorResponse: NextResponse.json(
          { error: "Forbidden: Administrative privileges required." },
          { status: 403 }
        ),
      };
    }

    const adminUser: AuthenticatedAdmin = {
      id: sessionData?.companion?.id || "admin-usr-1",
      name: sessionData?.companion?.name || "Executive Administrator",
      email: sessionData?.companion?.email || "admin@manraah.com",
      role: "admin",
    };

    return { admin: adminUser };
  } catch (err) {
    return {
      errorResponse: NextResponse.json(
        { error: "Unauthorized admin session." },
        { status: 401 }
      ),
    };
  }
}
