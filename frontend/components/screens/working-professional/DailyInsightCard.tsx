"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DailyInsightCard() {
  return (
    <div className="rounded-[28px] bg-white/85 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-[#E6DEFF]/80 dark:border-purple-500/20 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[280px] relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-amber-100/25 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 relative z-10">
        <span className="text-sm text-[#5F4EA5] dark:text-purple-300">❝</span>
        <h3 className="text-base font-heading font-extrabold text-[#1D192B] dark:text-white">
          Daily Insight
        </h3>
      </div>

      {/* Content Row */}
      <div className="flex items-center justify-between gap-3 relative z-10 py-1 flex-1">
        {/* Quote Text */}
        <div className="space-y-1.5 max-w-[200px]">
          <p className="text-xs sm:text-sm font-heading font-bold text-[#1D192B] dark:text-white leading-relaxed">
            Rest isn't something you earn after being productive.
          </p>
          <p className="text-[11px] text-[#797582] dark:text-purple-200/70 font-normal">
            Give your mind the same patience you give your work.
          </p>
        </div>

        {/* Lantern Illustration with Warm Glow */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center pointer-events-none select-none">
          {/* Animated Warm Golden Halo */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.85, 0.5],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-14 h-14 rounded-full bg-amber-300/40 blur-xl"
          />

          {/* Clean SVG Lantern / Sanctuary Lamp Artwork */}
          <svg viewBox="0 0 100 120" className="w-full h-full">
            {/* Lavender surrounding leaves */}
            <path d="M 15 105 C 10 90, 25 80, 30 95 C 35 110, 20 115, 15 105 Z" fill="#D4CAFD" opacity="0.6" />
            <path d="M 85 105 C 90 90, 75 80, 70 95 C 65 110, 80 115, 85 105 Z" fill="#D4CAFD" opacity="0.6" />
            <path d="M 5 112 C 12 100, 25 105, 22 115 Z" fill="#88F7D6" opacity="0.4" />
            <path d="M 95 112 C 88 100, 75 105, 78 115 Z" fill="#88F7D6" opacity="0.4" />

            {/* Lantern Handle Ring */}
            <circle cx="50" cy="18" r="8" fill="none" stroke="#7C6BC4" strokeWidth="2.5" />

            {/* Lantern Top Roof */}
            <path d="M 32 32 L 50 24 L 68 32 L 64 38 L 36 38 Z" fill="#5F4EA5" />

            {/* Lantern Glass Body */}
            <path d="M 35 38 L 65 38 L 60 90 L 40 90 Z" fill="#FAF8FF" stroke="#7C6BC4" strokeWidth="1.5" />

            {/* Candle Inside */}
            <rect x="46" y="65" width="8" height="22" rx="2" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />

            {/* Candle Flame */}
            <ellipse cx="50" cy="56" rx="4" ry="7" fill="#F59E0B" />
            <ellipse cx="50" cy="57" rx="2" ry="4" fill="#FEF08A" />

            {/* Lantern Base */}
            <rect x="34" y="90" width="32" height="6" rx="2" fill="#5F4EA5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
