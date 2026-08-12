"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface LeaveWorkAtWorkCardProps {
  onStartReset: () => void;
}

export default function LeaveWorkAtWorkCard({ onStartReset }: LeaveWorkAtWorkCardProps) {
  const [activeStep, setActiveStep] = useState<number>(2); // 1 = Work, 2 = Reset, 3 = Personal Time

  return (
    <div className="rounded-[28px] bg-white/85 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-[#E6DEFF]/80 dark:border-purple-500/20 p-6 sm:p-7 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[340px] space-y-4 relative overflow-hidden">
      {/* Background Zen Stones Graphic on Right */}
      <div className="absolute right-2 bottom-12 w-28 h-28 opacity-20 pointer-events-none select-none text-6xl">
        🪨
      </div>

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B] dark:text-white">
              Leave Work at Work
            </h3>
          </div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#006B56] dark:text-emerald-300 bg-[#E6F7F2] dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800">
            Decompression
          </span>
        </div>
        <p className="text-xs text-[#797582] dark:text-purple-200/70 font-normal">
          A short ritual to separate your workday from the rest of your evening.
        </p>
      </div>

      {/* 3-Step Journey Indicator */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8FF] dark:bg-white/5 border border-purple-100/70 dark:border-white/10 flex items-center justify-around text-xs font-heading font-bold relative z-10">
        {/* Step 1: Work */}
        <div className="flex flex-col items-center gap-1 opacity-70">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-purple-100 flex items-center justify-center text-sm shadow-2xs">
            💼
          </div>
          <span className="text-[10px] text-[#797582] dark:text-purple-200/70">Work</span>
        </div>

        <span className="text-purple-300 dark:text-purple-600 text-xs">──→</span>

        {/* Step 2: Reset (Active) */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5FCFB0] to-[#006B56] text-white flex items-center justify-center text-sm shadow-md ring-4 ring-emerald-100/70 dark:ring-emerald-900/40"
          >
            🧘
          </motion.div>
          <span className="text-[10px] font-black text-[#006B56] dark:text-emerald-300">Reset</span>
        </div>

        <span className="text-purple-300 dark:text-purple-600 text-xs">──→</span>

        {/* Step 3: Personal Time */}
        <div className="flex flex-col items-center gap-1 opacity-85">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-purple-100 flex items-center justify-center text-sm shadow-2xs">
            🏡
          </div>
          <span className="text-[10px] text-[#484551] dark:text-purple-200">Personal Time</span>
        </div>
      </div>

      {/* 3 Bullet Points */}
      <div className="space-y-1.5 text-xs text-[#484551] dark:text-purple-200/90 font-medium relative z-10 pl-1">
        <div className="flex items-center gap-2">
          <span className="text-[#006B56] dark:text-emerald-400 text-xs">✦</span>
          <span>Release the tension</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#006B56] dark:text-emerald-400 text-xs">✦</span>
          <span>Slow your breathing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#006B56] dark:text-emerald-400 text-xs">✦</span>
          <span>Be present beyond work</span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-1 flex justify-end relative z-10">
        <motion.button
          onClick={onStartReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 rounded-full bg-[#006B56] hover:bg-[#2A9D8F] text-white font-heading font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Start Decompression →</span>
        </motion.button>
      </div>
    </div>
  );
}
