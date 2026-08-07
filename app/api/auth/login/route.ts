import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { saveUserAssessment } from "@/backend/queries/assessment";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";
import crypto from "crypto";

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === originalHash;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, category, answers, computedScore, percentage, wellnessLevel } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Fetch user from Neon PostgreSQL
    const users = await sql`
      SELECT id, name, email, password_hash, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood
      FROM users
      WHERE LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = users[0];

    // 2. Verify password hash
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Migration: generate Sanctuary Name for existing users if missing
    let sanctuaryName = user.sanctuary_name;
    if (!sanctuaryName) {
      sanctuaryName = await generateUniqueSanctuaryName();
      await sql`
        UPDATE users SET sanctuary_name = ${sanctuaryName}, name = ${sanctuaryName} WHERE id = ${user.id}
      `;
    }

    const userProfile = {
      id: user.id,
      name: sanctuaryName,
      sanctuaryName: sanctuaryName,
      email: user.email,
      avatar: user.avatar || "/images/user_avatar.jpg",
      streakDays: user.streak_days || 1,
      mindfulnessMinutes: user.mindfulness_minutes || 0,
      currentMood: user.current_mood || "Sanctuary Member",
      selectedCategory: user.selected_category || "student",
    };

    // 3. Save assessment if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      const userCategory = category || user.selected_category || "student";
      // Update selected_category in users table
      await sql`
        UPDATE users SET selected_category = ${userCategory} WHERE id = ${user.id}
      `;
      userProfile.selectedCategory = userCategory;

      await saveUserAssessment(
        user.id,
        userCategory,
        answers,
        typeof computedScore === "number" ? computedScore : 50,
        typeof percentage === "number" ? percentage : 50,
        wellnessLevel || "Balanced"
      );
    }

    const sessionData = {
      user: userProfile,
      token: "m_token_" + user.id,
      isAuthenticated: true,
    };

    // 3. Set session cookie
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
    console.error("[Auth Login API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to log in." },
      { status: 500 }
    );
  }
}
