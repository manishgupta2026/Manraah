import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parallelize all independent database queries with strict LIMITs
    const [
      userResult,
      latestCheckInResult,
      moodHistory,
      wellnessMetrics,
      journalEntries,
      streakResult,
      latestAssessmentResult,
    ] = await Promise.all([
      sql`
        SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood 
        FROM users 
        WHERE id = ${userId} 
        LIMIT 1
      `,
      sql`
        SELECT id, user_id, mood, energy_level, sleep_quality, gratitude_reflection, daily_intention, reflection, created_at 
        FROM daily_checkins 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `,
      sql`
        SELECT id, user_id, mood, energy, stress, reflection, factors, created_at 
        FROM mood_entries 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 7
      `,
      sql`
        SELECT id, user_id, date, wellness_score, stress_score, energy_score, sleep_score, mood_score, streak 
        FROM wellness_metrics 
        WHERE user_id = ${userId} 
        ORDER BY date DESC 
        LIMIT 7
      `,
      sql`
        SELECT id, user_id, title, excerpt, content, mood_tag, category, created_at 
        FROM journal_entries 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 5
      `,
      sql`
        SELECT current_streak, longest_streak, last_checkin_date 
        FROM user_streaks 
        WHERE user_id = ${userId} 
        LIMIT 1
      `,
      sql`
        SELECT id, user_id, category, total_score, max_score, percentage, wellness_level, created_at 
        FROM assessments 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      `,
    ]);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];
    const sanctuaryName = user.sanctuary_name || user.name || "Sanctuary Member";
    const streak = streakResult.length > 0 ? streakResult[0] : { current_streak: 1, longest_streak: 1 };

    // Format latest check-in
    let latestCheckIn: any = null;
    if (latestCheckInResult.length > 0) {
      const checkin = latestCheckInResult[0];
      const matchMood = moodHistory.find(
        (m: any) => new Date(m.created_at).toDateString() === new Date(checkin.created_at).toDateString()
      );
      latestCheckIn = {
        ...checkin,
        stress: matchMood ? matchMood.stress : "Manageable",
      };
    }

    // Determine today's mood (only if check-in was logged today)
    const todayMood = latestCheckIn && new Date(latestCheckIn.created_at).toDateString() === new Date().toDateString()
      ? latestCheckIn
      : null;

    // Generate real dynamic recommendation based on actual entries
    let recommendation = "";
    if (moodHistory.length === 0) {
      recommendation = "Welcome to your sanctuary! Start your day with a peaceful reflection or gentle meditation to establish your wellness rhythm.";
    } else if (moodHistory.length < 5) {
      recommendation = "We're beginning to learn your wellness rhythm. Continue checking in daily for deeper personalized recommendations.";
    } else {
      recommendation = "Focus on matching your pace with slow cycles to restore internal alignment.";
      if (latestCheckIn) {
        const moodLower = (latestCheckIn.mood || "").toLowerCase();
        if (latestCheckIn.energy_level <= 2 || moodLower === "exhausted" || moodLower === "tired" || moodLower === "sleepy") {
          recommendation = "Your energy level is depleted. We recommend relaxing to sleep soundscapes (like Ocean Waves) instead of active meditation.";
        } else if (
          latestCheckIn.stress === "High" ||
          latestCheckIn.stress === "Very High" ||
          latestCheckIn.stress === "Stressful" ||
          latestCheckIn.stress === "Very overwhelming" ||
          moodLower === "anxious" ||
          moodLower === "overwhelmed" ||
          moodLower === "frustrated"
        ) {
          recommendation = "Heightened tension rates detected. Try completing a 5-minute deep breathing session in the Mindfulness Player.";
        } else if (moodLower === "sad" || moodLower === "low") {
          recommendation = "Logging reflections in your sanctuary journal can help release emotional weight and build coping context.";
        }
      }
    }

    // Generate real dynamic insights based on actual entries
    let insights: any[] = [];
    if (moodHistory.length === 0) {
      insights = [];
    } else if (moodHistory.length <= 2) {
      insights = [{ insightText: "Your sanctuary journey has begun. Regular reflections will reveal your emotional trends." }];
    } else {
      const familyEntries = moodHistory.filter((e: any) => e.factors?.toLowerCase().includes("family"));
      const familyHappy = familyEntries.filter((e: any) => ["amazing", "happy", "calm", "good"].includes(e.mood?.toLowerCase()));
      if (familyEntries.length >= 2 && familyHappy.length / familyEntries.length >= 0.7) {
        insights.push({ insightText: "Family interactions significantly lift your spirits." });
      }

      const studyEntries = moodHistory.filter((e: any) => e.factors?.toLowerCase().includes("studies") || e.factors?.toLowerCase().includes("work"));
      const studyTensed = studyEntries.filter((e: any) =>
        ["anxious", "overwhelmed", "frustrated"].includes(e.mood?.toLowerCase()) ||
        ["High", "Very High", "Stressful", "Very overwhelming"].includes(e.stress)
      );
      if (studyEntries.length >= 2 && studyTensed.length / studyEntries.length >= 0.6) {
        insights.push({ insightText: "Stress indices increase noticeably during heavy work/study segments." });
      }

      if (insights.length === 0) {
        insights.push({ insightText: "Consistent daily reflections correlate with stronger emotional regulation." });
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
        streakDays: streak.current_streak || user.streak_days || 1,
        mindfulnessMinutes: user.mindfulness_minutes || 0,
        currentMood: user.current_mood || "Sanctuary Member",
      },
      todayMood,
      latestCheckIn,
      moodHistory,
      wellnessMetrics,
      journalEntries,
      streak: {
        currentStreak: streak.current_streak || 1,
        longestStreak: streak.longest_streak || 1,
      },
      assessmentCompleted: latestAssessmentResult && latestAssessmentResult.length > 0,
      latestAssessment: latestAssessmentResult && latestAssessmentResult.length > 0 ? latestAssessmentResult[0] : null,
      recommendation,
      recommendations: [recommendation],
      insights,
    };

    return NextResponse.json(dashboardState);
  } catch (err: any) {
    console.error("API GET /api/dashboard error:", err);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
