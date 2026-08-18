"use client";

import React from "react";
import { motion } from "framer-motion";

interface RecentRhythmCardProps {
  history?: any[];
}

export default function RecentRhythmCard({ history = [] }: RecentRhythmCardProps) {
  const RHYTHMS = [
    {
      id: "mind",
      label: "Mind",
      status: "Feeling steadier",
      icon: "💜",
      stroke: "#6351A5",
      fill: "url(#mindGrad)",
      path: "M 0 25 C 20 18, 40 32, 60 20 C 80 10, 100 24, 120 15 C 140 8, 160 20, 180 12 L 180 40 L 0 40 Z",
      linePath: "M 0 25 C 20 18, 40 32, 60 20 C 80 10, 100 24, 120 15 C 140 8, 160 20, 180 12",
    },
    {
      id: "energy",
      label: "Energy",
      status: "Holding steady",
      icon: "🌿",
      stroke: "#1F7A65",
      fill: "url(#energyGrad)",
      path: "M 0 20 C 25 24, 50 16, 75 22 C 100 28, 125 18, 150 20 C 165 21, 175 19, 180 20 L 180 40 L 0 40 Z",
      linePath: "M 0 20 C 25 24, 50 16, 75 22 C 100 28, 125 18, 150 20 C 165 21, 175 19, 180 20",
    },
    {
      id: "rest",
      label: "Rest",
      status: "Improving",
      icon: "🌙",
      stroke: "#7C6BC4",
      fill: "url(#restGrad)",
      path: "M 0 30 C 20 28, 40 22, 60 24 C 80 26, 100 16, 120 18 C 140 20, 160 12, 180 10 L 180 40 L 0 40 Z",
      linePath: "M 0 30 C 20 28, 40 22, 60 24 C 80 26, 100 16, 120 18 C 140 20, 160 12, 180 10",
    },
  ];

  return (
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 shadow-[0_8px_30px_rgba(95,78,165,0.03)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#6351A5]">insights</span>
            <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
              Your recent rhythm
            </h3>
          </div>
          <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
            Small changes are still changes.
          </p>
        </div>

        <span className="text-[10px] font-heading font-bold text-[#746F89] dark:text-purple-200/60 bg-[#FAF8FE] dark:bg-white/10 px-3 py-1 rounded-full border border-purple-100/60 dark:border-white/10">
          7-day snapshot
        </span>
      </div>

      {/* 3 Rhythm Indicator Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {RHYTHMS.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 flex flex-col justify-between min-h-[110px] overflow-hidden relative shadow-2xs"
          >
            {/* Top Label & Status */}
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold text-[#231E39] dark:text-white">
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </div>
              <p className="text-[11px] text-[#746F89] dark:text-purple-200/70 font-normal">
                {r.status}
              </p>
            </div>

            {/* Bottom Smooth Wavy Sparkline */}
            <div className="w-full h-8 relative select-none mt-1">
              <svg viewBox="0 0 180 40" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="mindGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6351A5" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6351A5" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1F7A65" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#1F7A65" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="restGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path d={r.path} fill={r.fill} />
                <motion.path
                  d={r.linePath}
                  fill="none"
                  stroke={r.stroke}
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
