"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";
import { USER_CATEGORIES } from "@/frontend/lib/constants";
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

function normalizeCategoryKey(raw?: string | null): string {
  if (!raw) return "working_professional";
  const s = raw.trim().toLowerCase().replace(/[-_]/g, "");
  if (s === "student" || s === "academic") return "student";
  if (s === "parent" || s === "parents") return "parent";
  if (s === "couple" || s === "couples") return "couple";
  if (s === "workingprofessional" || s === "youngpro" || s === "work" || s === "career") return "working_professional";
  if (s === "other" || s === "others" || s === "general") return "other";
  return raw.trim().toLowerCase().replace(/-/g, "_");
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
  const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
  const isUserAuthenticated = Boolean(isAuthenticated && user?.id);
  const { setCategory } = useCategory();
  const { currentStreak, hasCheckedInToday, refetchDashboardData, refetchWellnessData } = useWellness();
  const {
    currentCategory,
    triggerProfilePrompt,
    refetchScores,
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
  const [isSwitchProfileOpen, setIsSwitchProfileOpen] = useState(false);
  const [isSwitchingProfile, setIsSwitchingProfile] = useState(false);

  const activeCategoryKey = normalizeCategoryKey(user?.selectedCategory || currentCategory);

  const handleSwitchCategory = async (targetCategoryId: string) => {
    if (isSwitchingProfile) return;
    setIsSwitchingProfile(true);
    try {
      const canonicalSlug = targetCategoryId.replace(/_/g, "-");

      // 1. Set cookie for SSR/client session sync
      document.cookie = `userType=${targetCategoryId}; path=/; max-age=2592000; SameSite=Lax`;

      // 2. Update CategoryContext
      setCategory(targetCategoryId as any);

      // 3. Update persistent user profile if logged in
      if (isUserAuthenticated) {
        await updateUser({
          selectedCategory: targetCategoryId as any,
        });
      }

      // 4. Trigger context updates
      if (refetchScores) {
        await refetchScores();
      }
      if (refetchDashboardData) {
        await refetchDashboardData();
      }
      if (refetchWellnessData) {
        await refetchWellnessData();
      }

      // 5. Close switcher modal
      setIsSwitchProfileOpen(false);

      // 6. Prompt assessment if needed for the new profile
      if (triggerProfilePrompt) {
        triggerProfilePrompt(canonicalSlug);
      }
    } catch (err) {
      console.error("Failed to switch active profile:", err);
    } finally {
      setIsSwitchingProfile(false);
    }
  };

  // Fetch real upcoming appointment from backend only when authenticated
  useEffect(() => {
    if (!isUserAuthenticated) {
      setUpcomingAppointment(null);
      setIsLoadingAppointment(false);
      return;
    }

    let isMounted = true;
    let hasLoadedRef = false;

    async function loadUpcomingAppointment(isInitial = false) {
      try {
        if (isInitial || !hasLoadedRef) {
          setIsLoadingAppointment(true);
        }
        const res = await fetch("/api/appointments/upcoming");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUpcomingAppointment(data.upcomingAppointment || null);
            hasLoadedRef = true;
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

    loadUpcomingAppointment(true);

    const handleAppointmentsChange = () => {
      loadUpcomingAppointment(false);
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
      cardBg: "bg-[#F5F4FA] hover:bg-[#EBE9F5] dark:bg-[#0E3931] dark:hover:bg-[#12463C] dark:border dark:border-[rgba(150,210,195,0.12)]",
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
      cardBg: "bg-[#EEF7FB] hover:bg-[#E1F1F8] dark:bg-[#0E3931] dark:hover:bg-[#12463C] dark:border dark:border-[rgba(150,210,195,0.12)]",
      iconColor: "text-[#1C92D2] dark:text-[#8EBBFF]",
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
      cardBg: "bg-[#EDF8F4] hover:bg-[#DEEFE8] dark:bg-[#0E3931] dark:hover:bg-[#12463C] dark:border dark:border-[rgba(150,210,195,0.12)]",
      iconColor: "text-[#008968] dark:text-[#00A889]",
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
      cardBg: "bg-[#F3F5FA] hover:bg-[#E5E9F3] dark:bg-[#0E3931] dark:hover:bg-[#12463C] dark:border dark:border-[rgba(150,210,195,0.12)]",
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
            <div className="h-3 w-28 bg-slate-200 dark:bg-[#0B3029] rounded-full" />
            <div className="h-8 w-48 bg-slate-200 dark:bg-[#0B3029] rounded-xl" />
            <div className="h-5 w-24 bg-slate-200 dark:bg-[#0B3029] rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-36 bg-slate-200 dark:bg-[#0B3029] rounded-2xl" />
            <div className="h-14 w-44 bg-slate-200 dark:bg-[#0B3029] rounded-2xl" />
          </div>
        </div>
        <div className="h-44 w-full bg-slate-200 dark:bg-[#0B3029] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Top Welcome Banner + Streak & Next Appointment Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        {/* Greeting: Welcome for first-time login vs Welcome back for returning logins */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-black tracking-widest text-[#006C56] dark:text-[#00A889]" suppressHydrationWarning>
            {isFirstLoginState ? "Welcome" : "Welcome back"}
          </span>
          <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight" suppressHydrationWarning>
            Hi, {userName}! 👋
          </h1>
          <div className="pt-0.5 flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#73D8C4] border border-[#D2EAE0] dark:border-[rgba(0,168,137,0.30)]" suppressHydrationWarning>
              Active Profile: {formatCategoryDisplayName(user?.selectedCategory || currentCategory)}
            </span>
            <button
              type="button"
              onClick={() => setIsSwitchProfileOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#006C56] hover:text-[#004D3D] dark:text-[#00A889] dark:hover:text-[#73D8C4] transition-all cursor-pointer group py-0.5 px-2 rounded-full hover:bg-[#EAF6F0]/70 dark:hover:bg-[rgba(0,168,137,0.12)] border border-transparent hover:border-[#D2EAE0] dark:hover:border-[rgba(0,168,137,0.25)]"
              aria-label="Switch Profile"
            >
              <span>Switch Profile</span>
              <span className="material-symbols-outlined text-[15px] leading-none transition-transform group-hover:scale-110">
                swap_horiz
              </span>
            </button>
          </div>
        </div>

        {/* Right: Streak & Next Appointment Cards */}
        <div className="flex items-center gap-3">
          {/* Dynamic Streak Card */}
          <div className="bg-white dark:bg-[#0B3029] rounded-2xl p-2.5 px-4 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex items-center gap-3 min-w-[145px] transition-colors">
            <span className="text-xl leading-none">🔥</span>
            <div>
              <p className="text-[11px] font-black text-[#F28C4B] leading-tight">
                Day {currentStreak} Streak
              </p>
              <p className="text-[9.5px] text-[#789389] dark:text-[#9DB9B0] font-medium leading-tight mt-0.5">
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
            className="bg-white dark:bg-[#0B3029] rounded-2xl p-2.5 px-4 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex items-center gap-3 min-w-[175px] max-w-[240px] transition-all cursor-pointer hover:border-[#008968]/50 dark:hover:border-[rgba(150,210,195,0.25)] group"
          >
            <div className="w-7 h-7 rounded-xl bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9.5px] text-[#789389] dark:text-[#9DB9B0] font-semibold leading-tight">
                Next Appointment
              </p>
              <p className="text-[11px] font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5 truncate">
                {isLoadingAppointment ? (
                  <span className="text-[#789389] dark:text-[#9DB9B0] font-medium animate-pulse">Loading...</span>
                ) : upcomingAppointment ? (
                  formatAppointmentDisplay(upcomingAppointment.appointmentDate)
                ) : (
                  <span className="text-[#789389] dark:text-[#9DB9B0] font-semibold text-[10px]">No upcoming appointment</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recommended for You (Dynamic Horizontal Therapist Carousel) */}
      <RecommendedProfessionals onNavigate={onNavigate} />

      {/* 3. Today's Motivation Card */}
      <div className="bg-white dark:bg-[#0E3931] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#FFF8E7] dark:bg-[#12463C] text-[#F1C40F] dark:text-[#F28C4B] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Today&apos;s Motivation
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#9DB9B0] font-medium leading-tight mt-0.5">
                A little encouragement for your journey.
              </p>
            </div>
          </div>

          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1 text-xs font-bold text-[#006C56] dark:text-[#00A889] hover:text-[#004D3D] dark:hover:text-[#00BFA3] transition-colors cursor-pointer select-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>New Quote</span>
          </button>
        </div>

        {/* Soft Mint / Dark Emerald Quote Banner */}
        <div className="bg-[#EBF7F2] dark:bg-[#12463C] rounded-2xl p-4 px-5 flex items-center gap-3.5 border border-transparent dark:border-[rgba(150,210,195,0.12)] transition-colors">
          <span className="font-serif text-2xl font-black text-[#006C56] dark:text-[#00A889] leading-none shrink-0 -mt-0.5">
            “
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIndex}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="text-xs sm:text-sm font-semibold italic text-[#19332A] dark:text-[#E5F3EF] leading-snug"
            >
              {MOTIVATIONAL_QUOTES[quoteIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Bottom Row: Quick Tools + 100% Confidential (Deliberate 2-Column Grid, Equal Height) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Quick Tools (7 cols, Full Height) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B3029] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex flex-col justify-between gap-3.5 h-full min-h-[204px] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#00A889] flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  Quick Tools
                </h3>
                <p className="text-[9.5px] text-[#789389] dark:text-[#9DB9B0] font-medium leading-tight mt-0.5">
                  Simple tools for a calmer, healthier you.
                </p>
              </div>
            </div>

            {onNavigate ? (
              <button
                onClick={() => onNavigate("journey")}
                type="button"
                className="text-xs font-bold text-[#004D3D] dark:text-[#00A889] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            ) : (
              <Link
                href="/journey"
                className="text-xs font-bold text-[#004D3D] dark:text-[#00A889] hover:underline flex items-center gap-1"
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

        {/* Right: 100% Confidential Card (5 cols, Full Height) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B3029] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs flex flex-col justify-between gap-3.5 h-full min-h-[204px] transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  100% Confidential
                </h3>
                <p className="text-[9.5px] text-[#789389] dark:text-[#9DB9B0] font-medium leading-tight mt-0.5">
                  Privacy by design
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#73D8C4] border border-[#D2EAE0] dark:border-[rgba(0,168,137,0.25)]">
              ✓ Protected
            </span>
          </div>

          <div className="my-auto py-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006C56] dark:bg-[#00A889] shrink-0" />
              <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                No data ever leaves this device.
              </p>
            </div>
            <p className="text-[11px] text-[#4F685F] dark:text-[#9DB9B0] font-normal leading-relaxed">
              Your daily check-ins, assessment metrics, and wellness conversations are strictly private and encrypted.
            </p>
          </div>

          <div className="pt-2 border-t border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex items-center justify-between text-[10px] text-[#789389] dark:text-[#9DB9B0]">
            <span>End-to-end encrypted</span>
            <span className="font-bold text-[#006C56] dark:text-[#00A889]">Manraah Trust</span>
          </div>
        </div>
      </div>

      {/* Switch Profile Modal */}
      <AnimatePresence>
        {isSwitchProfileOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#0B3029] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4"
            >
              {/* Top Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#72D7C3] border border-[#D2EAE0] dark:border-[rgba(0,168,137,0.30)]">
                    <span className="material-symbols-outlined text-[12px] leading-none">swap_horiz</span>
                    <span>Switch Profile</span>
                  </div>
                  <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                    Select Your Active Profile
                  </h3>
                  <p className="text-xs text-[#5A756C] dark:text-[#9DB9B0]">
                    Select your current life category to tailor your daily check-ins, assessments, and wellness tracking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => !isSwitchingProfile && setIsSwitchProfileOpen(false)}
                  disabled={isSwitchingProfile}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#789389] hover:text-[#19332A] dark:text-[#9DB9B0] dark:hover:text-[#F4FAF7] hover:bg-[#F0F5F2] dark:hover:bg-[#0E3931] transition-colors cursor-pointer shrink-0"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Categories list */}
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-0.5 custom-scrollbar">
                {USER_CATEGORIES.map((cat) => {
                  const isCurrent = activeCategoryKey === normalizeCategoryKey(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isSwitchingProfile}
                      onClick={() => handleSwitchCategory(cat.id)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center gap-3.5 group cursor-pointer ${
                        isCurrent
                          ? "bg-[#EAF6F0]/80 dark:bg-[rgba(0,168,137,0.15)] border-[#008968] dark:border-[#00A889] shadow-xs"
                          : "bg-[#F8FAF9] dark:bg-[#0E3931] hover:bg-white dark:hover:bg-[#12463C] border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] hover:border-[#008968]/50 dark:hover:border-[#00A889]/50 shadow-2xs hover:shadow-xs"
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border transition-transform group-hover:scale-105 ${
                          isCurrent
                            ? "bg-white dark:bg-[#08221D] border-[#008968]/30 dark:border-[#00A889]/30 shadow-xs"
                            : "bg-white dark:bg-[#0B3029] border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]"
                        }`}
                      >
                        {cat.emoji}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                            {cat.name}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-black bg-[#006C56] dark:bg-[#00A889] text-white">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#5A756C] dark:text-[#9DB9B0] line-clamp-2 mt-0.5 font-normal leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {isCurrent ? (
                          <span className="material-symbols-outlined text-[#006C56] dark:text-[#73D8C4] text-xl">
                            check_circle
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-[#789389] dark:text-[#9DB9B0] group-hover:text-[#006C56] dark:group-hover:text-[#00A889] group-hover:translate-x-0.5 transition-all text-xl">
                            arrow_forward
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom footer notice */}
              <div className="pt-2 border-t border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex items-center justify-between text-[11px] text-[#789389] dark:text-[#9DB9B0]">
                <span>
                  {isSwitchingProfile ? "Updating active profile..." : "Switching updates your assessments & dashboard."}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSwitchProfileOpen(false)}
                  disabled={isSwitchingProfile}
                  className="font-heading font-bold text-[#5A756C] hover:text-[#19332A] dark:text-[#9DB9B0] dark:hover:text-[#F4FAF7] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
