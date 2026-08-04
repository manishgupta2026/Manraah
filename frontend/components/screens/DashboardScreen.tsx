"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { getDashboardSummaryAction, getDailyCheckInSummaryAction, getUserStreakAction } from "@/backend/auth/actions";
import { getWellnessMessage } from "@/frontend/lib/assessment/wellness";

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [checkInToday, setCheckInToday] = useState<any>(null);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });

  useEffect(() => {
    async function loadData() {
      try {
        const session = getClientSession();
        if (session.user) {
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
            });
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
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

  // Friendly Serenity Level mapping
  const getFriendlySerenity = (wellnessLevel: string) => {
    switch (wellnessLevel) {
      case "Flourishing":
        return {
          title: "Your spirit is Flourishing ✨",
          desc: "You are carrying a beautiful, peaceful energy today. Let this lightness guide your path.",
          color: "text-emerald-700 bg-emerald-50 border-emerald-100",
        };
      case "Stable":
        return {
          title: "Your spirit feels Stable 🍃",
          desc: "You are well-centered and steady. Continue cultivating gentle, present moments.",
          color: "text-blue-700 bg-blue-50 border-blue-100",
        };
      case "Needs Attention":
        return {
          title: "Your spirit is Seeking Care ☁️",
          desc: "It is completely okay to feel slightly overwhelmed. Allow yourself space to slow down.",
          color: "text-amber-700 bg-amber-50 border-amber-100",
        };
      case "High Risk":
        return {
          title: "Your spirit feels Heavy 🍂",
          desc: "Recall that you don't have to carry it all. Prioritize quiet rest and gentle breathing.",
          color: "text-rose-700 bg-rose-50 border-rose-100",
        };
      case "Critical":
        return {
          title: "Your spirit is in a Delicate state 🕯️",
          desc: "Treat yourself with absolute tenderness. Breathe, pause, and reach out to your support circle.",
          color: "text-red-700 bg-red-50 border-red-100",
        };
      default:
        return {
          title: "Your spirit is Centered 🌿",
          desc: "Focus on cultivating present-moment awareness and self-compassion.",
          color: "text-indigo-700 bg-indigo-50 border-indigo-100",
        };
    }
  };

  const serenityInfo = getFriendlySerenity(level);

  // Map category code to human readable name
  const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      student: "Student Focus",
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6 px-4">
      
      {/* 1. Premium Sanctuary Hero Section */}
      <section className="relative min-h-[220px] rounded-[36px] bg-gradient-to-tr from-[#F1F3FB] via-[#E9ECF7] to-[#E3E8F5] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-soft-xl">
        
        {/* Calm Background Circles Floating Animation */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 15, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/20 blur-2xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -10, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-indigo-200/15 blur-2xl pointer-events-none"
        />

        {/* Content */}
        <div className="space-y-4 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/70 backdrop-blur-sm text-primary shadow-sm">
              {getCategoryName(category)}
            </span>
            {streak.currentStreak > 0 && (
              <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/70 backdrop-blur-sm text-secondary shadow-sm">
                🔥 {streak.currentStreak} Day Streak
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-on-surface leading-tight tracking-tight">
              Welcome back, <span className="text-primary">{name}</span>
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant/80 font-medium max-w-lg leading-relaxed">
              Take a slow deep breath. Your personal wellness sanctuary is open. Let's practice presence today.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Today's Journey Experience Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-surface-variant/10 pb-2">
          <h2 className="text-xl font-heading font-extrabold text-on-surface tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">spa</span>
            Today's Journey
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/65">
            Step by step, day by day
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Daily Check-in Card (Sanctuary Checklist) */}
          <div className="p-8 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-primary-container/10 text-primary">
                Daily Log
              </span>
              <h3 className="text-xl font-heading font-bold text-on-surface leading-snug">
                {checkInToday ? "✓ Daily Reflection Complete" : "Log Today's reflection"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {checkInToday 
                  ? `You checked in today feeling ${checkInToday.mood} with ${checkInToday.energy_level}/5 energy. Your wellness seedling is growing!`
                  : "Pause for two minutes to check in with your mind, log sleep quality, energy battery, and intention."}
              </p>
            </div>

            {checkInToday ? (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/15 text-xs text-on-surface font-semibold max-w-sm">
                <span className="text-2xl">🌱</span>
                <span>You watered your sanctuary plant today! Streak: {streak.currentStreak} Days</span>
              </div>
            ) : (
              <Link
                href="/checkin"
                className="inline-block w-full py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-center font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105"
              >
                Start Daily Check-in
              </Link>
            )}
          </div>

          {/* Serenity Level & Score Card */}
          <div className="p-8 rounded-[32px] bg-white border border-surface-variant/10 shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="inline-block px-3.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-emerald-50 text-emerald-800">
                Serenity Level
              </span>
              <h3 className="text-xl font-heading font-bold text-on-surface leading-snug">
                {serenityInfo.title}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                {serenityInfo.desc}
              </p>
            </div>

            <div className="flex items-center gap-4 py-1">
              {/* Circular gauge */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#F1F3FB"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#7C6BC4"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - percentage / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-extrabold text-primary">{score}</span>
                  <span className="text-[8px] text-on-surface-variant/70 font-semibold">/ 50</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-on-surface">{level} state</p>
                <p className="text-[10px] text-on-surface-variant/80 font-semibold">{percentage}% Serenity Index</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Conversational Wellness Guidance Section */}
      <section className="p-8 rounded-[32px] bg-gradient-to-br from-white to-[#F9FAFD] border border-surface-variant/10 shadow-soft hover:shadow-soft-lg transition-all space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">self_improvement</span>
            Sanctuary Guidance
          </h3>
          <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Personalized advice</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/10">
          <p className="text-sm text-on-surface leading-relaxed font-semibold">
            🌿 {getWellnessMessage(level)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Chat with AI companion portal */}
          <Link
            href="/ai-chat"
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-primary-container/10 border border-surface-variant/15 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl">smart_toy</span>
              <div>
                <h4 className="text-xs font-bold text-on-surface">Chat with AI Companion</h4>
                <p className="text-[10px] text-on-surface-variant">Confidential venting & grounding</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary text-lg">chevron_right</span>
          </Link>

          {/* Quick breathing audio player portal */}
          <Link
            href="/meditation"
            className="flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-secondary/10 border border-surface-variant/15 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl">bedtime</span>
              <div>
                <h4 className="text-xs font-bold text-on-surface">Breathing & Meditation</h4>
                <p className="text-[10px] text-on-surface-variant">Calm audio tracks for release</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-lg">chevron_right</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
