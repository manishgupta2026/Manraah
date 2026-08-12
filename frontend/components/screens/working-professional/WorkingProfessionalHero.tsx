"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative rounded-[32px] overflow-hidden border transition-all duration-700 p-6 sm:p-8 lg:p-9 min-h-[340px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_35px_rgba(95,78,165,0.06)] ${
        isAmbientMode
          ? "bg-gradient-to-r from-[#201B38] via-[#2A234A] to-[#1A162D] border-purple-500/30 text-white"
          : "bg-gradient-to-r from-[#F7F2FE] via-[#EDE4FD] to-[#DDE0FA] border-[#E6DEFF]/90 text-[#1D192B]"
      }`}
    >
      {/* Ambient Moving Blobs & Floating Leaves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <motion.div
          animate={{
            scale: isAmbientMode ? [1, 1.3, 1] : [1, 1.15, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
            opacity: isAmbientMode ? [0.4, 0.7, 0.4] : [0.25, 0.4, 0.25],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-[#E6DEFF] blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -20, 0],
            y: [0, 20, 0],
            opacity: isAmbientMode ? [0.3, 0.5, 0.3] : [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-16 right-1/3 w-80 h-80 rounded-full bg-[#88F7D6]/20 blur-3xl"
        />

        {/* Floating subtle ambient particles */}
        <motion.span
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 text-sm"
        >
          🍃
        </motion.span>
        <motion.span
          animate={{ y: [0, 15, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-1/3 text-xs"
        >
          ✨
        </motion.span>
      </div>

      {/* Left Text & Actions */}
      <div className="relative z-10 max-w-xl space-y-4">
        {/* Contextual Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-bold shadow-2xs backdrop-blur-md border ${
            isAmbientMode
              ? "bg-white/10 text-purple-200 border-white/15"
              : "bg-white/90 text-[#5F4EA5] border-purple-100"
          }`}>
            <span>📅</span>
            <span>{getTodayFormatted()}</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-bold shadow-2xs backdrop-blur-md border ${
            isAmbientMode
              ? "bg-white/10 text-amber-300 border-white/15"
              : "bg-white/90 text-[#D97706] border-amber-100"
          }`}>
            <span>🔥</span>
            <span>{streakDays}-day sanctuary streak</span>
          </span>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-bold shadow-2xs backdrop-blur-md border ${
            isAmbientMode
              ? "bg-white/10 text-purple-200 border-white/15"
              : "bg-white/90 text-[#484551] border-purple-100"
          }`}>
            <span>💼</span>
            <span>Working Professional</span>
          </span>
        </div>

        {/* Headings */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black tracking-tight leading-tight">
            Good evening,<br />
            <span className={isAmbientMode ? "text-[#C4B5FD]" : "text-[#5F4EA5]"}>{displayName}</span> 🌿
          </h1>

          <h2 className="text-sm sm:text-base font-heading font-extrabold opacity-90 pt-0.5">
            Work can wait. Your mind doesn't have to.
          </h2>

          <p className="text-xs sm:text-sm opacity-75 font-normal leading-relaxed max-w-md">
            You've made it through enough today. Take a moment to slow down, breathe.
          </p>
        </div>

        {/* Primary & Secondary CTAs */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <motion.button
            onClick={onOpenReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#7C6BC4] text-white font-heading font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>🌿 Take a 2-Minute Reset →</span>
          </motion.button>

          <motion.button
            onClick={onOpenAI}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-5 py-3 rounded-full font-heading font-bold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border ${
              isAmbientMode
                ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                : "bg-white/90 hover:bg-white text-[#5F4EA5] border-purple-200/80"
            }`}
          >
            <span>Talk to AI Companion</span>
          </motion.button>
        </div>
      </div>

      {/* Right Artwork & Speech Bubble */}
      <div className="relative shrink-0 w-64 sm:w-80 lg:w-[380px] h-60 sm:h-72 lg:h-76 z-10 flex items-center justify-center">
        {/* Floating Speech Bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 sm:top-2 left-2 sm:left-4 z-20 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-[#2A234A]/90 backdrop-blur-md border border-purple-200/80 shadow-md text-[11px] font-heading font-bold text-[#5F4EA5] dark:text-purple-200 flex items-center gap-1"
        >
          <span>❝ Small pauses, big difference. ✨ ❞</span>
        </motion.div>

        {/* Working Professional Illustration */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <img
            src="/category/Working.png"
            alt="Working Professional Sanctuary"
            className="w-full h-full object-contain filter drop-shadow-lg rounded-2xl select-none pointer-events-none"
          />
        </motion.div>

        {/* Play Ambient Pill Button */}
        <motion.button
          onClick={onToggleAmbient}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`absolute bottom-2 right-2 sm:right-4 z-20 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-heading font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer backdrop-blur-md border ${
            isAmbientMode
              ? "bg-[#5F4EA5] text-white border-purple-400"
              : "bg-black/70 hover:bg-black/85 text-white border-white/20"
          }`}
        >
          <span>{isAmbientMode ? "⏸ Ambient on" : "▶ Play ambient ✦"}</span>
        </motion.button>
      </div>
    </motion.section>
  );
}
