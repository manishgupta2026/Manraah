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
  level = "STABLE",
}: SanctuaryScoreCardProps) {
  const router = useRouter();

  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (score / 100) * circ;

  return (
    <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[360px] space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-[#5F4EA5]">insights</span>
        <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
          Sanctuary Score
        </h3>
      </div>

      {/* Main Score Center Row */}
      <div className="flex items-center justify-around py-3 gap-4">
        {/* Animated Circular Gauge */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} stroke="#F2EBFF" strokeWidth="8" fill="none" />
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
            <span className="text-2xl font-heading font-black text-[#1D192B] leading-none">
              {score}
            </span>
            <span className="text-[10px] font-bold text-[#797582] mt-0.5">/100</span>
          </div>
        </div>

        {/* Status Context */}
        <div className="space-y-1">
          <span className="text-sm font-heading font-black text-[#006B56] uppercase tracking-wider block">
            {level}
          </span>
          <p className="text-xs text-[#484551] font-normal leading-relaxed">
            You're doing better than last week <span className="text-[#006B56] font-bold">↗</span>
          </p>
        </div>
      </div>

      {/* Primary Wide Action */}
      <div className="space-y-2.5 pt-1">
        <motion.button
          onClick={() => router.push("/reports")}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-2xl bg-[#F2EBFF] hover:bg-[#EAE0FC] text-[#5F4EA5] font-heading font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <span>View Wellness Report</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </motion.button>

        {/* Retake Assessment link */}
        <div className="text-center">
          <button
            onClick={() => router.push("/assessment")}
            className="text-[11px] font-bold text-[#797582] hover:text-[#1D192B] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xs">refresh</span>
            <span>Retake Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
