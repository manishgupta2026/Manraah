import { NextResponse } from "next/server";

const COOKIE_NAMES = [
  "manraah_session",
  "userType",
  "manraah_userType",
  "manraah_auth_session",
  "session",
  "manraah_companion_session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function createLogoutResponse() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully." },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );

  COOKIE_NAMES.forEach((name) => {
    // Delete with secure flag matching production
    response.cookies.set(name, "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
    // Delete without secure flag
    response.cookies.set(name, "", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });
    // Explicit cookie delete API
    response.cookies.delete(name);
  });

  return response;
}

export async function POST() {
  return createLogoutResponse();
}

export async function GET() {
  return createLogoutResponse();
}
