"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/backend/auth/client";

// ─── Retreat Mood Data ───
const RETREAT_MOODS = [
  {
    label: "Amazing",
    emoji: "😁",
    headline: "That spark matters. Let's help you turn it into something lasting.",
    subNote: "You're in a great place right now — use this moment to reflect, grow, and store up some calm for harder days.",
    cta: "Start Your Free Journey",
    color: "bg-mint/15 border-mint/30 text-[#006B56]",
    ring: "ring-mint/40",
    recommendation: "✨ 3-Min Gratitude Journal • 🎧 Upbeat Ambient Flow",
  },
  {
    label: "Happy",
    emoji: "😊",
    headline: "Love that. Let's help you keep that going.",
    subNote: "A gentle daily check-in helps you understand what fuels these good days — so you can create more of them.",
    cta: "Start Your Free Journey",
    color: "bg-primary/10 border-primary/20 text-primary",
    ring: "ring-primary/30",
    recommendation: "🌿 Energy Anchor • 📝 Positive Reflection Log",
  },
  {
    label: "Calm",
    emoji: "🙂",
    headline: "Stillness is a strength. You're already here.",
    subNote: "This is exactly the kind of grounded energy that Manraah helps you nurture and return to whenever life gets loud.",
    cta: "Start Your Free Journey",
    color: "bg-primary/10 border-primary/20 text-primary",
    ring: "ring-primary/30",
    recommendation: "🫁 4-7-8 Centering Breath • 🌙 Stillness Soundscape",
  },
  {
    label: "Okay",
    emoji: "😐",
    headline: "Neither here nor there — and that's completely valid.",
    subNote: "Some days just feel flat. Manraah is here for the in-between moments just as much as the hard ones.",
    cta: "Start Your Free Journey",
    color: "bg-peach/20 border-peach/30 text-[#9E5D28]",
    ring: "ring-peach/40",
    recommendation: "☕ 2-Minute Reset • 🎧 Gentle Focus Soundscape",
  },
  {
    label: "Low",
    emoji: "😔",
    headline: "You don't have to carry this alone. We're right here.",
    subNote: "Low days are real, and they deserve real care. Let's find a quiet moment together — no pressure, no rush.",
    cta: "Let's Talk About It",
    color: "bg-pink/20 border-pink/30 text-[#874959]",
    ring: "ring-pink/40",
    recommendation: "💬 Connect with a Peer Listener • 🕊️ Gentle Voice Unburden",
  },
  {
    label: "Overwhelmed",
    emoji: "😣",
    headline: "That's exactly what we're here for. Let's find a moment of calm together.",
    subNote: "When everything feels like too much, even a single breath can shift things. We'll start there — just you and us.",
    cta: "Let's Find Calm Together",
    color: "bg-pink/20 border-pink/30 text-[#874959]",
    ring: "ring-pink/40",
    recommendation: "🫁 Emergency Box Breathing • 🛡️ 5-4-3-2-1 Grounding Tool",
  },
];

const TRUST_BADGES = [
  {
    icon: "lock",
    title: "End-to-End Encrypted",
    desc: "100% private data layers",
    bg: "bg-mint/15",
    iconColor: "text-[#006B56]",
    border: "border-mint/30",
  },
  {
    icon: "visibility_off",
    title: "Anonymous & Private",
    desc: "No real name required",
    bg: "bg-primary/10",
    iconColor: "text-primary",
    border: "border-primary/20",
  },
  {
    icon: "psychology",
    title: "Evidence-Based Support",
    desc: "CBT & mindfulness tools",
    bg: "bg-peach/20",
    iconColor: "text-[#9E5D28]",
    border: "border-peach/30",
  },
  {
    icon: "support_agent",
    title: "24/7 Availability",
    desc: "Always here whenever needed",
    bg: "bg-pink/20",
    iconColor: "text-[#874959]",
    border: "border-pink/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 85, damping: 15 },
  },
};

export default function RetreatPage() {
  const router = useRouter();
  const [selectedMoodIdx, setSelectedMoodIdx] = useState<number | null>(null);

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans select-none overflow-x-hidden pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Atmosphere Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[90vw] md:w-[800px] h-[450px] bg-gradient-to-tr from-primary/15 via-pink/10 to-mint/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-peach/20 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-16">
        {/* Breadcrumb / Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Home</span>
          </Link>
          <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20">
            24/7 Empathetic Space
          </span>
        </div>

        {/* ── Main Retreat Card ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative rounded-[32px] sm:rounded-[44px] bg-surface-container-lowest border border-surface-variant/70 shadow-card-lift p-6 sm:p-10 lg:p-14 text-center space-y-10"
        >
          {/* Eyebrow Pill */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>A Retreat for Mind &amp; Soul</span>
          </motion.div>

          {/* ── MOOD CHECK-IN PROMPT ── */}
          <motion.div variants={itemVariants} className="w-full max-w-2xl mx-auto space-y-4">
            <p className="text-base sm:text-lg font-heading font-bold text-on-surface">
              How are you feeling right now?
            </p>

            {/* Mood Emoji Row */}
            <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 flex-wrap">
              {RETREAT_MOODS.map((mood, idx) => {
                const isSelected = selectedMoodIdx === idx;
                return (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMoodIdx(isSelected ? null : idx)}
                    aria-label={mood.label}
                    className={`flex flex-col items-center gap-1.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? `${mood.color} ring-2 ${mood.ring} shadow-md scale-[1.08]`
                        : "bg-surface-container border-surface-variant/40 hover:bg-surface-container-high hover:border-surface-variant/60 hover:scale-[1.04]"
                    }`}
                  >
                    <span className={`text-3xl sm:text-4xl leading-none transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                      {mood.emoji}
                    </span>
                    <span className={`text-xs font-heading font-bold leading-none ${
                      isSelected ? "opacity-100 font-black" : "text-on-surface-variant"
                    }`}>
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── RESPONSIVE HEADLINE — CROSS-FADES ON MOOD SELECTION ── */}
          <motion.div variants={itemVariants} className="w-full max-w-3xl mx-auto space-y-4">
            <AnimatePresence mode="wait">
              {selectedMoodIdx === null ? (
                <motion.h1
                  key="default"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-[1.14] text-on-surface"
                >
                  Your Safe Space to{" "}
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
                    Breathe, Reflect &amp; Feel Heard
                  </span>
                </motion.h1>
              ) : (
                <motion.h1
                  key={`mood-${selectedMoodIdx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-[1.18] text-on-surface"
                >
                  {RETREAT_MOODS[selectedMoodIdx].headline}
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Subheading */}
            <AnimatePresence mode="wait">
              {selectedMoodIdx === null ? (
                <motion.p
                  key="sub-default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-sm sm:text-base leading-relaxed text-on-surface-variant max-w-2xl mx-auto font-normal"
                >
                  Connect with an empathetic AI companion 24/7, talk to verified peer listeners, track your emotional wellness, and access guided care — personalized for your exact stage in life.
                </motion.p>
              ) : (
                <motion.div
                  key={`sub-mood-${selectedMoodIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3"
                >
                  <p className="text-sm sm:text-base leading-relaxed text-on-surface-variant max-w-2xl mx-auto font-normal">
                    {RETREAT_MOODS[selectedMoodIdx].subNote}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container text-xs font-heading font-bold text-primary border border-surface-variant/60">
                    <span>Recommended for you:</span>
                    <span className="text-on-surface">{RETREAT_MOODS[selectedMoodIdx].recommendation}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-2">
            <AnimatePresence mode="wait">
              <motion.button
                key={selectedMoodIdx === null ? "cta-default" : `cta-${selectedMoodIdx}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                onClick={handleGetStarted}
                className="px-9 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>
                  {selectedMoodIdx !== null ? RETREAT_MOODS[selectedMoodIdx].cta : "Start Your Free Journey"}
                </span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </motion.button>
            </AnimatePresence>

            <Link
              href="/how-it-works"
              className="px-8 py-4 rounded-full bg-surface-container border border-surface-variant/40 font-heading font-semibold text-sm text-on-surface text-center hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* ── Social Proof Row ── */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4 pt-4 border-t border-surface-variant/30">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">A</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-mint/30 text-[#006B56] font-bold text-xs flex items-center justify-center">M</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-peach/40 text-[#9E5D28] font-bold text-xs flex items-center justify-center">R</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-pink/30 text-[#A83256] font-bold text-xs flex items-center justify-center">S</div>
            </div>
            <div className="text-xs text-on-surface-variant text-left">
              <p className="font-heading font-bold text-on-surface">14,000+ members finding daily calm</p>
              <p className="text-[11px] text-on-surface-variant/80">⭐️ 4.9/5 Rating • 100% Private &amp; Encrypted</p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Trust Badges Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST_BADGES.map((b, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-[24px] bg-surface-container-lowest border ${b.border} shadow-ambient hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between h-36 text-left`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.bg} ${b.iconColor}`}>
                <span className="material-symbols-outlined text-xl font-bold">{b.icon}</span>
              </div>
              <div>
                <h4 className="text-xs font-heading font-black text-on-surface">{b.title}</h4>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
