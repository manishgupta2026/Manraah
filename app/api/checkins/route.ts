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
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS checkin_date DATE DEFAULT CURRENT_DATE`;
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'student'`;
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS wellness_score INTEGER`;
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS answers_json JSONB DEFAULT '[]'::jsonb`;
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS note TEXT`;
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS reflection TEXT`;
    await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_checkin_date ON daily_checkins(user_id, checkin_date)`;
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
      if (typeof score !== "number") {
        const matchingAssess = latestAssessments.find((a: any) => {
          if (!a.completed_at || !c.createdAt) return false;
          return getCalendarDayString(a.completed_at) === getCalendarDayString(c.checkinDate || c.createdAt);
        });
        if (matchingAssess) {
          score = Number(matchingAssess.score);
        }
      }

      return {
        id: String(c.id),
        userId: c.user_id,
        mood: c.mood || "Calm",
        category: normalizeCategorySlug(c.category || "student"),
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

    const averageWellness = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 75;

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
        score: dayEntry?.wellnessScore || (dayEntry ? 70 : null),
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
    const rawCategory = body.categoryId || body.category || session.user?.selectedCategory || "student";
    const categoryId = normalizeCategorySlug(rawCategory);
    const answers = Array.isArray(body.answers) ? body.answers : [];

    const todayDateStr = getCalendarDayString(new Date());

    let computedScore: number | null = null;
    let assessmentResult: any = null;

    // 1. If 5 answers provided, calculate and save wellness assessment
    if (answers.length === 5) {
      try {
        assessmentResult = await submitWellnessAssessment(userId, categoryId, answers);
        computedScore = assessmentResult.score;
      } catch (assessErr) {
        console.error("[checkins POST] Assessment calculation error:", assessErr);
      }
    }

    // If score not calculated via answers, look up latest score for this category
    if (computedScore === null) {
      const prevScores = await sql`
        SELECT score FROM wellness_assessments
        WHERE user_id = ${userId} AND category_id = ${categoryId}
        ORDER BY completed_at DESC
        LIMIT 1
      `;
      if (prevScores.length > 0) {
        computedScore = Number(prevScores[0].score);
      }
    }

    // 2. Upsert into daily_checkins for today
    const existingCheckin = await sql`
      SELECT id, mood, note, category, wellness_score, created_at, checkin_date
      FROM daily_checkins
      WHERE user_id = ${userId} AND checkin_date = ${todayDateStr}
      LIMIT 1
    `;

    let savedId: string | number;
    let createdAt: string | Date;

    if (existingCheckin.length > 0) {
      savedId = existingCheckin[0].id;
      createdAt = existingCheckin[0].created_at;

      await sql`
        UPDATE daily_checkins
        SET mood = ${rawMood},
            category = ${categoryId},
            note = ${noteText || null},
            reflection = ${noteText || null},
            wellness_score = COALESCE(${computedScore}, wellness_score),
            answers_json = ${JSON.stringify(answers)}::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${savedId}
      `;
    } else {
      const insertRes = await sql`
        INSERT INTO daily_checkins (
          user_id, 
          mood, 
          energy_level,
          sleep_quality,
          stress,
          work_life_balance,
          category,
          wellness_score,
          answers_json,
          note, 
          reflection, 
          checkin_date, 
          created_at, 
          updated_at
        ) VALUES (
          ${userId}, 
          ${rawMood}, 
          4,
          4,
          'Manageable',
          3,
          ${categoryId},
          ${computedScore},
          ${JSON.stringify(answers)}::jsonb,
          ${noteText || null}, 
          ${noteText || null}, 
          ${todayDateStr}, 
          CURRENT_TIMESTAMP, 
          CURRENT_TIMESTAMP
        ) RETURNING id, created_at
      `;

      savedId = insertRes[0]?.id;
      createdAt = insertRes[0]?.created_at || new Date();
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
        current_mood = ${rawMood},
        selected_category = ${categoryId},
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

    const levelInfo = getWellnessLevelInfo(computedScore ?? 75);

    const checkInRecord = {
      id: String(savedId),
      userId,
      mood: rawMood,
      category: categoryId,
      wellnessScore: computedScore,
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
      wellnessScore: computedScore,
      category: categoryId,
      levelBadge: levelInfo.levelBadge,
      levelDescription: levelInfo.levelDescription,
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

