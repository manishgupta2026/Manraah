"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AICompanionCard() {
  const router = useRouter();

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      onClick={() => router.push("/ai-chat")}
      className="relative rounded-[32px] bg-gradient-to-br from-[#FAF8FF] via-[#F4EDFE] to-[#EAE0FC] border border-[#E6DEFF]/80 p-7 sm:p-9 shadow-[0_8px_30px_rgba(95,78,165,0.03)] overflow-hidden cursor-pointer hover:shadow-md transition-all duration-300 group"
    >
      {/* Background Soft Lavender Ambient Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E6DEFF] blur-3xl pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        {/* Left: Conversational Message */}
        <div className="space-y-3 max-w-lg text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-[#5F4EA5] bg-white/80 border border-[#E6DEFF] shadow-xs">
            <span>💬</span>
            <span>24/7 Empathetic Space</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-black text-[#1D192B] leading-snug">
            Need to get something off your mind?
          </h3>

          <p className="text-xs sm:text-sm text-[#484551] font-normal leading-relaxed">
            Your AI Companion is here — no judgment, no pressure. Whether you're processing meeting fatigue, career crossroads, or simply need a grounded space to vent.
          </p>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                router.push("/ai-chat");
              }}
              className="px-6 py-3 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs sm:text-sm shadow-md hover:bg-[#7C6BC4] transition-all flex items-center gap-2 cursor-pointer mx-auto md:mx-0"
            >
              <span>Talk to someone who listens →</span>
            </motion.button>
          </div>
        </div>

        {/* Right: Subtle Breathing Orb Visualization */}
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 shrink-0 flex items-center justify-center pointer-events-none select-none">
          {/* Outer Breathing Blur */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C6BC4]/40 to-[#5FCFB0]/40 blur-2xl"
          />

          {/* Middle Dashed Orbit Ring */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-2 rounded-full border border-dashed border-[#5F4EA5]/25"
          />

          {/* Center Smooth Glowing Orb */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#88F7D6] shadow-[0_10px_30px_rgba(95,78,165,0.3)] flex items-center justify-center text-white text-3xl"
          >
            <span className="material-symbols-outlined text-3xl sm:text-4xl filter drop-shadow-sm">spa</span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
