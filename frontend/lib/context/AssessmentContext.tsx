"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AssessmentAnswers } from "@/backend/types";

interface AssessmentContextType {
  answers: AssessmentAnswers;
  setAnswers: React.Dispatch<React.SetStateAction<AssessmentAnswers>>;
  computedScore: number;
  calculateSerenityScore: (answers: AssessmentAnswers) => number;
}

/**
 * Single source of truth formula for computing Serenity Score (0-100 scale).
 * - Stress Frequency (1-5): lower stress = higher serenity score
 * - Sleep Quality (1-5): higher quality = higher serenity score
 * - Support Level (1-5): higher support = higher serenity score
 */
export function calculateSerenityScore(answers: AssessmentAnswers): number {
  const stressPoints = (6 - answers.stressFrequency) * 7; // max 35
  const sleepPoints = answers.sleepQuality * 7;           // max 35
  const supportPoints = answers.supportLevel * 6;         // max 30
  
  const score = stressPoints + sleepPoints + supportPoints;
  return Math.min(100, Math.max(20, score));
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<AssessmentAnswers>({
    stressFrequency: 3,
    sleepQuality: 4,
    supportLevel: 3,
  });

  const computedScore = calculateSerenityScore(answers);

  const value = {
    answers,
    setAnswers,
    computedScore,
    calculateSerenityScore,
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
