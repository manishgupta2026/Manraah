"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/frontend/lib/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[62px] h-[32px] rounded-full bg-purple-50/80 dark:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/30 flex items-center justify-between px-1.5 opacity-50" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative w-[62px] h-[32px] rounded-full bg-[#FAF8FE] dark:bg-[#1E1933]/90 border border-purple-200/60 dark:border-purple-500/20 flex items-center justify-between px-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-shadow focus:outline-none focus:ring-2 focus:ring-[#6251a8]/40 select-none overflow-hidden shrink-0"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="text-xs relative z-10 select-none">☀️</span>
      
      {/* Animated toggle circle */}
      <motion.div
        layout
        transition={reducedMotion ? { type: "tween", duration: 0.1 } : {
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        animate={{ x: isDark ? 28 : 0 }}
        className="absolute left-[3px] w-[24px] h-[24px] rounded-full bg-gradient-to-br from-[#7C6BC4] to-[#5F4EA5] shadow-sm pointer-events-none flex items-center justify-center"
      >
        {/* Subtle micro-rotation indicator */}
        <motion.span
          animate={reducedMotion ? {} : { rotate: isDark ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="text-[10px] text-white font-bold select-none"
        >
          ✦
        </motion.span>
      </motion.div>

      <span className="text-xs relative z-10 select-none">🌙</span>
    </button>
  );
}
