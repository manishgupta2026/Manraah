"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import BottomCtaBand from "@/frontend/components/ui/BottomCtaBand";

export default function OurSolutionPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  const previewPillars = [
    {
      icon: "neurology",
      tag: "IN DEVELOPMENT",
      tagColor: "bg-primary/10 text-primary border-primary/20",
      title: "Predictive Emotion Telemetry",
      description:
        "Passive biomarker analysis and check-in trajectory modeling that identifies burnout and emotional exhaustion before crisis points emerge.",
    },
    {
      icon: "hub",
      tag: "COMING Q4 2026",
      tagColor: "bg-[#006B56]/15 text-[#006B56] border-[#006B56]/20",
      title: "Continuous Care Continuum",
      description:
        "Seamless algorithmic triaging connecting daily conversational AI companions, peer listener circles, and accredited licensed clinical therapists.",
    },
    {
      icon: "psychology_alt",
      tag: "IN DEVELOPMENT",
      tagColor: "bg-pink/30 text-[#874959] border-pink/40",
      title: "Adaptive Cognitive Stacks",
      description:
        "Dynamically adjusting CBT, DBT, and mindfulness micro-exercises automatically tailored to your exact life stage and real-time stress load.",
    },
    {
      icon: "shield_with_heart",
      tag: "COMING Q4 2026",
      tagColor: "bg-[#9E5D28]/15 text-[#9E5D28] border-[#9E5D28]/30",
      title: "Zero-Knowledge Privacy Vault",
      description:
        "Hardware-grade client-side encryption ensuring your personal emotional reflections, journal entries, and teletherapy notes remain strictly confidential.",
    },
  ];

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* ═══ 1. HERO COMING SOON BANNER ═══ */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 px-6 max-w-5xl mx-auto text-center space-y-8">
        {/* Atmosphere Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-mint/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span>IN ACTIVE DEVELOPMENT &bull; COMING SOON</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Our Unified Mental <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
            Wellness Solution
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed font-normal">
          We are engineering an end-to-end mental wellness suite that bridges continuous AI emotional telemetry, licensed clinical intervention, and verified peer support into one continuous healing ecosystem.
        </p>

        {/* Early Access Waitlist Box */}
        <div className="max-w-md mx-auto pt-2">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-2xl bg-mint/15 border border-mint/30 text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-mint text-white flex items-center justify-center mx-auto text-xl">
                <span className="material-symbols-outlined text-lg">check</span>
              </div>
              <h4 className="font-heading font-bold text-sm text-[#006B56]">
                You&apos;re on the Priority Waitlist!
              </h4>
              <p className="text-xs text-[#006B56]/80 font-normal">
                We will notify you the moment Our Solution goes live for early alpha testing.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2 bg-surface-container-lowest border border-surface-variant/40 rounded-full p-1.5 shadow-sm focus-within:border-primary/40 transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access..."
                  required
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/50"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Notify Me
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant/70 font-normal">
                🔒 Strictly private. Zero spam. You can unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ═══ 2. SNEAK PEEK ARCHITECTURE ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-16">
        <div className="rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift p-8 sm:p-12 space-y-10">
          <div className="text-left space-y-3 max-w-2xl">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              Architecture Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface">
              What We Are Building
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Existing mental wellness apps leave you with fragmented tools: a meditation timer here, an appointment calendar there. Our unified solution integrates everything into one coherent platform:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previewPillars.map((item, idx) => (
              <div
                key={idx}
                className="p-7 sm:p-8 rounded-[24px] bg-surface-container-low/60 border border-surface-variant/30 flex flex-col justify-between space-y-4 text-left hover:border-primary/30 transition-all cursor-default"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest text-primary shadow-xs flex items-center justify-center border border-primary/10">
                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-heading font-extrabold border ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-lg sm:text-xl text-on-surface">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3. TIMELINE OVERVIEW ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-16">
        <div className="p-8 sm:p-10 rounded-[28px] bg-[#F2EBFF]/40 border border-surface-variant/30 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-heading font-extrabold text-xl text-on-surface">
              Alpha Release Projected for Late 2026
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We are currently running controlled clinical efficacy testing with our research partners to ensure all automated companion models comply with highest psychological safety guidelines.
            </p>
          </div>
          <Link
            href="/features"
            className="px-6 py-3 rounded-full bg-surface-container-lowest border border-surface-variant/40 hover:border-primary/40 font-heading font-bold text-xs text-primary shadow-xs hover:shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <span>Explore Current Features</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ═══ 4. BOTTOM CTA BANNER ═══ */}
      <BottomCtaBand
        title="Experience Manraah Today"
        description="While our full enterprise solution is underway, start your everyday healing with life-stage pathways, CBT tools, and daily check-ins."
        buttonText="Explore How It Works"
        buttonHref="/how-it-works"
      />
    </div>
  );
}
