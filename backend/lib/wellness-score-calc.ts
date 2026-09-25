export type CanonicalCategorySlug =
  | "student"
  | "parent"
  | "couple"
  | "working-professional"
  | "other";

export const CANONICAL_CATEGORIES: {
  id: CanonicalCategorySlug;
  name: string;
  description: string;
  icon: string;
  colorTheme: string;
}[] = [
  {
    id: "student",
    name: "Student",
    description: "Academic balance, exam stress management, sleep, and healthy peer focus.",
    icon: "school",
    colorTheme: "emerald",
  },
  {
    id: "parent",
    name: "Parent",
    description: "Family balance, mindful patience, emotional resilience, and parenting support.",
    icon: "family_restroom",
    colorTheme: "peach",
  },
  {
    id: "couple",
    name: "Couple",
    description: "Nurturing mutual communication, emotional intimacy, conflict resolution, and shared balance.",
    icon: "favorite",
    colorTheme: "pink",
  },
  {
    id: "working-professional",
    name: "Working Professional",
    description: "Work-life harmony, workplace stress reduction, burnout prevention, and career fulfillment.",
    icon: "work",
    colorTheme: "purple",
  },
  {
    id: "other",
    name: "Other",
    description: "Holistic emotional wellbeing, daily routine balance, stress mindfulness, and personal fulfillment.",
    icon: "self_improvement",
    colorTheme: "teal",
  },
];

/**
 * Normalizes any category string or legacy alias into one of the 5 canonical slugs.
 */
export function normalizeCategorySlug(rawCategory?: string | null): CanonicalCategorySlug {
  if (!rawCategory) return "student";
  const slug = rawCategory.trim().toLowerCase().replace(/_/g, "-");

  if (slug === "student" || slug === "academic") {
    return "student";
  }
  if (slug === "parent" || slug === "parents") {
    return "parent";
  }
  if (slug === "couple" || slug === "couples") {
    return "couple";
  }
  if (
    slug === "working-professional" ||
    slug === "workingprofessional" ||
    slug === "young-pro" ||
    slug === "youngpro" ||
    slug === "career" ||
    slug === "work"
  ) {
    return "working-professional";
  }
  return "other";
}

export function getCategoryDisplayName(slug: string): string {
  const normalized = normalizeCategorySlug(slug);
  const found = CANONICAL_CATEGORIES.find((c) => c.id === normalized);
  return found ? found.name : "Student";
}

export interface RawAnswerInput {
  questionId: number;
  answer: number; // 1 to 5
}

export interface ValidatedQuestion {
  id: number;
  categoryId: string;
  questionText: string;
  questionOrder: number;
  reverseScored: boolean;
  optionsJson?: any;
}

export interface CalculatedCategoryScore {
  categoryId: string;
  rawScore: number;
  score: number; // 0 to 100%
  answers: {
    questionId: number;
    answer: number;
    normalizedAnswer: number;
  }[];
  levelDescription: string;
  levelBadge: string;
}

export function getWellnessLevelInfo(score: number): { levelDescription: string; levelBadge: string } {
  if (score >= 80) {
    return {
      levelDescription: "You're maintaining strong wellness habits.",
      levelBadge: "Flourishing",
    };
  }
  if (score >= 60) {
    return {
      levelDescription: "You're building positive momentum.",
      levelBadge: "Good Progress",
    };
  }
  if (score >= 40) {
    return {
      levelDescription: "Small steps can make a difference.",
      levelBadge: "Fair Balance",
    };
  }
  return {
    levelDescription: "Let's take this one step at a time.",
    levelBadge: "Needs Attention",
  };
}

/**
 * Computes a single category's score from the 5 validated question responses on the server.
 */
export function calculateCategoryScore(
  categoryId: string,
  submittedAnswers: RawAnswerInput[],
  categoryQuestions: ValidatedQuestion[]
): CalculatedCategoryScore {
  if (submittedAnswers.length !== 5 || categoryQuestions.length !== 5) {
    throw new Error("Exactly 5 question answers are required to calculate a category score.");
  }

  const questionMap = new Map<number, ValidatedQuestion>();
  categoryQuestions.forEach((q) => questionMap.set(q.id, q));

  let rawScore = 0;
  const answers: { questionId: number; answer: number; normalizedAnswer: number }[] = [];

  for (const item of submittedAnswers) {
    const q = questionMap.get(item.questionId);
    if (!q) {
      throw new Error(`Question ID ${item.questionId} is not valid for category ${categoryId}.`);
    }

    const answerVal = Number(item.answer);
    if (isNaN(answerVal) || answerVal < 1 || answerVal > 5) {
      throw new Error(`Answer for question ${item.questionId} must be an integer between 1 and 5.`);
    }

    // Reverse scoring: if reverseScored is true, 1 is best (5 normalized), 5 is worst (1 normalized)
    const normalized = q.reverseScored ? 6 - answerVal : answerVal;
    rawScore += normalized;

    answers.push({
      questionId: item.questionId,
      answer: answerVal,
      normalizedAnswer: normalized,
    });
  }

  // categoryScore = Math.round(((rawScore - 5) / 20) * 100)
  const normalizedPercentage = Math.round(((rawScore - 5) / 20) * 100);
  const clampedScore = Math.max(0, Math.min(100, normalizedPercentage));
  const { levelDescription, levelBadge } = getWellnessLevelInfo(clampedScore);

  return {
    categoryId,
    rawScore,
    score: clampedScore,
    answers,
    levelDescription,
    levelBadge,
  };
}
