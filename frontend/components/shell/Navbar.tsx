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
import RequestCallbackModal from "@/frontend/components/modals/RequestCallbackModal";

export interface NavbarProps {
  variant?: "auto" | "public" | "authenticated";
  onOpenMenu?: () => void;
}

export default function Navbar({ variant = "auto", onOpenMenu }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const { user, logout, isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [solutionDropdownOpen, setSolutionDropdownOpen] = useState(false);
  const [mobileSolutionOpen, setMobileSolutionOpen] = useState(false);
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [callbackDefaultSegment, setCallbackDefaultSegment] = useState<"colleges" | "corporates">("colleges");
  const solutionDropdownRef = useRef<HTMLDivElement>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = (mounted ? (user?.name || user?.sanctuaryName) : "") || "";
  const isUserAuthenticated = Boolean(mounted && isAuthenticated && user?.id);
  const firstName = userName ? userName.trim().split(/\s+/)[0] : "";
  const greetingName = firstName || "Friend";

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
  const isExplicitPublic = variant === "public";
  const isAuthExempt = pathname === "/login" || pathname === "/signup" || pathname === "/forgot-password";

  // Only display authenticated UI when session is confirmed and route/variant allows it
  const showAuthenticatedUI = !isAuthExempt && !isExplicitPublic && isUserAuthenticated;
  const isAuthView = showAuthenticatedUI;

  const handleGetStarted = async () => {
    if (isUserAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };


  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAboutActive = ["/about", "/faq", "/privacy-and-trust"].includes(pathname);
  const isSolutionActive = pathname.startsWith("/our-solution");

  // Close mobile drawer, dropdowns whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setSolutionDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  // Global listener to trigger callback modal from anywhere
  useEffect(() => {
    const handleOpenCallback = (e: any) => {
      if (e.detail?.segment) {
        setCallbackDefaultSegment(e.detail.segment);
      }
      setCallbackModalOpen(true);
    };
    window.addEventListener("open-callback-modal", handleOpenCallback as EventListener);
    return () =>
      window.removeEventListener("open-callback-modal", handleOpenCallback as EventListener);
  }, []);

  // Click outside & Escape key listeners for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        solutionDropdownRef.current &&
        !solutionDropdownRef.current.contains(event.target as Node)
      ) {
        setSolutionDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileDropdownOpen(false);
        setSolutionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileDropdownOpen, solutionDropdownOpen]);

  const handleToggleMobile = () => {
    if (onOpenMenu) {
      onOpenMenu();
    } else {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  const getNavLinkClass = (isActive: boolean) => {
    return isActive
      ? "text-[#006B56] dark:text-[#A3A77A] font-bold"
      : "text-[#4F685F] dark:text-[#C5B7A4] hover:text-[#006B56] dark:hover:text-[#A3A77A]";
  };

  return (
    <header
      className={`sticky top-0 z-50 select-none w-full shrink-0 h-14 sm:h-16 ${
        mobileMenuOpen
          ? "bg-surface-container-lowest dark:bg-[#1B1510] shadow-xl"
          : "bg-surface/95 dark:bg-[#1B1510] backdrop-blur-md border-b border-surface-variant/30 dark:border-[#51402E] text-on-surface dark:text-[#F3E9D8] shadow-2xs"
      }`}
    >
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] items-center relative z-30">
        {/* Brand Logo (Left Column - 1fr, aligned to left edge) */}
        <div className="flex items-center justify-start lg:justify-self-start shrink-0 min-w-0">
          <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity shrink-0">
            <Logo size="md" variant={isDark ? "white" : "default"} priority />
          </Link>
        </div>

        {/* Navigation Links (Center Column - auto, centered independently) */}
        <nav
          className="hidden lg:flex items-center justify-center lg:justify-self-center gap-3.5 xl:gap-5 2xl:gap-6 text-xs xl:text-sm font-heading font-semibold text-on-surface-variant dark:text-[#C5B7A4] whitespace-nowrap"
        >
          <Link
            href="/how-it-works"
            className={`transition-colors shrink-0 ${getNavLinkClass(pathname === "/how-it-works")}`}
          >
            How it Works
          </Link>
          {/* Institutional Mega Dropdown */}
          <div
            ref={solutionDropdownRef}
            className="relative"
            onMouseEnter={() => setSolutionDropdownOpen(true)}
            onMouseLeave={() => setSolutionDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setSolutionDropdownOpen((prev) => !prev)}
              className={`transition-colors flex items-center gap-1 shrink-0 py-1 cursor-pointer ${getNavLinkClass(
                isSolutionActive
              )}`}
            >
              <span>Our Solution</span>
              <span
                className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                  solutionDropdownOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {solutionDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 w-[360px] sm:w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl p-3 sm:p-3.5 z-50 flex flex-col gap-1.5 shadow-2xl border bg-surface-container-lowest/95 dark:bg-[#443326] backdrop-blur-xl border-surface-variant/40 dark:border-[#51402E] text-on-surface dark:text-[#F3E9D8]"
                >
                  {/* Colleges / Higher Ed */}
                  <Link
                    href="/our-solution/students"
                    onClick={() => setSolutionDropdownOpen(false)}
                    className="p-2.5 sm:p-3 rounded-xl flex items-start gap-3 transition-colors group hover:bg-[#E6F4F0]/60 dark:hover:bg-[#3B2C20] w-full"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors bg-[#006C56]/10 text-[#006C56] group-hover:bg-[#006C56] group-hover:text-white dark:bg-[#30241A] dark:text-[#A3A77A] dark:group-hover:bg-[#858A60] dark:group-hover:text-[#211A14]"
                    >
                      <span className="material-symbols-outlined text-lg">school</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-heading font-bold transition-colors text-on-surface group-hover:text-[#006C56] dark:text-[#F3E9D8] dark:group-hover:text-[#A3A77A] leading-snug">
                          For Students &amp; Colleges
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#30241A] dark:text-[#A7B69A] dark:border-[#51402E] shrink-0"
                        >
                          SC 2025
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-on-surface-variant dark:text-[#C5B7A4] leading-relaxed font-normal break-words">
                        Campus-wide suicide prevention &amp; UGC guidelines
                      </p>
                    </div>
                  </Link>

                  {/* Corporates & Startups */}
                  <Link
                    href="/our-solution/corporates"
                    onClick={() => setSolutionDropdownOpen(false)}
                    className="p-2.5 sm:p-3 rounded-xl flex items-start gap-3 transition-colors group hover:bg-[#E6F4F0]/60 dark:hover:bg-[#3B2C20] w-full"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors bg-[#006C56]/10 text-[#006C56] group-hover:bg-[#006C56] group-hover:text-white dark:bg-[#30241A] dark:text-[#A7B69A] dark:group-hover:bg-[#858A60] dark:group-hover:text-[#211A14]"
                    >
                      <span className="material-symbols-outlined text-lg">corporate_fare</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-heading font-bold transition-colors text-on-surface group-hover:text-[#006C56] dark:text-[#F3E9D8] dark:group-hover:text-[#A3A77A] leading-snug">
                          For Employees &amp; Corporates
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-on-surface-variant dark:text-[#C5B7A4] leading-relaxed font-normal break-words">
                        24/7 confidential EAP, burnout telemetry &amp; ROI
                      </p>
                    </div>
                  </Link>

                  {/* Dropdown Footer CTA */}
                  <div
                    className="mt-1 pt-2.5 border-t border-surface-variant/30 dark:border-[#51402E] flex flex-wrap items-center justify-between gap-2 px-2 pb-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionDropdownOpen(false);
                        setCallbackDefaultSegment("colleges");
                        setCallbackModalOpen(true);
                      }}
                      className="text-xs font-heading font-bold flex items-center gap-1.5 cursor-pointer text-[#006C56] hover:text-[#005241] dark:text-[#A3A77A] dark:hover:text-[#F3E9D8] transition-colors py-1 shrink-0"
                    >
                      <span className="material-symbols-outlined text-base">support_agent</span>
                      <span>Request a Callback</span>
                    </button>
                    <Link
                      href="/our-solution/students"
                      onClick={() => setSolutionDropdownOpen(false)}
                      className="text-[11px] sm:text-xs font-heading font-semibold transition-colors text-on-surface-variant hover:text-[#006C56] dark:text-[#C5B7A4] dark:hover:text-[#F3E9D8] py-1 shrink-0 flex items-center gap-1"
                    >
                      <span>Full Overview</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link
            href="/features"
            className={`transition-colors shrink-0 ${getNavLinkClass(pathname === "/features")}`}
          >
            Features
          </Link>
          <Link
            href="/stories"
            className={`transition-colors shrink-0 ${getNavLinkClass(pathname === "/stories")}`}
          >
            Stories
          </Link>
          <Link
            href="/for-you"
            className={`transition-colors shrink-0 ${getNavLinkClass(pathname === "/for-you")}`}
          >
            For You
          </Link>
          <Link
            href="/blog"
            className={`transition-colors shrink-0 ${getNavLinkClass(pathname === "/blog")}`}
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
              className={`transition-colors flex items-center gap-0.5 cursor-pointer py-1 ${getNavLinkClass(
                isAboutActive
              )}`}
              aria-expanded={aboutDropdownOpen}
              aria-haspopup="true"
            >
              <span>About</span>
              <span
                className={`material-symbols-outlined text-base transition-transform duration-200 ${
                  aboutDropdownOpen ? "rotate-180" : ""
                }`}
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
                  className="absolute top-full right-0 mt-1.5 w-60 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 bg-surface-container-lowest/95 dark:bg-[#443326] backdrop-blur-xl border border-surface-variant/40 dark:border-[#51402E] text-on-surface dark:text-[#F3E9D8]"
                >
                  <Link
                    href="/about"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/about"
                        ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                        : "text-on-surface hover:bg-surface-container/70 hover:text-[#006C56] dark:text-[#C5B7A4] dark:hover:bg-[#3B2C20] dark:hover:text-[#F3E9D8]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#006C56]/80 dark:text-[#A3A77A]">info</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">About Us</div>
                      <div className="text-[10px] font-normal leading-tight text-on-surface-variant dark:text-[#9F907E]">
                        Our story, pillars &amp; mission
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/faq"
                        ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                        : "text-on-surface hover:bg-surface-container/70 hover:text-[#006C56] dark:text-[#C5B7A4] dark:hover:bg-[#3B2C20] dark:hover:text-[#F3E9D8]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#00A889] dark:text-[#A7B69A]">quiz</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">FAQ</div>
                      <div className="text-[10px] font-normal leading-tight text-on-surface-variant dark:text-[#9F907E]">
                        Frequently asked questions
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/privacy-and-trust"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/privacy-and-trust"
                        ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                        : "text-on-surface hover:bg-surface-container/70 hover:text-[#006C56] dark:text-[#C5B7A4] dark:hover:bg-[#3B2C20] dark:hover:text-[#F3E9D8]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-rose-400 dark:text-[#D4A59A]">verified_user</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">Privacy &amp; Trust</div>
                      <div className="text-[10px] font-normal leading-tight text-on-surface-variant dark:text-[#9F907E]">
                        Security &amp; confidentiality
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right Column: Actions & Mobile Toggle (1fr, aligned to right edge) */}
        <div className="flex items-center justify-end lg:justify-self-end shrink-0 gap-3 sm:gap-4 min-w-0">
          {!mounted || (!isExplicitPublic && !isAuthExempt && loading && !isAuthenticated) ? (
            /* Session Loading / Initial Hydration Skeleton Spacer - Prevents Flash of Wrong Navbar */
            <div className="hidden sm:flex items-center gap-2.5 h-9 min-w-[140px] opacity-0 pointer-events-none" aria-hidden="true" />
          ) : showAuthenticatedUI ? (
            /* Authenticated Header Controls (Theme Toggle, Profile Dropdown, Crisis) */
            <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-4">
              {/* Theme / Dark Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-8.5 h-8.5 rounded-full bg-surface-container/70 hover:bg-surface-container border border-surface-variant/40 dark:border-[#51402E] dark:bg-[#30241A] dark:hover:bg-[#3B2C20] text-on-surface dark:text-[#F3E9D8] flex items-center justify-center transition-colors cursor-pointer select-none shrink-0"
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
                  className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container/70 hover:bg-surface-container border border-surface-variant/40 dark:border-[#51402E] dark:bg-[#30241A] dark:hover:bg-[#3B2C20] focus:outline-none focus:ring-2 focus:ring-[#858A60]/40 cursor-pointer transition-all"
                  aria-label="User profile menu"
                  aria-haspopup="true"
                  aria-expanded={profileDropdownOpen}
                >
                  <UserAvatar user={user} sizeClass="w-8 h-8 text-xs" />
                  <div className="text-left hidden sm:block pr-1">
                    <p className="text-xs font-heading font-bold text-on-surface dark:text-[#F3E9D8] leading-tight truncate max-w-[120px]" suppressHydrationWarning>
                      Hi, {greetingName}
                    </p>
                    <p className="text-[9px] text-on-surface-variant/80 dark:text-[#9F907E] font-medium leading-none mt-0.5">
                      Take care today
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-base text-on-surface-variant dark:text-[#9F907E] pr-1">
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
                      className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl dark:bg-[#443326] border border-surface-variant/40 dark:border-[#51402E] text-on-surface dark:text-[#F3E9D8] shadow-2xl p-1.5 z-50 flex flex-col gap-1"
                    >
                      <div className="px-3.5 py-2 border-b border-surface-variant/30 dark:border-[#51402E]">
                        <p className="font-heading font-bold text-on-surface dark:text-[#F3E9D8] text-sm truncate" suppressHydrationWarning>
                          {userName || "Manraah Member"}
                        </p>
                        <p className="text-[10px] text-on-surface-variant/80 dark:text-[#9F907E] font-medium truncate mt-0.5">
                          Active Profile: {formatCategoryLabel(user?.selectedCategory)}
                        </p>
                      </div>

                      {/* Dashboard Link */}
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-colors text-xs font-heading font-semibold cursor-pointer ${
                          pathname === "/dashboard"
                            ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                            : "text-on-surface-variant dark:text-[#C5B7A4] hover:bg-surface-container/70 hover:text-[#006C56] dark:hover:bg-[#3B2C20] dark:hover:text-[#F3E9D8]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg text-[#006C56] dark:text-[#A3A77A]">dashboard</span>
                        <span>Dashboard</span>
                      </Link>

                      {/* My Profile Link */}
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-colors text-xs font-heading font-semibold cursor-pointer ${
                          pathname === "/profile"
                            ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                            : "text-on-surface-variant dark:text-[#C5B7A4] hover:bg-surface-container/70 hover:text-[#006C56] dark:hover:bg-[#3B2C20] dark:hover:text-[#F3E9D8]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg text-[#006C56] dark:text-[#A3A77A]">person</span>
                        <span>My Profile</span>
                      </Link>

                      {/* My Journey Link */}
                      <Link
                        href="/journey"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-colors text-xs font-heading font-semibold cursor-pointer ${
                          pathname === "/journey"
                            ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                            : "text-on-surface-variant dark:text-[#C5B7A4] hover:bg-surface-container/70 hover:text-[#006C56] dark:hover:bg-[#3B2C20] dark:hover:text-[#F3E9D8]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg text-[#006C56] dark:text-[#A3A77A]">timeline</span>
                        <span>My Journey</span>
                      </Link>

                      <div className="my-0.5 border-t border-surface-variant/30 dark:border-[#51402E]" />

                      {/* Log Out Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-rose-600 dark:text-[#C95D54] hover:bg-rose-50 dark:hover:bg-[#C95D54]/15 transition-colors text-xs font-heading font-semibold cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-lg text-rose-500 dark:text-[#C95D54]">logout</span>
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Crisis Button (Authenticated) */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-crisis-modal"));
                  }
                  setIsCrisisModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full font-heading font-extrabold text-xs sm:text-sm transition-all cursor-pointer select-none shrink-0 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 dark:bg-[#C95D54]/15 dark:hover:bg-[#C95D54]/25 dark:border-[#C95D54]/50 dark:text-[#C95D54] shadow-xs hover:shadow-sm"
                title="Crisis & 24/7 Helplines"
                aria-label="Crisis"
              >
                <span className="material-symbols-outlined text-base sm:text-lg animate-pulse text-rose-500 dark:text-[#C95D54]">
                  emergency
                </span>
                <span className="hidden xl:inline">Crisis Help</span>
                <span className="inline xl:hidden">Crisis</span>
              </button>
            </div>
          ) : (
            /* Public Action Buttons (Log In, Get Started) */
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                href="/login"
                className={`px-4 sm:px-5 py-2 rounded-full text-xs font-heading font-bold border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 ${
                  isLoginPage
                    ? "bg-primary/20 text-primary border-primary/40 dark:bg-primary/20 dark:text-[#88F7D6] dark:border-primary/40"
                    : "bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white hover:border-primary dark:bg-primary/15 dark:border-primary/30 dark:text-[#88F7D6] dark:hover:bg-primary dark:hover:text-white"
                }`}
              >
                Log In
              </Link>

              <button
                type="button"
                onClick={handleGetStarted}
                className={`px-4 sm:px-5 py-2 rounded-full font-heading font-bold text-xs border transition-all duration-200 flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 ${
                  isSignupPage || pathname === "/category-selection"
                    ? "bg-primary border-primary text-white ring-2 ring-primary/30 dark:bg-primary dark:text-white dark:border-primary"
                    : "bg-primary/10 hover:bg-primary border-primary/20 hover:border-primary text-primary hover:text-white dark:bg-primary/15 dark:border-primary/30 dark:text-[#88F7D6] dark:hover:bg-primary dark:hover:text-white"
                }`}
              >
                <span>Get Started</span>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={handleToggleMobile}
            className="lg:hidden p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 bg-[#E6F4F0]/60 hover:bg-[#E6F4F0] text-[#19332A] border border-[#CBECE2] dark:bg-[#30241A] dark:border-[#51402E] dark:text-[#F3E9D8] dark:hover:bg-[#3B2C20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006C56]/40"
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
              className="relative z-20 lg:hidden w-full bg-surface-container-lowest dark:bg-[#201811] border-t border-surface-variant/30 dark:border-[#51402E] px-5 sm:px-6 pt-4 pb-8 flex flex-col gap-4 shadow-2xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto no-scrollbar"
            >
              <nav className="flex flex-col gap-1 font-heading font-semibold text-sm text-on-surface dark:text-[#F3E9D8]">
                {/* Mobile Quick Crisis Support Access (Authenticated Users Only) */}
                {isUserAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("open-crisis-modal"));
                      }
                      setIsCrisisModalOpen(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-red-50 dark:bg-[#C95D54]/15 text-red-600 dark:text-[#C95D54] border border-red-200 dark:border-[#C95D54]/40 font-heading font-extrabold text-sm sm:text-base flex items-center justify-between transition-colors mb-1 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg sm:text-xl text-red-500 dark:text-[#C95D54] animate-pulse">emergency</span>
                      <span>Crisis Support &amp; Helplines</span>
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-500/10 dark:bg-[#C95D54]/20 text-red-600 dark:text-[#C95D54] font-extrabold">24/7</span>
                  </button>
                )}

                <Link
                  href="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between ${
                    pathname === "/how-it-works" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : ""
                  }`}
                >
                  <span>How it Works</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40 dark:text-[#9F907E]">chevron_right</span>
                </Link>
                {isUserAuthenticated && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between ${
                      pathname === "/dashboard" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : ""
                    }`}
                  >
                    <span>Dashboard</span>
                    <span className="material-symbols-outlined text-base text-on-surface-variant/40 dark:text-[#9F907E]">chevron_right</span>
                  </Link>
                )}
                {/* Mobile Solutions Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setMobileSolutionOpen((prev) => !prev)}
                    className="py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={isSolutionActive ? "text-[#006C56] dark:text-[#A3A77A] font-bold" : ""}>Our Solution</span>
                    </span>
                    <span
                      className={`material-symbols-outlined text-base text-on-surface-variant/50 dark:text-[#9F907E] transition-transform duration-200 ${
                        mobileSolutionOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  <AnimatePresence>
                    {mobileSolutionOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 sm:p-2.5 flex flex-col gap-1.5 bg-surface-container-low/50 dark:bg-[#30241A]/50 rounded-xl mt-1 overflow-hidden"
                      >
                        <Link
                          href="/our-solution/students"
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-2.5 rounded-lg hover:bg-surface-container dark:hover:bg-[#3B2C20] flex items-start gap-3 transition-colors text-on-surface dark:text-[#F3E9D8] w-full"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A]">
                            <span className="material-symbols-outlined text-base">school</span>
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="text-xs font-heading font-bold leading-tight">
                                For Students &amp; Colleges
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#30241A] dark:text-[#A7B69A] dark:border-[#51402E] shrink-0">
                                SC 2025
                              </span>
                            </div>
                            <p className="text-[11px] text-on-surface-variant dark:text-[#9F907E] font-normal leading-relaxed break-words">
                              Campus-wide suicide prevention &amp; UGC guidelines
                            </p>
                          </div>
                        </Link>
                        <Link
                          href="/our-solution/corporates"
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-2.5 rounded-lg hover:bg-surface-container dark:hover:bg-[#3B2C20] flex items-start gap-3 transition-colors text-on-surface dark:text-[#F3E9D8] w-full"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A7B69A]">
                            <span className="material-symbols-outlined text-base">corporate_fare</span>
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="text-xs font-heading font-bold leading-tight">
                              For Employees &amp; Corporates
                            </div>
                            <p className="text-[11px] text-on-surface-variant dark:text-[#9F907E] font-normal leading-relaxed break-words">
                              24/7 confidential EAP, burnout telemetry &amp; ROI
                            </p>
                          </div>
                        </Link>
                        <div className="mt-1 pt-2 border-t border-surface-variant/20 dark:border-[#51402E] flex flex-wrap items-center justify-between gap-2 px-1">
                          <button
                            type="button"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setCallbackDefaultSegment("colleges");
                              setCallbackModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-[#006C56]/10 text-[#006C56] dark:bg-[#3B2C20] dark:text-[#A3A77A] hover:bg-[#006C56]/20 dark:hover:bg-[#443326] text-xs font-heading font-bold flex items-center gap-1.5 text-left cursor-pointer transition-colors shrink-0"
                          >
                            <span className="material-symbols-outlined text-base">support_agent</span>
                            <span>Request a Callback</span>
                          </button>
                          <Link
                            href="/our-solution/students"
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-1.5 px-2 text-[11px] font-heading font-semibold text-on-surface-variant hover:text-[#006C56] dark:text-[#C5B7A4] dark:hover:text-[#F3E9D8] transition-colors shrink-0 flex items-center gap-1"
                          >
                            <span>Full Overview</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link
                  href="/features"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between ${
                    pathname === "/features" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : ""
                  }`}
                >
                  <span>Features</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40 dark:text-[#9F907E]">chevron_right</span>
                </Link>
                <Link
                  href="/stories"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between ${
                    pathname === "/stories" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : ""
                  }`}
                >
                  <span>Stories</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40 dark:text-[#9F907E]">chevron_right</span>
                </Link>
                <Link
                  href="/for-you"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between ${
                    pathname === "/for-you" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : ""
                  }`}
                >
                  <span>For You (Pathways)</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40 dark:text-[#9F907E]">chevron_right</span>
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] transition-colors flex items-center justify-between ${
                    pathname === "/blog" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : ""
                  }`}
                >
                  <span>Blog</span>
                  <span className="material-symbols-outlined text-base text-on-surface-variant/40 dark:text-[#9F907E]">chevron_right</span>
                </Link>

                {/* Mobile About Sub-section */}
                <div className="pt-2 mt-2 border-t border-surface-variant/20 dark:border-[#51402E] space-y-1">
                  <div className="px-3.5 py-1 text-[11px] font-heading font-bold tracking-wider text-on-surface-variant/70 dark:text-[#9F907E]">
                    About &amp; Trust
                  </div>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] flex items-center gap-2.5 transition-colors ${
                      pathname === "/about" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : "text-on-surface-variant dark:text-[#C5B7A4]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#006C56] dark:text-[#A3A77A]">info</span>
                    <span>About Us</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] flex items-center gap-2.5 transition-colors ${
                      pathname === "/faq" ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold" : "text-on-surface-variant dark:text-[#C5B7A4]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-secondary dark:text-[#A7B69A]">quiz</span>
                    <span>FAQ</span>
                  </Link>
                  <Link
                    href="/privacy-and-trust"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3.5 rounded-xl hover:bg-surface-container hover:text-[#006C56] dark:hover:bg-[#30241A] dark:hover:text-[#F3E9D8] flex items-center gap-2.5 transition-colors ${
                      pathname === "/privacy-and-trust"
                        ? "bg-[#006C56]/10 text-[#006C56] dark:bg-[#30241A] dark:text-[#A3A77A] font-bold"
                        : "text-on-surface-variant dark:text-[#C5B7A4]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#006C56] dark:text-[#A3A77A]">verified_user</span>
                    <span>Privacy &amp; Trust</span>
                  </Link>
                </div>
              </nav>

              <div className="flex flex-col gap-2.5 pt-2 border-t border-surface-variant/20 dark:border-[#51402E]">
                {isAuthView ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3.5 rounded-full bg-primary hover:bg-[#005241] border border-primary text-white font-heading font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer dark:bg-primary dark:text-white dark:border-primary"
                    >
                      <span>Go to Dashboard</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-center py-2.5 rounded-full bg-rose-500/15 dark:bg-[#C95D54]/15 text-rose-600 dark:text-[#C95D54] font-heading font-semibold text-xs transition-colors cursor-pointer"
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
                      className={`w-full py-3.5 rounded-full border font-heading font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        isSignupPage || pathname === "/category-selection"
                          ? "bg-primary border-primary text-white dark:bg-primary dark:text-white dark:border-primary"
                          : "bg-primary/10 hover:bg-primary border-primary/20 hover:border-primary text-primary hover:text-white dark:bg-primary/15 dark:border-primary/30 dark:text-[#88F7D6] dark:hover:bg-primary dark:hover:text-white"
                      }`}
                    >
                      <span>Get Started</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`w-full text-center py-3 rounded-full border font-heading font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        isLoginPage
                          ? "bg-primary/20 text-primary border-primary/40 dark:bg-primary/20 dark:text-[#88F7D6] dark:border-primary/40"
                          : "bg-primary/10 hover:bg-primary border-primary/20 hover:border-primary text-primary hover:text-white dark:bg-primary/15 dark:border-primary/30 dark:text-[#88F7D6] dark:hover:bg-primary dark:hover:text-white"
                      }`}
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

      {/* Global Institutional Request Callback Modal */}
      <RequestCallbackModal
        isOpen={callbackModalOpen}
        onClose={() => setCallbackModalOpen(false)}
        defaultSegment={callbackDefaultSegment}
      />
    </header>
  );
}
