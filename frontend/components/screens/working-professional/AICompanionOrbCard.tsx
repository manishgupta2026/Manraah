"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface AICompanionOrbCardProps {
  todayMood?: any;
}

export default function AICompanionOrbCard({ todayMood }: AICompanionOrbCardProps) {
  const router = useRouter();

  const getDynamicPrompt = () => {
    if (todayMood) {
      const m = todayMood.mood?.toLowerCase();
      if (m === "stressed" || m === "overwhelmed") {
        return "I noticed you felt some pressure today. Let's unpack the weight together so you can rest freely.";
      }
      if (m === "drained") {
        return "Low energy days happen. No problem-solving required — just a quiet space to be heard.";
      }
      return `Glad you checked in feeling ${todayMood.mood}. Want to reflect on what went well or chat about tomorrow?`;
    }
    return "Whether it's meeting tension, workload overwhelm, or finding boundaries — your sanctuary is ready to listen.";
  };

  return (
    <div
      onClick={() => router.push("/ai-chat")}
      className="rounded-[32px] bg-gradient-to-br from-[#FAF7FF] via-[#F4EEFF] to-[#EAE0FC] border border-purple-200/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-[#E6DEFF] blur-3xl pointer-events-none opacity-70" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Something on your mind?
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F4EA5] bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200/60">
            24/7 AI Companion
          </span>
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          You don't have to carry it alone.
        </p>
      </div>

      {/* Center Animated Orb & Contextual Prompt */}
      <div className="py-4 flex flex-col sm:flex-row items-center gap-5 relative z-10">
        {/* Soft Glowing Pulsing Orb (No generic robot!) */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          {/* Outer Pulsing Glow Ring */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C6BC4]/40 to-[#5FCFB0]/40 blur-xl"
          />

          {/* Secondary Breathing Ring */}
          <motion.div
            animate={{
              scale: [1.1, 0.95, 1.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-1 rounded-full border border-dashed border-[#5F4EA5]/30"
          />

          {/* Primary Gradient Glowing Orb */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              y: [0, -3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#88F7D6] shadow-[0_8px_25px_rgba(95,78,165,0.35)] flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-2xl filter drop-shadow-sm">spa</span>
          </motion.div>
        </div>

        {/* Message Bubble */}
        <div className="space-y-1.5 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-[#1D192B] font-medium leading-relaxed italic bg-white/70 backdrop-blur-sm p-3.5 rounded-2xl border border-purple-100/70 shadow-xs">
            "{getDynamicPrompt()}"
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2 flex items-center justify-between border-t border-purple-100/60 relative z-10">
        <span className="text-[11px] text-[#797582] font-semibold">
          🔒 Private & Confidential
        </span>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/ai-chat");
          }}
          className="px-5 py-2 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-sm hover:bg-[#7C6BC4] transition-all flex items-center gap-1.5 group-hover:bg-[#7C6BC4] cursor-pointer"
        >
          <span>Talk to Manraah</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </motion.button>
      </div>
    </div>
  );
}
