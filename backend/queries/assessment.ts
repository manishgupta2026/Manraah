import { sql } from "@/backend/db/client";
import { UserCategory } from "@/backend/types";
import { AssessmentAnswer } from "@/frontend/lib/assessment/types";

/**
 * Assessment Database Queries
 * 
 * Auto-initializes and queries user assessments in Neon PostgreSQL.
 */

export async function initDatabase() {
  try {
    // 1. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        avatar VARCHAR(255) DEFAULT '/images/user_avatar.jpg',
        selected_category VARCHAR(255) DEFAULT 'student',
        streak_days INTEGER DEFAULT 1,
        mindfulness_minutes INTEGER DEFAULT 0,
        current_mood VARCHAR(255) DEFAULT 'Sanctuary Member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Create user_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(255),
        wellness_level VARCHAR(255),
        percentage INTEGER,
        total_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 3. Create assessment_results table
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(255),
        total_score INTEGER,
        percentage INTEGER,
        wellness_level VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. Create assessment_answers table
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_answers (
        id SERIAL PRIMARY KEY,
        assessment_result_id INTEGER REFERENCES assessment_results(id) ON DELETE CASCADE,
        user_id VARCHAR(255),
        question_id INTEGER,
        question_key VARCHAR(255),
        selected_option_id VARCHAR(255),
        selected_text TEXT,
        score INTEGER
      )
    `;

    // 5. Create daily_checkins table
    await sql`
      CREATE TABLE IF NOT EXISTS daily_checkins (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        mood VARCHAR(255) NOT NULL,
        energy_level INTEGER NOT NULL,
        sleep_quality INTEGER NOT NULL,
        gratitude_reflection TEXT,
        daily_intention TEXT,
        reflection TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Ensure reflection column exists in existing deployments
    try {
      await sql`ALTER TABLE daily_checkins ADD COLUMN IF NOT EXISTS reflection TEXT`;
    } catch (err) {
      console.warn("Could not alter table daily_checkins:", err);
    }

    // 6. Create user_streaks table
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 1,
        longest_streak INTEGER DEFAULT 1,
        last_checkin_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("[Neon DB] Database tables initialized successfully.");
  } catch (err) {
    console.error("[Neon DB] Table initialization failed:", err);
  }
}

export async function saveUserAssessment(
  userId: string,
  category: UserCategory | string,
  detailedAnswers: AssessmentAnswer[],
  totalScore: number,
  percentage: number,
  wellnessLevel: string
): Promise<any> {
  // Ensure tables are initialized
  await initDatabase();

  try {
    // 1. Insert or update user profile details
    const profileId = `profile-${Date.now()}`;
    await sql`
      INSERT INTO user_profiles (id, user_id, category, wellness_level, percentage, total_score)
      VALUES (${profileId}, ${userId}, ${category}, ${wellnessLevel}, ${percentage}, ${totalScore})
      ON CONFLICT (user_id) DO UPDATE SET
        category = EXCLUDED.category,
        wellness_level = EXCLUDED.wellness_level,
        percentage = EXCLUDED.percentage,
        total_score = EXCLUDED.total_score,
        created_at = CURRENT_TIMESTAMP
    `;

    // 2. Insert assessment results header
    const resultQuery = await sql`
      INSERT INTO assessment_results (user_id, category, total_score, percentage, wellness_level)
      VALUES (${userId}, ${category}, ${totalScore}, ${percentage}, ${wellnessLevel})
      RETURNING id
    `;
    const resultId = resultQuery[0]?.id;

    // 3. Insert each individual answer
    if (resultId) {
      for (const ans of detailedAnswers) {
        await sql`
          INSERT INTO assessment_answers (assessment_result_id, user_id, question_id, question_key, selected_option_id, selected_text, score)
          VALUES (${resultId}, ${userId}, ${ans.questionId}, ${ans.questionKey}, ${ans.selectedOptionId}, ${ans.selectedText}, ${ans.score})
        `;
      }
    }

    console.log("[Neon DB] Saved full 10-question user assessment successfully:", userId);
    return { success: true };
  } catch (err) {
    console.error("[Neon DB] Failed to save assessment:", err);
    throw err;
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  await initDatabase();
  try {
    const results = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;
    if (results.length > 0) {
      return results[0];
    }
    return null;
  } catch (err) {
    console.error("[Neon DB] Failed to fetch user profile:", err);
    return null;
  }
}

export async function getUserAssessment(userId: string): Promise<any> {
  await initDatabase();
  try {
    const results = await sql`
      SELECT * FROM assessment_results WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
    `;
    if (results.length === 0) return null;

    const result = results[0];
    const answers = await sql`
      SELECT * FROM assessment_answers WHERE assessment_result_id = ${result.id}
    `;

    return {
      ...result,
      answers,
    };
  } catch (err) {
    console.error("[Neon DB] Failed to fetch user assessment:", err);
    return null;
  }
}

export async function saveDailyCheckIn(
  userId: string,
  data: {
    mood: string;
    energyLevel: number;
    sleepQuality: number;
    gratitudeReflection: string;
    dailyIntention: string;
    reflection?: string;
  }
): Promise<{ success: boolean; currentStreak: number }> {
  await initDatabase();
  try {
    // 1. Save check-in
    await sql`
      INSERT INTO daily_checkins (user_id, mood, energy_level, sleep_quality, gratitude_reflection, daily_intention, reflection)
      VALUES (${userId}, ${data.mood}, ${data.energyLevel}, ${data.sleepQuality}, ${data.gratitudeReflection}, ${data.dailyIntention}, ${data.reflection || null})
    `;

    // 2. Manage user streak
    const streakResult = await sql`
      SELECT * FROM user_streaks WHERE user_id = ${userId} LIMIT 1
    `;

    let currentStreak = 1;
    let longestStreak = 1;
    const now = new Date();

    if (streakResult.length === 0) {
      const streakId = `streak-${Date.now()}`;
      await sql`
        INSERT INTO user_streaks (id, user_id, current_streak, longest_streak, last_checkin_date)
        VALUES (${streakId}, ${userId}, 1, 1, ${now})
      `;
    } else {
      const streak = streakResult[0];
      if (!streak.last_checkin_date) {
        await sql`
          UPDATE user_streaks
          SET current_streak = 1,
              longest_streak = GREATEST(longest_streak, 1),
              last_checkin_date = ${now},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;
      } else {
        const lastCheckIn = new Date(streak.last_checkin_date);
        
        // Calculate day difference
        const lastDate = new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate());
        const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffTime = Math.abs(nowDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive check-in
          currentStreak = streak.current_streak + 1;
          longestStreak = Math.max(currentStreak, streak.longest_streak);
        } else if (diffDays === 0) {
          // Checked in today already
          currentStreak = streak.current_streak;
          longestStreak = streak.longest_streak;
        } else {
          // Streak broken
          currentStreak = 1;
          longestStreak = streak.longest_streak;
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

    return { success: true, currentStreak };
  } catch (err) {
    console.error("Failed to save daily check-in:", err);
    throw err;
  }
}

export async function getDailyCheckInSummary(userId: string): Promise<any> {
  await initDatabase();
  try {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Fetch today's check-in
    const results = await sql`
      SELECT * FROM daily_checkins 
      WHERE user_id = ${userId} AND created_at >= ${startDate} 
      ORDER BY created_at DESC LIMIT 1
    `;
    return results.length > 0 ? results[0] : null;
  } catch (err) {
    console.error("Failed to fetch daily check-in summary:", err);
    return null;
  }
}

export async function getUserStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  await initDatabase();
  try {
    const results = await sql`
      SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = ${userId} LIMIT 1
    `;
    if (results.length > 0) {
      return {
        currentStreak: results[0].current_streak,
        longestStreak: results[0].longest_streak,
      };
    }
    return { currentStreak: 0, longestStreak: 0 };
  } catch (err) {
    console.error("Failed to fetch user streak:", err);
    return { currentStreak: 0, longestStreak: 0 };
  }
}


