"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AICompanionPresenceCard() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/ai-chat")}
      className="rounded-[28px] bg-gradient-to-br from-[#16122C] via-[#211840] to-[#120F24] border border-purple-500/20 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.18)] text-white flex flex-col justify-between min-h-[280px] relative overflow-hidden cursor-pointer group hover:border-purple-400/40 transition-all duration-300 select-none"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-[#7C6BC4]/20 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="space-y-1 relative z-10 max-w-[280px]">
        <div className="flex items-center gap-1.5 text-purple-300 text-xs">
          <span>✨</span>
          <span className="font-heading font-bold text-[10px] uppercase tracking-wider">Sanctuary Presence</span>
        </div>
        <h3 className="text-base sm:text-lg font-heading font-black text-white leading-snug">
          Need to get something off your mind?
        </h3>
        <p className="text-xs text-purple-200/80 font-normal leading-relaxed">
          Your AI Companion is here — no judgment, no pressure.
        </p>
      </div>

      {/* Center Right Glowing Breathing Moon / AI Orb */}
      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center pointer-events-none">
        {/* Outer Breathing Aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#5F4EA5] via-[#8B7BD8] to-[#D4CAFD] blur-xl"
        />

        {/* 3D Purple Moon with Soft Sleeping Expression */}
        <motion.div
          animate={{
            y: [0, -4, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#7C6BC4] via-[#9F91EE] to-[#E3DCFD] shadow-[0_8px_25px_rgba(124,107,196,0.4)] flex items-center justify-center"
        >
          {/* Subtle sleeping face features */}
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Soft closed eyes */}
            <div className="flex items-center gap-2.5 -mt-1">
              <svg width="10" height="6" viewBox="0 0 10 6">
                <path d="M 1 1 Q 5 5 9 1" stroke="#372A70" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
              <svg width="10" height="6" viewBox="0 0 10 6">
                <path d="M 1 1 Q 5 5 9 1" stroke="#372A70" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>
            {/* Gentle smile */}
            <div className="mt-1">
              <svg width="8" height="4" viewBox="0 0 8 4">
                <path d="M 1 1 Q 4 3.5 7 1" stroke="#372A70" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Action & Footer */}
      <div className="space-y-3 relative z-10 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/ai-chat");
          }}
          className="px-5 py-2.5 rounded-full bg-white hover:bg-purple-50 text-[#1D192B] font-heading font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Talk to someone who listens</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </motion.button>

        <div className="flex items-center gap-2 text-[10px] text-purple-300/80 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Available 24/7 • Anonymous &amp; Private</span>
        </div>
      </div>
    </div>
  );
}
