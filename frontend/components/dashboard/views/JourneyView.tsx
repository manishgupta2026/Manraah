"use client";

import React, { useState, useMemo } from "react";
import { getCategoryPersonalization } from "@/frontend/lib/mock-data";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  calm: "😌",
  neutral: "😐",
  anxious: "😟",
  sad: "😔",
  stressed: "😤",
  tired: "😴",
  motivated: "💪",
  good: "😊",
};

const MOOD_FILTER_OPTIONS = [
  "All",
  "Happy",
  "Calm",
  "Neutral",
  "Anxious",
  "Sad",
  "Stressed",
  "Tired",
  "Motivated",
];

const TIME_FILTER_OPTIONS = ["All", "This Week", "This Month"];

export default function JourneyView() {
  const { currentStreak, history, insights, isLoading } = useWellness();
  const {
    currentCategory,
    currentCategoryName,
    currentScore,
    isCurrentAssessed,
    levelBadge,
    allCategories,
    openBreakdownModal,
    openAssessment,
  } = useWellnessScore();

  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const [timeFilter, setTimeFilter] = useState<string>("All");
  const [moodFilter, setMoodFilter] = useState<string>("All");

  const mindfulnessMinutes = session?.user?.mindfulnessMinutes || 45;

  // Filter history entries based on time & mood
  const filteredHistory = useMemo(() => {
    if (!Array.isArray(history) || history.length === 0) return [];

    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(now.getDate() - 30);

    return history.filter((item) => {
      // Mood filter
      if (moodFilter !== "All") {
        const itemMood = (item.mood || "").toLowerCase();
        if (itemMood !== moodFilter.toLowerCase()) {
          return false;
        }
      }

      // Time filter
      if (timeFilter === "This Week") {
        const itemDate = new Date(item.checkinDate || item.createdAt);
        if (itemDate < oneWeekAgo) return false;
      } else if (timeFilter === "This Month") {
        const itemDate = new Date(item.checkinDate || item.createdAt);
        if (itemDate < oneMonthAgo) return false;
      }

      return true;
    });
  }, [history, timeFilter, moodFilter]);

  // Determine insights values
  const mostCommonMood = insights?.mostCommonMood || "Calm";
  const averageWellness = insights?.averageWellness ?? (currentScore || 75);
  const sevenDayTrend = insights?.sevenDayTrend || [
    { day: "Mon", score: 68, mood: "Calm" },
    { day: "Tue", score: 72, mood: "Focused" },
    { day: "Wed", score: 65, mood: "Tired" },
    { day: "Thu", score: 78, mood: "Motivated" },
    { day: "Fri", score: 74, mood: "Balanced" },
    { day: "Sat", score: 82, mood: "Relaxed" },
    { day: "Sun", score: averageWellness, mood: mostCommonMood },
  ];

  const formatDateLabel = (dateStr?: string, createdStr?: string) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const targetDate = dateStr ? dateStr.split("T")[0] : createdStr?.split("T")[0];
      if (targetDate === todayStr) {
        return "Today";
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().split("T")[0];
      if (targetDate === yestStr) {
        return "Yesterday";
      }

      const d = new Date(dateStr || createdStr || "");
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
    } catch {
      // ignore
    }
    return dateStr || "Recent";
  };

  const formatTimeLabel = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      }
    } catch {
      // ignore
    }
    return "";
  };

  const getCategoryTitle = (catSlug?: string) => {
    if (!catSlug) return "Student";
    if (catSlug === "working-professional") return "Working Professional";
    return catSlug.charAt(0).toUpperCase() + catSlug.slice(1);
  };

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
          Your personal path toward a healthier mind. Track emotional resilience, consistency streaks, and your {currentCategoryName} wellness progress.
        </p>

        {/* 3 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Card 1: Life-Stage Wellness Score */}
          <div
            onClick={() => openBreakdownModal()}
            className="p-4 rounded-2xl bg-[#F2FAF6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-between cursor-pointer hover:border-[#008968]/60 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#006C56] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                {isCurrentAssessed && currentScore !== null ? `${currentScore}%` : "--"}
              </div>
              <div>
                <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">
                  {currentCategoryName} Wellness
                </p>
                <p className="text-xs font-black text-[#008968] dark:text-[#88F7D6]">
                  {isCurrentAssessed && currentScore !== null
                    ? levelBadge
                    : "Not Assessed Yet"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#006C56] dark:text-[#00A982] opacity-80 group-hover:opacity-100">
              Overview →
            </span>
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

      {/* 2. Journey Insights Card (Most Common Mood, Streak, Avg Score, 7-Day Trend) */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Check-In Insights &amp; 7-Day Trend
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                Calculated from your verified daily check-ins
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{MOOD_EMOJIS[mostCommonMood.toLowerCase()] || "😌"}</span>
              <span className="font-bold text-[#19332A] dark:text-[#F4FAF7]">Top Mood: {mostCommonMood}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#008968]" />
              <span className="font-bold text-[#006C56] dark:text-[#00A982]">Avg Score: {averageWellness}%</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-3 pb-1 px-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 border-b border-[#E2ECE6] dark:border-[#23483E] pb-2">
            {sevenDayTrend.map((item: any, idx: number) => {
              const scoreVal = typeof item.score === "number" ? item.score : 0;
              const heightPercent = scoreVal > 0 ? (scoreVal / 100) * 100 : 20;
              const isToday = idx === 6;
              const emoji = MOOD_EMOJIS[(item.mood || "").toLowerCase()] || "";

              return (
                <div key={item.day + idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9.5px] font-bold text-[#789389] dark:text-[#78958C] opacity-0 group-hover:opacity-100 transition-opacity">
                    {scoreVal > 0 ? `${scoreVal}%` : "--"}
                  </span>
                  <div className="w-full max-w-[36px] bg-[#EAF5EF] dark:bg-[#14382F] rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? "bg-[#006C56] dark:bg-[#00A982]"
                          : scoreVal > 0
                          ? "bg-[#71C79E] dark:bg-[#206955] group-hover:bg-[#006C56]"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${isToday ? "text-[#006C56] dark:text-[#00A982]" : "text-[#4F685F] dark:text-[#A9C5BC]"}`}>
                    {item.day}
                  </span>
                  <span className="text-[10px] hidden sm:inline">
                    {emoji}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Daily Check-In Timeline Section with Filters */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
              Daily Check-In Timeline
            </h2>
            <p className="text-[11px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
              Review your mood entries, wellness notes, and life-stage assessments
            </p>
          </div>

          {/* Time & Mood Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex items-center bg-[#F4FAF7] dark:bg-[#14382F] p-1 rounded-xl border border-[#E2ECE6] dark:border-[#23483E]">
              {TIME_FILTER_OPTIONS.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeFilter(tf)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                    timeFilter === tf
                      ? "bg-[#006C56] text-white shadow-xs"
                      : "text-[#4F685F] dark:text-[#A9C5BC] hover:text-[#19332A]"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Mood Dropdown / Filter */}
            <select
              value={moodFilter}
              onChange={(e) => setMoodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F4FAF7] dark:bg-[#14382F] text-[#19332A] dark:text-[#F4FAF7] text-[11px] font-bold border border-[#E2ECE6] dark:border-[#23483E] focus:outline-none cursor-pointer"
            >
              {MOOD_FILTER_OPTIONS.map((mf) => (
                <option key={mf} value={mf} className="text-black dark:text-white">
                  {mf === "All" ? "All Moods" : `${MOOD_EMOJIS[mf.toLowerCase()] || ""} ${mf}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timeline Entries List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-7 h-7 border-2 border-[#008968] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#789389]">Loading check-in history...</p>
            </div>
          ) : filteredHistory.length > 0 ? (
            filteredHistory.map((item, idx) => {
              const rawMood = item.mood || "Calm";
              const moodKey = rawMood.toLowerCase();
              const emoji = MOOD_EMOJIS[moodKey] || "😌";
              const moodLabel = rawMood.charAt(0).toUpperCase() + rawMood.slice(1);
              const dateLabel = formatDateLabel(item.checkinDate, item.createdAt);
              const timeLabel = formatTimeLabel(item.createdAt || item.updatedAt);
              const categoryTitle = getCategoryTitle(item.category);
              const score = typeof item.wellnessScore === "number" ? item.wellnessScore : null;
              const noteText = item.note || item.reflection || "";

              return (
                <div
                  key={item.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] hover:border-[#008968]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Large Mood Emoji Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#14382F] border border-[#D2E8DC] dark:border-[#23483E] flex items-center justify-center text-2xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {emoji}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          {dateLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10px] font-bold">
                          {emoji} {moodLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1A483C] text-[#4F685F] dark:text-[#A9C5BC] text-[9.5px] font-bold">
                          {categoryTitle}
                        </span>
                        {timeLabel && (
                          <span className="text-[10px] text-[#789389] dark:text-[#78958C]">
                            • {timeLabel}
                          </span>
                        )}
                      </div>

                      {/* Note / Reflection Preview */}
                      {noteText ? (
                        <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC] font-medium leading-relaxed italic line-clamp-2">
                          “{noteText}”
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#789389] dark:text-[#78958C] font-normal">
                          Daily mood check-in recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score Ring / Pill */}
                  {score !== null && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E2ECE6] dark:border-[#23483E]">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982]">
                        <span className="text-[10px] font-extrabold uppercase">Score</span>
                        <span className="text-sm font-heading font-black">{score}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-3">
              <span className="text-3xl">🌱</span>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                  No check-ins match the selected filters
                </h4>
                <p className="text-[11px] text-[#789389] dark:text-[#78958C]">
                  Complete your daily check-in from the dashboard to see entries here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAssessment()}
                className="px-4 py-2 rounded-xl bg-[#006C56] hover:bg-[#005241] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Check In Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Your Life-Stage Paths */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Your Life-Stage Paths
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                Current active life-stage: <span className="font-bold text-[#008968] dark:text-[#00A982]">{currentCategoryName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => openBreakdownModal()}
            className="px-3.5 py-1.5 rounded-xl bg-[#006C56] hover:bg-[#005241] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            Open Wellness Overview
          </button>
        </div>

        {/* 5 Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCategories.map((cat) => {
            const isCurrent = cat.id === currentCategory;
            const hasScore = typeof cat.score === "number";

            return (
              <div
                key={cat.id}
                onClick={() => (hasScore ? openBreakdownModal() : openAssessment(cat.id))}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 group ${
                  isCurrent
                    ? "bg-[#EAF6F0]/60 dark:bg-[#14382F]/70 border-[#008968]/60 dark:border-[#00A982]/60"
                    : "bg-[#F8FCFA] dark:bg-[#0E2A23] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#008968]/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {cat.icon === "school"
                        ? "🎓"
                        : cat.icon === "family_restroom"
                        ? "👨‍👩‍👧"
                        : cat.icon === "favorite"
                        ? "💑"
                        : cat.icon === "work"
                        ? "💼"
                        : "🌱"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight group-hover:text-[#008968] dark:group-hover:text-[#00A982] transition-colors">
                          {cat.name}
                        </h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md bg-[#006C56] text-white text-[8px] font-extrabold uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-semibold mt-0.5">
                        {hasScore ? `Completed (${cat.score}%)` : "Not assessed yet"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black font-heading ${hasScore ? "text-[#008968] dark:text-[#00A982]" : "text-[#789389] dark:text-[#78958C]"}`}>
                      {hasScore ? `${cat.score}%` : "--"}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#E2ECE6] dark:bg-[#1C3E35] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#008968] dark:bg-[#00A982] rounded-full transition-all duration-500"
                    style={{ width: `${hasScore ? cat.score : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[9px] text-[#789389] dark:text-[#78958C]">
                    5 Questions
                  </span>
                  <span className="text-[9.5px] font-bold text-[#006C56] dark:text-[#00A982] group-hover:underline">
                    {hasScore ? "Retake Check-In →" : "Start Check-In →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
