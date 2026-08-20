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

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-surface-variant/30 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group hover:opacity-90 transition-opacity">
          <Logo size="md" priority className="h-8 sm:h-9" />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-heading font-semibold text-on-surface-variant">
          <Link
            href="/how-it-works"
            className={`transition-colors hover:text-primary ${
              pathname === "/how-it-works" ? "text-primary font-bold" : ""
            }`}
          >
            How it Works
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
            href="/privacy-and-trust"
            className={`transition-colors hover:text-primary ${
              pathname === "/privacy-and-trust" ? "text-primary font-bold" : ""
            }`}
          >
            Privacy &amp; Trust
          </Link>
          <Link
            href="/faq"
            className={`transition-colors hover:text-primary ${
              pathname === "/faq" ? "text-primary font-bold" : ""
            }`}
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className={`transition-colors hover:text-primary ${
              pathname === "/about" ? "text-primary font-bold" : ""
            }`}
          >
            About Us
          </Link>
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
            <nav className="flex flex-col gap-3 font-heading font-semibold text-sm text-on-surface">
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-surface-variant/20 hover:text-primary ${
                  pathname === "/how-it-works" ? "text-primary font-bold" : ""
                }`}
              >
                How it Works
              </Link>
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-surface-variant/20 hover:text-primary ${
                  pathname === "/features" ? "text-primary font-bold" : ""
                }`}
              >
                Features
              </Link>
              <Link
                href="/stories"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-surface-variant/20 hover:text-primary ${
                  pathname === "/stories" ? "text-primary font-bold" : ""
                }`}
              >
                Stories
              </Link>
              <Link
                href="/for-you"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-surface-variant/20 hover:text-primary ${
                  pathname === "/for-you" ? "text-primary font-bold" : ""
                }`}
              >
                For You (Pathways)
              </Link>
              <Link
                href="/privacy-and-trust"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-surface-variant/20 hover:text-primary ${
                  pathname === "/privacy-and-trust" ? "text-primary font-bold" : ""
                }`}
              >
                Privacy &amp; Trust
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 border-b border-surface-variant/20 hover:text-primary ${
                  pathname === "/faq" ? "text-primary font-bold" : ""
                }`}
              >
                FAQ
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 hover:text-primary ${
                  pathname === "/about" ? "text-primary font-bold" : ""
                }`}
              >
                About Us
              </Link>
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
