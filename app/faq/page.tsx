"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "@/backend/auth/client";

interface FAQItem {
  id: string;
  category: "general" | "ai_companion" | "human_care" | "privacy" | "crisis" | "pricing";
  q: string;
  a: string;
}

const FAQ_DATA: FAQItem[] = [
  // General & Overview
  {
    id: "g1",
    category: "general",
    q: "What is Manraah, and what does the name mean?",
    a: "\"Manraah\" originates from the vision of \"Strong Minds\" (Man + Raah — guiding the mind toward clarity and strength). It is an everyday mental wellness platform designed to provide a safe retreat for your mind through 24/7 AI companionship, trained human peer listeners, daily mood tracking, guided CBT/MBSR tools, and professional therapy booking.",
  },
  {
    id: "g2",
    category: "general",
    q: "How does category-based personalization work?",
    a: "When you select your life category (such as Student, Working Professional, Parent, or Couple), Manraah customizes the tone of AI interactions, dashboard widgets, reflection prompts, and community circles to directly address your unique life stage challenges and daily stressors.",
  },
  {
    id: "g3",
    category: "general",
    q: "How is Manraah different from other wellness apps?",
    a: "Unlike single-purpose meditation timers or clinical diagnosis tools, Manraah combines real-time empathetic AI companionship with human peer support, encrypted voice journaling, category-specific life pathways, and certified therapist access — all inside a zero-judgment, privacy-first ecosystem.",
  },

  // AI & Companion Features
  {
    id: "ai1",
    category: "ai_companion",
    q: "How does the 24/7 AI Companion support me?",
    a: "Manraah's AI Companion is trained on evidence-based psychological frameworks including Cognitive Behavioral Therapy (CBT) and Mindfulness-Based Stress Reduction (MBSR). It is available 24/7 to listen without judgment, help de-escalate racing thoughts, provide grounding breathing prompts, and guide your daily reflections.",
  },
  {
    id: "ai2",
    category: "ai_companion",
    q: "Does the AI diagnose medical or psychiatric conditions?",
    a: "No. The AI Companion is strictly an everyday supportive wellness guide for stress management, self-reflection, and habit building. It does not provide medical diagnoses, psychiatric evaluations, or prescribe medications.",
  },
  {
    id: "ai3",
    category: "ai_companion",
    q: "Can I use voice chat or audio with the AI?",
    a: "Yes! Manraah supports interactive voice input, encrypted voice journaling, and soothing audio narration for guided resets and bedtime soundscapes.",
  },

  // Human Companion & Professional Care
  {
    id: "hc1",
    category: "human_care",
    q: "Can I talk to real humans as well as the AI companion?",
    a: "Absolutely. In addition to the 24/7 AI Companion, Manraah offers Human Companion sessions with verified, empathetic peer listeners, as well as 1-on-1 video/audio appointments with certified clinical psychologists through Professional Care.",
  },
  {
    id: "hc2",
    category: "human_care",
    q: "Who are the Human Peer Listeners?",
    a: "Our peer listeners are compassionate, vetted individuals trained in active listening, empathy, and boundary maintenance. They provide an anonymous, warm ear for you to share what is on your mind without clinical pressure.",
  },
  {
    id: "hc3",
    category: "human_care",
    q: "How do I book a session with a licensed therapist?",
    a: "Through our Professional Care directory, you can browse verified therapists and counselors, filter by specialty (e.g., anxiety, burnout, couples counseling, family dynamics), view credentials, and schedule private video/audio sessions directly.",
  },

  // Privacy & Data Security
  {
    id: "p1",
    category: "privacy",
    q: "Is my personal data and conversation history private?",
    a: "Yes, 100%. We employ enterprise-grade 256-bit encryption across all journal entries, AI conversations, mood check-ins, and assessment scores. Your private reflections belong strictly to you and will never be sold, rented, or analyzed for commercial advertising.",
  },
  {
    id: "p2",
    category: "privacy",
    q: "Can I use Manraah anonymously?",
    a: "Yes. You can participate in community circles, AI check-ins, and peer listener conversations using an anonymous username and avatar. No real names or intrusive personal information are publicly exposed.",
  },
  {
    id: "p3",
    category: "privacy",
    q: "Can I export or permanently delete my account data?",
    a: "Yes. You have complete ownership of your data. From your account settings, you can export your reflections or request permanent deletion of all associated logs and records at any time.",
  },

  // Crisis & Emergency Notice
  {
    id: "cr1",
    category: "crisis",
    q: "Is Manraah an emergency or crisis dispatch service?",
    a: "No. Manraah is an everyday wellness companion and is not equipped for emergency psychiatric intervention or emergency dispatch. If you or someone you know is in immediate physical danger, experiencing severe self-harm urges, or in urgent crisis, please contact your local emergency services (e.g. 988 in US/Canada, 14416 Tele-MANAS in India, or 112 in EU) immediately.",
  },
  {
    id: "cr2",
    category: "crisis",
    q: "Where can I find emergency helpline numbers inside the app?",
    a: "Manraah features a dedicated 24/7 Crisis Support page with one-tap access to national mental health helplines, free counseling hotlines, and immediate grounding exercises.",
  },

  // Pricing & Free Access
  {
    id: "pr1",
    category: "pricing",
    q: "Is Manraah free to get started?",
    a: "Yes! Creating an account gives you free access to daily mood check-ins, core AI companion conversations, basic meditation soundscapes, and public community spaces.",
  },
  {
    id: "pr2",
    category: "pricing",
    q: "Are professional therapy sessions covered by the free tier?",
    a: "Professional Care 1-on-1 sessions with licensed clinical psychologists are paid appointments booked directly with the practitioner at transparent rates listed on their profile.",
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "General & Overview" },
  { id: "ai_companion", label: "AI Companion" },
  { id: "human_care", label: "Human & Pro Care" },
  { id: "privacy", label: "Privacy & Security" },
  { id: "crisis", label: "Crisis Support" },
  { id: "pricing", label: "Pricing & Plans" },
];

export default function FAQPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    g1: true,
    ai1: true,
    p1: true,
  });

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none">
      {/* ═══ 1. FAQ HERO HEADER ═══ */}
      <section className="relative pt-12 pb-14 md:pt-16 md:pb-18 px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Subtle Glow Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-mint/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Knowledge Base &bull; Help Center</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Frequently Asked{" "}
          <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
            Questions
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          Everything you need to know about Manraah, our 24/7 AI companion, privacy standards, and mental wellness care.
        </p>

        {/* Live Search Bar */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-xl">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. privacy, therapy, AI, free)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-full bg-surface-container-lowest border border-surface-variant/60 shadow-md text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 2. CATEGORY CHIPS ═══ */}
      <section className="px-6 max-w-5xl mx-auto pb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-variant/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ 3. FAQ ACCORDION LIST ═══ */}
      <section className="px-6 max-w-4xl mx-auto pb-20">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/40 space-y-4">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
            <h3 className="text-lg font-heading font-bold text-on-surface">No matching questions found</h3>
            <p className="text-xs text-on-surface-variant">
              Try searching with another keyword or explore our categories above.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-5 py-2 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((item) => {
              const isOpen = !!openIds[item.id];
              return (
                <div
                  key={item.id}
                  className="rounded-[24px] bg-surface-container-lowest border border-surface-variant/40 shadow-ambient overflow-hidden transition-all hover:border-primary/30"
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full p-6 text-left font-heading font-bold text-base sm:text-lg text-on-surface flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <span className="material-symbols-outlined text-primary transition-transform duration-200 shrink-0">
                      {isOpen ? "expand_less" : "expand_more"}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-6 pb-6 pt-0 text-sm text-on-surface-variant leading-relaxed font-normal border-t border-surface-variant/20 pt-4"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ 4. STILL HAVE QUESTIONS CARD ═══ */}
      <section className="py-16 bg-[#F2EBFF]/50 border-y border-surface-variant/20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-2xl font-bold">support_agent</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-on-surface">
            Still Have Questions?
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-xl mx-auto font-normal">
            Our support team is here to help. Whether you need assistance with your account, privacy inquiries, or feature guidance, we are one message away.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-7 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white text-xs sm:text-sm font-heading font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <span>Contact Support</span>
              <span className="material-symbols-outlined text-base">mail</span>
            </Link>

            <Link
              href="/features"
              className="px-7 py-3.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-surface-variant/50 text-xs sm:text-sm font-heading font-semibold transition-all"
            >
              Explore All Features
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 5. BOTTOM CTA BANNER ═══ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-7 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Your Sanctuary for Mind is Ready
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed font-normal">
            Join thousands of individuals cultivating everyday stillness, resilience, and emotional clarity with Manraah.
          </p>

          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="px-9 py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-extrabold text-sm shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started Free Today</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
