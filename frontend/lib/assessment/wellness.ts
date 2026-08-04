import { WellnessResult, AssessmentAnswer } from "./types";
import { calculateTotalScore, calculatePercentage } from "./scoring";

export type WellnessLevel = "Flourishing" | "Stable" | "Needs Attention" | "High Risk" | "Critical";

export function getWellnessLevel(score: number): WellnessLevel {
  if (score >= 21) return "Flourishing";
  if (score >= 16) return "Stable";
  if (score >= 11) return "Needs Attention";
  if (score >= 6) return "High Risk";
  return "Critical";
}

export function getWellnessMessage(level: WellnessLevel): string {
  switch (level) {
    case "Flourishing":
      return "You are experiencing a high level of mental well-being and resilience. Keep doing what you are doing!";
    case "Stable":
      return "Your mind is in a balanced state. You have a solid baseline to handle life's challenges.";
    case "Needs Attention":
      return "You are experiencing some stress or imbalance. It might be a good time to introduce small self-care habits.";
    case "High Risk":
      return "You are facing significant stress and fatigue. Prioritizing rest and talking to a professional can help.";
    case "Critical":
      return "You are feeling extremely overwhelmed. Please consider reaching out to a therapist or trusted support network immediately.";
    default:
      return "We are here to support your journey.";
  }
}

export function evaluateWellness(answers: AssessmentAnswer[]): WellnessResult {
  const totalScore = calculateTotalScore(answers);
  const maxScore = 25;
  const percentage = calculatePercentage(totalScore, maxScore);
  const wellnessLevel = getWellnessLevel(totalScore);
  const message = getWellnessMessage(wellnessLevel);

  return {
    totalScore,
    maxScore,
    percentage,
    wellnessLevel,
    message,
  };
}
