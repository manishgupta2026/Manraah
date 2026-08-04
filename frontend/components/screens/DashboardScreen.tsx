"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";

interface TimeTheme {
  greeting: string;
  subtitle: string;
  bgGradient: string;
  glowColor: string;
  icon: string;
}

const THEMES: Record<string, TimeTheme> = {
  morning: {
    greeting: "Good Morning",
    subtitle: "Breathe in clarity, release today's expectations.",
    bgGradient: "from-[#FFF5E6] via-[#F4E3E5] to-[#E3ECF5]",
    glowColor: "bg-amber-300/10",
    icon: "🌅",
  },
  afternoon: {
    greeting: "Good Afternoon",
    subtitle: "Find a quiet moment. Take a slow, steady breath.",
    bgGradient: "from-[#E6F4EA] via-[#EDF3FD] to-[#F1F3FB]",
    glowColor: "bg-emerald-300/10",
    icon: "🍃",
  },
  evening: {
    greeting: "Good Evening",
    subtitle: "The day is winding down. Let go of whatever is behind you.",
    bgGradient: "from-[#FCE4EC] via-[#F3E5F5] to-[#EDE7F6]",
    glowColor: "bg-indigo-300/15",
    icon: "🌿",
  },
  night: {
    greeting: "Good Night",
    subtitle: "The stars are quiet. Allow your body to rest in safety.",
    bgGradient: "from-[#0F172A] via-[#1E1B4B] to-[#312E81]",
    glowColor: "bg-[#7C6BC4]/20",
    icon: "🌌",
  },
};

export default function DashboardScreen() {
  const router = useRouter();
  const [name, setName] = useState("Sanctuary Member");
  const [loading, setLoading] = useState(true);

  // States for calm mood dashboard widgets
  const [todayMood, setTodayMood] = useState<any>(null);
  const [moodTrend, setMoodTrend] = useState("Gathering calm logs...");
  const [oneInsight, setOneInsight] = useState("Consistency leads to inner space and clarity.");
  const [oneRecommendation, setOneRecommendation] = useState("Breathe slowly and allocate five minutes for reflection today.");

  const [themeKey, setThemeKey] = useState<"morning" | "afternoon" | "evening" | "night">("evening");

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setName(session.user.name || "Sanctuary Member");
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setThemeKey("morning");
    else if (hour >= 12 && hour < 17) setThemeKey("afternoon");
    else if (hour >= 17 && hour < 21) setThemeKey("evening");
    else setThemeKey("night");

    async function loadSanctuaryData() {
      try {
        const [histRes, insRes, weekRes] = await Promise.all([
          fetch("/api/mood"),
          fetch("/api/mood/insights"),
          fetch("/api/mood/weekly"),
        ]);

        if (histRes.ok) {
          const history = await histRes.json();
          if (history.length > 0) {
            setTodayMood(history[0]);
            
            // Derive trend
            const amazingHappyCount = history.slice(0, 5).filter((h: any) =>
              ["amazing", "happy", "calm", "good"].includes(h.mood.toLowerCase())
            ).length;
            if (amazingHappyCount >= 3) {
              setMoodTrend("Emotional state feels light and steady 🌸");
            } else {
              setMoodTrend("Experiencing subtle mood fluctuations 🍃");
            }
          }
        }

        if (insRes.ok) {
          const insights = await insRes.json();
          if (insights.length > 0 && insights[0]?.insightText) {
            setOneInsight(insights[0].insightText);
          }
        }

        if (weekRes.ok) {
          const weekly = await weekRes.json();
          if (weekly?.aiRecommendation) {
            setOneRecommendation(weekly.aiRecommendation);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSanctuaryData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">spa</span>
        <p className="text-sm text-on-surface-variant font-medium">Entering your wellness sanctuary...</p>
      </div>
    );
  }

  const currentTheme = THEMES[themeKey];
  const isNight = themeKey === "night";

  return (
    <div className="max-w-xl mx-auto space-y-10 py-10 px-4 animate-fadeIn relative select-none">
      
      {/* Background ambient glowing layout */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.25, 1], x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-0 right-1/4 w-80 h-80 rounded-full blur-[80px] opacity-40 ${currentTheme.glowColor}`}
        />
      </div>

      {/* 1. Calm Ambient Hero Greeting */}
      <section className={`relative min-h-[200px] rounded-[36px] bg-gradient-to-tr ${currentTheme.bgGradient} p-8 flex flex-col justify-between overflow-hidden shadow-soft border border-white/20 z-10`}>
        <div className="space-y-3 z-10">
          <span className="px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/70 text-primary shadow-sm">
            🌿 Day 12 of Calm
          </span>
          <h1 className={`text-3xl font-heading font-black tracking-tight ${isNight ? "text-white" : "text-on-surface"}`}>
            {currentTheme.greeting}, {name} {currentTheme.icon}
          </h1>
          <p className={`text-xs font-semibold leading-relaxed max-w-sm ${isNight ? "text-indigo-200/80" : "text-on-surface-variant/85"}`}>
            {currentTheme.subtitle}
          </p>
        </div>

        <div className="pt-6 z-10">
          <button
            onClick={() => router.push("/mood-checkin")}
            className={`px-8 py-3.5 rounded-full font-bold text-xs shadow-md transition-all scale-102 hover:scale-105 active:scale-98 ${
              isNight ? "bg-white text-indigo-900" : "bg-primary text-white"
            }`}
          >
            Reflect on Today
          </button>
        </div>
      </section>

      {/* 2. Today's Mood Widgets Checklist */}
      <section className="space-y-6 z-10 relative">
        <div className="grid grid-cols-1 gap-5">
          
          {/* Widget 1: Today's Logged Mood */}
          <div className="p-6 rounded-[28px] bg-white border border-surface-variant/10 shadow-soft flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-widest">Today's Mood</p>
              <h3 className="text-lg font-heading font-black text-on-surface">
                {todayMood ? `${todayMood.mood} Check-in` : "Reflection Pending"}
              </h3>
              <p className="text-[10px] text-on-surface-variant font-medium">
                {todayMood 
                  ? `Logged with ${todayMood.energy}/10 energy levels and ${todayMood.stress} stress.`
                  : "Allocate a brief 2-minute pause to check in with your emotions."}
              </p>
            </div>
            <span className="text-4xl block">
              {todayMood ? (todayMood.mood === "Amazing" ? "😊" : todayMood.mood === "Happy" ? "😁" : todayMood.mood === "Calm" ? "😌" : todayMood.mood === "Good" ? "🙂" : todayMood.mood === "Neutral" ? "😐" : todayMood.mood === "Low" ? "😔" : todayMood.mood === "Sad" ? "😢" : todayMood.mood === "Anxious" ? "😣" : todayMood.mood === "Frustrated" ? "😡" : todayMood.mood === "Overwhelmed" ? "😩" : "😴") : "🌸"}
            </span>
          </div>

          {/* Widget 2: Mood Trend */}
          <div className="p-6 rounded-[28px] bg-white border border-surface-variant/10 shadow-soft flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-3xl">trending_up</span>
            <div>
              <p className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-widest">Mood Trend</p>
              <p className="text-xs font-bold text-on-surface mt-0.5">{moodTrend}</p>
            </div>
          </div>

          {/* Widget 3: One Insight */}
          <div className="p-6 rounded-[28px] bg-white border border-surface-variant/10 shadow-soft flex items-start gap-4">
            <span className="material-symbols-outlined text-emerald-600 text-3xl">insights</span>
            <div>
              <p className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-widest">Weekly Insight</p>
              <p className="text-xs font-semibold text-on-surface leading-relaxed mt-1">
                "{oneInsight}"
              </p>
            </div>
          </div>

          {/* Widget 4: One Recommendation */}
          <div className="p-6 rounded-[28px] bg-[#FAFBFD] border border-surface-variant/10 shadow-soft flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-3xl">self_improvement</span>
            <div>
              <p className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-widest">AI Sanctuary Recommendation</p>
              <p className="text-xs font-semibold text-on-surface leading-relaxed mt-1">
                🌿 "{oneRecommendation}"
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Primary Redirect links to Insights */}
      <div className="text-center z-10 relative">
        <button
          onClick={() => router.push("/mood-tracking")}
          className="text-xs font-extrabold text-primary hover:underline uppercase tracking-wider"
        >
          View Full Interactive History & Graphs →
        </button>
      </div>

    </div>
  );
}
