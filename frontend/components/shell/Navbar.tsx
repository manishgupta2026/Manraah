"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession, signOut } from "@/backend/auth/client";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useTheme } from "@/frontend/lib/context/ThemeContext";
import Logo from "@/frontend/components/ui/Logo";
import UserAvatar from "@/frontend/components/ui/UserAvatar";
import CrisisSupportModal from "@/frontend/components/crisis/CrisisSupportModal";

export interface NavbarProps {
  variant?: "auto" | "public" | "authenticated";
  onOpenMenu?: () => void;
}

export default function Navbar({ variant = "auto", onOpenMenu }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const { user, logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = (mounted ? (user?.name || user?.sanctuaryName) : "") || "";
  const isUserAuthenticated = Boolean(mounted && isAuthenticated && user?.id);

  const formatCategoryLabel = (cat?: string) => {
    if (!cat) return "Manraah Member";
    const s = cat.toLowerCase().replace(/_/g, "-");
    if (s === "working-professional" || s === "young-pro" || s === "career") return "Working Professional";
    if (s === "student" || s === "academic") return "Student";
    if (s === "parent" || s === "parents") return "Parent";
    if (s === "couple" || s === "couples") return "Couples & Relationships";
    if (s === "other") return "Other / General";
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Determine if this instance should display authenticated or public action CTAs
  const isExplicitAuth = variant === "authenticated";
  const isExplicitPublic = variant === "public";
  const isAuthRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/journey") ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/ai-companion") ||
    pathname.startsWith("/human-companion") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/sleep-meditation") ||
    pathname.startsWith("/meditation") ||
    pathname.startsWith("/sleep") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/checkin");

  const isAuthExempt = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  const isAuthView =
    !isAuthExempt &&
    (isExplicitAuth || isAuthRoute || (isUserAuthenticated && !isExplicitPublic) || (variant === "auto" && isUserAuthenticated));

  const handleGetStarted = async () => {
    if (isUserAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAboutActive = ["/about", "/faq", "/privacy-and-trust"].includes(pathname);

  // Close mobile drawer, about dropdown & profile dropdown whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Click outside & Escape key listeners for profile dropdown
  useEffect(() => {
    if (!profileDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen]);

  const handleToggleMobile = () => {
    if (onOpenMenu) {
      onOpenMenu();
    } else {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 select-none w-full shrink-0 h-14 sm:h-16 ${
        isAuthView
          ? "bg-[#004D3D] dark:bg-[#06261E] border-b border-[#00382C] dark:border-[#133D32] shadow-xs text-white"
          : mobileMenuOpen
          ? "bg-surface-container-lowest shadow-xl"
          : "bg-surface/95 backdrop-blur-md border-b border-surface-variant/30 text-on-surface"
      }`}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] relative z-30">
        {/* Brand Logo (Left Section - justify-self-start) */}
        <div className="flex items-center justify-start shrink-0 lg:justify-self-start">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity shrink-0">
            <Logo size="md" variant={isAuthView ? "white" : "default"} priority />
          </Link>
        </div>

        {/* Navigation Links (Center Section - Exactly 50% Centered via justify-self-center) */}
        <nav
          className={`hidden lg:flex items-center gap-4 xl:gap-6 text-xs xl:text-sm font-heading font-semibold justify-self-center ${
            isAuthView ? "text-white/90" : "text-on-surface-variant"
          }`}
        >
          <Link
            href="/how-it-works"
            className={`transition-colors shrink-0 ${
              isAuthView
                ? pathname === "/how-it-works"
                  ? "text-white font-bold"
                  : "hover:text-white text-white/85"
                : pathname === "/how-it-works"
                ? "text-primary font-bold"
                : "hover:text-primary"
            }`}
          >
            How it Works
          </Link>
          <Link
            href="/our-solution"
            className={`transition-colors flex items-center gap-1 shrink-0 ${
              isAuthView
                ? pathname === "/our-solution"
                  ? "text-white font-bold"
                  : "hover:text-white text-white/85"
                : pathname === "/our-solution"
                ? "text-primary font-bold"
                : "hover:text-primary"
            }`}
          >
            <span>Our Solution</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-heading font-extrabold leading-none ${
                isAuthView
                  ? "bg-white/20 text-white border border-white/30"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              Soon
            </span>
          </Link>
          <Link
            href="/features"
            className={`transition-colors shrink-0 ${
              isAuthView
                ? pathname === "/features"
                  ? "text-white font-bold"
                  : "hover:text-white text-white/85"
                : pathname === "/features"
                ? "text-primary font-bold"
                : "hover:text-primary"
            }`}
          >
            Features
          </Link>
          <Link
            href="/stories"
            className={`transition-colors shrink-0 ${
              isAuthView
                ? pathname === "/stories"
                  ? "text-white font-bold"
                  : "hover:text-white text-white/85"
                : pathname === "/stories"
                ? "text-primary font-bold"
                : "hover:text-primary"
            }`}
          >
            Stories
          </Link>
          <Link
            href="/for-you"
            className={`transition-colors shrink-0 ${
              isAuthView
                ? pathname === "/for-you"
                  ? "text-white font-bold"
                  : "hover:text-white text-white/85"
                : pathname === "/for-you"
                ? "text-primary font-bold"
                : "hover:text-primary"
            }`}
          >
            For You
          </Link>
          <Link
            href="/blog"
            className={`transition-colors shrink-0 ${
              isAuthView
                ? pathname === "/blog"
                  ? "text-white font-bold"
                  : "hover:text-white text-white/85"
                : pathname === "/blog"
                ? "text-primary font-bold"
                : "hover:text-primary"
            }`}
          >
            Blog
          </Link>

          {/* About Dropdown Menu (Desktop) */}
          <div
            className="relative shrink-0"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              onClick={() => setAboutDropdownOpen((prev) => !prev)}
              className={`transition-colors flex items-center gap-0.5 cursor-pointer py-1 ${
                isAuthView
                  ? isAboutActive
                    ? "text-white font-bold"
                    : "text-white/85 hover:text-white"
                  : isAboutActive
                  ? "text-primary font-bold"
                  : "hover:text-primary"
              }`}
              aria-expanded={aboutDropdownOpen}
              aria-haspopup="true"
            >
              <span>About</span>
              <span
                className={`material-symbols-outlined text-base transition-transform duration-200 ${
                  aboutDropdownOpen ? "rotate-180" : ""
                } ${isAuthView ? "text-white/80" : ""}`}
              >
                expand_more
              </span>
            </button>

            {/* Dropdown Card */}
            <AnimatePresence>
              {aboutDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`absolute top-full right-0 mt-1.5 w-60 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 ${
                    isAuthView
                      ? "bg-[#0D2821] border border-[#23483E] text-white"
                      : "bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-variant/40"
                  }`}
                >
                  <Link
                    href="/about"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      isAuthView
                        ? pathname === "/about"
                          ? "bg-white/15 text-white font-bold"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                        : pathname === "/about"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-primary/70">info</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">About Us</div>
                      <div className={`text-[10px] font-normal leading-tight ${isAuthView ? "text-white/60" : "text-on-surface-variant"}`}>
                        Our story, pillars &amp; mission
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      isAuthView
                        ? pathname === "/faq"
                          ? "bg-white/15 text-white font-bold"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                        : pathname === "/faq"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#00A982]/90">quiz</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">FAQ</div>
                      <div className={`text-[10px] font-normal leading-tight ${isAuthView ? "text-white/60" : "text-on-surface-variant"}`}>
                        Frequently asked questions
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/privacy-and-trust"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      isAuthView
                        ? pathname === "/privacy-and-trust"
                          ? "bg-white/15 text-white font-bold"
                          : "text-white/90 hover:bg-white/10 hover:text-white"
                        : pathname === "/privacy-and-trust"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-rose-300">verified_user</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">Privacy &amp; Trust</div>
                      <div className={`text-[10px] font-normal leading-tight ${isAuthView ? "text-white/60" : "text-on-surface-variant"}`}>
                        Security &amp; confidentiality
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right: Actions & Mobile Toggle (justify-self-end) */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:justify-self-end shrink-0">
          {isAuthView ? (
            /* Authenticated Header Controls (Dashboard, Dark Mode, Profile) */
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              {/* Dashboard Navigation Link */}
              <Link
                href="/dashboard"
                className={`text-xs xl:text-sm font-heading font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                  pathname === "/dashboard"
                    ? "text-white font-bold bg-white/15"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                Dashboard
              </Link>

              {/* Theme / Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="w-8.5 h-8.5 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer select-none shrink-0"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span className="material-symbols-outlined text-lg">
                  {isDark ? "light_mode" : "dark_mode"}
                </span>
              </button>

              {/* User Profile Avatar with Clickable Dropdown Menu */}
              <div ref={profileDropdownRef} className="relative shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-1.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 cursor-pointer transition-all"
                  aria-label="User profile menu"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                >
                  <UserAvatar user={user} sizeClass="w-8 h-8 text-xs" />
                  <div className="text-left hidden sm:block pr-1">
                    <p className="text-xs font-heading font-bold text-white leading-tight" suppressHydrationWarning>
                      Hi, {userName}
                    </p>
                    <p className="text-[9px] text-white/70 font-medium leading-none mt-0.5">
                      Take care today
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-base text-white/80 pr-1">
                    expand_more
                  </span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-[#0D2821] border border-[#23483E] text-white shadow-2xl p-1.5 z-50 flex flex-col gap-1"
                    >
                      <div className="px-3.5 py-2 border-b border-white/10">
                        <p className="font-heading font-bold text-white text-sm" suppressHydrationWarning>{userName}</p>
                        <p className="text-[10px] text-white/60">Manraah Member</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors text-xs font-heading font-semibold cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg text-emerald-400">person</span>
                        <span>My Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors text-xs font-heading font-semibold cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-lg text-rose-400">logout</span>
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Crisis Button (on the right side of profile, shifted to the right) */}
              <button
                type="button"
                onClick={() => setIsCrisisModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 ml-1 sm:ml-2.5 rounded-full font-heading font-bold text-xs transition-all cursor-pointer select-none shrink-0 bg-red-600/90 hover:bg-red-600 text-white border border-red-400/40 shadow-xs hover:shadow-sm"
                title="Crisis & 24/7 Helplines"
                aria-label="Crisis"
              >
                <span className="material-symbols-outlined text-base animate-pulse text-red-200 sm:text-inherit">
                  emergency
                </span>
                <span>Crisis</span>
              </button>
            </div>
          ) : (
            /* Public Action Buttons (Exact Home Navbar styling) */
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/login"
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-heading font-bold transition-all ${
                  isLoginPage
                    ? "bg-primary-container/20 text-primary border border-primary/30"
                    : "bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary/5"
                }`}
              >
                Log In
              </Link>

              <button
                onClick={handleGetStarted}
                className={`px-4 sm:px-5 py-2 rounded-full font-heading font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSignupPage || pathname === "/category-selection"
                    ? "bg-primary-purple text-white ring-2 ring-primary/20"
                    : "bg-primary hover:bg-primary-purple text-white"
                }`}
              >
                <span>Get Started</span>
              </button>

              {/* Crisis Button (Public View - shifted to the right) */}
              <button
                type="button"
                onClick={() => setIsCrisisModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 ml-1 sm:ml-2 rounded-full font-heading font-bold text-xs transition-all cursor-pointer select-none shrink-0 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 shadow-2xs hover:shadow-xs"
                title="Crisis & 24/7 Helplines"
                aria-label="Crisis"
              >
                <span className="material-symbols-outlined text-base animate-pulse text-red-500">
                  emergency
                </span>
                <span>Crisis</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={handleToggleMobile}
            className={`lg:hidden p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
              isAuthView
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-surface-container text-on-surface hover:bg-surface-variant/50"
            }`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Animated Dropdown Drawer & Dimmed Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && !onOpenMenu && (
          <>
            {/* Backdrop Dimmer (click outside to close) */}
            <motion.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-x-0 bottom-0 top-14 sm:top-16 bg-black/50 backdrop-blur-xs z-10 lg:hidden"
              aria-hidden="true"
            />

            {/* Full-width Dropdown Drawer */}
            <motion.div
              key="mobile-nav-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative z-20 lg:hidden w-full bg-surface-container-lowest border-t border-surface-variant/30 px-5 sm:px-6 pt-4 pb-8 flex flex-col gap-4 shadow-2xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto no-scrollbar"
            >
              <nav className="flex flex-col gap-1 font-heading font-semibold text-sm text-on-surface">
                {/* Mobile Quick Crisis Support Access */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCrisisModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-heading font-bold text-xs flex items-center justify-between transition-colors mb-1 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-red-500 animate-pulse">emergency</span>
                    <span>Crisis Support &amp; Helplines</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold">24/7</span>
                </button>

                <Link
                  href="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                    pathname === "/how-it-works" ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <span>How it Works</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                </Link>
                {isUserAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                      pathname === "/dashboard" ? "bg-primary/10 text-primary font-bold" : ""
                    }`}
                  >
                    <span>Dashboard</span>
                    <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                  </Link>
                )}
                <Link
                  href="/our-solution"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                    pathname === "/our-solution" ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Our Solution</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-primary/10 text-primary border border-primary/20">
                      Soon
                    </span>
                  </span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                </Link>
                <Link
                  href="/features"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                    pathname === "/features" ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <span>Features</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                </Link>
                <Link
                  href="/stories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                    pathname === "/stories" ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <span>Stories</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                </Link>
                <Link
                  href="/for-you"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                    pathname === "/for-you" ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <span>For You (Pathways)</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between ${
                    pathname === "/blog" ? "bg-primary/10 text-primary font-bold" : ""
                  }`}
                >
                  <span>Blog</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40">chevron_right</span>
                </Link>

                {/* Mobile About Sub-section */}
                <div className="pt-2 mt-2 border-t border-surface-variant/20 space-y-1">
                  <div className="px-3.5 py-1 text-[11px] font-heading font-bold uppercase tracking-wider text-on-surface-variant/70">
                    About &amp; Trust
                  </div>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary flex items-center gap-2.5 transition-colors ${
                      pathname === "/about" ? "bg-primary/10 text-primary font-bold" : "text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-primary">info</span>
                    <span>About Us</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary flex items-center gap-2.5 transition-colors ${
                      pathname === "/faq" ? "bg-primary/10 text-primary font-bold" : "text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-secondary">quiz</span>
                    <span>FAQ</span>
                  </Link>
                  <Link
                    href="/privacy-and-trust"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary flex items-center gap-2.5 transition-colors ${
                      pathname === "/privacy-and-trust"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-primary">verified_user</span>
                    <span>Privacy &amp; Trust</span>
                  </Link>
                </div>
              </nav>

              <div className="flex flex-col gap-2.5 pt-2 border-t border-surface-variant/20">
                {isAuthView ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 rounded-full bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] font-heading font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Go to Dashboard</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-center py-2.5 rounded-full bg-rose-500/15 dark:bg-rose-950/30 text-rose-600 dark:text-rose-300 font-heading font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleGetStarted();
                      }}
                      className="w-full py-3.5 rounded-full bg-primary text-white font-heading font-bold text-sm shadow-md hover:bg-primary-purple transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Get Started</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-3 rounded-full bg-surface-container hover:bg-surface-variant/50 border border-surface-variant/40 font-heading font-semibold text-sm text-on-surface transition-colors"
                    >
                      Log In to Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Universal 24/7 Crisis Support Modal */}
      <CrisisSupportModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />
    </header>
  );
}
