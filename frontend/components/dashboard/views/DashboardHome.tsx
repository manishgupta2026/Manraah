"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";
import RecommendedProfessionals from "../therapists/RecommendedProfessionals";

const MOTIVATIONAL_QUOTES = [
  "“You are stronger than you think, and you're doing better than you realize.”",
  "“Peace comes from within. Give yourself permission to pause and breathe today.”",
  "“Almost everything will work again if you unplug it for a few minutes, including you.”",
  "“Small steps every single day lead to massive, enduring changes in your well-being.”",
  "“You don't have to control your thoughts. You just have to stop letting them control you.”",
];

interface DashboardHomeProps {
  onNavigate?: (section: "dashboard" | "appointments" | "journey" | "resources" | "ai-companion") => void;
}

interface UpcomingAppointmentData {
  id: string;
  therapistId: string;
  therapistName: string;
  therapistRole: string;
  therapistImage: string;
  appointmentDate: string;
  status: string;
}

function formatAppointmentDisplay(isoDateStr: string): string {
  try {
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return "Upcoming Session";

    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${day} ${month} ${year}, ${time}`;
  } catch {
    return "Upcoming Session";
  }
}

function formatCategoryDisplayName(raw?: string | null): string {
  if (!raw) return "Working Professional";
  const s = raw.trim();
  const lower = s.toLowerCase().replace(/_/g, "-");

  if (lower === "student" || lower === "academic" || lower === "student & academics" || lower.startsWith("student")) {
    return "Student";
  }
  if (
    lower === "working-professional" ||
    lower === "workingprofessional" ||
    lower === "young-pro" ||
    lower === "youngpro" ||
    lower === "work" ||
    lower === "career"
  ) {
    return "Working Professional";
  }
  if (lower === "parent" || lower === "parents" || lower === "parents & families" || lower.startsWith("parent")) {
    return "Parent";
  }
  if (lower === "couple" || lower === "couples" || lower === "couples & relationships" || lower.startsWith("couple")) {
    return "Couple";
  }
  if (
    lower === "other" ||
    lower === "others" ||
    lower === "other / general" ||
    lower === "other/general" ||
    lower === "general" ||
    lower === "other-general"
  ) {
    return "Other";
  }
  if (lower === "women") return "Women";
  if (lower === "men") return "Men";
  if (lower === "family" || lower === "families") return "Family";
  if (lower === "senior-citizen" || lower === "seniorcitizen") return "Senior Citizen";

  return s;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isUserAuthenticated = Boolean(isAuthenticated && user?.id);
  const { currentStreak, hasCheckedInToday } = useWellness();
  const {
    currentCategory,
    currentCategoryName,
    currentScore,
    isCurrentAssessed,
    levelBadge,
    openBreakdownModal,
    openAssessment,
    openReattemptModal,
  } = useWellnessScore();

  const userName = isUserAuthenticated
    ? user?.name || user?.sanctuaryName || "Sanctuary Member"
    : "Guest";

  const isFirstLoginState = isUserAuthenticated && typeof user?.hasLoggedInBefore === "boolean"
    ? !user.hasLoggedInBefore
    : false;

  const [upcomingAppointment, setUpcomingAppointment] = useState<UpcomingAppointmentData | null>(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Fetch real upcoming appointment from backend only when authenticated
  useEffect(() => {
    if (!isUserAuthenticated) {
      setUpcomingAppointment(null);
      setIsLoadingAppointment(false);
      return;
    }

    let isMounted = true;

    async function loadUpcomingAppointment() {
      try {
        setIsLoadingAppointment(true);
        const res = await fetch("/api/appointments/upcoming");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUpcomingAppointment(data.upcomingAppointment || null);
          }
        } else {
          if (isMounted) {
            setUpcomingAppointment(null);
          }
        }
      } catch (err) {
        console.error("Error loading upcoming appointment:", err);
        if (isMounted) {
          setUpcomingAppointment(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAppointment(false);
        }
      }
    }

    loadUpcomingAppointment();

    const handleAppointmentsChange = () => {
      loadUpcomingAppointment();
    };

    window.addEventListener("appointments-updated", handleAppointmentsChange);
    return () => {
      isMounted = false;
      window.removeEventListener("appointments-updated", handleAppointmentsChange);
    };
  }, [isUserAuthenticated]);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const quickTools = [
    {
      id: "appointments",
      title: "Book Session",
      section: "appointments" as const,
      cardBg: "bg-[#F5F4FA] hover:bg-[#EBE9F5] dark:bg-[#14382F] dark:hover:bg-[#19463B] dark:border dark:border-[#23483E]",
      iconColor: "text-[#5C4EB5] dark:text-[#CFC4F7]",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "journey",
      title: "My Journey",
      section: "journey" as const,
      cardBg: "bg-[#EEF7FB] hover:bg-[#E1F1F8] dark:bg-[#14382F] dark:hover:bg-[#19463B] dark:border dark:border-[#23483E]",
      iconColor: "text-[#1C92D2] dark:text-[#88F7D6]",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "resources",
      title: "Resource Library",
      section: "resources" as const,
      cardBg: "bg-[#EDF8F4] hover:bg-[#DEEFE8] dark:bg-[#14382F] dark:hover:bg-[#19463B] dark:border dark:border-[#23483E]",
      iconColor: "text-[#008968] dark:text-[#00A982]",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "ai-companion",
      title: "AI Companion",
      section: "ai-companion" as const,
      cardBg: "bg-[#F3F5FA] hover:bg-[#E5E9F3] dark:bg-[#14382F] dark:hover:bg-[#19463B] dark:border dark:border-[#23483E]",
      iconColor: "text-[#3D52A0] dark:text-[#A8C7FA]",
      icon: (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  if (authLoading && !user) {
    return (
      <div className="w-full min-w-0 flex flex-col gap-5 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-200 dark:bg-[#14382F] rounded-full" />
            <div className="h-8 w-48 bg-slate-200 dark:bg-[#14382F] rounded-xl" />
            <div className="h-5 w-24 bg-slate-200 dark:bg-[#14382F] rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-36 bg-slate-200 dark:bg-[#14382F] rounded-2xl" />
            <div className="h-14 w-44 bg-slate-200 dark:bg-[#14382F] rounded-2xl" />
          </div>
        </div>
        <div className="h-44 w-full bg-slate-200 dark:bg-[#14382F] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Top Welcome Banner + Streak & Next Appointment Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        {/* Greeting: WELCOME for first-time login vs WELCOME BACK for returning logins */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]" suppressHydrationWarning>
            {isFirstLoginState ? "WELCOME" : "WELCOME BACK"}
          </span>
          <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight" suppressHydrationWarning>
            Hi, {userName}! 👋
          </h1>
          <div className="pt-0.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6] border border-[#D2EAE0] dark:border-[#23483E]" suppressHydrationWarning>
              Active Profile: {formatCategoryDisplayName(user?.selectedCategory || currentCategory)}
            </span>
          </div>
        </div>

        {/* Right: Streak & Next Appointment Cards */}
        <div className="flex items-center gap-3">
          {/* Dynamic Streak Card */}
          <div className="bg-white dark:bg-[#102F27] rounded-2xl p-2.5 px-4 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex items-center gap-3 min-w-[145px] transition-colors">
            <span className="text-xl leading-none">🔥</span>
            <div>
              <p className="text-[11px] font-black text-[#F28C4B] leading-tight">
                Day {currentStreak} Streak
              </p>
              <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                {currentStreak > 0
                  ? hasCheckedInToday
                    ? "You're doing great!"
                    : "Check in today!"
                  : "Start your streak!"}
              </p>
            </div>
          </div>

          {/* Dynamic Next Appointment Card */}
          <div
            onClick={() => {
              if (onNavigate) {
                onNavigate("appointments");
              }
            }}
            className="bg-white dark:bg-[#102F27] rounded-2xl p-2.5 px-4 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex items-center gap-3 min-w-[175px] max-w-[240px] transition-all cursor-pointer hover:border-[#008968]/50 dark:hover:border-[#00A982]/50 group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-semibold leading-tight">
                Next Appointment
              </p>
              <p className="text-[11px] font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5 truncate">
                {isLoadingAppointment ? (
                  <span className="text-[#789389] dark:text-[#78958C] font-medium animate-pulse">Loading...</span>
                ) : upcomingAppointment ? (
                  formatAppointmentDisplay(upcomingAppointment.appointmentDate)
                ) : (
                  <span className="text-[#789389] dark:text-[#78958C] font-semibold text-[10px]">No upcoming appointment</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recommended for You (Dynamic Horizontal Therapist Carousel) */}
      <RecommendedProfessionals onNavigate={onNavigate} />

      {/* 3. Today's Motivation Card */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#FFF8E7] dark:bg-[#14382F] text-[#F1C40F] dark:text-[#F28C4B] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Today&apos;s Motivation
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                A little encouragement for your journey.
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1 text-xs font-bold text-[#006C56] dark:text-[#00A982] hover:text-[#004D3D] dark:hover:text-[#BFE8DC] transition-colors cursor-pointer select-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>New Quote</span>
          </button>
        </div>

        {/* Soft Mint / Dark Emerald Quote Banner */}
        <div className="bg-[#EBF7F2] dark:bg-[#14382F] rounded-2xl p-4 px-5 flex items-center gap-3.5 border border-transparent dark:border-[#23483E]/50 transition-colors">
          <span className="font-serif text-2xl font-black text-[#006C56] dark:text-[#00A982] leading-none shrink-0 -mt-0.5">
            “
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="text-xs sm:text-sm font-semibold italic text-[#19332A] dark:text-[#F4FAF7] leading-snug"
            >
              {MOTIVATIONAL_QUOTES[quoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Bottom Row: Quick Tools + Wellness Score (Deliberate 2-Column Grid, Equal Height) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Quick Tools (7 cols, Full Height) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3.5 h-full min-h-[204px] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  Quick Tools
                </h3>
                <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                  Simple tools for a calmer, healthier you.
                </p>
              </div>
            </div>

            {onNavigate ? (
              <button
                onClick={() => onNavigate("journey")}
                type="button"
                className="text-xs font-bold text-[#004D3D] dark:text-[#00A982] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            ) : (
              <Link
                href="/journey"
                className="text-xs font-bold text-[#004D3D] dark:text-[#00A982] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            )}
          </div>

          {/* 4 Tool Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-auto w-full">
            {quickTools.map((tool) => {
              if (onNavigate) {
                return (
                  <button
                    key={tool.id}
                    onClick={() => onNavigate(tool.section)}
                    type="button"
                    className={`${tool.cardBg} rounded-2xl p-2.5 py-3 flex flex-col items-center text-center justify-center space-y-1.5 min-h-[76px] transition-all group cursor-pointer w-full`}
                  >
                    <div className={`p-1.5 rounded-xl ${tool.iconColor} transition-transform group-hover:scale-110`}>
                      {tool.icon}
                    </div>
                    <span className="text-[9.5px] font-bold text-[#19332A] dark:text-[#F4FAF7] leading-tight line-clamp-2">
                      {tool.title}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={tool.id}
                  href={`/${tool.section}`}
                  className={`${tool.cardBg} rounded-2xl p-2.5 py-3 flex flex-col items-center text-center justify-center space-y-1.5 min-h-[76px] transition-all group`}
                >
                  <div className={`p-1.5 rounded-xl ${tool.iconColor} transition-transform group-hover:scale-110`}>
                    {tool.icon}
                  </div>
                  <span className="text-[9.5px] font-bold text-[#19332A] dark:text-[#F4FAF7] leading-tight line-clamp-2">
                    {tool.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Category Wellness Score (5 cols, Full Height) */}
        <div
          onClick={() => {
            if (isCurrentAssessed && currentScore !== null) {
              openReattemptModal(currentCategory);
            } else {
              openAssessment(currentCategory);
            }
          }}
          className="lg:col-span-5 bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3.5 h-full min-h-[204px] transition-all cursor-pointer hover:border-[#008968]/50 dark:hover:border-[#00A982]/50 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  {currentCategoryName} Wellness
                </h3>
                <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                  {isCurrentAssessed && currentScore !== null
                    ? "Based on your wellness assessment"
                    : "Complete your first wellness check"}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#006C56] dark:text-[#00A982] group-hover:translate-x-0.5 transition-transform">
              {isCurrentAssessed && currentScore !== null ? "Re-attempt Check →" : "Start Check →"}
            </span>
          </div>

          {/* Circular Score and Status */}
          <div className="flex items-center gap-4 my-auto px-1">
            {/* Ring */}
            <div className="relative w-[76px] h-[76px] flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#E9F3EE] dark:text-[#14382F]"
                  strokeWidth="10"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#008968] dark:text-[#00A982] transition-all duration-700"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    isCurrentAssessed && currentScore !== null
                      ? 2 * Math.PI * 40 * (1 - currentScore / 100)
                      : 2 * Math.PI * 40
                  }
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {isCurrentAssessed && currentScore !== null ? `${currentScore}%` : "--"}
                </span>
              </div>
            </div>

            {/* Text Status */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-[#008968] dark:text-[#00A982] leading-tight">
                  {isCurrentAssessed && currentScore !== null
                    ? currentScore >= 80
                      ? "Flourishing!"
                      : currentScore >= 60
                      ? "Good Progress"
                      : currentScore >= 40
                      ? "Fair Balance"
                      : "Needs Attention"
                    : "Not Assessed Yet"}
                </h4>
                {isCurrentAssessed && (
                  <span className="px-1.5 py-0.2 rounded-md bg-[#008968]/10 text-[#008968] dark:text-[#00A982] text-[8.5px] font-bold">
                    {levelBadge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight">
                {isCurrentAssessed && currentScore !== null
                  ? "Click to re-attempt assessment."
                  : "Click to start 5-question check."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
