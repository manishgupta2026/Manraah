import { sql } from "@/backend/db/client";
import { UserCategory } from "@/backend/types";
import { AssessmentAnswer } from "@/frontend/lib/assessment/types";

/**
 * Assessment Database Queries
 * 
 * Auto-initializes and queries user assessments in Neon PostgreSQL.
 */

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;
  try {
    // 1. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        image TEXT,
        avatar VARCHAR(255) DEFAULT '/images/user_avatar.jpg',
        sanctuary_name VARCHAR(255) UNIQUE,
        selected_category VARCHAR(255) DEFAULT 'student',
        streak_days INTEGER DEFAULT 1,
        mindfulness_minutes INTEGER DEFAULT 0,
        current_mood VARCHAR(255) DEFAULT 'Sanctuary Member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS sanctuary_name VARCHAR(255) UNIQUE`;
    } catch (err) {
      console.warn("Could not alter table users to add sanctuary_name:", err);
    }

    try {
      await sql`ALTER TABLE users ALTER COLUMN name DROP NOT NULL`;
    } catch (err) {
      console.warn("Could not drop NOT NULL constraint from users name column:", err);
    }

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

    // 4. Create legacy assessment_answers table
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

    // 7. Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 8. Create questions table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY,
        key VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        description TEXT,
        category VARCHAR(100) REFERENCES categories(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        options JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 9. Create new assessments table
    await sql`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(100) REFERENCES categories(id) ON DELETE CASCADE,
        total_score INT NOT NULL,
        max_score INT NOT NULL,
        percentage INT NOT NULL,
        wellness_level VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 10. Create new detailed assessment_answers table
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_answers_detailed (
        id SERIAL PRIMARY KEY,
        assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE,
        question_id INT NOT NULL,
        question_key VARCHAR(255) NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        selected_option_id VARCHAR(255) NOT NULL,
        selected_text TEXT NOT NULL,
        score INT NOT NULL,
        answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 11. Create wellness_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS wellness_metrics (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        wellness_score INTEGER NOT NULL,
        stress_score INTEGER NOT NULL,
        energy_score INTEGER NOT NULL,
        sleep_score INTEGER NOT NULL,
        mood_score INTEGER NOT NULL,
        streak INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Seed categories
    const existingCats = await sql`SELECT COUNT(*) FROM categories`;
    if (parseInt(existingCats[0].count) === 0) {
      console.log("[Neon DB] Seeding categories...");
      const catsToInsert = [
        { id: "student", name: "Student", description: "Academic balance, exam stress reduction & peer focus" },
        { id: "young_pro", name: "Young Professional", description: "Starting out and building a career path" },
        { id: "working_professional", name: "Working Professional", description: "Work-life harmony, burnout prevention & focus soundscapes" },
        { id: "parent", name: "Parent", description: "Family balance, mindful patience & parent support circles" },
        { id: "couple", name: "Couple", description: "Nurturing a shared life and relationship" },
        { id: "family", name: "Family", description: "Fostering harmony and household well-being" },
        { id: "women", name: "Women", description: "Focused on women's unique wellness needs" },
        { id: "men", name: "Men", description: "Tailored support for men's mental health" },
        { id: "senior_citizen", name: "Senior Citizen", description: "Gentle vitality, daily calm & voice-guided reflection" }
      ];
      for (const cat of catsToInsert) {
        await sql`
          INSERT INTO categories (id, name, description)
          VALUES (${cat.id}, ${cat.name}, ${cat.description})
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    // Seed questions
    const existingQuests = await sql`SELECT COUNT(*) FROM questions`;
    if (parseInt(existingQuests[0].count) === 0) {
      console.log("[Neon DB] Seeding questions...");
      const { COMMON_QUESTIONS } = require("@/frontend/lib/assessment/questions/common");
      const { studentQuestions } = require("@/frontend/lib/assessment/questions/student");
      const { youngProfessionalQuestions } = require("@/frontend/lib/assessment/questions/youngProfessional");
      const { workingProfessionalQuestions } = require("@/frontend/lib/assessment/questions/workingProfessional");
      const { parentQuestions } = require("@/frontend/lib/assessment/questions/parent");
      const { coupleQuestions } = require("@/frontend/lib/assessment/questions/couple");
      const { familyQuestions } = require("@/frontend/lib/assessment/questions/family");
      const { womenQuestions } = require("@/frontend/lib/assessment/questions/women");
      const { menQuestions } = require("@/frontend/lib/assessment/questions/men");
      const { seniorCitizenQuestions } = require("@/frontend/lib/assessment/questions/seniorCitizen");

      const allQuests = [
        ...COMMON_QUESTIONS.map((q: any) => ({ ...q, type: "common", category: null })),
        ...studentQuestions.map((q: any) => ({ ...q, type: "category", category: "student" })),
        ...youngProfessionalQuestions.map((q: any) => ({ ...q, type: "category", category: "young_pro" })),
        ...workingProfessionalQuestions.map((q: any) => ({ ...q, type: "category", category: "working_professional" })),
        ...parentQuestions.map((q: any) => ({ ...q, type: "category", category: "parent" })),
        ...coupleQuestions.map((q: any) => ({ ...q, type: "category", category: "couple" })),
        ...familyQuestions.map((q: any) => ({ ...q, type: "category", category: "family" })),
        ...womenQuestions.map((q: any) => ({ ...q, type: "category", category: "women" })),
        ...menQuestions.map((q: any) => ({ ...q, type: "category", category: "men" })),
        ...seniorCitizenQuestions.map((q: any) => ({ ...q, type: "category", category: "senior_citizen" }))
      ];

      for (const q of allQuests) {
        await sql`
          INSERT INTO questions (id, key, text, description, category, type, options)
          VALUES (${q.id}, ${q.key}, ${q.text}, ${q.description}, ${q.category}, ${q.type}, ${JSON.stringify(q.options)}::jsonb)
          ON CONFLICT (id) DO NOTHING
        `;
      }
    }

    console.log("[Neon DB] Database tables initialized and seeded successfully.");
    isInitialized = true;
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

    // 2. Insert into the legacy user_assessments table (for backward compatibility)
    const stressAns = detailedAnswers.find((a) => a.questionKey === "stress_level");
    const sleepAns = detailedAnswers.find((a) => a.questionKey === "sleep_quality");
    const supportAns = detailedAnswers.find((a) => a.questionKey === "confidence_coping");

    const stressFreq = stressAns ? Math.min(5, Math.max(1, 6 - stressAns.score)) : 3;
    const sleepQual = sleepAns ? Math.min(5, Math.max(1, sleepAns.score)) : 4;
    const supportLvl = supportAns ? Math.min(5, Math.max(1, supportAns.score)) : 3;

    await sql`
      INSERT INTO user_assessments (user_id, category, stress_frequency, sleep_quality, support_level, computed_score, answers_json)
      VALUES (${userId}, ${category}, ${stressFreq}, ${sleepQual}, ${supportLvl}, ${totalScore}, ${JSON.stringify(detailedAnswers)}::jsonb)
    `;

    // 3. Insert into the new assessments table
    const resultQuery = await sql`
      INSERT INTO assessments (user_id, category, total_score, max_score, percentage, wellness_level)
      VALUES (${userId}, ${category}, ${totalScore}, 75, ${percentage}, ${wellnessLevel})
      RETURNING id
    `;
    const resultId = resultQuery[0]?.id;

    // 4. Insert each individual answer into the new detailed assessment_answers_detailed table
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

    console.log("[Neon DB] Saved full 15-question user assessment successfully:", userId);
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


