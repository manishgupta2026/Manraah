"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "@/backend/auth/client";
import { USER_CATEGORIES } from "@/frontend/lib/constants";

interface PathwayDetail {
  id: string;
  name: string;
  badge: string;
  badgeStyle: string;
  icon: string;
  emoji: string;
  image: string;
  tagline: string;
  description: string;
  stressors: string[];
  aiTone: string;
  recommendedTools: { title: string; desc: string; icon: string }[];
  accentColor: string;
}

const PATHWAYS: PathwayDetail[] = [
  {
    id: "student",
    name: "Students & Academics",
    badge: "🎓 Academic Focus",
    badgeStyle: "bg-mint/20 text-[#006B56] border border-mint/30",
    icon: "school",
    emoji: "🎓",
    image: "/category/student.png",
    tagline: "Manage academic stress, exam anxiety, focus, and emotional balance.",
    description: "Designed for high school, university, and post-grad students navigating exam pressure, deadline anxiety, career uncertainty, and social balance.",
    stressors: [
      "Exam & assignment deadline anxiety",
      "Imposter syndrome & academic comparison",
      "Sleep disruption from late-night studying",
      "Post-graduation career uncertainty",
    ],
    aiTone: "Encouraging, grounded, academic-empathetic tone focused on stress de-escalation and study-rest boundaries.",
    recommendedTools: [
      { title: "Exam Reset Soundscapes", desc: "15-minute binaural focus audio for calm studying", icon: "headphones" },
      { title: "Imposter Syndrome Journal Prompts", desc: "Structured CBT exercises for self-doubt", icon: "edit_note" },
      { title: "Peer Study Circles", desc: "Anonymous student community spaces", icon: "groups" },
    ],
    accentColor: "from-[#006B56] to-mint",
  },
  {
    id: "working_professional",
    name: "Working Professionals",
    badge: "💼 Career & Balance",
    badgeStyle: "bg-primary/15 text-primary border border-primary/20",
    icon: "work",
    emoji: "💼",
    image: "/category/Working.png",
    tagline: "Navigate workplace pressure, career balance, and burnout prevention.",
    description: "Tailored for corporate employees, creative freelancers, and team leaders managing workload stress, meeting fatigue, and work-life boundaries.",
    stressors: [
      "Burnout & constant screen fatigue",
      "Workplace communication & boundary friction",
      "Inability to disconnect after work hours",
      "Performance pressure & career stagnation anxiety",
    ],
    aiTone: "Calming, professional, anti-burnout voice designed to help you leave work at work and transition into evening rest.",
    recommendedTools: [
      { title: "Leave Work at Work Ritual", desc: "2-minute evening mental transition exercise", icon: "bedtime" },
      { title: "Midday Micro-Breathing", desc: "3-minute nerve reset between meetings", icon: "air" },
      { title: "Workplace Burnout Telemetry", desc: "Weekly balance and serenity analytics", icon: "analytics" },
    ],
    accentColor: "from-primary to-primary-purple",
  },
  {
    id: "parent",
    name: "Parents & Families",
    badge: "🍼 Family Care",
    badgeStyle: "bg-peach/30 text-[#9E5D28] border border-peach/40",
    icon: "family_history",
    emoji: "🍼",
    image: "/category/family.png",
    tagline: "Decompress parenting stress, family balance, and personal renewal.",
    description: "Built for mothers, fathers, and caregivers managing daily household demands, parental guilt, child development worries, and personal time scarcity.",
    stressors: [
      "Parental guilt & feeling chronically overwhelmed",
      "Patience depletion during daily household chaos",
      "Loss of personal identity outside parenting",
      "Sleep deficit & fatigue accumulation",
    ],
    aiTone: "Warm, compassionate, non-judgmental parental support offering gentle patience prompts and guilt-free reflection.",
    recommendedTools: [
      { title: "Parental Reset Prompts", desc: "Quick grounding exercises for chaotic moments", icon: "nature_people" },
      { title: "Nightly Reflection Journal", desc: "Guided prompts celebrating daily small wins", icon: "auto_stories" },
      { title: "Parents Support Circle", desc: "Share anonymously with fellow caregivers", icon: "diversity_3" },
    ],
    accentColor: "from-[#9E5D28] to-peach",
  },
  {
    id: "couple",
    name: "Couples & Relationships",
    badge: "💖 Harmony Journey",
    badgeStyle: "bg-pink/30 text-[#874959] border border-pink/40",
    icon: "favorite",
    emoji: "💖",
    image: "/category/couple.png",
    tagline: "Nurture relationship harmony, emotional intimacy, and communication.",
    description: "Designed for partners seeking deeper emotional connection, constructive communication prompts, and shared relationship reflection.",
    stressors: [
      "Communication breakdowns & repeated friction",
      "Busy schedules creating emotional distance",
      "Navigating shared life transitions & finances",
      "Rebuilding mutual intimacy & appreciation",
    ],
    aiTone: "Empathetic, relationship-conscious tone highlighting active listening, vulnerability, and mutual appreciation.",
    recommendedTools: [
      { title: "Couples Harmony Check-in", desc: "5-minute weekly relationship reflection tool", icon: "volunteer_activism" },
      { title: "Gratitude & Appreciation Prompts", desc: "Daily mutual affirmation exercises", icon: "favorite_border" },
      { title: "De-escalation Communication Guide", desc: "Frameworks for constructive dialogue", icon: "forum" },
    ],
    accentColor: "from-[#874959] to-pink",
  },
  {
    id: "other",
    name: "Other Pathways",
    badge: "✨ Unique Path",
    badgeStyle: "bg-[#7C6BC4]/15 text-[#5F4EA5] border border-[#7C6BC4]/30",
    icon: "explore",
    emoji: "✨",
    image: "/category/other.png",
    tagline: "Personalized mindfulness and gentle support tailored to your unique journey.",
    description: "Calibrated for individuals navigating unique personal transitions, identity shifts, or seeking custom holistic wellness support.",
    stressors: [
      "Uncertainty & personal life transitions",
      "Isolation & finding grounded identity",
      "Loss of familiar routines and life shifts",
      "Seeking flexible, self-paced mindfulness",
    ],
    aiTone: "Reassuring, flexible, growth-oriented companion providing daily grounding routines for any life scenario.",
    recommendedTools: [
      { title: "Grounding Anchor Exercises", desc: "5-minute daily stability prompts", icon: "anchor" },
      { title: "Encrypted Voice Journaling", desc: "Express unspoken thoughts safely", icon: "mic" },
      { title: "Custom Reflection Prompts", desc: "Tailored to your daily check-in responses", icon: "auto_awesome" },
    ],
    accentColor: "from-[#5F4EA5] to-[#7C6BC4]",
  },
];

export default function ForYouPage() {
  const router = useRouter();
  const [activePathwayId, setActivePathwayId] = useState<string>("student");

  const activePathway = PATHWAYS.find((p) => p.id === activePathwayId) || PATHWAYS[0];

  const handleGetStarted = async (category: string) => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push(`/category-selection?selected=${category}`);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none">
      {/* ═══ 1. HERO HEADER ═══ */}
      <section className="relative pt-12 pb-14 md:pt-16 md:pb-18 px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Atmosphere Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-peach/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Tailored Pathways &bull; Life Stage Personalization</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Designed For{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
            Your Life Stage
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          Mental wellness isn&apos;t one-size-fits-all. Manraah customizes AI interaction tones, reflection prompts, dashboard widgets, and community circles for your exact current life stage.
        </p>
      </section>

      {/* ═══ 2. INTERACTIVE PATHWAY SELECTOR CHIPS ═══ */}
      <section className="px-6 max-w-5xl mx-auto pb-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {PATHWAYS.map((p) => {
            const isActive = activePathwayId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePathwayId(p.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-variant/40"
                }`}
              >
                <span className="text-base">{p.emoji}</span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ 3. ACTIVE PATHWAY DETAILED SHOWCASE ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePathway.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift p-8 sm:p-12 space-y-10"
          >
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-surface-variant/20">
              <div className="space-y-3 max-w-2xl">
                <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold ${activePathway.badgeStyle}`}>
                  {activePathway.badge}
                </span>
                <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface">
                  {activePathway.name}
                </h2>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  {activePathway.description}
                </p>
              </div>

              <button
                onClick={() => handleGetStarted(activePathway.id)}
                className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-center"
              >
                <span>Start This Pathway</span>
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            {/* Grid breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Stressors & AI Tone */}
              <div className="space-y-6">
                <div className="p-6 rounded-[24px] bg-surface-container-low/60 border border-surface-variant/30 space-y-4">
                  <div className="flex items-center gap-2.5 text-on-surface">
                    <span className="material-symbols-outlined text-primary text-xl">psychology_alt</span>
                    <h3 className="font-heading font-extrabold text-base">Targeted Stressors Resolved</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {activePathway.stressors.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-on-surface-variant font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">graphic_eq</span>
                    <span>AI Companion Persona Calibration</span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface font-medium leading-relaxed">
                    {activePathway.aiTone}
                  </p>
                </div>
              </div>

              {/* Right Column: Recommended Tools */}
              <div className="space-y-4">
                <h3 className="font-heading font-extrabold text-lg text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-mint text-xl">auto_awesome</span>
                  <span>Featured Daily Tools for {activePathway.name}</span>
                </h3>

                <div className="space-y-3">
                  {activePathway.recommendedTools.map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-[20px] bg-surface-container-lowest border border-surface-variant/40 shadow-xs flex items-center gap-4 hover:border-primary/30 transition-all"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">{tool.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-sm text-on-surface">
                          {tool.title}
                        </h4>
                        <p className="text-xs text-on-surface-variant font-normal">
                          {tool.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ═══ 4. ALL 5 PATHWAYS IMAGE GRID SUMMARY ═══ */}
      <section className="py-16 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
              Comprehensive Coverage
            </p>
            <h2 className="text-3xl font-heading font-extrabold text-on-surface">
              Explore All 5 Life Stage Pathways
            </h2>
            <p className="text-sm text-on-surface-variant">
              You can easily switch or update your primary life pathway anytime from your account settings.
            </p>
          </div>

          {/* 5-Category Image Cards matching MarketingLandingPage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PATHWAYS.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setActivePathwayId(p.id);
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="h-[340px] rounded-[32px] p-7 relative overflow-hidden flex flex-col justify-between shadow-card-lift hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-white/20"
              >
                {/* Full-Bleed Background Image */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700 pointer-events-none z-0"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none z-10" />

                {/* Header: Emoji Badge + Category Badge */}
                <div className="flex items-start justify-between relative z-20">
                  <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                    {p.emoji}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-heading font-extrabold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                    {p.badge}
                  </span>
                </div>

                {/* Bottom Card Content */}
                <div className="relative z-20 space-y-2 text-left">
                  <h3 className="font-heading font-black text-xl text-white tracking-tight flex items-center justify-between">
                    <span>{p.name}</span>
                    <span className="material-symbols-outlined text-lg text-white/90 group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed font-normal">
                    {p.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 5. BOTTOM CTA BANNER ═══ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-7 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Find Stillness Calibrated For You
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed font-normal">
            Select your category and experience daily mood check-ins, CBT prompts, and soundscapes built specifically for your life stage.
          </p>

          <div className="pt-2">
            <button
              onClick={() => handleGetStarted("student")}
              className="px-9 py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-extrabold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Choose Your Category &amp; Begin</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
