"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import ParentDashboard from "@/parent/Research/Documentation/Dashboard Planning/AI Knowledge/Feature Documentation/Development/ParentDashboard";

interface TimeTheme {
  greeting: string;
  subtitle: string;
  bgGradient: string;
  glowColor: string;
  icon: string;
  particles: string[];
}

const THEMES: Record<string, TimeTheme> = {
  morning: {
    greeting: "Good Morning",
    subtitle: "Breathe in clarity, release today's expectations.",
    bgGradient: "from-[#FFF5E6] via-[#F4E3E5] to-[#E3ECF5]",
    glowColor: "bg-amber-300/10",
    icon: "🌅",
    particles: ["✨", "☀️", "🌸"],
  },
  afternoon: {
    greeting: "Good Afternoon",
    subtitle: "Find a quiet moment. Take a slow, steady breath.",
    bgGradient: "from-[#E6F4EA] via-[#EDF3FD] to-[#F1F3FB]",
    glowColor: "bg-emerald-300/10",
    icon: "🍃",
    particles: ["🍃", "✨", "🌸"],
  },
  evening: {
    greeting: "Good Evening",
    subtitle: "The day is winding down. Let go of whatever is behind you.",
    bgGradient: "from-[#FCE4EC] via-[#F3E5F5] to-[#EDE7F6]",
    glowColor: "bg-indigo-300/15",
    icon: "🌿",
    particles: ["🍂", "✨", "🌸"],
  },
  night: {
    greeting: "Good Night",
    subtitle: "The stars are quiet. Allow your body to rest in safety.",
    bgGradient: "from-[#0F172A] via-[#1E1B4B] to-[#312E81]",
    glowColor: "bg-[#7C6BC4]/20",
    icon: "🌌",
    particles: ["⭐", "✨", "🌙"],
  },
};

// Container variants for staggered entrance animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 12 } },
};

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-4 px-4 space-y-8 animate-pulse select-none">
      {/* Hero row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 h-[240px] rounded-[32px] bg-surface-container-low" />
        <div className="col-span-1 md:col-span-4 h-[240px] rounded-[32px] bg-surface-container-low" />
      </div>
      {/* Widgets row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-4 h-[220px] rounded-[36px] bg-surface-container-low" />
        <div className="col-span-1 md:col-span-4 h-[220px] rounded-[36px] bg-surface-container-low" />
        <div className="col-span-1 md:col-span-4 h-[220px] rounded-[36px] bg-surface-container-low" />
      </div>
      {/* Garden row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-8 h-[240px] rounded-[36px] bg-surface-container-low" />
        <div className="col-span-1 md:col-span-4 h-[240px] rounded-[36px] bg-surface-container-low" />
      </div>
      {/* Footer row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-1 md:col-span-4 h-[160px] rounded-[28px] bg-surface-container-low" />
        <div className="col-span-1 md:col-span-4 h-[160px] rounded-[28px] bg-surface-container-low" />
        <div className="col-span-1 md:col-span-4 h-[160px] rounded-[28px] bg-surface-container-low" />
      </div>
    </div>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardData, isLoading } = useWellness();
  const [themeKey, setThemeKey] = useState<"morning" | "afternoon" | "evening" | "night">("evening");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setThemeKey("morning");
    else if (hour >= 12 && hour < 17) setThemeKey("afternoon");
    else if (hour >= 17 && hour < 21) setThemeKey("evening");
    else setThemeKey("night");
  }, []);

  if (isLoading || !dashboardData) {
    return <DashboardSkeleton />;
  }

  const { user, todayMood, history, streak, recommendation, insights } = dashboardData;
  const name = user?.name || "Sanctuary Member";
  const category = user?.selectedCategory || "student";
  const totalCheckIns = history?.length || 0;

  const currentTheme = THEMES[themeKey];
  const isNight = themeKey === "night";

  const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      student: "Student",
      young_pro: "Young Professional",
      working_professional: "Working Professional",
      parent: "Mindful Parenting",
      couple: "Couples Harmony",
      family: "Family Unity",
      women: "Women's Wellness",
      men: "Men's Sanctum",
      senior_citizen: "Golden Serenity",
    };
    return map[cat] || cat;
  };

  const getGardenStage = (count: number) => {
    if (count <= 1) return { stage: "Seed 🌱", desc: "A tiny seed taking root.", color: "#10B981" };
    if (count <= 3) return { stage: "Sprout 🌿", desc: "A small sprout growing gently.", color: "#059669" };
    if (count <= 6) return { stage: "Leaf 🍃", desc: "Multiple leaves absorbing calm energy.", color: "#34D399" };
    if (count <= 10) return { stage: "Flower 🌸", desc: "A lovely blossom beginning to unfold.", color: "#EC4899" };
    if (count <= 15) return { stage: "Tree 🌳", desc: "A strong, deep-rooted sanctuary tree.", color: "#047857" };
    if (count <= 21) return { stage: "Sanctuary Garden 🏡", desc: "A serene clearing with beautiful plants.", color: "#4F46E5" };
    return { stage: "Forest 🌲", desc: "A lush, thriving forest of mindfulness.", color: "#065F46" };
  };

  const gardenStage = getGardenStage(totalCheckIns);

  // Dynamic Mood Trend Calculation
  const moodTrend = (() => {
    if (history.length === 0) return "Gathering calm logs...";
    const recentLogs = history.slice(0, 5);
    const amazingHappyCount = recentLogs.filter((h: any) =>
      ["amazing", "happy", "calm", "good"].includes(h.mood.toLowerCase())
    ).length;
    if (amazingHappyCount >= 3) {
      return "Emotional state feels light and steady 🌸";
    } else {
      return "Experiencing subtle mood fluctuations 🍃";
    }
  })();

  const oneInsight = insights?.[0]?.insightText || "Consistency leads to inner space and clarity.";

  // Dynamic AI Companion bubble context based on today's logs
  const aiCompanionBubble = (() => {
    if (todayMood) {
      return `Hello ${name} 🌿. I noticed you logged feeling ${todayMood.mood} with ${todayMood.energy}/10 energy today, focusing on your intention to "${todayMood.reflection || 'Be present'}". I'm here if you want to vent or stretch.`;
    }
    return `Welcome back, ${name} ✨. I'm here for you. You haven't checked in with today's mood yet. Shall we slow down and complete your log?`;
  })();

  if (category === "parent") {
    return <ParentDashboard />;
  }

  return (
    <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 space-y-6 relative select-none animate-fadeIn">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.25, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[100px] opacity-35 ${currentTheme.glowColor}`}
        />
      </div>

      {/* Responsive Grid layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-5 md:gap-6 z-10 relative"
      >
        
        {/* ROW 1: Hero Card (col-span-8) & AI Companion (col-span-4) */}
        
        {/* 1. Hero Card */}
        <motion.section
          variants={cardVariants}
          className={`col-span-1 sm:col-span-2 md:col-span-8 relative rounded-[32px] bg-gradient-to-tr ${currentTheme.bgGradient} p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-soft-xl border border-white/20`}
        >
          {/* Ambient particle loops */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [100, -100],
                  x: [Math.random() * 30, Math.random() * -30, Math.random() * 30],
                  opacity: [0, 0.8, 0],
                }}
                transition={{ duration: 12 + Math.random() * 8, repeat: Infinity, delay: i * 2 }}
                className="absolute text-lg"
                style={{ left: `${20 + i * 20}%`, bottom: 0 }}
              >
                {currentTheme.particles[i % currentTheme.particles.length]}
              </motion.div>
            ))}
          </div>

          <div className="space-y-4 z-10">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
              isNight ? "bg-white/10 text-white" : "bg-white/80 text-primary border border-primary/10"
            }`}>
              🌿 {getCategoryName(category)} Journey
            </span>
            <h1 className={`text-4xl font-heading font-black leading-tight tracking-tight ${isNight ? "text-white" : "text-on-surface"}`}>
              {currentTheme.greeting}, {name} {currentTheme.icon}
            </h1>
            <p className={`text-sm font-semibold max-w-lg leading-relaxed ${isNight ? "text-indigo-200/80" : "text-on-surface-variant/85"}`}>
              {currentTheme.subtitle}
            </p>
          </div>

          <div className="pt-6 z-10">
            <button
              onClick={() => router.push(todayMood ? "/mood-tracking" : "/mood-checkin")}
              className={`px-8 py-4 rounded-full font-bold text-xs shadow-md transition-all scale-102 hover:scale-105 active:scale-98 ${
                isNight ? "bg-white text-indigo-900" : "bg-primary text-white"
              }`}
            >
              {todayMood ? "View Analytics →" : "Continue Today's Journey"}
            </button>
          </div>
        </motion.section>

        {/* 2. AI Companion Widget */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/ai-chat")}
          className="col-span-1 sm:col-span-2 md:col-span-4 p-8 rounded-[36px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[260px]"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <span className="text-2xl">💙</span>
            </div>
            <h4 className="font-heading font-extrabold text-sm text-on-surface">AI Companion</h4>
            <AnimatePresence mode="wait">
              <motion.p
                key={aiCompanionBubble}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-xs text-on-surface-variant leading-relaxed font-semibold mt-2"
              >
                "{aiCompanionBubble}"
              </motion.p>
            </AnimatePresence>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest pt-2">
            Start Confidential Venting →
          </span>
        </motion.div>

        {/* ROW 2: Today's Check-in (col-4) & Mood Trend (col-4) & Today's Insight (col-4) */}
        
        {/* 3. Today's Check-in */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push(todayMood ? "/mood-tracking" : "/mood-checkin")}
          className="col-span-1 sm:col-span-1 md:col-span-4 p-8 rounded-[36px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <span className="text-3xl block mb-4">🌸</span>
            <h4 className="font-heading font-extrabold text-sm text-on-surface">Today's Check-in</h4>
            <AnimatePresence mode="wait">
              <motion.div
                key={todayMood ? todayMood.id : "empty"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xs text-on-surface-variant leading-relaxed font-medium mt-1"
              >
                {todayMood 
                  ? `Reflection complete. Logged feeling ${todayMood.mood} with ${todayMood.energy}/10 energy.`
                  : "Allocate two minutes to check in with your mind and map daily variables."}
              </motion.div>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            {todayMood ? (
              <motion.span
                key="completed-badge"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="inline-block px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-800 self-start"
              >
                Completed
              </motion.span>
            ) : (
              <motion.span
                key="log-reflection-prompt"
                className="text-[10px] font-bold text-primary uppercase tracking-widest"
              >
                Log reflection →
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 4. Mood Trend */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-1 sm:col-span-1 md:col-span-4 p-8 rounded-[36px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <h4 className="font-heading font-extrabold text-sm text-on-surface">Mood Trend</h4>
            <AnimatePresence mode="wait">
              <motion.p
                key={moodTrend}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="text-xs text-on-surface-variant leading-relaxed font-medium mt-1.5"
              >
                {moodTrend}
              </motion.p>
            </AnimatePresence>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            View timeline →
          </span>
        </motion.div>

        {/* 5. Today's Insight */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-1 sm:col-span-2 md:col-span-4 p-8 rounded-[36px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-2xl">insights</span>
            </div>
            <h4 className="font-heading font-extrabold text-sm text-on-surface">Today's Insight</h4>
            <AnimatePresence mode="wait">
              <motion.p
                key={oneInsight}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ ease: "easeOut", duration: 0.4 }}
                className="text-xs text-on-surface-variant leading-relaxed font-semibold mt-1.5"
              >
                "{oneInsight}"
              </motion.p>
            </AnimatePresence>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            View correlations →
          </span>
        </motion.div>

        {/* ROW 3: Sanctuary Garden (col-8) & Weekly Reflection (col-4) */}
        
        {/* 6. Sanctuary Garden */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-1 sm:col-span-2 md:col-span-8 p-8 rounded-[36px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg cursor-pointer grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[240px] items-center"
        >
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-[9px] font-black uppercase tracking-wider text-emerald-800">
              Sanctuary Garden
            </span>
            <AnimatePresence mode="wait">
              <motion.h3
                key={gardenStage.stage}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="text-2xl font-heading font-black text-on-surface"
              >
                {gardenStage.stage}
              </motion.h3>
            </AnimatePresence>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              {gardenStage.desc} You have logged **{totalCheckIns} reflections** total. Water your garden by checking in daily.
            </p>
          </div>

          {/* Styled growth SVG */}
          <div className="relative w-36 h-36 bg-surface-container-low rounded-full mx-auto flex items-end justify-center pb-3 overflow-hidden border border-surface-variant/20">
            <svg width="50" height="80" viewBox="0 0 60 90" fill="none">
              <ellipse cx="30" cy="85" rx="20" ry="5" fill="#78350F" opacity="0.6" />
              <path d="M30 85C30 50 30 25 30 15" stroke={gardenStage.color} strokeWidth="4" strokeLinecap="round" />
              {totalCheckIns >= 2 && (
                <>
                  <path d="M30 70C20 65 15 55 20 50C25 45 28 55 30 70Z" fill={gardenStage.color} />
                  <path d="M30 65C40 60 45 50 40 45C35 40 32 50 30 65Z" fill={gardenStage.color} />
                </>
              )}
              {totalCheckIns >= 5 && (
                <circle cx="30" cy="15" r="9" fill="#EC4899" />
              )}
              <path d="M30 15C25 10 28 2 30 0C32 2 35 10 30 15Z" fill="#34D399" />
            </svg>
          </div>
        </motion.div>

        {/* 7. Weekly Reflection (AI Recommendation) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-1 sm:col-span-2 md:col-span-4 p-8 rounded-[36px] bg-[#FAFBFD] border border-surface-variant/10 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[240px]"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-2xl">spa</span>
            </div>
            <h4 className="font-heading font-extrabold text-sm text-on-surface">Weekly Reflection</h4>
            <AnimatePresence mode="wait">
              <motion.p
                key={recommendation}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 80, damping: 12 }}
                className="text-xs text-on-surface leading-relaxed font-semibold mt-2.5"
              >
                🌿 "{recommendation}"
              </motion.p>
            </AnimatePresence>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest pt-2">
            See all suggestions →
          </span>
        </motion.div>

        {/* ROW 4: Journal (col-4) & Meditation (col-4) & Sleep (col-4) */}
        
        {/* 8. Journal Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push("/journal")}
          className="col-span-1 sm:col-span-1 md:col-span-4 p-6 rounded-[28px] bg-white border border-surface-variant/10 shadow-soft cursor-pointer flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <span className="text-2xl block mb-2">📖</span>
            <h4 className="font-heading font-bold text-xs text-on-surface">Sanctuary Journal</h4>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-relaxed">
              Log reflections, record memories, and secure emotional thoughts.
            </p>
          </div>
        </motion.div>

        {/* 9. Meditation Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push("/meditation")}
          className="col-span-1 sm:col-span-1 md:col-span-4 p-6 rounded-[28px] bg-white border border-surface-variant/10 shadow-soft cursor-pointer flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <span className="text-2xl block mb-2">🧘</span>
            <h4 className="font-heading font-bold text-xs text-on-surface">Mindfulness Player</h4>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-relaxed">
              Guided meditation tracks for focus, breathing releases, and recovery.
            </p>
          </div>
        </motion.div>

        {/* 10. Sleep Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => router.push("/sleep")}
          className="col-span-1 sm:col-span-2 md:col-span-4 p-6 rounded-[28px] bg-white border border-surface-variant/10 shadow-soft cursor-pointer flex flex-col justify-between min-h-[160px]"
        >
          <div>
            <span className="text-2xl block mb-2">🌙</span>
            <h4 className="font-heading font-bold text-xs text-on-surface">Sleep Soundscapes</h4>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-relaxed">
              Rain, ocean waves, and binaural beats built for deep night relaxation.
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
