"use client";

import React from "react";
import { motion } from "framer-motion";

interface WorkingProfessionalHeroProps {
  sanctuaryName: string;
  streakDays: number;
  onOpenReset: () => void;
  onOpenAI: () => void;
  isAmbientMode: boolean;
  onToggleAmbient: () => void;
}

export default function WorkingProfessionalHero({
  sanctuaryName,
  streakDays,
  onOpenReset,
  onOpenAI,
  isAmbientMode,
  onToggleAmbient,
}: WorkingProfessionalHeroProps) {
  const getTodayFormatted = () => {
    const d = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  const displayName = sanctuaryName || "Golden Sparrow 62";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`relative rounded-[36px] overflow-hidden border transition-all duration-1000 p-8 sm:p-10 lg:p-11 min-h-[340px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_12px_45px_rgba(95,78,165,0.04)] ${
        isAmbientMode
          ? "bg-gradient-to-r from-[#1C172E] via-[#241E3D] to-[#181427] border-purple-500/20 text-white"
          : "bg-gradient-to-r from-[#FBF9FE] via-[#F3EDFB] to-[#E9E1F7] border-purple-100/60 text-[#231E39]"
      }`}
    >
      {/* Ultra-Slow Ambient Breathing Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            x: [0, 15, 0],
            y: [0, -10, 0],
            opacity: isAmbientMode ? [0.35, 0.55, 0.35] : [0.25, 0.4, 0.25],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full bg-[#EAE2FB] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.08, 0.95, 1.08],
            x: [0, -15, 0],
            y: [0, 12, 0],
            opacity: isAmbientMode ? [0.25, 0.45, 0.25] : [0.15, 0.28, 0.15],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-16 right-1/3 w-[400px] h-[400px] rounded-full bg-[#CFF4EB] blur-3xl"
        />
      </div>

      {/* Left Content Area */}
      <div className="relative z-10 max-w-xl space-y-4">
        {/* Soft Contextual Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-medium backdrop-blur-md border shadow-2xs ${
            isAmbientMode
              ? "bg-white/10 text-purple-200 border-white/10"
              : "bg-white/90 text-[#6351A5] border-purple-100/70"
          }`}>
            <span className="text-[10px]">📅</span>
            <span>{getTodayFormatted()}</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-medium backdrop-blur-md border shadow-2xs ${
            isAmbientMode
              ? "bg-white/10 text-amber-200 border-white/10"
              : "bg-white/90 text-[#B45309] border-amber-100/60"
          }`}>
            <span className="text-[10px]">🔥</span>
            <span>{streakDays}-day sanctuary streak</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-medium backdrop-blur-md border shadow-2xs ${
            isAmbientMode
              ? "bg-white/10 text-purple-200 border-white/10"
              : "bg-white/90 text-[#534F64] border-purple-100/70"
          }`}>
            <span className="text-[10px]">💼</span>
            <span>Working Professional</span>
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-1.5 pt-1">
          <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-heading font-extrabold tracking-tight leading-tight">
            Good evening,<br />
            <span className={isAmbientMode ? "text-[#D8CCFD]" : "text-[#6351A5]"}>{displayName}</span> 🌿
          </h1>

          <h2 className="text-sm sm:text-base font-heading font-bold opacity-90 pt-1 text-[#231E39] dark:text-white/90">
            Work can wait. Your mind doesn't have to.
          </h2>

          <p className="text-xs sm:text-sm text-[#534F64] dark:text-purple-200/80 font-normal leading-relaxed max-w-md pt-0.5">
            You've made it through enough today. Take a moment to slow down, breathe, and come back to yourself.
          </p>
        </div>

        {/* Soothing Action Pills */}
        <div className="pt-3 flex flex-wrap items-center gap-3">
          <motion.button
            onClick={onOpenReset}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="px-6 py-2.5 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(99,81,165,0.2)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🌿 Take a 2-Minute Reset →</span>
          </motion.button>

          <motion.button
            onClick={onOpenAI}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={`px-5 py-2.5 rounded-full font-heading font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
              isAmbientMode
                ? "bg-white/10 hover:bg-white/15 text-white border-white/15"
                : "bg-white/95 hover:bg-white text-[#6351A5] border-purple-200/70"
            }`}
          >
            <span>✨ Talk to AI Companion →</span>
          </motion.button>

          <motion.button
            onClick={onToggleAmbient}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className={`px-4 py-2.5 rounded-full font-heading font-medium text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
              isAmbientMode
                ? "bg-[#6351A5] text-white border-purple-400/40"
                : "bg-white/60 hover:bg-white/90 text-[#534F64] border-purple-100/60"
            }`}
          >
            <span>{isAmbientMode ? "⏸ Ambient on" : "▶ Play ambient"}</span>
          </motion.button>
        </div>
      </div>

      {/* Right Artwork Illustration */}
      <div className="relative shrink-0 w-64 sm:w-80 lg:w-[370px] h-60 sm:h-72 lg:h-76 z-10 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img
            src="/category/Working.png"
            alt="Working Professional Sanctuary"
            className="w-full h-full object-contain filter drop-shadow-md rounded-2xl select-none pointer-events-none"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
