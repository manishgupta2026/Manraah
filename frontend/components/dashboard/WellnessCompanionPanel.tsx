"use client";

import React, { useState } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

interface WellnessCompanionPanelProps {
  onCheckCondition?: () => void;
}

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  neutral: "😐",
  anxious: "😟",
  sad: "😔",
  stressed: "😤",
  tired: "😴",
  motivated: "💪",
  good: "😊",
  energetic: "⚡",
  focused: "🎯",
  relaxed: "🌿",
  serene: "✨",
};

export default function WellnessCompanionPanel({ onCheckCondition }: WellnessCompanionPanelProps) {
  const { hasCheckedInToday, todayMood, isCheckingIn, openCheckInModal } = useWellness();
  const { user, isAuthenticated } = useAuth();
  const {
    currentCategory,
    currentScore,
    isCurrentAssessed,
    openAssessment,
    openReattemptModal,
  } = useWellnessScore();

  const [checkInError, setCheckInError] = useState<string | null>(null);

  const isUserAuthenticated = Boolean(isAuthenticated && user?.id);
  const isCheckedIn = isUserAuthenticated && Boolean(hasCheckedInToday && todayMood);

  const handleCheckInClick = () => {
    if (isCheckedIn) return;
    openCheckInModal();
  };

  // Determine today's mood label & emoji (Only when authenticated & checked in)
  const rawMood = isCheckedIn ? (todayMood?.mood || user?.currentMood || "").trim() : "";
  const moodKey = rawMood.toLowerCase();
  const moodEmoji = MOOD_EMOJIS[moodKey] || "🌿";
  const moodLabel = rawMood ? rawMood.charAt(0).toUpperCase() + rawMood.slice(1) : "";

  // Formatted completed time
  let completedTimeStr = "";
  if (isCheckedIn && (todayMood?.updatedAt || todayMood?.createdAt)) {
    try {
      const dt = new Date(todayMood.updatedAt || todayMood.createdAt);
      if (!isNaN(dt.getTime())) {
        completedTimeStr = `Completed today • ${dt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      }
    } catch {
      completedTimeStr = "Completed today";
    }
  } else if (isCheckedIn) {
    completedTimeStr = "Completed today";
  }

  return (
    <aside className="w-full flex flex-col gap-4 select-none pointer-events-auto shrink-0">
      {/* 1. Check Your Condition Card */}
      <div className="bg-[#EAF5EF] dark:bg-[#0B3029] rounded-3xl p-4 sm:p-5 border border-[#D2E8DC] dark:border-[rgba(150,210,195,0.12)] text-center flex flex-col justify-between min-h-[330px] sm:min-h-[355px] shadow-2xs transition-colors">
        {/* Top: Avatar & Heading Group */}
        <div className="flex flex-col items-center space-y-2 w-full">
          {/* Circular Avatar */}
          <div className="relative">
            <UserAvatar
              user={isUserAuthenticated ? user : null}
              sizeClass="w-14 h-14 sm:w-15 sm:h-15 text-xl"
              className="border-2 border-white dark:border-[#082821] shadow-xs"
            />
            {isCheckedIn && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#006C56] dark:bg-[#00A889] text-white flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-[#082821] shadow-xs">
                ✓
              </div>
            )}
          </div>

          {/* Title & Hierarchy */}
          <div className="space-y-0.5">
            <span className="text-[9.5px] sm:text-[10px] font-extrabold tracking-widest uppercase text-[#006C56] dark:text-[#00A889]">
              YOUR WELLNESS COMPANION
            </span>
            <h2 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              {isCheckedIn ? "Today's Check-In Complete" : "Check Your Condition"}
            </h2>
            {isCheckedIn && (
              <div className="pt-0.5 space-y-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D8EFE3] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#73D8C4] text-[10px] font-bold">
                  Mood: {moodEmoji} {moodLabel}
                </span>
                <p className="text-[9.5px] text-[#6B857C] dark:text-[#9DB9B0] font-medium leading-tight">
                  {completedTimeStr}
                </p>
              </div>
            )}
          </div>

          {checkInError && (
            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 leading-tight">
              {checkInError}
            </p>
          )}
        </div>

        {/* Middle: 3 Condition Action Items */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full my-2.5">
          <div className="flex flex-col items-center text-center p-1.5 sm:p-2 rounded-2xl bg-[#DDF0E6] dark:bg-[#0E3931] border border-[#CDE5D8] dark:border-[rgba(150,210,195,0.12)]">
            <span className="text-base mb-0.5">😊</span>
            <span className="text-[9.5px] font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Mood Check
            </span>
            <span className="text-[8px] text-[#5A756C] dark:text-[#9DB9B0] leading-tight mt-0.5">
              Track feelings
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-1.5 sm:p-2 rounded-2xl bg-[#DDF0E6] dark:bg-[#0E3931] border border-[#CDE5D8] dark:border-[rgba(150,210,195,0.12)]">
            <span className="text-base mb-0.5">📊</span>
            <span className="text-[9.5px] font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Stress Level
            </span>
            <span className="text-[8px] text-[#5A756C] dark:text-[#9DB9B0] leading-tight mt-0.5">
              Track stress
            </span>
          </div>

          <div className="flex flex-col items-center text-center p-1.5 sm:p-2 rounded-2xl bg-[#DDF0E6] dark:bg-[#0E3931] border border-[#CDE5D8] dark:border-[rgba(150,210,195,0.12)]">
            <span className="text-base mb-0.5">💚</span>
            <span className="text-[9.5px] font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Guided Support
            </span>
            <span className="text-[8px] text-[#5A756C] dark:text-[#9DB9B0] leading-tight mt-0.5">
              Custom tips
            </span>
          </div>
        </div>

        {/* Bottom: Action Button */}
        <div className="w-full">
          {isCheckedIn ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#D8EFE3] dark:bg-[#0E3931] text-[#006C56] dark:text-[#73D8C4] text-xs font-bold border border-[#BCE4D3] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex items-center justify-center gap-2 cursor-default select-none"
            >
              <span className="w-4 h-4 rounded-full bg-[#006C56] dark:bg-[#00A889] text-white flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
              <span>CHECKED IN TODAY</span>
            </button>
          ) : (
            <button
              onClick={handleCheckInClick}
              disabled={isCheckingIn}
              type="button"
              className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white text-xs font-bold shadow-sm shadow-[#004D3D]/20 dark:shadow-[#008F78]/25 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
            >
              <span className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center text-[8.5px]">
                ✦
              </span>
              <span>CHECK IT NOW</span>
              <span className="transition-transform group-hover:translate-x-1 text-xs">→</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Your Wellness Score Card */}
      <div className="bg-white dark:bg-[#0B3029] rounded-3xl p-4 sm:p-5 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex flex-col justify-between min-h-[320px] sm:min-h-[345px] transition-colors">
        {/* Top: Compact Header */}
        <div className="flex items-center gap-2.5">
          <div className="w-7.5 h-7.5 rounded-2xl bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight truncate">
              Your Wellness Score
            </h3>
            <p className="text-[9.5px] text-[#789389] dark:text-[#9DB9B0] font-medium leading-tight mt-0.5 truncate">
              Based on your latest check
            </p>
          </div>
        </div>

        {/* Center: Main Score as the Primary Visual Focus */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-2 space-y-1.5">
          {/* Main Score Number */}
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-4xl sm:text-[42px] font-heading font-black text-[#19332A] dark:text-[#E8F8F3] tracking-tight leading-none">
              {isCurrentAssessed && currentScore !== null ? currentScore : "--"}
            </span>
            <span className="text-sm sm:text-base font-bold text-[#789389] dark:text-[#9DB9B0]">
              /100
            </span>
          </div>

          {/* Status Label & Short Meaning Explanation */}
          <div className="space-y-0.5 pt-0.5">
            <h4 className="text-xs sm:text-sm font-black text-[#006C56] dark:text-[#00A889] leading-tight">
              {isCurrentAssessed && currentScore !== null ? "Overall Wellness Score" : "Not Assessed Yet"}
            </h4>
            <p className="text-[11px] text-[#6B857C] dark:text-[#9DB9B0] font-medium leading-relaxed max-w-[240px]">
              {isCurrentAssessed && currentScore !== null
                ? "Your overall wellness score based on your latest assessment."
                : "Complete a wellness check to see your score."}
            </p>
          </div>
        </div>

        {/* Bottom: Action Button */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => {
              if (isCurrentAssessed && currentScore !== null) {
                openReattemptModal(currentCategory);
              } else {
                openAssessment(currentCategory);
              }
            }}
            className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#EAF6F0] hover:bg-[#D9EFE4] dark:bg-[#0E3931] dark:hover:bg-[#12463C] text-[#006C56] dark:text-[#73D8C4] text-xs font-bold transition-all border border-[#CCE7DA] dark:border-[rgba(150,210,195,0.15)] shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer select-none group"
          >
            <span>{isCurrentAssessed && currentScore !== null ? "Re-attempt Check" : "Start Wellness Check"}</span>
            <span className="transition-transform group-hover:translate-x-1 text-xs">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
