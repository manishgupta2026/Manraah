import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { getMoodHistory, getWeeklySummary, getMoodInsights, getMonthlySummary } from "@/backend/queries/mood";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    const body = await req.json();
    const { mood, energy, stress, sleep, reflection, factors } = body;

    if (!mood || energy === undefined || !stress) {
      return NextResponse.json({ error: "Missing required fields: mood, energy, stress" }, { status: 400 });
    }

    // 1. Establish start and end of today
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // 2. Prevent duplicates by checking if today's checkin or mood exists
    const existingCheckin = await sql`
      SELECT id FROM daily_checkins 
      WHERE user_id = ${userId} AND created_at >= ${startOfToday} AND created_at <= ${endOfToday}
      LIMIT 1
    `;
    const existingMood = await sql`
      SELECT id FROM mood_entries 
      WHERE user_id = ${userId} AND created_at >= ${startOfToday} AND created_at <= ${endOfToday}
      LIMIT 1
    `;

    // 3. Save / Update check-in in daily_checkins
    if (existingCheckin.length > 0) {
      await sql`
        UPDATE daily_checkins
        SET mood = ${mood}, energy_level = ${Number(energy)}, sleep_quality = ${sleep ? Number(sleep) : 3},
            gratitude_reflection = ${factors || "Checked in"}, daily_intention = ${reflection || "Take deep breaths"},
            reflection = ${reflection || ""}
        WHERE id = ${existingCheckin[0].id}
      `;
    } else {
      await sql`
        INSERT INTO daily_checkins (user_id, mood, energy_level, sleep_quality, gratitude_reflection, daily_intention, reflection, created_at)
        VALUES (${userId}, ${mood}, ${Number(energy)}, ${sleep ? Number(sleep) : 3}, ${factors || "Checked in"}, ${reflection || "Take deep breaths"}, ${reflection || ""}, CURRENT_TIMESTAMP)
      `;
    }

    // 4. Save / Update entry in mood_entries
    if (existingMood.length > 0) {
      await sql`
        UPDATE mood_entries
        SET mood = ${mood}, energy = ${Number(energy)}, stress = ${stress},
            reflection = ${reflection || ""}, factors = ${factors || ""},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingMood[0].id}
      `;
    } else {
      await sql`
        INSERT INTO mood_entries (user_id, mood, energy, stress, reflection, factors, created_at, updated_at)
        VALUES (${userId}, ${mood}, ${Number(energy)}, ${stress}, ${reflection || ""}, ${factors || ""}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
    }

    // 5. Update user streaks
    const streakResult = await sql`
      SELECT * FROM user_streaks WHERE user_id = ${userId} LIMIT 1
    `;

    let currentStreak = 1;
    let longestStreak = 1;

    if (streakResult.length === 0) {
      const streakId = `streak-${Date.now()}`;
      await sql`
        INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
        VALUES (${streakId}, ${userId}, 1, 1, ${now})
      `;
    } else {
      const streakRecord = streakResult[0];
      if (!streakRecord.last_checkin_date) {
        await sql`
          UPDATE user_streaks
          SET current_streak = 1,
              longest_streak = GREATEST(longest_streak, 1),
              last_checkin_date = ${now},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;
      } else {
        const lastCheckIn = new Date(streakRecord.last_checkin_date);
        const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffTime = Math.abs(nowDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak = streakRecord.current_streak + 1;
          longestStreak = Math.max(currentStreak, streakRecord.longest_streak);
        } else if (diffDays === 0) {
          currentStreak = streakRecord.current_streak;
          longestStreak = streakRecord.longest_streak;
        } else {
          currentStreak = 1;
          longestStreak = streakRecord.longest_streak;
        }

        await sql`
          UPDATE user_streaks
          SET current_streak = ${currentStreak},
              longest_streak = ${longestStreak},
              last_checkin_date = ${now},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;
      }
    }

    // Update users streak_days column directly
    await sql`
      UPDATE users SET streak_days = ${currentStreak} WHERE id = ${userId}
    `;

    // 6. Calculate wellness metrics and insert/update in wellness_metrics table
    const moodScoreMap: Record<string, number> = {
      Amazing: 5,
      Happy: 4.5,
      Calm: 4,
      Okay: 3,
      Low: 2,
      Overwhelmed: 1
    };
    const stressScoreMap: Record<string, number> = {
      Peaceful: 5,
      Manageable: 4,
      "A little stressful": 3,
      Stressful: 2,
      "Very overwhelming": 1
    };
    const moodScore = moodScoreMap[mood] || 3;
    const stressScore = stressScoreMap[stress] || 3;
    const energyScore = Number(energy);
    const sleepScore = sleep ? Number(sleep) : 3;
    const wellnessScore = Math.round(((moodScore + energyScore + stressScore + sleepScore) / 20) * 100);

    const existingMetrics = await sql`
      SELECT id FROM wellness_metrics 
      WHERE user_id = ${userId} AND date >= ${startOfToday} AND date <= ${endOfToday}
      LIMIT 1
    `;

    if (existingMetrics.length > 0) {
      await sql`
        UPDATE wellness_metrics
        SET wellness_score = ${wellnessScore}, stress_score = ${stressScore}, energy_score = ${energyScore},
            sleep_score = ${sleepScore}, mood_score = ${moodScore}, streak = ${currentStreak}
        WHERE id = ${existingMetrics[0].id}
      `;
    } else {
      await sql`
        INSERT INTO wellness_metrics (user_id, date, wellness_score, stress_score, energy_score, sleep_score, mood_score, streak, created_at)
        VALUES (${userId}, CURRENT_TIMESTAMP, ${wellnessScore}, ${stressScore}, ${energyScore}, ${sleepScore}, ${moodScore}, ${currentStreak}, CURRENT_TIMESTAMP)
      `;
    }

    // 7. Generate updated dashboard payload (Single source of truth)
    const userResult = await sql`
      SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood FROM users WHERE id = ${userId} LIMIT 1
    `;
    const user = userResult[0];
    const sanctuaryName = user.sanctuary_name || user.name;

    const history = await getMoodHistory(userId, "all");
    const weeklySummary = await getWeeklySummary(userId);
    const monthlySummary = await getMonthlySummary(userId);
    const insights = await getMoodInsights(userId);

    const todayMood = history.length > 0 ? history[0] : null;
    const isToday = todayMood ? new Date(todayMood.created_at).toDateString() === now.toDateString() : false;
    const finalTodayMood = isToday ? todayMood : null;

    let recommendation = weeklySummary?.aiRecommendation || "Focus on matching your pace with slow cycles to restore internal alignment.";
    if (finalTodayMood) {
      const moodLower = finalTodayMood.mood.toLowerCase();
      if (finalTodayMood.energy <= 2 || moodLower === "exhausted" || moodLower === "tired" || moodLower === "sleepy") {
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
        streakDays: currentStreak,
        mindfulnessMinutes: user.mindfulness_minutes || 0,
        currentMood: user.current_mood || "Sanctuary Member",
      },
      todayMood: finalTodayMood,
      history,
      weeklySummary,
      monthlySummary,
      insights,
      streak: {
        currentStreak,
        longestStreak: Math.max(currentStreak, streakResult[0]?.longest_streak || 1),
      },
      recommendation,
    };

    return NextResponse.json(dashboardState);
  } catch (err: any) {
    console.error("API POST /api/checkin error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
