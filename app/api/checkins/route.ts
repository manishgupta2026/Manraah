import { NextResponse } from "next/server";
import { getAuthSessionFromRequest } from "@/backend/auth/session";
import { sql } from "@/backend/db/client";
import { getCalendarDayString } from "@/backend/lib/date-utils";
import { calculateCheckinStreak } from "@/backend/lib/streak-utils";
import { normalizeCategorySlug, getWellnessLevelInfo } from "@/backend/lib/wellness-score-calc";
import { submitWellnessAssessment } from "@/backend/queries/wellness";

export const dynamic = "force-dynamic";

let checkinSchemaInitialized = false;

async function ensureCheckinSchema() {
  if (checkinSchemaInitialized || (globalThis as any).__checkinSchemaInitialized) return;
  checkinSchemaInitialized = true;
  (globalThis as any).__checkinSchemaInitialized = true;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        category TEXT,
        mood VARCHAR(50) NOT NULL,
        energy_level INT DEFAULT 3,
        sleep_quality INT DEFAULT 3,
        stress VARCHAR(50) DEFAULT 'Manageable',
        work_life_balance INT DEFAULT 3,
        note TEXT,
        reflection TEXT,
        answers_json JSONB DEFAULT '[]'::jsonb,
        wellness_score INTEGER,
        checkin_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      ALTER TABLE daily_checkins 
        ADD COLUMN IF NOT EXISTS checkin_date DATE DEFAULT CURRENT_DATE,
        ADD COLUMN IF NOT EXISTS category TEXT,
        ADD COLUMN IF NOT EXISTS wellness_score INTEGER,
        ADD COLUMN IF NOT EXISTS answers_json JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS note TEXT,
        ADD COLUMN IF NOT EXISTS reflection TEXT,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `;

    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_checkin_date ON daily_checkins(user_id, checkin_date)
    `;
  } catch (e) {
    // Non-fatal
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

    // Fetch check-in records for history & My Journey
    const checkins = await sql`
      SELECT 
        id, 
        user_id, 
        mood, 
        category,
        wellness_score as "wellnessScore",
        note, 
        reflection,
        answers_json as answers,
        checkin_date as "checkinDate",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY checkin_date DESC, created_at DESC
      LIMIT 60
    `;

    // Also check if there are recent category wellness assessments if wellnessScore is null on checkin
    const latestAssessments = await sql`
      SELECT category_id, score, completed_at
      FROM wellness_assessments
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC
      LIMIT 10
    `;

    const formattedHistory = checkins.map((c: any) => {
      let score = c.wellnessScore;
      const rawCat = c.category && String(c.category).trim() ? String(c.category).trim() : null;
      const checkinCat = rawCat ? normalizeCategorySlug(rawCat) : null;

      if (typeof score !== "number" && checkinCat) {
        const matchingAssess = latestAssessments.find((a: any) => {
          if (!a.completed_at || !c.createdAt) return false;
          const assessCat = normalizeCategorySlug(a.category_id);
          return (
            assessCat === checkinCat &&
            getCalendarDayString(a.completed_at) === getCalendarDayString(c.checkinDate || c.createdAt)
          );
        });
        if (matchingAssess) {
          score = Number(matchingAssess.score);
        }
      }

      return {
        id: String(c.id),
        userId: c.user_id,
        mood: c.mood || "Calm",
        category: checkinCat,
        wellnessScore: typeof score === "number" ? score : null,
        note: c.note || c.reflection || "",
        reflection: c.reflection || c.note || "",
        checkinDate: c.checkinDate ? getCalendarDayString(c.checkinDate) : getCalendarDayString(c.createdAt),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    const todayCheckin = formattedHistory.find((c: any) => c.checkinDate === todayDateStr) || null;

    // Compute Journey Insights
    const moodCounts: Record<string, number> = {};
    let totalScore = 0;
    let scoredCount = 0;

    for (const item of formattedHistory) {
      const m = (item.mood || "Calm").toLowerCase();
      moodCounts[m] = (moodCounts[m] || 0) + 1;
      if (typeof item.wellnessScore === "number") {
        totalScore += item.wellnessScore;
        scoredCount++;
      }
    }

    let mostCommonMood = "Calm";
    let highestCount = 0;
    for (const [m, count] of Object.entries(moodCounts)) {
      if (count > highestCount) {
        highestCount = count;
        mostCommonMood = m.charAt(0).toUpperCase() + m.slice(1);
      }
    }

    const averageWellness = scoredCount > 0 ? Math.round(totalScore / scoredCount) : null;

    // Generate 7-day trend
    const sevenDayTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getCalendarDayString(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayEntry = formattedHistory.find((h: any) => h.checkinDate === dStr);

      sevenDayTrend.push({
        date: dStr,
        day: dayName,
        score: typeof dayEntry?.wellnessScore === "number" ? dayEntry.wellnessScore : null,
        mood: dayEntry?.mood || null,
        completed: Boolean(dayEntry),
      });
    }

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
      history: formattedHistory,
      insights: {
        mostCommonMood,
        averageWellness,
        currentStreak,
        totalCheckins: formattedHistory.length,
        sevenDayTrend,
      },
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
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    await ensureCheckinSchema();
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const rawMood = body.mood || "Calm";
    const noteText = (body.note || body.reflection || "").trim();
    const rawCategory = body.category || body.categoryId || session.user?.selectedCategory || null;
    const checkinCategory = rawCategory ? normalizeCategorySlug(rawCategory) : null;
    const todayDateStr = getCalendarDayString(new Date());

    // Ensure user exists in users table to prevent FK constraint errors
    try {
      const userExists = await sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1`;
      if (userExists.length === 0) {
        await sql`
          INSERT INTO users (id, name, email, selected_category)
          VALUES (
            ${userId}, 
            ${session.user?.name || "Manraah Member"}, 
            ${session.user?.email || `${userId}@manraah.app`}, 
            ${checkinCategory || "working-professional"}
          )
          ON CONFLICT (id) DO NOTHING
        `;
      }
    } catch (userCheckErr) {
      // Non-fatal
    }

    // 1. Single atomic upsert into daily_checkins for today
    const upsertRes = await sql`
      INSERT INTO daily_checkins (
        user_id, 
        category,
        mood, 
        energy_level,
        sleep_quality,
        stress,
        work_life_balance,
        note, 
        reflection, 
        checkin_date, 
        created_at, 
        updated_at
      ) VALUES (
        ${userId}, 
        ${checkinCategory},
        ${rawMood}, 
        4,
        4,
        'Manageable',
        3,
        ${noteText || null}, 
        ${noteText || null}, 
        ${todayDateStr}, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id, checkin_date) DO UPDATE SET
        mood = EXCLUDED.mood,
        category = COALESCE(EXCLUDED.category, daily_checkins.category),
        note = COALESCE(EXCLUDED.note, daily_checkins.note),
        reflection = COALESCE(EXCLUDED.reflection, daily_checkins.reflection),
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, user_id, category, mood, note, reflection, checkin_date, created_at, updated_at
    `;

    const savedRecord = upsertRes[0];
    const savedId = savedRecord?.id;
    const createdAt = savedRecord?.created_at || new Date();
    const savedCategory = savedRecord?.category || checkinCategory;

    // 2. Deterministically recalculate streak from all check-in dates
    const allDatesRes = await sql`
      SELECT DISTINCT checkin_date
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY checkin_date DESC
      LIMIT 100
    `;

    const allDates = allDatesRes.map((r: any) => r.checkin_date);
    const { currentStreak, longestStreak } = calculateCheckinStreak(allDates);

    // 3. Update users table and user_streaks table concurrently
    try {
      await Promise.all([
        sql`
          UPDATE users SET
            current_mood = ${rawMood},
            streak_days = ${currentStreak}
          WHERE id = ${userId}
        `,
        sql`
          INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
          VALUES (${'strk_' + userId}, ${userId}, ${currentStreak}, ${longestStreak}, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            current_streak = ${currentStreak},
            longest_streak = GREATEST(user_streaks.longest_streak, ${longestStreak}),
            last_checkin_date = CURRENT_TIMESTAMP
        `,
      ]);
    } catch (syncErr) {
      console.warn("Non-fatal streak sync notice:", syncErr);
    }

    const checkInRecord = {
      id: String(savedId),
      userId,
      mood: rawMood,
      category: savedCategory,
      note: noteText,
      reflection: noteText,
      checkinDate: todayDateStr,
      createdAt,
      updatedAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      hasCheckedInToday: true,
      currentStreak,
      longestStreak,
      checkIn: checkInRecord,
      todayCheckin: checkInRecord,
    });
  } catch (err: any) {
    console.error("POST /api/checkins error:", err);
    return NextResponse.json(
      { error: err.message || "Unable to save your check-in. Please try again." },
      { status: 500 }
    );
  }
}

