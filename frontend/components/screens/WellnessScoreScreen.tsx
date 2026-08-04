"use client";

import React from "react";
import Link from "next/link";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { getWellnessLevel, getWellnessMessage } from "@/frontend/lib/assessment/wellness";

export default function WellnessScoreScreen() {
  const { categoryDetails } = useCategory();
  const { assessmentResult, detailedAnswers, computedScore } = useAssessment();

  // Handle fallback if the user navigated directly or refreshed
  const finalResult = assessmentResult || {
    totalScore: Math.round((computedScore / 100) * 25) || 15,
    maxScore: 25,
    percentage: computedScore || 60,
    wellnessLevel: getWellnessLevel(Math.round((computedScore / 100) * 25) || 15),
    message: getWellnessMessage(getWellnessLevel(Math.round((computedScore / 100) * 25) || 15)),
  };

  // Human-readable labels for the question keys
  const dimensionLabels: Record<string, string> = {
    emotional_balance: "Emotional Balance",
    stress_level: "Stress Resilience",
    sleep_quality: "Sleep Quality",
    motivation_energy: "Motivation & Energy",
    confidence_coping: "Coping Confidence",
  };

  // Stylings based on wellness level
  const levelStyles: Record<
    string,
    { badge: string; text: string; bg: string; stroke: string }
  > = {
    Flourishing: {
      badge: "bg-mint/15 text-[#006B56] border-mint/40",
      text: "text-[#006B56]",
      bg: "bg-[#e8faf5]",
      stroke: "#5FCFB0",
    },
    Stable: {
      badge: "bg-primary/10 text-primary border-primary/20",
      text: "text-primary",
      bg: "bg-primary/5",
      stroke: "#7C6BC4",
    },
    "Needs Attention": {
      badge: "bg-[#fff9e6] text-[#b38600] border-[#ffe080]",
      text: "text-[#b38600]",
      bg: "bg-[#fffbf0]",
      stroke: "#F5C99B",
    },
    "High Risk": {
      badge: "bg-pink/15 text-tertiary border-pink/30",
      text: "text-tertiary",
      bg: "bg-pink/5",
      stroke: "#F4A6B8",
    },
    Critical: {
      badge: "bg-error/10 text-error border-error/20",
      text: "text-error",
      bg: "bg-error/5",
      stroke: "#ba1a1a",
    },
  };

  const currentStyles = levelStyles[finalResult.wellnessLevel] || levelStyles.Stable;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-fadeIn relative">
      {/* Calming Backdrop Glows */}
      <div className="fixed inset-0 z-[-2] opacity-35 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-primary-container blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-secondary-container blur-[120px] opacity-30" />
      </div>

      {/* Top Header */}
      <div className="text-center space-y-3 z-10 relative">
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Baseline Calibration Complete
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
          Your Sanctuary Wellness Score
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant max-w-lg mx-auto font-light">
          Calculated for <strong className="text-primary font-semibold">{categoryDetails.name}</strong> wellness based on your emotional, sleep, and coping resilience levels.
        </p>
      </div>

      {/* Score Gauge Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-ambient text-center space-y-8 z-10 relative">
        
        {/* Animated Circular Gauge */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#F2EBFF"
              strokeWidth="7.5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={currentStyles.stroke}
              strokeWidth="7.5"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * finalResult.percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center space-y-0.5">
            <span className="text-4xl font-heading font-bold text-on-surface">
              {finalResult.totalScore}
            </span>
            <span className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-wider">
              / {finalResult.maxScore} Score
            </span>
            <span className="text-[11px] text-primary font-semibold">
              {finalResult.percentage}%
            </span>
          </div>
        </div>

        {/* Wellness Level Badge */}
        <div className="flex justify-center">
          <span className={`px-5 py-2 rounded-full border text-sm font-bold tracking-wide uppercase ${currentStyles.badge}`}>
            Level: {finalResult.wellnessLevel}
          </span>
        </div>

        {/* Dynamic Feedback Card */}
        <div className={`p-6 rounded-2xl border text-left space-y-3 max-w-xl mx-auto ${currentStyles.bg} border-surface-variant/30`}>
          <div className="flex items-center gap-2 font-heading font-bold text-base text-on-surface">
            <span className="material-symbols-outlined text-xl text-primary">spa</span>
            <span>Recommended Sanctuary Focus</span>
          </div>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed font-light">
            {finalResult.message} We have calibrated your companion tone and custom breathing practices to guide you back to balance.
          </p>
        </div>

        {/* Detailed Breakdown Section */}
        <div className="max-w-xl mx-auto space-y-4 pt-4 border-t border-surface-variant/20">
          <h3 className="text-sm font-heading font-bold text-on-surface text-left uppercase tracking-wider opacity-85">
            Dimension Breakdown
          </h3>
          
          <div className="space-y-3.5">
            {detailedAnswers.length > 0 ? (
              detailedAnswers.map((ans) => {
                const label = dimensionLabels[ans.questionKey] || ans.questionKey;
                return (
                  <div key={ans.questionId} className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                      <span>{label}</span>
                      <span className="text-primary">{ans.score} / 5</span>
                    </div>
                    {/* Micro bar indicator */}
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(ans.score / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-on-surface-variant/60 font-light italic">
                      Selected: "{ans.selectedText}"
                    </p>
                  </div>
                );
              })
            ) : (
              // Fallback default breakdown list
              Object.entries(dimensionLabels).map(([key, label], i) => {
                const score = key === "stress_level" ? 3 : key === "sleep_quality" ? 4 : 3;
                return (
                  <div key={key} className="space-y-1.5 text-left">
                    <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
                      <span>{label}</span>
                      <span className="text-primary">{score} / 5</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 z-10 relative">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-purple transition-all scale-105 text-center hover:-translate-y-0.5 active:scale-95"
        >
          Create Account & Save Score →
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-surface-container-low text-on-surface font-semibold text-sm hover:bg-surface-container transition-all text-center"
        >
          I already have an account
        </Link>
      </div>
    </div>
  );
}
