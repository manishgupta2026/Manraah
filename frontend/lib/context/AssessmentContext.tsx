"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AssessmentAnswers, UserCategory } from "@/backend/types";
import { AssessmentAnswer, WellnessResult, AssessmentQuestion } from "@/frontend/lib/assessment/types";
import { assessmentEngine } from "@/frontend/lib/assessment/assessmentEngine";
import { getWellnessLevel } from "@/frontend/lib/assessment/wellness";

interface AssessmentContextType {
  // Compatibility properties
  answers: AssessmentAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswers>>;
  computedScore: number;
  calculateSerenityScore: (answers: AssessmentAnswers) => number;

  // Onboarding flow properties
  selectedCategory: UserCategory | null;
  setSelectedCategory: (category: UserCategory | null) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  detailedAnswers: AssessmentAnswer[];
  setDetailedAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswer[]>>;
  assessmentResult: WellnessResult | null;
  setAssessmentResult: React.Dispatch<React.SetStateAction<WellnessResult | null>>;
  assessmentCompleted: boolean;
  setAssessmentCompleted: (completed: boolean) => void;

  // Derived properties for current question
  currentQuestion: AssessmentQuestion | null;
  questionId: number | null;
  questionKey: string | null;
  selectedOption: string | null;
  selectedText: string | null;
  score: number | null;

  // Derived scoring and progress properties
  totalScore: number;
  maxScore: number;
  percentage: number;
  wellnessLevel: "Flourishing" | "Stable" | "Needs Attention" | "High Risk" | "Critical";
  progress: number; // Progress percentage (0 to 100)
}

export function calculateSerenityScore(answers: AssessmentAnswers): number {
  const stressPoints = (6 - answers.stressFrequency) * 7; // max 35
  const sleepPoints = answers.sleepQuality * 7;           // max 35
  const supportPoints = answers.supportLevel * 6;         // max 30
  
  const score = stressPoints + sleepPoints + supportPoints;
  return Math.min(100, Math.max(20, score));
}

function mapToLegacyAnswers(detailed: AssessmentAnswer[]): AssessmentAnswers {
  const stressAns = detailed.find((a) => a.questionKey === "stress_level");
  const sleepAns = detailed.find((a) => a.questionKey === "sleep_quality");
  const supportAns = detailed.find((a) => a.questionKey === "confidence_coping");

  return {
    stressFrequency: stressAns ? Math.min(5, Math.max(1, 6 - stressAns.score)) : 3,
    sleepQuality: sleepAns ? Math.min(5, Math.max(1, sleepAns.score)) : 4,
    supportLevel: supportAns ? Math.min(5, Math.max(1, supportAns.score)) : 3,
  };
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const STORAGE_KEY = "manraah_onboarding_assessment";

export function clearOnboardingAssessment() {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    stressFrequency: 3,
    sleepQuality: 4,
    supportLevel: 3,
  });

  const [selectedCategory, setSelectedCategoryState] = useState<UserCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [detailedAnswers, setDetailedAnswers] = useState<AssessmentAnswer[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<WellnessResult | null>(null);
  const [assessmentCompleted, setAssessmentCompleted] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.selectedCategory) setSelectedCategoryState(parsed.selectedCategory);
          if (typeof parsed.currentQuestionIndex === "number") setCurrentQuestionIndex(parsed.currentQuestionIndex);
          if (Array.isArray(parsed.detailedAnswers)) setDetailedAnswers(parsed.detailedAnswers);
          if (parsed.assessmentResult) setAssessmentResult(parsed.assessmentResult);
          if (typeof parsed.assessmentCompleted === "boolean") setAssessmentCompleted(parsed.assessmentCompleted);
        }
      } catch (e) {
        console.error("Failed to restore assessment from session storage:", e);
      } finally {
        setIsHydrated(true);
      }
    }
  }, []);

  // Save to sessionStorage on state changes once hydrated
  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    try {
      if (selectedCategory || detailedAnswers.length > 0) {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            selectedCategory,
            currentQuestionIndex,
            detailedAnswers,
            assessmentResult,
            assessmentCompleted,
          })
        );
      }
    } catch (e) {
      console.error("Failed to save assessment to session storage:", e);
    }
  }, [isHydrated, selectedCategory, currentQuestionIndex, detailedAnswers, assessmentResult, assessmentCompleted]);

  // Allow setting category
  const setSelectedCategory = (cat: UserCategory | null) => {
    setSelectedCategoryState(cat);
  };

  // Sync detailed answers to legacy answers for backward compatibility
  useEffect(() => {
    if (detailedAnswers.length > 0) {
      setAnswers(mapToLegacyAnswers(detailedAnswers));
    }
  }, [detailedAnswers]);

  const computedScore = calculateSerenityScore(answers);

  // Derived properties for current question
  const currentQuestion = assessmentEngine.getQuestionByIndex(selectedCategory, currentQuestionIndex) || null;
  const questionId = currentQuestion ? currentQuestion.id : null;
  const questionKey = currentQuestion ? currentQuestion.key : null;

  const currentAnswer = detailedAnswers.find((ans) => ans.questionId === questionId);
  const selectedOption = currentAnswer ? currentAnswer.selectedOptionId : null;
  const selectedText = currentAnswer ? currentAnswer.selectedText : null;
  const score = currentAnswer ? currentAnswer.score : null;

  // Derived scoring and progress properties
  const totalScore = detailedAnswers.reduce((sum, ans) => sum + ans.score, 0);
  const maxScore = 50; // 10 questions * 5 max points each
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const wellnessLevel = getWellnessLevel(totalScore, 50);
  const progress = Math.round(((currentQuestionIndex + 1) / 10) * 100);

  const value = {
    answers,
    setAnswers,
    computedScore,
    calculateSerenityScore,
    selectedCategory,
    setSelectedCategory,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    detailedAnswers,
    setDetailedAnswers,
    assessmentResult,
    setAssessmentResult,
    assessmentCompleted,
    setAssessmentCompleted,
    currentQuestion,
    questionId,
    questionKey,
    selectedOption,
    selectedText,
    score,
    totalScore,
    maxScore,
    percentage,
    wellnessLevel,
    progress,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}



