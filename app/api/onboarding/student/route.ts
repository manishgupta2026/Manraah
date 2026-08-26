import { NextResponse } from "next/server";
import { sql } from "@/backend/db/client";
import { getAuthSessionFromRequest } from "@/backend/auth/session";

export const dynamic = "force-dynamic";

async function ensureOnboardingSchema() {
  try {
    // 1. Ensure onboarding completed timestamp exists
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE`;
    
    // 2. Ensure student_onboarding_assessments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS student_onboarding_assessments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB DEFAULT '[]'::jsonb,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (err) {
    console.error("Failed to verify/create onboarding tables:", err);
  }
}

export async function POST(req: Request) {
  try {
    const session = getAuthSessionFromRequest();
    const userId = session.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure database schema matches
    await ensureOnboardingSchema();

    // Verify user profile category & status
    const userCategoryResult = await sql`
      SELECT selected_category, onboarding_completed FROM users WHERE id = ${userId} LIMIT 1
    `;
    if (userCategoryResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = userCategoryResult[0];
    const userCategory = (userRecord.selected_category || "student").toLowerCase().trim();

    if (userCategory !== "student") {
      return NextResponse.json({ error: "Category access denied" }, { status: 403 });
    }

    // Allow completing the assessment multiple times (for retakes)


    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length !== 10) {
      return NextResponse.json({ error: "Onboarding requires exactly 10 answers." }, { status: 400 });
    }

    // Map answers to database equivalents for profile setup
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

    const q3Sleep = answers[2]?.answer || "6 to 8 hours";
    let dbSleepScore = 75;
    if (q3Sleep.includes("8+")) {
      dbSleepScore = 95;
    } else if (q3Sleep.includes("6 to 8")) {
      dbSleepScore = 80;
    } else if (q3Sleep.includes("4 to 6")) {
      dbSleepScore = 55;
    } else {
      dbSleepScore = 30;
    }

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
        onboarding_completed_at = CURRENT_TIMESTAMP,
        current_mood = ${dbMood}
      WHERE id = ${userId}
    `;

    // 2. Save onboarding answers into student_onboarding_assessments
    await sql`
      INSERT INTO student_onboarding_assessments (user_id, answers)
      VALUES (${userId}, ${JSON.stringify(answers)})
    `;

    // 3. Seed baseline sleep record so charts and wellness calculation have data (only if none exists)
    const sleepRecordCountResult = await sql`
      SELECT COUNT(*) FROM student_sleep_records WHERE user_id = ${userId}
    `;
    if (parseInt(sleepRecordCountResult[0].count) === 0) {
      await sql`
        INSERT INTO student_sleep_records (user_id, sleep_time, wake_time, duration_minutes, quality_score)
        VALUES (${userId}, (CURRENT_TIMESTAMP - INTERVAL '8 hours'), CURRENT_TIMESTAMP, 480, ${dbSleepScore})
      `;
    }

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

    const response = NextResponse.json({
      success: true,
      message: "Student onboarding completed successfully",
      onboardingCompleted: true
    });

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
