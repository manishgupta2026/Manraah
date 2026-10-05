import { sql } from "@/backend/db/client";
import {
  calculateCategoryScore,
  getWellnessLevelInfo,
  normalizeCategorySlug,
  CANONICAL_CATEGORIES,
  CanonicalCategorySlug,
  RawAnswerInput,
  ValidatedQuestion,
} from "@/backend/lib/wellness-score-calc";

export interface LifeStageWellnessCategory {
  id: CanonicalCategorySlug;
  name: string;
  description: string;
  icon: string;
  colorTheme: string;
  active: boolean;
  score: number | null;
  completedAt: string | null;
  completed: boolean;
  assessmentCount: number;
}

export interface CurrentWellnessResponse {
  category: {
    slug: CanonicalCategorySlug;
    name: string;
    description: string;
    icon: string;
    colorTheme: string;
  };
  score: number | null;
  assessmentCompleted: boolean;
  completedAt: string | null;
  levelBadge?: string;
  levelDescription?: string;
  allCategories: LifeStageWellnessCategory[];
  history: AssessmentHistoryItem[];
}

export interface AssessmentHistoryItem {
  id: number;
  categoryId: string;
  categoryName?: string;
  rawScore: number;
  score: number;
  completedAt: string;
}

let wellnessSchemaEnsured = false;

export async function ensureWellnessAssessmentSchema() {
  if (wellnessSchemaEnsured || (globalThis as any).__wellnessSchemaEnsured) return;
  wellnessSchemaEnsured = true;
  (globalThis as any).__wellnessSchemaEnsured = true;

  try {
    // 1. Ensure categories table exists
    await sql`
      CREATE TABLE IF NOT EXISTS wellness_categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100) DEFAULT 'spa',
        color_theme VARCHAR(50) DEFAULT 'emerald',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 2. Ensure questions table exists
    await sql`
      CREATE TABLE IF NOT EXISTS wellness_questions (
        id SERIAL PRIMARY KEY,
        category_id VARCHAR(100) REFERENCES wellness_categories(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_order INT NOT NULL,
        reverse_scored BOOLEAN DEFAULT false,
        options_json JSONB DEFAULT '[]'::jsonb,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_category_question_order UNIQUE (category_id, question_order)
      )
    `;

    // 3. Current / Latest Assessment per user + category
    await sql`
      CREATE TABLE IF NOT EXISTS wellness_assessments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(100) REFERENCES wellness_categories(id) ON DELETE CASCADE,
        raw_score INT NOT NULL CHECK (raw_score BETWEEN 5 AND 25),
        score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 4. Unique index ensuring ONE current assessment per user + category
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_category_assessment 
      ON wellness_assessments(user_id, category_id)
    `;

    // 5. Separate Assessment History Table preserving all historical attempts
    await sql`
      CREATE TABLE IF NOT EXISTS wellness_assessment_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        category_id VARCHAR(100) REFERENCES wellness_categories(id) ON DELETE CASCADE,
        assessment_id INT,
        raw_score INT NOT NULL CHECK (raw_score BETWEEN 5 AND 25),
        score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
        answers_json JSONB DEFAULT '[]'::jsonb,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_wah_user_cat_date 
      ON wellness_assessment_history(user_id, category_id, completed_at DESC)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_wah_user_date 
      ON wellness_assessment_history(user_id, completed_at DESC)
    `;

    // 6. Answers breakdown table
    await sql`
      CREATE TABLE IF NOT EXISTS wellness_answers (
        id SERIAL PRIMARY KEY,
        assessment_id INT REFERENCES wellness_assessments(id) ON DELETE CASCADE,
        question_id INT REFERENCES wellness_questions(id) ON DELETE CASCADE,
        answer INT NOT NULL CHECK (answer BETWEEN 1 AND 5),
        normalized_answer INT NOT NULL CHECK (normalized_answer BETWEEN 1 AND 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 7. Seed canonical categories if table is empty
    const catCount = await sql`SELECT COUNT(*) as cnt FROM wellness_categories`;
    if (Number(catCount[0]?.cnt || 0) === 0) {
      await sql`
        INSERT INTO wellness_categories (id, name, description, icon, color_theme, active)
        VALUES
          ('student', 'Student', 'Academic balance, exam stress reduction & peer focus', 'school', 'emerald', true),
          ('parent', 'Parent', 'Family balance, mindful patience & parent support', 'family_restroom', 'peach', true),
          ('couple', 'Couple', 'Nurturing mutual communication & relationship harmony', 'favorite', 'pink', true),
          ('working-professional', 'Working Professional', 'Work-life harmony, burnout care & career fulfillment', 'work', 'purple', true),
          ('other', 'Other', 'Holistic emotional wellbeing & daily balance', 'self_improvement', 'teal', true)
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // 8. Seed questions if table is empty
    const questCount = await sql`SELECT COUNT(*) as cnt FROM wellness_questions`;
    if (Number(questCount[0]?.cnt || 0) === 0) {
      const defaultOptions = JSON.stringify([
        { score: 1, text: "Never / Rarely" },
        { score: 2, text: "Seldom" },
        { score: 3, text: "Sometimes" },
        { score: 4, text: "Often" },
        { score: 5, text: "Almost Always" },
      ]);

      const seedQuestions = [
        // Student
        { category: "student", order: 1, text: "How often do you feel overwhelmed by your academic workload or exam preparation?", reverse: true },
        { category: "student", order: 2, text: "How consistently are you able to maintain a regular sleep schedule during your studies?", reverse: false },
        { category: "student", order: 3, text: "How supported do you feel by your peers, mentors, or family when facing academic stress?", reverse: false },
        { category: "student", order: 4, text: "How confident do you feel in managing your time between academics, rest, and personal life?", reverse: false },
        { category: "student", order: 5, text: "How effectively are you able to focus and retain information without feeling exhausted?", reverse: false },

        // Parent
        { category: "parent", order: 1, text: "How often do you feel drained or overwhelmed by daily parenting responsibilities?", reverse: true },
        { category: "parent", order: 2, text: "How confident are you in responding calmly to stressful family situations?", reverse: false },
        { category: "parent", order: 3, text: "How consistently do you find time for your own personal rest and emotional recovery?", reverse: false },
        { category: "parent", order: 4, text: "How supported do you feel by your partner, family, or community in caretaking?", reverse: false },
        { category: "parent", order: 5, text: "How well are you able to balance family care with your personal goals and well-being?", reverse: false },

        // Couple
        { category: "couple", order: 1, text: "How often do unresolved disagreements or communication gaps cause tension in your relationship?", reverse: true },
        { category: "couple", order: 2, text: "How comfortable and emotionally safe do you feel sharing your vulnerable feelings with your partner?", reverse: false },
        { category: "couple", order: 3, text: "How consistently do you and your partner spend quality, meaningful time together without distractions?", reverse: false },
        { category: "couple", order: 4, text: "How supported and valued do you feel by your partner in your daily life and ambitions?", reverse: false },
        { category: "couple", order: 5, text: "How effectively do you and your partner resolve conflicts with mutual empathy and respect?", reverse: false },

        // Working Professional
        { category: "working-professional", order: 1, text: "How often do workplace demands or long working hours leave you feeling physically and mentally exhausted?", reverse: true },
        { category: "working-professional", order: 2, text: "How effectively are you able to disconnect from work during your personal and rest hours?", reverse: false },
        { category: "working-professional", order: 3, text: "How confident do you feel in setting healthy boundaries with colleagues, managers, or clients?", reverse: false },
        { category: "working-professional", order: 4, text: "How motivated and fulfilled do you feel in your current career journey and daily tasks?", reverse: false },
        { category: "working-professional", order: 5, text: "How well are you able to manage workplace pressure without feeling chronic burnout?", reverse: false },

        // Other
        { category: "other", order: 1, text: "How often do you feel anxious, stressed, or emotionally unsettled in your daily life?", reverse: true },
        { category: "other", order: 2, text: "How consistently do you engage in mindfulness, physical activity, or restorative rest?", reverse: false },
        { category: "other", order: 3, text: "How satisfied are you with your daily routine and overall sense of personal balance?", reverse: false },
        { category: "other", order: 4, text: "How connected and supported do you feel by the people around you?", reverse: false },
        { category: "other", order: 5, text: "How optimistic and resilient do you feel when dealing with unexpected life changes?", reverse: false },
      ];

      for (const q of seedQuestions) {
        await sql`
          INSERT INTO wellness_questions (category_id, question_text, question_order, reverse_scored, options_json, active)
          VALUES (${q.category}, ${q.text}, ${q.order}, ${q.reverse}, ${defaultOptions}::jsonb, true)
          ON CONFLICT (category_id, question_order) DO NOTHING;
        `;
      }
    }
  } catch (err) {
    console.error("ensureWellnessAssessmentSchema non-fatal note:", err);
  }
}

/**
 * Returns the 5 canonical life-stage wellness categories along with user's latest completed assessment scores.
 * Only returns a score for categories the user has actually completed.
 */
export async function getAll5WellnessCategoriesWithScores(
  userId?: string | null
): Promise<LifeStageWellnessCategory[]> {
  await ensureWellnessAssessmentSchema();

  try {
    if (!userId || userId === "guest" || userId === "demo-user") {
      return CANONICAL_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        colorTheme: c.colorTheme,
        active: true,
        score: null,
        completedAt: null,
        completed: false,
        assessmentCount: 0,
      }));
    }

    // Query latest current assessment per category with total history attempt count
    const rows = await sql`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.color_theme as "colorTheme",
        c.active,
        wa.score,
        wa.completed_at as "completedAt",
        COALESCE(h_stats.assessment_count, CASE WHEN wa.id IS NOT NULL THEN 1 ELSE 0 END) as "assessmentCount"
      FROM (
        VALUES 
          ('student', 'Student', 'Academic balance, exam stress reduction & peer focus', 'school', 'emerald', true, 1),
          ('parent', 'Parent', 'Family balance, mindful patience & parent support', 'family_restroom', 'peach', true, 2),
          ('couple', 'Couple', 'Nurturing mutual communication & relationship harmony', 'favorite', 'pink', true, 3),
          ('working-professional', 'Working Professional', 'Work-life harmony, burnout care & career fulfillment', 'work', 'purple', true, 4),
          ('other', 'Other', 'Holistic emotional wellbeing & daily balance', 'self_improvement', 'teal', true, 5)
      ) AS c(id, name, description, icon, color_theme, active, sort_order)
      LEFT JOIN wellness_assessments wa 
        ON (c.id = wa.category_id OR (c.id = 'working-professional' AND wa.category_id = 'working_professional')) 
        AND wa.user_id = ${userId}
      LEFT JOIN (
        SELECT 
          CASE WHEN category_id = 'working_professional' THEN 'working-professional' ELSE category_id END as normalized_cat_id,
          COUNT(*) as assessment_count
        FROM wellness_assessment_history
        WHERE user_id = ${userId}
        GROUP BY normalized_cat_id
      ) h_stats ON h_stats.normalized_cat_id = c.id
      ORDER BY c.sort_order ASC
    `;

    return rows.map((r: any) => ({
      id: r.id as CanonicalCategorySlug,
      name: r.name,
      description: r.description || "",
      icon: r.icon || "spa",
      colorTheme: r.colorTheme || "emerald",
      active: Boolean(r.active),
      score: r.score !== null && r.score !== undefined ? Number(r.score) : null,
      completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : null,
      completed: r.score !== null && r.score !== undefined,
      assessmentCount: Number(r.assessmentCount || 0),
    }));
  } catch (err) {
    console.error("Error in getAll5WellnessCategoriesWithScores:", err);
    return CANONICAL_CATEGORIES.map((c) => ({
      ...c,
      active: true,
      score: null,
      completedAt: null,
      completed: false,
      assessmentCount: 0,
    }));
  }
}

/**
 * Returns completed wellness assessment attempts for the authenticated user.
 * If rawCategory is provided, strictly filters for that category.
 */
export async function getUserWellnessHistory(
  userId?: string | null,
  rawCategory?: string | null
): Promise<AssessmentHistoryItem[]> {
  if (!userId || userId === "guest" || userId === "demo-user") {
    return [];
  }
  await ensureWellnessAssessmentSchema();
  try {
    const categoryId = rawCategory ? normalizeCategorySlug(rawCategory) : null;
    // 1. Try querying history table
    let historyRows;
    if (categoryId) {
      historyRows = await sql`
        SELECT 
          h.id,
          CASE WHEN h.category_id = 'working_professional' THEN 'working-professional' ELSE h.category_id END as "categoryId",
          COALESCE(c.name, h.category_id) as "categoryName",
          h.raw_score as "rawScore",
          h.score,
          h.completed_at as "completedAt"
        FROM wellness_assessment_history h
        LEFT JOIN wellness_categories c ON (h.category_id = c.id OR (h.category_id = 'working_professional' AND c.id = 'working-professional'))
        WHERE h.user_id = ${userId}
          AND (h.category_id = ${categoryId} OR (h.category_id = 'working_professional' AND ${categoryId} = 'working-professional'))
        ORDER BY h.completed_at DESC, h.id DESC;
      `;
    } else {
      historyRows = await sql`
        SELECT 
          h.id,
          CASE WHEN h.category_id = 'working_professional' THEN 'working-professional' ELSE h.category_id END as "categoryId",
          COALESCE(c.name, h.category_id) as "categoryName",
          h.raw_score as "rawScore",
          h.score,
          h.completed_at as "completedAt"
        FROM wellness_assessment_history h
        LEFT JOIN wellness_categories c ON (h.category_id = c.id OR (h.category_id = 'working_professional' AND c.id = 'working-professional'))
        WHERE h.user_id = ${userId}
        ORDER BY h.completed_at DESC, h.id DESC;
      `;
    }

    if (historyRows.length > 0) {
      return historyRows.map((r: any) => ({
        id: Number(r.id),
        categoryId: r.categoryId,
        categoryName:
          r.categoryName ||
          (r.categoryId === "working-professional"
            ? "Working Professional"
            : r.categoryId.charAt(0).toUpperCase() + r.categoryId.slice(1)),
        rawScore: Number(r.rawScore),
        score: Number(r.score),
        completedAt: new Date(r.completedAt).toISOString(),
      }));
    }

    // 2. Seamless fallback from current assessments if history table is empty
    let fallbackRows;
    if (categoryId) {
      fallbackRows = await sql`
        SELECT 
          a.id,
          CASE WHEN a.category_id = 'working_professional' THEN 'working-professional' ELSE a.category_id END as "categoryId",
          COALESCE(c.name, a.category_id) as "categoryName",
          a.raw_score as "rawScore",
          a.score,
          a.completed_at as "completedAt"
        FROM wellness_assessments a
        LEFT JOIN wellness_categories c ON (a.category_id = c.id OR (a.category_id = 'working_professional' AND c.id = 'working-professional'))
        WHERE a.user_id = ${userId}
          AND (a.category_id = ${categoryId} OR (a.category_id = 'working_professional' AND ${categoryId} = 'working-professional'))
        ORDER BY a.completed_at DESC, a.id DESC;
      `;
    } else {
      fallbackRows = await sql`
        SELECT 
          a.id,
          CASE WHEN a.category_id = 'working_professional' THEN 'working-professional' ELSE a.category_id END as "categoryId",
          COALESCE(c.name, a.category_id) as "categoryName",
          a.raw_score as "rawScore",
          a.score,
          a.completed_at as "completedAt"
        FROM wellness_assessments a
        LEFT JOIN wellness_categories c ON (a.category_id = c.id OR (a.category_id = 'working_professional' AND c.id = 'working-professional'))
        WHERE a.user_id = ${userId}
        ORDER BY a.completed_at DESC, a.id DESC;
      `;
    }

    return fallbackRows.map((r: any) => ({
      id: Number(r.id),
      categoryId: r.categoryId,
      categoryName:
        r.categoryName ||
        (r.categoryId === "working-professional"
          ? "Working Professional"
          : r.categoryId.charAt(0).toUpperCase() + r.categoryId.slice(1)),
      rawScore: Number(r.rawScore),
      score: Number(r.score),
      completedAt: new Date(r.completedAt).toISOString(),
    }));
  } catch (err) {
    console.error("Error in getUserWellnessHistory:", err);
    return [];
  }
}

/**
 * Returns the authenticated user's current category details, stored wellness score, and full history.
 * If the category has never been assessed by this user, score is null and assessmentCompleted is false.
 */
export async function getUserCurrentWellness(
  userId: string | null,
  rawCategory?: string | null
): Promise<CurrentWellnessResponse> {
  await ensureWellnessAssessmentSchema();
  const normalizedCategory = normalizeCategorySlug(rawCategory);
  const [allCategories, history] = await Promise.all([
    getAll5WellnessCategoriesWithScores(userId),
    getUserWellnessHistory(userId),
  ]);

  const currentCategoryData = allCategories.find((c) => c.id === normalizedCategory) || {
    id: normalizedCategory,
    name:
      normalizedCategory === "working-professional"
        ? "Working Professional"
        : normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1),
    description: "",
    icon: "spa",
    colorTheme: "emerald",
    active: true,
    score: null,
    completedAt: null,
    completed: false,
    assessmentCount: 0,
  };

  const levelInfo =
    currentCategoryData.score !== null
      ? getWellnessLevelInfo(currentCategoryData.score)
      : undefined;

  return {
    category: {
      slug: currentCategoryData.id,
      name: currentCategoryData.name,
      description: currentCategoryData.description,
      icon: currentCategoryData.icon,
      colorTheme: currentCategoryData.colorTheme,
    },
    score: currentCategoryData.score,
    assessmentCompleted: currentCategoryData.completed,
    completedAt: currentCategoryData.completedAt,
    levelBadge: levelInfo?.levelBadge,
    levelDescription: levelInfo?.levelDescription,
    allCategories,
    history,
  };
}

/**
 * Returns the 5 active questions for a given life-stage category.
 */
export async function getQuestionsForCategory(
  rawCategory: string
): Promise<ValidatedQuestion[]> {
  try {
    const categoryId = normalizeCategorySlug(rawCategory);
    const rows = await sql`
      SELECT 
        id,
        category_id as "categoryId",
        question_text as "questionText",
        question_order as "questionOrder",
        reverse_scored as "reverseScored",
        options_json as "optionsJson"
      FROM wellness_questions
      WHERE category_id = ${categoryId} AND active = true
      ORDER BY question_order ASC
    `;

    return rows.map((r: any) => ({
      id: Number(r.id),
      categoryId: r.categoryId,
      questionText: r.questionText,
      questionOrder: Number(r.questionOrder),
      reverseScored: Boolean(r.reverseScored),
      optionsJson: r.optionsJson,
    }));
  } catch (err) {
    console.error(`Error in getQuestionsForCategory for ${rawCategory}:`, err);
    return [];
  }
}

/**
 * Submits a 5-question wellness assessment for a user's category.
 * Calculates score on the server and UPSERTS the single record for (userId, categoryId) in Neon DB.
 */
export async function submitWellnessAssessment(
  userId: string,
  rawCategory: string,
  submittedAnswers: RawAnswerInput[]
) {
  await ensureWellnessAssessmentSchema();
  const categoryId = normalizeCategorySlug(rawCategory);
  const questions = await getQuestionsForCategory(categoryId);

  if (questions.length !== 5) {
    throw new Error(
      `Category ${categoryId} requires 5 configured questions, found ${questions.length}.`
    );
  }

  // Ensure user exists in users table if needed
  try {
    const userEmail = userId.includes("@") ? userId : `${userId}@manraah.internal`;
    await sql`
      INSERT INTO users (id, email, name, created_at)
      VALUES (${userId}, ${userEmail}, 'Ashutosh Sahu', CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO NOTHING;
    `;
  } catch (userErr) {
    // Non-fatal if table doesn't have constraint or user already exists
  }

  // 1. Calculate Score Server-Side
  const calculated = calculateCategoryScore(categoryId, submittedAnswers, questions);

  // 2. Atomic UPSERT into wellness_assessments table for current assessment (preserving unique constraint idx_user_category_assessment)
  const upsertAssessmentResult = await sql`
    INSERT INTO wellness_assessments (
      user_id,
      category_id,
      raw_score,
      score,
      completed_at,
      created_at
    )
    VALUES (
      ${userId},
      ${categoryId},
      ${calculated.rawScore},
      ${calculated.score},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (user_id, category_id) DO UPDATE SET
      raw_score = EXCLUDED.raw_score,
      score = EXCLUDED.score,
      completed_at = CURRENT_TIMESTAMP
    RETURNING id, category_id, raw_score, score, completed_at;
  `;

  const assessmentRecord = upsertAssessmentResult[0];
  const assessmentId = Number(assessmentRecord.id);

  // 3. Record new immutable history attempt in wellness_assessment_history
  try {
    await sql`
      INSERT INTO wellness_assessment_history (
        user_id,
        category_id,
        assessment_id,
        raw_score,
        score,
        answers_json,
        completed_at,
        created_at
      )
      VALUES (
        ${userId},
        ${categoryId},
        ${assessmentId},
        ${calculated.rawScore},
        ${calculated.score},
        ${JSON.stringify(calculated.answers)},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;
  } catch (histErr) {
    console.error("Error inserting assessment history:", histErr);
    // If history table doesn't exist yet, ensure schema and retry once
    await ensureWellnessAssessmentSchema();
    await sql`
      INSERT INTO wellness_assessment_history (
        user_id,
        category_id,
        assessment_id,
        raw_score,
        score,
        answers_json,
        completed_at,
        created_at
      )
      VALUES (
        ${userId},
        ${categoryId},
        ${assessmentId},
        ${calculated.rawScore},
        ${calculated.score},
        ${JSON.stringify(calculated.answers)},
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
    `;
  }

  // 4. Clear and insert updated responses into wellness_answers
  try {
    await sql`DELETE FROM wellness_answers WHERE assessment_id = ${assessmentId}`;
    for (const ans of calculated.answers) {
      await sql`
        INSERT INTO wellness_answers (
          assessment_id,
          question_id,
          answer,
          normalized_answer,
          created_at
        )
        VALUES (
          ${assessmentId},
          ${ans.questionId},
          ${ans.answer},
          ${ans.normalizedAnswer},
          CURRENT_TIMESTAMP
        )
      `;
    }
  } catch (ansErr) {
    console.warn("Non-fatal answer log warning:", ansErr);
  }

  // 5. Fetch updated wellness state
  const updatedWellness = await getUserCurrentWellness(userId, categoryId);

  return {
    success: true,
    assessmentId,
    categoryId,
    score: calculated.score,
    rawScore: calculated.rawScore,
    completedAt: new Date(assessmentRecord.completed_at).toISOString(),
    levelBadge: calculated.levelBadge,
    levelDescription: calculated.levelDescription,
    currentWellness: updatedWellness,
  };
}

/**
 * Returns assessment history for a specific category.
 */
export async function getAssessmentHistoryForCategory(
  userId: string | null,
  rawCategory: string
): Promise<AssessmentHistoryItem[]> {
  if (!userId || userId === "guest" || userId === "demo-user") {
    return [];
  }
  await ensureWellnessAssessmentSchema();
  try {
    const categoryId = normalizeCategorySlug(rawCategory);

    // 1. First try querying history table
    const historyRows = await sql`
      SELECT 
        h.id,
        h.category_id as "categoryId",
        c.name as "categoryName",
        h.raw_score as "rawScore",
        h.score,
        h.completed_at as "completedAt"
      FROM wellness_assessment_history h
      LEFT JOIN wellness_categories c ON h.category_id = c.id
      WHERE h.user_id = ${userId} AND h.category_id = ${categoryId}
      ORDER BY h.completed_at DESC, h.id DESC
      LIMIT 10;
    `;

    if (historyRows.length > 0) {
      return historyRows.map((r: any) => ({
        id: Number(r.id),
        categoryId: r.categoryId,
        categoryName:
          r.categoryName ||
          (r.categoryId === "working-professional"
            ? "Working Professional"
            : r.categoryId.charAt(0).toUpperCase() + r.categoryId.slice(1)),
        rawScore: Number(r.rawScore),
        score: Number(r.score),
        completedAt: new Date(r.completedAt).toISOString(),
      }));
    }

    // 2. Fallback to current assessment
    const rows = await sql`
      SELECT 
        a.id,
        a.category_id as "categoryId",
        c.name as "categoryName",
        a.raw_score as "rawScore",
        a.score,
        a.completed_at as "completedAt"
      FROM wellness_assessments a
      LEFT JOIN wellness_categories c ON a.category_id = c.id
      WHERE a.user_id = ${userId} AND a.category_id = ${categoryId}
      ORDER BY a.completed_at DESC
      LIMIT 10;
    `;

    return rows.map((r: any) => ({
      id: Number(r.id),
      categoryId: r.categoryId,
      categoryName:
        r.categoryName ||
        (r.categoryId === "working-professional"
          ? "Working Professional"
          : r.categoryId.charAt(0).toUpperCase() + r.categoryId.slice(1)),
      rawScore: Number(r.rawScore),
      score: Number(r.score),
      completedAt: new Date(r.completedAt).toISOString(),
    }));
  } catch (err) {
    console.error("Error in getAssessmentHistoryForCategory:", err);
    return [];
  }
}
