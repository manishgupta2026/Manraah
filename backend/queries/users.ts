import { sql } from "@/backend/db/client";
import { EmergencyContact } from "@/backend/types";

let userLoginSchemaEnsured = false;

export async function ensureUserLoginSchema() {
  if (userLoginSchemaEnsured || (globalThis as any).__userLoginSchemaEnsured) return;
  userLoginSchemaEnsured = true;
  (globalThis as any).__userLoginSchemaEnsured = true;

  try {
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS has_logged_in_before BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb;
    `;
  } catch (err) {
    // ignore
  }
}

export async function getUserByEmail(email: string) {
  await ensureUserLoginSchema();
  const cleanEmail = email.trim().toLowerCase();

  const results = await sql`
    SELECT id, name, email, password_hash, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood, onboarding_completed, has_logged_in_before, login_count, last_login_at, emergency_contact as "emergencyContact"
    FROM users
    WHERE LOWER(email) = ${cleanEmail}
    LIMIT 1
  `;
  return results;
}

export async function getUserById(id: string) {
  await ensureUserLoginSchema();
  const results = await sql`
    SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood, onboarding_completed, has_logged_in_before, login_count, last_login_at, emergency_contact as "emergencyContact"
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;
  return results;
}

export async function recordUserLoginSuccess(userId: string): Promise<{
  isFirstLogin: boolean;
  hasLoggedInBefore: boolean;
  loginCount: number;
}> {
  await ensureUserLoginSchema();

  const userRows = await sql`
    SELECT id, has_logged_in_before, login_count
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;

  if (userRows.length === 0) {
    return { isFirstLogin: false, hasLoggedInBefore: true, loginCount: 1 };
  }

  const u = userRows[0];
  const currentCount = Number(u.login_count || 0);
  const previouslyLoggedIn = Boolean(u.has_logged_in_before);

  // If user has never logged in before, this is their first login
  const isFirstLogin = !previouslyLoggedIn && currentCount <= 1;

  // Mark as logged in and increment count in DB
  const nextCount = currentCount + 1;
  await sql`
    UPDATE users
    SET has_logged_in_before = TRUE,
        login_count = ${nextCount},
        last_login_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;

  return {
    isFirstLogin,
    hasLoggedInBefore: previouslyLoggedIn,
    loginCount: nextCount,
  };
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
  await ensureUserLoginSchema();
  return await sql`
    INSERT INTO users (
      id, name, email, password_hash, sanctuary_name, selected_category, 
      phone, dob, country, gender, streak_days, mindfulness_minutes, current_mood, 
      initial_answers_json, has_logged_in_before, login_count, last_login_at
    )
    VALUES (
      ${userId}, ${name}, ${email.trim().toLowerCase()}, ${passwordHash}, ${sanctuaryName}, ${category}, 
      ${phone}, ${dob}, ${country}, ${gender}, 1, 0, 'Sanctuary Member', 
      ${initialAnswersJson}::jsonb, FALSE, 1, CURRENT_TIMESTAMP
    )
  `;
}

export async function updateUserSanctuaryName(userId: string, sanctuaryName: string) {
  const trimmed = sanctuaryName.trim();
  return await sql`
    UPDATE users SET sanctuary_name = ${trimmed} WHERE id = ${userId}
  `;
}

export async function updateUserName(userId: string, name: string) {
  const trimmed = name.trim();
  return await sql`
    UPDATE users SET name = ${trimmed} WHERE id = ${userId}
  `;
}

export async function updateUserProfileNames(userId: string, name: string, sanctuaryName?: string) {
  const trimmedName = name.trim();
  const trimmedSanctuary = (sanctuaryName || name).trim();
  return await sql`
    UPDATE users SET name = ${trimmedName}, sanctuary_name = ${trimmedSanctuary} WHERE id = ${userId}
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

export async function deleteUserById(userId: string): Promise<void> {
  try {
    await sql`DELETE FROM user_streaks WHERE user_id = ${userId}`;
    await sql`DELETE FROM daily_moods WHERE user_id = ${userId}`;
    await sql`DELETE FROM category_wellness_scores WHERE user_id = ${userId}`;
    await sql`DELETE FROM appointments WHERE user_id = ${userId}`;
    await sql`DELETE FROM users WHERE id = ${userId}`;
  } catch (err) {
    // ignore
  }
}

export async function updateUserEmergencyContact(userId: string, contact: EmergencyContact | null) {
  await ensureUserLoginSchema();
  const contactJson = contact ? JSON.stringify(contact) : JSON.stringify({});
  return await sql`
    UPDATE users 
    SET emergency_contact = ${contactJson}::jsonb 
    WHERE id = ${userId}
  `;
}


