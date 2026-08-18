"use client";

import React from "react";
import { motion } from "framer-motion";

interface LeaveWorkAtWorkCardProps {
  onStartReset: () => void;
}

export default function LeaveWorkAtWorkCard({ onStartReset }: LeaveWorkAtWorkCardProps) {
  return (
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[340px] space-y-4 relative overflow-hidden">
      {/* Background Zen Stones Graphic on Right */}
      <div className="absolute right-3 bottom-12 w-28 h-28 opacity-15 pointer-events-none select-none text-5xl">
        🪨
      </div>

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base text-[#1F7A65] dark:text-emerald-400">🌿</span>
            <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
              Leave Work at Work
            </h3>
          </div>
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#1F7A65] dark:text-emerald-300 bg-[#EAF7F3] dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
            Decompression
          </span>
        </div>
        <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
          A short ritual to separate your workday from the rest of your evening.
        </p>
      </div>

      {/* 3-Step Journey Indicator */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 flex items-center justify-around text-xs font-heading font-bold relative z-10">
        {/* Step 1: Work */}
        <div className="flex flex-col items-center gap-1 opacity-65">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-purple-100/70 flex items-center justify-center text-sm shadow-2xs">
            💼
          </div>
          <span className="text-[10px] text-[#746F89] dark:text-purple-200/70">Work</span>
        </div>

        <span className="text-purple-200 dark:text-purple-700 text-xs font-light">──→</span>

        {/* Step 2: Reset (Active) */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5FCFB0] to-[#1F7A65] text-white flex items-center justify-center text-sm shadow-sm ring-3 ring-emerald-100/70 dark:ring-emerald-900/30"
          >
            🧘
          </motion.div>
          <span className="text-[10px] font-extrabold text-[#1F7A65] dark:text-emerald-300">Reset</span>
        </div>

        <span className="text-purple-200 dark:text-purple-700 text-xs font-light">──→</span>

        {/* Step 3: Personal Time */}
        <div className="flex flex-col items-center gap-1 opacity-75">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-purple-100/70 flex items-center justify-center text-sm shadow-2xs">
            🏡
          </div>
          <span className="text-[10px] text-[#534F64] dark:text-purple-200">Personal Time</span>
        </div>
      </div>

      {/* 3 Bullet Points */}
      <div className="space-y-1.5 text-xs text-[#534F64] dark:text-purple-200/90 font-medium relative z-10 pl-1">
        <div className="flex items-center gap-2">
          <span className="text-[#1F7A65] dark:text-emerald-400 text-xs">✦</span>
          <span>Release the tension from your shoulders</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#1F7A65] dark:text-emerald-400 text-xs">✦</span>
          <span>Slow your breathing and settle inward</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#1F7A65] dark:text-emerald-400 text-xs">✦</span>
          <span>Be present beyond your workday</span>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="pt-1 flex justify-end relative z-10">
        <motion.button
          onClick={onStartReset}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="px-6 py-2.5 rounded-full bg-[#1F7A65] hover:bg-[#288D77] text-white font-heading font-semibold text-xs shadow-[0_3px_12px_rgba(31,122,101,0.18)] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Start Decompression →</span>
        </motion.button>
      </div>
    </div>
  );
}
