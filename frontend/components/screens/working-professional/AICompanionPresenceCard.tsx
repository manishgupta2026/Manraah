"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AICompanionPresenceCard() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/ai-chat")}
      className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 shadow-[0_8px_30px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[240px] relative overflow-hidden cursor-pointer group hover:border-purple-200 transition-all duration-300 select-none"
    >
      {/* Top Header */}
      <div className="space-y-1 relative z-10 max-w-[210px]">
        <div className="flex items-center gap-1.5 text-[#6351A5] dark:text-purple-300 text-xs">
          <span>✨</span>
          <span className="font-heading font-bold text-[10px] uppercase tracking-wider">AI Companion</span>
        </div>
        <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#231E39] dark:text-white leading-snug">
          Need to get something off your mind?
        </h3>
        <p className="text-[11px] text-[#746F89] dark:text-purple-200/70 font-normal leading-relaxed">
          Your AI Companion is here — no judgment, no pressure.
        </p>
      </div>

      {/* Right 3D Glowing Breathing Purple Orb & Orbit Ring */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-28 h-28 flex items-center justify-center pointer-events-none">
        {/* Soft Background Radial Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.55, 0.3],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 rounded-full bg-[#E6DEFF] dark:bg-purple-900/30 blur-xl"
        />

        {/* Orbit Ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-14 rounded-full border border-dashed border-[#7C6BC4]/30 transform -rotate-12"
        />

        {/* 3D Purple Orb */}
        <motion.div
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.04, 1],
          }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6351A5] via-[#8B7BD8] to-[#D8CCFD] shadow-[0_8px_25px_rgba(99,81,165,0.25)] flex items-center justify-center text-white"
        >
          {/* Subtle light reflection on sphere */}
          <div className="w-4 h-4 rounded-full bg-white/40 blur-[1px] -mt-5 -ml-5" />
        </motion.div>
      </div>

      {/* Action Button */}
      <div className="pt-3 relative z-10">
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/ai-chat");
          }}
          className="px-5 py-2.5 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs shadow-[0_3px_12px_rgba(99,81,165,0.18)] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Talk to someone who listens →</span>
        </motion.button>
      </div>
    </div>
  );
}
