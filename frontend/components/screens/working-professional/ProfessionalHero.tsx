"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProfessionalHeroProps {
  sanctuaryName: string;
  streakDays: number;
  onOpenReset: () => void;
  onOpenAI: () => void;
}

export default function ProfessionalHero({
  sanctuaryName,
  streakDays,
  onOpenReset,
  onOpenAI,
}: ProfessionalHeroProps) {
  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    if (h >= 17 && h < 22) return "Good evening";
    return "Good night";
  };

  const getTodayFormatted = () => {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#FAF8FF] via-[#F4EDFE] to-[#EDE4FA] border border-[#E6DEFF]/80 p-7 sm:p-9 lg:p-11 shadow-[0_12px_40px_rgba(95,78,165,0.05)] min-h-[360px] flex items-center justify-between"
    >
      {/* Ambient Ultra-Slow Breathing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 15, 0],
            y: [0, -10, 0],
            opacity: [0.3, 0.45, 0.3],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-[#E6DEFF] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -20, 0],
            y: [0, 15, 0],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-16 right-1/4 w-80 h-80 rounded-full bg-[#88F7D6]/20 blur-3xl"
        />
      </div>

      {/* Left Content Area */}
      <div className="relative z-10 max-w-xl space-y-4 sm:space-y-5">
        {/* Tiny Contextual Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#5F4EA5] bg-white/80 border border-[#E6DEFF] shadow-xs backdrop-blur-md">
            <span>📅</span>
            <span>{getTodayFormatted()}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#006B56] bg-white/80 border border-emerald-100 shadow-xs backdrop-blur-md">
            <span>🔥</span>
            <span>{streakDays} day sanctuary streak</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#484551] bg-white/80 border border-[#E6DEFF] shadow-xs backdrop-blur-md">
            <span>💼</span>
            <span>Working Professional</span>
          </span>
        </div>

        {/* Calm Heading & Subtitles */}
        <div className="space-y-2">
          <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#5F4EA5] tracking-wide">
            {getTimeGreeting()},{" "}
            <span className="text-[#1D192B]">{sanctuaryName || "Golden Sparrow"}</span> 🌿
          </h2>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-[#1D192B] tracking-tight leading-snug">
            Work can wait.<br />
            <span className="text-[#5F4EA5]">Your mind doesn't have to.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#484551] font-normal leading-relaxed max-w-md pt-1">
            You've made it through enough today. Take a moment to slow down, breathe, and come back to yourself.
          </p>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="pt-2 flex flex-wrap items-center gap-3.5">
          <motion.button
            onClick={onOpenReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs sm:text-sm shadow-md hover:bg-[#7C6BC4] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Take a 2-Minute Reset →</span>
          </motion.button>

          <motion.button
            onClick={onOpenAI}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-3 rounded-full bg-white/85 text-[#5F4EA5] border border-[#E6DEFF] font-heading font-bold text-xs sm:text-sm shadow-xs hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <span>Talk to AI Companion</span>
          </motion.button>
        </div>
      </div>

      {/* Right Artwork Illustration - Gracefully Integrated with Soft Gradient Blending */}
      <div className="relative hidden md:block shrink-0 w-64 lg:w-80 h-72 lg:h-80 z-10 pointer-events-none">
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-full h-full"
        >
          {/* Working Professional Illustration */}
          <img
            src="/category/Working.png"
            alt="Working Professional Sanctuary"
            className="w-full h-full object-contain filter drop-shadow-md rounded-2xl"
          />

          {/* Soft Gradient Overlay for Seamless Integration */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#FAF8FF]/30 rounded-2xl pointer-events-none" />
        </motion.div>
      </div>
    </motion.section>
  );
}
