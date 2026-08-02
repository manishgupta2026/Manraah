import { sql } from "@/backend/db/client";
import { AssessmentAnswers, AssessmentResult, UserCategory } from "@/backend/types";

/**
 * Assessment Database Queries
 * 
 * Persists user assessment responses and computed serenity score directly into Neon PostgreSQL.
 */

export async function saveUserAssessment(
  userId: string,
  category: UserCategory | string,
  answers: AssessmentAnswers,
  computedScore: number
): Promise<AssessmentResult> {
  const record: AssessmentResult = {
    userId,
    category,
    answers,
    computedScore,
    createdAt: new Date().toISOString(),
  };

  try {
    await sql`
      INSERT INTO user_assessments (user_id, category, stress_frequency, sleep_quality, support_level, computed_score, answers_json)
      VALUES (${userId}, ${category}, ${answers.stressFrequency}, ${answers.sleepQuality}, ${answers.supportLevel}, ${computedScore}, ${JSON.stringify(answers)})
    `;
    console.log("[Neon DB] Saved user assessment successfully:", userId);
  } catch (err) {
    console.error("[Neon DB] Failed to save assessment:", err);
  }

  return record;
}
