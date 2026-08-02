"use client";

import React from "react";
import Link from "next/link";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";

export default function WellnessScoreScreen() {
  const { categoryDetails } = useCategory();
  const { computedScore, answers } = useAssessment();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Baseline Calibration Complete
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
          Your Sanctuary Serenity Score
        </h1>
        <p className="text-sm text-on-surface-variant max-w-lg mx-auto">
          Calculated for <strong className="text-primary">{categoryDetails.name}</strong> wellness based on your stress, sleep, and environmental support levels.
        </p>
      </div>

      {/* Score Gauge Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-ambient text-center space-y-8">
        {/* Animated Circular Gauge */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#F2EBFF"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#7C6BC4"
              strokeWidth="8"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * computedScore) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-heading font-bold text-primary">{computedScore}</span>
            <span className="text-[11px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">/ 100 Baseline</span>
          </div>
        </div>

        {/* Dynamic Feedback Card */}
        <div className="p-6 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-left space-y-3 max-w-xl mx-auto">
          <div className="flex items-center gap-2 text-secondary font-heading font-bold text-base">
            <span className="material-symbols-outlined text-xl">spa</span>
            <span>Recommended Sanctuary Focus</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Your scores indicate a strong baseline with opportunities to reduce daily stress peaks. We have curated 
            <strong className="text-primary font-semibold"> 10-minute restorative breathing tracks</strong> and 
            <strong className="text-primary font-semibold"> AI Companion guidance</strong> tailored for {categoryDetails.name} balance.
          </p>
        </div>

        {/* Breakdown Pills */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs">
          <div className="p-3 rounded-xl bg-surface-container-low text-center">
            <p className="text-on-surface-variant/70">Stress Rating</p>
            <p className="font-bold text-primary">{answers.stressFrequency}/5</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low text-center">
            <p className="text-on-surface-variant/70">Sleep Quality</p>
            <p className="font-bold text-secondary">{answers.sleepQuality}/5</p>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-low text-center">
            <p className="text-on-surface-variant/70">Support Level</p>
            <p className="font-bold text-tertiary">{answers.supportLevel}/5</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/signup"
          className="w-full sm:w-auto px-10 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-purple transition-all scale-105 text-center"
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
