import { sql } from "@/backend/db/client";
import { getCalendarDayString } from "@/backend/lib/date-utils";
import { calculateCheckinStreak } from "@/backend/lib/streak-utils";

export async function ensureLoginActivityTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS login_activity (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        login_date VARCHAR(50) NOT NULL,
        last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, login_date)
      )
    `;
  } catch (err) {
    console.error("Failed to create login_activity table:", err);
  }
}

export async function recordUserLogin(userId: string) {
  // Ensure table exists first
  await ensureLoginActivityTableExists();

  const todayStr = getCalendarDayString(new Date());

  // Record login activity
  try {
    await sql`
      INSERT INTO login_activity (user_id, login_date, last_login_at)
      VALUES (${userId}, ${todayStr}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, login_date) DO UPDATE SET
        last_login_at = CURRENT_TIMESTAMP
    `;
  } catch (e) {
    console.error("Login activity record error:", e);
  }

  // Derive streak deterministically from checkins
  let currentStreak = 0;
  let longestStreak = 0;

  try {
    const allDatesRes = await sql`
      SELECT DISTINCT checkin_date, created_at
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY checkin_date DESC
    `;

    const allDates = allDatesRes.map((r: any) => r.checkin_date || r.created_at);
    const result = calculateCheckinStreak(allDates);
    currentStreak = result.currentStreak;
    longestStreak = result.longestStreak;

    await sql`
      UPDATE users
      SET streak_days = ${currentStreak}
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
      VALUES (${'strk_' + userId}, ${userId}, ${currentStreak}, ${longestStreak}, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        current_streak = ${currentStreak},
        longest_streak = GREATEST(user_streaks.longest_streak, ${longestStreak}),
        last_checkin_date = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `;
  } catch (streakErr) {
    console.error("Streak computation error:", streakErr);
  }

  return {
    currentStreak,
    longestStreak,
    lastLoginAt: new Date(),
  };
}

