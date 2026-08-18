"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface YourBalanceCardProps {
  balance?: {
    work: number;
    personal: number;
    rest: number;
    insight: string;
  };
}

export default function YourBalanceCard({ balance }: YourBalanceCardProps) {
  const router = useRouter();
  const workPct = balance?.work ?? 58;
  const personalPct = balance?.personal ?? 24;
  const restPct = balance?.rest ?? 18;

  // Donut chart geometry (radius 36, circumference 226)
  const r = 36;
  const circ = 2 * Math.PI * r;
  const workStroke = (workPct / 100) * circ;
  const personalStroke = (personalPct / 100) * circ;
  const restStroke = (restPct / 100) * circ;

  return (
    <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[360px] space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
            Your Balance
          </h3>
        </div>
        <p className="text-xs text-[#797582] font-normal">
          Your work-life balance this week
        </p>
      </div>

      {/* Donut Chart & Legend Row */}
      <div className="flex items-center justify-around py-2 gap-4">
        {/* Donut with scale in center */}
        <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Base circle */}
            <circle cx="50" cy="50" r={r} stroke="#F2EBFF" strokeWidth="10" fill="none" />

            {/* Work segment (purple) */}
            <motion.circle
              cx="50"
              cy="50"
              r={r}
              stroke="#5F4EA5"
              strokeWidth="10"
              strokeDasharray={`${workStroke} ${circ}`}
              strokeDashoffset={0}
              fill="none"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Personal segment (teal/mint) */}
            <motion.circle
              cx="50"
              cy="50"
              r={r}
              stroke="#5FCFB0"
              strokeWidth="10"
              strokeDasharray={`${personalStroke} ${circ}`}
              strokeDashoffset={-workStroke}
              fill="none"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: -workStroke }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            />

            {/* Rest segment (amber/peach) */}
            <motion.circle
              cx="50"
              cy="50"
              r={r}
              stroke="#F5C99B"
              strokeWidth="10"
              strokeDasharray={`${restStroke} ${circ}`}
              strokeDashoffset={-(workStroke + personalStroke)}
              fill="none"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: -(workStroke + personalStroke) }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            />
          </svg>

          {/* Center Scale Icon */}
          <div className="absolute inset-0 flex items-center justify-center text-xl text-[#5F4EA5]">
            ⚖️
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 text-xs font-heading font-bold">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5F4EA5]" />
              <span className="text-[#484551]">Work</span>
            </div>
            <span className="font-black text-[#1D192B]">{workPct}%</span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5FCFB0]" />
              <span className="text-[#484551]">Personal</span>
            </div>
            <span className="font-black text-[#1D192B]">{personalPct}%</span>
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5C99B]" />
              <span className="text-[#484551]">Rest</span>
            </div>
            <span className="font-black text-[#1D192B]">{restPct}%</span>
          </div>
        </div>
      </div>

      {/* Insight Text */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8FF] border border-purple-100/60 text-xs text-[#484551] font-normal leading-relaxed">
        Work has been taking up a little more space lately.<br />
        Make room for <strong className="font-bold text-[#1D192B]">what restores you</strong>.
      </div>

      {/* Bottom Link */}
      <button
        onClick={() => router.push("/reports")}
        className="text-xs font-heading font-bold text-[#5F4EA5] hover:text-[#7C6BC4] transition-colors flex items-center gap-1 cursor-pointer pt-1"
      >
        <span>View Balance Insights</span>
        <span className="material-symbols-outlined text-xs">arrow_forward</span>
      </button>
    </div>
  );
}
