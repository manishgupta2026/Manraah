import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { getMoodHistory, getWeeklySummary, getMoodInsights } from "@/backend/queries/mood";
import { getUserStreak, getUserProfile } from "@/backend/queries/assessment";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id || "demo-user";

  try {
    // 1. Fetch user info
    let userResult = await sql`
      SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood 
      FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (userResult.length === 0) {
      const defaultName = "Gentle Willow";
      const defaultEmail = userId === "demo-user" ? "demo@manraah.com" : `${userId}@manraah.com`;
      await sql`
        INSERT INTO users (id, name, sanctuary_name, email, selected_category, streak_days, mindfulness_minutes, current_mood)
        VALUES (${userId}, ${defaultName}, ${defaultName}, ${defaultEmail}, 'working_professional', 1, 0, 'Calm')
        ON CONFLICT (id) DO NOTHING
      `;
      userResult = await sql`
        SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood 
        FROM users WHERE id = ${userId} LIMIT 1
      `;
    }

    const user = userResult[0];
    let sanctuaryName = user.sanctuary_name;
    if (!sanctuaryName) {
      sanctuaryName = await generateUniqueSanctuaryName();
      await sql`
        UPDATE users SET sanctuary_name = ${sanctuaryName}, name = ${sanctuaryName} WHERE id = ${user.id}
      `;
    }

    // 2. Fetch parallel data
    const [history, weeklySummary, insights, streak, userProfile, latestReflections] = await Promise.all([
      getMoodHistory(userId, "all"),
      getWeeklySummary(userId),
      getMoodInsights(userId),
      getUserStreak(userId),
      getUserProfile(userId),
      sql`
        SELECT id, title, excerpt, content, mood_tag, category, created_at 
        FROM journal_entries 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 3
      `,
    ]);

    // 3. Today's check-in
    const latestMood = history.length > 0 ? history[0] : null;
    const isToday = latestMood
      ? new Date(latestMood.created_at).toDateString() === new Date().toDateString()
      : false;
    const todayMood = isToday ? latestMood : null;

    // 4. Compute Work/Life/Rest Balance dynamically from user check-ins
    // Default baseline for working professional if no data yet: Work 54%, Personal 28%, Rest 18%
    let workPct = 54;
    let personalPct = 28;
    let restPct = 18;

    if (history.length > 0) {
      const recent = history.slice(0, 7);
      let stressSum = 0;
      let energySum = 0;
      let sleepSum = 0;

      recent.forEach((item: any) => {
        const s = item.stress;
        if (s === "High" || s === "Very High" || s === "Stressful" || s === "Very overwhelming") stressSum += 3;
        else if (s === "Manageable" || s === "A little stressful") stressSum += 2;
        else stressSum += 1;

        energySum += Number(item.energy) || 3;
        sleepSum += Number(item.sleep_quality || item.sleep || 3);
      });

      const totalFactors = (stressSum * 1.5) + (energySum * 1.1) + (sleepSum * 1.2);
      if (totalFactors > 0) {
        workPct = Math.min(75, Math.max(35, Math.round(((stressSum * 1.5) / totalFactors) * 100)));
        restPct = Math.min(35, Math.max(12, Math.round(((sleepSum * 1.2) / totalFactors) * 100)));
        personalPct = 100 - workPct - restPct;
        if (personalPct < 15) {
          personalPct = 15;
          workPct = 100 - personalPct - restPct;
        }
      }
    }

    let balanceInsight = "Work and personal space are gently balancing. Keep taking small pauses throughout your day.";
    if (workPct >= 55) {
      balanceInsight = "Work has been taking up a little more space this week. Make room for something that restores you.";
    } else if (restPct <= 16) {
      balanceInsight = "Your rest reserve is running a bit low. Protect an extra 30 minutes of quiet tonight.";
    } else if (personalPct >= 35) {
      balanceInsight = "You have maintained beautiful boundaries for personal renewal this week.";
    }

    // 5. Build dynamic working professional payload
    const data = {
      user: {
        id: user.id,
        name: sanctuaryName,
        sanctuaryName: sanctuaryName,
        email: user.email,
        avatar: user.avatar || "",
        selectedCategory: "working_professional",
        streakDays: streak.currentStreak || user.streak_days || 1,
        mindfulnessMinutes: user.mindfulness_minutes || 0,
        currentMood: user.current_mood || "Calm",
        assessmentScore: userProfile?.total_score || 38,
        assessmentPercentage: userProfile?.percentage || 76,
        wellnessLevel: userProfile?.wellness_level || "Stable",
      },
      todayMood,
      history: history.slice(0, 14),
      weeklySummary,
      insights,
      streak: {
        currentStreak: streak.currentStreak || 1,
        longestStreak: streak.longestStreak || 1,
      },
      balance: {
        work: workPct,
        personal: personalPct,
        rest: restPct,
        insight: balanceInsight,
      },
      recentReflections: latestReflections || [],
      recommendation: weeklySummary?.aiRecommendation || "Release the workday at your doorway with a 2-minute mindful reset.",
    };

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("API GET /api/dashboard/working-professional error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load working professional dashboard data" },
      { status: 500 }
    );
  }
}
