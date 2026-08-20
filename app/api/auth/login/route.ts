import { NextResponse } from "next/server";
import { saveUserAssessment } from "@/backend/queries/assessment";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";
import { getUserByEmail, updateUserSanctuaryName, updateUserCategory } from "@/backend/queries/users";
import { recordUserLogin } from "@/backend/queries/streak";
import crypto from "crypto";

function verifyPassword(password: string, storedHash: string | null): boolean {
  if (!storedHash) return false;
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
    const users = await getUserByEmail(email);

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
      await updateUserSanctuaryName(user.id, sanctuaryName);
    }

    // Record login streak activity
    const streakInfo = await recordUserLogin(user.id);

    const rawCategory = user.selected_category || "student";
    const mappedCategory = rawCategory === "couples" || rawCategory === "couple" ? "couples" : (rawCategory === "parents" || rawCategory === "parent" ? "parents" : rawCategory);

    const userProfile = {
      id: user.id,
      name: sanctuaryName,
      sanctuaryName: sanctuaryName,
      email: user.email,
      avatar: user.avatar || "/images/user_avatar.jpg",
      streakDays: streakInfo.currentStreak,
      mindfulnessMinutes: user.mindfulness_minutes || 0,
      currentMood: user.current_mood || "Sanctuary Member",
      selectedCategory: mappedCategory,
    };

    if (category) {
      const incomingCategory = category === "couples" || category === "couple" ? "couples" : (category === "parents" || category === "parent" ? "parents" : category);
      if (incomingCategory !== userProfile.selectedCategory) {
        console.log("[Login API] [POINT 3 — after login] Updating selectedCategory in DB:", incomingCategory);
        await updateUserCategory(user.id, incomingCategory);
        userProfile.selectedCategory = incomingCategory;
      }
    }

    // 4. Save assessment answers if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      const userCategory = category || userProfile.selectedCategory;
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
      category: userProfile.selectedCategory,
      currentStreak: streakInfo.currentStreak,
      longestStreak: streakInfo.longestStreak,
      lastLoginAt: streakInfo.lastLoginAt,
    };

    // Set session cookie
    const response = NextResponse.json(sessionData);
    response.cookies.set("manraah_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    response.cookies.set("userType", userProfile.selectedCategory, {
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
      { error: "Failed to log in. Please try again." },
      { status: 500 }
    );
  }
}
