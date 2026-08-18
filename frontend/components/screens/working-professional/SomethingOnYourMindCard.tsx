"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SomethingOnYourMindCard() {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push("/ai-chat")}
      className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[300px] space-y-4 cursor-pointer hover:border-purple-300 transition-all duration-300 group"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg text-[#5F4EA5]">✨</span>
          <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
            Something on your mind?
          </h3>
        </div>
        <p className="text-xs text-[#797582] font-normal">
          You don't have to carry it alone.
        </p>
      </div>

      {/* Center 3D Glowing Purple Sphere & Orbits */}
      <div className="relative w-full h-32 flex items-center justify-center pointer-events-none select-none">
        {/* Soft Background Radial Glow */}
        <div className="absolute w-28 h-28 rounded-full bg-[#E6DEFF] blur-2xl opacity-60" />

        {/* Orbit Ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute w-32 h-16 rounded-full border border-dashed border-[#7C6BC4]/40 transform -rotate-12"
        />

        {/* 3D Purple Orb */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#5F4EA5] via-[#8B7BD8] to-[#D4CAFD] shadow-[0_10px_30px_rgba(95,78,165,0.35)] flex items-center justify-center text-white"
        >
          {/* Subtle light reflection on sphere */}
          <div className="w-6 h-6 rounded-full bg-white/40 blur-[2px] -mt-6 -ml-6" />
        </motion.div>

        {/* Tiny Floating Sparkles */}
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1 right-12 w-2 h-2 rounded-full bg-[#7C6BC4]"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4], y: [0, 4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-2 left-14 w-1.5 h-1.5 rounded-full bg-[#5FCFB0]"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/ai-chat");
          }}
          className="px-6 py-2.5 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-xs hover:bg-[#7C6BC4] transition-all flex items-center gap-1.5 cursor-pointer group-hover:bg-[#7C6BC4]"
        >
          <span>Talk to Manraah</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </motion.button>
      </div>
    </div>
  );
}
