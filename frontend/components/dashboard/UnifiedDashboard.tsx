"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession, signOut } from "@/backend/auth/client";

// Curated motivational quotes for interactive "New Quote ↻" switcher
const MOTIVATIONAL_QUOTES = [
  "“You are stronger than you think, and you're doing better than you realize.”",
  "“Peace comes from within. Give yourself permission to pause and breathe today.”",
  "“Almost everything will work again if you unplug it for a few minutes, including you.”",
  "“Small steps every single day lead to massive, enduring changes in your well-being.”",
  "“You don't have to control your thoughts. You just have to stop letting them control you.”",
];

// Recommended Professionals matching the design target
const RECOMMENDED_PROFESSIONALS = [
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist",
    rating: "4.9",
    reviewCount: "120+",
    image: "/images/therapist_sarah.jpg",
    bgTint: "bg-[#F2FAF6]",
    tags: [
      { text: "Anxiety & Stress", bg: "bg-[#E6F4EA] text-[#137333]" },
      { text: "Self-Esteem", bg: "bg-[#E8F0FE] text-[#1A73E8]" },
      { text: "Emotional Well-being", bg: "bg-[#F3E8FD] text-[#8430CE]" },
    ],
  },
  {
    id: "dr-arjun-mehta",
    name: "Dr. Arjun Mehta",
    role: "Career Counselor",
    rating: "4.8",
    reviewCount: "98+",
    image: "/images/therapist_arjun.jpg",
    bgTint: "bg-[#F1F7FB]",
    tags: [
      { text: "Work-Life Balance", bg: "bg-[#E6F4EA] text-[#137333]" },
      { text: "Career Growth", bg: "bg-[#E8F0FE] text-[#1A73E8]" },
      { text: "Goal Setting", bg: "bg-[#F3E8FD] text-[#8430CE]" },
    ],
  },
  {
    id: "dr-neha-kapoor",
    name: "Dr. Neha Kapoor",
    role: "Relationship Therapist",
    rating: "4.9",
    reviewCount: "140+",
    image: "/images/user_avatar.jpg",
    bgTint: "bg-[#FAF3F8]",
    tags: [
      { text: "Relationships", bg: "bg-[#E6F4EA] text-[#137333]" },
      { text: "Communication", bg: "bg-[#E8F0FE] text-[#1A73E8]" },
      { text: "Family Well-being", bg: "bg-[#F3E8FD] text-[#8430CE]" },
    ],
  },
];

// Quick Tools matching design target
const QUICK_TOOLS = [
  {
    id: "journal",
    title: "Gratitude Journal",
    href: "/journal",
    cardBg: "bg-[#F5F4FA] hover:bg-[#EBE9F5]",
    iconColor: "text-[#5C4EB5]",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: "breathing",
    title: "Breathing Exercise",
    href: "/meditation",
    cardBg: "bg-[#EEF7FB] hover:bg-[#E1F1F8]",
    iconColor: "text-[#1C92D2]",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "mood",
    title: "Mood Tracker",
    href: "/checkin",
    cardBg: "bg-[#EDF8F4] hover:bg-[#DEEFE8]",
    iconColor: "text-[#008968]",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "sleep",
    title: "Sleep Sounds",
    href: "/sleep",
    cardBg: "bg-[#F3F5FA] hover:bg-[#E5E9F3]",
    iconColor: "text-[#3D52A0]",
    icon: (
      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
];

export default function UnifiedDashboard() {
  const router = useRouter();

  // User session state
  const [userName, setUserName] = useState("Aditi");
  const [userAvatar, setUserAvatar] = useState("/images/therapist_sarah.jpg");
  const [userCategoryLabel, setUserCategoryLabel] = useState("parenting");
  const [streakDays, setStreakDays] = useState(3);
  const [nextAppointment, setNextAppointment] = useState("6 Oct 2026, 09:00 PM");
  const [wellnessScore, setWellnessScore] = useState(68);

  // UI state
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    if (session?.user) {
      const rawName = session.user.name || session.user.sanctuaryName || "Aditi";
      setUserName(rawName);
      if (session.user.avatar) {
        setUserAvatar(session.user.avatar);
      }
      if (session.user.streakDays) {
        setStreakDays(session.user.streakDays);
      }

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

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F4F9F6] text-[#211D26] font-sans flex flex-col antialiased selection:bg-[#006C56]/20 selection:text-[#006C56]">
      {/* ========================================================================= */}
      {/* 1. TOP FULL-WIDTH AUTHENTICATED NAVBAR (Compact 60px Height)             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-[#EBF0EC] px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        {/* LEFT: MANRAAH Logo */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex flex-col group select-none">
            <span className="font-heading font-black text-lg text-[#004D3D] tracking-wider uppercase leading-none">
              MANRAAH
            </span>
            <span className="text-[7.5px] italic text-slate-400 font-medium tracking-wide mt-0.5">
              “The path for the mind”
            </span>
          </Link>
        </div>

        {/* CENTER: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-700">
          <Link href="/how-it-works" className="hover:text-[#006C56] transition-colors">
            How it Works
          </Link>
          <Link href="/features" className="hover:text-[#006C56] transition-colors">
            Features
          </Link>
          <Link href="/stories" className="hover:text-[#006C56] transition-colors">
            Stories
          </Link>
          <Link href="/for-you" className="hover:text-[#006C56] transition-colors">
            For You
          </Link>
          <Link href="/privacy-and-trust" className="hover:text-[#006C56] transition-colors">
            Privacy &amp; Trust
          </Link>
          <Link href="/faq" className="hover:text-[#006C56] transition-colors">
            FAQ
          </Link>
          <Link href="/about" className="hover:text-[#006C56] transition-colors">
            About Us
          </Link>
        </nav>

        {/* RIGHT: Search, Moon, Notification, User Profile */}
        <div className="flex items-center gap-3">
          {/* Search Icon */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006C56] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Search"
            aria-label="Search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Theme / Dark Mode (Moon icon) */}
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006C56] hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>

          {/* Notification Bell with green +3 badge */}
          <div className="relative">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-[#006C56] hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00A86B] text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
              3
            </span>
          </div>

          {/* User Profile Info Chip (Compact ~40px Avatar) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer select-none"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">
                  Hi, {userName}
                </p>
                <p className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                  Take care today
                </p>
              </div>
              <svg className="w-3 h-3 text-slate-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs"
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="font-extrabold text-slate-800">{userName}</p>
                    <p className="text-[10px] text-slate-400">Sanctuary Member</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/journey"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <span>My Journey</span>
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 hover:bg-red-50 font-bold text-left cursor-pointer"
                  >
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY CONTAINER: FIXED SIDEBAR + SCROLLABLE DASHBOARD CONTENT           */}
      {/* ========================================================================= */}
      <div className="flex-1 flex w-full">
        {/* ======================================================================= */}
        {/* LEFT VERTICAL FIXED SIDEBAR (#052820 Deep Forest Teal)                 */}
        {/* ======================================================================= */}
        <aside className="w-[88px] shrink-0 bg-[#052820] text-white flex flex-col justify-between items-center py-5 sticky top-[60px] h-[calc(100vh-60px)] z-40 select-none">
          {/* Top Logo / Leaf Icon */}
          <div className="space-y-6 flex flex-col items-center w-full px-2">
            <div className="w-11 h-11 rounded-2xl bg-[#0F3B30] flex items-center justify-center text-[#2ECC71] shadow-xs cursor-pointer hover:bg-[#154d3f] transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>

            {/* Navigation Icons Stack */}
            <nav className="flex flex-col items-center gap-4 w-full">
              {/* 1. Dashboard (ACTIVE) */}
              <Link
                href="/dashboard"
                className="w-[72px] flex flex-col items-center py-2.5 px-1 rounded-2xl bg-[#006C56] text-white shadow-sm border border-[#008968]/40 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[10px] font-bold mt-1 tracking-tight">Dashboard</span>
              </Link>

              {/* 2. Appointments */}
              <Link
                href="/professional-care"
                className="w-[72px] flex flex-col items-center py-2 px-1 rounded-2xl text-[#8EAAA1] hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px] font-medium mt-1 tracking-tight">Appointments</span>
              </Link>

              {/* 3. My Journey */}
              <Link
                href="/journey"
                className="w-[72px] flex flex-col items-center py-2 px-1 rounded-2xl text-[#8EAAA1] hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[10px] font-medium mt-1 tracking-tight">My Journey</span>
              </Link>

              {/* 4. Community */}
              <Link
                href="/community"
                className="w-[72px] flex flex-col items-center py-2 px-1 rounded-2xl text-[#8EAAA1] hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[10px] font-medium mt-1 tracking-tight">Community</span>
              </Link>

              {/* 5. Resources */}
              <Link
                href="/resources"
                className="w-[72px] flex flex-col items-center py-2 px-1 rounded-2xl text-[#8EAAA1] hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-[10px] font-medium mt-1 tracking-tight">Resources</span>
              </Link>

              {/* 6. Messages */}
              <Link
                href="/ai-chat"
                className="w-[72px] flex flex-col items-center py-2 px-1 rounded-2xl text-[#8EAAA1] hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-[10px] font-medium mt-1 tracking-tight">Messages</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Avatar + Initials + View Profile */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="w-9 h-9 rounded-full bg-[#FF8577] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AD
            </div>
            <p className="text-[11px] font-bold text-white leading-tight mt-1">{userName}</p>
            <Link
              href="/profile"
              className="text-[9px] text-[#8EAAA1] hover:text-white transition-colors"
            >
              View Profile
            </Link>
          </div>
        </aside>

        {/* ======================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA (Scrollable)                                */}
        {/* ======================================================================= */}
        <main className="flex-1 min-w-0 p-5 lg:p-6.5 max-w-[1450px] mx-auto space-y-5">
          {/* ===================================================================== */}
          {/* TWO-COLUMN GRID: LEFT COLUMN (300px) + MAIN CONTENT COLUMN (Flex-1)   */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* =================================================================== */}
            {/* LEFT COLUMN: Search, Condition, Illustration, Confidentiality, Quote */}
            {/* =================================================================== */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-3.5">
              {/* 1. Search Bar */}
              <div className="bg-white rounded-2xl p-2.5 px-3.5 border border-[#E2ECE6] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Manraah..."
                    className="w-full text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  ⌘ K
                </span>
              </div>

              {/* 2. Check Your Condition Card */}
              <div className="bg-[#EAF5EF] rounded-3xl p-5 border border-[#D2E8DC] text-center flex flex-col items-center space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                {/* Circular Avatar / Profile Icon with check badge */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#D6ECE0] border-2 border-white flex items-center justify-center text-slate-400 shadow-inner">
                    <svg className="w-9 h-9 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#006C56] text-white flex items-center justify-center text-[9px] font-bold border-2 border-white shadow-xs">
                    ✓
                  </div>
                </div>

                {/* Subtitle / Badge */}
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#006C56]">
                  YOUR WELLNESS COMPANION
                </span>

                {/* Main Heading */}
                <h2 className="text-lg font-heading font-black text-[#19332A] leading-tight">
                  Check Your Condition
                </h2>

                {/* Description */}
                <p className="text-[11px] text-[#4F685F] font-medium leading-relaxed max-w-[200px]">
                  Check your every situation, stress factors, and {userCategoryLabel} activities.
                </p>

                {/* Button: CHECK IT NOW */}
                <Link
                  href="/checkin"
                  className="w-full py-3 px-4 rounded-full bg-[#004D3D] hover:bg-[#003B2E] text-white text-[11px] font-bold shadow-md shadow-[#004D3D]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer mt-1"
                >
                  <span className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center text-[8px]">
                    ✦
                  </span>
                  <span>CHECK IT NOW</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>

              {/* 3. Illustration Card (Calm mind with soft leaves) */}
              <div className="bg-white rounded-3xl p-5 border border-[#E2ECE6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col items-center text-center space-y-3">
                <div className="w-full h-[136px] flex items-center justify-center relative overflow-hidden">
                  {/* Calming SVG Vector Illustration */}
                  <svg viewBox="0 0 200 160" className="w-[176px] h-[136px]">
                    {/* Background Soft Leaves */}
                    <path d="M40 80 Q20 50 40 20 Q60 50 40 80" fill="#D5EFE3" opacity="0.85" />
                    <path d="M160 80 Q180 50 160 20 Q140 50 160 80" fill="#D5EFE3" opacity="0.85" />
                    <path d="M30 120 Q10 90 30 60 Q50 90 30 120" fill="#BCE4D3" opacity="0.75" />
                    <path d="M170 120 Q190 90 170 60 Q150 90 170 120" fill="#BCE4D3" opacity="0.75" />
                    
                    {/* Character Hair Back */}
                    <path d="M65 80 Q100 30 135 80 Q145 130 135 150 L65 150 Q55 130 65 80 Z" fill="#2C3A35" />
                    
                    {/* Character Body / Shoulders */}
                    <path d="M55 160 Q100 125 145 160 Z" fill="#3D7E6B" />
                    
                    {/* Character Neck & Face */}
                    <rect x="92" y="105" width="16" height="20" fill="#F8D3B8" rx="4" />
                    <circle cx="100" cy="85" r="24" fill="#F8D3B8" />
                    
                    {/* Hair Front Framing */}
                    <path d="M76 80 Q100 65 124 80 Q115 50 100 50 Q85 50 76 80 Z" fill="#2C3A35" />
                    
                    {/* Calm Closed Eyes & Smile */}
                    <path d="M88 84 Q93 88 98 84" fill="none" stroke="#2C3A35" strokeWidth="2" strokeLinecap="round" />
                    <path d="M102 84 Q107 88 112 84" fill="none" stroke="#2C3A35" strokeWidth="2" strokeLinecap="round" />
                    <path d="M96 95 Q100 99 104 95" fill="none" stroke="#2C3A35" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* Hands on Heart */}
                    <path d="M80 145 Q100 130 120 145 Q110 155 90 155 Z" fill="#F8D3B8" opacity="0.95" />
                  </svg>
                </div>

                <p className="text-xs font-heading font-black text-[#19332A] leading-snug max-w-[170px]">
                  A healthier mind<br />leads to a brighter you.
                </p>
              </div>

              {/* 4. Confidentiality Card */}
              <div className="bg-white rounded-2xl p-3 px-3.5 border border-[#E2ECE6] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EAF6F0] text-[#006C56] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-[#19332A] leading-tight">100% Confidential</h3>
                  <p className="text-[10px] text-[#789389] font-medium leading-tight mt-0.5">
                    No data ever leaves this device.
                  </p>
                </div>
              </div>

              {/* 5. Quote Card */}
              <div className="bg-white rounded-2xl p-3 px-3.5 border border-[#E2ECE6] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-start gap-2.5">
                <span className="font-serif text-2xl font-black text-[#004D3D] leading-none shrink-0 -mt-0.5">
                  “
                </span>
                <div>
                  <p className="text-[11px] font-bold text-[#19332A] leading-snug">
                    “Small steps every day lead to big changes.”
                  </p>
                  <p className="text-[9.5px] text-[#789389] font-semibold mt-0.5">
                    — Manraah
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* MAIN CONTENT COLUMN                                                 */}
            {/* 1. Welcome & Stats Header                                           */}
            {/* 2. Recommended for You (3 Professional Cards)                       */}
            {/* 3. Today's Motivation                                               */}
            {/* 4. Quick Tools + Wellness Score                                     */}
            {/* =================================================================== */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4.5">
              {/* 1. Top Welcome Banner + Streak & Next Appointment Cards */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                {/* Greeting */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56]">
                    WELCOME BACK
                  </span>
                  <h1 className="text-2xl font-heading font-black text-[#19332A] leading-tight">
                    Hi, {userName}! 👋
                  </h1>
                  <p className="text-xs text-[#6B857C] font-medium">
                    Let's track your health &amp; {userCategoryLabel} wellness daily!
                  </p>
                </div>

                {/* Right: Streak & Next Appointment Cards */}
                <div className="flex items-center gap-3">
                  {/* Streak Card */}
                  <div className="bg-white rounded-2xl p-2.5 px-4 border border-[#E2ECE6] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3 min-w-[155px]">
                    <span className="text-xl leading-none">🔥</span>
                    <div>
                      <p className="text-[11px] font-black text-[#F28C4B] leading-tight">
                        Day {streakDays} Streak
                      </p>
                      <p className="text-[9.5px] text-[#789389] font-medium leading-tight mt-0.5">
                        You're doing great!
                      </p>
                    </div>
                  </div>

                  {/* Next Appointment Card */}
                  <div className="bg-white rounded-2xl p-2.5 px-4 border border-[#E2ECE6] shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex items-center gap-3 min-w-[180px]">
                    <div className="w-7 h-7 rounded-xl bg-[#EAF6F0] text-[#006C56] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[9.5px] text-[#789389] font-semibold leading-tight">
                        Next Appointment
                      </p>
                      <p className="text-[11px] font-black text-[#19332A] leading-tight mt-0.5">
                        {nextAppointment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Recommended for You (3 Taller, Equal-Height Professional Cards) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4.5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] text-[#006C56] flex items-center justify-center">
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-sm font-heading font-black text-[#19332A] leading-tight">
                        Recommended for You
                      </h2>
                      <p className="text-[10px] text-[#789389] font-medium leading-tight mt-0.5">
                        Curated by our mental health professionals
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/professional-care"
                    className="text-xs font-bold text-[#004D3D] hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <span>→</span>
                  </Link>
                </div>

                {/* 3 Equal-Width, Taller Professional Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                  {RECOMMENDED_PROFESSIONALS.map((prof) => (
                    <div
                      key={prof.id}
                      className={`${prof.bgTint} rounded-2xl p-4 sm:p-4.5 border border-slate-200/60 flex flex-col justify-between min-h-[220px] hover:shadow-md transition-all group`}
                    >
                      {/* Top: Avatar & Info with generous breathing room */}
                      <div className="flex items-center gap-3">
                        <div className="w-[58px] h-[58px] rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs">
                          <img
                            src={prof.image}
                            alt={prof.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[13px] font-black text-[#19332A] truncate leading-tight">
                            {prof.name}
                          </h3>
                          <p className="text-[11px] text-[#6B857C] font-medium truncate mt-0.5 leading-tight">
                            {prof.role}
                          </p>
                          <p className="text-[10.5px] font-bold text-amber-500 mt-1 leading-tight flex items-center gap-1">
                            <span>⭐</span>
                            <span className="text-[#19332A]">{prof.rating}</span>
                            <span className="text-[#789389] font-normal">({prof.reviewCount})</span>
                          </p>
                        </div>
                      </div>

                      {/* Middle & Bottom: Expertise Tags & Arrow Button */}
                      <div className="flex items-end justify-between gap-2 pt-3">
                        <div className="flex flex-col gap-1.5 flex-1">
                          {prof.tags.map((tag) => (
                            <span
                              key={tag.text}
                              className={`text-[9.5px] font-semibold px-2.5 py-0.5 rounded-full ${tag.bg} w-fit leading-tight`}
                            >
                              {tag.text}
                            </span>
                          ))}
                        </div>

                        {/* Arrow Action Button */}
                        <Link
                          href="/professional-care"
                          className="w-7.5 h-7.5 rounded-full bg-[#E0F3EA] text-[#006C56] hover:bg-[#006C56] hover:text-white flex items-center justify-center text-xs font-bold shrink-0 transition-colors shadow-2xs"
                        >
                          →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Today's Motivation Card */}
              <div className="bg-white rounded-3xl p-4.5 border border-[#E2ECE6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-2xl bg-[#FFF8E7] text-[#F1C40F] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-sm font-heading font-black text-[#19332A] leading-tight">
                        Today's Motivation
                      </h2>
                      <p className="text-[10px] text-[#789389] font-medium leading-tight mt-0.5">
                        A little encouragement for your journey.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuote}
                    className="flex items-center gap-1 text-xs font-bold text-[#006C56] hover:text-[#004D3D] transition-colors cursor-pointer select-none"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>New Quote</span>
                  </button>
                </div>

                {/* Soft Mint Quote Banner */}
                <div className="bg-[#EBF7F2] rounded-2xl p-3.5 px-5 flex items-center gap-3">
                  <span className="font-serif text-2xl font-black text-[#006C56] leading-none shrink-0 -mt-0.5">
                    “
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={quoteIndex}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={{ duration: 0.15 }}
                      className="text-xs sm:text-sm font-semibold italic text-[#19332A] leading-snug"
                    >
                      {MOTIVATIONAL_QUOTES[quoteIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* 4. Bottom Row: Quick Tools + Wellness Score (Deliberate 2-Column Grid, Exactly Same Height) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* Left: Quick Tools (7 cols, Full Height) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#E2ECE6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-3.5 h-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] text-[#006C56] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xs font-heading font-black text-[#19332A] leading-tight">
                          Quick Tools
                        </h3>
                        <p className="text-[9.5px] text-[#789389] font-medium leading-tight mt-0.5">
                          Simple tools for a calmer, healthier you.
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/journey"
                      className="text-xs font-bold text-[#004D3D] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <span>→</span>
                    </Link>
                  </div>

                  {/* 4 Tool Cards in One Row */}
                  <div className="grid grid-cols-4 gap-2.5 my-auto w-full">
                    {QUICK_TOOLS.map((tool) => (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className={`${tool.cardBg} rounded-2xl p-2.5 py-3 flex flex-col items-center text-center justify-center space-y-1.5 min-h-[76px] transition-all group`}
                      >
                        <div className={`p-1.5 rounded-xl ${tool.iconColor} transition-transform group-hover:scale-110`}>
                          {tool.icon}
                        </div>
                        <span className="text-[9.5px] font-bold text-[#19332A] leading-tight line-clamp-2">
                          {tool.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right: Wellness Score (5 cols, Full Height) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#E2ECE6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-3.5 h-full">
                  <div className="flex items-center gap-2">
                    <div className="w-7.5 h-7.5 rounded-xl bg-[#EAF6F0] text-[#006C56] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xs font-heading font-black text-[#19332A] leading-tight">
                        Wellness Score
                      </h3>
                      <p className="text-[9.5px] text-[#789389] font-medium leading-tight mt-0.5">
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
                          className="text-[#E9F3EE]"
                          strokeWidth="10"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          className="text-[#008968]"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - wellnessScore / 100)}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-heading font-black text-[#19332A]">
                          {wellnessScore}%
                        </span>
                      </div>
                    </div>

                    {/* Text Status */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-[#008968] leading-tight">
                        Good Progress!
                      </h4>
                      <p className="text-[10px] text-[#789389] font-medium leading-tight">
                        Keep taking small steps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
