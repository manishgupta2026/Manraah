"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";

export default function LoginWellnessPrompt() {
  const {
    isLoginPromptOpen,
    currentCategory,
    currentCategoryName,
    dismissLoginPrompt,
    openAssessment,
  } = useWellnessScore();

  if (!isLoginPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-[#121214] border border-[#E2ECE6] dark:border-[#27272a] rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center space-y-5"
      >
        {/* Top Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#EAF6F0] dark:bg-[#18181b] text-[#006C56] dark:text-zinc-200 border border-[#D2EAE0] dark:border-[#27272a] flex items-center justify-center text-2xl mx-auto shadow-xs">
          🌿
        </div>

        {/* Title & Copy */}
        <div className="space-y-2">
          <h2 className="text-xl font-heading font-black text-[#19332A] dark:text-white">
            A moment for yourself
          </h2>
          <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA] font-medium leading-relaxed max-w-xs mx-auto">
            Let&apos;s understand how you&apos;re doing as a{" "}
            <span className="font-bold text-[#008968] dark:text-zinc-200">
              {currentCategoryName}
            </span>
            . It&apos;s just 5 questions and takes about a minute.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={() => {
              dismissLoginPrompt();
              openAssessment(currentCategory);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Start Wellness Check
          </button>
          <button
            onClick={dismissLoginPrompt}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F4FAF7] dark:bg-[#18181b] hover:bg-[#E2ECE6] dark:hover:bg-[#27272a] text-[#4F685F] dark:text-[#A1A1AA] border border-transparent dark:border-[#27272a] text-xs font-bold transition-colors cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </div>
  );
}
