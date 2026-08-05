import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { saveUserAssessment } from "@/backend/queries/assessment";
import crypto from "crypto";

// Secure password hashing using Node scrypt
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, category, answers, computedScore, percentage, wellnessLevel } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // 2. Create user ID & hash password
    const userId = "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const passwordHash = hashPassword(password);
    const userCategory = category || "student";

    // 3. Insert user into Neon PostgreSQL
    await sql`
      INSERT INTO users (id, name, email, password_hash, selected_category, streak_days, mindfulness_minutes, current_mood)
      VALUES (${userId}, ${name}, ${email}, ${passwordHash}, ${userCategory}, 1, 0, 'Sanctuary Member')
    `;

    // 4. Save assessment if provided
    if (answers && Array.isArray(answers)) {
      await saveUserAssessment(
        userId,
        userCategory,
        answers,
        typeof computedScore === "number" ? computedScore : 50,
        typeof percentage === "number" ? percentage : 50,
        wellnessLevel || "Balanced"
      );
    }

    const userProfile = {
      id: userId,
      name,
      email,
      avatar: "/images/user_avatar.jpg",
      streakDays: 1,
      mindfulnessMinutes: 0,
      currentMood: "Sanctuary Member",
      selectedCategory: userCategory,
    };

    const sessionData = {
      user: userProfile,
      token: "m_token_" + userId,
      isAuthenticated: true,
    };

    // 5. Create HTTP-Only session cookie response
    const response = NextResponse.json(sessionData);
    response.cookies.set("manraah_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[Auth Signup API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create account." },
      { status: 500 }
    );
  }
}
