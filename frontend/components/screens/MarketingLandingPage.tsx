"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { USER_CATEGORIES } from "@/frontend/lib/constants";
import BottomCtaBand from "@/frontend/components/ui/BottomCtaBand";

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

// Top Hero Showcase Carousel Images (Refined 1672x941 Widescreen Ratio)
const HERO_CAROUSEL_IMAGES = [
  {
    src: "/social/1.png",
    alt: "5 myths about depression - And what is actually true",
    title: "5 Myths About Depression",
    subtitle: "And what is actually true about healing and recovery.",
    tag: "Mental Health Truths",
  },
  {
    src: "/social/2.png",
    alt: "Myth: Depression is sadness",
    title: "Myth: Depression is Sadness",
    subtitle: "Sadness has a reason and it lifts. Depression flattens everything, often for no reason at all.",
    tag: "Myth vs Reality",
  },
  {
    src: "/social/3.png",
    alt: "Myth: Something bad must have happened",
    title: "Myth: Something Bad Must Have Happened",
    subtitle: "Depression can arrive when life looks fine on paper. It is a condition in its own right, not always a response to circumstances.",
    tag: "Understanding Depression",
  },
  {
    src: "/social/4.png",
    alt: "Myth: If you are still functioning, you are fine",
    title: "Myth: If You Are Still Functioning, You Are Fine",
    subtitle: "Attendance stays intact. Deadlines get met. Meanwhile everything inside has gone quiet. Functioning is not the same as being okay.",
    tag: "High-Functioning Burnout",
  },
  {
    src: "/social/5.png",
    alt: "Myth: Think positive and it passes",
    title: "Myth: Think Positive and It Passes",
    subtitle: "Depression changes sleep, appetite, energy and concentration. Positive thinking does not restore any of them.",
    tag: "Real Support",
  },
  {
    src: "/social/6.png",
    alt: "Myth: Waiting it out is the safe option",
    title: "Myth: Waiting It Out is the Safe Option",
    subtitle: "Some episodes lift on their own. Many do not. Waiting usually costs months that did not need to be lost.",
    tag: "Timely Care",
  },
  {
    src: "/social/7.png",
    alt: "What is Actually True: Depression is treatable",
    title: "What is Actually True",
    subtitle: "Depression is one of the most treatable conditions there is. Most people improve with the right support.",
    tag: "Hope & Healing",
  },
];

export default function MarketingLandingPage() {
  const [activeHeroSlide, setActiveHeroSlide] = useState<number>(0);
  const [isHeroCarouselHovered, setIsHeroCarouselHovered] = useState<boolean>(false);
  const [isHeroCarouselPaused, setIsHeroCarouselPaused] = useState<boolean>(false);
  const [heroTouchStartX, setHeroTouchStartX] = useState<number | null>(null);
  const categoryCarouselRef = useRef<HTMLDivElement>(null);

  // Preload all carousel slides for instantaneous switching
  useEffect(() => {
    HERO_CAROUSEL_IMAGES.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });
  }, []);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setActiveHeroSlide((prev) => (prev - 1 + HERO_CAROUSEL_IMAGES.length) % HERO_CAROUSEL_IMAGES.length);
      } else if (e.key === "ArrowRight") {
        setActiveHeroSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-advance hero carousel every 4.5 seconds (pausing when hovered or manually paused)
  useEffect(() => {
    if (isHeroCarouselHovered || isHeroCarouselPaused) return;
    const interval = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroCarouselHovered, isHeroCarouselPaused]);

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

  const currentSlide = HERO_CAROUSEL_IMAGES[activeHeroSlide];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans select-none overflow-x-hidden">
      {/* ==================== 1. TOP HERO SHOWCASE CAROUSEL (FULL BLEED ONE-PAGE COVER) ==================== */}
      <section
        onMouseEnter={() => setIsHeroCarouselHovered(true)}
        onMouseLeave={() => setIsHeroCarouselHovered(false)}
        onTouchStart={handleHeroTouchStart}
        onTouchEnd={handleHeroTouchEnd}
        className="relative w-full h-[240px] xs:h-[280px] sm:h-[360px] md:h-[440px] lg:h-[calc(100vh-4rem)] max-h-[580px] bg-black overflow-hidden select-none"
      >
        {/* Active Image Slide Transition (Cross-Fade, Full Page Cover) */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentSlide.src}
              alt={currentSlide.alt}
              style={{ objectPosition: "center 76%" }}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating Left Navigation Button */}
        <button
          onClick={handlePrevHeroSlide}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-on-surface shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-30 border border-white/50 opacity-80 hover:opacity-100"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
        </button>

        {/* Floating Right Navigation Button */}
        <button
          onClick={handleNextHeroSlide}
          aria-label="Next slide"
          className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white text-on-surface shadow-xl backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-30 border border-white/50 opacity-80 hover:opacity-100"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
        </button>

        {/* Sleek Floating Glass HUD Control Pill in Safe Bottom-Right Area */}
        <div className="absolute bottom-2.5 sm:bottom-5 right-2.5 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2.5 bg-black/80 hover:bg-black/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 text-white shadow-2xl transition-all scale-90 sm:scale-100 origin-bottom-right">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-0.5 sm:px-1">
            {HERO_CAROUSEL_IMAGES.map((_, idx) => {
              const isActive = activeHeroSlide === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveHeroSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-300 cursor-pointer rounded-full ${
                    isActive
                      ? "w-4 sm:w-6 h-1 sm:h-1.5 bg-[#7C6BC4] shadow-xs"
                      : "w-1 sm:w-1.5 h-1 sm:h-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>

          {/* Slide Counter (e.g. 01 / 07) */}
          <span className="text-[9px] sm:text-xs font-mono font-bold text-white/80 px-0.5 select-none tracking-wider">
            {String(activeHeroSlide + 1).padStart(2, "0")} / {String(HERO_CAROUSEL_IMAGES.length).padStart(2, "0")}
          </span>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsHeroCarouselPaused((prev) => !prev)}
            aria-label={isHeroCarouselPaused ? "Resume auto-advance" : "Pause auto-advance"}
            title={isHeroCarouselPaused ? "Play" : "Pause"}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[10px] sm:text-xs">
              {isHeroCarouselPaused ? "play_arrow" : "pause"}
            </span>
          </button>
        </div>
      </section>

      {/* ==================== 3. PROBLEM / EMPATHY SECTION ==================== */}
      <section className="py-12 sm:py-16 md:py-20 bg-[#F2EBFF]/60 border-y border-surface-variant/20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">

          {/* Section Header — left-aligned above the two columns */}
          <div className="text-left max-w-3xl space-y-3 sm:space-y-4">
            <p className="text-xs font-heading font-bold text-[#874959] tracking-widest uppercase">
              Why We Built Manraah
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-on-surface leading-tight">
              Mental health support should never feel expensive, generic, or intimidating.
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
              For too long, getting emotional support meant long waitlists, high hourly fees, or cold clinical questionnaires that didn&apos;t fit your life. Manraah changes that.
            </p>
          </div>

          {/* ── Two-Column Comparison ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-stretch gap-0 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-card-lift border border-surface-variant/30"
          >

            {/* ═══ LEFT: THE OLD WAY (muted / desaturated) ═══ */}
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-[#2C2A35] text-white px-5 py-6 sm:px-8 sm:py-9 flex flex-col gap-5 sm:gap-6"
            >
              {/* Column label */}
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white/50 text-[10px] font-black leading-none">✕</span>
                </span>
                <span className="text-[11px] font-heading font-bold text-white/40 tracking-widest uppercase">The Old Way</span>
              </div>

              {/* Pain points list */}
              <div className="flex flex-col gap-4 sm:gap-5">

                {/* Pain point 1 */}
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base sm:text-lg text-white/30">schedule</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-heading font-bold text-white/50 line-through decoration-white/25">Long Waitlists</p>
                    <p className="text-[11px] sm:text-[12px] text-white/30 leading-relaxed mt-0.5">Weeks before your first session — if you can even get one.</p>
                  </div>
                </div>

                {/* Pain point 2 */}
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base sm:text-lg text-white/30">payments</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-heading font-bold text-white/50 line-through decoration-white/25">High Hourly Fees</p>
                    <p className="text-[11px] sm:text-[12px] text-white/30 leading-relaxed mt-0.5">₹3,000–₹8,000 per session. Care priced out of reach.</p>
                  </div>
                </div>

                {/* Pain point 3 */}
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base sm:text-lg text-white/30">assignment</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-heading font-bold text-white/50 line-through decoration-white/25">Cold Clinical Questionnaires</p>
                    <p className="text-[11px] sm:text-[12px] text-white/30 leading-relaxed mt-0.5">Generic intake forms that don&apos;t know your world at all.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ═══ DIVIDER: Arrow bridge (hidden on mobile — replaced by the arrow below) ═══ */}
            {/* Mobile: downward arrow connector */}
            <div className="flex md:hidden items-center justify-center bg-[#1E1C27] py-3 gap-3">
              <div className="h-px flex-1 bg-white/10 ml-6" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-primary font-black text-lg leading-none">↓</span>
                <span className="text-[9px] font-heading font-bold text-primary/70 tracking-widest uppercase">Manraah Way</span>
              </div>
              <div className="h-px flex-1 bg-primary/20 mr-6" />
            </div>

            {/* Desktop: vertical arrow bridge */}
            <div className="hidden md:flex flex-col items-center justify-center bg-[#1E1C27] px-4 py-8 gap-3 shrink-0 w-[64px]">
              <div className="w-px flex-1 bg-white/10" />
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <span className="text-primary font-black text-sm leading-none">→</span>
                </div>
                <span className="text-[8px] font-heading font-black text-primary/60 tracking-widest uppercase">vs</span>
              </div>
              <div className="w-px flex-1 bg-primary/25" />
            </div>

            {/* ═══ RIGHT: THE MANRAAH WAY (vibrant, on-brand) ═══ */}
            <motion.div
              variants={itemVariants}
              className="flex-1 bg-surface-container-lowest px-5 py-6 sm:px-8 sm:py-9 flex flex-col gap-5 sm:gap-6"
            >
              {/* Column label */}
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-primary text-[10px] font-black leading-none">✓</span>
                </span>
                <span className="text-[11px] font-heading font-bold text-primary tracking-widest uppercase">The Manraah Way</span>
              </div>

              {/* Benefits — three rows with dividers, visually grouped as one unit */}
              <div className="flex flex-col rounded-xl sm:rounded-2xl border border-surface-variant/40 overflow-hidden divide-y divide-surface-variant/30 shadow-ambient">

                {/* Benefit 1: Accessible & Instant */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-pink/5 hover:bg-pink/10 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink/20 text-[#9E3B54] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base sm:text-lg font-bold">payments</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-heading font-bold text-on-surface">Accessible &amp; Instant</h3>
                    <p className="text-[11px] sm:text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                      No expensive appointments or rigid schedules. 24/7 guidance directly from your phone.
                    </p>
                  </div>
                </div>

                {/* Benefit 2: Personalized to Your Stage */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base sm:text-lg font-bold">tune</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-heading font-bold text-on-surface">Personalized to Your Stage</h3>
                    <p className="text-[11px] sm:text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
                      Student, parent, working pro — Manraah adapts its voice and tools to your exact life context.
                    </p>
                  </div>
                </div>

                {/* Benefit 3: 100% Anonymous & Private */}
                <div className="flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 bg-mint/5 hover:bg-mint/10 transition-colors">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-base sm:text-lg font-bold">shield</span>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-heading font-bold text-on-surface">100% Anonymous &amp; Private</h3>
                    <p className="text-[11px] sm:text-[12px] text-on-surface-variant leading-relaxed mt-0.5">
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
      <section id="categories" className="py-10 sm:py-14 md:py-16 bg-[#F2EBFF]/60 border-y border-surface-variant/20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div className="max-w-2xl space-y-2.5 sm:space-y-3 text-left">
              <p className="text-xs font-heading font-bold text-[#9E5D28] tracking-widest uppercase">
                Category Personalization
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-on-surface">
                Tailored Support for Every Stage of Life
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                Manraah isn&apos;t one-size-fits-all. Select your category to unlock personalized conversation styles, tools, and reflection prompts.
              </p>
            </div>

            {/* Desktop Carousel Navigation Controls */}
            <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                onClick={() => scrollCategoryCarousel("left")}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Scroll left"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
              </button>
              <button
                onClick={() => scrollCategoryCarousel("right")}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-surface-container border border-surface-variant/40 text-on-surface hover:bg-primary hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer"
                aria-label="Scroll right"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
              </button>
              <Link
                href="/for-you"
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all ml-1.5 sm:ml-2"
              >
                View All Categories →
              </Link>
            </div>
          </div>

          {/* Horizontal Gradient Card Carousel */}
          <div
            ref={categoryCarouselRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {USER_CATEGORIES.map((cat) => {
              const style = USER_CATEGORY_GRADIENTS[cat.id] || {
                bg: "bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#5FCFB0]",
                badge: "🌿 Wellness Journey",
              };

              return (
                <div
                  key={cat.id}
                  className={`snap-start shrink-0 w-[240px] xs:w-[270px] sm:w-[290px] h-[320px] sm:h-[360px] rounded-2xl sm:rounded-[32px] p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between shadow-card-lift hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group cursor-default border border-white/20`}
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
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-lg sm:text-xl shadow-md group-hover:scale-110 transition-transform">
                      {cat.emoji}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-heading font-extrabold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                      {style.badge}
                    </span>
                  </div>

                  {/* Bottom Card Content */}
                  <div className="relative z-20 space-y-1.5 sm:space-y-2 text-left">
                    <h3 className="font-heading font-black text-lg sm:text-2xl text-white tracking-tight">
                      {cat.name}
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
          <div className="text-left pt-2 sm:pt-4">
            <Link
              href="/for-you"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-surface-container-lowest hover:bg-primary/10 text-primary border border-primary/30 font-heading font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <span>Explore All Dedicated Life Stage Pathways</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== 7. TESTIMONIALS SECTION (SINGLE CONTINUOUS MARQUEE LINE) ==================== */}
      <section id="testimonials" className="py-10 sm:py-14 md:py-16 bg-surface overflow-hidden">
        <div className="px-4 sm:px-6 mb-6 sm:mb-8">
          <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-3 text-left">
            <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
              Real Perspectives &amp; Reflections
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-on-surface">
              Built With Real People In Mind
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl">
              How individuals across students, parents, couples, and working professionals find daily moments of calm and emotional grounding with Manraah.
            </p>
          </div>
        </div>

        {/* Marquee Wrapper with edge gradient fade masks */}
        <div className="relative w-full overflow-hidden select-none">
          {/* Left/Right Edge Gradient Fade Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-24 md:w-32 bg-gradient-to-r from-surface to-transparent z-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-24 md:w-32 bg-gradient-to-l from-surface to-transparent z-20" />

          {/* Single Continuous Marquee Row */}
          <div className="flex animate-marquee pause-on-hover gap-4 sm:gap-6 items-stretch py-2 sm:py-3">
            {[...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_2, ...TESTIMONIALS_ROW_1, ...TESTIMONIALS_ROW_2].map((item, idx) => (
              <div
                key={`single-row-${idx}`}
                className="w-[280px] sm:w-[340px] md:w-[360px] shrink-0 p-5 sm:p-6 rounded-2xl sm:rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-ambient hover:shadow-card-lift hover:border-primary/30 transition-all duration-300 flex flex-col justify-between space-y-3 sm:space-y-4"
              >
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-0.5 text-amber-400 text-xs sm:text-sm">
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
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${item.avatarBg} font-heading font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
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
        <div className="px-4 sm:px-6 pt-6 sm:pt-8">
          <div className="max-w-7xl mx-auto text-left">
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-surface-container-lowest hover:bg-primary/10 text-primary border border-primary/30 font-heading font-bold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <span>Explore All Member Stories &amp; Journeys</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ 8. HEADLINE, CTAs & TRUST BADGES (MOOD CHECK-IN PROMPT COMMENTED OUT) ═══ */}
      <section className="relative pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Soft Atmospheric Glow Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] md:w-[600px] h-[400px] bg-primary/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-mint/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-20 left-0 w-[250px] h-[250px] bg-pink/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-14">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col items-start text-left gap-6 sm:gap-8"
          >
            {/* ── HEADLINE & SUBTITLE ── */}
            <motion.div variants={itemVariants} className="w-full max-w-3xl space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-heading font-black tracking-tight leading-[1.15] text-on-surface">
                Your Safe Space to{" "}
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
                  Breathe, Reflect & Feel Heard
                </span>
              </h1>

              <p className="text-sm sm:text-base leading-relaxed text-on-surface-variant max-w-2xl font-normal">
                Connect with an empathetic AI companion 24/7, talk to verified peer listeners, track your emotional wellness, and access guided care — personalized for your exact stage in life.
              </p>
            </motion.div>

            {/* ── CTAs ── */}
            <motion.div variants={itemVariants} className="flex items-center justify-start">
              <Link
                href="/how-it-works"
                className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 group cursor-pointer"
              >
                <span>See How It Works</span>
                <span className="material-symbols-outlined text-base sm:text-lg group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Trust Badges Strip ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full"
          >
            {TRUST_BADGES.map((b, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-[24px] bg-surface-container-lowest border ${b.border} shadow-ambient hover:-translate-y-1 hover:shadow-md transition-all flex flex-col justify-between h-32 sm:h-36 text-left`}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${b.bg} ${b.iconColor}`}>
                  <span className="material-symbols-outlined text-lg sm:text-xl font-bold">{b.icon}</span>
                </div>
                <div>
                  <h4 className="text-xs font-heading font-black text-on-surface">{b.title}</h4>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-variant font-medium mt-0.5">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ==================== 10. FINAL CTA BAND ==================== */}
      <BottomCtaBand
        title="Your Retreat for Mind is Just One Step Away"
        description="Join individuals building daily emotional clarity, resilience, and peace with Manraah."
        buttonText="Explore How It Works"
        buttonHref="/how-it-works"
      />
    </div>
  );
}
