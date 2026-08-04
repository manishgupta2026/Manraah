"use server";

import { cookies } from "next/headers";
import { sql } from "@/backend/db/client";
import { AuthSession, UserProfile } from "@/backend/types";
import { initDatabase } from "@/backend/queries/assessment";

export async function signUpAction(
  name: string,
  email: string,
  pass: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  await initDatabase();
  try {
    // Check if email already exists
    const existing = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    if (existing.length > 0) {
      return { success: false, error: "An account with this email already exists." };
    }

    const id = `user-${Date.now()}`;
    await sql`
      INSERT INTO users (id, name, email, password)
      VALUES (${id}, ${name}, ${email}, ${pass})
    `;

    const user: UserProfile = {
      id,
      name,
      email,
      avatar: "/images/user_avatar.jpg",
      streakDays: 1,
      mindfulnessMinutes: 0,
      currentMood: "Sanctuary Member",
      selectedCategory: "student",
    };

    const session: AuthSession = {
      user,
      token: `token-${Date.now()}`,
      isAuthenticated: true,
    };

    const cookieStore = await cookies();
    cookieStore.set("manraah_session", "true", { path: "/", maxAge: 86400 });

    return { success: true, session };
  } catch (err: any) {
    console.error("SignUp Server Action Error:", err);
    return { success: false, error: err.message || "Failed to create account." };
  }
}

export async function signInAction(
  email: string,
  pass: string
): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
  await initDatabase();
  try {
    const usersResult = await sql`
      SELECT * FROM users WHERE email = ${email} AND password = ${pass} LIMIT 1
    `;
    if (usersResult.length === 0) {
      return { success: false, error: "Invalid email or password." };
    }

    const dbUser = usersResult[0];

    // Try to load user profile details if they exist
    const profileResult = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${dbUser.id} LIMIT 1
    `;
    const category = profileResult.length > 0 ? profileResult[0].category : "student";

    const user: UserProfile = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      avatar: "/images/user_avatar.jpg",
      streakDays: 14,
      mindfulnessMinutes: 180,
      currentMood: "Serene & Focused",
      selectedCategory: category,
    };

    const session: AuthSession = {
      user,
      token: `token-${Date.now()}`,
      isAuthenticated: true,
    };

    const cookieStore = await cookies();
    cookieStore.set("manraah_session", "true", { path: "/", maxAge: 86400 });

    return { success: true, session };
  } catch (err: any) {
    console.error("SignIn Server Action Error:", err);
    return { success: false, error: err.message || "Authentication failed." };
  }
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.set("manraah_session", "", { path: "/", expires: new Date(0) });
}

export async function getDashboardSummaryAction(userId: string): Promise<any> {
  await initDatabase();
  try {
    const userResult = await sql`
      SELECT id, name, email FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (userResult.length === 0) return null;

    const user = userResult[0];
    const profileResult = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;
    const profile = profileResult.length > 0 ? profileResult[0] : null;

    return {
      name: user.name,
      email: user.email,
      category: profile ? profile.category : null,
      totalScore: profile ? profile.total_score : null,
      percentage: profile ? profile.percentage : null,
      wellnessLevel: profile ? profile.wellness_level : null,
    };
  } catch (err) {
    console.error("Error in getDashboardSummaryAction server action:", err);
    return null;
  }
}
