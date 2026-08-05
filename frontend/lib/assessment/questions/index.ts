import { AssessmentQuestion } from "../types";
import { COMMON_QUESTIONS } from "./common";
import { studentQuestions } from "./student";
import { youngProfessionalQuestions } from "./youngProfessional";
import { workingProfessionalQuestions } from "./workingProfessional";
import { parentQuestions } from "./parent";
import { coupleQuestions } from "./couple";
import { familyQuestions } from "./family";
import { womenQuestions } from "./women";
import { menQuestions } from "./men";
import { seniorCitizenQuestions } from "./seniorCitizen";

export { COMMON_QUESTIONS };

export const CATEGORY_QUESTIONS_MAP: Record<string, AssessmentQuestion[]> = {
  student: studentQuestions,
  young_pro: youngProfessionalQuestions,
  youngprofessional: youngProfessionalQuestions,
  working_professional: workingProfessionalQuestions,
  workingprofessional: workingProfessionalQuestions,
  parent: parentQuestions,
  parents: parentQuestions,
  couple: coupleQuestions,
  couples: coupleQuestions,
  family: familyQuestions,
  women: womenQuestions,
  men: menQuestions,
  senior_citizen: seniorCitizenQuestions,
  seniorcitizen: seniorCitizenQuestions,
};

export function getCategoryQuestions(category: string | null): AssessmentQuestion[] {
  if (!category) return studentQuestions; // Fallback
  const key = category.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return CATEGORY_QUESTIONS_MAP[key] || CATEGORY_QUESTIONS_MAP[category.toLowerCase()] || studentQuestions;
}
