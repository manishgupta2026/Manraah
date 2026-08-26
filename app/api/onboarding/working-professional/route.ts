import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";
import { generateUniqueSanctuaryName } from "@/backend/auth/sanctuary";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      age,
      profession,
      industry,
      workSchedule,
      workingHours,
      workSituation,
      wellnessGoals,
      mood,
      stress,
      energy,
      sleep,
      workLifeBalance,
      email: customEmail,
      password: customPassword,
    } = body;

    // 1. Resolve Authenticated User or create demo/onboarded user
    const session = getAuthSessionFromRequest();
    let userId = session.user?.id;
    let preferredName = name?.trim();

    if (!preferredName) {
      preferredName = await generateUniqueSanctuaryName();
    }

    if (!userId) {
      // Create new user record
      userId = "usr_" + Math.random().toString(36).substring(2, 10);
      const email = customEmail || `${userId}@manraah.com`;
      await sql`
        INSERT INTO users (
          id, name, sanctuary_name, email, selected_category, 
          age, profession, industry, work_schedule, working_hours, work_situation, wellness_goals, onboarding_completed,
          streak_days, mindfulness_minutes, current_mood
        ) VALUES (
          ${userId}, ${preferredName}, ${preferredName}, ${email}, 'working-professional',
          ${age || null}, ${profession || null}, ${industry || null}, ${workSchedule || null}, ${workingHours || null}, ${workSituation || null}, ${JSON.stringify(wellnessGoals || [])}, true,
          1, 0, ${mood || 'Calm'}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sanctuary_name = EXCLUDED.sanctuary_name,
          selected_category = 'working-professional',
          age = EXCLUDED.age,
          profession = EXCLUDED.profession,
          industry = EXCLUDED.industry,
          work_schedule = EXCLUDED.work_schedule,
          working_hours = EXCLUDED.working_hours,
          work_situation = EXCLUDED.work_situation,
          wellness_goals = EXCLUDED.wellness_goals,
          onboarding_completed = true
      `;
    } else {
      // Update existing user
      await sql`
        UPDATE users SET
          name = COALESCE(${preferredName}, name),
          sanctuary_name = COALESCE(${preferredName}, sanctuary_name),
          selected_category = 'working-professional',
          age = ${age || null},
          profession = ${profession || null},
          industry = ${industry || null},
          work_schedule = ${workSchedule || null},
          working_hours = ${workingHours || null},
          work_situation = ${workSituation || null},
          wellness_goals = ${JSON.stringify(wellnessGoals || [])},
          onboarding_completed = true,
          current_mood = ${mood || 'Calm'}
        WHERE id = ${userId}
      `;
    }

    // 2. Calculate initial wellness score
    const scoreResult = calculateWellnessScore({
      mood: mood || "Good",
      stress: stress || "Manageable",
      energy: Number(energy) || 4,
      sleep: Number(sleep) || 4,
      workLifeBalance: Number(workLifeBalance) || 3,
    });

    const getCalendarDayString = (date: Date) => {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(date);
    };
    const todayStr = getCalendarDayString(new Date());

    // 3. Save initial check-in to mood_entries & daily_checkins
    await sql`
      INSERT INTO mood_entries (
        user_id, mood, energy, stress, sleep_quality, work_life_balance, reflection, factors, checkin_date
      ) VALUES (
        ${userId}, ${mood || 'Good'}, ${Number(energy) || 4}, ${typeof stress === 'string' ? stress : 'Manageable'}, 
        ${Number(sleep) || 4}, ${Number(workLifeBalance) || 3}, 'Initial baseline check-in from onboarding', ${workSituation || 'Working Professional'}, ${todayStr}
      )
    `;

    await sql`
      INSERT INTO daily_checkins (
        user_id, mood, energy_level, sleep_quality, stress, work_life_balance, note, checkin_date
      ) VALUES (
        ${userId}, ${mood || 'Good'}, ${Number(energy) || 4}, ${Number(sleep) || 4},
        ${typeof stress === 'string' ? stress : 'Manageable'}, ${Number(workLifeBalance) || 3}, 'Initial onboarding check-in', ${todayStr}
      )
    `;

    // 4. Save assessment record
    await sql`
      INSERT INTO assessments (
        user_id, category, total_score, max_score, percentage, wellness_level
      ) VALUES (
        ${userId}, 'working-professional', ${scoreResult.score}, 100, ${scoreResult.score}, ${scoreResult.level}
      )
    `;

    // 5. Ensure streak initialized
    await sql`
      INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
      VALUES (${'strk_' + userId}, ${userId}, 1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        last_checkin_date = CURRENT_TIMESTAMP
    `;

    // 6. Build session response
    const userProfile = {
      id: userId,
      name: preferredName,
      sanctuaryName: preferredName,
      email: customEmail || `${userId}@manraah.com`,
      avatar: "/images/user_avatar.jpg",
      streakDays: 1,
      mindfulnessMinutes: 0,
      currentMood: mood || "Calm",
      selectedCategory: "working-professional",
      assessmentPercentage: scoreResult.score,
      wellnessLevel: scoreResult.level,
    };

    const sessionData = {
      user: userProfile,
      token: "m_token_" + userId,
      isAuthenticated: true,
    };

    const response = NextResponse.json({
      success: true,
      score: scoreResult.score,
      level: scoreResult.level,
      user: userProfile,
      redirectUrl: "/dashboard/working-professional",
    });

    response.cookies.set("manraah_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    response.cookies.set("userType", "working-professional", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Error in POST /api/onboarding/working-professional:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save working professional onboarding data" },
      { status: 500 }
    );
  }
}
