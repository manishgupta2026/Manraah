"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "@/backend/auth/client";

interface Story {
  id: string;
  category: "student" | "working_pro" | "parent" | "couple" | "transition";
  role: string;
  categoryLabel: string;
  badgeStyle: string;
  initial: string;
  avatarBg: string;
  location: string;
  timeWithManraah: string;
  quote: string;
  reflection: string;
  favoriteTool: string;
  highlightStory?: string;
}

const ALL_STORIES: Story[] = [
  {
    id: "student-1",
    category: "student",
    role: "A Graduate Researcher",
    categoryLabel: "Student & Academics",
    badgeStyle: "bg-primary/10 text-primary border border-primary/20",
    initial: "R",
    avatarBg: "bg-primary/20 text-primary",
    location: "Bengaluru",
    timeWithManraah: "6 months",
    quote: "When thesis deadlines piled up, the quick 2-minute breathing exercises helped break the cycle of panic so I could focus on one task at a time.",
    reflection: "🫁 Grounded focus during high-pressure weeks",
    favoriteTool: "2-Min Grounding Breathing",
    highlightStory: "I used to experience severe heart palpitations whenever my advisor scheduled review meetings. Having the 2-minute physiological sigh tool in my pocket helped me interrupt panic attacks before they escalated.",
  },
  {
    id: "working-pro-1",
    category: "working_pro",
    role: "A Working Professional",
    categoryLabel: "Career & Balance",
    badgeStyle: "bg-mint/20 text-[#006B56] border border-mint/30",
    initial: "W",
    avatarBg: "bg-mint/30 text-[#006B56]",
    location: "Mumbai",
    timeWithManraah: "8 months",
    quote: "Long hours and back-to-back meetings had me feeling on the verge of burnout. Checking in with my daily emotional rhythm helped me recognize when to step back and set healthy boundaries.",
    reflection: "📈 Building sustainable daily boundaries",
    favoriteTool: "Daily Mood Tracking & Check-ins",
    highlightStory: "Tracking my energy levels over a 3-week sprint revealed that Thursday afternoon meetings were consistently draining me. I used that insight to block out focus hours and communicate boundaries.",
  },
  {
    id: "couple-1",
    category: "couple",
    role: "A Couple using Manraah",
    categoryLabel: "Couples & Harmony",
    badgeStyle: "bg-pink/20 text-[#A83256] border border-pink/30",
    initial: "C",
    avatarBg: "bg-pink/30 text-[#A83256]",
    location: "Delhi NCR",
    timeWithManraah: "4 months",
    quote: "The guided reflection prompts helped us slow down difficult conversations around work stress and finances. It gave us a gentle structure to truly hear each other again.",
    reflection: "💑 Fostering open, peaceful dialogue",
    favoriteTool: "Reflective Communication Prompts",
    highlightStory: "Instead of arguing when we were both exhausted after work, we started using the weekly shared reflection prompt. It turned tense moments into constructive, gentle check-ins.",
  },
  {
    id: "student-2",
    category: "student",
    role: "An Undergraduate Student",
    categoryLabel: "Student & Academics",
    badgeStyle: "bg-primary/10 text-primary border border-primary/20",
    initial: "S",
    avatarBg: "bg-primary/20 text-primary",
    location: "Pune",
    timeWithManraah: "5 months",
    quote: "Exam periods used to trigger overwhelming late-night anxiety. Having Manraah's companion to talk through racing thoughts without feeling judged has given me a calm, steady space to regroup.",
    reflection: "✨ Finding calm through academic stress",
    favoriteTool: "24/7 Empathetic AI Companion",
  },
  {
    id: "parent-1",
    category: "parent",
    role: "A Working Parent",
    categoryLabel: "Parents & Family",
    badgeStyle: "bg-peach/30 text-[#9E5D28] border border-peach/40",
    initial: "P",
    avatarBg: "bg-peach/40 text-[#9E5D28]",
    location: "Hyderabad",
    timeWithManraah: "7 months",
    quote: "Balancing work deadlines and family care often left me depleted by evening. The 5-minute unwinding reflections give me a quiet moment to reset and recharge my patience.",
    reflection: "🌿 Daily moments of evening reset",
    favoriteTool: "Evening Bedtime Soundscapes",
  },
  {
    id: "transition-1",
    category: "transition",
    role: "An Individual in Career Transition",
    categoryLabel: "Life Transitions",
    badgeStyle: "bg-[#7C6BC4]/15 text-[#5F4EA5] border border-[#7C6BC4]/30",
    initial: "T",
    avatarBg: "bg-[#7C6BC4]/20 text-[#5F4EA5]",
    location: "Chennai",
    timeWithManraah: "3 months",
    quote: "Navigating a major life transition felt isolating. Having an anonymous, private sanctuary where I can journal and process uncertainty has been deeply grounding.",
    reflection: "🕊️ Grounded support during life changes",
    favoriteTool: "Encrypted Voice Journaling",
  },
  {
    id: "working-pro-2",
    category: "working_pro",
    role: "A Healthcare Professional",
    categoryLabel: "Mindfulness & Rest",
    badgeStyle: "bg-mint/20 text-[#006B56] border border-mint/30",
    initial: "H",
    avatarBg: "bg-mint/25 text-[#006B56]",
    location: "Kolkata",
    timeWithManraah: "9 months",
    quote: "After demanding shifts, my mind would keep spinning for hours. The short breathing resets and evening audio soundscapes help my body transition into restful sleep.",
    reflection: "🌙 Decompressing after intense days",
    favoriteTool: "Sleep Soundscapes & Body Scan",
  },
  {
    id: "working-pro-3",
    category: "working_pro",
    role: "A Creative Freelancer",
    categoryLabel: "Career & Balance",
    badgeStyle: "bg-peach/30 text-[#9E5D28] border border-peach/40",
    initial: "F",
    avatarBg: "bg-peach/30 text-[#9E5D28]",
    location: "Goa",
    timeWithManraah: "1 year",
    quote: "Working remotely without a team made it easy to lose perspective. The mood tracking and AI check-ins serve as my daily emotional anchor.",
    reflection: "💡 Daily mindfulness during solitary work",
    favoriteTool: "Emotional Anchor Check-ins",
  },
  {
    id: "couple-2",
    category: "couple",
    role: "Newlyweds Navigating Change",
    categoryLabel: "Couples & Harmony",
    badgeStyle: "bg-pink/20 text-[#A83256] border border-pink/30",
    initial: "N",
    avatarBg: "bg-pink/25 text-[#A83256]",
    location: "Chandigarh",
    timeWithManraah: "6 months",
    quote: "Moving to a new city and adjusting to married life was overwhelming at times. The relationship check-in modules gave us shared vocabulary to express our needs kindly.",
    reflection: "🤝 Compassionate communication habits",
    favoriteTool: "Shared Reflection Exercises",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Perspectives" },
  { id: "student", label: "Students & Academics" },
  { id: "working_pro", label: "Working Professionals" },
  { id: "parent", label: "Parents & Families" },
  { id: "couple", label: "Couples" },
  { id: "transition", label: "Life Transitions" },
];

export default function StoriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  const filteredStories =
    selectedCategory === "all"
      ? ALL_STORIES
      : ALL_STORIES.filter((s) => s.category === selectedCategory);

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none">
      {/* ═══ 1. HERO HEADER ═══ */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Glow Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-mint/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Real Perspectives &bull; Real Humans</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Stories of Calm, Balance &amp;{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
            Inner Strength
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          How real people across diverse life paths navigate stress, exam anxiety, career burnout, and relationship dynamics with Manraah.
        </p>

        {/* Social Proof Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs font-heading font-semibold text-on-surface-variant">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-surface-variant/40 shadow-xs">
            <span className="text-amber-400">★ ★ ★ ★ ★</span>
            <span className="font-bold text-on-surface">4.9/5 Member Rating</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-surface-variant/40 shadow-xs">
            <span className="text-primary">🛡️</span>
            <span>100% Anonymized &amp; Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-lowest border border-surface-variant/40 shadow-xs">
            <span className="text-[#006B56]">🌿</span>
            <span>14,000+ Active Members</span>
          </div>
        </div>
      </section>

      {/* ═══ 2. CATEGORY FILTER TABS ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-10">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-variant/40"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ 3. STORIES GRID ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          <AnimatePresence mode="popLayout">
            {filteredStories.map((story) => (
              <motion.div
                key={story.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="p-7 sm:p-8 rounded-[32px] bg-surface-container-lowest border border-surface-variant/50 shadow-card-lift hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between space-y-6 text-left"
              >
                <div className="space-y-4">
                  {/* Top Bar: Stars + Category Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                      {"★".repeat(5)}
                    </div>
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-heading font-bold ${story.badgeStyle}`}>
                      {story.categoryLabel}
                    </span>
                  </div>

                  {/* Quote */}
                  <p className="text-sm sm:text-base text-on-surface leading-relaxed font-medium">
                    &quot;{story.quote}&quot;
                  </p>

                  {/* Favorite Tool Tag */}
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container text-[11px] font-heading font-semibold text-on-surface-variant border border-surface-variant/40">
                      <span className="text-primary font-bold">Go-to Tool:</span>
                      <span>{story.favoriteTool}</span>
                    </span>
                  </div>
                </div>

                {/* Member Attribution Footer */}
                <div className="pt-4 border-t border-surface-variant/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${story.avatarBg} font-heading font-bold flex items-center justify-center text-sm shrink-0 shadow-xs`}>
                      {story.initial}
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-xs sm:text-sm text-on-surface leading-tight">
                        {story.role}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        {story.reflection}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-on-surface-variant/70 font-heading">
                    {story.timeWithManraah}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ 4. SAFE SPACES & PRIVACY PLEDGE ═══ */}
      <section className="py-16 bg-[#F2EBFF]/50 border-y border-surface-variant/20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-[#006B56] flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-2xl font-bold">lock</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-on-surface">
            Anonymized for Pure Comfort
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto font-normal">
            Every story shared on Manraah has identifying details protected. We believe in creating spaces where honest vulnerability is met with respect, encryption, and peer warmth.
          </p>

          <div className="pt-2">
            <Link
              href="/privacy"
              className="text-xs font-heading font-bold text-primary hover:text-primary-purple border-b border-primary/30 pb-0.5 inline-flex items-center gap-1"
            >
              <span>Learn about our End-to-End Privacy Architecture</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 5. BOTTOM INVITATION CTA ═══ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-7 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Ready to Begin Your Own Journey?
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed font-normal">
            Take 2 minutes today to check in with your mind, talk to your companion, and cultivate everyday emotional stillness.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="px-9 py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-extrabold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start Free Today</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>

            <Link
              href="/retreat"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-semibold text-sm transition-all"
            >
              Try Daily Retreat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
