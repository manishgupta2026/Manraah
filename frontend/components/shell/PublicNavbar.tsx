"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/backend/auth/client";

import Logo from "@/frontend/components/ui/Logo";
import RequestCallbackModal from "@/frontend/components/modals/RequestCallbackModal";

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [solutionDropdownOpen, setSolutionDropdownOpen] = useState(false);
  const [mobileSolutionOpen, setMobileSolutionOpen] = useState(false);
  const [callbackModalOpen, setCallbackModalOpen] = useState(false);
  const [callbackDefaultSegment, setCallbackDefaultSegment] = useState<"colleges" | "corporates">("colleges");

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/signup");
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";
  const isAboutActive = ["/about", "/faq", "/privacy-and-trust"].includes(pathname);
  const isSolutionActive = pathname.startsWith("/our-solution");

  // Close mobile drawer and dropdowns whenever route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setAboutDropdownOpen(false);
    setSolutionDropdownOpen(false);
  }, [pathname]);

  // Global listener to trigger callback modal from anywhere
  React.useEffect(() => {
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

  return (
    <>
      <header
      className={`sticky top-0 z-50 transition-all select-none w-full ${
        mobileMenuOpen
          ? "bg-surface-container-lowest shadow-xl"
          : "bg-surface/95 backdrop-blur-md border-b border-surface-variant/30"
      }`}
    >
      <div className="h-14 sm:h-16 max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between relative z-30">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity shrink-0">
          <Logo size="md" priority />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs xl:text-sm font-heading font-semibold text-on-surface-variant">
          <Link
            href="/how-it-works"
            className={`transition-colors hover:text-primary ${
              pathname === "/how-it-works" ? "text-primary font-bold" : ""
            }`}
          >
            How it Works
          </Link>
          {/* Solutions Dropdown Menu (Desktop) */}
          <div
            className="relative"
            onMouseEnter={() => setSolutionDropdownOpen(true)}
            onMouseLeave={() => setSolutionDropdownOpen(false)}
          >
            <button
              type="button"
              onClick={() => setSolutionDropdownOpen((prev) => !prev)}
              className={`transition-colors hover:text-primary flex items-center gap-1 cursor-pointer py-1 ${
                isSolutionActive ? "text-primary font-bold" : ""
              }`}
              aria-expanded={solutionDropdownOpen}
              aria-haspopup="true"
            >
              <span>Our Solution</span>
              <span
                className={`material-symbols-outlined text-base transition-transform duration-200 ${
                  solutionDropdownOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Solutions Dropdown Mega Card */}
            <AnimatePresence>
              {solutionDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-2 w-[430px] rounded-2xl bg-white dark:bg-[#0f2e26] border border-surface-variant/40 shadow-2xl p-3 z-50 flex flex-col gap-2"
                >
                  <div className="px-3 pt-1 pb-1 flex items-center justify-between border-b border-surface-variant/20">
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-on-surface-variant/70">
                      Institutional Solutions
                    </span>
                    <span className="text-[10px] font-heading font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      Campuses &amp; Workplaces
                    </span>
                  </div>

                  {/* 1. Higher Education & Students */}
                  <Link
                    href="/our-solution?target=colleges"
                    onClick={() => setSolutionDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container transition-all group/item"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl">school</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-bold text-on-surface group-hover/item:text-primary transition-colors">
                          For Students &amp; Universities
                        </span>
                        <span className="text-[10px] font-heading font-semibold text-primary">Explore →</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                        24/7 Anonymous campus therapy, exam anxiety relief &amp; Supreme Court 2025 / UGC compliance.
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] font-heading font-semibold text-on-surface-variant">
                          Colleges &amp; Universities
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] font-heading font-semibold text-on-surface-variant">
                          Coaching Hubs
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* 2. Corporates & Employees */}
                  <Link
                    href="/our-solution?target=corporates"
                    onClick={() => setSolutionDropdownOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-container transition-all group/item"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0 group-hover/item:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading font-bold text-on-surface group-hover/item:text-secondary transition-colors">
                          For Employees &amp; Corporates
                        </span>
                        <span className="text-[10px] font-heading font-semibold text-secondary">Explore →</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                        Comprehensive 24/7 EAP, workplace burnout telemetry &amp; confidential team counselling.
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] font-heading font-semibold text-on-surface-variant">
                          Enterprises
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[9px] font-heading font-semibold text-on-surface-variant">
                          High-Stress Teams
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Dropdown Footer CTA */}
                  <div className="mt-1 pt-2 border-t border-surface-variant/20 flex items-center justify-between px-2 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSolutionDropdownOpen(false);
                        setCallbackDefaultSegment("colleges");
                        setCallbackModalOpen(true);
                      }}
                      className="text-xs font-heading font-bold text-primary hover:text-primary-purple flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">support_agent</span>
                      <span>Request a Callback</span>
                    </button>
                    <Link
                      href="/our-solution"
                      onClick={() => setSolutionDropdownOpen(false)}
                      className="text-[11px] font-heading font-semibold text-on-surface-variant hover:text-primary transition-colors"
                    >
                      Full Overview &rarr;
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                  className="absolute top-full right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0f2e26] border border-surface-variant/40 shadow-xl p-2 z-50 flex flex-col gap-1"
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

        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        {mobileMenuOpen && (
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
                {/* Mobile Solutions Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setMobileSolutionOpen((prev) => !prev)}
                    className="py-3 px-3.5 rounded-xl hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={isSolutionActive ? "text-primary font-bold" : ""}>Our Solution</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold bg-primary/10 text-primary border border-primary/20">
                        Institutions
                      </span>
                    </span>
                    <span
                      className={`material-symbols-outlined text-base text-on-surface-variant/50 transition-transform duration-200 ${
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
                        className="pl-3 pr-1 py-1.5 flex flex-col gap-1 bg-surface-container-low/50 rounded-xl mt-1 overflow-hidden"
                      >
                        <Link
                          href="/our-solution?target=colleges"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 px-3 rounded-lg hover:bg-surface-container text-xs font-heading font-semibold flex items-center gap-2.5 text-on-surface"
                        >
                          <span className="material-symbols-outlined text-base text-primary">school</span>
                          <div>
                            <div className="leading-tight">For Students &amp; Colleges</div>
                            <div className="text-[10px] text-on-surface-variant font-normal">
                              UGC/SC compliance &amp; campus care
                            </div>
                          </div>
                        </Link>
                        <Link
                          href="/our-solution?target=corporates"
                          onClick={() => setMobileMenuOpen(false)}
                          className="py-2.5 px-3 rounded-lg hover:bg-surface-container text-xs font-heading font-semibold flex items-center gap-2.5 text-on-surface"
                        >
                          <span className="material-symbols-outlined text-base text-secondary">corporate_fare</span>
                          <div>
                            <div className="leading-tight">For Employees &amp; Corporates</div>
                            <div className="text-[10px] text-on-surface-variant font-normal">
                              24/7 EAP &amp; burnout telemetry
                            </div>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setCallbackDefaultSegment("colleges");
                            setCallbackModalOpen(true);
                          }}
                          className="mt-1 py-2.5 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-heading font-bold flex items-center gap-2 text-left cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">support_agent</span>
                          <span>Request a Callback</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

    {/* Global Institutional Request Callback Modal */}
    <RequestCallbackModal
      isOpen={callbackModalOpen}
      onClose={() => setCallbackModalOpen(false)}
      defaultSegment={callbackDefaultSegment}
    />
  </>
  );
}
