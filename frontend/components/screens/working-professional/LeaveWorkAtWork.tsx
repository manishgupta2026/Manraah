"use client";

import React from "react";
import { motion } from "framer-motion";

interface LeaveWorkAtWorkProps {
  onStartDecompression: () => void;
}

export default function LeaveWorkAtWork({
  onStartDecompression,
}: LeaveWorkAtWorkProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
      className="relative rounded-[28px] bg-gradient-to-br from-[#FAF8FF] via-[#F5EFFE] to-[#F1F9F7] border border-[#E6DEFF]/80 p-6 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#88F7D6]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Info */}
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <h3 className="text-lg sm:text-xl font-heading font-black text-[#1D192B]">
              Leave Work at Work
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#484551] font-normal leading-relaxed">
            A small ritual to separate your workday from the rest of your evening. Close your work tabs, drop your shoulders, and transition peacefully into your personal sanctuary.
          </p>

          {/* Visual Progression: WORK -> RESET -> PERSONAL TIME */}
          <div className="pt-3 flex items-center gap-2 sm:gap-3 text-xs font-heading font-bold text-[#484551]">
            <span className="px-3 py-1 rounded-full bg-white/80 border border-purple-100/70 text-[#797582]">
              💼 Work
            </span>
            <span className="text-[#5F4EA5]">→</span>
            <span className="px-3 py-1 rounded-full bg-[#E6DEFF] border border-[#5F4EA5]/30 text-[#5F4EA5] shadow-xs">
              🧘 Reset
            </span>
            <span className="text-[#006B56]">→</span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#006B56]">
              🌿 Personal Time
            </span>
          </div>
        </div>

        {/* Right: Decompression Button */}
        <div className="shrink-0 self-end md:self-center">
          <motion.button
            onClick={onStartDecompression}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-full bg-[#006B56] text-white font-heading font-bold text-xs sm:text-sm shadow-md hover:bg-[#2A9D8F] transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Start Decompression</span>
            <span className="material-symbols-outlined text-sm">spa</span>
          </motion.button>
        </div>
      </div>
    </motion.section>
  );
}
