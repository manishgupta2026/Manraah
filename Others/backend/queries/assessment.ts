import { sql } from "@/backend/db/client";
import { AssessmentAnswer } from "@/frontend/lib/assessment/types";

/**
 * Assessment Database Queries for Others / General Wellness Category
 */

export async function getOthersAssessment(userId: string): Promise<any> {
  try {
    const results = await sql`
      SELECT * FROM assessments 
      WHERE user_id = ${userId} AND category IN ('other', 'others') 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    if (results.length === 0) return null;

    const result = results[0];
    const answers = await sql`
      SELECT * FROM assessment_answers_detailed 
      WHERE assessment_id = ${result.id}
    `;

    return {
      ...result,
      answers,
    };
  } catch (err) {
    console.error("[Others Neon DB] Failed to fetch assessment:", err);
    return null;
  }
}

export async function saveOthersAssessment(
  userId: string,
  category: string,
  detailedAnswers: AssessmentAnswer[],
  totalScore: number,
  percentage: number,
  wellnessLevel: string,
  maxScore: number = 50
): Promise<any> {
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

    // 2. Insert into assessments table
    const resultQuery = await sql`
      INSERT INTO assessments (user_id, category, total_score, max_score, percentage, wellness_level)
      VALUES (${userId}, ${category}, ${totalScore}, ${maxScore}, ${percentage}, ${wellnessLevel})
      RETURNING id
    `;
    const resultId = resultQuery[0]?.id;

    // 3. Insert each individual answer into detailed answers table
    if (resultId) {
      for (const ans of detailedAnswers) {
        await sql`
          INSERT INTO assessment_answers_detailed (assessment_id, question_id, question_key, question_type, category, selected_option_id, selected_text, score, answered_at)
          VALUES (
            ${resultId}, 
            ${ans.questionId}, 
            ${ans.questionKey}, 
            ${ans.questionType}, 
            ${ans.category}, 
            ${ans.selectedOptionId}, 
            ${ans.selectedText}, 
            ${ans.score}, 
            ${ans.answeredAt ? new Date(ans.answeredAt) : new Date()}
          )
        `;
      }
    }

    console.log("[Others Neon DB] Saved assessment successfully for user:", userId);
    return { success: true };
  } catch (err) {
    console.error("[Others Neon DB] Failed to save assessment:", err);
    throw err;
  }
}
