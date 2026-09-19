"use client";

import React, { useState, useEffect } from "react";
import { getCategoryPersonalization } from "@/frontend/lib/mock-data";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";

export default function JourneyView() {
  const { currentStreak } = useWellness();
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const [userProfile, setUserProfile] = useState<any>(session?.user || null);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const s = getClientSession();
    if (s.user) {
      setUserProfile(s.user);
    }
  }, []);

  useEffect(() => {
    async function loadMoodHistory() {
      try {
        const res = await fetch("/api/mood/weekly");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMoodHistory(data);
          }
        }
      } catch (err) {
        console.error("Failed to load mood history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadMoodHistory();
  }, []);

  const mindfulnessMinutes = userProfile?.mindfulnessMinutes || 45;
  const wellnessScore = 68;

  const defaultWeeklyTrend = [
    { day: "Mon", score: 6, mood: "Calm", label: "60%" },
    { day: "Tue", score: 7, mood: "Focused", label: "70%" },
    { day: "Wed", score: 5, mood: "Tired", label: "50%" },
    { day: "Thu", score: 8, mood: "Energetic", label: "80%" },
    { day: "Fri", score: 7, mood: "Balanced", label: "75%" },
    { day: "Sat", score: 8, mood: "Relaxed", label: "85%" },
    { day: "Sun", score: 9, mood: "Serene", label: "90%" },
  ];

  const milestones = [
    { id: "m1", title: "Wellness Assessment Completed", status: "completed", date: "Initial Onboarding" },
    { id: "m2", title: "First Daily Check-in Logged", status: "completed", date: "Day 1" },
    { id: "m3", title: "3-Day Consistency Streak", status: "completed", date: "Today" },
    { id: "m4", title: "First 1-on-1 Professional Session", status: "upcoming", date: "Oct 6, 2026" },
    { id: "m5", title: "Complete 7-Day Reflection Cycle", status: "pending", date: "Next milestone" },
  ];

  const recentActivities = [
    { id: "a1", icon: "☀️", title: "Morning Emotional Check-in", desc: "Energy 4/5 • Mood: Calm & Focused", time: "Today, 08:30 AM" },
    { id: "a2", icon: "📖", title: "Read Psychoeducation Guide", desc: "The Art of Slowing Down: Mindful Reset", time: "Yesterday, 04:15 PM" },
    { id: "a3", icon: "🧘", title: "5-Minute Grounding Reset", desc: "Mindfulness & Deep Breathwork audio", time: "2 days ago" },
    { id: "a4", icon: "💬", title: "AI Companion Reflection", desc: "Explored strategies for evening winding down", time: "3 days ago" },
  ];

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
        <span className="px-3.5 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10.5px] font-extrabold uppercase tracking-wider">
          {p.badgeLabel || "🌿 Wellness Journey"}
        </span>
        <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
          My Journey
        </h1>
        <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium leading-relaxed max-w-xl">
          Your personal path toward a healthier mind. Track emotional resilience, consistency streaks, and milestones.
        </p>

        {/* 3 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Card 1: Wellness Score */}
          <div className="p-4 rounded-2xl bg-[#F2FAF6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#006C56] text-white flex items-center justify-center font-black text-sm shadow-xs">
              {wellnessScore}%
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Wellness Score</p>
              <p className="text-xs font-black text-[#008968] dark:text-[#88F7D6]">Good Progress</p>
            </div>
          </div>

          {/* Card 2: Streak */}
          <div className="p-4 rounded-2xl bg-[#FFF8F2] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#F28C4B] text-white flex items-center justify-center text-xl shadow-xs">
              🔥
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Active Streak</p>
              <p className="text-xs font-black text-[#F28C4B]">{currentStreak} Days Consistent</p>
            </div>
          </div>

          {/* Card 3: Mindfulness */}
          <div className="p-4 rounded-2xl bg-[#F3F5FA] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3D52A0] text-white flex items-center justify-center text-lg shadow-xs">
              🧘
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Mindfulness Time</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">{mindfulnessMinutes} Mins Logged</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Progress Trend (7-Day Emotional Baseline) */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                7-Day Emotional Baseline
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                Weekly mood balance and stability trend
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#006C56] dark:text-[#00A982]">
            +14% vs Last Week
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2 px-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 border-b border-[#E2ECE6] dark:border-[#23483E] pb-2">
            {defaultWeeklyTrend.map((item, idx) => {
              const heightPercent = (item.score / 10) * 100;
              const isToday = idx === 6;
              return (
                <div key={item.day} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9.5px] font-bold text-[#789389] dark:text-[#78958C] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                  <div className="w-full max-w-[36px] bg-[#EAF5EF] dark:bg-[#14382F] rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? "bg-[#006C56] dark:bg-[#00A982]"
                          : "bg-[#71C79E] dark:bg-[#206955] group-hover:bg-[#006C56]"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isToday ? "text-[#006C56] dark:text-[#00A982]" : "text-[#4F685F] dark:text-[#A9C5BC]"}`}>
                    {item.day}
                  </span>
                  <span className="text-[8.5px] text-[#789389] dark:text-[#78958C] hidden sm:inline">
                    {item.mood}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Milestones & Recent Activity (2-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* Left: Milestones */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2">
              <span className="text-base">🏆</span>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Milestones &amp; Progress
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      m.status === "completed"
                        ? "bg-[#006C56] text-white"
                        : m.status === "upcoming"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                    }`}>
                      {m.status === "completed" ? "✓" : m.status === "upcoming" ? "⏳" : "○"}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                        {m.title}
                      </p>
                      <p className="text-[9.5px] text-[#789389] dark:text-[#78958C]">
                        {m.date}
                      </p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#006C56] dark:text-[#00A982]">
                    {m.status === "completed" ? "Achieved" : m.status === "upcoming" ? "Scheduled" : "Next"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Activity Timeline */}
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2">
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Recent Activity
              </h3>
            </div>

            <div className="space-y-2.5 pt-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E]"
                >
                  <span className="text-base shrink-0 mt-0.5">{act.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                      {act.title}
                    </p>
                    <p className="text-[10px] text-[#4F685F] dark:text-[#A9C5BC] truncate mt-0.5">
                      {act.desc}
                    </p>
                    <p className="text-[9px] text-[#789389] dark:text-[#78958C] font-semibold mt-1">
                      {act.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
