"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession, signOut } from "@/backend/auth/client";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import { useTheme } from "@/frontend/lib/context/ThemeContext";
import Logo from "@/frontend/components/ui/Logo";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

export interface NavbarProps {
  variant?: "auto" | "public" | "authenticated";
  onOpenMenu?: () => void;
}

export default function Navbar({ variant = "auto", onOpenMenu }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userName = user?.sanctuaryName || user?.name || "Sanctuary Member";

  // Determine if this instance should display authenticated or public action CTAs
  const isExplicitAuth = variant === "authenticated";
  const isExplicitPublic = variant === "public";
  const isAuthRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/journey") ||
    pathname.startsWith("/resources") ||
    pathname.startsWith("/ai-companion") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/meditation") ||
    pathname.startsWith("/sleep") ||
    pathname.startsWith("/checkin");

  const isAuthView = isExplicitAuth || (!isExplicitPublic && isAuthRoute);

  const handleGetStarted = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    router.push("/signup");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAboutActive = ["/about", "/faq", "/privacy-and-trust"].includes(pathname);

  // Close mobile drawer & dropdown whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleToggleMobile = () => {
    if (onOpenMenu) {
      onOpenMenu();
    } else {
      setMobileMenuOpen((prev) => !prev);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all select-none w-full ${
        mobileMenuOpen
          ? "bg-surface-container-lowest shadow-xl"
          : "bg-surface/95 backdrop-blur-md border-b border-surface-variant/30"
      }`}
    >
      <div className="h-14 sm:h-16 max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between relative z-30">
        {/* Brand Logo (Exact Home Navbar Dimensions & Position) */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity shrink-0">
          <Logo size="md" priority />
        </Link>

        {/* Navigation Links (Desktop - Exact Home Navbar Typography, Spacing & Gap) */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs xl:text-sm font-heading font-semibold text-on-surface-variant">
          <Link
            href="/how-it-works"
            className={`transition-colors hover:text-primary ${
              pathname === "/how-it-works" ? "text-primary font-bold" : ""
            }`}
          >
            How it Works
          </Link>
          <Link
            href="/our-solution"
            className={`transition-colors hover:text-primary flex items-center gap-1 ${
              pathname === "/our-solution" ? "text-primary font-bold" : ""
            }`}
          >
            <span>Our Solution</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-heading font-extrabold bg-primary/10 text-primary border border-primary/20 leading-none">
              Soon
            </span>
          </Link>
          <Link
            href="/features"
            className={`transition-colors hover:text-primary ${
              pathname === "/features" ? "text-primary font-bold" : ""
            }`}
          >
            Features
          </Link>
          <Link
            href="/stories"
            className={`transition-colors hover:text-primary ${
              pathname === "/stories" ? "text-primary font-bold" : ""
            }`}
          >
            Stories
          </Link>
          <Link
            href="/for-you"
            className={`transition-colors hover:text-primary ${
              pathname === "/for-you" ? "text-primary font-bold" : ""
            }`}
          >
            For You
          </Link>
          <Link
            href="/blog"
            className={`transition-colors hover:text-primary ${
              pathname === "/blog" ? "text-primary font-bold" : ""
            }`}
          >
            Blog
          </Link>

          {/* About Dropdown Menu (Desktop) */}
          <div
            className="relative"
            onMouseEnter={() => setAboutDropdownOpen(true)}
            onMouseLeave={() => setAboutDropdownOpen(false)}
          >
            <button
              onClick={() => setAboutDropdownOpen((prev) => !prev)}
              className={`transition-colors hover:text-primary flex items-center gap-0.5 cursor-pointer py-1 ${
                isAboutActive ? "text-primary font-bold" : ""
              }`}
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
                  className="absolute top-full right-0 mt-1.5 w-60 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-variant/40 shadow-xl p-2 z-50 flex flex-col gap-1"
                >
                  <Link
                    href="/about"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/about"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-primary/70">info</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">About Us</div>
                      <div className="text-[10px] text-on-surface-variant font-normal leading-tight">
                        Our story, pillars &amp; mission
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/faq"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/faq"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#006B56]/70">quiz</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">FAQ</div>
                      <div className="text-[10px] text-on-surface-variant font-normal leading-tight">
                        Frequently asked questions
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/privacy-and-trust"
                    onClick={() => setAboutDropdownOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                      pathname === "/privacy-and-trust"
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface hover:bg-surface-container hover:text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg text-[#874959]/70">verified_user</span>
                    <div>
                      <div className="text-xs font-heading font-bold leading-tight">Privacy &amp; Trust</div>
                      <div className="text-[10px] text-on-surface-variant font-normal leading-tight">
                        Security &amp; confidentiality
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Action CTAs (Exact Alignment with Home Navbar) */}
        {isAuthView ? (
          /* Authenticated Header Controls Styled to Match Home Navbar Proportions */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-variant/50 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer select-none"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="material-symbols-outlined text-lg">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-variant/50 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-lg">notifications</span>
              </button>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-heading font-bold rounded-full flex items-center justify-center border-2 border-surface">
                3
              </span>
            </div>

            {/* User Profile Chip */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-full bg-surface-container border border-surface-variant/40 hover:bg-surface-variant/50 transition-colors cursor-pointer select-none"
              >
                <UserAvatar user={user} sizeClass="w-8 h-8 text-xs" />
                <div className="text-left hidden sm:block pr-1">
                  <p className="text-xs font-heading font-bold text-on-surface leading-tight">
                    Hi, {userName}
                  </p>
                  <p className="text-[9px] text-on-surface-variant font-medium leading-none mt-0.5">
                    Take care today
                  </p>
                </div>
                <span className="material-symbols-outlined text-base text-on-surface-variant pr-1">
                  expand_more
                </span>
              </button>

              {/* Profile Dropdown Card */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-variant/40 shadow-xl py-2 z-50 text-xs transition-colors"
                  >
                    <div className="px-3.5 py-2 border-b border-surface-variant/30">
                      <p className="font-heading font-bold text-on-surface text-sm">{userName}</p>
                      <p className="text-[10px] text-on-surface-variant">Manraah Member</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-on-surface hover:bg-surface-container hover:text-primary font-heading font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-primary">person</span>
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/journey"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-on-surface hover:bg-surface-container hover:text-primary font-heading font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-base text-[#006B56]">explore</span>
                      <span>My Journey</span>
                    </Link>
                    <div className="my-1 border-t border-surface-variant/30" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-error hover:bg-error/10 font-heading font-bold text-left cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
          </div>
        )}

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={handleToggleMobile}
          className="lg:hidden p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-variant/50 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="material-symbols-outlined text-2xl font-bold">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
