"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientSession } from "@/backend/auth/client";
import { useTheme } from "@/frontend/lib/context/ThemeContext";

import { useWellness } from "@/frontend/lib/context/WellnessContext";

interface WellnessCompanionPanelProps {
  onCheckCondition?: () => void;
}

export default function WellnessCompanionPanel({ onCheckCondition }: WellnessCompanionPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { hasCheckedInToday, performDailyCheckIn, isCheckingIn } = useWellness();

  const [userCategoryLabel, setUserCategoryLabel] = useState("parenting");
  const [checkInError, setCheckInError] = useState<string | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session?.user) {
      const cat = (session.user.selectedCategory || "student").toLowerCase();
      if (cat.includes("work") || cat.includes("young_pro")) {
        setUserCategoryLabel("career");
      } else if (cat.includes("parent")) {
        setUserCategoryLabel("parenting");
      } else if (cat.includes("couple")) {
        setUserCategoryLabel("relationship");
      } else if (cat.includes("other")) {
        setUserCategoryLabel("mindfulness");
      } else {
        setUserCategoryLabel("academic");
      }
    }
  }, []);

  const handleCheckInClick = async () => {
    if (isCheckingIn || hasCheckedInToday) return;
    setCheckInError(null);
    try {
      await performDailyCheckIn();
    } catch (err: any) {
      setCheckInError(err.message || "Failed to check in. Please try again.");
    }
  };

  return (
    <aside className="w-full flex flex-col gap-4.5 select-none pointer-events-auto shrink-0">
      {/* 1. Check Your Condition Card */}
      <div className="bg-[#EAF5EF] dark:bg-[#102F27] rounded-3xl p-6 border border-[#D2E8DC] dark:border-[#23483E] text-center flex flex-col items-center space-y-3 shadow-2xs transition-colors">
        {/* Circular Avatar / Profile Icon with check badge */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#D6ECE0] dark:bg-[#14382F] border-2 border-white dark:border-[#102F27] flex items-center justify-center text-slate-400 dark:text-[#78958C] shadow-inner">
            <svg className="w-9 h-9 text-slate-400 dark:text-[#78958C]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] flex items-center justify-center text-[9px] font-bold border-2 border-white dark:border-[#102F27] shadow-xs">
            ✓
          </div>
        </div>

        {/* Subtitle / Badge */}
        <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#006C56] dark:text-[#00A982]">
          YOUR WELLNESS COMPANION
        </span>

        {/* Main Heading */}
        <h2 className="text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
          {hasCheckedInToday ? "Today's Check-In Complete" : "Check Your Condition"}
        </h2>

        {/* Description */}
        <p className="text-[11px] text-[#4F685F] dark:text-[#A9C5BC] font-medium leading-relaxed max-w-[220px]">
          {hasCheckedInToday
            ? "Your wellness check-in is complete for today."
            : `Check your every situation, stress factors, and ${userCategoryLabel} activities.`}
        </p>

        {checkInError && (
          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 leading-tight">
            {checkInError}
          </p>
        )}

        {/* Dynamic Action Button */}
        {hasCheckedInToday ? (
          <button
            type="button"
            disabled
            className="w-full py-3 px-4 rounded-full bg-[#D8EFE3] dark:bg-[#154639] text-[#006C56] dark:text-[#88F7D6] text-[11px] font-bold border border-[#BCE4D3] dark:border-[#23483E] shadow-2xs flex items-center justify-center gap-2 cursor-default mt-1 select-none"
          >
            <span className="w-4 h-4 rounded-full bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] flex items-center justify-center text-[9px] font-black">
              ✓
            </span>
            <span>CHECKED IN</span>
          </button>
        ) : (
          <button
            onClick={handleCheckInClick}
            disabled={isCheckingIn}
            type="button"
            className="w-full py-3 px-4 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-[11px] font-bold shadow-md shadow-[#004D3D]/20 dark:shadow-[#00A982]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer mt-1 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isCheckingIn ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white dark:border-[#071C17]/40 dark:border-t-[#071C17] rounded-full animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <span className="w-4 h-4 rounded-full border border-white/60 dark:border-[#071C17]/60 flex items-center justify-center text-[8px]">
                  ✦
                </span>
                <span>CHECK IT NOW</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 2. Illustration Card (Calm mind with soft leaves) */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col items-center text-center space-y-3 transition-colors">
        <div className="w-full h-[136px] flex items-center justify-center relative overflow-hidden">
          {/* Calming SVG Vector Illustration */}
          <svg viewBox="0 0 200 160" className="w-[176px] h-[136px]">
            {/* Background Soft Leaves */}
            <path d="M40 80 Q20 50 40 20 Q60 50 40 80" fill={isDark ? "#14382F" : "#D5EFE3"} opacity="0.85" />
            <path d="M160 80 Q180 50 160 20 Q140 50 160 80" fill={isDark ? "#14382F" : "#D5EFE3"} opacity="0.85" />
            <path d="M30 120 Q10 90 30 60 Q50 90 30 120" fill={isDark ? "#00A982" : "#BCE4D3"} opacity={isDark ? "0.3" : "0.75"} />
            <path d="M170 120 Q190 90 170 60 Q150 90 170 120" fill={isDark ? "#00A982" : "#BCE4D3"} opacity={isDark ? "0.3" : "0.75"} />
            
            {/* Character Hair Back */}
            <path d="M65 80 Q100 30 135 80 Q145 130 135 150 L65 150 Q55 130 65 80 Z" fill={isDark ? "#0A221C" : "#2C3A35"} />
            
            {/* Character Body / Shoulders */}
            <path d="M55 160 Q100 125 145 160 Z" fill={isDark ? "#00A982" : "#3D7E6B"} />
            
            {/* Character Neck & Face */}
            <rect x="92" y="105" width="16" height="20" fill="#F8D3B8" rx="4" />
            <circle cx="100" cy="85" r="24" fill="#F8D3B8" />
            
            {/* Hair Front Framing */}
            <path d="M76 80 Q100 65 124 80 Q115 50 100 50 Q85 50 76 80 Z" fill={isDark ? "#0A221C" : "#2C3A35"} />
            
            {/* Calm Closed Eyes & Smile */}
            <path d="M88 84 Q93 88 98 84" fill="none" stroke="#2C3A35" strokeWidth="2" strokeLinecap="round" />
            <path d="M102 84 Q107 88 112 84" fill="none" stroke="#2C3A35" strokeWidth="2" strokeLinecap="round" />
            <path d="M96 95 Q100 99 104 95" fill="none" stroke="#2C3A35" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Hands on Heart */}
            <path d="M80 145 Q100 130 120 145 Q110 155 90 155 Z" fill="#F8D3B8" opacity="0.95" />
          </svg>
        </div>

        <p className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug max-w-[170px]">
          A healthier mind<br />leads to a brighter you.
        </p>
      </div>

      {/* 3. Confidentiality Card */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-4 px-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex items-center gap-3.5 transition-colors">
        <div className="w-9 h-9 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">100% Confidential</h3>
          <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
            No data ever leaves this device.
          </p>
        </div>
      </div>

      {/* 4. Quote Card */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-4 px-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex items-start gap-3 transition-colors">
        <span className="font-serif text-2xl font-black text-[#004D3D] dark:text-[#00A982] leading-none shrink-0 -mt-0.5">
          “
        </span>
        <div>
          <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] leading-snug">
            “Small steps every day lead to big changes.”
          </p>
          <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold mt-0.5">
            — Manraah
          </p>
        </div>
      </div>
    </aside>
  );
}
