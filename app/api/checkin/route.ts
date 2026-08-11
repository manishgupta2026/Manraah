import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { mood, energy, stress, sleep, reflection, factors, gratitude } = body;

    if (!mood || energy === undefined || !stress) {
      return NextResponse.json({ error: "Missing required fields: mood, energy, stress" }, { status: 400 });
    }

    const gratitudeText = factors || gratitude || "";
    const reflectionText = reflection || "";

    const energyVal = Math.round(Number(energy) || 3);
    const sleepVal = Math.round(Number(sleep) || 3);

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
        SET mood = ${mood}, energy_level = ${energyVal}, stress = ${stress}, sleep_quality = ${sleepVal},
            gratitude_reflection = ${gratitudeText}, daily_intention = ${reflectionText},
            reflection = ${reflectionText}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingCheckin[0].id}
      `;
    } else {
      await sql`
        INSERT INTO daily_checkins (user_id, mood, energy_level, stress, sleep_quality, gratitude_reflection, daily_intention, reflection, created_at, updated_at)
        VALUES (${userId}, ${mood}, ${energyVal}, ${stress}, ${sleepVal}, ${gratitudeText}, ${reflectionText}, ${reflectionText}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
    }

    // 4. Save / Update entry in mood_entries
    const moodScoreMap: Record<string, number> = {
      Amazing: 5,
      Happy: 4,
      Calm: 4,
      Okay: 3,
      Low: 2,
      Overwhelmed: 1
    };
    const computedScore = Math.round((moodScoreMap[mood] || 3) * 2);

    if (existingMood.length > 0) {
      await sql`
        UPDATE mood_entries
        SET mood = ${mood}, energy = ${energyVal}, stress = ${stress}, score = ${computedScore},
            reflection = ${reflectionText}, factors = ${gratitudeText},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${existingMood[0].id}
      `;
    } else {
      const moodId = `mood-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await sql`
        INSERT INTO mood_entries (id, user_id, mood, score, energy, stress, reflection, factors, created_at, updated_at)
        VALUES (${moodId}, ${userId}, ${mood}, ${computedScore}, ${energyVal}, ${stress}, ${reflectionText}, ${gratitudeText}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
    const stressScoreMap: Record<string, number> = {
      Peaceful: 5,
      Manageable: 4,
      "A little stressful": 3,
      Stressful: 2,
      "Very overwhelming": 1
    };
    const moodScore = Math.round(moodScoreMap[mood] || 3);
    const stressScore = Math.round(stressScoreMap[stress] || 3);
    const energyScore = energyVal;
    const sleepScore = sleepVal;
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
    const [
      userResult,
      latestCheckInResult,
      moodHistory,
      wellnessMetrics,
      journalEntries,
      streakResult2,
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
    ]);

    const user = userResult[0] || {};
    const sanctuaryName = user.sanctuary_name || user.name || "Sanctuary Member";

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

    const streakInfo = streakResult2.length > 0 ? streakResult2[0] : { current_streak: currentStreak, longest_streak: 1 };

    // Generate dynamic recommendations based on check-in count
    let recommendation = "";
    if (moodHistory.length < 5) {
      recommendation = "We're still getting to know your wellness patterns. Keep checking in daily for more personalized suggestions.";
    } else {
      recommendation = "Focus on matching your pace with slow cycles to restore internal alignment.";
      if (latestCheckIn) {
        const moodLower = latestCheckIn.mood.toLowerCase();
        if (latestCheckIn.energy_level <= 2 || moodLower === "exhausted" || moodLower === "tired" || moodLower === "sleepy") {
          recommendation = "Your energy level is very depleted. We strongly recommend relaxing to sleep soundscapes (like Ocean Waves) instead of active meditation.";
        } else if (latestCheckIn.stress === "High" || latestCheckIn.stress === "Very High" || latestCheckIn.stress === "Stressful" || latestCheckIn.stress === "Very overwhelming" || moodLower === "anxious" || moodLower === "overwhelmed" || moodLower === "frustrated") {
          recommendation = "System registers heightened tension rates. Try completing a 5-minute deep breathing session in the Mindfulness Player.";
        } else if (moodLower === "sad" || moodLower === "low") {
          recommendation = "Logging reflections in the Sanctuary Journal is recommended to release emotional weight and build coping context.";
        }
      }
    }

    // Generate dynamic insights based on check-in count
    let insights = [];
    if (moodHistory.length <= 2) {
      insights = [{ insightText: "We're learning about your wellness journey." }];
    } else if (moodHistory.length <= 6) {
      insights = [{ insightText: "We're beginning to identify your emotional patterns." }];
    } else {
      const entries = moodHistory;
      const generated = [];

      const familyEntries = entries.filter((e: any) => e.factors?.toLowerCase().includes("family"));
      const familyHappy = familyEntries.filter((e: any) => ["amazing", "happy", "calm", "good"].includes(e.mood.toLowerCase()));
      if (familyEntries.length >= 2 && familyHappy.length / familyEntries.length >= 0.7) {
        generated.push({ insightText: "Family interactions significantly lift your spirits." });
      }

      const studyEntries = entries.filter((e: any) => e.factors?.toLowerCase().includes("studies") || e.factors?.toLowerCase().includes("work"));
      const studyTensed = studyEntries.filter((e: any) => ["anxious", "overwhelmed", "frustrated"].includes(e.mood.toLowerCase()) || ["High", "Very High", "Stressful", "Very overwhelming"].includes(e.stress));
      if (studyEntries.length >= 2 && studyTensed.length / studyEntries.length >= 0.6) {
        generated.push({ insightText: "Your stress indices increase noticeably during heavy work/study segments." });
      }

      const mondayEntries = entries.filter((e: any) => new Date(e.created_at).getDay() === 1);
      const mondayAnxious = mondayEntries.filter((e: any) => e.mood.toLowerCase() === "anxious" || e.mood.toLowerCase() === "exhausted");
      if (mondayEntries.length >= 2 && mondayAnxious.length / mondayEntries.length >= 0.5) {
        generated.push({ insightText: "You experience higher morning fatigue/restlessness on Mondays." });
      }

      if (generated.length === 0) {
        generated.push({ insightText: "Your stress levels show improvement on days with lower factor loads." });
        generated.push({ insightText: "Logging reflections consistently correlates with higher energy scores." });
      }
      insights = generated;
    }

    const dashboardState = {
      user: {
        id: user.id,
        name: sanctuaryName,
        sanctuaryName: sanctuaryName,
        email: user.email,
        avatar: user.avatar || "/images/user_avatar.jpg",
        selectedCategory: user.selected_category || "student",
        streakDays: streakInfo.current_streak || user.streak_days || 1,
        mindfulnessMinutes: user.mindfulness_minutes || 0,
        currentMood: user.current_mood || "Sanctuary Member",
      },
      todayMood: latestCheckIn && new Date(latestCheckIn.created_at).toDateString() === new Date().toDateString() ? latestCheckIn : null,
      latestCheckIn,
      moodHistory,
      wellnessMetrics,
      journalEntries,
      streak: {
        currentStreak: streakInfo.current_streak || 1,
        longestStreak: streakInfo.longest_streak || 1,
      },
      recommendation,
      recommendations: [recommendation],
      insights,
    };

    return NextResponse.json(dashboardState);
  } catch (err: any) {
    console.error("API POST /api/checkin error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
