"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AssessmentAnswers } from "@/backend/types";
import { AssessmentAnswer, WellnessResult } from "@/frontend/lib/assessment/types";

interface AssessmentContextType {
  // Compatibility properties
  answers: AssessmentAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswers>>;
  computedScore: number;
  calculateSerenityScore: (answers: AssessmentAnswers) => number;

  // New assessment properties
  detailedAnswers: AssessmentAnswer[];
  setDetailedAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswer[]>>;
  assessmentResult: WellnessResult | null;
  setAssessmentResult: React.Dispatch<React.SetStateAction<WellnessResult | null>>;
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

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    stressFrequency: 3,
    sleepQuality: 4,
    supportLevel: 3,
  });

  const [detailedAnswers, setDetailedAnswers] = useState<AssessmentAnswer[]>([]);
  const [assessmentResult, setAssessmentResult] = useState<WellnessResult | null>(null);

  // Sync detailed answers to legacy answers for backward compatibility
  useEffect(() => {
    if (detailedAnswers.length > 0) {
      setAnswers(mapToLegacyAnswers(detailedAnswers));
    }
  }, [detailedAnswers]);

  const computedScore = calculateSerenityScore(answers);

  const value = {
    answers,
    setAnswers,
    computedScore,
    calculateSerenityScore,
    detailedAnswers,
    setDetailedAnswers,
    assessmentResult,
    setAssessmentResult,
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
