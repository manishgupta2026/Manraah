import { sql } from "@/backend/db/client";

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

  // Configured timezone: Asia/Kolkata
  const getCalendarDayString = (date: Date) => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // YYYY-MM-DD
  };

  const todayStr = getCalendarDayString(new Date());

  // Check if today's login record already exists
  const existing = await sql`
    SELECT id FROM login_activity
    WHERE user_id = ${userId} AND login_date = ${todayStr}
    LIMIT 1
  `;

  if (existing.length > 0) {
    // Today's login already recorded. Update last_login_at.
    await sql`
      UPDATE login_activity
      SET last_login_at = CURRENT_TIMESTAMP
      WHERE id = ${existing[0].id}
    `;
  } else {
    // Today's login does not exist. Let's record it!
    await sql`
      INSERT INTO login_activity (user_id, login_date, last_login_at)
      VALUES (${userId}, ${todayStr}, CURRENT_TIMESTAMP)
    `;

    // Yesterday's calendar date string
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getCalendarDayString(yesterday);

    // Check if user logged in yesterday
    const loggedYesterday = await sql`
      SELECT id FROM login_activity
      WHERE user_id = ${userId} AND login_date = ${yesterdayStr}
      LIMIT 1
    `;

    // Fetch user profile to read current streak
    const userProfile = await sql`
      SELECT streak_days FROM users WHERE id = ${userId} LIMIT 1
    `;

    let currentStreak = 1;
    if (userProfile.length > 0) {
      const prevStreak = userProfile[0].streak_days || 0;
      if (loggedYesterday.length > 0) {
        // Increment streak
        currentStreak = prevStreak + 1;
      } else {
        // Reset streak to 1
        currentStreak = 1;
      }
    }

    // Update users streak_days
    await sql`
      UPDATE users
      SET streak_days = ${currentStreak}
      WHERE id = ${userId}
    `;

    // Upsert into user_streaks table to keep it in sync
    const streakRecord = await sql`
      SELECT id, longest_streak FROM user_streaks
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (streakRecord.length > 0) {
      const longest = Math.max(currentStreak, streakRecord[0].longest_streak || 1);
      await sql`
        UPDATE user_streaks
        SET current_streak = ${currentStreak},
            longest_streak = ${longest},
            last_checkin_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
      const uuid = `streak_${userId}_${Date.now()}`;
      await sql`
        INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
        VALUES (${uuid}, ${userId}, ${currentStreak}, ${currentStreak}, CURRENT_TIMESTAMP)
      `;
    }
  }

  // Fetch updated user streak information
  const updatedUser = await sql`
    SELECT streak_days FROM users WHERE id = ${userId} LIMIT 1
  `;
  const updatedStreak = await sql`
    SELECT current_streak, longest_streak, last_checkin_date FROM user_streaks
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return {
    currentStreak: updatedUser[0]?.streak_days || 1,
    longestStreak: updatedStreak[0]?.longest_streak || 1,
    lastLoginAt: updatedStreak[0]?.last_checkin_date || new Date(),
  };
}
