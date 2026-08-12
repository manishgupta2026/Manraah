"use client";

import React from "react";
import { motion } from "framer-motion";

interface WorkLifeBalanceProps {
  balance?: {
    work: number;
    personal: number;
    rest: number;
    insight: string;
  };
}

export default function WorkLifeBalanceCard({ balance }: WorkLifeBalanceProps) {
  const workPct = balance?.work ?? 54;
  const personalPct = balance?.personal ?? 28;
  const restPct = balance?.rest ?? 18;
  const insightText =
    balance?.insight ||
    "Work has been taking up a little more space this week. Make room for something that restores you.";

  return (
    <div className="rounded-[32px] bg-white/75 backdrop-blur-xl border border-purple-100/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between">
      {/* Corner subtle green glow */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Your Balance
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F4EA5] bg-[#E6DEFF]/60 px-2.5 py-0.5 rounded-full border border-purple-200/50">
            Weekly Rhythm
          </span>
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          How your energy is currently shared across life spaces.
        </p>
      </div>

      {/* Organic Visual Representation */}
      <div className="py-4 space-y-4 relative z-10">
        {/* Soft Multi-Segment Floating Pill Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-purple-50 p-0.5 flex gap-1 overflow-hidden shadow-inner border border-purple-100/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${workPct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#7C6BC4] to-[#5F4EA5] shadow-xs"
              title={`Work: ${workPct}%`}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${personalPct}%` }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#5FCFB0] to-[#006B56] shadow-xs"
              title={`Personal: ${personalPct}%`}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${restPct}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-[#F5C99B] to-[#F4A6B8] shadow-xs"
              title={`Rest: ${restPct}%`}
            />
          </div>

          {/* 3 Metric Badges */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-100/60 text-center">
              <span className="text-xs font-bold text-[#5F4EA5] flex items-center justify-center gap-1">
                <span>💼</span>
                <span>Work</span>
              </span>
              <p className="text-base font-heading font-black text-[#1D192B] mt-0.5">{workPct}%</p>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60 text-center">
              <span className="text-xs font-bold text-[#006B56] flex items-center justify-center gap-1">
                <span>🌿</span>
                <span>Personal</span>
              </span>
              <p className="text-base font-heading font-black text-[#1D192B] mt-0.5">{personalPct}%</p>
            </div>

            <div className="p-2.5 rounded-2xl bg-orange-50/70 border border-orange-100/60 text-center">
              <span className="text-xs font-bold text-[#874959] flex items-center justify-center gap-1">
                <span>🌙</span>
                <span>Rest</span>
              </span>
              <p className="text-base font-heading font-black text-[#1D192B] mt-0.5">{restPct}%</p>
            </div>
          </div>
        </div>

        {/* Personalized Insight Pill */}
        <div className="p-3.5 rounded-2xl bg-[#FDF7FF] border border-purple-100/70 flex items-start gap-2.5 shadow-xs">
          <span className="text-base shrink-0 mt-0.5">🌱</span>
          <p className="text-xs text-[#484551] font-medium leading-relaxed">
            {insightText}
          </p>
        </div>
      </div>
    </div>
  );
}
