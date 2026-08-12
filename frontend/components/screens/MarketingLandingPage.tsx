"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { USER_CATEGORIES } from "@/frontend/lib/constants";
import { signOut } from "@/backend/auth/client";
import Logo from "@/frontend/components/ui/Logo";

// Vibrant 2-Tone Brand Gradients per Category
const USER_CATEGORY_GRADIENTS: Record<string, { bg: string; badge: string }> = {
  student: {
    bg: "bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#F4A6B8]",
    badge: "🎓 Academic Focus",
  },
  working_professional: {
    bg: "bg-gradient-to-br from-[#006B56] via-[#2A9D8F] to-[#5F4EA5]",
    badge: "💼 Career & Balance",
  },
  parent: {
    bg: "bg-gradient-to-br from-[#9E5D28] via-[#E76F51] to-[#F4A6B8]",
    badge: "🍼 Family Care",
  },
  couple: {
    bg: "bg-gradient-to-br from-[#874959] via-[#C75D73] to-[#F5C99B]",
    badge: "💖 Harmony Journey",
  },
  other: {
    bg: "bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#5FCFB0]",
    badge: "✨ Unique Path",
  },
};

// Hero Interactive Category Previews Dataset (5 sorted categories)
const HERO_CATEGORY_PREVIEWS = [
  {
    id: "student",
    label: "Student",
    icon: "🎓",
    badge: "Student Mode",
    userMsg: "Exams are next week and my mind won't stop racing...",
    aiResponse: "I hear you. Let's take a slow deep breath together right now. You've prepared hard, let's break tonight down into small gentle steps.",
    action1: "🫁 2-Min Reset",
    action2: "🎧 Focus Audio",
    action3: "📝 Express Journal",
    score: "86",
    status: "Calm & Grounded",
  },
  {
    id: "working_professional",
    label: "Working Pro",
    icon: "💼",
    badge: "Burnout Relief",
    userMsg: "Back-to-back meetings all week and I'm running on empty. How do I disengage tonight?",
    aiResponse: "It takes courage to acknowledge burnout. Let's establish a firm boundary for tonight: close work tabs, step away, and do a 3-minute evening decompression.",
    action1: "🌿 Work-Life Transition",
    action2: "🫁 Evening Reset",
    action3: "📊 Stress Audit",
    score: "78",
    status: "Restoring Energy",
  },
  {
    id: "parent",
    label: "Parent",
    icon: "🍼",
    badge: "Parenting Care",
    userMsg: "Juggling work and toddler tantrums today... I feel guilty for feeling frustrated.",
    aiResponse: "Parenting is deeply demanding, and feeling exhausted doesn't mean you're failing. You're doing a wonderful job. Give yourself permission to pause for 5 minutes.",
    action1: "💖 Parent Calming Breath",
    action2: "☕ 5-Min Reset",
    action3: "🕊️ Patience Prompt",
    score: "82",
    status: "Nurturing Heart",
  },
  {
    id: "couple",
    label: "Couple",
    icon: "💖",
    badge: "Relationship Harmony",
    userMsg: "We've both been feeling stressed lately and communication has felt tense...",
    aiResponse: "Stress can create distance between even the closest partners. Let's focus on gentle active listening and a 3-minute shared gratitude reflection tonight.",
    action1: "🕊️ Conflict De-escalation",
    action2: "💬 Connection Prompt",
    action3: "🌸 Shared Calm",
    score: "88",
    status: "Harmonious Bond",
  },
  {
    id: "other",
    label: "Other",
    icon: "✨",
    badge: "Personalized Path",
    userMsg: "I'm going through a big life transition right now and need space to process.",
    aiResponse: "Transitions carry both challenge and growth. Your sanctuary is here for whatever you need today — no judgment, just steady, gentle presence.",
    action1: "🌿 Life Transition Guide",
    action2: "📝 Daily Mindful Log",
    action3: "🎧 Evening Peace",
    score: "85",
    status: "Grounded & Centered",
  },
];

// ─── Hero Mood Check-In Data (same emoji set as DailyCheckInScreen MOODS) ───
const HERO_MOODS = [
  {
    label: "Amazing",
    emoji: "😁",
    headline: "That spark matters. Let's help you turn it into something lasting.",
    subNote: "You're in a great place right now — use this moment to reflect, grow, and store up some calm for harder days.",
    cta: "Start Your Free Journey",
    color: "bg-mint/15 border-mint/30 text-[#006B56]",
    ring: "ring-mint/40",
  },
  {
    label: "Happy",
    emoji: "😊",
    headline: "Love that. Let's help you keep that going.",
    subNote: "A gentle daily check-in helps you understand what fuels these good days — so you can create more of them.",
    cta: "Start Your Free Journey",
    color: "bg-primary/10 border-primary/20 text-primary",
    ring: "ring-primary/30",
  },
  {
    label: "Calm",
    emoji: "🙂",
    headline: "Stillness is a strength. You're already here.",
    subNote: "This is exactly the kind of grounded energy that Manraah helps you nurture and return to whenever life gets loud.",
    cta: "Start Your Free Journey",
    color: "bg-primary/10 border-primary/20 text-primary",
    ring: "ring-primary/30",
  },
  {
    label: "Okay",
    emoji: "😐",
    headline: "Neither here nor there — and that's completely valid.",
    subNote: "Some days just feel flat. Manraah is here for the in-between moments just as much as the hard ones.",
    cta: "Start Your Free Journey",
    color: "bg-peach/20 border-peach/30 text-[#9E5D28]",
    ring: "ring-peach/40",
  },
  {
    label: "Low",
    emoji: "😔",
    headline: "You don't have to carry this alone. We're right here.",
    subNote: "Low days are real, and they deserve real care. Let's find a quiet moment together — no pressure, no rush.",
    cta: "Let's Talk About It",
    color: "bg-pink/20 border-pink/30 text-[#874959]",
    ring: "ring-pink/40",
  },
  {
    label: "Overwhelmed",
    emoji: "😣",
    headline: "That's exactly what we're here for. Let's find a moment of calm together.",
    subNote: "When everything feels like too much, even a single breath can shift things. We'll start there — just you and us.",
    cta: "Let's Find Calm Together",
    color: "bg-pink/20 border-pink/30 text-[#874959]",
    ring: "ring-pink/40",
  },
];

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 85, damping: 15 },
  },
};

// Trust badges data
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
    bg: "bg-pink/20",
    iconColor: "text-[#874959]",
    border: "border-pink/30",
  },
  {
    icon: "schedule",
    title: "Available 24/7",
    desc: "Support whenever you need",
    bg: "bg-peach/25",
    iconColor: "text-[#9E5D28]",
    border: "border-peach/30",
  },
];

// Interactive Feature Showcase Tabs Data
const FEATURE_TABS = [
  {
    id: "ai",
    label: "AI Companion",
    icon: "smart_toy",
    panelBg: "bg-[#F2EBFF]",
    panelBorder: "border-primary/20",
    badge: "24/7 AI Guidance",
    headline: "Support, any time you need to talk",
    description: "Unpack your thoughts with a 24/7 empathetic assistant trained in active listening, cognitive reflection, and compassionate guidance. Receive immediate, non-judgmental support whenever your mind feels overwhelmed.",
    cta: "Try AI Companion",
    mockupSide: "left" as const,
  },
  {
    id: "human",
    label: "Human Companion",
    icon: "record_voice_over",
    panelBg: "bg-[#FFF4E8]",
    panelBorder: "border-peach/40",
    badge: "Peer Listening",
    headline: "Genuine empathy from real peer listeners",
    description: "Connect with compassionate, trained peer companions who understand your exact life stage. Share your feelings in a safe space built on warmth, mutual respect, and shared lived experience.",
    cta: "Connect with a Listener",
    mockupSide: "right" as const,
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
    cta: "Book Professional Session",
    mockupSide: "left" as const,
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
    cta: "Log Your Mood",
    mockupSide: "right" as const,
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
    cta: "Start Journaling",
    mockupSide: "left" as const,
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
    cta: "Listen & Unwind",
    mockupSide: "right" as const,
  },
  {
    id: "community",
    label: "Community",
    icon: "groups",
    panelBg: "bg-[#F5F2FF]",
    panelBorder: "border-primary/20",
    badge: "Safe Circles",
    headline: "Safe, anonymous circles where you belong",
    description: "Join moderated peer support spaces organized by life stage. Share reflections, exchange encouragement, and connect with people who truly understand what you're going through.",
    cta: "Join a Circle",
    mockupSide: "left" as const,
  },
  {
    id: "resources",
    label: "Resources",
    icon: "menu_book",
    panelBg: "bg-[#EBFBF7]",
    panelBorder: "border-secondary/20",
    badge: "Expert Toolkits",
    headline: "Bite-sized toolkits for mental wellness",
    description: "Explore expert-crafted guides, anxiety relief toolkits, and practical self-care articles. Grounded in clinical psychology to give you actionable strategies for everyday challenges.",
    cta: "Explore Toolkits",
    mockupSide: "right" as const,
  },
];

// Steps data
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Choose Your Path",
    desc: "Select your category (Student, Parent, Working Pro, Senior, etc.) so Manraah adapts its voice and tools to your life context.",
    icon: "tune",
    color: "bg-primary/15 text-primary border-primary/30",
    badgeBg: "bg-primary text-white",
  },
  {
    step: "02",
    title: "Quick Check-in",
    desc: "Complete a brief, 1-minute assessment to establish your baseline stress level, current energy, and immediate wellness goals.",
    icon: "assignment_turned_in",
    color: "bg-pink/25 text-[#9E3B54] border-pink/40",
    badgeBg: "bg-[#9E3B54] text-white",
  },
  {
    step: "03",
    title: "Get Your Personalized Space",
    desc: "Unlock a custom dashboard featuring your AI companion, daily wellness score, curated meditations, and journal prompts.",
    icon: "auto_awesome",
    color: "bg-mint/25 text-[#006B56] border-mint/40",
    badgeBg: "bg-[#006B56] text-white",
  },
  {
    step: "04",
    title: "Grow at Your Pace",
    desc: "Engage daily with mood tracking, breathing exercises, or peer listeners whenever you need a moment of peace.",
    icon: "trending_up",
    color: "bg-peach/30 text-[#9E5D28] border-peach/50",
    badgeBg: "bg-[#9E5D28] text-white",
  },
];

// FAQ Data
const FAQ_ITEMS = [
  {
    q: "Is Manraah a replacement for clinical therapy?",
    a: "No. Manraah is an everyday mental wellness companion designed for stress management, daily reflection, peer support, and habit building. While we facilitate access to licensed practitioners through Professional Care, Manraah itself does not provide medical diagnoses or emergency psychiatric intervention.",
  },
  {
    q: "Is my personal data and conversation history private?",
    a: "Yes, 100%. We employ end-to-end encryption across all journal entries, chat logs, and assessment scores. Your private reflections belong strictly to you and will never be sold, analyzed for advertising, or made public.",
  },
  {
    q: "Is Manraah free to get started?",
    a: "Yes! Creating an account gives you free access to daily mood check-ins, core AI companion conversations, basic meditation audio, and community discussion spaces. Optional premium features and 1-on-1 professional sessions are available if you seek deeper care.",
  },
  {
    q: "Can I talk to real humans as well as the AI companion?",
    a: "Absolutely. In addition to our 24/7 AI Companion, Manraah offers Human Companion sessions with trained peer listeners, as well as Professional Care booking with verified therapists and counselors.",
  },
  {
    q: "What should I do if I am in immediate crisis or danger?",
    a: "If you are facing immediate danger, self-harm thoughts, or severe mental distress, please reach out to emergency services immediately. Manraah features an in-app Crisis Support center with 24/7 national helpline contacts, but it is not an emergency dispatch service.",
  },
  {
    q: "How does category-based personalization work?",
    a: "When you choose your life category (such as Student, Parent, or Working Professional), Manraah customizes the tone of AI interactions, dashboard widgets, reflection prompts, and community circles to directly address your life stage challenges.",
  },
];

// Illustrative Voices & Reflections (Non-fabricated, role-based attributions)
const TESTIMONIALS_ROW_1 = [
  {
    id: "student",
    role: "A Student Member",
    badge: "🎓 Academic Life",
    badgeStyle: "bg-primary/10 text-primary border border-primary/20",
    initial: "S",
    avatarBg: "bg-primary/20 text-primary",
    quote: "Exam periods used to trigger overwhelming late-night anxiety. Having Manraah's companion to talk through racing thoughts without feeling judged has given me a calm, steady space to regroup.",
    reflection: "✨ Finding calm through academic stress",
  },
  {
    id: "couple",
    role: "A Couple using Manraah",
    badge: "💖 Relationship Harmony",
    badgeStyle: "bg-pink/20 text-[#A83256] border border-pink/30",
    initial: "C",
    avatarBg: "bg-pink/30 text-[#A83256]",
    quote: "The guided reflection prompts helped us slow down difficult conversations around work stress and finances. It gave us a gentle structure to truly hear each other again.",
    reflection: "💑 Fostering open, peaceful dialogue",
  },
  {
    id: "working-pro",
    role: "A Working Professional",
    badge: "💼 Career & Balance",
    badgeStyle: "bg-mint/20 text-[#006B56] border border-mint/30",
    initial: "W",
    avatarBg: "bg-mint/30 text-[#006B56]",
    quote: "Long hours and back-to-back meetings had me feeling on the verge of burnout. Checking in with my daily emotional rhythm helped me recognize when to step back and set healthy boundaries.",
    reflection: "📈 Building sustainable daily boundaries",
  },
  {
    id: "student-researcher",
    role: "A Graduate Researcher",
    badge: "🎓 Student Perspective",
    badgeStyle: "bg-primary/10 text-primary border border-primary/20",
    initial: "R",
    avatarBg: "bg-primary/20 text-primary",
    quote: "When thesis deadlines piled up, the quick 2-minute breathing exercises helped break the cycle of panic so I could focus on one task at a time.",
    reflection: "🫁 Grounded focus during high-pressure weeks",
  },
];

const TESTIMONIALS_ROW_2 = [
  {
    id: "parent",
    role: "A Parent Member",
    badge: "🍼 Family & Parenting",
    badgeStyle: "bg-peach/30 text-[#9E5D28] border border-peach/40",
    initial: "P",
    avatarBg: "bg-peach/40 text-[#9E5D28]",
    quote: "Balancing work deadlines and family care often left me depleted by evening. The 5-minute unwinding reflections give me a quiet moment to reset and recharge my patience.",
    reflection: "🌿 Daily moments of evening reset",
  },
  {
    id: "transition",
    role: "An Individual in Transition",
    badge: "✨ Life Transitions",
    badgeStyle: "bg-[#7C6BC4]/15 text-[#5F4EA5] border border-[#7C6BC4]/30",
    initial: "T",
    avatarBg: "bg-[#7C6BC4]/20 text-[#5F4EA5]",
    quote: "Navigating a major life transition felt isolating. Having an anonymous, private sanctuary where I can journal and process uncertainty has been deeply grounding.",
    reflection: "🕊️ Grounded support during life changes",
  },
  {
    id: "caregiver",
    role: "A Healthcare Professional",
    badge: "🩺 Mindfulness & Rest",
    badgeStyle: "bg-mint/20 text-[#006B56] border border-mint/30",
    initial: "H",
    avatarBg: "bg-mint/25 text-[#006B56]",
    quote: "After demanding shifts, my mind would keep spinning for hours. The short breathing resets and evening audio soundscapes help my body transition into restful sleep.",
    reflection: "🌙 Decompressing after intense days",
  },
  {
    id: "creative-pro",
    role: "A Creative Freelancer",
    badge: "💼 Work & Wellness",
    badgeStyle: "bg-peach/30 text-[#9E5D28] border border-peach/40",
    initial: "F",
    avatarBg: "bg-peach/30 text-[#9E5D28]",
    quote: "Working remotely without a team made it easy to lose perspective. The mood tracking and AI check-ins serve as my daily emotional anchor.",
    reflection: "💡 Daily mindfulness during solitary work",
  },
];

// Lightweight count-up counter component triggered on scroll view
function AnimatedScoreCounter({ target, inView, duration = 1200 }: { target: number; inView: boolean; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [inView, target, duration]);

  return <>{count}</>;
}

export default function MarketingLandingPage() {
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [selectedMoodIdx, setSelectedMoodIdx] = useState<number | null>(null);
  const categoryCarouselRef = useRef<HTMLDivElement>(null);
  const featureTabsRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const scoreInView = useInView(scoreRef, { once: true, amount: 0.25 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-scroll the active tab pill into view when navigating via gestures or buttons
  useEffect(() => {
    if (featureTabsRef.current) {
      const activeTabEl = featureTabsRef.current.children[activeFeatureTab] as HTMLElement;
      if (activeTabEl) {
        activeTabEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeFeatureTab]);

  const scrollCategoryCarousel = (direction: "left" | "right") => {
    if (categoryCarouselRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      categoryCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollFeatureTabs = (direction: "left" | "right") => {
    if (featureTabsRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      featureTabsRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleNextFeature = () => {
    setActiveFeatureTab((prev) => (prev + 1) % FEATURE_TABS.length);
  };

  const handlePrevFeature = () => {
    setActiveFeatureTab((prev) => (prev - 1 + FEATURE_TABS.length) % FEATURE_TABS.length);
  };

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  const handleSelectCategory = async (catId: string) => {
    try {
      document.cookie = `userType=${catId}; path=/; max-age=86400`;
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans select-none overflow-x-hidden">
      {/* ==================== 2. HERO SECTION — INTERACTIVE MOOD CHECK-IN ==================== */}
      <section className="relative py-14 md:py-20 lg:py-28 px-6 max-w-5xl mx-auto">

        {/* Soft Atmospheric Glow Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] md:w-[600px] h-[400px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-mint/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-20 left-0 w-[250px] h-[250px] bg-pink/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center gap-8"
        >
          {/* Eyebrow Label */}
          <motion.p variants={itemVariants} className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
            Your Everyday Mental Sanctuary
          </motion.p>

          {/* ── MOOD CHECK-IN PROMPT ── */}
          <motion.div variants={itemVariants} className="w-full max-w-xl space-y-4">
            <p className="text-sm sm:text-base font-heading font-semibold text-on-surface-variant">
              How are you feeling right now?
            </p>

            {/* Mood Emoji Row — same set as DailyCheckInScreen */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {HERO_MOODS.map((mood, idx) => {
                const isSelected = selectedMoodIdx === idx;
                return (
                  <button
                    key={mood.label}
                    onClick={() => setSelectedMoodIdx(isSelected ? null : idx)}
                    aria-label={mood.label}
                    className={`flex flex-col items-center gap-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? `${mood.color} ring-2 ${mood.ring} shadow-md scale-[1.08]`
                        : "bg-surface-container border-surface-variant/40 hover:bg-surface-container-high hover:border-surface-variant/60 hover:scale-[1.04]"
                    }`}
                  >
                    <span className={`text-2xl sm:text-3xl leading-none transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                      {mood.emoji}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-heading font-bold leading-none ${
                      isSelected ? "opacity-100" : "text-on-surface-variant"
                    }`}>
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* ── RESPONSIVE HEADLINE — CROSS-FADES ON MOOD SELECTION ── */}
          <motion.div variants={itemVariants} className="w-full max-w-3xl space-y-4">
            <AnimatePresence mode="wait">
              {selectedMoodIdx === null ? (
                <motion.h1
                  key="default"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.12] text-on-surface"
                >
                  Your Safe Space to{" "}
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
                    Breathe, Reflect & Feel Heard
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
                  {HERO_MOODS[selectedMoodIdx].headline}
                </motion.h1>
              )}
            </AnimatePresence>

            {/* Subheading — cross-fades too */}
            <AnimatePresence mode="wait">
              {selectedMoodIdx === null ? (
                <motion.p
                  key="sub-default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-base sm:text-lg leading-relaxed text-on-surface-variant max-w-2xl mx-auto font-normal"
                >
                  Connect with an empathetic AI companion 24/7, talk to verified peer listeners, track your emotional wellness, and access guided care — personalized for your exact stage in life.
                </motion.p>
              ) : (
                <motion.p
                  key={`sub-mood-${selectedMoodIdx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="text-base sm:text-lg leading-relaxed text-on-surface-variant max-w-2xl mx-auto font-normal"
                >
                  {HERO_MOODS[selectedMoodIdx].subNote}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
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
                  {selectedMoodIdx !== null ? HERO_MOODS[selectedMoodIdx].cta : "Start Your Free Journey"}
                </span>
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </motion.button>
            </AnimatePresence>

            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-full bg-surface-container border border-surface-variant/40 font-heading font-semibold text-sm text-on-surface text-center hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
            >
              See How It Works
            </a>
          </motion.div>

          {/* ── Social Proof Row ── */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 pt-2 border-t border-surface-variant/20">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">A</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-mint/30 text-[#006B56] font-bold text-xs flex items-center justify-center">M</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-peach/40 text-[#9E5D28] font-bold text-xs flex items-center justify-center">R</div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-surface bg-pink/30 text-[#A83256] font-bold text-xs flex items-center justify-center">S</div>
            </div>
            <div className="text-xs text-on-surface-variant text-left">
              <p className="font-heading font-bold text-on-surface">14,000+ members finding daily calm</p>
              <p className="text-[11px] text-on-surface-variant/80">⭐️ 4.9/5 Rating • 100% Private & Encrypted</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Trust Badges Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 lg:mt-20"
        >
          {TRUST_BADGES.map((b, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`p-5 rounded-[24px] bg-surface-container-lowest border ${b.border} shadow-ambient hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between h-36`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${b.bg} ${b.iconColor}`}>
                <span className="material-symbols-outlined text-xl font-bold">{b.icon}</span>
              </div>
              <div>
                <h4 className="text-xs font-heading font-black text-on-surface">{b.title}</h4>
                <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== 3. PROBLEM / EMPATHY SECTION ==================== */}
      <section className="py-20 md:py-28 bg-[#F2EBFF]/60 border-y border-surface-variant/20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">

          {/* Section Header — centered above the two columns */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-xs font-heading font-bold text-[#874959] tracking-widest uppercase">
              Why We Built Manraah
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface leading-tight">
              Mental health support should never feel expensive, generic, or intimidating.
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-normal">
              For too long, getting emotional support meant long waitlists, high hourly fees, or cold clinical questionnaires that didn&apos;t fit your life. Manraah changes that.
            </p>
          </div>

          {/* ── Two-Column Comparison ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-stretch gap-0 rounded-[32px] overflow-hidden shadow-card-lift border border-surface-variant/30"
          >

            {/* ═══ LEFT: THE OLD WAY (muted / desaturated) ═══ */}
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-[#2C2A35] text-white px-8 py-10 flex flex-col gap-6"
            >
              {/* Column label */}
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white/50 text-[10px] font-black leading-none">✕</span>
                </span>
                <span className="text-[11px] font-heading font-bold text-white/40 tracking-widest uppercase">The Old Way</span>
              </div>

              {/* Pain points list */}
              <div className="flex flex-col gap-5">

                {/* Pain point 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg text-white/30">schedule</span>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-white/50 line-through decoration-white/25">Long Waitlists</p>
                    <p className="text-[12px] text-white/30 leading-relaxed mt-0.5">Weeks before your first session — if you can even get one.</p>
                  </div>
                </div>

                {/* Pain point 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg text-white/30">payments</span>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-white/50 line-through decoration-white/25">High Hourly Fees</p>
                    <p className="text-[12px] text-white/30 leading-relaxed mt-0.5">₹3,000–₹8,000 per session. Care priced out of reach.</p>
                  </div>
                </div>

                {/* Pain point 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg text-white/30">assignment</span>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-white/50 line-through decoration-white/25">Cold Clinical Questionnaires</p>
                    <p className="text-[12px] text-white/30 leading-relaxed mt-0.5">Generic intake forms that don&apos;t know your world at all.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══ DIVIDER: Arrow bridge (hidden on mobile — replaced by the arrow below) ═══ */}
            {/* Mobile: downward arrow connector */}
            <div className="flex md:hidden items-center justify-center bg-[#1E1C27] py-4 gap-3">
              <div className="h-px flex-1 bg-white/10 ml-8" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-primary font-black text-xl leading-none">↓</span>
                <span className="text-[10px] font-heading font-bold text-primary/70 tracking-widest uppercase">Manraah Way</span>
              </div>
              <div className="h-px flex-1 bg-primary/20 mr-8" />
            </div>

            {/* Desktop: vertical arrow bridge */}
            <div className="hidden md:flex flex-col items-center justify-center bg-[#1E1C27] px-4 py-10 gap-3 shrink-0 w-[72px]">
              <div className="w-px flex-1 bg-white/10" />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-primary font-black text-base leading-none">→</span>
                </div>
                <span className="text-[8px] font-heading font-black text-primary/60 tracking-widest uppercase writing-mode-vertical rotate-0">vs</span>
              </div>
              <div className="w-px flex-1 bg-primary/25" />
            </div>

            {/* ═══ RIGHT: THE MANRAAH WAY (vibrant, on-brand) ═══ */}
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-surface-container-lowest px-8 py-10 flex flex-col gap-6"
            >
              {/* Column label */}
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-primary text-[10px] font-black leading-none">✓</span>
                </span>
                <span className="text-[11px] font-heading font-bold text-primary tracking-widest uppercase">The Manraah Way</span>
              </div>

              {/* Benefits — three rows with dividers, visually grouped as one unit */}
              <div className="flex flex-col rounded-2xl border border-surface-variant/40 overflow-hidden divide-y divide-surface-variant/30 shadow-ambient">

                {/* Benefit 1: Accessible & Instant */}
                <div className="flex items-start gap-4 p-5 bg-pink/5 hover:bg-pink/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-pink/20 text-[#9E3B54] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg font-bold">payments</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-on-surface">Accessible &amp; Instant</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                      No expensive appointments or rigid schedules. 24/7 guidance directly from your phone.
                    </p>
                  </div>
                </div>

                {/* Benefit 2: Personalized to Your Stage */}
                <div className="flex items-start gap-4 p-5 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg font-bold">tune</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-on-surface">Personalized to Your Stage</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                      Student, parent, working pro — Manraah adapts its voice and tools to your exact life context.
                    </p>
                  </div>
                </div>

                {/* Benefit 3: 100% Anonymous & Private */}
                <div className="flex items-start gap-4 p-5 bg-mint/5 hover:bg-mint/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg font-bold">shield</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-heading font-bold text-on-surface">100% Anonymous &amp; Private</h3>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                      End-to-end encrypted, avatar-first — your sanctuary stays completely yours.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ==================== 4. HOW IT WORKS (ILLUSTRATED ZIGZAG MOCKUP JOURNEY) ==================== */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 space-y-4">
          <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
            Simple 4-Step Flow
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
            Your Journey to Peace in 4 Steps
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant">
            Start feeling supported, understood, and grounded in less than two minutes.
          </p>
        </div>

        {/* Zigzag Journey Container */}
        <div className="relative max-w-6xl mx-auto min-h-[460px]">
          
          {/* Desktop SVG Dashed Zigzag Arrow Path (visible at lg >= 1024px) */}
          <svg
            className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 1100 420"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#7C6BC4" />
              </marker>
            </defs>

            {/* Path 1: Card 1 -> Card 2 top-left */}
            <path
              d="M 225 140 C 275 140, 290 160, 335 160"
              stroke="#7C6BC4"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              markerEnd="url(#arrowhead)"
              opacity="0.8"
            />
            {/* Path 2: Card 2 -> Card 3 left */}
            <path
              d="M 485 180 C 535 180, 555 140, 605 140"
              stroke="#7C6BC4"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              markerEnd="url(#arrowhead)"
              opacity="0.8"
            />
            {/* Path 3: Card 3 -> Card 4 top-left */}
            <path
              d="M 755 140 C 805 140, 825 160, 870 160"
              stroke="#7C6BC4"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              markerEnd="url(#arrowhead)"
              opacity="0.8"
            />
          </svg>

          {/* 4 Zigzag Step Items Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10"
          >
            {HOW_IT_WORKS_STEPS.map((s, idx) => {
              const isEven = idx % 2 === 1; // Step 2 & 4 are lower on desktop
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`flex flex-col items-center group ${
                    isEven ? "lg:translate-y-16" : "lg:translate-y-0"
                  } transition-transform duration-300`}
                >
                  {/* Illustrated App Window Mockup Card */}
                  <div className="w-full max-w-[250px] sm:max-w-[260px] h-[180px] rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift p-4 flex flex-col justify-between relative overflow-hidden group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300">
                    
                    {/* Mockup Frame Header Bar */}
                    <div className="flex items-center justify-between border-b border-surface-variant/20 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-heading font-black ${s.badgeBg}`}>
                        Step {s.step}
                      </span>
                    </div>

                    {/* Step-specific Stylized Illustrative Content */}
                    <div className="flex-1 flex flex-col justify-center py-2">
                      {idx === 0 && (
                        // Step 1: Category Selection Grid preview
                        <div className="space-y-2">
                          <p className="text-[10px] font-heading font-bold text-on-surface-variant text-center">Select Category</p>
                          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-heading font-bold">
                            <div className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-center truncate">🎓 Student</div>
                            <div className="p-1.5 rounded-xl bg-peach/25 text-[#9E5D28] border border-peach/40 text-center truncate">💼 Working Pro</div>
                            <div className="p-1.5 rounded-xl bg-pink/20 text-[#874959] border border-pink/30 text-center truncate">🍼 Parent</div>
                            <div className="p-1.5 rounded-xl bg-mint/20 text-[#006B56] border border-mint/30 text-center truncate">👵 Senior</div>
                          </div>
                        </div>
                      )}

                      {idx === 1 && (
                        // Step 2: Assessment Check-in preview
                        <div className="space-y-2.5">
                          <p className="text-[10px] font-heading font-bold text-on-surface text-center">How is your stress level today?</p>
                          <div className="flex justify-center gap-1 text-[9px] font-heading font-bold">
                            <span className="px-2.5 py-1 rounded-full bg-mint/20 text-[#006B56] border border-mint/30">🌸 Calm</span>
                            <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">✨ Moderate</span>
                            <span className="px-2.5 py-1 rounded-full bg-pink/20 text-[#874959] border border-pink/30">🌊 High</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[65%] rounded-full" />
                          </div>
                        </div>
                      )}

                      {idx === 2 && (
                        // Step 3: Sanctuary Dashboard preview
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/20 text-[9px] font-bold">
                            <span className="text-primary">✨ Daily Score</span>
                            <span className="text-on-surface">84 / 100</span>
                          </div>
                          <div className="p-2 rounded-xl bg-surface-container-low border border-surface-variant/30 text-[9px] text-on-surface-variant italic font-normal">
                            &quot;AI Companion: Hello! Ready to reflect today?&quot;
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-emerald-600">
                            <span>🫁 2-Min Reset</span>
                            <span>📝 Journal</span>
                          </div>
                        </div>
                      )}

                      {idx === 3 && (
                        // Step 4: Wellness Activity Screen preview
                        <div className="space-y-2 text-center">
                          <div className="w-10 h-10 mx-auto rounded-full bg-mint/25 text-[#006B56] border border-mint/40 flex items-center justify-center font-bold text-sm shadow-xs">
                            ✨
                          </div>
                          <p className="text-[10px] font-heading font-bold text-on-surface">Deep Unwind Session</p>
                          <div className="w-3/4 mx-auto h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-mint w-[80%] rounded-full" />
                          </div>
                          <p className="text-[8px] font-bold text-emerald-600">+18% Resilience Growth</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description Below Mockup Card */}
                  <div className="text-center mt-5 space-y-1.5">
                    <h3 className="font-heading font-black text-lg text-on-surface group-hover:text-primary transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-normal max-w-[240px] mx-auto">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ==================== 5. INTERACTIVE FEATURE SHOWCASE ==================== */}
      <section id="features" className="py-20 md:py-28 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
              Integrated Tools
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
              Everything You Need for Mindful Wellbeing
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant">
              Tap or swipe through our 8 core pillars to explore personalized guidance, peer support, and clinical toolkits.
            </p>
          </div>

          {/* Horizontal Pill Tab Bar with Left/Right Scroll Arrows */}
          <div className="relative flex items-center gap-2 max-w-full">
            <button
              onClick={() => scrollFeatureTabs("left")}
              className="hidden sm:flex w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all items-center justify-center shrink-0 shadow-xs cursor-pointer"
              aria-label="Scroll tabs left"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            <div
              ref={featureTabsRef}
              className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full"
            >
              {FEATURE_TABS.map((tab, idx) => {
                const isActive = activeFeatureTab === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(idx)}
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs font-heading font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-on-surface text-white shadow-md scale-[1.02]"
                        : "bg-surface-container-lowest border border-surface-variant/40 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollFeatureTabs("right")}
              className="hidden sm:flex w-10 h-10 rounded-full bg-surface-container-lowest border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all items-center justify-center shrink-0 shadow-xs cursor-pointer"
              aria-label="Scroll tabs right"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          {/* Full-Bleed Animated Feature Panel with Swipe Gestures & Controls */}
          <AnimatePresence mode="wait">
            {(() => {
              const tab = FEATURE_TABS[activeFeatureTab];
              const isMockupLeft = tab.mockupSide === "left";

              return (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    if (touchStartX === null) return;
                    const touchEndX = e.changedTouches[0].clientX;
                    const diff = touchStartX - touchEndX;
                    if (Math.abs(diff) > 40) {
                      if (diff > 0) handleNextFeature();
                      else handlePrevFeature();
                    }
                    setTouchStartX(null);
                  }}
                  className={`p-6 sm:p-8 md:p-12 rounded-[32px] border ${tab.panelBg} ${tab.panelBorder} shadow-card-lift min-h-[440px] flex flex-col justify-between`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
                    
                    {/* Mockup Column */}
                    <div className={`lg:col-span-6 ${isMockupLeft ? "lg:order-1" : "lg:order-2"}`}>
                      {tab.id === "ai" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-xl space-y-4">
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
                              <div className="max-w-[90%] sm:max-w-[85%] p-3 rounded-2xl rounded-tr-xs bg-primary text-white font-medium shadow-xs leading-relaxed">
                                I get so stressed before exams. It feels like my mind won&apos;t quiet down.
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="max-w-[90%] sm:max-w-[85%] p-3 rounded-2xl rounded-tl-xs bg-surface-container-low border border-surface-variant/30 text-on-surface font-medium leading-relaxed">
                                I hear you. Exam pressure can feel overwhelming. Let&apos;s take a slow deep breath together right now and break down tonight into manageable steps.
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

                      {tab.id === "human" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-peach/40 shadow-xl space-y-4">
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
                            <button className="px-4 py-2 rounded-full bg-[#9E5D28] text-white font-heading font-bold text-xs shadow-xs shrink-0">
                              Start Chat Session
                            </button>
                          </div>
                        </div>
                      )}

                      {tab.id === "pro" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-pink/30 shadow-xl space-y-4">
                          <div className="flex items-center gap-3 border-b border-surface-variant/20 pb-3">
                            <div className="w-12 h-12 rounded-2xl bg-pink/25 text-[#874959] flex items-center justify-center font-bold text-lg shrink-0">
                              Dr
                            </div>
                            <div>
                              <h4 className="font-heading font-extrabold text-sm text-on-surface">Dr. Ananya Roy, Psy.D.</h4>
                              <p className="text-xs text-primary font-semibold">Licensed Clinical Psychologist</p>
                              <p className="text-[10px] text-on-surface-variant/70">8+ Years Exp • CBT & Anxiety Specialist</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-pink/15 text-[#874959] text-[10px] font-bold">Anxiety & Burnout</span>
                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">Relationships</span>
                          </div>
                          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant/30 flex items-center justify-between text-xs">
                            <span className="font-medium text-on-surface">Next Available: <strong>Tomorrow at 4:00 PM</strong></span>
                            <span className="material-symbols-outlined text-primary text-base">video_camera_front</span>
                          </div>
                          <button className="w-full py-3 rounded-full bg-[#874959] text-white font-heading font-bold text-xs shadow-xs">
                            Book 1-on-1 Session
                          </button>
                        </div>
                      )}

                      {tab.id === "mood" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-pink/30 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                            <h4 className="font-heading font-extrabold text-sm text-on-surface">Daily Mood Check-in</h4>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">Resilience: 84%</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-heading font-bold">
                            <div className="p-2.5 rounded-xl bg-mint/20 text-[#006B56] border border-mint/40">🌸 Calm</div>
                            <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30">✨ Hopeful</div>
                            <div className="p-2.5 rounded-xl bg-peach/25 text-[#9E5D28] border border-peach/40">🌙 Thoughtful</div>
                            <div className="p-2.5 rounded-xl bg-pink/20 text-[#874959] border border-pink/30">🌊 Stressed</div>
                          </div>
                          <div className="space-y-1 pt-2">
                            <div className="flex justify-between text-[10px] text-on-surface-variant font-bold">
                              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                            <div className="flex items-end justify-between h-14 pt-2">
                              <div className="w-5 bg-primary/20 h-8 rounded-t-md" />
                              <div className="w-5 bg-primary/40 h-10 rounded-t-md" />
                              <div className="w-5 bg-primary/60 h-12 rounded-t-md" />
                              <div className="w-5 bg-primary h-14 rounded-t-md" />
                              <div className="w-5 bg-primary/80 h-11 rounded-t-md" />
                              <div className="w-5 bg-mint/60 h-13 rounded-t-md" />
                              <div className="w-5 bg-mint h-14 rounded-t-md" />
                            </div>
                          </div>
                          <p className="text-[11px] text-on-surface-variant bg-pink/10 p-2.5 rounded-xl font-medium">
                            💡 <strong>Pattern Recognized:</strong> Your calm score rises by +18% on days with evening reflections.
                          </p>
                        </div>
                      )}

                      {tab.id === "journal" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-pale-yellow/80 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-heading font-bold bg-pale-yellow/60 text-[#8A6D14]">
                              📝 Daily Reflection
                            </span>
                            <span className="text-[10px] text-on-surface-variant/70 font-medium">Today • 8:30 PM</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-pale-yellow/70 space-y-2">
                            <p className="text-xs font-heading font-bold text-[#8A6D14]">What brought you a moment of quiet joy today?</p>
                            <p className="text-xs text-on-surface leading-relaxed italic font-normal">
                              &quot;Finished the team presentation on time and spent 20 minutes walking in the evening air with coffee. Felt genuinely peaceful.&quot;
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-center gap-2 text-[11px] text-primary font-medium">
                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                            <span>AI Insight: Acknowledging small wins is strengthening your daily calm.</span>
                          </div>
                        </div>
                      )}

                      {tab.id === "meditation" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-mint/40 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-mint text-xl font-bold">graphic_eq</span>
                              <h4 className="font-heading font-extrabold text-sm text-on-surface">Now Playing</h4>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-mint/20 text-[#006B56]">
                              8 Min Breathwork
                            </span>
                          </div>
                          <div className="text-center space-y-1 py-1">
                            <h5 className="font-heading font-bold text-base text-on-surface">Deep Night Unwind</h5>
                            <p className="text-xs text-on-surface-variant">Guided Body Scan & Soothing Rain</p>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-mint w-[45%] rounded-full" />
                            </div>
                            <div className="flex justify-between text-[10px] text-on-surface-variant/70 font-medium">
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

                      {tab.id === "community" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-primary/20 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-xl font-bold">groups</span>
                              <h4 className="font-heading font-extrabold text-sm text-on-surface">Student Lounge Circle</h4>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-heading font-bold bg-primary/10 text-primary">
                              Moderated Space
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

                      {tab.id === "resources" && (
                        <div className="w-full p-4 sm:p-6 rounded-[28px] bg-surface-container-lowest border border-secondary/20 shadow-xl space-y-4">
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

                    {/* Text Column */}
                    <div className={`lg:col-span-6 space-y-6 ${isMockupLeft ? "lg:order-2" : "lg:order-1"}`}>
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-surface-container-lowest text-on-surface border border-surface-variant/40 uppercase tracking-widest inline-block shadow-xs">
                        {tab.badge}
                      </span>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-on-surface tracking-tight leading-tight">
                        {tab.headline}
                      </h3>

                      <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-normal">
                        {tab.description}
                      </p>

                      <div className="pt-2">
                        <button
                          onClick={handleGetStarted}
                          className="px-7 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>{tab.cta}</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Feature Navigation Bar (Prev / Next Arrows + Counter) */}
                  <div className="flex items-center justify-between border-t border-surface-variant/20 pt-5 mt-8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevFeature}
                        className="px-4 py-2 rounded-full bg-surface-container-lowest border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 text-xs font-heading font-bold shadow-xs cursor-pointer"
                        aria-label="Previous feature"
                      >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        <span className="hidden sm:inline">Previous</span>
                      </button>
                      <button
                        onClick={handleNextFeature}
                        className="px-4 py-2 rounded-full bg-surface-container-lowest border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 text-xs font-heading font-bold shadow-xs cursor-pointer"
                        aria-label="Next feature"
                      >
                        <span className="hidden sm:inline">Next Feature</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>

                    <span className="text-xs font-heading font-bold text-on-surface-variant/70">
                      Feature {activeFeatureTab + 1} of {FEATURE_TABS.length}
                    </span>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </section>

      {/* ==================== 6. BUILT FOR YOU (CATEGORY CAROUSEL SHOWCASE) ==================== */}
      <section id="categories" className="py-20 md:py-28 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4 text-left">
            <p className="text-xs font-heading font-bold text-[#9E5D28] tracking-widest uppercase">
              Category Personalization
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
              Tailored Support for Every Stage of Life
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-normal">
              Manraah isn&apos;t one-size-fits-all. Select your category to unlock personalized conversation styles, tools, and reflection prompts.
            </p>
          </div>

          {/* Desktop Carousel Navigation Controls */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              onClick={() => scrollCategoryCarousel("left")}
              className="w-12 h-12 rounded-full bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button
              onClick={() => scrollCategoryCarousel("right")}
              className="w-12 h-12 rounded-full bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
            <Link
              href="/category-selection"
              className="px-5 py-3 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all ml-2"
            >
              View All Categories →
            </Link>
          </div>
        </div>

        {/* Horizontal Gradient Card Carousel */}
        <div
          ref={categoryCarouselRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-4 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {USER_CATEGORIES.map((cat) => {
            const style = USER_CATEGORY_GRADIENTS[cat.id] || {
              bg: "bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#5FCFB0]",
              badge: "🌿 Wellness Journey",
            };

            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`snap-start shrink-0 w-[270px] sm:w-[310px] h-[360px] sm:h-[400px] rounded-[32px] p-7 relative overflow-hidden flex flex-col justify-between shadow-card-lift hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-white/20`}
              >
                {/* Full-Bleed Background Image */}
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-700 pointer-events-none z-0"
                  />
                ) : (
                  <div className={`absolute inset-0 ${style.bg} z-0`} />
                )}

                {/* Dark Gradient Legibility Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none z-10" />

                {/* Glossy Header: Emoji Badge + Descriptor Badge */}
                <div className="flex items-start justify-between relative z-20">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                    {cat.emoji}
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] font-heading font-extrabold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                    {style.badge}
                  </span>
                </div>

                {/* Bottom Card Content */}
                <div className="relative z-20 space-y-2 text-left">
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight flex items-center justify-between">
                    <span>{cat.name}</span>
                    <span className="material-symbols-outlined text-xl text-white/90 group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed font-normal">
                    {cat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="sm:hidden text-center pt-2">
          <Link
            href="/category-selection"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full text-xs font-heading font-bold bg-primary text-white shadow-xs"
          >
            <span>Explore All Categories</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ==================== 7. PRIVACY & TRUST SECTION (ASYMMETRIC BENTO GRID) ==================== */}
      <section id="trust" className="py-20 md:py-28 bg-[#F2EBFF]/60 border-y border-surface-variant/20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
              Uncompromising Safety
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
              Built on Absolute Privacy & Clinical Integrity
            </h2>
            <p className="text-base sm:text-lg text-on-surface-variant">
              Your mental sanctuary is protected by enterprise-grade security and evidence-based psychological frameworks.
            </p>
          </div>

          {/* Asymmetric Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            
            {/* 1. Large Anchor Visual Centerpiece Tile */}
            <div className="md:col-span-2 lg:col-span-5 rounded-[32px] bg-gradient-to-br from-[#006B56]/15 via-primary/10 to-surface-container-lowest border border-[#006B56]/30 shadow-card-lift p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden space-y-8">
              {/* Subtle Glowing Background Rings */}
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-mint/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

              {/* Calm Pulsing Shield / Lock Badge Illustration */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-6 pt-4">
                <div className="relative flex items-center justify-center">
                  {/* Outer Pulsing Aura */}
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-mint via-primary to-pink blur-md"
                  />
                  {/* Shield Badge Container */}
                  <div className="relative w-20 h-20 rounded-3xl bg-surface-container-lowest border border-white/60 shadow-xl flex items-center justify-center text-[#006B56]">
                    <span className="material-symbols-outlined text-4xl font-extrabold">verified_user</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-heading font-extrabold bg-[#006B56]/15 text-[#006B56] border border-[#006B56]/30 uppercase tracking-wider">
                    Core Security Pledge
                  </span>
                  <p className="text-sm sm:text-base font-heading font-extrabold text-on-surface leading-snug">
                    Privacy isn&apos;t an added feature at Manraah — it&apos;s the sacred foundation every line of code is built upon.
                  </p>
                </div>
              </div>

              {/* Trust Badges Bar */}
              <div className="relative z-10 grid grid-cols-3 gap-2 text-center pt-6 border-t border-surface-variant/20">
                <div className="p-2 rounded-2xl bg-surface-container-lowest/80 border border-surface-variant/30 text-[10px] font-heading font-bold text-on-surface">
                  🔒 256-Bit SSL
                </div>
                <div className="p-2 rounded-2xl bg-surface-container-lowest/80 border border-surface-variant/30 text-[10px] font-heading font-bold text-on-surface">
                  🛡️ HIPAA Standard
                </div>
                <div className="p-2 rounded-2xl bg-surface-container-lowest/80 border border-surface-variant/30 text-[10px] font-heading font-bold text-on-surface">
                  👁️ Zero Ad Tracking
                </div>
              </div>
            </div>

            {/* 2. Right Column Stack: Zero-Knowledge Encryption & Complete Anonymity */}
            <div className="md:col-span-2 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              
              {/* Tile 1: Zero-Knowledge Encryption */}
              <div className="p-8 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-mint/20 text-[#006B56] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">lock</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-xl text-on-surface">Zero-Knowledge Encryption</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                    All personal reflections, journal entries, and chat logs are encrypted end-to-end. Your private thoughts belong only to you — never sold or used for advertising.
                  </p>
                </div>
              </div>

              {/* Tile 2: Complete Anonymity */}
              <div className="p-8 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">visibility_off</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-xl text-on-surface">Complete Anonymity</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                    Participate in community groups, peer chats, and AI sessions with an avatar and nickname. No real name or intrusive personal details required.
                  </p>
                </div>
              </div>

            </div>

            {/* 3. Full-Width Grounding Banner Tile (Evidence-Based Frameworks) */}
            <div className="md:col-span-2 lg:col-span-12 p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-pink/30 shadow-card-lift hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-pink/20 text-[#874959] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-3xl font-bold">psychology</span>
                </div>
                <div className="space-y-1.5 max-w-3xl">
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-on-surface">
                    Evidence-Based Frameworks
                  </h3>
                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                    Our guided exercises and AI prompts integrate Cognitive Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction (MBSR), and positive psychology principles.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-extrabold bg-pink/15 text-[#874959] border border-pink/30">
                  CBT • MBSR • Positive Psych
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== ABOUT US & MISSION SECTION ==================== */}
      <section id="about" className="py-20 md:py-28 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* ═══ LEFT / TOP: TEXT-FORWARD MISSION STATEMENT ═══ */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest inline-block">
                About Manraah
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface leading-tight tracking-tight">
                Built for Real Human Wellbeing
              </h2>
              <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-normal">
                &quot;Manraah&quot; stands for <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">Strong Minds</span>. We are on a mission to bridge advanced AI companionship with genuine human empathy so no one has to navigate life&apos;s challenges alone.
              </p>
            </div>

            {/* ═══ RIGHT / BOTTOM: CONNECTED VERTICAL ICON-LIST ═══ */}
            <div className="lg:col-span-7 lg:border-l lg:border-surface-variant/50 lg:pl-12 xl:pl-16">
              <div className="relative space-y-8 sm:space-y-10">
                {/* Continuous Connecting Vertical Line */}
                <div 
                  className="absolute left-6 top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary/30 via-mint/40 to-peach/40 -translate-x-1/2 pointer-events-none" 
                  aria-hidden="true"
                />

                {/* Point 1: Zero Data Selling */}
                <div className="relative flex items-start gap-5 sm:gap-6 group text-left">
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl font-bold">shield_person</span>
                  </div>
                  <div className="pt-0.5 space-y-1">
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-on-surface">
                      Zero Data Selling
                    </h3>
                    <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                      Your private reflections and journal entries remain encrypted. We will never sell, rent, or monetize your emotional data.
                    </p>
                  </div>
                </div>

                {/* Point 2: CBT & MBSR Frameworks */}
                <div className="relative flex items-start gap-5 sm:gap-6 group text-left">
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-mint/25 text-[#006B56] border border-mint/30 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-[#006B56] group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl font-bold">psychology</span>
                  </div>
                  <div className="pt-0.5 space-y-1">
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-on-surface">
                      CBT &amp; MBSR Frameworks
                    </h3>
                    <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                      Our AI companion prompt architecture is built alongside evidence-based Cognitive Behavioral Therapy principles for safe, uplifting guidance.
                    </p>
                  </div>
                </div>

                {/* Point 3: AI + Human Companion */}
                <div className="relative flex items-start gap-5 sm:gap-6 group text-left">
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-peach/30 text-[#9E5D28] border border-peach/40 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:bg-[#9E5D28] group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl font-bold">groups</span>
                  </div>
                  <div className="pt-0.5 space-y-1">
                    <h3 className="font-heading font-extrabold text-lg sm:text-xl text-on-surface">
                      AI + Human Companion
                    </h3>
                    <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                      Instant 24/7 AI availability backed by real peer listeners and verified professional therapists whenever you need deeper care.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 8. WELLNESS SCORE PREVIEW ==================== */}
      <section className="py-20 md:py-28 px-4 sm:px-6 max-w-7xl mx-auto border-t border-surface-variant/30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ═══ LEFT: TEXT & CTA CONTENT ═══ */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-heading font-bold text-[#874959] tracking-widest uppercase">
                Interactive Score Teaser
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface leading-tight tracking-tight">
                Visualize Your Mind&apos;s Daily Progress
              </h2>
              <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-normal">
                Get a clear, compassionate snapshot of your mental wellbeing with your personalized Wellness Score. Track stress resilience, emotional clarity, and sleep trends over time.
              </p>
            </div>

            <div className="pt-1 w-full sm:w-auto">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Take Your First Check-in</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* ═══ RIGHT: REALISTIC BROWSER MOCKUP WITH ANIMATED METRICS ═══ */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div 
              ref={scoreRef}
              className="w-full max-w-xl rounded-[24px] sm:rounded-[32px] overflow-hidden border border-surface-variant/40 shadow-card-lift bg-surface-container-lowest text-left transform transition-all duration-700"
            >
              {/* Browser Chrome Top Bar */}
              <div className="bg-[#24212D] px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-white/10 select-none">
                {/* Window control dots */}
                <div className="flex items-center gap-2">
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-[#27C93F]" />
                </div>

                {/* URL / Tab Address Bar */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] sm:text-[11px] font-mono text-white/70 max-w-[190px] sm:max-w-xs truncate">
                  <span className="material-symbols-outlined text-[13px] text-emerald-400">lock</span>
                  <span className="truncate">app.manraah.com/dashboard</span>
                </div>

                {/* Subtle Controls */}
                <div className="flex items-center gap-1.5 text-white/30">
                  <span className="material-symbols-outlined text-xs sm:text-sm">dashboard</span>
                </div>
              </div>

              {/* Browser Content Area: Score Card with Animated Numbers & Bars */}
              <div className="p-5 sm:p-7 md:p-8 space-y-6 bg-surface-container-lowest">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-surface-variant/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center font-bold">
                      🌿
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-on-surface">Daily Wellness Score</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Updated 5 minutes ago</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-mint/20 text-[#006B56]">
                    Balanced state
                  </span>
                </div>

                {/* Big Score Display */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface-container/50 p-5 sm:p-6 rounded-[24px] gap-4">
                  <div>
                    <span className="text-xs font-heading font-bold text-on-surface-variant uppercase tracking-wider">
                      Overall Score
                    </span>
                    <div className="text-4xl sm:text-5xl font-heading font-black text-primary mt-1">
                      <AnimatedScoreCounter target={84} inView={scoreInView} />{" "}
                      <span className="text-lg font-normal text-on-surface-variant">/ 100</span>
                    </div>
                  </div>
                  {/* Thick Progress bar with animated fill */}
                  <div className="w-full sm:w-44 h-3.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-mint via-primary/80 to-primary rounded-full transition-all duration-1200 ease-out"
                      style={{ width: scoreInView ? "84%" : "0%" }}
                    />
                  </div>
                </div>

                {/* Metric Breakdown Grid (1-column on mobile, 2-column on tablet/desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-heading">
                  {/* Stress Resilience */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container/30 border border-surface-variant/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium">Stress Resilience</span>
                      <p className="font-bold text-sm text-on-surface">
                        <AnimatedScoreCounter target={88} inView={scoreInView} />% (Optimal)
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1200 ease-out"
                        style={{ width: scoreInView ? "88%" : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Emotional Balance */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container/30 border border-surface-variant/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium">Emotional Balance</span>
                      <p className="font-bold text-sm text-on-surface">
                        <AnimatedScoreCounter target={82} inView={scoreInView} />% (Steady)
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1200 ease-out"
                        style={{ width: scoreInView ? "82%" : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Mindfulness Habit */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container/30 border border-surface-variant/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium">Mindfulness Habit</span>
                      <p className="font-bold text-sm text-on-surface">
                        <AnimatedScoreCounter target={85} inView={scoreInView} />% (High)
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-mint rounded-full transition-all duration-1200 ease-out"
                        style={{ width: scoreInView ? "85%" : "0%" }}
                      />
                    </div>
                  </div>

                  {/* Restful Sleep */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container/30 border border-surface-variant/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant font-medium">Restful Sleep</span>
                      <p className="font-bold text-sm text-on-surface">
                        <AnimatedScoreCounter target={80} inView={scoreInView} />% (Good)
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-peach rounded-full transition-all duration-1200 ease-out"
                        style={{ width: scoreInView ? "80%" : "0%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Personalized Insight */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-start sm:items-center gap-3 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5 sm:mt-0">lightbulb</span>
                  <span>
                    <strong>Personalized Insight:</strong> You&apos;re showing steady progress in managing stress during busy work hours this week!
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== TESTIMONIALS SECTION (CONTINUOUS AUTO-SCROLLING MARQUEE) ==================== */}
      <section id="testimonials" className="py-20 md:py-28 overflow-hidden border-t border-surface-variant/20">
        <div className="text-center max-w-3xl mx-auto mb-14 px-6 space-y-4">
          <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
            Real Perspectives &amp; Reflections
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
            Built With Real People In Mind
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto">
            How individuals across students, parents, couples, and working professionals find daily moments of calm and emotional grounding with Manraah.
          </p>
        </div>

        {/* Marquee Wrapper with edge gradient fade masks */}
        <div className="relative w-full overflow-hidden space-y-6 select-none">
          {/* Left/Right Edge Gradient Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-surface to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-surface to-transparent z-20" />

          {/* Top Marquee Row (Continuous left scroll) */}
          <div className="flex animate-marquee pause-on-hover gap-6 items-stretch py-2">
            {[...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_1].map((item, idx) => (
              <div
                key={`row1-${idx}`}
                className="w-[300px] sm:w-[380px] shrink-0 p-6 sm:p-7 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-ambient hover:shadow-card-lift hover:border-primary/30 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                      {"★".repeat(5)}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed font-medium">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-variant/20 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${item.avatarBg} font-heading font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-on-surface leading-tight">
                      {item.role}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                      {item.reflection}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Marquee Row (Continuous right scroll) - Hidden on mobile, shown on tablet/desktop */}
          <div className="hidden sm:flex animate-marquee-reverse pause-on-hover gap-6 items-stretch py-2">
            {[...TESTIMONIALS_ROW_2, ...TESTIMONIALS_ROW_2].map((item, idx) => (
              <div
                key={`row2-${idx}`}
                className="w-[300px] sm:w-[380px] shrink-0 p-6 sm:p-7 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-ambient hover:shadow-card-lift hover:border-primary/30 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400 text-sm">
                      {"★".repeat(5)}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold ${item.badgeStyle}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-on-surface leading-relaxed font-medium">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-variant/20 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${item.avatarBg} font-heading font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                    {item.initial}
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-on-surface leading-tight">
                      {item.role}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                      {item.reflection}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==================== 9. FAQ ACCORDION ==================== */}
      <section id="faq" className="py-20 md:py-28 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6">
        <div className="max-w-4xl mx-auto space-y-14">
          <div className="text-center space-y-4">
            <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
              Frequently Asked Questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface">
              Everything You Need to Know
            </h2>
            <p className="text-base text-on-surface-variant">
              Got questions before getting started? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 shadow-ambient overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-6 text-left font-heading font-bold text-base sm:text-lg text-on-surface flex items-center justify-between gap-4"
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
                        className="px-6 pb-6 pt-0 text-sm text-on-surface-variant leading-relaxed font-normal"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 10. FINAL CTA BAND ==================== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white px-6 text-center relative overflow-hidden">
        {/* Subtle Atmospheric Glow Blobs for Depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[320px] bg-primary-purple/30 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-mint/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-pink/20 rounded-full blur-3xl pointer-events-none" />

        {/* Faint Brand Emblem Motif in Background (Low Opacity) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] text-white overflow-hidden">
          <svg viewBox="0 0 100 100" className="w-[520px] h-[520px] fill-current">
            <path d="M50 15 C40 30, 45 60, 50 85 C55 60, 60 30, 50 15 Z" />
            <path d="M50 35 C30 45, 30 65, 50 85 C70 65, 70 45, 50 35 Z" opacity="0.75" />
            <path d="M50 50 C20 55, 15 70, 50 85 C85 70, 80 55, 50 50 Z" opacity="0.5" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Your Sanctuary for Mind is Just One Step Away
          </h2>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal">
            Join individuals building daily emotional clarity, resilience, and peace with Manraah.
          </p>

          <div className="pt-2">
            <button
              onClick={handleGetStarted}
              className="px-10 py-4.5 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-extrabold text-base shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started Free Now</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 11. FOOTER ==================== */}
      <footer className="bg-[#262235] text-surface/90 pt-16 pb-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 text-sm">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-5 text-left">
              <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
                <Logo variant="white" size="md" className="h-8 sm:h-9" />
              </Link>
              <p className="text-xs text-white/70 leading-relaxed max-w-sm">
                A private, compassionate mental wellness sanctuary combining 24/7 AI companion care, verified peer listeners, licensed therapists, and category-based personalization.
              </p>

              {/* Social Media Links */}
              <div className="pt-1">
                <p className="text-[11px] font-heading font-bold text-white/50 uppercase tracking-wider mb-2.5">Follow Our Journey</p>
                <div className="flex items-center gap-2">
                  <a
                    href="#"
                    aria-label="X (Twitter)"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                  >
                    𝕏
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </a>
                  <a
                    href="#"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">work</span>
                  </a>
                  <a
                    href="#"
                    aria-label="Community"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors text-xs"
                  >
                    <span className="material-symbols-outlined text-sm">forum</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-3 text-left">
              <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><Link href="/ai-chat" className="hover:text-white transition-colors">AI Companion</Link></li>
                <li><Link href="/human-companion" className="hover:text-white transition-colors">Human Companion</Link></li>
                <li><Link href="/professional-care" className="hover:text-white transition-colors">Professional Care</Link></li>
                <li><Link href="/checkin" className="hover:text-white transition-colors">Mood Tracker</Link></li>
                <li><Link href="/journal" className="hover:text-white transition-colors">Reflective Journal</Link></li>
              </ul>
            </div>

            {/* Categories Links */}
            <div className="space-y-3 text-left">
              <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><button onClick={() => handleSelectCategory("student")} className="hover:text-white transition-colors text-left">Students</button></li>
                <li><button onClick={() => handleSelectCategory("working_professional")} className="hover:text-white transition-colors text-left">Working Professionals</button></li>
                <li><button onClick={() => handleSelectCategory("parent")} className="hover:text-white transition-colors text-left">Parents</button></li>
                <li><button onClick={() => handleSelectCategory("couple")} className="hover:text-white transition-colors text-left">Couples</button></li>
                <li><button onClick={() => handleSelectCategory("other")} className="hover:text-white transition-colors text-left">Other Life Paths</button></li>
              </ul>
            </div>

            {/* Trust & Legal Links */}
            <div className="space-y-3 text-left">
              <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wider">Trust &amp; Legal</h4>
              <ul className="space-y-2 text-xs text-white/70">
                <li><a href="#trust" className="hover:text-white transition-colors">Privacy &amp; Encryption</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><button onClick={handleGetStarted} className="hover:text-white transition-colors text-left">Get Started</button></li>
              </ul>
            </div>
          </div>

          {/* Calm Crisis Helpline Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/75 space-y-1.5 text-left">
            <div className="font-heading font-bold text-white/90 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-mint">favorite</span>
              <span>24/7 Immediate Support Notice</span>
            </div>
            <p className="leading-relaxed">
              If you or someone you know is in immediate crisis or emotional distress, please reach out to professional emergency resources: call <span className="font-bold text-white underline decoration-white/30">[National Crisis Helpline Placeholder — e.g., 988 in US/Canada, 14416 Tele-MANAS in India, or 112 in EU]</span>. Manraah is an everyday supportive wellness companion, not an emergency medical intervention service.
            </p>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
            <p>© 2026 Manraah. All rights reserved.</p>
            <p className="flex items-center gap-1">
              <span>Crafted with compassion for mind &amp; soul</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
