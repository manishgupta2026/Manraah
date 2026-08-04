import { AssessmentAnswer } from "./types";

export function calculateTotalScore(answers: AssessmentAnswer[]): number {
  return answers.reduce((sum, ans) => sum + ans.score, 0);
}

export function calculatePercentage(totalScore: number, maxScore: number = 25): number {
  if (maxScore <= 0) return 0;
  return Math.round((totalScore / maxScore) * 100);
}
