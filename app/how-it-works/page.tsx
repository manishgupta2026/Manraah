"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/backend/auth/client";

const STEPS_CAROUSEL = [
  {
    step: "01",
    title: "Choose Your Life Stage Path",
    subtitle: "Contextual adaptation from day one",
    desc: "Select your primary category — Student, Working Professional, Parent, Couple, or Other. Manraah immediately calibrates its AI conversational tone, dashboard widgets, and guided reflections to match your daily realities.",
    icon: "tune",
    color: "bg-primary/15 text-primary border-primary/30",
    badgeBg: "bg-primary text-white",
    highlights: [
      "Custom conversational tone & vocabulary",
      "Stage-specific reflection prompts & meditations",
      "Private peer circles organized by lived experience",
    ],
    mockupType: "category",
  },
  {
    step: "02",
    title: "Gentle 1-Minute Baseline Check-in",
    subtitle: "Establishing your emotional starting point",
    desc: "Take a brief, pressure-free check-in to establish your baseline stress levels, current energy, and immediate wellness goals. No clinical labels, cold questionnaires, or intrusive diagnostic forms.",
    icon: "assignment_turned_in",
    color: "bg-pink/25 text-[#9E3B54] border-pink/40",
    badgeBg: "bg-[#9E3B54] text-white",
    highlights: [
      "100% anonymous — no real name required",
      "Identifies stress resilience and emotional focus",
      "Instantly generates your initial Retreat Score",
    ],
    mockupType: "checkin",
  },
  {
    step: "03",
    title: "Unlock Your Personalized Retreat",
    subtitle: "Your private, always-available dashboard",
    desc: "Gain instant access to your customized space featuring your empathetic 24/7 AI companion, real-time Wellness Score tracking, curated bedtime audio, and encrypted reflective journaling.",
    icon: "auto_awesome",
    color: "bg-mint/25 text-[#006B56] border-mint/40",
    badgeBg: "bg-[#006B56] text-white",
    highlights: [
      "24/7 AI Companion ready to listen without judgment",
      "Visual daily Wellness Score across 4 core sub-metrics",
      "Bite-sized 2-minute breathing and grounding tools",
    ],
    mockupType: "dashboard",
  },
  {
    step: "04",
    title: "Grow at Your Own Gentle Pace",
    subtitle: "Long-term mental resilience and connection",
    desc: "Build sustainable daily habits through mood check-ins, guided CBT & MBSR exercises, anonymous peer community discussions, and direct access to licensed therapists whenever deeper care is needed.",
    icon: "trending_up",
    color: "bg-peach/30 text-[#9E5D28] border-peach/50",
    badgeBg: "bg-[#9E5D28] text-white",
    highlights: [
      "Progressive emotional rhythm and trend tracking",
      "Anonymous moderated peer circles",
      "1-on-1 sessions with verified professional therapists",
    ],
    mockupType: "growth",
  },
];

export default function HowItWorksPage() {
  const router = useRouter();
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleNextStep = () => {
    setActiveStepIdx((prev) => (prev + 1) % STEPS_CAROUSEL.length);
  };

  const handlePrevStep = () => {
    setActiveStepIdx((prev) => (prev - 1 + STEPS_CAROUSEL.length) % STEPS_CAROUSEL.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (diffX > 40) {
      handleNextStep();
    } else if (diffX < -40) {
      handlePrevStep();
    }
    setTouchStartX(null);
  };

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  const currentStep = STEPS_CAROUSEL[activeStepIdx];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 md:py-20 px-4 sm:px-6 lg:px-12 select-none overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">

        {/* ═══ 1. HEADER HERO ═══ */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest inline-block">
            Simple 4-Step Journey
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-tight">
            How Manraah Works
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
            Start feeling supported, understood, and grounded in less than two minutes. A calm, step-by-step pathway from your first check-in to lasting mental resilience.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Begin Your Free Journey</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* ═══ 2. INTERACTIVE STEP-BY-STEP CAROUSEL SHOWCASE ═══ */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="space-y-6"
        >
          {/* Step Pill Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {STEPS_CAROUSEL.map((s, idx) => {
              const isActive = activeStepIdx === idx;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStepIdx(idx)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-heading font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-md scale-[1.03]"
                      : "bg-surface-container-lowest border border-surface-variant/40 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isActive ? "bg-white text-primary" : "bg-primary/10 text-primary"
                  }`}>
                    {s.step}
                  </span>
                  <span>{s.title.split(" ")[0]} {s.title.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Main Slide Carousel Panel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="p-6 sm:p-10 md:p-12 rounded-[36px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Column: Step Copy & Highlights */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <div className="flex items-center gap-3">
                    <span className={`px-3.5 py-1 rounded-full text-xs font-heading font-black ${currentStep.badgeBg}`}>
                      Step {currentStep.step}
                    </span>
                    <span className="text-xs font-heading font-bold text-primary uppercase tracking-wider">
                      {currentStep.subtitle}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-on-surface tracking-tight leading-tight">
                    {currentStep.title}
                  </h2>

                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                    {currentStep.desc}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {currentStep.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-on-surface">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <button
                      onClick={handleGetStarted}
                      className="px-6 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-xs shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Try Step {currentStep.step}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>

                    <span className="text-xs text-on-surface-variant/70 font-semibold">
                      Step {activeStepIdx + 1} of {STEPS_CAROUSEL.length}
                    </span>
                  </div>
                </div>

                {/* Right Column: Interactive Styled UI Mockup Window */}
                <div className="lg:col-span-6 flex justify-center">
                  <div className="w-full max-w-md rounded-[28px] bg-surface-container-low border border-surface-variant/40 shadow-2xl p-5 space-y-4 text-left relative overflow-hidden">
                    {/* Window Chrome Header */}
                    <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-[10px] font-mono text-on-surface-variant/60">
                        manraah.app • step-{currentStep.step}
                      </span>
                    </div>

                    {/* Step-Specific Mockup Visuals */}
                    {currentStep.mockupType === "category" && (
                      <div className="space-y-3 py-2">
                        <p className="text-xs font-heading font-bold text-on-surface text-center">
                          Select Your Life Journey
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-heading font-bold">
                          <div className="p-3 rounded-2xl bg-primary/15 text-primary border border-primary/30 flex items-center gap-2">
                            <span>🎓</span>
                            <span>Student Mode</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-peach/25 text-[#9E5D28] border border-peach/40 flex items-center gap-2">
                            <span>💼</span>
                            <span>Working Pro</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-pink/20 text-[#874959] border border-pink/30 flex items-center gap-2">
                            <span>🍼</span>
                            <span>Parent Journey</span>
                          </div>
                          <div className="p-3 rounded-2xl bg-mint/20 text-[#006B56] border border-mint/30 flex items-center gap-2">
                            <span>💖</span>
                            <span>Couple Harmony</span>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-variant/30 text-[11px] text-center text-on-surface-variant">
                          ✨ AI instantly adjusts tone and wellness framework
                        </div>
                      </div>
                    )}

                    {currentStep.mockupType === "checkin" && (
                      <div className="space-y-3 py-2">
                        <p className="text-xs font-heading font-bold text-on-surface text-center">
                          How is your mental bandwidth today?
                        </p>
                        <div className="flex justify-center gap-2 text-xs font-heading font-bold">
                          <span className="px-3 py-1.5 rounded-full bg-mint/20 text-[#006B56] border border-mint/30">🌸 Calm</span>
                          <span className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30">✨ Balanced</span>
                          <span className="px-3 py-1.5 rounded-full bg-pink/20 text-[#874959] border border-pink/30">🌊 Overwhelmed</span>
                        </div>
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] text-on-surface-variant font-bold">
                            <span>Baseline Assessment</span>
                            <span>65% Complete</span>
                          </div>
                          <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[65%] rounded-full" />
                          </div>
                        </div>
                        <p className="text-[10px] text-center text-on-surface-variant/70">
                          🔒 100% Encrypted & Anonymous • No clinical labels
                        </p>
                      </div>
                    )}

                    {currentStep.mockupType === "dashboard" && (
                      <div className="space-y-3 py-2">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold">
                          <span className="text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">stars</span> Retreat Score
                          </span>
                          <span className="text-on-surface font-black">84 / 100</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-primary font-bold">
                            <span className="material-symbols-outlined text-sm">smart_toy</span>
                            <span>AI Companion</span>
                          </div>
                          <p className="text-on-surface-variant italic font-normal">
                            &quot;Good evening! I noticed you had a busy schedule today. Let&apos;s do a 2-minute breath reset.&quot;
                          </p>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-emerald-600">
                          <span className="px-2.5 py-1 rounded-lg bg-mint/15">🫁 2-Min Reset</span>
                          <span className="px-2.5 py-1 rounded-lg bg-peach/20 text-[#9E5D28]">📝 Night Journal</span>
                        </div>
                      </div>
                    )}

                    {currentStep.mockupType === "growth" && (
                      <div className="space-y-3 py-2 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-mint/25 text-[#006B56] border border-mint/40 flex items-center justify-center font-bold text-lg shadow-xs">
                          🌱
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-heading font-bold text-xs text-on-surface">Weekly Wellness Habit Streak</h4>
                          <p className="text-[11px] text-emerald-600 font-bold">+18% Resilience Growth</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-heading font-bold text-left pt-1">
                          <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                            👥 Peer Circle: Active
                          </div>
                          <div className="p-2 rounded-xl bg-surface-container-lowest border border-surface-variant/30">
                            🩺 Therapist: On-Demand
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left Nav Arrow Button */}
            <button
              onClick={handlePrevStep}
              aria-label="Previous step"
              className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-on-surface border border-surface-variant/40 shadow-lg backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
            </button>

            {/* Right Nav Arrow Button */}
            <button
              onClick={handleNextStep}
              aria-label="Next step"
              className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-on-surface border border-surface-variant/40 shadow-lg backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {STEPS_CAROUSEL.map((s, idx) => {
              const isActive = activeStepIdx === idx;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStepIdx(idx)}
                  aria-label={`Go to step ${idx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? "w-8 h-2.5 bg-primary shadow-xs"
                      : "w-2.5 h-2.5 bg-surface-variant/70 hover:bg-primary/40"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* ═══ 3. PRIVACY & CLINICAL ASSURANCE ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-[28px] bg-mint/10 border border-mint/20 space-y-2.5">
            <span className="material-symbols-outlined text-[#006B56] text-2xl">shield_lock</span>
            <h3 className="font-heading font-extrabold text-base text-on-surface">Zero Data Selling</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your conversations, journal entries, and check-in scores remain end-to-end encrypted. We will never sell or monetize your emotional data.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-primary/10 border border-primary/20 space-y-2.5">
            <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
            <h3 className="font-heading font-extrabold text-base text-on-surface">Evidence-Based Principles</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              AI companion prompts and guided tools are structured alongside Cognitive Behavioral Therapy (CBT) and MBSR mindfulness principles.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-peach/15 border border-peach/30 space-y-2.5">
            <span className="material-symbols-outlined text-[#9E5D28] text-2xl">support_agent</span>
            <h3 className="font-heading font-extrabold text-base text-on-surface">AI + Human Complement</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Instant 24/7 AI availability backed by trained human peer listeners and verified licensed therapists whenever you need deeper care.
            </p>
          </div>
        </div>

        {/* ═══ 4. BOTTOM CTA BANNER ═══ */}
        <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
              Ready to Experience Your Retreat?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              Take your first 1-minute check-in and unlock a personalized space tailored to your life stage.
            </p>
            <div className="pt-2">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-bold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
