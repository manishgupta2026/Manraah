import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";

export const dynamic = "force-dynamic";

async function ensureCheckinSchema() {
  try {
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS checkin_date DATE DEFAULT CURRENT_DATE`;
    await sql`ALTER TABLE daily_checkins ADD CONSTRAINT unique_user_daily_checkin_date UNIQUE (user_id, checkin_date)`;
  } catch (e) {
    // Constraint may already exist or table alteration done
  }
}

function getCalendarDayString(date: Date | string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(date));
}

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const localDate = url.searchParams.get("localDate") || getCalendarDayString(new Date());

  try {
    await ensureCheckinSchema();
    const checkins = await sql`
      SELECT id, user_id, mood, energy_level as energy, sleep_quality, stress, note, created_at, checkin_date, reflection
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 14
    `;

    const todayCheckin = checkins.find((c: any) => {
      if (c.checkin_date) {
        const dateStr = getCalendarDayString(c.checkin_date);
        return dateStr === localDate;
      }
      return false;
    }) || null;

    return NextResponse.json({
      todayCheckin,
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

  const dbCategory = userCategory.toLowerCase().trim().replace("-", "_");

  // Category verification: student or working professional only
  if (userCategory !== "student" && userCategory !== "working_professional" && userCategory !== "working-professional") {
    return NextResponse.json({ error: "Category access denied" }, { status: 403 });
  }

  try {
    await ensureCheckinSchema();
    const body = await req.json();
    const { mood, stressLevel, energyLevel, reflection } = body;

    const todayDateStr = getCalendarDayString(new Date());

    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const energyVal = Math.min(5, Math.max(1, Number(energyLevel) || 3));
    const stressVal = typeof stressLevel === "string" ? stressLevel : "Manageable";

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

      // Update daily_checkins
      await sql`
        UPDATE daily_checkins
        SET mood = ${mood}, energy_level = ${energyVal}, stress = ${stressVal}, note = ${reflection || null}, reflection = ${reflection || null}
        WHERE id = ${savedId}
      `;

      // Update mood_entries
      await sql`
        UPDATE mood_entries
        SET mood = ${mood}, energy = ${energyVal}, stress = ${stressVal}, reflection = ${reflection || null}
        WHERE user_id = ${userId} AND checkin_date = ${todayDateStr}
      `;
    } else {
      // Insert new checkin
      const insertRes = await sql`
        INSERT INTO daily_checkins (
          user_id, mood, energy_level, sleep_quality, stress, work_life_balance, note, checkin_date, reflection
        ) VALUES (
          ${userId}, ${mood}, ${energyVal}, 3, ${stressVal}, 3, ${reflection || null}, ${todayDateStr}, ${reflection || null}
        ) RETURNING id, created_at
      `;
      
      const savedRecord = insertRes[0];
      savedId = savedRecord?.id;
      createdAt = savedRecord?.created_at;

      await sql`
        INSERT INTO mood_entries (
          user_id, mood, energy, stress, sleep_quality, work_life_balance, reflection, checkin_date
        ) VALUES (
          ${userId}, ${mood}, ${energyVal}, ${stressVal}, 3, 3, ${reflection || null}, ${todayDateStr}
        )
      `;
    }

    // 2. Calculate updated wellness score
    const scoreResult = calculateWellnessScore({
      mood,
      stress: stressVal,
      energy: energyVal,
      sleep: 3,
      workLifeBalance: 3,
    });

    // 3. Update user current mood
    await sql`
      UPDATE users SET
        current_mood = ${mood}
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO assessments (
        user_id, category, total_score, max_score, percentage, wellness_level
      ) VALUES (
        ${userId}, ${dbCategory}, ${scoreResult.score}, 100, ${scoreResult.score}, ${scoreResult.level}
      )
    `;

    // 4. Update streak
    await sql`
      INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
      VALUES (${'strk_' + userId}, ${userId}, 1, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        current_streak = user_streaks.current_streak + 1,
        longest_streak = GREATEST(user_streaks.longest_streak, user_streaks.current_streak + 1),
        last_checkin_date = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({
      success: true,
      checkIn: {
        id: savedId,
        user_id: userId,
        checkin_date: todayDateStr,
        mood: mood,
        stress_level: stressVal,
        energy_level: energyVal,
        reflection: reflection || null,
        created_at: createdAt
      }
    });
  } catch (err: any) {
    console.error("POST /api/checkins error:", err);
    return NextResponse.json(
      { error: "Unable to save your check-in. Please try again." },
      { status: 500 }
    );
  }
}
