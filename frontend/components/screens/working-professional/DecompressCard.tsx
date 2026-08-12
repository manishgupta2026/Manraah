"use client";

import React from "react";
import { motion } from "framer-motion";

interface DecompressCardProps {
  onStartReset: () => void;
}

export default function DecompressCard({ onStartReset }: DecompressCardProps) {
  return (
    <div className="rounded-[32px] bg-gradient-to-br from-[#F4F9F8] via-[#F7F1FF] to-[#FAF8FF] border border-purple-100/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between">
      {/* Background Soft Glow */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-[#88F7D6]/25 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#E6DEFF]/40 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Leave Work at Work
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#006B56] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            Decompression
          </span>
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          A tiny reset before you carry the day into the rest of your evening.
        </p>
      </div>

      {/* Feature Content */}
      <div className="py-4 space-y-3 relative z-10">
        <div className="p-4 rounded-2xl bg-white/80 border border-purple-100/60 flex items-start gap-3.5 shadow-xs backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5FCFB0] to-[#006B56] text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
            🧘
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-black text-[#1D192B]">
                2-Minute Mindful Reset
              </span>
              <span className="text-[9px] font-bold text-[#5F4EA5] bg-[#E6DEFF]/60 px-2 py-0.5 rounded-full">
                4-4-4-2 Rhythm
              </span>
            </div>
            <p className="text-xs text-[#484551] leading-relaxed font-normal">
              Release the tension from your shoulders, slow your breathing, and give your mind some space.
            </p>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="pt-1 relative z-10 flex items-center justify-between">
        <span className="text-[11px] text-[#797582] font-semibold">
          ⏱️ Takes just 2 minutes
        </span>
        <motion.button
          onClick={onStartReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-full bg-[#006B56] text-white font-heading font-bold text-xs shadow-sm hover:bg-[#2A9D8F] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Begin Reset</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </motion.button>
      </div>
    </div>
  );
}
