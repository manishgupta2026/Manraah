"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession, signOut } from "@/backend/auth/client";
import { useTheme } from "@/frontend/lib/context/ThemeContext";
import Logo from "@/frontend/components/ui/Logo";

interface HeaderProps {
  onOpenMenu?: () => void;
}

export default function Header({ onOpenMenu }: HeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const [userName, setUserName] = useState("Aditi");
  const [userAvatar, setUserAvatar] = useState("/images/therapist_sarah.jpg");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    if (session?.user) {
      const rawName = session.user.name || session.user.sanctuaryName || "Aditi";
      setUserName(rawName);
      if (session.user.avatar) {
        setUserAvatar(session.user.avatar);
      }
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-[#0D2821] border-b border-[#EBF0EC] dark:border-[#23483E] px-4 sm:px-6 lg:px-8 h-[62px] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200 shrink-0">
      {/* LEFT: MANRAAH Logo + Mobile Menu Button */}
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            className="md:hidden p-1.5 rounded-xl text-slate-600 dark:text-[#A9C5BC] hover:bg-slate-100 dark:hover:bg-[#14382F] transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href="/dashboard" className="flex items-center group select-none hover:opacity-90 transition-opacity">
          <Logo size="sm" className="h-8 sm:h-9 w-auto dark:brightness-0 dark:invert transition-all" priority />
        </Link>
      </div>

      {/* CENTER: Navigation Links */}
      <nav className="hidden xl:flex items-center gap-6 text-xs font-semibold text-slate-700 dark:text-[#A9C5BC]">
        <Link href="/how-it-works" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          How It Works
        </Link>
        <Link href="/features" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          Features
        </Link>
        <Link href="/stories" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          Stories
        </Link>
        <Link href="/for-you" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          For You
        </Link>
        <Link href="/privacy-and-trust" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          Privacy &amp; Trust
        </Link>
        <Link href="/faq" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          FAQ
        </Link>
        <Link href="/about" className="hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors">
          About Us
        </Link>
      </nav>

      {/* RIGHT: Search, Moon/Sun toggle, Notification, User Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Icon */}
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-[#A9C5BC] hover:text-[#006C56] dark:hover:text-[#00A982] hover:bg-slate-100 dark:hover:bg-[#14382F] transition-colors cursor-pointer"
          title="Search"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Theme / Dark Mode Toggle (Moon / Sun) */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-[#F28C4B] hover:text-[#006C56] dark:hover:text-[#F28C4B] hover:bg-slate-100 dark:hover:bg-[#14382F] transition-colors cursor-pointer select-none"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* Notification Bell with green +3 badge */}
        <div className="relative">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-[#A9C5BC] hover:text-[#006C56] dark:hover:text-[#00A982] hover:bg-slate-100 dark:hover:bg-[#14382F] transition-colors cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00A86B] dark:bg-[#00A982] text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0D2821]">
            3
          </span>
        </div>

        {/* User Profile Info Chip (Compact Circular Avatar) */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#14382F] transition-colors cursor-pointer select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-[#23483E]">
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-bold text-slate-800 dark:text-[#F4FAF7] leading-tight">
                Hi, {userName}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-[#78958C] font-medium leading-none mt-0.5">
                Take care today
              </p>
            </div>
            <svg className="w-3 h-3 text-slate-400 dark:text-[#78958C] ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#102F27] border border-slate-200 dark:border-[#23483E] shadow-xl dark:shadow-2xl py-1.5 z-50 text-xs transition-colors"
              >
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-[#23483E]">
                  <p className="font-extrabold text-slate-800 dark:text-[#F4FAF7]">{userName}</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#78958C]">Manraah Member</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-[#A9C5BC] hover:bg-slate-50 dark:hover:bg-[#14382F] font-medium transition-colors"
                >
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/journey"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-slate-700 dark:text-[#A9C5BC] hover:bg-slate-50 dark:hover:bg-[#14382F] font-medium transition-colors"
                >
                  <span>My Journey</span>
                </Link>
                <div className="my-1 border-t border-slate-100 dark:border-[#23483E]" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-left cursor-pointer transition-colors"
                >
                  <span>Log Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
