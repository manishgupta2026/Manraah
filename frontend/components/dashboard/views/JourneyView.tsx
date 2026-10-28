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

const CATEGORY_ICONS: Record<string, string> = {
  "student": "🎓",
  "parent": "👨‍👩‍👧",
  "couple": "💑",
  "working-professional": "💼",
  "other": "🌱",
};

function getScoreStatusBadge(score: number | null | undefined): { label: string; color: string } {
  if (score === null || score === undefined) {
    return { label: "Not Assessed", color: "text-slate-500 bg-slate-100 dark:bg-[#18181b] dark:text-[#A1A1AA]" };
  }
  if (score >= 80) {
    return { label: "Flourishing", color: "text-[#006C56] bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] dark:text-[#73D8C4]" };
  }
  if (score >= 65) {
    return { label: "Good Progress", color: "text-[#008968] bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] dark:text-zinc-200" };
  }
  if (score >= 50) {
    return { label: "Moderate", color: "text-[#D97706] bg-[#FEF3C7] dark:bg-[rgba(245,160,60,0.14)] dark:text-[#FFC477]" };
  }
  return { label: "Needs Attention", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300" };
}

export default function JourneyView() {
  const { currentStreak, history, isLoading } = useWellness();
  const {
    currentCategory,
    currentCategoryName,
    currentScore,
    isCurrentAssessed,
    levelBadge,
    allCategories,
    recentHistory,
    openBreakdownModal,
    openAssessment,
    openReattemptModal,
  } = useWellnessScore();

  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const [timeFilter, setTimeFilter] = useState<string>("All");
  const [moodFilter, setMoodFilter] = useState<string>("All");
  const [isPastModalOpen, setIsPastModalOpen] = useState<boolean>(false);

  const mindfulnessMinutes = session?.user?.mindfulnessMinutes || 0;

  const getCategoryTitle = (catSlug?: string | null) => {
    if (!catSlug || !catSlug.trim()) return "Category not recorded";
    const s = catSlug.toLowerCase().replace(/_/g, "-");
    if (
      s === "working-professional" ||
      s === "working_professional" ||
      s === "young-pro" ||
      s === "young_pro" ||
      s === "career" ||
      s === "work"
    ) {
      return "Working Professional";
    }
    if (s === "student" || s === "academic") return "Student";
    if (s === "parent" || s === "parents") return "Parent";
    if (s === "couple" || s === "couples") return "Couple";
    if (s === "other" || s === "others") return "Others";
    return catSlug.charAt(0).toUpperCase() + catSlug.slice(1);
  };

  // Filter history entries based on time & mood for timeline
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

  // Compute Past Wellness Activity list (representing latest completed attempt per category)
  const pastActivityList = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        icon: string;
        score: number;
        date: string;
        rawDate: Date;
        status: string;
      }
    >();

    // 1. From allCategories (which stores latest completed assessment for each category)
    if (Array.isArray(allCategories)) {
      allCategories.forEach((cat) => {
        if (cat.completed && typeof cat.score === "number") {
          const rawDate = cat.completedAt ? new Date(cat.completedAt) : new Date();
          map.set(cat.id, {
            id: cat.id,
            name: cat.name,
            icon: CATEGORY_ICONS[cat.id] || "🌱",
            score: cat.score,
            date: cat.completedAt
              ? rawDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Recently",
            rawDate,
            status: getScoreStatusBadge(cat.score).label,
          });
        }
      });
    }

    // 2. Cross-reference with recentHistory for any additional attempts/dates
    if (Array.isArray(recentHistory)) {
      recentHistory.forEach((item) => {
        const rawSlug = item.categoryId || "";
        const normalized = rawSlug === "working_professional" ? "working-professional" : rawSlug;
        const d = new Date(item.completedAt);
        const existing = map.get(normalized);
        if (!existing || d > existing.rawDate) {
          map.set(normalized, {
            id: normalized,
            name: item.categoryName || getCategoryTitle(normalized),
            icon: CATEGORY_ICONS[normalized] || "🌱",
            score: item.score,
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            rawDate: d,
            status: getScoreStatusBadge(item.score).label,
          });
        }
      });
    }

    return Array.from(map.values()).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  }, [allCategories, recentHistory]);

  // Compute Active Category Score History & Trend (strictly isolated for active category)
  const activeScoreHistory = useMemo(() => {
    const entries: { date: string; score: number; fullDate: Date }[] = [];

    // 1. Include completed assessment attempts for this active category from backend history
    if (Array.isArray(recentHistory)) {
      recentHistory.forEach((item) => {
        const rawCat = item.categoryId || "";
        const itemCat = rawCat === "working_professional" ? "working-professional" : rawCat;
        if (itemCat === currentCategory && typeof item.score === "number") {
          const d = new Date(item.completedAt);
          entries.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: item.score,
            fullDate: d,
          });
        }
      });
    }

    // 2. Include check-in history entries specifically matching active category
    if (Array.isArray(history)) {
      history.forEach((item) => {
        const rawCat = item.category || "";
        const itemCat = rawCat === "working_professional" ? "working-professional" : rawCat;
        if (itemCat === currentCategory && typeof item.wellnessScore === "number") {
          const d = new Date(item.checkinDate || item.createdAt);
          entries.push({
            date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            score: item.wellnessScore,
            fullDate: d,
          });
        }
      });
    }

    // Sort ascending by date
    entries.sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

    // If current assessed score is available and not in entries, append it
    if (isCurrentAssessed && currentScore !== null) {
      if (entries.length === 0 || entries[entries.length - 1].score !== currentScore) {
        entries.push({
          date: "Today",
          score: currentScore,
          fullDate: new Date(),
        });
      }
    }

    return entries;
  }, [recentHistory, history, currentCategory, isCurrentAssessed, currentScore]);

  // Score change delta calculation
  const scoreDelta = useMemo(() => {
    if (activeScoreHistory.length < 2) return null;
    const current = activeScoreHistory[activeScoreHistory.length - 1].score;
    const previous = activeScoreHistory[activeScoreHistory.length - 2].score;
    const diff = current - previous;
    return {
      diff,
      text: `${diff >= 0 ? "+" : ""}${diff}% since previous check-in`,
      isPositive: diff >= 0,
    };
  }, [activeScoreHistory]);

  // Consistency engagement statistics
  const consistencyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthCount = Array.isArray(history)
      ? history.filter((item) => {
          const d = new Date(item.checkinDate || item.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length
      : 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    const thisWeekCount = Array.isArray(history)
      ? history.filter((item) => {
          const d = new Date(item.checkinDate || item.createdAt);
          return d >= oneWeekAgo;
        }).length
      : 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const last30DaysCount = Array.isArray(history)
      ? history.filter((item) => {
          const d = new Date(item.checkinDate || item.createdAt);
          return d >= thirtyDaysAgo;
        }).length
      : 0;

    return {
      thisMonthCount,
      thisWeekCount,
      last30DaysCount,
      streak: currentStreak,
    };
  }, [history, currentStreak]);

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

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#27272a] shadow-2xs space-y-3 transition-colors">
        <span className="px-3.5 py-1 rounded-full bg-[#EAF6F0] dark:bg-white/5 text-[#006C56] dark:text-zinc-200 text-[10.5px] font-extrabold tracking-wider border border-transparent dark:border-[rgba(95,175,138,0.30)]">
          {p.badgeLabel || "🌿 Wellness Journey"}
        </span>
        <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-white leading-tight">
          My Journey
        </h1>
        <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA] font-medium leading-relaxed max-w-xl">
          Your personal path toward emotional balance and resilience. Track your active {currentCategoryName} score, progress trend, and consistency.
        </p>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
          {/* Active Category Score summary */}
          <div
            onClick={() => {
              if (isCurrentAssessed && currentScore !== null) {
                openReattemptModal(currentCategory);
              } else {
                openAssessment(currentCategory);
              }
            }}
            className="p-4 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] flex items-center justify-between cursor-pointer hover:border-[#006B56]/60 dark:hover:border-zinc-400/60 hover:bg-[#E6F4F0] dark:hover:bg-[#163830] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#006B56] text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                {isCurrentAssessed && currentScore !== null ? `${currentScore}%` : "--"}
              </div>
              <div>
                <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-semibold">
                  {currentCategoryName} Wellness
                </p>
                <p className="text-xs font-black text-[#006B56] dark:text-zinc-200">
                  {isCurrentAssessed && currentScore !== null ? levelBadge : "Not Assessed Yet"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#006B56] dark:text-zinc-200 opacity-80 group-hover:opacity-100">
              {isCurrentAssessed && currentScore !== null ? "Retake →" : "Start Check →"}
            </span>
          </div>

          {/* Active Streak */}
          <div className="p-4 rounded-2xl bg-[#FFF8F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E37A47] text-white flex items-center justify-center text-xl shadow-xs">
              🔥
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-semibold">Active Streak</p>
              <p className="text-xs font-black text-[#E37A47] dark:text-[#F38A57]">{currentStreak} Days Consistent</p>
            </div>
          </div>

          {/* Mindfulness Time */}
          <div className="p-4 rounded-2xl bg-[#F3F5FA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#006B56] text-white flex items-center justify-center text-lg shadow-xs">
              🧘
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-semibold">Mindfulness Time</p>
              <p className="text-xs font-black text-[#19332A] dark:text-white">{mindfulnessMinutes} Mins Logged</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. YOUR CURRENT WELLNESS (Focused Single Active Category Card) */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-7 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CBECE2] dark:border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-white leading-tight">
                  Your Current Wellness
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 text-[9.5px] font-extrabold tracking-wider border border-[#CBECE2] dark:border-[#27272a]">
                  Active Category
                </span>
              </div>
              <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-medium leading-tight mt-0.5">
                Live personalized assessment for your active life-stage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPastModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAF6F2] dark:bg-[#18181b] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a] text-[#006B56] dark:text-zinc-200 text-xs font-bold border border-[#CBECE2] dark:border-[#27272a] transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <span>🕒</span>
            <span>View Past Activity →</span>
          </button>
        </div>

        {/* Active Category Focused Card (Condition / Progress card token) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#EAF6F2] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] flex items-center justify-center text-3xl shrink-0 shadow-xs">
              {CATEGORY_ICONS[currentCategory] || "🌱"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-heading font-black text-[#004D3D] dark:text-white">
                  {currentCategoryName}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#006B56] dark:bg-white dark:text-black text-white text-[9px] font-extrabold">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] font-medium">
                {isCurrentAssessed && currentScore !== null
                  ? "Your current wellness score for this category."
                  : "No assessment recorded for this category yet."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
            <div className="text-left md:text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-heading font-black text-[#006B56] dark:text-zinc-200">
                  {isCurrentAssessed && currentScore !== null ? `${currentScore}%` : "--"}
                </span>
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-[#E6F4F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 border border-[#CBECE2] dark:border-[#27272a] mt-0.5">
                {isCurrentAssessed && currentScore !== null ? levelBadge : "Not Assessed Yet"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isCurrentAssessed && currentScore !== null ? (
                <>
                  <button
                    type="button"
                    onClick={() => openBreakdownModal()}
                    className="py-2.5 px-4 rounded-full bg-white dark:bg-[#18181b] hover:bg-[#EAF6F2] dark:hover:bg-[#27272a] text-[#19332A] dark:text-white text-xs font-bold border border-[#CBECE2] dark:border-[#27272a] transition-all cursor-pointer shadow-2xs"
                  >
                    View Details →
                  </button>
                  <button
                    type="button"
                    onClick={() => openReattemptModal(currentCategory)}
                    className="py-2.5 px-4 rounded-full bg-white hover:bg-[#FFF6F2] dark:bg-[#18181b] dark:hover:bg-[#27272a] text-[#E37A47] dark:text-[#F38A57] border border-[#E37A47]/40 hover:border-[#E37A47] text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Retake Assessment
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => openAssessment(currentCategory)}
                  className="py-2.5 px-5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Start Wellness Check →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. WELLNESS INSIGHTS (Score Trend & Check-In Consistency) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Wellness Score Trend */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#27272a] shadow-2xs space-y-4 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#EAF6F0] dark:bg-white/5 text-[#006B56] dark:text-zinc-200 flex items-center justify-center font-bold text-xs">
                  📈
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-white leading-tight">
                    Wellness Score Trend
                  </h3>
                  <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-medium leading-tight">
                    {currentCategoryName} progress over time
                  </p>
                </div>
              </div>
              {scoreDelta && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    scoreDelta.isPositive
                      ? "bg-[#E6F4EA] dark:bg-white/5 text-[#137333] dark:text-zinc-200"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300"
                  }`}
                >
                  {scoreDelta.text}
                </span>
              )}
            </div>

            <div className="mt-4">
              {activeScoreHistory.length >= 2 ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-2xl font-heading font-black text-[#19332A] dark:text-white">
                        {currentScore}%
                      </span>
                      <span className="text-xs text-[#789389] dark:text-[#A1A1AA] ml-1.5 font-semibold">
                        Current Score
                      </span>
                    </div>
                  </div>

                  {/* Sparkline / Points visualization */}
                  <div className="h-28 pt-2 pb-1 border-b border-[#E2ECE6] dark:border-[#27272a] flex items-end justify-between gap-2 px-1">
                    {activeScoreHistory.map((pt, idx) => {
                      const heightPct = Math.max(15, Math.min(100, (pt.score / 100) * 100));
                      const isLast = idx === activeScoreHistory.length - 1;
                      return (
                        <div
                          key={pt.date + idx}
                          className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                        >
                          <span className="text-[9px] font-bold text-[#006B56] dark:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            {pt.score}%
                          </span>
                          <div className="w-full max-w-[28px] bg-[#EAF5EF] dark:bg-[#18181b] rounded-t-lg overflow-hidden h-full flex items-end">
                            <div
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${
                                isLast
                                  ? "bg-[#006B56] dark:bg-white dark:text-black"
                                  : "bg-[#71C79E] dark:bg-white dark:text-black/40"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-[9.5px] font-bold truncate max-w-[45px] ${
                              isLast
                                ? "text-[#006B56] dark:text-zinc-200"
                                : "text-[#789389] dark:text-[#A1A1AA]"
                            }`}
                          >
                            {pt.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#E2ECE6] dark:border-[#27272a] text-center space-y-2">
                  <span className="text-2xl">🌱</span>
                  <p className="text-xs font-bold text-[#19332A] dark:text-white">
                    {isCurrentAssessed ? "Complete another wellness check to start tracking your progress over time." : "No wellness trend yet."}
                  </p>
                  <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA]">
                    {isCurrentAssessed
                      ? "Your score changes and trend graph will appear after multiple assessments."
                      : "Complete a wellness check to start tracking your progress over time."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Check-In Consistency */}
        <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#27272a] shadow-2xs space-y-4 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#FFF4EB] dark:bg-[#1E1914] text-[#F28C4B] dark:text-[#F38A57] flex items-center justify-center font-bold text-xs">
                🔥
              </div>
              <div>
                <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-white leading-tight">
                  Check-In Consistency
                </h3>
                <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-medium leading-tight">
                  Your daily mindfulness and check-in engagement
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#E2ECE6] dark:border-[#27272a]">
                <span className="text-lg">🔥</span>
                <p className="text-xl font-heading font-black text-[#E37A47] dark:text-[#F38A57] mt-1">
                  {consistencyStats.thisMonthCount} {consistencyStats.thisMonthCount === 1 ? "check-in" : "check-ins"}
                </p>
                <p className="text-[10.5px] text-[#789389] dark:text-[#A1A1AA] font-semibold">
                  this month
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#E2ECE6] dark:border-[#27272a]">
                <span className="text-lg">📅</span>
                <p className="text-xl font-heading font-black text-[#006B56] dark:text-zinc-200 mt-1">
                  {consistencyStats.thisWeekCount} / 7 days
                </p>
                <p className="text-[10.5px] text-[#789389] dark:text-[#A1A1AA] font-semibold">
                  active this week
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-[#F2FAF6] dark:bg-[#18181b] border border-[#E2ECE6] dark:border-[#27272a] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#4F685F] dark:text-[#A1A1AA] font-medium">
                Total recorded check-ins:
              </span>
              <span className="font-heading font-black text-[#006B56] dark:text-zinc-200">
                {consistencyStats.last30DaysCount} in last 30 days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Daily Check-In Timeline Section with Filters */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#27272a] shadow-2xs space-y-5 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E2ECE6] dark:border-[#27272a]">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-white leading-tight">
              Daily Check-In Timeline
            </h2>
            <p className="text-[11px] text-[#789389] dark:text-[#A1A1AA] font-medium leading-tight mt-0.5">
              Review your mood entries, wellness notes, and verified check-ins
            </p>
          </div>

          {/* Time & Mood Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Filter */}
            <div className="flex items-center bg-[#F4FAF7] dark:bg-[#18181b] p-1 rounded-xl border border-[#E2ECE6] dark:border-[#27272a]">
              {TIME_FILTER_OPTIONS.map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTimeFilter(tf)}
                  className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                    timeFilter === tf
                      ? "bg-[#006B56] dark:bg-white dark:text-black text-white shadow-xs"
                      : "text-[#4F685F] dark:text-[#A1A1AA] hover:text-[#19332A] dark:hover:text-[#F4FAF7]"
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
              className="px-3 py-1.5 rounded-xl bg-[#F4FAF7] dark:bg-[#18181b] text-[#19332A] dark:text-white text-[11px] font-bold border border-[#E2ECE6] dark:border-[#27272a] focus:outline-none cursor-pointer"
            >
              {MOOD_FILTER_OPTIONS.map((mf) => (
                <option key={mf} value={mf} className="text-black dark:text-white dark:bg-[#18181b]">
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
              <div className="w-7 h-7 border-2 border-[#006B56] dark:border-white/20 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#789389] dark:text-[#A1A1AA]">Loading check-in history...</p>
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
                  className="p-4 sm:p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#E2ECE6] dark:border-[#27272a] hover:border-[#006B56]/50 dark:hover:border-white/30 dark:hover:bg-[#27272a] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Large Mood Emoji Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#121214] border border-[#D2E8DC] dark:border-[#27272a] flex items-center justify-center text-2xl shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {emoji}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-heading font-black text-[#19332A] dark:text-white">
                          {dateLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-white/5 text-[#006C56] dark:text-zinc-200 text-[10px] font-bold">
                          {emoji} {moodLabel}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#121214] text-[#4F685F] dark:text-[#A1A1AA] text-[9.5px] font-bold border border-transparent dark:border-[#27272a]">
                          {categoryTitle}
                        </span>
                        {timeLabel && (
                          <span className="text-[10px] text-[#789389] dark:text-[#A1A1AA]">
                            • {timeLabel}
                          </span>
                        )}
                      </div>

                      {/* Note / Reflection Preview */}
                      {noteText ? (
                        <p className="text-xs text-[#4F685F] dark:text-[#E4E4E7] font-medium leading-relaxed italic line-clamp-2">
                          “{noteText}”
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#789389] dark:text-[#A1A1AA] font-normal">
                          Daily mood check-in recorded.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Score Ring / Pill */}
                  {score !== null && (
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E2ECE6] dark:border-[#27272a]">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF6F0] dark:bg-white/5 text-[#006C56] dark:text-zinc-200 border border-transparent dark:border-[#27272a]">
                        <span className="text-[10px] font-extrabold">Score</span>
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
                <h4 className="text-xs font-bold text-[#19332A] dark:text-white">
                  No check-ins match the selected filters
                </h4>
                <p className="text-[11px] text-[#789389] dark:text-[#A1A1AA]">
                  Complete your daily check-in from the dashboard to see entries here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => openAssessment(currentCategory)}
                className="px-4 py-2 rounded-xl bg-[#006C56] hover:bg-[#005B48] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Check In Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Past Wellness Activity Modal */}
      {isPastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121214] border border-[#E2ECE6] dark:border-[#27272a] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE6] dark:border-[#27272a]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] dark:bg-white/5 text-[#006C56] dark:text-zinc-200 flex items-center justify-center text-sm">
                  🕒
                </div>
                <div>
                  <h3 className="text-base font-heading font-black text-[#19332A] dark:text-white">
                    Past Wellness Activity
                  </h3>
                  <p className="text-[10.5px] text-[#789389] dark:text-[#A1A1AA] font-medium">
                    Categories and assessments you have previously opened
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPastModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#F4FAF7] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] flex items-center justify-center hover:bg-[#E2ECE6] dark:hover:bg-[#27272a] dark:hover:text-[#F4FAF7] transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 [scrollbar-width:thin]">
              {pastActivityList.length > 0 ? (
                pastActivityList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#E2ECE6] dark:border-[#27272a] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-[#19332A] dark:text-white">
                            {item.name}
                          </h4>
                          {item.id === currentCategory && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#006C56] text-white text-[8px] font-extrabold">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#789389] dark:text-[#A1A1AA] font-medium mt-0.5">
                          Last active: {item.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-heading font-black ${
                          item.score !== null ? "text-[#006C56] dark:text-zinc-200" : "text-[#789389] dark:text-[#A1A1AA]"
                        }`}
                      >
                        {item.score !== null ? `${item.score}%` : "--"}
                      </span>
                      <p className="text-[9.5px] font-bold text-[#527065] dark:text-[#A1A1AA]">
                        {item.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center space-y-2">
                  <span className="text-3xl">🌱</span>
                  <p className="text-xs font-bold text-[#19332A] dark:text-white">
                    No past wellness activity yet.
                  </p>
                  <p className="text-[11px] text-[#789389] dark:text-[#A1A1AA] max-w-xs mx-auto">
                    Your previous category activity and check-in records will appear here as you engage.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E2ECE6] dark:border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => setIsPastModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#18181b] dark:hover:bg-[#27272a] text-[#19332A] dark:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
