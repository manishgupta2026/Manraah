"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface SanctuaryScoreCardProps {
  score?: number;
  level?: string;
}

export default function SanctuaryScoreCard({
  score = 75,
  level = "Stable",
}: SanctuaryScoreCardProps) {
  const router = useRouter();

  // Circle properties
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getLevelBadgeColor = (lvl: string) => {
    const l = lvl.toLowerCase();
    if (l.includes("flourish") || l.includes("thriving")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (l.includes("stable") || l.includes("grounded") || l.includes("active")) {
      return "bg-purple-50 text-[#5F4EA5] border-purple-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="rounded-[32px] bg-white/75 backdrop-blur-xl border border-purple-100/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between">
      {/* Background soft lavender glow */}
      <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-purple-100/30 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Sanctuary Score
            </h3>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getLevelBadgeColor(level)}`}>
            {level}
          </span>
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          Reflecting your overall work and emotional resilience baseline.
        </p>
      </div>

      {/* Center Circular Score Visual */}
      <div className="py-3 flex items-center justify-center gap-6 relative z-10">
        {/* Animated Circular Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#F2EBFF"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress Arc */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#purpleGradient)"
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              fill="none"
            />
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C6BC4" />
                <stop offset="100%" stopColor="#5F4EA5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-heading font-black text-[#1D192B] leading-none">
              {score}
            </span>
            <span className="text-[10px] font-bold text-[#797582] mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Supporting Context */}
        <div className="space-y-2">
          <p className="text-xs text-[#484551] font-medium leading-relaxed max-w-[160px]">
            Calibrated to your work balance and daily check-ins.
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#006B56]">
            <span className="w-2 h-2 rounded-full bg-[#006B56]" />
            <span>Resilient & Steady</span>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="pt-2 flex items-center justify-between border-t border-purple-100/60 text-xs font-bold relative z-10">
        <button
          onClick={() => router.push("/reports")}
          className="text-[#5F4EA5] hover:text-[#7C6BC4] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View Wellness Report</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>

        <button
          onClick={() => router.push("/assessment")}
          className="text-[#797582] hover:text-[#1D192B] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-xs">restart_alt</span>
          <span>Retake Assessment</span>
        </button>
      </div>
    </div>
  );
}
