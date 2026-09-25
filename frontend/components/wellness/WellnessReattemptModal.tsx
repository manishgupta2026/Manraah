"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";

export default function WellnessReattemptModal() {
  const {
    isReattemptModalOpen,
    activeAssessmentCategory,
    allCategories,
    currentScore,
    closeReattemptModal,
    confirmReattempt,
  } = useWellnessScore();

  if (!isReattemptModalOpen) return null;

  const activeCategoryInfo =
    allCategories.find((c) => c.id === activeAssessmentCategory) || {
      id: activeAssessmentCategory,
      name:
        activeAssessmentCategory === "working-professional"
          ? "Working Professional"
          : activeAssessmentCategory.charAt(0).toUpperCase() + activeAssessmentCategory.slice(1),
      score: currentScore,
    };

  const scoreDisplay =
    typeof activeCategoryInfo.score === "number"
      ? `${activeCategoryInfo.score}%`
      : typeof currentScore === "number"
      ? `${currentScore}%`
      : "--";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center font-bold text-sm">
              ✦
            </div>
            <div>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Re-attempt Wellness Check
              </h3>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium">
                {activeCategoryInfo.name} Category
              </p>
            </div>
          </div>
          <button
            onClick={closeReattemptModal}
            className="w-7 h-7 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] flex items-center justify-center hover:bg-[#E2ECE6] dark:hover:bg-[#1A483C] transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Body Message */}
        <div className="space-y-2 py-1 text-center">
          <div className="w-16 h-16 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-xl font-heading font-black mx-auto shadow-xs">
            {scoreDisplay}
          </div>
          <h4 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
            Your current wellness score is {scoreDisplay}.
          </h4>
          <p className="text-xs text-[#5A756C] dark:text-[#A9C5BC] font-medium leading-relaxed max-w-xs mx-auto">
            Would you like to complete the 5-question assessment again to update your {activeCategoryInfo.name} wellness score?
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2ECE6] dark:border-[#23483E]">
          <button
            type="button"
            onClick={closeReattemptModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmReattempt}
            className="px-5 py-2.5 rounded-xl bg-[#006C56] hover:bg-[#005241] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            Re-attempt Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
}
