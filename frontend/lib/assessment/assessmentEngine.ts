import { AssessmentQuestion, AssessmentAnswer } from "./types";
import { COMMON_QUESTIONS, getCategoryQuestions } from "./questions";

export class AssessmentEngine {
  /**
   * Loads the 5 common questions and 10 category-specific questions,
   * merging them into a total of 15 questions.
   */
  getQuestionsForCategory(category: string | null): AssessmentQuestion[] {
    const common = COMMON_QUESTIONS.map(q => ({
      ...q,
      type: "common" as const
    }));

    const categoryQuestions = getCategoryQuestions(category).map(q => ({
      ...q,
      type: "category" as const,
      category: category || "student"
    }));

    return [...common, ...categoryQuestions];
  }

  getQuestionCount(category: string | null): number {
    return this.getQuestionsForCategory(category).length;
  }

  getQuestionByIndex(category: string | null, index: number): AssessmentQuestion | undefined {
    return this.getQuestionsForCategory(category)[index];
  }

  validateAnswer(category: string | null, questionId: number, optionId: string): boolean {
    const questions = this.getQuestionsForCategory(category);
    const question = questions.find((q) => q.id === questionId);
    if (!question) return false;
    return question.options.some((opt) => opt.id === optionId);
  }

  createAnswer(category: string | null, questionId: number, optionId: string): AssessmentAnswer | null {
    const questions = this.getQuestionsForCategory(category);
    const question = questions.find((q) => q.id === questionId);
    if (!question) return null;
    const option = question.options.find((opt) => opt.id === optionId);
    if (!option) return null;

    return {
      questionId: question.id,
      questionKey: question.key,
      questionType: question.type,
      category: question.category || category || "student",
      selectedOptionId: option.id,
      selectedText: option.text,
      score: option.score,
      answeredAt: new Date().toISOString(),
    };
  }
}

export const assessmentEngine = new AssessmentEngine();
