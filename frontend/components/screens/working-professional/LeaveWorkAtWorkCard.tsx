"use client";

import React from "react";
import { motion } from "framer-motion";

interface LeaveWorkAtWorkCardProps {
  onStartReset: () => void;
}

export default function LeaveWorkAtWorkCard({ onStartReset }: LeaveWorkAtWorkCardProps) {
  return (
    <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[300px] space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Leave Work at Work
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#006B56] bg-[#E6F7F2] px-2.5 py-0.5 rounded-full border border-emerald-200">
            Decompression
          </span>
        </div>
        <p className="text-xs text-[#797582] font-normal">
          A tiny reset before you carry the day into your evening.
        </p>
      </div>

      {/* Inner Feature Box */}
      <div className="p-4 rounded-2xl bg-[#F7F2FE]/80 border border-purple-100/70 flex items-start gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-[#5F4EA5] text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
          🧘
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-heading font-extrabold text-[#1D192B]">
              2-Minute Mindful Reset
            </h4>
            <span className="text-[9px] font-bold text-[#5F4EA5] bg-[#EAE0FC] px-2 py-0.5 rounded-full">
              4-4-4-2 Rhythm
            </span>
          </div>
          <p className="text-xs text-[#484551] leading-relaxed font-normal">
            Release the tension from your shoulders, slow your breathing, and give your mind some space.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-[#797582] font-semibold flex items-center gap-1">
          <span>⏱️</span>
          <span>Takes just 2 minutes</span>
        </span>

        <motion.button
          onClick={onStartReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-full bg-[#006B56] text-white font-heading font-bold text-xs shadow-xs hover:bg-[#2A9D8F] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Begin Reset</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </motion.button>
      </div>
    </div>
  );
}
