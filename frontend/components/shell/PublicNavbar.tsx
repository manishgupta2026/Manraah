"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/backend/auth/client";

import Logo from "@/frontend/components/ui/Logo";

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAboutActive = ["/about", "/faq", "/privacy-and-trust"].includes(pathname);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-surface-variant/30 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <Logo size="md" priority />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-heading font-semibold text-on-surface-variant">
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
            className={`transition-colors hover:text-primary flex items-center gap-1.5 ${
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
              className={`transition-colors hover:text-primary flex items-center gap-1 cursor-pointer py-1 ${
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

        {/* Action CTAs (Desktop) */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className={`px-5 py-2.5 rounded-full text-xs font-heading font-bold transition-all ${
              isLoginPage
                ? "bg-primary-container/20 text-primary border border-primary/30"
                : "bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary/5"
            }`}
          >
            Log In
          </Link>

          <button
            onClick={handleGetStarted}
            className={`px-6 py-2.5 rounded-full font-heading font-bold text-xs shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer ${
              isSignupPage || pathname === "/category-selection"
                ? "bg-primary-purple text-white ring-2 ring-primary/20"
                : "bg-primary hover:bg-primary-purple text-white"
            }`}
          >
            <span>Get Started</span>
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-variant/50 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-2xl font-bold">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Animated Dropdown Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-surface-container-lowest border-b border-surface-variant/30 px-6 py-5 flex flex-col gap-4 shadow-lg"
          >
            <nav className="flex flex-col gap-1 font-heading font-semibold text-sm text-on-surface">
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary ${
                  pathname === "/how-it-works" ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                How it Works
              </Link>
              <Link
                href="/our-solution"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary flex items-center justify-between ${
                  pathname === "/our-solution" ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                <span>Our Solution</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-primary/10 text-primary border border-primary/20">
                  Soon
                </span>
              </Link>
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary ${
                  pathname === "/features" ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                Features
              </Link>
              <Link
                href="/stories"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary ${
                  pathname === "/stories" ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                Stories
              </Link>
              <Link
                href="/for-you"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary ${
                  pathname === "/for-you" ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                For You (Pathways)
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary ${
                  pathname === "/blog" ? "bg-primary/10 text-primary font-bold" : ""
                }`}
              >
                Blog
              </Link>

              {/* Mobile About Sub-section */}
              <div className="pt-2 mt-2 border-t border-surface-variant/30 space-y-1">
                <div className="px-3 py-1 text-[11px] font-heading font-bold uppercase tracking-wider text-on-surface-variant/70">
                  About &amp; Trust
                </div>
                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary flex items-center gap-2.5 ${
                    pathname === "/about" ? "bg-primary/10 text-primary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>About Us</span>
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary flex items-center gap-2.5 ${
                    pathname === "/faq" ? "bg-primary/10 text-primary font-bold" : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">quiz</span>
                  <span>FAQ</span>
                </Link>
                <Link
                  href="/privacy-and-trust"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2 px-3 rounded-xl hover:bg-surface-container hover:text-primary flex items-center gap-2.5 ${
                    pathname === "/privacy-and-trust"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Privacy &amp; Trust</span>
                </Link>
              </div>
            </nav>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGetStarted();
                }}
                className="w-full py-3.5 rounded-full bg-primary text-white font-heading font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                Get Started
              </button>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-full bg-surface-container border border-surface-variant/40 font-heading font-semibold text-sm text-on-surface"
              >
                Log In to Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
