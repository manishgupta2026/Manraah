"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";

const MOTIVATIONAL_QUOTES = [
  "“You are stronger than you think, and you're doing better than you realize.”",
  "“Peace comes from within. Give yourself permission to pause and breathe today.”",
  "“Almost everything will work again if you unplug it for a few minutes, including you.”",
  "“Small steps every single day lead to massive, enduring changes in your well-being.”",
  "“You don't have to control your thoughts. You just have to stop letting them control you.”",
];

const RECOMMENDED_PROFESSIONALS = [
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist",
    rating: "4.9",
    reviewCount: "120+",
    experience: "12+ yrs experience",
    badge: "Top Rated",
    badgeClass: "bg-[#DCF2E7] text-[#006C56] dark:bg-[#14382F] dark:text-[#88F7D6]",
    description:
      "Specializes in anxiety, stress management, and emotional well-being. Helping you build a calmer, more confident you.",
    image: "/images/therapist_sarah.jpg",
    bgTint: "bg-[#F0F9F5] dark:bg-[#102F27]",
    borderClass: "border border-[#D6EFE2] dark:border-[#23483E]",
    tags: [
      { text: "Anxiety & Stress", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Self-Esteem", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Emotional Well-being", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
  },
  {
    id: "dr-arjun-mehta",
    name: "Dr. Arjun Mehta",
    role: "Career Counselor",
    rating: "4.8",
    reviewCount: "98+",
    experience: "10+ yrs experience",
    badge: "Highly Rated",
    badgeClass: "bg-[#E1EDFA] text-[#1A73E8] dark:bg-[#153B54] dark:text-[#A8C7FA]",
    description:
      "Helps you navigate career transitions, workplace challenges, and achieve a healthier work-life balance.",
    image: "/images/therapist_arjun.jpg",
    bgTint: "bg-[#F0F6FD] dark:bg-[#102F27]",
    borderClass: "border border-[#D4E5F7] dark:border-[#23483E]",
    tags: [
      { text: "Work-Life Balance", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Career Growth", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Goal Setting", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
  },
  {
    id: "dr-neha-kapoor",
    name: "Dr. Neha Kapoor",
    role: "Relationship Therapist",
    rating: "4.9",
    reviewCount: "140+",
    experience: "14+ yrs experience",
    badge: "Popular",
    badgeClass: "bg-[#F5E6F5] text-[#8430CE] dark:bg-[#3D1D4A] dark:text-[#E2B7FA]",
    description:
      "Supports individuals and couples in building healthier, happier relationships and better communication.",
    image: "/images/user_avatar.jpg",
    bgTint: "bg-[#FAF2F8] dark:bg-[#102F27]",
    borderClass: "border border-[#F2D7EE] dark:border-[#23483E]",
    tags: [
      { text: "Relationships", lightBg: "bg-[#E1F3EA] text-[#0A6349]", darkBg: "dark:bg-[#14382F] dark:text-[#88F7D6] dark:border dark:border-[#23483E]" },
      { text: "Communication", lightBg: "bg-[#E5EFFB] text-[#185FA5]", darkBg: "dark:bg-[#14382F] dark:text-[#A8C7FA] dark:border dark:border-[#23483E]" },
      { text: "Family Well-being", lightBg: "bg-[#F2E8FA] text-[#712BB8]", darkBg: "dark:bg-[#14382F] dark:text-[#CFC4F7] dark:border dark:border-[#23483E]" },
    ],
  },
];

interface DashboardHomeProps {
  onNavigate?: (section: "dashboard" | "appointments" | "journey" | "resources" | "ai-companion") => void;
}

export default function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { currentStreak, hasCheckedInToday } = useWellness();
  const [userName, setUserName] = useState("Aditi");
  const [userCategoryLabel, setUserCategoryLabel] = useState("parenting");
  const [nextAppointment, setNextAppointment] = useState("6 Oct 2026, 09:00 PM");
  const [wellnessScore, setWellnessScore] = useState(68);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const session = getClientSession();
    if (session?.user) {
      const rawName = session.user.name || session.user.sanctuaryName || "Aditi";
      setUserName(rawName);

      const cat = (session.user.selectedCategory || "student").toLowerCase();
      if (cat.includes("work") || cat.includes("young_pro")) {
        setUserCategoryLabel("career");
      } else if (cat.includes("parent")) {
        setUserCategoryLabel("parenting");
      } else if (cat.includes("couple")) {
        setUserCategoryLabel("relationship");
      } else if (cat.includes("other")) {
        setUserCategoryLabel("mindfulness");
      } else {
        setUserCategoryLabel("academic");
      }
    }
  }, []);

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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

  return (
    <div className="w-full min-w-0 flex flex-col gap-4.5">
      {/* 1. Top Welcome Banner + Streak & Next Appointment Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5">
        {/* Greeting */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
            WELCOME BACK
          </span>
          <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
            Hi, {userName}! 👋
          </h1>
          <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium">
            Let's track your health &amp; {userCategoryLabel} wellness daily!
          </p>
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

          {/* Next Appointment Card */}
          <div className="bg-white dark:bg-[#102F27] rounded-2xl p-2.5 px-4 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex items-center gap-3 min-w-[175px] transition-colors">
            <div className="w-7 h-7 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-semibold leading-tight">
                Next Appointment
              </p>
              <p className="text-[11px] font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
                {nextAppointment}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recommended for You (3 Equal-Height, Perfectly Aligned Professional Cards) */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col gap-4 sm:gap-5 transition-colors">
        {/* Section Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Recommended for You
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                Curated by our mental health professionals
              </p>
            </div>
          </div>

          {onNavigate ? (
            <button
              onClick={() => onNavigate("appointments")}
              type="button"
              className="text-xs font-bold text-[#004D3D] dark:text-[#00A982] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          ) : (
            <Link
              href="/appointments"
              className="text-xs font-bold text-[#004D3D] dark:text-[#00A982] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          )}
        </div>

        {/* 3 Equal-Width, Equal-Height Professional Cards in 1 Row on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {RECOMMENDED_PROFESSIONALS.map((prof) => (
            <div
              key={prof.id}
              className={`${prof.bgTint} ${prof.borderClass} rounded-3xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-200 group h-full min-w-0 overflow-hidden select-none`}
            >
              {/* Top Row: Avatar + Info Header + Status Badge */}
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Contained Avatar (52px × 52px, Circular, Cover) */}
                  <div className="relative shrink-0 w-[52px] h-[52px] min-w-[52px] max-w-[52px] min-h-[52px] max-h-[52px]">
                    <div className="w-[52px] h-[52px] min-w-[52px] min-h-[52px] rounded-full overflow-hidden border-2 border-white dark:border-[#1A453B] shadow-xs bg-slate-100 dark:bg-[#14382F]">
                      <img
                        src={prof.image}
                        alt={prof.name}
                        className="w-full h-full object-cover block rounded-full"
                      />
                    </div>
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00A982] border-2 border-white dark:border-[#102F27] shadow-xs"
                      title="Available"
                    />
                  </div>

                  {/* Professional Info (Aligned Name / Role / Rating) */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] truncate leading-tight">
                      {prof.name}
                    </h3>
                    <p className="text-[11px] text-[#5A756C] dark:text-[#A9C5BC] font-semibold truncate mt-0.5 leading-tight">
                      {prof.role}
                    </p>
                    <div className="text-[10px] font-medium text-[#789389] dark:text-[#78958C] mt-1 leading-tight flex items-center gap-1 flex-wrap">
                      <span className="text-amber-500 font-bold">⭐ {prof.rating}</span>
                      <span>({prof.reviewCount})</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span>{prof.experience}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {prof.badge && (
                  <span
                    className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full ${prof.badgeClass} shrink-0 whitespace-nowrap leading-tight self-start`}
                  >
                    {prof.badge}
                  </span>
                )}
              </div>

              {/* Description (Flexible middle area with consistent height) */}
              <p className="text-[11px] text-[#4E685F] dark:text-[#A9C5BC] font-medium leading-relaxed my-3 min-h-[34px] line-clamp-2">
                {prof.description}
              </p>

              {/* Expertise Tags (Anchored above action row) */}
              <div className="flex flex-wrap gap-1.5 mb-3.5 min-h-[46px] content-start">
                {prof.tags.map((tag) => (
                  <span
                    key={tag.text}
                    className={`text-[9.5px] font-semibold px-2.5 py-0.5 rounded-full ${tag.lightBg} ${tag.darkBg} leading-tight transition-colors`}
                  >
                    {tag.text}
                  </span>
                ))}
              </div>

              {/* Bottom Action Row (Horizontally & vertically aligned across all 3 cards) */}
              <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#4E685F] dark:text-[#8EAAA1]">
                  <svg className="w-3.5 h-3.5 text-[#006C56] dark:text-[#00A982] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Available this week</span>
                </div>

                {onNavigate ? (
                  <button
                    onClick={() => onNavigate("appointments")}
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#D4EFE2] text-[#004D3D] hover:bg-[#004D3D] hover:text-white dark:bg-[#164438] dark:text-[#00A982] dark:hover:bg-[#00A982] dark:hover:text-[#071C17] flex items-center justify-center text-xs font-bold shrink-0 transition-all shadow-2xs group-hover:scale-105 cursor-pointer"
                    aria-label={`Book session with ${prof.name}`}
                  >
                    →
                  </button>
                ) : (
                  <Link
                    href="/appointments"
                    className="w-8 h-8 rounded-full bg-[#D4EFE2] text-[#004D3D] hover:bg-[#004D3D] hover:text-white dark:bg-[#164438] dark:text-[#00A982] dark:hover:bg-[#00A982] dark:hover:text-[#071C17] flex items-center justify-center text-xs font-bold shrink-0 transition-all shadow-2xs group-hover:scale-105"
                    aria-label={`Book session with ${prof.name}`}
                  >
                    →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
                Today's Motivation
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

        {/* Right: Wellness Score (5 cols, Full Height) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#102F27] rounded-3xl p-5 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between gap-3.5 h-full min-h-[204px] transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Wellness Score
              </h3>
              <p className="text-[9.5px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                Your overall well-being this week.
              </p>
            </div>
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
                  className="text-[#008968] dark:text-[#00A982]"
                  strokeWidth="10"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - wellnessScore / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {wellnessScore}%
                </span>
              </div>
            </div>

            {/* Text Status */}
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-[#008968] dark:text-[#00A982] leading-tight">
                Good Progress!
              </h4>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight">
                Keep taking small steps.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
