"use client";

import React from "react";
import { motion } from "framer-motion";

interface SanctuaryScoreCardProps {
  score?: number;
  level?: string;
  delta?: number;
  history?: any[];
  onOpenCalculator?: () => void;
}

export default function SanctuaryScoreCard({
  score = 76,
  level = "STABLE",
  delta = 0,
  history = [],
  onOpenCalculator,
}: SanctuaryScoreCardProps) {
  const displayScore = typeof score === "number" && !isNaN(score) ? score : 76;
  const displayLevel = level || "STABLE";

  const getStatusInsight = (lvl: string) => {
    switch (lvl?.toUpperCase()) {
      case "THRIVING":
        return "Steady and restorative.";
      case "STABLE":
        return "Steadier than last week.";
      case "ATTENTIVE":
        return "Busy rhythm. Remember to pause.";
      case "NEEDS CARE":
        return "Carrying a lot. Take small resets.";
      default:
        return "Steadier than last week.";
    }
  };

  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

  // Map real historical checkin days
  const hasHistory = history && history.length >= 2;

  return (
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[300px] space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
            Sanctuary Score
          </h3>
          <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
            {getStatusInsight(displayLevel)}
          </p>
        </div>

        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            className="text-[10px] font-heading font-bold text-[#6351A5] bg-[#F6F0FD] dark:bg-purple-900/30 px-2.5 py-1 rounded-full border border-purple-100/80 hover:bg-purple-100 transition-colors cursor-pointer"
          >
            Calculate →
          </button>
        )}
      </div>

      {/* Center Circular Progress Ring & Score */}
      <div className="flex items-center justify-center py-1">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="38"
              className="stroke-purple-100/70 dark:stroke-white/10"
              strokeWidth="6.5"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="38"
              className="stroke-[#6351A5] dark:stroke-purple-400"
              strokeWidth="6.5"
              strokeDasharray={238.76}
              initial={{ strokeDashoffset: 238.76 }}
              animate={{ strokeDashoffset: 238.76 - (238.76 * displayScore) / 100 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-heading font-black text-[#231E39] dark:text-white">
              {displayScore}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-heading font-extrabold text-[#746F89] dark:text-purple-200/70 tracking-wider">
                {displayLevel}
              </span>
              {delta !== 0 && (
                <span className={`text-[9px] font-bold ${delta > 0 ? "text-[#1F7A65]" : "text-amber-600"}`}>
                  {delta > 0 ? `↑ ${delta}` : `↓ ${Math.abs(delta)}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Dot Timeline Sparkline */}
      <div className="space-y-1.5 pt-1">
        {hasHistory ? (
          <>
            <div className="flex items-center justify-between text-[11px] font-heading font-bold text-[#746F89] dark:text-purple-200/60 px-1">
              {DAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="flex items-center justify-between px-1.5">
              {DAYS.map((_, i) => {
                const isFilled = i < Math.min(7, history.length);
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isFilled
                        ? "bg-[#6351A5] ring-2 ring-purple-100"
                        : "bg-purple-100/80 dark:bg-white/10"
                    }`}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-[11px] text-[#746F89] dark:text-purple-200/60 text-center">
            Complete a few more check-ins to see your weekly trend.
          </p>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-1">
        <button
          onClick={onOpenCalculator}
          className="w-full text-center text-xs text-[#6351A5] hover:text-[#7360B8] font-heading font-semibold transition-colors cursor-pointer"
        >
          View Wellness Breakdown →
        </button>
      </div>
    </div>
  );
}
