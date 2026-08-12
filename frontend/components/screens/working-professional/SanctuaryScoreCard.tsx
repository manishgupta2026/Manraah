"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface SanctuaryScoreCardProps {
  score?: number;
  level?: string;
}

export default function SanctuaryScoreCard({
  score = 76,
  level = "STABLE",
}: SanctuaryScoreCardProps) {
  const router = useRouter();

  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (score / 100) * circ;

  const timelineDays = [
    { label: "S", active: false },
    { label: "M", active: false },
    { label: "T", active: false },
    { label: "W", active: false },
    { label: "T", active: true }, // Today
    { label: "F", active: false },
    { label: "S", active: false },
  ];

  return (
    <div className="rounded-[28px] bg-white/85 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-[#E6DEFF]/80 dark:border-purple-500/20 p-6 sm:p-7 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[340px] space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-[#5F4EA5]">insights</span>
        <h3 className="text-base font-heading font-extrabold text-[#1D192B] dark:text-white">
          Sanctuary Score
        </h3>
      </div>

      {/* Main Score & Status */}
      <div className="flex items-center justify-around py-1 gap-3">
        {/* Animated Circular Gauge */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="#F2EBFF" strokeWidth="8" fill="none" className="dark:stroke-white/10" />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#5F4EA5"
              strokeWidth="8"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-heading font-black text-[#1D192B] dark:text-white leading-none">
              {score}
            </span>
            <span className="text-[10px] font-bold text-[#797582] dark:text-purple-200/70 mt-0.5">/100</span>
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-heading font-black text-[#006B56] dark:text-emerald-300 uppercase tracking-wider">
              {level}
            </span>
            <span className="text-xs text-[#006B56] dark:text-emerald-300 font-bold">↗</span>
          </div>
          <p className="text-xs text-[#484551] dark:text-purple-200/90 font-normal leading-tight max-w-[140px]">
            Your mindset is steadier than last week.
          </p>
        </div>
      </div>

      {/* 7-Day Timeline Sparkline */}
      <div className="py-2">
        <div className="relative flex items-center justify-between px-2">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#E6DEFF] dark:bg-white/10 -translate-y-1/2 -z-0" />

          {timelineDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                  d.active
                    ? "bg-[#5F4EA5] ring-4 ring-purple-100 dark:ring-purple-900/50 scale-125"
                    : "bg-white dark:bg-white/20 border border-purple-200"
                }`}
              />
              <span className={`text-[10px] font-heading ${
                d.active
                  ? "font-black text-[#5F4EA5] dark:text-purple-300"
                  : "font-bold text-[#797582] dark:text-purple-200/60"
              }`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="pt-1 flex justify-center">
        <button
          onClick={() => router.push("/reports")}
          className="text-xs font-heading font-bold text-[#5F4EA5] dark:text-purple-300 hover:text-[#7C6BC4] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Wellness Report</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
