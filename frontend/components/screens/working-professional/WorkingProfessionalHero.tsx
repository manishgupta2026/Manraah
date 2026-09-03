"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface WorkingProfessionalHeroProps {
  sanctuaryName: string;
  streakDays: number;
  onOpenReset: () => void;
  onOpenAI: () => void;
  isAmbientMode: boolean;
  onToggleAmbient: () => void;
  todayMood?: string | null;
  stress?: string | null;
  energy?: number | null;
  justCompletedReset?: boolean;
}

export default function WorkingProfessionalHero({
  sanctuaryName,
  streakDays,
  onOpenReset,
  onOpenAI,
  isAmbientMode,
  onToggleAmbient,
  todayMood,
  stress,
  energy,
  justCompletedReset = false,
}: WorkingProfessionalHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [resetFinishedRecently, setResetFinishedRecently] = useState(false);

  // Check for touch device on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  // Handle post-reset feedback
  useEffect(() => {
    if (justCompletedReset) {
      setResetFinishedRecently(true);
      const timer = setTimeout(() => setResetFinishedRecently(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [justCompletedReset]);

  // Subtle Mouse Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 28, stiffness: 180 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const illustrationX = useTransform(smoothX, [-300, 300], [-3, 3]);
  const illustrationY = useTransform(smoothY, [-200, 200], [-3, 3]);
  const glowX = useTransform(smoothX, [-300, 300], [6, -6]);
  const glowY = useTransform(smoothY, [-200, 200], [6, -6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Time-aware greeting & ambient mood
  const getHour = () => new Date().getHours();
  const hour = getHour();

  const getTimeDetails = () => {
    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning",
        icon: "🌿",
        bgClass: "from-[#FCFAFE] via-[#F4EDFC] to-[#EAE0F8]",
        glow1: "#E4D9FA",
        glow2: "#D2F5EC",
      };
    }
    if (hour >= 12 && hour < 17) {
      return {
        greeting: "Good afternoon",
        icon: "🌿",
        bgClass: "from-[#FBF8FE] via-[#F3ECFB] to-[#E8DEF7]",
        glow1: "#E8DDFB",
        glow2: "#CEF3E9",
      };
    }
    if (hour >= 17 && hour < 22) {
      return {
        greeting: "Good evening",
        icon: "🌿",
        bgClass: "from-[#FAF6FE] via-[#F1E8FA] to-[#E5D7F7]",
        glow1: "#E2D3FA",
        glow2: "#C5EFE5",
      };
    }
    return {
      greeting: "Good night",
      icon: "🌙",
      bgClass: "from-[#F8F3FD] via-[#EDE0F8] to-[#DFCFF5]",
      glow1: "#DDD0F7",
      glow2: "#C8E8E0",
    };
  };

  const timeDetails = getTimeDetails();
  const displayName = sanctuaryName || "Member";

  const getTodayFormatted = () => {
    const d = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  };

  // Dynamic supportive message based on user check-in state
  const getDynamicSubtitle = () => {
    if (resetFinishedRecently) {
      return "Nice work. You gave yourself a little space today.";
    }
    const m = (todayMood || "").toLowerCase();
    const s = (stress || "").toLowerCase();

    if (m === "overwhelmed" || s === "overwhelming" || s === "very high") {
      return "Today felt heavy. Give yourself a little room to breathe.";
    }
    if (m === "stressed" || s === "stressful" || s === "high") {
      return "Work has been demanding. Leave the pressure at your doorway.";
    }
    if (m === "drained" || (energy && energy <= 2)) {
      return "You don't need to do everything tonight. Start with one breath.";
    }
    if (m === "good" || m === "joyful" || (energy && energy >= 4)) {
      return "You're carrying good energy today. Keep some of it for yourself.";
    }
    return "Work can wait. Your mind doesn't have to.";
  };

  const getDynamicDescription = () => {
    if (resetFinishedRecently) {
      return "Your mind is a little clearer now. Enjoy this quiet space for the rest of your evening.";
    }
    const m = (todayMood || "").toLowerCase();
    if (m === "drained" || m === "overwhelmed") {
      return "You've made it through a demanding day. Slow down, breathe softly, and let the rest wait.";
    }
    return "You've made it through enough today. Take a moment to slow down, breathe, and come back to yourself.";
  };

  return (
    <motion.section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-[36px] overflow-hidden border border-purple-100/70 dark:border-purple-500/20 p-8 sm:p-10 lg:p-11 min-h-[350px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_12px_45px_rgba(95,78,165,0.04)] bg-gradient-to-r ${timeDetails.bgClass} text-[#231E39] select-none`}
    >
      {/* 1. Extremely Subtle Animated Breathing Background */}
      <motion.div
        animate={{
          opacity: [0.85, 1, 0.85],
          scale: [1, 1.015, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-purple-100/30 pointer-events-none"
      />

      {/* 2. Slow Floating Light/Atmosphere Glows with Micro Parallax */}
      <motion.div
        style={{ x: isTouchDevice ? 0 : glowX, y: isTouchDevice ? 0 : glowY }}
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      >
        <motion.div
          animate={{
            scale: [1, 1.14, 1],
            x: [0, 18, 0],
            y: [0, -12, 0],
            opacity: [0.35, 0.52, 0.35],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-[480px] h-[480px] rounded-full blur-3xl"
          style={{ backgroundColor: timeDetails.glow1 }}
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            x: [0, -16, 0],
            y: [0, 14, 0],
            opacity: [0.25, 0.42, 0.25],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl"
          style={{ backgroundColor: timeDetails.glow2 }}
        />
      </motion.div>

      {/* 3. Left Content Area with Staggered Entrance */}
      <div className="relative z-10 max-w-xl space-y-4">
        {/* Soft Contextual Pills (0.1s delay) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-medium backdrop-blur-md border shadow-2xs bg-white/90 text-[#6351A5] border-purple-100/70">
            <span className="text-[10px]">📅</span>
            <span>{getTodayFormatted()}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-medium backdrop-blur-md border shadow-2xs bg-white/90 text-[#B45309] border-amber-100/60">
            <span className="text-[10px]">🔥</span>
            <span>{streakDays}-day sanctuary streak</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-heading font-medium backdrop-blur-md border shadow-2xs bg-white/90 text-[#534F64] border-purple-100/70">
            <span className="text-[10px]">💼</span>
            <span>Working Professional</span>
          </span>
        </motion.div>

        {/* Headings with Shimmering Name (0.2s - 0.45s delays) */}
        <div className="space-y-1.5 pt-1">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
            className="text-2xl sm:text-3xl lg:text-[34px] font-heading font-extrabold tracking-tight leading-tight text-[#231E39]"
          >
            {timeDetails.greeting},<br />
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#6351A5] via-[#8B7BD8] to-[#6351A5] bg-[length:200%_auto] animate-pulse">
              {displayName}
            </span>{" "}
            {timeDetails.icon}
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35, ease: "easeOut" }}
            className="text-sm sm:text-base font-heading font-bold pt-1 text-[#231E39]"
          >
            {getDynamicSubtitle()}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: "easeOut" }}
            className="text-xs sm:text-sm text-[#534F64] font-normal leading-relaxed max-w-md pt-0.5"
          >
            {getDynamicDescription()}
          </motion.p>
        </div>

        {/* 4. Action Buttons with Micro-Interactions (0.55s delay) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.55, ease: "easeOut" }}
          className="pt-3 flex flex-wrap items-center gap-3"
        >
          {/* Take a 2-Minute Reset */}
          <motion.button
            onClick={onOpenReset}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={`px-6 py-2.5 rounded-full text-white font-heading font-semibold text-xs sm:text-sm shadow-[0_4px_16px_rgba(99,81,165,0.2)] transition-all flex items-center gap-2 cursor-pointer group ${
              resetFinishedRecently
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-[#6351A5] hover:bg-[#7360B8]"
            }`}
          >
            <span>
              {resetFinishedRecently ? "✓ Reset Complete" : "🌿 Take a 2-Minute Reset"}
            </span>
            <span className="transform transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </motion.button>

          {/* Talk to AI Companion */}
          <motion.button
            onClick={onOpenAI}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-full font-heading font-semibold text-xs sm:text-sm shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border bg-white/95 hover:bg-white hover:border-purple-300 text-[#6351A5] border-purple-200/70 group"
          >
            <span>✨ Talk to AI Companion</span>
            <span className="transform transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </motion.button>

          {/* Play Ambient Rain Toggle */}
          <motion.button
            onClick={onToggleAmbient}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            aria-label={
              isAmbientMode
                ? "Stop ambient rain sound and visuals"
                : "Play ambient rain sound and visuals"
            }
            className={`px-4 py-2.5 rounded-full font-heading font-medium text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border relative overflow-hidden ${
              isAmbientMode
                ? "bg-[#6351A5] text-white border-purple-300 shadow-[0_2px_12px_rgba(99,81,165,0.25)]"
                : "bg-white/80 hover:bg-white text-[#534F64] border-purple-100/80"
            }`}
          >
            {isAmbientMode && (
              <motion.span
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white/15 pointer-events-none"
              />
            )}
            <span>{isAmbientMode ? "⏸ Stop ambient" : "▶ Play ambient"}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* 5. Right Artwork Illustration with Gentle Floating & Subtle Atmospheric Drift */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        style={{
          x: isTouchDevice ? 0 : illustrationX,
          y: isTouchDevice ? 0 : illustrationY,
        }}
        className="relative shrink-0 w-64 sm:w-80 lg:w-[370px] h-60 sm:h-72 lg:h-76 z-10 flex items-center justify-center pointer-events-none"
      >
        {/* Soft shadow/glow behind the illustration */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-52 h-52 rounded-full bg-purple-300/30 blur-2xl -z-10"
        />

        {/* Floating Living Artwork */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-full h-full flex items-center justify-center select-none"
        >
          <img
            src="/category/Working.png"
            alt="Working Professional Sanctuary"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(99,81,165,0.12)] rounded-2xl select-none pointer-events-none"
          />

          {/* Atmospheric Leaves / Soft Light Particles drifting around illustration */}
          <motion.div
            animate={{
              x: [0, 14, 0],
              y: [0, -10, 0],
              rotate: [0, 15, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-6 left-6 text-xs text-[#6351A5]/60 pointer-events-none"
          >
            🌿
          </motion.div>

          <motion.div
            animate={{
              x: [0, -12, 0],
              y: [0, 12, 0],
              rotate: [0, -12, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-8 right-6 text-[10px] text-teal-600/50 pointer-events-none"
          >
            🌱
          </motion.div>

          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.25, 0.6, 0.25],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-12 right-12 w-2 h-2 rounded-full bg-amber-300/60 blur-[1px] pointer-events-none"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
