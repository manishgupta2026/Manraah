"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { getDashboardSummaryAction, getDailyCheckInSummaryAction, getUserStreakAction } from "@/backend/auth/actions";
import { getWellnessMessage } from "@/frontend/lib/assessment/wellness";

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
    subtitle: "The morning light is fresh. Breathe in clarity, release today's expectations.",
    bgGradient: "from-[#FFF4E0] via-[#F4E3E5] to-[#E3ECF5]",
    glowColor: "bg-amber-300/10",
    icon: "🌅",
    particles: ["✨", "☀️", "🌸"],
  },
  afternoon: {
    greeting: "Good Afternoon",
    subtitle: "Find a quiet moment in the middle of your day. Take a slow, steady breath.",
    bgGradient: "from-[#E6F4EA] via-[#EDF3FD] to-[#F1F3FB]",
    glowColor: "bg-emerald-300/10",
    icon: "🍃",
    particles: ["🍃", "✨", "🌸"],
  },
  evening: {
    greeting: "Good Evening",
    subtitle: "The day is winding down. Let go of whatever is behind you now.",
    bgGradient: "from-[#FCE4EC] via-[#F3E5F5] to-[#EDE7F6]",
    glowColor: "bg-indigo-300/15",
    icon: "🌿",
    particles: ["🍂", "✨", "🌸"],
  },
  night: {
    greeting: "Good Night",
    subtitle: "The stars are quiet. Allow your mind and body to rest in complete safety.",
    bgGradient: "from-[#0F172A] via-[#1E1B4B] to-[#312E81]",
    glowColor: "bg-[#7C6BC4]/20",
    icon: "🌌",
    particles: ["⭐", "✨", "🌙"],
  },
};

export default function DashboardScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [checkInToday, setCheckInToday] = useState<any>(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, totalCheckIns: 0 });

  // Time Sensitive Theme
  const [themeKey, setThemeKey] = useState<"morning" | "afternoon" | "evening" | "night">("evening");

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUserId(session.user.id);
    }

    // Determine current hour theme
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setThemeKey("morning");
    else if (hour >= 12 && hour < 17) setThemeKey("afternoon");
    else if (hour >= 17 && hour < 21) setThemeKey("evening");
    else setThemeKey("night");

    async function loadData() {
      if (session.user) {
        try {
          const [summary, checkInRes, streakRes] = await Promise.all([
            getDashboardSummaryAction(session.user.id),
            getDailyCheckInSummaryAction(session.user.id),
            getUserStreakAction(session.user.id),
          ]);
          
          setData(summary);
          if (checkInRes.success) {
            setCheckInToday(checkInRes.summary);
          }
          if (streakRes.success) {
            setStreak({
              currentStreak: streakRes.currentStreak,
              longestStreak: streakRes.longestStreak,
              totalCheckIns: streakRes.totalCheckIns,
            });
          }
        } catch (err) {
          console.error("Dashboard data load error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">spa</span>
        <p className="text-sm text-on-surface-variant font-medium">Entering your wellness sanctuary...</p>
      </div>
    );
  }

  const name = data?.name || "Sanctuary Member";
  const category = data?.category || "student";
  const score = data?.totalScore || 30;
  const percentage = data?.percentage || 60;
  const level = data?.wellnessLevel || "Stable";

  const currentTheme = THEMES[themeKey];
  const isNight = themeKey === "night";

  // Friendly Serenity Level mapping
  const getFriendlySerenity = (wellnessLevel: string) => {
    switch (wellnessLevel) {
      case "Flourishing":
        return {
          title: "Your spirit is Flourishing ✨",
          desc: "You are holding a clean, peaceful space today. Carry this serenity with you.",
        };
      case "Stable":
        return {
          title: "Your spirit feels Stable 🍃",
          desc: "You are centered and grounded. Keep taking slow, mindful steps.",
        };
      case "Needs Attention":
        return {
          title: "Your spirit is Seeking Care ☁️",
          desc: "It is okay to feel slightly overwhelmed. Allow yourself room to breathe.",
        };
      case "High Risk":
        return {
          title: "Your spirit feels Heavy 🍂",
          desc: "Remember, you don't need to carry this alone. Slow down and prioritize quiet rest.",
        };
      case "Critical":
        return {
          title: "Your spirit is in a Delicate state 🕯️",
          desc: "Be extremely tender with yourself right now. Pause, breathe, and reach out to a support guide.",
        };
      default:
        return {
          title: "Your spirit is Centered 🌿",
          desc: "Focus on gentle breathing, self-compassion, and mindfulness.",
        };
    }
  };

  const serenityInfo = getFriendlySerenity(level);

  // Map category code to human readable name
  const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      student: "Student Focus",
      young_pro: "Young Professional Focus",
      working_professional: "Working Professional Focus",
      parent: "Mindful Parenting Focus",
      couple: "Couples Harmony Focus",
      family: "Family Unity Focus",
      women: "Women's Wellness Focus",
      men: "Men's Sanctum Focus",
      senior_citizen: "Golden Serenity Focus",
    };
    return map[cat] || cat;
  };

  const getGardenStage = (count: number) => {
    if (count <= 1) return "Seed 🌱";
    if (count <= 3) return "Sprout 🌿";
    if (count <= 6) return "Leaf 🍃";
    if (count <= 10) return "Flower 🌸";
    if (count <= 15) return "Tree 🌳";
    if (count <= 21) return "Garden 🏡";
    return "Forest 🌲";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 px-4 animate-fadeIn select-none relative">
      
      {/* Dynamic ambient background light */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[90px] opacity-40 ${currentTheme.glowColor}`}
        />
      </div>

      {/* 1. Premium Sanctuary Hero Card */}
      <section className={`relative min-h-[250px] rounded-[42px] bg-gradient-to-tr ${currentTheme.bgGradient} p-8 md:p-12 flex flex-col justify-between overflow-hidden shadow-soft-xl border border-white/20 z-10`}>
        
        {/* Soft floating particle loops (Framer Motion) */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [100, -100],
                x: [Math.random() * 50, Math.random() * -50, Math.random() * 50],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut",
              }}
              className="absolute text-lg"
              style={{
                left: `${15 + i * 20}%`,
                bottom: 0,
              }}
            >
              {currentTheme.particles[i % currentTheme.particles.length]}
            </motion.div>
          ))}
        </div>

        {/* Hero Headers */}
        <div className="space-y-4 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase shadow-sm ${
              isNight ? "bg-white/10 text-white" : "bg-white/80 text-primary border border-primary/10"
            }`}>
              🌿 {getCategoryName(category)}
            </span>
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-extrabold tracking-widest uppercase shadow-sm ${
              isNight ? "bg-white/10 text-white" : "bg-white/80 text-secondary border border-secondary/10"
            }`}>
              🌸 Garden: {getGardenStage(streak.totalCheckIns)}
            </span>
          </div>
          
          <div className="space-y-2">
            <h1 className={`text-4xl md:text-5xl font-heading font-black leading-tight tracking-tight ${
              isNight ? "text-white" : "text-on-surface"
            }`}>
              {currentTheme.greeting}, {name} {currentTheme.icon}
            </h1>
            <p className={`text-sm md:text-base font-medium max-w-lg leading-relaxed ${
              isNight ? "text-indigo-200/80" : "text-on-surface-variant/80"
            }`}>
              {currentTheme.subtitle}
            </p>
          </div>
        </div>

        {/* Primary CTA (Continue Journey) */}
        <div className="pt-6 z-10 flex items-start">
          <button
            onClick={() => router.push(checkInToday ? "/ai-chat" : "/checkin")}
            className={`px-10 py-4 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98 ${
              isNight 
                ? "bg-white text-indigo-900 hover:bg-indigo-50" 
                : "bg-primary text-white hover:bg-primary-purple"
            }`}
          >
            {checkInToday ? "Chat with Companion →" : "Continue Today's Journey"}
          </button>
        </div>
      </section>

      {/* 2. Today's Journey Checklist (Tactile Cards) */}
      <section className="space-y-6 z-10 relative">
        <div className="flex items-center justify-between border-b border-surface-variant/5 pb-2">
          <h2 className="text-xl font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">self_improvement</span>
            Today's Journey
          </h2>
          <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">
            Select an exercise
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          
          {/* Card 1: Daily Check-in */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push(checkInToday ? "/dashboard" : "/checkin")}
            className="p-6 rounded-[28px] bg-white border border-surface-variant/5 shadow-soft cursor-pointer flex flex-col justify-between h-[200px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🌸</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Daily Check-in</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1">
                {checkInToday 
                  ? "Completed for today. Your wellness seedling is watered!" 
                  : "Pause for two minutes to reflect on mood, energy, and sleep quality."}
              </p>
            </div>
            {checkInToday && (
              <span className="inline-block px-3 py-1 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-800 self-start">
                Completed
              </span>
            )}
          </motion.div>

          {/* Card 2: Guided Meditation */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/meditation")}
            className="p-6 rounded-[28px] bg-white border border-surface-variant/5 shadow-soft cursor-pointer flex flex-col justify-between h-[200px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🧘</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Meditation Player</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1">
                Gentle guided audio tracks designed for anxiety release, clarity, and deep presence.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Mindful Journal */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/journal")}
            className="p-6 rounded-[28px] bg-white border border-surface-variant/5 shadow-soft cursor-pointer flex flex-col justify-between h-[200px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Sanctuary Journal</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1">
                Reflect on your thoughts, accomplishments, and write daily logs with safe encryption.
              </p>
            </div>
          </motion.div>

          {/* Card 4: AI Companion */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/ai-chat")}
            className="p-6 rounded-[28px] bg-white border border-surface-variant/5 shadow-soft cursor-pointer flex flex-col justify-between h-[200px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <span className="text-2xl">💙</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-on-surface">AI Companion</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1">
                Your empathetic listening companion, aware of your check-in context details.
              </p>
            </div>
          </motion.div>

          {/* Card 5: Sleep Support */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/sleep")}
            className="p-6 rounded-[28px] bg-white border border-surface-variant/5 shadow-soft cursor-pointer flex flex-col justify-between h-[200px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🌙</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Sleep Soundscapes</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1">
                Binaural rain, white noise, and ocean loops designed for restful recovery.
              </p>
            </div>
          </motion.div>

          {/* Card 6: Sanctuary Garden Progress */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => router.push("/checkin")}
            className="p-6 rounded-[28px] bg-[#FAFBFD] border border-surface-variant/5 shadow-soft cursor-pointer flex flex-col justify-between h-[200px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <span className="text-2xl">🏡</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-on-surface">Sanctuary Garden</h4>
              <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed mt-1">
                Stage: **{getGardenStage(streak.totalCheckIns)}**. Reflected **{streak.totalCheckIns} times** cumulatively.
              </p>
            </div>
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
              View Garden Progress →
            </span>
          </motion.div>

        </div>
      </section>

      {/* 3. Conversational Serenity Guidance Panel */}
      <section className="p-8 rounded-[36px] bg-gradient-to-tr from-white to-[#F6F8FC] border border-surface-variant/5 shadow-soft hover:shadow-soft-lg transition-all space-y-6 z-10 relative">
        <div className="flex items-center justify-between border-b border-surface-variant/5 pb-2">
          <h3 className="font-heading font-extrabold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">self_improvement</span>
            Serenity Guidance
          </h3>
          <span className="text-[9px] font-extrabold text-on-surface-variant/50 uppercase tracking-widest">
            {serenityInfo.title}
          </span>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-surface-variant/10">
            <p className="text-sm text-on-surface font-semibold leading-relaxed">
              🌿 {getWellnessMessage(level)}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium pl-1">
            {serenityInfo.desc}
          </p>
        </div>
      </section>

    </div>
  );
}
