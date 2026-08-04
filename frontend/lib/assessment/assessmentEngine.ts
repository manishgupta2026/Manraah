import { COMMON_QUESTIONS } from "./commonQuestions";
import { AssessmentQuestion, AssessmentAnswer } from "./types";
import { StudentQuestions } from "./StudentQuestions";
import { YoungProfessionalQuestions } from "./YoungProfessionalQuestions";
import { WorkingProfessionalQuestions } from "./WorkingProfessionalQuestions";
import { ParentsQuestions } from "./ParentsQuestions";
import { CouplesQuestions } from "./CouplesQuestions";
import { FamilyQuestions } from "./FamilyQuestions";
import { WomenQuestions } from "./WomenQuestions";
import { MenQuestions } from "./MenQuestions";
import { SeniorCitizenQuestions } from "./SeniorCitizenQuestions";

export class AssessmentEngine {
  getQuestionsForCategory(category: string | null): AssessmentQuestion[] {
    if (!category) {
      return [...COMMON_QUESTIONS, ...StudentQuestions]; // fallback
    }

    const cat = category.toLowerCase();
    let categoryQuestions: AssessmentQuestion[] = [];

    switch (cat) {
      case "student":
        categoryQuestions = StudentQuestions;
        break;
      case "young_pro":
      case "young_professional":
        categoryQuestions = YoungProfessionalQuestions;
        break;
      case "working_professional":
        categoryQuestions = WorkingProfessionalQuestions;
        break;
      case "parent":
      case "parents":
        categoryQuestions = ParentsQuestions;
        break;
      case "couple":
      case "couples":
        categoryQuestions = CouplesQuestions;
        break;
      case "family":
        categoryQuestions = FamilyQuestions;
        break;
      case "women":
        categoryQuestions = WomenQuestions;
        break;
      case "men":
        categoryQuestions = MenQuestions;
        break;
      case "senior_citizen":
      case "senior":
        categoryQuestions = SeniorCitizenQuestions;
        break;
      default:
        categoryQuestions = StudentQuestions; // fallback
    }

    return [...COMMON_QUESTIONS, ...categoryQuestions];
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
      selectedOptionId: option.id,
      selectedText: option.text,
      score: option.score,
    };
  }
}

export const assessmentEngine = new AssessmentEngine();

