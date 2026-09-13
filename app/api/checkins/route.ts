import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";
import { getCalendarDayString } from "@/backend/lib/date-utils";
import { calculateCheckinStreak } from "@/backend/lib/streak-utils";
import { normalizeCategoryForDb } from "@/backend/lib/category-utils";

export const dynamic = "force-dynamic";

let checkinSchemaInitialized = false;

async function ensureCheckinSchema() {
  if (checkinSchemaInitialized || (globalThis as any).__checkinSchemaInitialized) return;
  checkinSchemaInitialized = true;
  (globalThis as any).__checkinSchemaInitialized = true;

  try {
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS checkin_date DATE DEFAULT CURRENT_DATE`;
    await sql`ALTER TABLE daily_checkins ADD CONSTRAINT unique_user_daily_checkin_date UNIQUE (user_id, checkin_date)`;
  } catch (e) {
    // Constraint may already exist or table alteration done
  }
}

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayDateStr = getCalendarDayString(new Date());

  try {
    await ensureCheckinSchema();

    // Fetch all distinct check-in dates for deterministic streak calculation
    const allDatesRes = await sql`
      SELECT DISTINCT checkin_date, created_at
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY checkin_date DESC
    `;

    const allDates = allDatesRes.map((r: any) => r.checkin_date || r.created_at);
    const { currentStreak, longestStreak, hasCheckedInToday } = calculateCheckinStreak(allDates);

    // Fetch check-in records for history
    const checkins = await sql`
      SELECT id, user_id, mood, energy_level as energy, sleep_quality, stress, note, created_at, checkin_date, reflection
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 30
    `;

    const todayCheckin = checkins.find((c: any) => {
      if (c.checkin_date) {
        return getCalendarDayString(c.checkin_date) === todayDateStr;
      }
      return false;
    }) || null;

    // Sync streak to database tables
    try {
      await sql`UPDATE users SET streak_days = ${currentStreak} WHERE id = ${userId}`;
      await sql`
        INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
        VALUES (${'strk_' + userId}, ${userId}, ${currentStreak}, ${longestStreak}, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          current_streak = ${currentStreak},
          longest_streak = GREATEST(user_streaks.longest_streak, ${longestStreak}),
          last_checkin_date = CURRENT_TIMESTAMP
      `;
    } catch (syncErr) {
      console.error("[checkins] Non-fatal streak sync error:", syncErr);
    }

    return NextResponse.json({
      todayCheckin,
      hasCheckedInToday,
      currentStreak,
      longestStreak,
      history: checkins,
    });
  } catch (err: any) {
    console.error("GET /api/checkins error:", err);
    return NextResponse.json({ error: "Unable to retrieve check-ins." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userCategory = "student";
  const uRes = await sql`SELECT selected_category FROM users WHERE id = ${userId} LIMIT 1`;
  if (uRes.length > 0) {
    userCategory = uRes[0].selected_category || "student";
  }

  const dbCategory = normalizeCategoryForDb(userCategory);

  try {
    await ensureCheckinSchema();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const mood = body.mood || "Good";
    const energyVal = Math.min(5, Math.max(1, Number(body.energyLevel ?? body.energy) || 4));
    const stressVal = typeof (body.stressLevel ?? body.stress) === "string" ? (body.stressLevel ?? body.stress) : "Manageable";
    const sleepVal = Math.min(5, Math.max(1, Number(body.sleepQuality ?? body.sleep) || 4));
    const workLifeVal = Math.min(5, Math.max(1, Number(body.workLifeBalance ?? body.work_life_balance) || 4));
    const reflectionText = body.reflection || body.note || "";
    const gratitudeText = body.gratitude || body.factors || "";
    const intentionText = body.dailyIntention || body.daily_intention || body.intention || "";

    const todayDateStr = getCalendarDayString(new Date());

    // 1. Check if user already checked in today
    const existingCheckin = await sql`
      SELECT id, mood, energy_level, sleep_quality, stress, note, created_at, checkin_date
      FROM daily_checkins
      WHERE user_id = ${userId} AND checkin_date = ${todayDateStr}
      LIMIT 1
    `;

    let savedId;
    let createdAt;

    if (existingCheckin.length > 0) {
      savedId = existingCheckin[0].id;
      createdAt = existingCheckin[0].created_at;

      // Update existing check-in for today
      await sql`
        UPDATE daily_checkins
        SET mood = ${mood},
            energy_level = ${energyVal},
            stress = ${stressVal},
            sleep_quality = ${sleepVal},
            work_life_balance = ${workLifeVal},
            note = COALESCE(${reflectionText || null}, note),
            reflection = COALESCE(${reflectionText || null}, reflection),
            gratitude_reflection = COALESCE(${gratitudeText || null}, gratitude_reflection),
            daily_intention = COALESCE(${intentionText || null}, daily_intention),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${savedId}
      `;
    } else {
      // Insert new checkin for today
      const insertRes = await sql`
        INSERT INTO daily_checkins (
          user_id, mood, energy_level, sleep_quality, stress, work_life_balance,
          note, reflection, gratitude_reflection, daily_intention, checkin_date, created_at, updated_at
        ) VALUES (
          ${userId}, ${mood}, ${energyVal}, ${sleepVal}, ${stressVal}, ${workLifeVal},
          ${reflectionText || null}, ${reflectionText || null}, ${gratitudeText || null}, ${intentionText || null},
          ${todayDateStr}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id, created_at
      `;
      
      const savedRecord = insertRes[0];
      savedId = savedRecord?.id;
      createdAt = savedRecord?.created_at;
    }

    // 2. Compute wellness score
    const scoreResult = calculateWellnessScore({
      mood,
      stress: stressVal,
      energy: energyVal,
      sleep: sleepVal,
      workLifeBalance: workLifeVal,
    });

    try {
      await sql`
        INSERT INTO assessments (
          user_id, category, total_score, max_score, percentage, wellness_level
        ) VALUES (
          ${userId}, ${dbCategory}, ${scoreResult.score}, 100, ${scoreResult.score}, ${scoreResult.level}
        )
      `;
    } catch (assessErr) {
      console.error("[checkins] Non-fatal assessment logging error:", assessErr);
    }

    // 3. Deterministically recalculate streak from all dates
    const allDatesRes = await sql`
      SELECT DISTINCT checkin_date, created_at
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY checkin_date DESC
    `;

    const allDates = allDatesRes.map((r: any) => r.checkin_date || r.created_at);
    const { currentStreak, longestStreak } = calculateCheckinStreak(allDates);

    // 4. Update users table and user_streaks table
    await sql`
      UPDATE users SET
        current_mood = ${mood},
        streak_days = ${currentStreak}
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
      VALUES (${'strk_' + userId}, ${userId}, ${currentStreak}, ${longestStreak}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        current_streak = ${currentStreak},
        longest_streak = GREATEST(user_streaks.longest_streak, ${longestStreak}),
        last_checkin_date = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({
      success: true,
      hasCheckedInToday: true,
      currentStreak,
      longestStreak,
      checkIn: {
        id: savedId,
        user_id: userId,
        checkin_date: todayDateStr,
        mood: mood,
        stress_level: stressVal,
        energy_level: energyVal,
        sleep_quality: sleepVal,
        work_life_balance: workLifeVal,
        reflection: reflectionText || null,
        gratitude_reflection: gratitudeText || null,
        daily_intention: intentionText || null,
        created_at: createdAt,
      },
    });
  } catch (err: any) {
    console.error("POST /api/checkins error:", err);
    return NextResponse.json(
      { error: "Unable to save your check-in. Please try again." },
      { status: 500 }
    );
  }
}

