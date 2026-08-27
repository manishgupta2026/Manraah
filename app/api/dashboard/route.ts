import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { getMoodHistory, getWeeklySummary, getMoodInsights, getMonthlySummary } from "@/backend/queries/mood";
import { getUserStreak, getUserProfile } from "@/backend/queries/assessment";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";
import { getUserById, createDefaultUser, updateUserSanctuaryName } from "@/backend/queries/users";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    // 1. Fetch user & profile info
    let userResult = await getUserById(userId);
    if (userResult.length === 0) {
      const defaultName = userId === "demo-user" ? "Demo Member" : "Sanctuary Member";
      const defaultEmail = userId === "demo-user" ? "demo@manraah.com" : `${userId}@manraah.com`;
      const defaultCategory = "student"; // safe default; real category comes from assessment
      await createDefaultUser(userId, defaultName, defaultEmail, defaultCategory);
      userResult = await getUserById(userId);
      if (userResult.length === 0) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }
    }
    const user = userResult[0];

    // Migrate/generate sanctuary name if missing
    let sanctuaryName = user.sanctuary_name;
    if (!sanctuaryName) {
      sanctuaryName = await generateUniqueSanctuaryName();
      await updateUserSanctuaryName(user.id, sanctuaryName);
    }

    // 2. Fetch all child dashboard data in parallel
    const [history, weeklySummary, monthlySummary, insights, streak, userProfile] = await Promise.all([
      getMoodHistory(userId, "all"),
      getWeeklySummary(userId),
      getMonthlySummary(userId),
      getMoodInsights(userId),
      getUserStreak(userId),
      getUserProfile(userId),
    ]);

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
        selectedCategory: (
          user.selected_category === "couples" || user.selected_category === "couple" ? "couple" :
          user.selected_category === "parents" || user.selected_category === "parent" ? "parent" :
          user.selected_category === "working_professional" || user.selected_category === "working-professional" || user.selected_category === "young_pro" || user.selected_category === "youngprofessional" ? "working_professional" :
          user.selected_category || "student"
        ),
        streakDays: (streak && typeof streak.currentStreak === "number") ? streak.currentStreak : (user.streak_days || 0),
        mindfulnessMinutes: user.mindfulness_minutes || 0,
        currentMood: user.current_mood || "Sanctuary Member",
        assessmentScore: userProfile?.total_score || null,
        assessmentPercentage: userProfile?.percentage || null,
        assessmentCategory: userProfile?.category || null,
        wellnessLevel: userProfile?.wellness_level || null,
        dashboardState: user.dashboard_state || null,
      },
      todayMood: finalTodayMood,
      history,
      weeklySummary,
      monthlySummary,
      insights,
      streak: {
        currentStreak: (streak && typeof streak.currentStreak === "number") ? streak.currentStreak : 0,
        longestStreak: (streak && typeof streak.longestStreak === "number") ? streak.longestStreak : 0,
        lastCheckinDate: streak?.lastCheckinDate || null,
      },
      recommendation,
    };

    return NextResponse.json(dashboardState);
  } catch (err: any) {
    console.error("API GET /api/dashboard error:", err);
    return NextResponse.json({ error: err.message || "Failed to load dashboard data" }, { status: 500 });
  }
}
