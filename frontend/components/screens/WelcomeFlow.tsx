"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WelcomeFlow() {
  const router = useRouter();

  return (
    <div className="bg-background text-on-background font-sans min-h-screen relative flex flex-col justify-between overflow-x-hidden">
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 z-[-2] opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-primary-container blur-[80px] md:blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-secondary-container blur-[100px] opacity-40" />
      </div>

      {/* ============================================================ */}
      {/* MOBILE LANDING VIEW (< md screens) — welcome_to_manraah_2     */}
      {/* ============================================================ */}
      <div className="md:hidden flex-1 flex flex-col justify-between items-center px-6 pt-10 pb-6 w-full max-w-[440px] mx-auto z-10">
        {/* Brand / Logo Area */}
        <header className="w-full text-center mb-6">
          <h1 className="font-heading font-bold text-4xl text-primary tracking-tight">Manraah</h1>
        </header>

        {/* Hero Organic Illustration Container */}
        <div className="relative w-full aspect-square max-w-[280px] mb-6 flex items-center justify-center">
          {/* Ambient Glow Aura */}
          <div className="absolute w-48 h-48 rounded-full bg-primary-container/20 blur-2xl animate-pulse" />

          {/* Organic Illustration Card */}
          <div className="relative w-56 h-56 rounded-full bg-gradient-to-tr from-surface-container via-surface-container-low to-surface-container-lowest border-4 border-surface-container-high flex flex-col items-center justify-center text-center shadow-lg p-6 space-y-3">
            <div className="w-20 h-20 rounded-full bg-primary-container/20 text-primary flex items-center justify-center border-2 border-primary/30 shadow-inner">
              <span className="material-symbols-outlined text-5xl">favorite</span>
            </div>
            <div className="space-y-0.5">
              <span className="font-heading font-bold text-sm text-on-surface block">Inner Peace & Calm</span>
              <span className="text-[11px] text-on-surface-variant/70 font-semibold block">Your Private Sanctuary</span>
            </div>
          </div>
        </div>

        {/* Tagline & Description */}
        <div className="text-center mb-8 w-full space-y-3">
          <h2 className="font-heading font-bold text-2xl text-on-surface leading-snug">
            Your Sanctuary for<br />Mind and Soul.
          </h2>
          <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto leading-relaxed">
            Begin a compassionate journey towards mental clarity and inner peace.
          </p>
        </div>

        {/* Mobile Action Buttons Stack */}
        <div className="w-full flex flex-col gap-3 mt-auto mb-6">
          <button
            onClick={() => router.push("/category-selection")}
            className="w-full bg-primary text-white font-bold text-sm py-4 rounded-full shadow-[0_8px_30px_rgba(95,78,165,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Get Started
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>

          <Link
            href="/login"
            className="w-full bg-transparent text-primary font-bold text-sm py-4 rounded-full text-center hover:bg-primary/5 active:bg-primary/10 transition-colors"
          >
            I already have an account
          </Link>
        </div>

        {/* Compact Mobile Trust Badges */}
        <footer className="w-full text-center opacity-80 pt-2 border-t border-surface-variant/30">
          <div className="flex items-center justify-center gap-4 text-xs text-on-surface-variant font-medium">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">lock</span>
              <span>End-to-end Encrypted</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-outline-variant" />
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-secondary">visibility_off</span>
              <span>Anonymous & Private</span>
            </div>
          </div>
        </footer>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP LANDING VIEW (>= md screens) — welcome_to_manraah_1  */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-col justify-between min-h-screen">
        {/* Desktop Header */}
        <header className="w-full max-w-[1200px] mx-auto p-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">spa</span>
            <span className="font-heading font-bold text-2xl text-primary tracking-tight">Manraah</span>
          </div>
        </header>

        {/* Desktop Main Content */}
        <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-12 py-8 max-w-[1200px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Hero Copy */}
            <div className="flex flex-col gap-6 max-w-xl">
              <div className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full w-fit">
                <span className="material-symbols-outlined text-sm text-secondary">new_releases</span>
                <span className="text-xs font-semibold text-on-surface-variant">Version 2.0 Now Available</span>
              </div>

              <h1 className="font-heading font-bold text-5xl lg:text-6xl text-on-surface leading-tight">
                Your Sanctuary for{" "}
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-purple">
                  Mind and Soul
                </span>
                .
              </h1>

              <p className="text-body-lg text-on-surface-variant opacity-90 leading-relaxed">
                A compassionate AI companion dedicated to your emotional well-being. Experience a safe, private space to process thoughts, track your mood, and find evidence-based support whenever you need it.
              </p>

              {/* CTAs */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => router.push("/category-selection")}
                  className="bg-gradient-to-br from-primary to-primary-purple text-white font-bold text-sm px-8 py-4 rounded-full shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>

                <Link
                  href="/login"
                  className="bg-transparent border border-surface-variant text-primary font-semibold text-sm px-8 py-4 rounded-full hover:bg-surface-container hover:border-primary transition-colors flex items-center justify-center"
                >
                  I already have an account
                </Link>
              </div>
            </div>

            {/* Desktop Hero Organic Illustration */}
            <div className="relative w-full aspect-[4/3] rounded-[32px] overflow-hidden shadow-soft bg-surface-container-lowest border border-surface-variant/30 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-28 h-28 rounded-full bg-primary-container/20 text-primary flex items-center justify-center border-4 border-primary/20 shadow-inner">
                <span className="material-symbols-outlined text-6xl">spa</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-2xl text-on-surface">Compassionate Clarity</h3>
                <p className="text-sm text-on-surface-variant max-w-sm">Bridging high-tech AI capabilities with soft human wellness care.</p>
              </div>

              {/* Floating Badge 1 */}
              <div className="absolute top-6 right-6 glass-panel px-4 py-3 rounded-full flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-on-surface">Feeling Calm</p>
                  <p className="text-[10px] text-on-surface-variant/70">Just now</p>
                </div>
              </div>

              {/* Floating Badge 2 */}
              <div className="absolute bottom-6 left-6 glass-panel px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">shield_lock</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-on-surface">100% Private</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Trust Badges */}
          <div className="w-full mt-12 glass-panel rounded-3xl p-6 border-none shadow-soft bg-surface-container-lowest/70">
            <p className="text-center text-xs font-bold text-on-surface-variant mb-6 uppercase tracking-wider opacity-70">
              Why choose Manraah
            </p>
            <div className="flex justify-around items-center gap-6 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">lock</span>
                <span>End-to-end Encrypted</span>
              </div>
              <div className="w-px h-6 bg-surface-variant" />
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl">visibility_off</span>
                <span>Anonymous & Private</span>
              </div>
              <div className="w-px h-6 bg-surface-variant" />
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary text-2xl">science</span>
                <span>Evidence-based Support</span>
              </div>
              <div className="w-px h-6 bg-surface-variant" />
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">schedule</span>
                <span>Available 24/7</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
