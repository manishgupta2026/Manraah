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
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

