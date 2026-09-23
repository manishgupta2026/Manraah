"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellnessScore, CanonicalCategorySlug } from "@/frontend/lib/context/WellnessScoreContext";

const CATEGORY_META: Record<CanonicalCategorySlug, { name: string; emoji: string }> = {
  student: { name: "Student", emoji: "🎓" },
  parent: { name: "Parent", emoji: "🍼" },
  couple: { name: "Couple", emoji: "💖" },
  "working-professional": { name: "Working Professional", emoji: "💼" },
  other: { name: "General Wellness", emoji: "✨" },
};

export default function ProfileChangeAssessmentPrompt() {
  const {
    isProfilePromptOpen,
    profilePromptType,
    profilePromptCategory,
    dismissProfilePrompt,
    openAssessment,
  } = useWellnessScore();

  if (!isProfilePromptOpen) return null;

  const isReminder = profilePromptType === "reminder_1min";
  const meta = CATEGORY_META[profilePromptCategory] || { name: "Wellness Journey", emoji: "🌿" };

  const handleStartAssessment = () => {
    dismissProfilePrompt();
    openAssessment(profilePromptCategory);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center space-y-4.5"
      >
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-heading font-black tracking-wider uppercase bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E]">
          <span>{isReminder ? "⏰ REMINDER" : "✨ PROFILE UPDATED"}</span>
          <span>•</span>
          <span>{meta.name}</span>
        </div>

        {/* Center Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-3xl mx-auto shadow-xs border border-[#D2EAE0] dark:border-[#23483E]">
          {meta.emoji}
        </div>

        {/* Title & Copy */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug">
            {isReminder
              ? "Complete Assessment to Know Your Wellness Score"
              : "Start Assessment to Know Your Wellness Score"}
          </h2>
          <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium leading-relaxed max-w-sm mx-auto">
            {isReminder ? (
              <>
                You haven&apos;t completed your wellness assessment for{" "}
                <strong className="text-[#19332A] dark:text-[#F4FAF7] font-bold">
                  {meta.name}
                </strong>{" "}
                yet. Take just 1 minute to complete it and uncover your wellness score.
              </>
            ) : (
              <>
                You updated your profile to{" "}
                <strong className="text-[#19332A] dark:text-[#F4FAF7] font-bold">
                  {meta.name}
                </strong>
                ! Start your quick 5-question assessment to calculate your personalized wellness score.
              </>
            )}
          </p>
        </div>

        {/* Benefit Highlight Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-1 text-[11px] font-semibold text-[#006C56] dark:text-[#88F7D6]">
          <span className="px-2.5 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] border border-[#D2EAE0] dark:border-[#23483E]">
            ⏱ 5 Questions (~1 min)
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] border border-[#D2EAE0] dark:border-[#23483E]">
            🔒 100% Confidential
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleStartAssessment}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-heading font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isReminder ? "Complete Assessment" : "Start Assessment"}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>

          <button
            type="button"
            onClick={dismissProfilePrompt}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] text-[#4F685F] dark:text-[#A9C5BC] text-xs font-heading font-bold transition-colors cursor-pointer"
          >
            {isReminder ? "Dismiss" : "Maybe Later"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
