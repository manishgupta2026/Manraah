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
}

export interface AssessmentHistoryItem {
  id: number;
  categoryId: string;
  categoryName?: string;
  rawScore: number;
  score: number;
  completedAt: string;
}

/**
 * Returns the 5 canonical life-stage wellness categories along with user's latest scores.
 */
export async function getAll5WellnessCategoriesWithScores(
  userId?: string | null
): Promise<LifeStageWellnessCategory[]> {
  try {
    if (!userId) {
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

    // Query distinct latest assessment per category for the authenticated user
    const rows = await sql`
      WITH latest_assessments AS (
        SELECT DISTINCT ON (category_id)
          id,
          category_id,
          score,
          completed_at,
          COUNT(*) OVER (PARTITION BY category_id) as cat_count
        FROM wellness_assessments
        WHERE user_id = ${userId}
        ORDER BY category_id, completed_at DESC
      )
      SELECT 
        c.id,
        c.name,
        c.description,
        c.icon,
        c.color_theme as "colorTheme",
        c.active,
        la.score,
        la.completed_at as "completedAt",
        la.cat_count as "assessmentCount"
      FROM wellness_categories c
      LEFT JOIN latest_assessments la ON c.id = la.category_id
      WHERE c.id IN ('student', 'parent', 'couple', 'working-professional', 'other')
      ORDER BY 
        CASE c.id
          WHEN 'student' THEN 1
          WHEN 'parent' THEN 2
          WHEN 'couple' THEN 3
          WHEN 'working-professional' THEN 4
          WHEN 'other' THEN 5
          ELSE 6
        END ASC
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
 * Returns the authenticated user's current category details and wellness score.
 */
export async function getUserCurrentWellness(
  userId: string,
  rawCategory?: string | null
): Promise<CurrentWellnessResponse> {
  const normalizedCategory = normalizeCategorySlug(rawCategory);
  const allCategories = await getAll5WellnessCategoriesWithScores(userId);

  const currentCategoryData = allCategories.find((c) => c.id === normalizedCategory) || {
    id: normalizedCategory,
    name: normalizedCategory === "working-professional" ? "Working Professional" : normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1),
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
 * Calculates score on the server and saves the record in Neon DB.
 */
export async function submitWellnessAssessment(
  userId: string,
  rawCategory: string,
  submittedAnswers: RawAnswerInput[]
) {
  const categoryId = normalizeCategorySlug(rawCategory);
  const questions = await getQuestionsForCategory(categoryId);

  if (questions.length !== 5) {
    throw new Error(
      `Category ${categoryId} requires 5 configured questions, found ${questions.length}.`
    );
  }

  // 1. Calculate Score Server-Side
  const calculated = calculateCategoryScore(categoryId, submittedAnswers, questions);

  // 2. Insert into wellness_assessments table
  const insertAssessmentResult = await sql`
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
    RETURNING id, category_id, raw_score, score, completed_at;
  `;

  const newAssessment = insertAssessmentResult[0];
  const assessmentId = Number(newAssessment.id);

  // 3. Insert into wellness_answers table
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

  // 4. Fetch updated wellness state
  const updatedWellness = await getUserCurrentWellness(userId, categoryId);

  return {
    success: true,
    assessmentId,
    categoryId,
    score: calculated.score,
    rawScore: calculated.rawScore,
    completedAt: new Date(newAssessment.completed_at).toISOString(),
    levelBadge: calculated.levelBadge,
    levelDescription: calculated.levelDescription,
    currentWellness: updatedWellness,
  };
}

/**
 * Returns assessment history for a specific category.
 */
export async function getAssessmentHistoryForCategory(
  userId: string,
  rawCategory: string
): Promise<AssessmentHistoryItem[]> {
  try {
    const categoryId = normalizeCategorySlug(rawCategory);
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
      categoryName: r.categoryName || r.categoryId,
      rawScore: Number(r.rawScore),
      score: Number(r.score),
      completedAt: new Date(r.completedAt).toISOString(),
    }));
  } catch (err) {
    console.error("Error in getAssessmentHistoryForCategory:", err);
    return [];
  }
}
