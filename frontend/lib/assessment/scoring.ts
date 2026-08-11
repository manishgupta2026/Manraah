import { AssessmentAnswer } from "./types";
import { getWellnessLevel, getWellnessMessage, WellnessLevel } from "./wellness";

export function calculateTotalScore(answers: AssessmentAnswer[]): number {
  return answers.reduce((sum, ans) => sum + ans.score, 0);
}

export function calculatePercentage(totalScore: number, maxScore: number = 50): number {
  if (maxScore <= 0) return 0;
  return Math.round((totalScore / maxScore) * 100);
}

export function calculateSanctuaryScore(answers: AssessmentAnswer[], maxScore: number = 50): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  wellnessLevel: WellnessLevel;
  message: string;
} {
  const totalScore = calculateTotalScore(answers);
  const percentage = calculatePercentage(totalScore, maxScore);
  const wellnessLevel = getWellnessLevel(totalScore, maxScore);
  const message = getWellnessMessage(wellnessLevel);

  return {
    totalScore,
    maxScore,
    percentage,
    wellnessLevel,
    message,
  };
}
