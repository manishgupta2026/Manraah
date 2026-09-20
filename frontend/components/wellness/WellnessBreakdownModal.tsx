"use client";

import React from "react";
import { motion } from "framer-motion";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";

export default function WellnessBreakdownModal() {
  const {
    isBreakdownModalOpen,
    currentCategory,
    currentCategoryName,
    currentScore,
    isCurrentAssessed,
    levelBadge,
    levelDescription,
    allCategories,
    closeBreakdownModal,
    openAssessment,
  } = useWellnessScore();

  if (!isBreakdownModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
              YOUR WELLNESS
            </span>
            <h2 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              {currentCategoryName}
            </h2>
          </div>
          <button
            onClick={closeBreakdownModal}
            className="w-8 h-8 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] flex items-center justify-center hover:bg-[#E2ECE6] dark:hover:bg-[#1A483C] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {/* Active Category Card */}
          <div className="p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              {/* Ring or Badge */}
              <div className="w-16 h-16 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center font-heading font-black text-2xl shadow-xs shrink-0">
                {isCurrentAssessed && currentScore !== null ? `${currentScore}%` : "--"}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-heading font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    Current Wellness Score
                  </h3>
                  {isCurrentAssessed && (
                    <span className="px-2 py-0.5 rounded-full bg-[#008968]/10 text-[#008968] dark:text-[#00A982] text-[9.5px] font-bold">
                      {levelBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] leading-relaxed">
                  {isCurrentAssessed
                    ? `Based on your latest 5-question ${currentCategoryName} wellness check.`
                    : `Your wellness score for ${currentCategoryName} hasn't been calculated yet.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                closeBreakdownModal();
                openAssessment(currentCategory);
              }}
              className="px-4 py-2 rounded-xl bg-[#006C56] hover:bg-[#005241] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs w-full sm:w-auto text-center"
            >
              {isCurrentAssessed ? "Retake Check-In" : "Start Wellness Check"}
            </button>
          </div>

          {/* All 5 Life-Stage Paths Switcher / Overview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
                Your Life-Stage Paths
              </h4>
              <span className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium">
                Independent scores preserved per category
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {allCategories.map((cat) => {
                const isCurrent = cat.id === currentCategory;
                const hasScore = typeof cat.score === "number";

                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-[#EAF6F0]/60 dark:bg-[#14382F]/70 border-[#008968]/60 dark:border-[#00A982]/60"
                        : "bg-[#F8FCFA] dark:bg-[#0E2A23] border-[#E2ECE6] dark:border-[#23483E]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-center text-base shrink-0">
                        {cat.icon === "school"
                          ? "🎓"
                          : cat.icon === "family_restroom"
                          ? "👨‍👩‍👧"
                          : cat.icon === "favorite"
                          ? "💑"
                          : cat.icon === "work"
                          ? "💼"
                          : "🌱"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                            {cat.name}
                          </h5>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#006C56] text-white text-[8.5px] font-extrabold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#789389] dark:text-[#78958C]">
                          {hasScore ? `Completed • Score: ${cat.score}%` : "Not assessed yet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-black font-heading ${hasScore ? "text-[#008968] dark:text-[#00A982]" : "text-[#A9C5BC]"}`}>
                        {hasScore ? `${cat.score}%` : "--"}
                      </span>
                      <button
                        onClick={() => {
                          closeBreakdownModal();
                          openAssessment(cat.id);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold text-[#006C56] dark:text-[#00A982] hover:bg-[#EAF6F0] dark:hover:bg-[#14382F] transition-colors cursor-pointer"
                      >
                        {hasScore ? "Retake →" : "Assess →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E2ECE6] dark:border-[#23483E] text-right">
          <button
            onClick={closeBreakdownModal}
            className="px-4 py-2 rounded-xl bg-[#F4FAF7] dark:bg-[#14382F] text-[#19332A] dark:text-[#F4FAF7] text-xs font-bold hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
