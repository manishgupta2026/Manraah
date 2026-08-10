import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Authenticate directly against companion_users table in Neon PostgreSQL
    const companions = await sql`
      SELECT id, name, email, password_hash, role, status
      FROM companion_users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (companions.length === 0) {
      return NextResponse.json(
        { error: "Invalid admin or listener credentials." },
        { status: 401 }
      );
    }

    const companion = companions[0];
    const isValid = verifyPassword(password, companion.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin or listener credentials." },
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

    // Set HTTP session cookie and role cookie
    response.cookies.set("manraah_companion_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    response.cookies.set("manraah_companion_role", companionProfile.role, {
      httpOnly: false,
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
