"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const LEAF_PARTICLES = [
  { id: 1, left: 12, delay: 0, duration: 22 },
  { id: 2, left: 34, delay: 4, duration: 18 },
  { id: 3, left: 52, delay: 1.5, duration: 25 },
  { id: 4, left: 78, delay: 6, duration: 20 },
  { id: 5, left: 88, delay: 3, duration: 24 },
];

const THEMES = {
  morning: {
    bgGradient: "from-[#FFFDF4] via-[#FFEADB] to-[#ECE5F5]",
    glowColor: "bg-amber-100/30",
    themeEmoji: "☀️",
    skyColor: "#FFEADB",
  },
  afternoon: {
    bgGradient: "from-[#F2F4FD] via-[#ECE6F6] to-[#FCE6EC]",
    glowColor: "bg-primary-container/20",
    themeEmoji: "🍃",
    skyColor: "#ECE6F6",
  },
  evening: {
    bgGradient: "from-[#FFF4E4] via-[#FDE4EB] to-[#ECE7F6]",
    glowColor: "bg-orange-200/20",
    themeEmoji: "🌸",
    skyColor: "#FDE4EB",
  },
  night: {
    bgGradient: "from-[#0A0D1A] via-[#12192D] to-[#211B3E]",
    glowColor: "bg-indigo-300/10",
    themeEmoji: "🌙",
    skyColor: "#12192D",
  },
};

export default function WelcomeFlow() {
  const router = useRouter();
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("evening");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
    else if (hour >= 17 && hour < 21) setTimeOfDay("evening");
    else setTimeOfDay("night");
  }, []);

  const currentTheme = THEMES[timeOfDay];
  const isNight = timeOfDay === "night";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 85, damping: 14 },
    },
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-gradient-to-b ${currentTheme.bgGradient} transition-colors duration-1000 select-none`}
    >
      {/* Floating Animated Leaf/Petal Particles in Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {LEAF_PARTICLES.map((leaf) => (
          <motion.span
            key={leaf.id}
            initial={{ y: "105vh", opacity: 0, rotate: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, 0.45, 0.45, 0],
              rotate: 360,
              x: [0, 35, -35, 0],
            }}
            transition={{
              duration: leaf.duration,
              repeat: Infinity,
              delay: leaf.delay,
              ease: "linear",
            }}
            className="absolute text-emerald-600/15 text-lg select-none pointer-events-none"
            style={{ left: `${leaf.left}%` }}
          >
            {leaf.id % 2 === 0 ? "🍃" : "🌸"}
          </motion.span>
        ))}
      </div>

      {/* Dynamic Glow Blurs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-[10%] right-[10%] w-[320px] h-[320px] md:w-[480px] md:h-[480px] rounded-full blur-[100px] md:blur-[140px] opacity-40 ${currentTheme.glowColor}`}
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[10%] w-[280px] h-[280px] md:w-[420px] md:h-[420px] rounded-full bg-secondary-container/10 blur-[90px] md:blur-[120px] opacity-30"
        />
      </div>

      {/* Premium Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-2xl font-bold select-none pointer-events-none">spa</span>
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-base text-primary tracking-tight leading-none">Manraah</h1>
            <p className="text-[8px] text-on-surface-variant/75 font-bold uppercase tracking-wider mt-0.5">Sanctuary for Mind</p>
          </div>
        </div>

        <Link
          href="/login"
          className="px-6 py-2 rounded-full bg-white/45 hover:bg-primary/10 border border-[#7C6BC4]/20 backdrop-blur-md text-primary font-heading font-bold text-xs shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
        >
          Login
        </Link>
      </header>

      {/* Hero & Content Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-16 flex flex-col justify-center z-10 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <motion.div variants={itemVariants} className="space-y-4">
              <span className="px-3.5 py-1.5 rounded-full text-[10px] font-heading font-bold tracking-widest bg-primary-container/10 text-primary border border-[#7C6BC4]/20 uppercase w-fit inline-block">
                🌿 Mindful Mental Space
              </span>
              <h2 className={`text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.1] ${isNight ? "text-slate-100" : "text-on-surface"}`}>
                Your Personal Sanctuary <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#7C6BC4]">
                  for a Healthier Mind
                </span>
              </h2>
              <p className={`text-sm md:text-base leading-relaxed font-normal max-w-xl ${isNight ? "text-slate-300" : "text-on-surface-variant/90"}`}>
                A private, compassionate space where AI gently helps you understand your emotions, build healthier habits, and grow at your own pace.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={() => router.push("/category-selection")}
                className="w-full sm:w-auto px-9 py-4 rounded-full bg-primary hover:bg-[#7C6BC4] text-white font-heading font-bold text-sm shadow-[0_10px_25px_rgba(95,78,165,0.25)] hover:shadow-[0_12px_30px_rgba(95,78,165,0.35)] hover:-translate-y-0.5 active:scale-97 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🌿 Get Started</span>
              </button>
              <Link
                href="/login"
                className={`w-full sm:w-auto text-center px-9 py-4 rounded-full bg-white/45 border border-[#7C6BC4]/20 font-heading font-semibold text-sm hover:-translate-y-0.5 active:scale-97 transition-all duration-300 ${isNight ? "text-slate-200 hover:bg-white/10" : "text-on-surface-variant hover:bg-primary/5"}`}
              >
                Log In
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Scenic Landscape Illustration */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex items-center justify-center relative"
          >
            <div className="w-full max-w-[340px] md:max-w-[400px]">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full select-none pointer-events-none drop-shadow-xl"
              >
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isNight ? "#1C1D3B" : "#F2EEFC"} />
                    <stop offset="100%" stopColor={isNight ? "#080914" : "#FDF7FF"} />
                  </linearGradient>
                  <linearGradient id="mountainGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#5F4EA5" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="mountainGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8F7FD8" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#251E52" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Sky circle */}
                <circle cx="200" cy="200" r="180" fill="url(#skyGrad)" />

                {/* Sun or Moon depending on time of day */}
                {isNight ? (
                  <motion.path
                    d="M240 120 A 40 40 0 1 1 200 160 A 30 30 0 1 0 240 120"
                    fill="#FEF3C7"
                    animate={{ y: [0, -4, 0], scale: [1, 1.04, 1] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <motion.circle
                    cx="240"
                    cy="140"
                    r="28"
                    fill="#FDBA74"
                    opacity="0.8"
                    animate={{ scale: [1, 1.08, 1], y: [0, -3, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Stars in night sky */}
                {isNight &&
                  [
                    { cx: 90, cy: 110, r: 1.5, delay: 0 },
                    { cx: 130, cy: 80, r: 2, delay: 1.5 },
                    { cx: 280, cy: 100, r: 1, delay: 0.8 },
                    { cx: 160, cy: 140, r: 1.5, delay: 2.2 },
                    { cx: 310, cy: 150, r: 2.5, delay: 1.1 },
                  ].map((star, idx) => (
                    <motion.circle
                      key={idx}
                      cx={star.cx}
                      cy={star.cy}
                      r={star.r}
                      fill="#ffffff"
                      animate={{ opacity: [0.35, 1, 0.35] }}
                      transition={{ duration: 3, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
                    />
                  ))}

                {/* Faint Mountains (back) */}
                <path d="M 50 350 L 150 210 L 250 350 Z" fill="url(#mountainGrad1)" />

                {/* Faint Mountains (front) */}
                <path d="M 120 350 L 240 170 L 350 350 Z" fill="url(#mountainGrad2)" />

                {/* Water / Lake reflection */}
                <ellipse cx="200" cy="340" rx="140" ry="24" fill="#F2EBFF" opacity="0.3" />

                {/* Slowly blooming Lotus */}
                <motion.g
                  transform="translate(160, 290) scale(0.8)"
                  animate={{ scale: [0.76, 0.83, 0.76], rotate: [-0.8, 0.8, -0.8] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M 50 80 C 10 70, 0 40, 50 10 C 60 40, 50 70, 50 80 Z" fill="#F4A6B8" opacity="0.75" />
                  <path d="M 50 80 C 90 70, 100 40, 50 10 C 40 40, 50 70, 50 80 Z" fill="#F4A6B8" opacity="0.75" />
                  <path d="M 50 80 C 25 50, 25 20, 50 0 C 75 20, 75 50, 50 80 Z" fill="#7C6BC4" opacity="0.9" />
                  <path d="M 50 80 C 35 60, 35 40, 50 20 C 65 40, 65 60, 50 80 Z" fill="#FEF3C7" opacity="0.9" />
                </motion.g>
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Microcopy Trust Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 lg:mt-24 w-full"
        >
          {[
            {
              icon: "lock",
              title: "End-to-End Encrypted",
              desc: "100% private data layers",
              color: "bg-mint/15 text-[#006B56] border-mint/30",
            },
            {
              icon: "visibility_off",
              title: "Anonymous Sanctuary Identity",
              desc: "No real-name check required",
              color: "bg-primary-container/10 text-primary border-[#7C6BC4]/20",
            },
            {
              icon: "diversity_1",
              title: "AI + Human Support",
              desc: "Empathy-driven peer listening",
              color: "bg-peach/20 text-tertiary border-peach/30",
            },
            {
              icon: "psychology",
              title: "Evidence-Based Wellness",
              desc: "Clinical science backed tools",
              color: "bg-pink/20 text-[#874959] border-pink/30",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="p-5 rounded-[28px] bg-white/45 backdrop-blur-md border border-white/40 shadow-soft-sm flex flex-col justify-between h-40 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.color.split(" ")[0]} ${
                  card.color.split(" ")[1]
                } border ${card.color.split(" ")[2]}`}
              >
                <span className="material-symbols-outlined text-xl font-bold select-none">{card.icon}</span>
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-heading font-black text-on-surface">{card.title}</h4>
                <p className="text-[10px] text-on-surface-variant font-semibold opacity-80 leading-tight">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
