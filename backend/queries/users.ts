import { sql } from "@/backend/db/client";

/**
 * Encapsulated user-related Neon PostgreSQL queries
 */

export async function getUserByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_state JSONB DEFAULT '{}'::jsonb`;
  } catch {}

  const results = await sql`
    SELECT id, name, email, password_hash, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood, dashboard_state, onboarding_completed
    FROM users
    WHERE LOWER(email) = ${cleanEmail}
    LIMIT 1
  `;
  return results;
}

export async function getUserById(id: string) {
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_state JSONB DEFAULT '{}'::jsonb`;
  } catch {}

  const results = await sql`
    SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood, dashboard_state, onboarding_completed
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return results;
}

export async function getUserBySanctuaryName(name: string) {
  const trimmed = name.trim().toLowerCase();
  const results = await sql`
    SELECT id FROM users WHERE LOWER(sanctuary_name) = ${trimmed} LIMIT 1
  `;
  return results;
}

export async function checkSanctuaryNameDuplicate(name: string, excludeUserId: string) {
  const trimmed = name.trim().toLowerCase();
  const results = await sql`
    SELECT id FROM users WHERE LOWER(sanctuary_name) = ${trimmed} AND id <> ${excludeUserId} LIMIT 1
  `;
  return results;
}

export async function createUser(
  userId: string,
  name: string,
  email: string,
  passwordHash: string,
  sanctuaryName: string,
  category: string,
  phone: string | null,
  dob: string | null,
  country: string | null,
  gender: string | null,
  initialAnswersJson: string
) {
  return await sql`
    INSERT INTO users (id, name, email, password_hash, sanctuary_name, selected_category, phone, dob, country, gender, streak_days, mindfulness_minutes, current_mood, initial_answers_json)
    VALUES (${userId}, ${name}, ${email.trim().toLowerCase()}, ${passwordHash}, ${sanctuaryName}, ${category}, ${phone}, ${dob}, ${country}, ${gender}, 1, 0, 'Sanctuary Member', ${initialAnswersJson}::jsonb)
  `;
}

export async function updateUserSanctuaryName(userId: string, sanctuaryName: string) {
  const trimmed = sanctuaryName.trim();
  return await sql`
    UPDATE users SET sanctuary_name = ${trimmed}, name = ${trimmed} WHERE id = ${userId}
  `;
}

export async function updateUserCategory(userId: string, category: string) {
  return await sql`
    UPDATE users SET selected_category = ${category} WHERE id = ${userId}
  `;
}

export async function updateUserAvatar(userId: string, avatar: string) {
  return await sql`
    UPDATE users SET avatar = ${avatar} WHERE id = ${userId}
  `;
}

export async function createDefaultUser(userId: string, name: string, email: string, category: string) {
  return await sql`
    INSERT INTO users (id, name, email, selected_category, streak_days, mindfulness_minutes, current_mood)
    VALUES (${userId}, ${name}, ${email}, ${category}, 1, 0, 'Sanctuary Member')
    ON CONFLICT (id) DO NOTHING
  `;
}

export async function updateUserDashboardState(userId: string, dashboardState: any) {
  const jsonStr = JSON.stringify(dashboardState);
  return await sql`
    UPDATE users SET dashboard_state = ${jsonStr}::jsonb WHERE id = ${userId}
  `;
}

export async function updateUserStreak(userId: string) {
  const now = new Date();
  const streakResult = await sql`
    SELECT * FROM user_streaks WHERE user_id = ${userId} LIMIT 1
  `;

  let currentStreak = 1;
  let longestStreak = 1;

  if (streakResult.length === 0) {
    const streakId = `streak-${Date.now()}`;
    await sql`
      INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
      VALUES (${streakId}, ${userId}, 1, 1, ${now})
    `;
  } else {
    const streakRecord = streakResult[0];
    if (!streakRecord.last_checkin_date) {
      await sql`
        UPDATE user_streaks
        SET current_streak = 1,
            longest_streak = GREATEST(longest_streak, 1),
            last_checkin_date = ${now},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    } else {
      const lastCheckIn = new Date(streakRecord.last_checkin_date);
      const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = Math.abs(nowDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak = streakRecord.current_streak + 1;
        longestStreak = Math.max(currentStreak, streakRecord.longest_streak);
      } else if (diffDays === 0) {
        currentStreak = streakRecord.current_streak;
        longestStreak = streakRecord.longest_streak;
      } else {
        currentStreak = 1;
        longestStreak = streakRecord.longest_streak;
      }

      await sql`
        UPDATE user_streaks
        SET current_streak = ${currentStreak},
            longest_streak = ${longestStreak},
            last_checkin_date = ${now},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;
    }
  }

  await sql`
    UPDATE users SET streak_days = ${currentStreak} WHERE id = ${userId}
  `;
  
  return currentStreak;
}
