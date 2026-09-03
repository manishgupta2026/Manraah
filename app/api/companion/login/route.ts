import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { verifyPassword } from "@/backend/auth/crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const companions = await sql`
      SELECT id, name, email, password_hash, role, status
      FROM companion_users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (companions.length === 0) {
      return NextResponse.json(
        { error: "Invalid companion or admin credentials." },
        { status: 401 }
      );
    }

    const companion = companions[0];
    const isValid = verifyPassword(password, companion.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid companion or admin credentials." },
        { status: 401 }
      );
    }

    const companionProfile = {
      id: companion.id,
      name: companion.name,
      email: companion.email,
      role: companion.role,
      status: companion.status || "ONLINE",
    };

    const sessionData = {
      companion: companionProfile,
      isAuthenticated: true,
    };

    const response = NextResponse.json(sessionData);
    response.cookies.set("manraah_companion_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[API POST /api/companion/login Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log into companion portal." },
      { status: 500 }
    );
  }
}
