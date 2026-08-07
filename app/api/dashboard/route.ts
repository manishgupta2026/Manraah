import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { getMoodHistory, getWeeklySummary, getMoodInsights, getMonthlySummary } from "@/backend/queries/mood";
import { getUserStreak } from "@/backend/queries/assessment";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    // 1. Fetch user & profile info
    let userResult = await sql`
      SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (userResult.length === 0) {
      const defaultName = userId === "demo-user" ? "Demo Member" : "Sanctuary Member";
      const defaultEmail = userId === "demo-user" ? "demo@manraah.com" : `${userId}@manraah.com`;
      const defaultCategory = "parent"; // default to parent so parent dashboard is loaded
      await sql`
        INSERT INTO users (id, name, email, selected_category, streak_days, mindfulness_minutes, current_mood)
        VALUES (${userId}, ${defaultName}, ${defaultEmail}, ${defaultCategory}, 1, 0, 'Sanctuary Member')
        ON CONFLICT (id) DO NOTHING
      `;
      userResult = await sql`
        SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood FROM users WHERE id = ${userId} LIMIT 1
      `;
      if (userResult.length === 0) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }
    }
    const user = userResult[0];

    // Migrate/generate sanctuary name if missing
    let sanctuaryName = user.sanctuary_name;
    if (!sanctuaryName) {
      sanctuaryName = await generateUniqueSanctuaryName();
      await sql`
        UPDATE users SET sanctuary_name = ${sanctuaryName}, name = ${sanctuaryName} WHERE id = ${user.id}
      `;
    }

    // 2. Fetch mood history logs
    const history = await getMoodHistory(userId, "all");

    // 3. Fetch weekly summary
    const weeklySummary = await getWeeklySummary(userId);

    // 4. Fetch monthly summary
    const monthlySummary = await getMonthlySummary(userId);

    // 5. Fetch insights
    const insights = await getMoodInsights(userId);

    // 6. Fetch user streak
    const streak = await getUserStreak(userId);

    // 7. Get today's check-in details
    const todayMood = history.length > 0 ? history[0] : null;

    // Check if the latest check-in is indeed today
    const nowStr = new Date().toDateString();
    const isToday = todayMood ? new Date(todayMood.created_at).toDateString() === nowStr : false;
    const finalTodayMood = isToday ? todayMood : null;

    // 8. Generate dynamic recommendations based on variables
    let recommendation = weeklySummary?.aiRecommendation || "Focus on matching your pace with slow cycles to restore internal alignment.";
    
    if (finalTodayMood) {
      const moodLower = finalTodayMood.mood.toLowerCase();
      
      // Override recommendation dynamically based on checkin responses
      if (finalTodayMood.energy <= 2 || moodLower === "exhausted" || moodLower === "exhausted" || moodLower === "tired" || moodLower === "sleepy") {
        recommendation = "Your energy level is very depleted. We strongly recommend relaxing to sleep soundscapes (like Ocean Waves) instead of active meditation.";
      } else if (finalTodayMood.stress === "High" || finalTodayMood.stress === "Very High" || moodLower === "anxious" || moodLower === "overwhelmed" || moodLower === "frustrated") {
        recommendation = "System registers heightened tension rates. Try completing a 5-minute deep breathing session in the Mindfulness Player.";
      } else if (moodLower === "sad" || moodLower === "low") {
        recommendation = "Logging reflections in the Sanctuary Journal is recommended to release emotional weight and build coping context.";
      }
    }

    const dashboardState = {
      user: {
        id: user.id,
        name: sanctuaryName,
        sanctuaryName: sanctuaryName,
        email: user.email,
        avatar: user.avatar || "/images/user_avatar.jpg",
        selectedCategory: user.selected_category || "student",
        streakDays: streak.currentStreak || user.streak_days || 1,
        mindfulnessMinutes: user.mindfulness_minutes || 0,
        currentMood: user.current_mood || "Sanctuary Member",
      },
      todayMood: finalTodayMood,
      history,
      weeklySummary,
      monthlySummary,
      insights,
      streak: {
        currentStreak: streak.currentStreak || 1,
        longestStreak: streak.longestStreak || 1,
      },
      recommendation,
    };

    return NextResponse.json(dashboardState);
  } catch (err: any) {
    console.error("API GET /api/dashboard error:", err);
    return NextResponse.json({ error: err.message || "Failed to load dashboard data" }, { status: 500 });
  }
}
