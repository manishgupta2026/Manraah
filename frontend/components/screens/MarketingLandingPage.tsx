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
    quote: "Navigating a major life transition felt isolating. Having an anonymous, private retreat where I can journal and process uncertainty has been deeply grounding.",
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

// Top Hero Showcase Carousel Images (Editorial Showcase with Square 1:1 Aspect Ratio)
const HERO_CAROUSEL_IMAGES = [
  {
    src: "/social/1.png",
    alt: "Manraah Social Reflection 1",
    title: "Quiet Your Racing Thoughts",
    subtitle: "A gentle 24/7 AI retreat ready to listen without judgment whenever your mind feels loud.",
    tag: "AI Retreat",
    cta: "Find Stillness Tonight",
  },
  {
    src: "/social/2.png",
    alt: "Manraah Social Reflection 2",
    title: "Release Daily Overwhelm",
    subtitle: "Ground your nervous system in two minutes with guided mindful breathing and emotional resets.",
    tag: "Burnout Reset",
    cta: "Take a Deep Breath",
  },
  {
    src: "/social/3.png",
    alt: "Manraah Social Reflection 3",
    title: "Space to Feel & Be Heard",
    subtitle: "Connect with trained peer listeners who truly understand your exact stage in life.",
    tag: "Peer Empathy",
    cta: "Connect With a Listener",
  },
  {
    src: "/social/4.png",
    alt: "Manraah Social Reflection 4",
    title: "Gentle Healing Everyday",
    subtitle: "Track your emotional rhythm and build mental resilience through private daily check-ins.",
    tag: "Self Compassion",
    cta: "Start Your Check-in",
  },
  {
    src: "/social/5.png",
    alt: "Manraah Social Reflection 5",
    title: "Reclaim Your Inner Peace",
    subtitle: "Release mental clutter with encrypted voice journaling and reflective prompts.",
    tag: "Mindful Living",
    cta: "Open Your Journal",
  },
  {
    src: "/social/6.png",
    alt: "Manraah Social Reflection 6",
    title: "Rest Deeply Tonight",
    subtitle: "Unwind your body and mind with soothing bedtime soundscapes and sleep audio.",
    tag: "Bedtime Rest",
    cta: "Listen to Soundscape",
  },
  {
    src: "/social/7.png",
    alt: "Manraah Social Reflection 7",
    title: "You Are Never Alone",
    subtitle: "Anonymous, moderated peer circles where you can share reflections safely.",
    tag: "Safe Circles",
    cta: "Explore Circles",
  },
  {
    src: "/social/9.png",
    alt: "Manraah Social Reflection 9",
    title: "Personalized Care for You",
    subtitle: "Direct access to certified clinical psychologists whenever deeper support is needed.",
    tag: "Clinical Care",
    cta: "Connect to Care",
  },
  {
    src: "/social/10.png",
    alt: "Manraah Social Reflection 10",
    title: "Ground Your Nervous System",
    subtitle: "Evidence-based 5-4-3-2-1 toolkits designed by clinical psychologists for panic de-escalation.",
    tag: "Emergency Relief",
    cta: "Open Grounding Guide",
  },
  {
    src: "/social/11.png",
    alt: "Manraah Social Reflection 11",
    title: "Grow at Your Own Rhythm",
    subtitle: "Tailored daily support calibrated for Students, Working Professionals, Parents, and Couples.",
    tag: "Life Pathways",
    cta: "Choose Your Path",
  },
];

export default function MarketingLandingPage() {
  const router = useRouter();
  const [selectedMoodIdx, setSelectedMoodIdx] = useState<number | null>(null);
  const [activeHeroSlide, setActiveHeroSlide] = useState<number>(0);
  const [isHeroCarouselHovered, setIsHeroCarouselHovered] = useState<boolean>(false);
  const [heroTouchStartX, setHeroTouchStartX] = useState<number | null>(null);
  const categoryCarouselRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-advance hero carousel every 3.2 seconds (pausing when hovered)
  useEffect(() => {
    if (isHeroCarouselHovered) return;
    const interval = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isHeroCarouselHovered]);

  const handleNextHeroSlide = () => {
    setActiveHeroSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
  };

  const handlePrevHeroSlide = () => {
    setActiveHeroSlide((prev) => (prev - 1 + HERO_CAROUSEL_IMAGES.length) % HERO_CAROUSEL_IMAGES.length);
  };

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    setHeroTouchStartX(e.touches[0].clientX);
  };

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (heroTouchStartX === null) return;
    const diffX = heroTouchStartX - e.changedTouches[0].clientX;
    if (diffX > 40) {
      handleNextHeroSlide();
    } else if (diffX < -40) {
      handlePrevHeroSlide();
    }
    setHeroTouchStartX(null);
  };

  const scrollCategoryCarousel = (direction: "left" | "right") => {
    if (categoryCarouselRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      categoryCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
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
    if (catId === "working_professional" || catId === "working-professional") {
      router.push("/onboarding/working-professional");
    } else {
      router.push("/category-selection");
    }
  };

  const currentSlide = HERO_CAROUSEL_IMAGES[activeHeroSlide];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans select-none overflow-x-hidden">
      {/* ==================== 1. TOP HERO FULL-WIDTH PANORAMIC CAROUSEL ==================== */}
      <section className="relative w-full overflow-hidden">
        <div
          onMouseEnter={() => setIsHeroCarouselHovered(true)}
          onMouseLeave={() => setIsHeroCarouselHovered(false)}
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
          className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[540px] bg-surface-container-high overflow-hidden select-none"
        >
          {/* Active Image Slide Transition */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.src}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Soft Ambient Blurred Fill Background for Ultrawide Displays */}
              <img
                src={currentSlide.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
              />
              {/* Main Full-Bleed Panoramic Hero Image */}
              <img
                src={currentSlide.src}
                alt={currentSlide.alt}
                className="relative z-0 w-full h-full object-cover select-none"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>

          {/* Bottom Atmosphere Gradient Fade (Blends seamlessly into the page background below) */}
          <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-surface via-surface/65 to-transparent pointer-events-none z-10" />

          {/* Floating Left Navigation Button */}
          <button
            onClick={handlePrevHeroSlide}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-8 md:left-12 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-on-surface shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-20 border border-white/50 opacity-85 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_left</span>
          </button>

          {/* Floating Right Navigation Button */}
          <button
            onClick={handleNextHeroSlide}
            aria-label="Next slide"
            className="absolute right-3 sm:right-8 md:right-12 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 hover:bg-white text-on-surface shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-20 border border-white/50 opacity-85 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-xl sm:text-2xl">chevron_right</span>
          </button>

          {/* Floating Bottom Center Pill with Dots */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-md border border-white/70 flex items-center gap-2 transition-all">
            {HERO_CAROUSEL_IMAGES.map((_, idx) => {
              const isActive = activeHeroSlide === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveHeroSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "w-2.5 h-2.5 bg-[#5F4EA5] scale-110 shadow-xs"
                      : "w-2 h-2 bg-[#D1CADF] hover:bg-[#5F4EA5]/50"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 2. HERO SECTION — INTERACTIVE MOOD CHECK-IN, HEADLINE & CTAs ═══ */}
      <section className="relative pt-2 pb-16 md:pb-24 px-6 max-w-5xl mx-auto">

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
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>A Retreat for Mind &amp; Soul</span>
          </motion.div>

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
                        : "bg-surface-container-lowest border-surface-variant/40 hover:bg-surface-container hover:border-surface-variant/60 hover:scale-[1.04]"
                    }`}
                  >
                    <span className={`text-2xl sm:text-3xl leading-none transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                      {mood.emoji}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-heading font-bold leading-none ${
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

            <Link
              href="/how-it-works"
              className="px-8 py-4 rounded-full bg-surface-container border border-surface-variant/40 font-heading font-semibold text-sm text-on-surface text-center hover:bg-primary/5 hover:-translate-y-0.5 transition-all"
            >
              See How It Works
            </Link>
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

        {/* ── Trust Badges Strip ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 lg:mt-20 max-w-6xl mx-auto"
        >
          {TRUST_BADGES.map((b, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`p-5 rounded-[24px] bg-surface-container-lowest border ${b.border} shadow-ambient hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between h-36 text-left`}
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
                      End-to-end encrypted, avatar-first — your retreat stays completely yours.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* ==================== 6. BUILT FOR YOU (CATEGORY CAROUSEL SHOWCASE) ==================== */}
      <section id="categories" className="py-12 md:py-16 bg-[#F2EBFF]/60 border-y border-surface-variant/20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3 text-left">
              <p className="text-xs font-heading font-bold text-[#9E5D28] tracking-widest uppercase">
                Category Personalization
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
                Tailored Support for Every Stage of Life
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed font-normal">
                Manraah isn&apos;t one-size-fits-all. Select your category to unlock personalized conversation styles, tools, and reflection prompts.
              </p>
            </div>

            {/* Desktop Carousel Navigation Controls */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <button
                onClick={() => scrollCategoryCarousel("left")}
                className="w-11 h-11 rounded-full bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Scroll left"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => scrollCategoryCarousel("right")}
                className="w-11 h-11 rounded-full bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Scroll right"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
              <Link
                href="/category-selection"
                className="px-5 py-2.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all ml-2"
              >
                View All Categories →
              </Link>
            </div>
          </div>

          {/* Horizontal Gradient Card Carousel */}
          <div
            ref={categoryCarouselRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
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
                  className={`snap-start shrink-0 w-[270px] sm:w-[310px] h-[340px] sm:h-[380px] rounded-[32px] p-7 relative overflow-hidden flex flex-col justify-between shadow-card-lift hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-white/20`}
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
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform">
                      {cat.emoji}
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-heading font-extrabold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
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

          {/* Explore All Pathways CTA Button */}
          <div className="text-center pt-4">
            <Link
              href="/for-you"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-surface-container-lowest hover:bg-primary/10 text-primary border border-primary/30 font-heading font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <span>Explore All Dedicated Life Stage Pathways</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 7. TESTIMONIALS SECTION (SINGLE CONTINUOUS MARQUEE LINE) ==================== */}
      <section id="testimonials" className="py-12 md:py-16 bg-surface overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-8 px-6 space-y-3">
          <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
            Real Perspectives &amp; Reflections
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-on-surface">
            Built With Real People In Mind
          </h2>
          <p className="text-base text-on-surface-variant max-w-2xl mx-auto">
            How individuals across students, parents, couples, and working professionals find daily moments of calm and emotional grounding with Manraah.
          </p>
        </div>

        {/* Marquee Wrapper with edge gradient fade masks */}
        <div className="relative w-full overflow-hidden select-none">
          {/* Left/Right Edge Gradient Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-32 bg-gradient-to-r from-surface to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-32 bg-gradient-to-l from-surface to-transparent z-20" />

          {/* Single Continuous Marquee Row */}
          <div className="flex animate-marquee pause-on-hover gap-6 items-stretch py-3">
            {[...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_2, ...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_2].map((item, idx) => (
              <div
                key={`single-row-${idx}`}
                className="w-[310px] sm:w-[380px] shrink-0 p-6 sm:p-7 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-ambient hover:shadow-card-lift hover:border-primary/30 transition-all duration-300 flex flex-col justify-between space-y-4"
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

        {/* Read More Stories CTA Button */}
        <div className="text-center pt-6 px-6">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-surface-container-lowest hover:bg-primary/10 text-primary border border-primary/30 font-heading font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <span>Explore All Member Stories &amp; Journeys</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
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
            Your Retreat for Mind is Just One Step Away
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
    </div>
  );
}
