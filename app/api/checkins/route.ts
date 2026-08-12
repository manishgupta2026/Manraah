import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { calculateWellnessScore } from "@/backend/lib/wellness-scoring";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = getAuthSessionFromRequest();
  const userId = session.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const checkins = await sql`
      SELECT id, user_id, mood, energy_level as energy, sleep_quality, stress, work_life_balance, note, created_at
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 14
    `;

    const latest = checkins.length > 0 ? checkins[0] : null;
    const isToday = latest
      ? new Date(latest.created_at).toDateString() === new Date().toDateString()
      : false;

    return NextResponse.json({
      todayCheckin: isToday ? latest : null,
      history: checkins,
    });
  } catch (err: any) {
    console.error("GET /api/checkins error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAuthSessionFromRequest();
  let userId = session.user?.id;

  try {
    const body = await req.json();
    const { mood, stress, energy, sleep, sleepQuality, workLifeBalance, note } = body;

    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    const energyVal = Math.min(5, Math.max(1, Number(energy) || 3));
    const sleepVal = Math.min(5, Math.max(1, Number(sleepQuality || sleep) || 3));
    const balanceVal = Math.min(5, Math.max(1, Number(workLifeBalance) || 3));
    const stressVal = typeof stress === "string" ? stress : "Manageable";

    if (!userId) {
      // Find latest working professional user
      const users = await sql`
        SELECT id FROM users 
        WHERE selected_category IN ('working-professional', 'working_professional')
        ORDER BY created_at DESC LIMIT 1
      `;
      userId = users.length > 0 ? users[0].id : "demo-wp-user";
    }

    // 1. Check if user already checked in today
    const existingCheckin = await sql`
      SELECT id, created_at FROM daily_checkins
      WHERE user_id = ${userId}
        AND created_at >= CURRENT_DATE
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let savedId: number;

    if (existingCheckin.length > 0) {
      // Update today's existing checkin
      savedId = existingCheckin[0].id;
      await sql`
        UPDATE daily_checkins SET
          mood = ${mood},
          energy_level = ${energyVal},
          sleep_quality = ${sleepVal},
          stress = ${stressVal},
          work_life_balance = ${balanceVal},
          note = ${note || null}
        WHERE id = ${savedId}
      `;

      // Also update latest mood entry
      await sql`
        UPDATE mood_entries SET
          mood = ${mood},
          energy = ${energyVal},
          sleep_quality = ${sleepVal},
          stress = ${stressVal},
          work_life_balance = ${balanceVal},
          reflection = ${note || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
          AND created_at >= CURRENT_DATE
      `;
    } else {
      // Insert new checkin
      const insertRes = await sql`
        INSERT INTO daily_checkins (
          user_id, mood, energy_level, sleep_quality, stress, work_life_balance, note
        ) VALUES (
          ${userId}, ${mood}, ${energyVal}, ${sleepVal}, ${stressVal}, ${balanceVal}, ${note || null}
        ) RETURNING id
      `;
      savedId = insertRes[0]?.id;

      await sql`
        INSERT INTO mood_entries (
          user_id, mood, energy, stress, sleep_quality, work_life_balance, reflection
        ) VALUES (
          ${userId}, ${mood}, ${energyVal}, ${stressVal}, ${sleepVal}, ${balanceVal}, ${note || null}
        )
      `;
    }

    // 2. Calculate updated wellness score
    const scoreResult = calculateWellnessScore({
      mood,
      stress: stressVal,
      energy: energyVal,
      sleep: sleepVal,
      workLifeBalance: balanceVal,
    });

    // 3. Update user current mood and assessment score
    await sql`
      UPDATE users SET
        current_mood = ${mood}
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO assessments (
        user_id, category, total_score, max_score, percentage, wellness_level
      ) VALUES (
        ${userId}, 'working-professional', ${scoreResult.score}, 100, ${scoreResult.score}, ${scoreResult.level}
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
      message: "Check-in saved successfully",
      checkinId: savedId,
      score: scoreResult.score,
      level: scoreResult.level,
      breakdown: scoreResult.breakdown,
      checkin: {
        id: savedId,
        mood,
        stress: stressVal,
        energy: energyVal,
        sleepQuality: sleepVal,
        workLifeBalance: balanceVal,
        note,
      },
    });
  } catch (err: any) {
    console.error("POST /api/checkins error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save check-in" },
      { status: 500 }
    );
  }
}
