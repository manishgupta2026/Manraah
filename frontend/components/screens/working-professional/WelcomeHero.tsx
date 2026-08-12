"use client";

import React from "react";
import { motion } from "framer-motion";

interface WelcomeHeroProps {
  sanctuaryName: string;
  streakDays: number;
  onOpenReset: () => void;
  onOpenAI: () => void;
}

export default function WelcomeHero({
  sanctuaryName,
  streakDays,
  onOpenReset,
  onOpenAI,
}: WelcomeHeroProps) {
  // Get contextual time-of-day greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 22) return "Good evening";
    return "Good night";
  };

  const getTodayFormatted = () => {
    const d = new Date();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    return `Today, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  return (
    <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#FAF7FF] via-[#F4EEFF] to-[#EFE6FD] border border-purple-100/80 p-6 md:p-8 lg:p-9 shadow-[0_12px_40px_rgba(95,78,165,0.06)]">
      {/* Ambient Slow-Breathing Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-16 -right-10 w-80 h-80 rounded-full bg-[#E6DEFF] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -15, 0],
            y: [0, 20, 0],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-[#88F7D6]/20 blur-3xl"
        />
        <motion.div
          animate={{
            opacity: [0.15, 0.3, 0.15],
            y: [0, -8, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-[#FFD9E0]/25 blur-2xl"
        />
      </div>

      <div className="relative z-10 max-w-2xl space-y-4">
        {/* Contextual Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#5F4EA5] bg-white/80 border border-purple-100/70 shadow-xs backdrop-blur-md">
            <span>📅</span>
            <span>{getTodayFormatted()}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#006B56] bg-white/80 border border-emerald-100/70 shadow-xs backdrop-blur-md">
            <span>🔥</span>
            <span>{streakDays}-day sanctuary streak</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#484551] bg-white/80 border border-purple-100/70 shadow-xs backdrop-blur-md">
            <span>💼</span>
            <span>Working Professional</span>
          </span>
        </div>

        {/* Calm Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-[#1D192B] tracking-tight leading-tight">
            {getTimeGreeting()},{" "}
            <span className="text-[#5F4EA5]">{sanctuaryName || "Gentle Willow"}</span> 🌿
          </h1>
          <p className="text-sm sm:text-base text-[#484551] font-normal leading-relaxed max-w-xl">
            You've done enough for today. Take a moment to breathe, reset, and come back to yourself.
          </p>
        </div>

        {/* Primary & Secondary CTAs */}
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
            className="px-5 py-3 rounded-full bg-white/80 text-[#5F4EA5] border border-purple-200/60 font-heading font-bold text-xs sm:text-sm shadow-xs hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm"
          >
            <span>Talk to AI Companion</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
