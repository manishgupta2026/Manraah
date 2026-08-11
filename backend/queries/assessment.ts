import { sql } from "@/backend/db/client";
import { UserCategory } from "@/backend/types";
import { AssessmentAnswer } from "@/frontend/lib/assessment/types";

/**
 * Assessment Database Queries
 */

export async function saveUserAssessment(
  userId: string,
  category: UserCategory | string,
  detailedAnswers: AssessmentAnswer[],
  totalScore: number,
  percentage: number,
  wellnessLevel: string,
  maxScore: number = 50
): Promise<any> {
  try {
    // 1. Insert into assessments table
    const resultQuery = await sql`
      INSERT INTO assessments (user_id, category, total_score, max_score, percentage, wellness_level)
      VALUES (${userId}, ${category}, ${totalScore}, ${maxScore}, ${percentage}, ${wellnessLevel})
      RETURNING id, user_id, category, total_score, max_score, percentage, wellness_level, created_at
    `;
    const assessment = resultQuery[0];
    const assessmentId = assessment?.id;

    // 2. Insert individual answers into assessment_answers table
    if (assessmentId && detailedAnswers && detailedAnswers.length > 0) {
      for (const ans of detailedAnswers) {
        await sql`
          INSERT INTO assessment_answers (assessment_id, question_id, question_key, question_type, category, selected_option_id, selected_text, score, answered_at)
          VALUES (
            ${assessmentId}, 
            ${ans.questionId}, 
            ${ans.questionKey || `q_${ans.questionId}`}, 
            ${ans.questionType || "category"}, 
            ${ans.category || category}, 
            ${ans.selectedOptionId}, 
            ${ans.selectedText}, 
            ${ans.score}, 
            ${ans.answeredAt ? new Date(ans.answeredAt) : new Date()}
          )
        `;
      }
    }

    console.log("[Neon DB] Saved Sanctuary assessment successfully for user:", userId);
    return { success: true, assessment };
  } catch (err) {
    console.error("[Neon DB] Failed to save assessment:", err);
    throw err;
  }
}

export async function getUserProfile(userId: string): Promise<any> {
  try {
    const results = await sql`
      SELECT id, name, email, sanctuary_name, avatar, selected_category, streak_days, mindfulness_minutes, current_mood 
      FROM users 
      WHERE id = ${userId} 
      LIMIT 1
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
  try {
    const results = await sql`
      SELECT id, user_id, category, total_score, max_score, percentage, wellness_level, created_at 
      FROM assessments 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    if (results.length === 0) return null;

    const assessment = results[0];
    const answers = await sql`
      SELECT id, assessment_id, question_id, question_key, question_type, category, selected_option_id, selected_text, score, answered_at 
      FROM assessment_answers 
      WHERE assessment_id = ${assessment.id}
    `;

    return {
      ...assessment,
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
