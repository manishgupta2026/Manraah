export interface AssessmentOption {
  id: string;
  text: string;
  score: number;
}

export interface AssessmentQuestion {
  id: number;
  key: string;
  text: string;
  description: string;
  options: AssessmentOption[];
}

export interface AssessmentAnswer {
  questionId: number;
  questionKey: string;
  selectedOptionId: string;
  selectedText: string;
  score: number;
}

export interface WellnessResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  wellnessLevel: "Flourishing" | "Stable" | "Needs Attention" | "High Risk" | "Critical";
  message: string;
}
