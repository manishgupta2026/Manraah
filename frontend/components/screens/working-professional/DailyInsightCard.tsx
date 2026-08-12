"use client";

import React from "react";

interface DailyInsightCardProps {
  customInsight?: string;
}

const WORKING_PRO_INSIGHTS = [
  "Rest isn't something you earn after being productive. It is where your clarity begins.",
  "Your mind deserves the same patience and care you give to your work.",
  "Closing your laptop at the end of the day is an act of self-respect.",
  "You are allowed to have unfinished tasks and still sleep in total peace.",
  "Boundaries aren't walls — they are the garden fences that protect your energy.",
  "Taking a pause during a frantic day is not falling behind; it is gathering strength.",
  "Your worth as a human is never measured by the number of unread emails you cleared.",
];

export default function DailyInsightCard({ customInsight }: DailyInsightCardProps) {
  // Rotate consistently by day of year so it stays stable throughout the day
  const getTodayInsight = () => {
    if (customInsight && customInsight.trim()) return customInsight;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    return WORKING_PRO_INSIGHTS[dayOfYear % WORKING_PRO_INSIGHTS.length];
  };

  return (
    <div className="rounded-[28px] bg-gradient-to-r from-[#FAF7FF] via-[#F5EFFE] to-[#FDF7FF] border border-purple-100/70 p-5 md:p-6 shadow-xs flex items-center gap-4 relative overflow-hidden">
      {/* Gentle left accent glow */}
      <div className="w-10 h-10 rounded-2xl bg-white text-[#5F4EA5] border border-purple-100/80 flex items-center justify-center text-xl shrink-0 shadow-xs">
        💡
      </div>

      <div className="space-y-0.5 flex-1 min-w-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F4EA5]">
          Daily Sanctuary Thought
        </span>
        <p className="text-xs sm:text-sm text-[#1D192B] font-medium leading-relaxed italic">
          "{getTodayInsight()}"
        </p>
      </div>
    </div>
  );
}
