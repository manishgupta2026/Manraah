import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length !== 10) {
      return NextResponse.json({ error: "Onboarding requires exactly 10 answers." }, { status: 400 });
    }

    // Map answers to database equivalents
    // Q2: Stress (index 1)
    const q2Stress = answers[1]?.answer || "Manageable";
    let dbStress = "Manageable";
    if (q2Stress.includes("Calm") || q2Stress.includes("relaxed")) {
      dbStress = "Manageable";
    } else if (q2Stress.includes("Manageable")) {
      dbStress = "Manageable";
    } else if (q2Stress.includes("Elevated")) {
      dbStress = "Stressed";
    } else if (q2Stress.includes("Overwhelming")) {
      dbStress = "Overwhelmed";
    }

    // Q3: Sleep Quality (index 2)
    const q3Sleep = answers[2]?.answer || "6 to 8 hours";
    let dbSleepScore = 75;
    let dbSleepQualityNum = 4;
    if (q3Sleep.includes("8+")) {
      dbSleepScore = 95;
      dbSleepQualityNum = 5;
    } else if (q3Sleep.includes("6 to 8")) {
      dbSleepScore = 80;
      dbSleepQualityNum = 4;
    } else if (q3Sleep.includes("4 to 6")) {
      dbSleepScore = 55;
      dbSleepQualityNum = 3;
    } else {
      dbSleepScore = 30;
      dbSleepQualityNum = 2;
    }

    // Q4: Focus (index 3)
    const q4Focus = answers[3]?.answer || "Mostly easy";
    let dbFocusNum = 4;
    if (q4Focus.includes("Very easy")) {
      dbFocusNum = 5;
    } else if (q4Focus.includes("Mostly easy")) {
      dbFocusNum = 4;
    } else if (q4Focus.includes("distracted")) {
      dbFocusNum = 3;
    } else {
      dbFocusNum = 2;
    }

    // Q8: Balance (index 7)
    const q8Balance = answers[7]?.answer || "Good balance";
    let dbBalanceNum = 4;
    if (q8Balance.includes("Excellent")) {
      dbBalanceNum = 5;
    } else if (q8Balance.includes("Good")) {
      dbBalanceNum = 4;
    } else if (q8Balance.includes("takes over")) {
      dbBalanceNum = 3;
    } else {
      dbBalanceNum = 2;
    }

    // Q9: Mood (index 8)
    const q9Mood = answers[8]?.answer || "Okay / Neutral";
    let dbMood = "Okay";
    if (q9Mood.includes("Good") || q9Mood.includes("Happy")) {
      dbMood = "Good";
    } else if (q9Mood.includes("Okay") || q9Mood.includes("Neutral")) {
      dbMood = "Okay";
    } else if (q9Mood.includes("Stressed") || q9Mood.includes("Anxious")) {
      dbMood = "Stressed";
    } else {
      dbMood = "Overwhelmed";
    }

    // 1. Update user record (onboarding completed & initial answers json)
    await sql`
      UPDATE users SET
        initial_answers_json = ${JSON.stringify(answers)},
        onboarding_completed = true,
        current_mood = ${dbMood}
      WHERE id = ${userId}
    `;

    // 2. Seed baseline sleep record so charts and wellness calculation have data
    await sql`
      INSERT INTO student_sleep_records (user_id, sleep_time, wake_time, duration_minutes, quality_score)
      VALUES (${userId}, (CURRENT_TIMESTAMP - INTERVAL '8 hours'), CURRENT_TIMESTAMP, 480, ${dbSleepScore})
    `;

    // 3. Seed baseline check-in to database
    await sql`
      INSERT INTO daily_checkins (user_id, mood, energy_level, sleep_quality, stress, note)
      VALUES (${userId}, ${dbMood}, ${dbFocusNum}, ${dbSleepQualityNum}, ${dbStress}, 'Baseline setup from onboarding')
    `;

    // 4. Update session cookies to reflect category and onboarding state
    const userResult = await sql`
      SELECT id, name, email, selected_category, avatar, streak_days, current_mood
      FROM users WHERE id = ${userId} LIMIT 1
    `;

    const user = userResult[0];
    const sessionData = {
      user: {
        id: user.id,
        name: user.name,
        sanctuaryName: user.name,
        email: user.email,
        avatar: user.avatar || "/images/user_avatar.jpg",
        streakDays: user.streak_days || 1,
        mindfulnessMinutes: 0,
        currentMood: user.current_mood,
        selectedCategory: "student",
        onboardingCompleted: true,
      },
      token: "m_token_" + userId,
      isAuthenticated: true,
    };

    const response = NextResponse.json({ success: true });
    response.cookies.set("manraah_session", JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Error in Student Onboarding API POST:", err);
    return NextResponse.json({ error: err.message || "Failed to save onboarding responses" }, { status: 500 });
  }
}
