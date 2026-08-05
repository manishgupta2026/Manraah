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
  type: "common" | "category";
  category?: string;
  options: AssessmentOption[];
}

export interface AssessmentAnswer {
  questionId: number;
  questionKey: string;
  questionType: "common" | "category";
  category: string;
  selectedOptionId: string;
  selectedText: string;
  score: number;
  answeredAt: string;
}

export interface WellnessResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  wellnessLevel: "Flourishing" | "Stable" | "Needs Attention" | "High Risk" | "Critical";
  message: string;
}
