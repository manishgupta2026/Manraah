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
      {/* 1. Check Your Condition / Wellness Companion Card */}
      <div className="bg-[#E6F4F0] dark:bg-[#18181b] rounded-3xl p-4 sm:p-5 border border-[#CBECE2] dark:border-[#27272a] text-center flex flex-col justify-between min-h-[330px] sm:min-h-[355px] shadow-2xs transition-colors">
        {/* Top: Header Group */}
        <div className="flex items-center gap-2.5 text-left w-full">
          <div className="w-8 h-8 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-heading font-black text-[#004D3D] dark:text-white leading-tight truncate">
              Your Wellness Companion
            </h3>
            <p className="text-[9.5px] text-[#4F685F] dark:text-[#A1A1AA] font-medium leading-tight mt-0.5 truncate">
              {isCheckedIn ? "Today's check-in complete" : "Check your condition"}
            </p>
          </div>
        </div>

        {/* Center: Circular Condition Indicator as Primary Visual Focus */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-2.5 space-y-2">
          {/* Circular Score/Condition Ring */}
          <div className="relative w-[114px] h-[114px] sm:w-[124px] sm:h-[124px] flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background Circular Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="7.5"
                className="text-[#CBECE2] dark:text-zinc-700"
              />
              {/* Dynamic Progress Ring */}
              {isCheckedIn && (
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeDasharray={301.59}
                  strokeDashoffset={0}
                  className="text-[#006B56] dark:text-zinc-200 transition-all duration-1000 ease-out"
                />
              )}
            </svg>

            {/* Centered Graphic / Content: Mood Emoji or User Avatar */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              {isCheckedIn ? (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-[38px] leading-none filter drop-shadow-xs">
                    {moodEmoji}
                  </span>
                  <span className="text-[10.5px] sm:text-xs font-black text-[#004D3D] dark:text-white mt-1 leading-none">
                    {moodLabel}
                  </span>
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center">
                  <UserAvatar
                    user={isUserAuthenticated ? user : null}
                    sizeClass="w-13 h-13 sm:w-14 sm:h-14 text-xl"
                    className="border-2 border-white dark:border-[#27272a] shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#006B56] dark:bg-white text-white dark:text-black flex items-center justify-center text-[8.5px] font-bold">
                    ✦
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Label & Short Meaning */}
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-[#006B56] dark:text-zinc-200 leading-tight">
              {isCheckedIn ? "Mood Check Complete" : "Check Your Condition"}
            </h4>
            <p className="text-[10.5px] sm:text-[11px] text-[#4F685F] dark:text-[#A1A1AA] font-medium leading-relaxed max-w-[230px]">
              {isCheckedIn
                ? completedTimeStr
                : "Track your feelings & daily mental wellness."}
            </p>
          </div>
        </div>

        {/* Bottom: Action Button */}
        <div className="w-full">
          {isCheckedIn ? (
            <button
              type="button"
              onClick={openCheckInModal}
              className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#D0EDE4] hover:bg-[#C2E8DC] dark:bg-[#18181b] dark:hover:bg-[#27272a] text-[#006B56] dark:text-zinc-200 text-xs font-bold border border-[#CBECE2] dark:border-[#27272a] shadow-2xs transition-all flex items-center justify-center gap-2 group cursor-pointer select-none"
            >
              <span className="w-4 h-4 rounded-full bg-[#006B56] dark:bg-white dark:text-black text-white dark:text-black flex items-center justify-center text-[9px] font-black">
                ✓
              </span>
              <span>Checked In Today</span>
              <span className="text-[10px] opacity-75 font-normal">(Update)</span>
            </button>
          ) : (
            <button
              onClick={handleCheckInClick}
              disabled={isCheckingIn}
              type="button"
              className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black text-xs font-bold shadow-sm shadow-[#006B56]/20 transition-all border border-transparent flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed select-none"
            >
              <span className="w-4 h-4 rounded-full border border-white/60 dark:border-[#27272a]/60 flex items-center justify-center text-[8.5px]">
                ✦
              </span>
              <span>Check It Now</span>
              <span className="transition-transform group-hover:translate-x-1 text-xs">→</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Your Wellness Score Card */}
      <div className="bg-[#E6F4F0] dark:bg-[#18181b] rounded-3xl p-4 sm:p-5 border border-[#CBECE2] dark:border-[#27272a] text-center flex flex-col justify-between min-h-[330px] sm:min-h-[355px] shadow-2xs transition-colors">
        {/* Top: Header Group */}
        <div className="flex items-center gap-2.5 text-left w-full">
          <div className="w-8 h-8 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-heading font-black text-[#004D3D] dark:text-white leading-tight truncate">
              Your Wellness Score
            </h3>
            <p className="text-[9.5px] text-[#4F685F] dark:text-[#A1A1AA] font-medium leading-tight mt-0.5 truncate">
              Based on your latest check
            </p>
          </div>
        </div>

        {/* Center: Circular Score Progress Indicator as Primary Visual Focus */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-2.5 space-y-2">
          {/* Circular Score Ring */}
          <div className="relative w-[114px] h-[114px] sm:w-[124px] sm:h-[124px] flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background Circular Track */}
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="7.5"
                className="text-[#CBECE2] dark:text-zinc-700"
              />
              {/* Dynamic Progress Ring */}
              {isCurrentAssessed && currentScore !== null && (
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeDasharray={301.59}
                  strokeDashoffset={301.59 - (Math.min(Math.max(currentScore, 0), 100) / 100) * 301.59}
                  className="text-[#006B56] dark:text-zinc-200 transition-all duration-1000 ease-out"
                />
              )}
            </svg>

            {/* Centered Score Value */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-3xl sm:text-[35px] font-heading font-black text-[#004D3D] dark:text-white leading-none tracking-tight">
                {isCurrentAssessed && currentScore !== null ? currentScore : "--"}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#4F685F] dark:text-[#A1A1AA] mt-1 leading-none">
                /100
              </span>
            </div>
          </div>

          {/* Status Label & Short Meaning */}
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-[#006B56] dark:text-zinc-200 leading-tight">
              {isCurrentAssessed && currentScore !== null ? "Wellness Score" : "Not Assessed Yet"}
            </h4>
            <p className="text-[10.5px] sm:text-[11px] text-[#4F685F] dark:text-[#A1A1AA] font-medium leading-relaxed max-w-[230px]">
              {isCurrentAssessed && currentScore !== null
                ? "Based on your latest assessment."
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
            className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-[#006B56] hover:bg-[#005B48] dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black text-white text-xs font-bold shadow-sm shadow-[#006B56]/20 transition-all border border-transparent flex items-center justify-center gap-2 group cursor-pointer select-none"
          >
            <span>{isCurrentAssessed && currentScore !== null ? "Re-attempt Check" : "Start Wellness Check"}</span>
            <span className="transition-transform group-hover:translate-x-1 text-xs">→</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
