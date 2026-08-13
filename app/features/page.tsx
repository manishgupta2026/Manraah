"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "@/backend/auth/client";

const FEATURES_DATA = [
  {
    id: "ai",
    label: "AI Companion",
    icon: "smart_toy",
    panelBg: "bg-[#F2EBFF]",
    panelBorder: "border-primary/20",
    badge: "24/7 AI Guidance",
    headline: "Support, any time you need to talk",
    description: "Unpack your thoughts with a 24/7 empathetic assistant trained in active listening, cognitive reflection, and compassionate guidance. Receive immediate, non-judgmental support whenever your mind feels overwhelmed.",
    points: [
      "24/7 immediate availability without waiting rooms",
      "Grounded in Cognitive Behavioral Therapy (CBT) reflection prompts",
      "Adapts conversation style and vocabulary to your life stage",
      "Complete end-to-end encryption across every conversation",
    ],
  },
  {
    id: "human",
    label: "Human Companion",
    icon: "record_voice_over",
    panelBg: "bg-[#FFF4E8]",
    panelBorder: "border-peach/40",
    badge: "Human Companion",
    headline: "Genuine empathy from real peer listeners",
    description: "Connect with compassionate, trained peer companions who understand your exact life stage. Share your feelings in a safe space built on warmth, mutual respect, and shared lived experience.",
    points: [
      "Matched with listeners who share your life category",
      "100% anonymous — no real identity or camera required",
      "Continuous listener moderation and community standards",
      "Gentle space to vent, process, and feel heard",
    ],
  },
  {
    id: "pro",
    label: "Professional Care",
    icon: "medical_services",
    panelBg: "bg-[#FFF0F3]",
    panelBorder: "border-tertiary/20",
    badge: "Clinical Expertise",
    headline: "Clinical expertise when you need deeper care",
    description: "Book 1-on-1 sessions with verified, licensed therapists and counselors. Get dedicated professional guidance tailored to anxiety, burnout, life transitions, and relationship health.",
    points: [
      "Vetted, certified therapists with verified credentials",
      "Flexible video, voice, or text therapy sessions",
      "Targeted focus on anxiety, depression, burnout, and family dynamics",
      "Seamless integration with your daily in-app wellness score",
    ],
  },
  {
    id: "mood",
    label: "Mood Tracking",
    icon: "mood",
    panelBg: "bg-[#FFF0F5]",
    panelBorder: "border-pink/30",
    badge: "Self Awareness",
    headline: "Track your emotional rhythm over time",
    description: "Log daily feelings in seconds, identify emotional triggers, and watch your mental resilience grow. Gain clear visual insights into how sleep, work, and routines impact your mood.",
    points: [
      "1-tap daily check-in with intuitive emoji expressions",
      "Visual rhythm charts and weekly emotional summaries",
      "Early detection of stress spikes and burnout patterns",
      "Calculates your real-time Retreat Wellness Score",
    ],
  },
  {
    id: "journal",
    label: "Reflective Journal",
    icon: "auto_stories",
    panelBg: "bg-[#FFFBEA]",
    panelBorder: "border-pale-yellow/60",
    badge: "Daily Reflection",
    headline: "Private, guided space for your thoughts",
    description: "Release daily mental clutter with gentle AI prompts and voice-to-text notes. Your journal entries are 100% private, encrypted, and designed to help you process emotions effortlessly.",
    points: [
      "AI-suggested prompts tailored to your current mood",
      "Hands-free voice-to-text audio reflections",
      "Zero ad-tracking or data monetization guarantee",
      "Searchable journal archive for tracking personal growth",
    ],
  },
  {
    id: "meditation",
    label: "Meditation & Sleep",
    icon: "self_improvement",
    panelBg: "bg-[#E8FAF4]",
    panelBorder: "border-mint/30",
    badge: "Calm & Rest",
    headline: "Calm your nervous system in minutes",
    description: "Immerse yourself in guided breathwork, soothing bedtime soundscapes, and body-scan relaxation sessions. Lower stress levels and improve sleep quality with ad-free audio.",
    points: [
      "2-minute quick breathing resets for sudden stress",
      "High-fidelity ambient bedtime audio & white noise",
      "Progressive muscle relaxation and body-scan sessions",
      "Downloadable for offline mindfulness sessions",
    ],
  },
  {
    id: "community",
    label: "Community Circles",
    icon: "groups",
    panelBg: "bg-[#F5F2FF]",
    panelBorder: "border-primary/20",
    badge: "Safe Circles",
    headline: "Safe, anonymous circles where you belong",
    description: "Join moderated peer support spaces organized by life stage. Share reflections, exchange encouragement, and connect with people who truly understand what you're going through.",
    points: [
      "Segmented by category (Students, Parents, Working Pros, etc.)",
      "Strict zero-tolerance moderation against toxicity",
      "Anonymous handles and avatar-based profiles",
      "Daily community reflection questions and encouragement prompts",
    ],
  },
  {
    id: "resources",
    label: "Expert Toolkits",
    icon: "menu_book",
    panelBg: "bg-[#EBFBF7]",
    panelBorder: "border-secondary/20",
    badge: "Expert Toolkits",
    headline: "Bite-sized toolkits for mental wellness",
    description: "Explore expert-crafted guides, anxiety relief toolkits, and practical self-care articles. Grounded in clinical psychology to give you actionable strategies for everyday challenges.",
    points: [
      "5-4-3-2-1 grounding exercises for panic de-escalation",
      "Burnout recovery frameworks for high-pressure careers",
      "Parenting patience toolkits and relationship connection guides",
      "Written and vetted by practicing clinical psychologists",
    ],
  },
];

export default function FeaturesPage() {
  const router = useRouter();
  const [selectedPillar, setSelectedPillar] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const pillTabsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view smoothly
  useEffect(() => {
    if (pillTabsRef.current) {
      const activePill = pillTabsRef.current.children[selectedPillar] as HTMLElement;
      if (activePill) {
        activePill.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedPillar]);

  const handleNextFeature = () => {
    setSelectedPillar((prev) => (prev + 1) % FEATURES_DATA.length);
  };

  const handlePrevFeature = () => {
    setSelectedPillar((prev) => (prev - 1 + FEATURES_DATA.length) % FEATURES_DATA.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (diffX > 40) {
      handleNextFeature();
    } else if (diffX < -40) {
      handlePrevFeature();
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

  const currentFeature = FEATURES_DATA[selectedPillar];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 md:py-20 px-4 sm:px-6 lg:px-12 select-none overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">

        {/* ═══ 1. HEADER HERO ═══ */}
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          <span className="px-4 py-1.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest inline-block">
            Comprehensive Care Platform
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-tight">
            Integrated Features for Real Wellbeing
          </h1>
          <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed">
            From 24/7 AI companion support to licensed therapist sessions, mood rhythm tracking, and private peer circles — everything you need in one compassionate space.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Your Retreat Free</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* ═══ 2. INTERACTIVE FEATURE CAROUSEL SHOWCASE ═══ */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="space-y-8"
        >
          {/* Horizontal Scrollable Pill Tabs */}
          <div
            ref={pillTabsRef}
            className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full justify-start md:justify-center"
          >
            {FEATURES_DATA.map((feat, idx) => {
              const isActive = selectedPillar === idx;
              return (
                <button
                  key={feat.id}
                  onClick={() => setSelectedPillar(idx)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs font-heading font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-on-surface text-white shadow-md scale-[1.03]"
                      : "bg-surface-container-lowest border border-surface-variant/40 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{feat.icon}</span>
                  <span>{feat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Slide Carousel Panel with Rich Mockups */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={`p-6 sm:p-10 md:p-12 rounded-[36px] border ${currentFeature.panelBg} ${currentFeature.panelBorder} shadow-card-lift grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`}
              >
                {/* Left Column: Feature Details & Highlights */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-surface-container-lowest text-on-surface border border-surface-variant/40 uppercase tracking-widest inline-block shadow-xs">
                    {currentFeature.badge}
                  </span>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-on-surface tracking-tight leading-tight">
                    {currentFeature.headline}
                  </h2>

                  <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-normal">
                    {currentFeature.description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {currentFeature.points.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-on-surface">
                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          ✓
                        </span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex items-center gap-3">
                    <button
                      onClick={handleGetStarted}
                      className="px-7 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Try {currentFeature.label}</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>

                    <span className="text-xs text-on-surface-variant/70 font-semibold">
                      Feature {selectedPillar + 1} of {FEATURES_DATA.length}
                    </span>
                  </div>
                </div>

                {/* Right Column: Custom Live Mockup per Feature */}
                <div className="lg:col-span-5 flex justify-center">
                  {currentFeature.id === "ai" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold shrink-0">
                            <span className="material-symbols-outlined text-lg">smart_toy</span>
                          </div>
                          <div>
                            <h4 className="font-heading font-extrabold text-xs sm:text-sm text-on-surface">Your AI Companion</h4>
                            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1"><span>●</span> Active 24/7</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-heading font-bold bg-primary/10 text-primary shrink-0">Active Listener</span>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-end">
                          <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-xs bg-primary text-white font-medium shadow-xs leading-relaxed">
                            I get so stressed before deadlines. It feels like my mind won&apos;t quiet down.
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[85%] p-3 rounded-2xl rounded-tl-xs bg-surface-container-low border border-surface-variant/30 text-on-surface font-medium leading-relaxed">
                            I hear you. Let&apos;s take a slow deep breath together right now and break down tonight into gentle steps.
                          </div>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-mint/15 border border-mint/30 flex items-center justify-between text-[11px] text-[#006B56] font-bold">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">air</span>
                          <span>2-Min Breathing Reset</span>
                        </div>
                        <span className="material-symbols-outlined text-base">play_circle</span>
                      </div>
                    </div>
                  )}

                  {currentFeature.id === "human" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-peach/40 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-peach/40 text-[#9E5D28] font-bold flex items-center justify-center text-sm shrink-0">
                            M
                          </div>
                          <div>
                            <h4 className="font-heading font-extrabold text-sm text-on-surface">Maya K.</h4>
                            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1"><span>●</span> Certified Peer Listener</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-peach/25 text-[#9E5D28] shrink-0">
                          ⭐️ 4.9 (120+ Sessions)
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#FFF9F2] border border-peach/30 text-xs text-on-surface leading-relaxed font-medium">
                        &quot;I&apos;ve been in that exact spot during my junior year. You&apos;re doing better than you think. Take it one day at a time.&quot;
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
                        <span className="text-on-surface-variant/70 text-[11px]">100% Anonymous & Private</span>
                        <button onClick={handleGetStarted} className="px-4 py-2 rounded-full bg-[#9E5D28] text-white font-heading font-bold text-xs shadow-xs shrink-0 cursor-pointer">
                          Start Chat Session
                        </button>
                      </div>
                    </div>
                  )}

                  {currentFeature.id === "pro" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-tertiary/20 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink/30 text-[#874959] font-bold flex items-center justify-center text-sm shrink-0">
                            Dr
                          </div>
                          <div>
                            <h4 className="font-heading font-extrabold text-sm text-on-surface">Dr. Elena Rostova</h4>
                            <p className="text-[10px] text-on-surface-variant font-semibold">Licensed Clinical Psychologist</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-pink/20 text-[#874959] shrink-0">
                          Verified
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-center font-bold text-on-surface">
                          📅 Next: Today 4:00 PM
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-center font-bold text-[#006B56]">
                          🔒 Encrypted Video
                        </div>
                      </div>
                      <button onClick={handleGetStarted} className="w-full py-2.5 rounded-full bg-[#874959] text-white font-heading font-bold text-xs shadow-xs cursor-pointer">
                        Schedule 1-on-1 Session
                      </button>
                    </div>
                  )}

                  {currentFeature.id === "mood" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-pink/30 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <h4 className="font-heading font-extrabold text-sm text-on-surface">Weekly Mood Rhythm</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-heading font-bold bg-mint/20 text-[#006B56]">
                          7-Day Streak
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-1.5 h-24 pt-4 px-2">
                        {[
                          { day: "M", h: "40%", emoji: "😐" },
                          { day: "T", h: "60%", emoji: "🙂" },
                          { day: "W", h: "35%", emoji: "😔" },
                          { day: "T", h: "75%", emoji: "😊" },
                          { day: "F", h: "85%", emoji: "😁" },
                          { day: "S", h: "90%", emoji: "😁" },
                          { day: "S", h: "80%", emoji: "😊" },
                        ].map((bar, bIdx) => (
                          <div key={bIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            <span className="text-xs">{bar.emoji}</span>
                            <div
                              className="w-full rounded-t-lg bg-gradient-to-t from-primary/40 to-primary transition-all duration-300"
                              style={{ height: bar.h }}
                            />
                            <span className="text-[9px] font-bold text-on-surface-variant">{bar.day}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-center text-on-surface-variant font-medium">
                        🌿 4 calm or joyful days recorded this week
                      </p>
                    </div>
                  )}

                  {currentFeature.id === "journal" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-pale-yellow shadow-xl space-y-3.5 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#9E5D28] text-lg">auto_stories</span>
                          <h4 className="font-heading font-extrabold text-xs sm:text-sm text-on-surface">Evening Reflection</h4>
                        </div>
                        <span className="text-[10px] text-on-surface-variant/60">Today, 8:45 PM</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-[#FFFDF5] border border-pale-yellow/60 space-y-1.5">
                        <p className="text-[10px] font-heading font-bold text-[#9E5D28]">Prompt of the day:</p>
                        <p className="text-xs text-on-surface italic font-normal">
                          &quot;What is one small thing that brought peace to your morning?&quot;
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs text-on-surface-variant font-normal leading-relaxed">
                        Taking a quiet 10-minute walk before opening my laptop helped me feel grounded...
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-emerald-600 font-bold">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">lock</span> Encrypted & Private
                        </span>
                        <span className="text-primary font-heading cursor-pointer">View Past Entries →</span>
                      </div>
                    </div>
                  )}

                  {currentFeature.id === "meditation" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-mint/30 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#006B56] text-xl">self_improvement</span>
                          <h4 className="font-heading font-extrabold text-sm text-on-surface">Bedtime Soundscape</h4>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-heading font-bold bg-mint/20 text-[#006B56]">
                          Calm Sleep
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#F0FAF7] border border-mint/30 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#006B56] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                          🌧️
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-bold text-xs text-on-surface">Gentle Rain &amp; Distance</p>
                          <p className="text-[10px] text-on-surface-variant">12-Minute Guided Relaxation</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-[#006B56] w-[45%] rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                          <span>03:40</span>
                          <span>08:00</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-6 pt-1">
                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer text-xl">replay_10</span>
                        <div className="w-11 h-11 rounded-full bg-[#006B56] text-white flex items-center justify-center shadow-md cursor-pointer">
                          <span className="material-symbols-outlined text-2xl">pause</span>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer text-xl">forward_10</span>
                      </div>
                    </div>
                  )}

                  {currentFeature.id === "community" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-primary/20 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl font-bold">groups</span>
                          <h4 className="font-heading font-extrabold text-sm text-on-surface">Student Lounge Circle</h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-primary/10 text-primary">
                          Moderated
                        </span>
                      </div>
                      <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-heading font-bold text-primary">Anonymous GentleBloom</span>
                          <span className="text-on-surface-variant/60">15m ago</span>
                        </div>
                        <p className="text-xs text-on-surface leading-relaxed">
                          &quot;Finally set clear boundaries with my study group this week and took an evening off. Feeling so much lighter!&quot;
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant font-bold pt-1">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-primary">💜 24 Replies</span>
                          <span className="flex items-center gap-1 text-[#006B56]">✨ 18 Encouragements</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentFeature.id === "resources" && (
                    <div className="w-full max-w-sm p-5 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-secondary/20 shadow-xl space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-mint/20 text-[#006B56]">
                          Anxiety Relief Toolkit
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span> 3 Min Read
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-on-surface">
                        5-Step Grounding Exercise for Sudden Panic
                      </h4>
                      <div className="space-y-1.5 text-xs text-on-surface-variant">
                        <div className="p-2 rounded-xl bg-surface-container-low flex items-center gap-2 font-medium">
                          <span className="w-5 h-5 rounded-full bg-mint/30 text-[#006B56] font-bold text-[10px] flex items-center justify-center">1</span>
                          <span>Name 5 things you can see around you</span>
                        </div>
                        <div className="p-2 rounded-xl bg-surface-container-low flex items-center gap-2 font-medium">
                          <span className="w-5 h-5 rounded-full bg-mint/30 text-[#006B56] font-bold text-[10px] flex items-center justify-center">2</span>
                          <span>Touch 4 physical textures nearby</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-[#006B56] pt-1">
                        <span>Reviewed by Clinical Psychologist</span>
                        <span className="material-symbols-outlined text-base">bookmark</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Left Nav Arrow Button */}
            <button
              onClick={handlePrevFeature}
              aria-label="Previous feature"
              className="absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-on-surface border border-surface-variant/40 shadow-lg backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
            </button>

            {/* Right Nav Arrow Button */}
            <button
              onClick={handleNextFeature}
              aria-label="Next feature"
              className="absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-on-surface border border-surface-variant/40 shadow-lg backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {FEATURES_DATA.map((feat, idx) => {
              const isActive = selectedPillar === idx;
              return (
                <button
                  key={feat.id}
                  onClick={() => setSelectedPillar(idx)}
                  aria-label={`Go to feature ${idx + 1}`}
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

        {/* ═══ 3. ALL 8 CORE PILLARS GRID ═══ */}
        <div className="space-y-8 text-left">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
              Explore All 8 Pillars
            </h2>
            <p className="text-sm text-on-surface-variant">
              Tap any pillar to immediately preview its tools and features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES_DATA.map((f, fIdx) => (
              <div
                key={f.id}
                onClick={() => setSelectedPillar(fIdx)}
                className={`p-6 rounded-[28px] border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                  selectedPillar === fIdx
                    ? "bg-surface-container-lowest border-primary shadow-card-lift scale-[1.02]"
                    : "bg-surface-container-lowest border-surface-variant/30 shadow-ambient hover:shadow-card-lift hover:border-primary/40"
                }`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-xl">{f.icon}</span>
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-on-surface">{f.label}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    {f.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1 text-xs font-heading font-bold text-primary">
                  <span>{selectedPillar === fIdx ? "Currently Viewing" : "Explore Feature"}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 4. BOTTOM CTA BANNER ═══ */}
        <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">
              Begin With All Features Free
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              Unlock mood tracking, daily reflections, audio meditations, and your empathetic AI companion today.
            </p>
            <div className="pt-2">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-bold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Create Your Retreat</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
