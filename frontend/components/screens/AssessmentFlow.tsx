"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";

export default function AssessmentFlow() {
  const router = useRouter();
  const { categoryDetails } = useCategory();
  const { answers, setAnswers } = useAssessment();
  const [step, setStep] = useState<number>(1);

  const questions = [
    { id: 1, key: "stressFrequency" as const, text: "How often have you felt overwhelmed or anxious over the past 2 weeks?" },
    { id: 2, key: "sleepQuality" as const, text: "How would you rate your average sleep quality recently?" },
    { id: 3, key: "supportLevel" as const, text: "How supported do you feel by your daily routine and environment?" },
  ];

  const handleSelectScore = (key: keyof typeof answers, val: number) => {
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handleComplete = () => {
    if (step === 1) {
      setStep(2);
    } else {
      router.push("/wellness-score");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-4 py-1 rounded-full bg-mint/20 text-secondary text-xs font-semibold uppercase tracking-wider">
          Tailored for {categoryDetails.name}
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">
          {step === 1 ? "Personalized Assessment" : "Confirming Assessment Intention"}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
          {step === 1
            ? "Help us calibrate your baseline stress score and AI companion tone."
            : "Synthesizing your responses into your custom Serenity Index Score."}
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
              <h3 className="font-heading font-semibold text-lg text-on-surface">{q.text}</h3>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleSelectScore(q.key, val)}
                    className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                      answers[q.key] === val
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-on-surface-variant/60 px-1">
                <span>Low / Rarely</span>
                <span>High / Frequently</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 text-center space-y-6 shadow-soft">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-container/20 text-primary flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-4xl">auto_awesome</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-on-surface">Ready to Calculate Your Serenity Score!</h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Click below to view your personalized baseline wellness score and recommendations.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium hover:bg-surface-container-high"
          >
            Review Answers
          </button>
        )}
        <button
          onClick={handleComplete}
          className="ml-auto px-8 py-3.5 rounded-full bg-primary text-white font-semibold shadow-md hover:bg-primary-purple transition-all"
        >
          {step === 1 ? "Review Summary →" : "View Serenity Score →"}
        </button>
      </div>
    </div>
  );
}
