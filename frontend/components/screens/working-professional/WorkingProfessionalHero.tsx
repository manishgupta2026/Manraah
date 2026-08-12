"use client";

import React from "react";
import { motion } from "framer-motion";

interface WorkingProfessionalHeroProps {
  sanctuaryName: string;
  streakDays: number;
  onOpenReset: () => void;
  onOpenAI: () => void;
}

export default function WorkingProfessionalHero({
  sanctuaryName,
  streakDays,
  onOpenReset,
  onOpenAI,
}: WorkingProfessionalHeroProps) {
  const getTodayFormatted = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `Today, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const displayName = sanctuaryName || "Golden Sparrow 62";

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#F7F2FE] via-[#EDE4FD] to-[#DDE0FA] border border-[#E6DEFF]/90 p-7 sm:p-9 lg:p-10 shadow-[0_10px_35px_rgba(95,78,165,0.06)] min-h-[300px] flex flex-col md:flex-row items-center justify-between gap-6"
    >
      {/* Left Content */}
      <div className="relative z-10 max-w-xl space-y-4">
        {/* Contextual Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#5F4EA5] bg-white/90 border border-purple-100 shadow-2xs backdrop-blur-md">
            <span>📅</span>
            <span>{getTodayFormatted()}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#D97706] bg-white/90 border border-amber-100 shadow-2xs backdrop-blur-md">
            <span>🔥</span>
            <span>{streakDays}-day sanctuary streak</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#484551] bg-white/90 border border-purple-100 shadow-2xs backdrop-blur-md">
            <span>💼</span>
            <span>Working Professional</span>
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#1D192B] tracking-tight">
            Good evening, <span className="text-[#5F4EA5]">{displayName}</span> 🌿
          </h1>
          <p className="text-xs sm:text-sm text-[#484551] font-normal leading-relaxed">
            You've carried enough today.<br />
            Take a moment to slow down and come back to yourself.
          </p>
        </div>

        {/* CTAs */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <motion.button
            onClick={onOpenReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs sm:text-sm shadow-md hover:bg-[#7C6BC4] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🌿 Take a 2-Minute Reset</span>
          </motion.button>

          <motion.button
            onClick={onOpenAI}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-3 rounded-full bg-white/90 text-[#5F4EA5] border border-purple-200/80 font-heading font-bold text-xs sm:text-sm shadow-2xs hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <span>Talk to AI Companion</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.button>
        </div>
      </div>

      {/* Right Artwork Illustration */}
      <div className="relative shrink-0 w-64 sm:w-80 lg:w-[380px] h-60 sm:h-72 lg:h-76 z-10">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full"
        >
          <img
            src="/category/Working.png"
            alt="Working Professional Sanctuary"
            className="w-full h-full object-contain filter drop-shadow-md rounded-2xl"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
