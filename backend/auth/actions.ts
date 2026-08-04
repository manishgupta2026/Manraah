"use server";

import { sql } from "@/backend/db/client";
import { initDatabase, saveDailyCheckIn, getUserStreak, getDailyCheckInSummary } from "@/backend/queries/assessment";

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

export async function saveDailyCheckInAction(
  userId: string,
  data: {
    mood: string;
    energyLevel: number;
    sleepQuality: number;
    gratitudeReflection: string;
    dailyIntention: string;
  }
) {
  try {
    const result = await saveDailyCheckIn(userId, data);
    return { success: true, currentStreak: result.currentStreak };
  } catch (err: any) {
    console.error("Error in saveDailyCheckInAction:", err);
    return { success: false, error: err.message || "Failed to save check-in." };
  }
}

export async function getUserStreakAction(userId: string) {
  try {
    const streak = await getUserStreak(userId);
    return { success: true, currentStreak: streak.currentStreak, longestStreak: streak.longestStreak };
  } catch (err) {
    console.error("Error in getUserStreakAction:", err);
    return { success: false, currentStreak: 0, longestStreak: 0 };
  }
}

export async function getDailyCheckInSummaryAction(userId: string) {
  try {
    const summary = await getDailyCheckInSummary(userId);
    return { success: true, summary };
  } catch (err) {
    console.error("Error in getDailyCheckInSummaryAction:", err);
    return { success: false, summary: null };
  }
}
