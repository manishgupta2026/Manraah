import { COMMON_QUESTIONS } from "./commonQuestions";
import { AssessmentQuestion, AssessmentAnswer } from "./types";

export class AssessmentEngine {
  private questions: AssessmentQuestion[];

  constructor() {
    this.questions = COMMON_QUESTIONS;
  }

  getQuestions(): AssessmentQuestion[] {
    return this.questions;
  }

  getQuestionCount(): number {
    return this.questions.length;
  }

  getQuestionByIndex(index: number): AssessmentQuestion | undefined {
    return this.questions[index];
  }

  validateAnswer(questionId: number, optionId: string): boolean {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) return false;
    return question.options.some((opt) => opt.id === optionId);
  }

  createAnswer(questionId: number, optionId: string): AssessmentAnswer | null {
    const question = this.questions.find((q) => q.id === questionId);
    if (!question) return null;
    const option = question.options.find((opt) => opt.id === optionId);
    if (!option) return null;

    return {
      questionId: question.id,
      questionKey: question.key,
      selectedOptionId: option.id,
      selectedText: option.text,
      score: option.score,
    };
  }
}

export const assessmentEngine = new AssessmentEngine();
