import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  let userId = session.user?.id;

  try {
    // 1. Resolve User
    let userResult: any[] = [];
    if (userId) {
      userResult = await sql`
        SELECT 
          id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood,
          age, profession, industry, work_schedule, working_hours, work_situation, wellness_goals, onboarding_completed, created_at
        FROM users WHERE id = ${userId} LIMIT 1
      `;
    }

    if (userResult.length === 0) {
      // Find latest working professional user or demo user
      const latestWp = await sql`
        SELECT 
          id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood,
          age, profession, industry, work_schedule, working_hours, work_situation, wellness_goals, onboarding_completed, created_at
        FROM users 
        WHERE selected_category IN ('working-professional', 'working_professional')
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      if (latestWp.length > 0) {
        userResult = latestWp;
        userId = userResult[0].id;
      } else {
        userId = userId || "demo-wp-user";
        const defaultName = "Ashutosh";
        await sql`
          INSERT INTO users (
            id, name, sanctuary_name, email, selected_category, 
            profession, work_schedule, working_hours, work_situation,
            streak_days, mindfulness_minutes, current_mood, onboarding_completed
          ) VALUES (
            ${userId}, ${defaultName}, ${defaultName}, 'demo@manraah.com', 'working-professional',
            'Software Engineer', 'Hybrid', '40 hrs/wk', 'Comfortable',
            1, 0, 'Good', true
          )
          ON CONFLICT (id) DO UPDATE SET selected_category = 'working-professional'
        `;
        userResult = await sql`
          SELECT * FROM users WHERE id = ${userId} LIMIT 1
        `;
      }
    }

    const user = userResult[0];
    const preferredName = user.name || user.sanctuary_name || "Sanctuary Member";

    // 2. Fetch Check-ins History (from daily_checkins & mood_entries)
    const rawCheckins = await sql`
      SELECT 
        id, 
        user_id, 
        mood, 
        energy_level as energy, 
        sleep_quality, 
        stress, 
        work_life_balance, 
        note, 
        created_at
      FROM daily_checkins
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 14
    `;

    // Also fetch from mood_entries if daily_checkins is empty
    let history = rawCheckins;
    if (history.length === 0) {
      const moodHistory = await sql`
        SELECT 
          id, 
          user_id, 
          mood, 
          energy, 
          COALESCE(sleep_quality, 3) as sleep_quality, 
          stress, 
          COALESCE(work_life_balance, 3) as work_life_balance, 
          reflection as note, 
          created_at
        FROM mood_entries
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 14
      `;
      history = moodHistory;
    }

    // 3. Today's Check-in
    const latestCheckin = history.length > 0 ? history[0] : null;
    const isToday = latestCheckin
      ? new Date(latestCheckin.created_at).toDateString() === new Date().toDateString()
      : false;
    const todayCheckin = isToday ? latestCheckin : null;

    // 4. Calculate Dynamic Wellness Score
    // Use today's checkin or average of past checkins
    let currentScore = 76;
    let scoreLevel = "STABLE";
    let scoreBreakdown = { mind: 78, energy: 72, rest: 75, balance: 74 };
    let deltaVsLastWeek = 0;

    if (history.length > 0) {
      const activeEntry = todayCheckin || history[0];
      const result = calculateWellnessScore({
        mood: activeEntry.mood || "Good",
        stress: activeEntry.stress || "Manageable",
        energy: Number(activeEntry.energy) || 4,
        sleep: Number(activeEntry.sleep_quality) || 4,
        workLifeBalance: Number(activeEntry.work_life_balance) || 3,
      });

      currentScore = result.score;
      scoreLevel = result.level;
      scoreBreakdown = result.breakdown;

      // Calculate past week average comparison if more than 1 entry exists
      if (history.length > 1) {
        const pastEntries = history.slice(1);
        let pastTotal = 0;
        pastEntries.forEach((e: any) => {
          const res = calculateWellnessScore({
            mood: e.mood,
            stress: e.stress,
            energy: Number(e.energy) || 3,
            sleep: Number(e.sleep_quality) || 3,
            workLifeBalance: Number(e.work_life_balance) || 3,
          });
          pastTotal += res.score;
        });
        const pastAvg = Math.round(pastTotal / pastEntries.length);
        deltaVsLastWeek = currentScore - pastAvg;
      }
    }

    // 5. Dynamic Consecutive Streak Calculation
    let calculatedStreak = 0;
    if (history.length > 0) {
      // Sort unique checkin dates
      const uniqueDates = Array.from(
        new Set(history.map((h: any) => new Date(h.created_at).toDateString()))
      );

      const todayStr = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        calculatedStreak = uniqueDates.length;
      } else {
        calculatedStreak = 0;
      }
    }
    const streakDays = Math.max(1, calculatedStreak || user.streak_days || 1);

    // 6. Fetch Recent Journal Reflections
    const recentReflections = await sql`
      SELECT id, title, excerpt, content, mood_tag, category, created_at 
      FROM journal_entries 
      WHERE user_id = ${user.id} 
      ORDER BY created_at DESC 
      LIMIT 3
    `;

    // 7. Activity Sessions (Decompression / Reset)
    const sessionsResult = await sql`
      SELECT count(*) as count
      FROM activity_sessions
      WHERE user_id = ${user.id} AND completed = true
    `;
    const completedSessionsCount = parseInt(sessionsResult[0]?.count || "0", 10);

    // 8. Construct Response Payload
    return NextResponse.json({
      user: {
        id: user.id,
        name: preferredName,
        preferredName,
        email: user.email,
        avatar: user.avatar || "/images/user_avatar.jpg",
        selectedCategory: "working-professional",
        age: user.age,
        profession: user.profession || "Working Professional",
        industry: user.industry,
        workSchedule: user.work_schedule,
        workingHours: user.working_hours,
        workSituation: user.work_situation,
        wellnessGoals: user.wellness_goals || [],
        streakDays,
        mindfulnessMinutes: user.mindfulness_minutes || completedSessionsCount * 2,
        currentMood: todayCheckin?.mood || user.current_mood || "Good",
        assessmentPercentage: currentScore,
        wellnessLevel: scoreLevel,
      },
      todayMood: todayCheckin?.mood || null,
      todayCheckin,
      history: history.slice(0, 7),
      wellnessScore: {
        score: currentScore,
        level: scoreLevel,
        breakdown: scoreBreakdown,
        delta: deltaVsLastWeek,
      },
      streak: {
        currentStreak: streakDays,
        longestStreak: Math.max(streakDays, user.streak_days || 1),
      },
      recentReflections: recentReflections || [],
      completedSessionsCount,
    });
  } catch (err: any) {
    console.error("API GET /api/dashboard/working-professional error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load working professional dashboard" },
      { status: 500 }
    );
  }
}
