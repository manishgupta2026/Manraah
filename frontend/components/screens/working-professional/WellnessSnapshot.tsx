"use client";

import React from "react";
import { motion } from "framer-motion";

interface WellnessSnapshotProps {
  todayMood?: any;
}

export default function WellnessSnapshot({ todayMood }: WellnessSnapshotProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
      className="space-y-3"
    >
      <div className="space-y-0.5">
        <h3 className="text-base sm:text-lg font-heading font-black text-[#1D192B]">
          Your recent rhythm
        </h3>
        <p className="text-xs text-[#797582] font-normal">
          Gentle reflections on your recent emotional baselines.
        </p>
      </div>

      {/* 3 Small Elegant Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Indicator 1: Mind */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E6DEFF]/80 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-heading font-bold text-[#797582] uppercase tracking-wider">
              Mind
            </span>
            <p className="text-xs sm:text-sm font-heading font-black text-[#1D192B]">
              Feeling steadier
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006B56] border border-emerald-100 flex items-center justify-center text-sm font-bold shadow-2xs">
            ↗
          </div>
        </div>

        {/* Indicator 2: Energy */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E6DEFF]/80 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-heading font-bold text-[#797582] uppercase tracking-wider">
              Energy
            </span>
            <p className="text-xs sm:text-sm font-heading font-black text-[#1D192B]">
              Holding steady
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-50 text-[#5F4EA5] border border-purple-100 flex items-center justify-center text-sm font-bold shadow-2xs">
            →
          </div>
        </div>

        {/* Indicator 3: Rest */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#E6DEFF]/80 flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] font-heading font-bold text-[#797582] uppercase tracking-wider">
              Rest
            </span>
            <p className="text-xs sm:text-sm font-heading font-black text-[#1D192B]">
              Improving
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#006B56] border border-emerald-100 flex items-center justify-center text-sm font-bold shadow-2xs">
            ↗
          </div>
        </div>
      </div>
    </motion.section>
  );
}
