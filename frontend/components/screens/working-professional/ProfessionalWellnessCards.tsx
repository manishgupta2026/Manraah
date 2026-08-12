"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProfessionalWellnessCardsProps {
  onCheckinClick: () => void;
}

export default function ProfessionalWellnessCards({
  onCheckinClick,
}: ProfessionalWellnessCardsProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* CARD 1: Workload Check */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={onCheckinClick}
        className="group relative rounded-[28px] bg-white/80 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] hover:shadow-md hover:border-[#7C6BC4]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
      >
        <div className="space-y-3">
          {/* Top Bar: Icon + Indicator */}
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#5F4EA5] border border-purple-100 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
              💼
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#797582] bg-[#F7F1FF] px-2.5 py-1 rounded-full border border-purple-100">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5F4EA5]" />
              <span>Moderate</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-heading font-black text-[#1D192B] group-hover:text-[#5F4EA5] transition-colors">
              Workload Check
            </h4>
            <p className="text-xs text-[#484551] font-normal leading-relaxed">
              How heavy has work felt lately? Take a moment to log your pace.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 flex items-center gap-1 text-xs font-heading font-bold text-[#5F4EA5]">
          <span>Check in</span>
          <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </div>
      </motion.div>

      {/* CARD 2: Career & Balance */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={() => router.push("/journal")}
        className="group relative rounded-[28px] bg-white/80 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] hover:shadow-md hover:border-emerald-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#006B56] border border-emerald-100 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
              🧭
            </div>
            <span className="text-[10px] font-bold text-[#006B56] bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-200">
              Boundaries
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-heading font-black text-[#1D192B] group-hover:text-[#006B56] transition-colors">
              Career & Balance
            </h4>
            <p className="text-xs text-[#484551] font-normal leading-relaxed">
              Make space for what matters outside work. Reflect on personal renewal.
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-1 text-xs font-heading font-bold text-[#006B56]">
          <span>Reflect</span>
          <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </div>
      </motion.div>

      {/* CARD 3: Sleep & Recovery */}
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={() => router.push("/sleep")}
        className="group relative rounded-[28px] bg-white/80 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#7C6BC4] border border-indigo-100 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
              🌙
            </div>
            <span className="text-[10px] font-bold text-[#7C6BC4] bg-indigo-50/80 px-2.5 py-1 rounded-full border border-indigo-200">
              Restoration
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-heading font-black text-[#1D192B] group-hover:text-[#7C6BC4] transition-colors">
              Sleep & Recovery
            </h4>
            <p className="text-xs text-[#484551] font-normal leading-relaxed">
              Give your mind permission to switch off tonight and wake up refreshed.
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-1 text-xs font-heading font-bold text-[#7C6BC4]">
          <span>Wind down</span>
          <span className="material-symbols-outlined text-xs group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </div>
      </motion.div>
    </div>
  );
}
