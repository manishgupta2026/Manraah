"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { signOut } from "@/backend/auth/client";

const PILLARS = [
  {
    num: "01",
    icon: "psychology",
    title: "Professional Care",
    description: "Professional therapy for those who need expert guidance."
  },
  {
    num: "02",
    icon: "self_improvement",
    title: "Self-Help",
    description: "Practical tools and resources for everyday emotional care."
  },
  {
    num: "03",
    icon: "groups",
    title: "Community",
    description: "A supportive community of people who understand what you're going through."
  }
];

const PRINCIPLES = [
  {
    icon: "favorite",
    title: "Compassion First",
    description: "Every interaction on Manraah is rooted in empathy, warmth, and respect for each person's unique story."
  },
  {
    icon: "accessibility_new",
    title: "Accessibility for All",
    description: "Mental health support shouldn't be a privilege; we strive to make it affordable and easy to reach for everyone."
  },
  {
    icon: "sentiment_satisfied",
    title: "No Judgment, Ever",
    description: "We create a safe space where people can be honest without fear of shame or stigma."
  },
  {
    icon: "groups",
    title: "Community & Connection",
    description: "Healing happens faster when we don't feel alone; we foster genuine peer support alongside professional care."
  },
  {
    icon: "verified_user",
    title: "Trust & Confidentiality",
    description: "We hold the privacy and safety of every individual's journey as sacred."
  },
  {
    icon: "spa",
    title: "Holistic Well-being",
    description: "We look beyond symptoms to support the whole person — mind, emotions, relationships, and daily life."
  }
];

export default function AboutPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const handleGetStarted = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    router.push("/category-selection");
  };

  // ═══ ANIMATION VARIANTS ═══

  // Hero Container / Staggered items
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Scroll Reveal for general sections
  const sectionRevealVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: "easeOut" },
    },
  };

  // Card Hover Lift
  const cardHoverVariants = {
    rest: {
      y: 0,
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
      borderColor: "rgba(226, 232, 240, 0.8)",
    },
    hover: {
      y: shouldReduceMotion ? 0 : -6,
      boxShadow: "0 20px 25px -5px rgba(124, 58, 237, 0.08), 0 10px 10px -5px rgba(124, 58, 237, 0.04)",
      borderColor: "rgba(124, 58, 237, 0.3)",
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  // Icon Hover (scale and slight shift)
  const iconVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: shouldReduceMotion ? 1 : 1.08,
      y: shouldReduceMotion ? 0 : -2,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  // Button Hover Translation
  const buttonVariants = {
    rest: { y: 0 },
    hover: {
      y: shouldReduceMotion ? 0 : -2,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const arrowVariants = {
    rest: { x: 0 },
    hover: {
      x: shouldReduceMotion ? 0 : 4,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  // Core Principles Staggered Reveal
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const staggerItemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      
      {/* ═══ 1. HERO HEADER ═══ */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={heroContainerVariants}
        className="relative pt-12 pb-14 md:pt-16 md:pb-18 px-6 max-w-5xl mx-auto text-center space-y-6"
      >
        {/* Atmosphere Glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-peach/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          variants={heroItemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>OUR STORY • THE PATH FOR THE MIND</span>
        </motion.div>

        <motion.h1
          variants={heroItemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]"
        >
          Built for Every Mind,{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
            Every Journey
          </span>
        </motion.h1>

        <motion.p
          variants={heroItemVariants}
          className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Manraah is a safe, compassionate space where people can find support, self-help, professional care, and meaningful connection — wherever they are in their mental wellness journey.
        </motion.p>
      </motion.section>

      {/* ═══ 2. MAIN ABOUT MANRAAH SECTION ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionRevealVariants}
          className="rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift p-8 sm:p-12 space-y-10"
        >
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-surface-variant/20">
            <div className="space-y-3 max-w-2xl text-left">
              <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20">
                OUR ESSENCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface">
                About Manraah
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                The name Manraah comes from &quot;Man&quot; (mind) and &quot;raah&quot; (path) — quite literally, a path for the mind. We created Manraah as a warm, welcoming space that brings together three essential pillars of mental wellness: professional therapy for those who need expert guidance, self-help tools for everyday emotional care, and a community of people who understand what you&apos;re going through. We don&apos;t believe in a one-size-fits-all approach to healing. Instead, we meet you where you are, and walk with you toward where you want to be.
              </p>
            </div>

            <motion.button
              onClick={handleGetStarted}
              initial="rest"
              whileHover="hover"
              variants={buttonVariants}
              className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-center"
            >
              <span>Get Started</span>
              <motion.span variants={arrowVariants} className="material-symbols-outlined text-base">
                arrow_forward
              </motion.span>
            </motion.button>
          </div>

          {/* Grid breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: About Us Introduction */}
            <div className="space-y-6 text-left">
              <div className="p-6 rounded-[24px] bg-surface-container-low/60 border border-surface-variant/30 space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 text-on-surface mb-4">
                    <span className="material-symbols-outlined text-primary text-xl">psychology_alt</span>
                    <h3 className="font-heading font-extrabold text-base">About Us</h3>
                  </div>
                  <div className="space-y-4 text-sm text-on-surface-variant font-medium leading-relaxed">
                    <p>
                      At Manraah, we believe healing begins the moment someone feels truly heard. We believe mental well-being isn&apos;t a destination- it&apos;s a journey, and no one should have to walk it alone.
                    </p>
                    <p>
                      We are a team of mental health professionals, counselors, and everyday people united by one shared belief: that support should be accessible, compassionate, and free of judgment — for everyone, regardless of age, background, or stage of life. Whether you&apos;re a student navigating pressure, a professional managing burnout, a parent holding it all together, or simply someone trying to understand yourself a little better- Manraah is built for you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Three Pillars */}
            <div className="space-y-4 text-left">
              <h3 className="font-heading font-extrabold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-mint text-xl">auto_awesome</span>
                <span>Our Three Pillars</span>
              </h3>

              <div className="space-y-3">
                {PILLARS.map((pillar, idx) => (
                  <motion.div
                    key={idx}
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    className="p-5 rounded-[20px] bg-surface-container-lowest border border-surface-variant/40 shadow-xs flex items-center gap-4 hover:border-primary/30 transition-all cursor-default"
                  >
                    <motion.div
                      variants={iconVariants}
                      className="w-10 h-10 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center shrink-0"
                    >
                      <span className="material-symbols-outlined text-xl">{pillar.icon}</span>
                    </motion.div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-extrabold text-sm text-on-surface">
                          {pillar.title}
                        </h4>
                        <span className="text-xs font-heading font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                          {pillar.num}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-normal mt-1 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 3. VISION & MISSION Grid ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* VISION Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionRevealVariants}
            className="w-full"
          >
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="h-full p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-4 cursor-default text-left"
            >
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20">
                  OUR FUTURE
                </span>
                <h2 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight">
                  Vision
                </h2>
              </div>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                A world where mental health is treated with the same care, openness, and priority as physical health- where seeking support is seen as a sign of strength, not stigma, and where every individual has a safe path toward emotional well-being.
              </p>
            </motion.div>
          </motion.div>

          {/* MISSION Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={sectionRevealVariants}
            className="w-full"
          >
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
              className="h-full p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-4 cursor-default text-left"
            >
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-[#006B56]/15 text-[#006B56] border border-[#006B56]/20">
                  OUR PURPOSE
                </span>
                <h2 className="text-2xl font-heading font-extrabold text-on-surface tracking-tight">
                  Mission
                </h2>
              </div>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                To make mental health support accessible, affordable, and human- by combining professional therapy, practical self-help resources, and a compassionate community, so that no one has to face their struggles in silence or alone.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 4. PROBLEM STATEMENT Highlight ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionRevealVariants}
          className="w-full"
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="p-8 sm:p-12 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-6 cursor-default text-left relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant/20 pb-6">
              <div className="space-y-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-pink/30 text-[#874959] border border-pink/40 uppercase tracking-wider">
                  Problem Statement
                </span>
                <h2 className="text-3xl font-heading font-extrabold text-on-surface mt-1">
                  Why Manraah Exists
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
              Millions of people silently carry emotional pain they&apos;ve never spoken about- held back by stigma, high costs, inaccessible services, or simply not knowing where a safe conversation might begin. Existing solutions are often expensive, impersonal, or disconnected from the cultural realities people live in. What&apos;s missing is a space that offers real hope: professional care that&apos;s easy to reach, self-help that actually helps, and a community that reminds people they were never alone in the first place.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 5. GOAL Highlight ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionRevealVariants}
          className="w-full"
        >
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className="p-8 sm:p-12 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-6 cursor-default text-left relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant/20 pb-6">
              <div className="space-y-2">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-[#9E5D28]/15 text-[#9E5D28] border border-[#9E5D28]/30 uppercase tracking-wider">
                  Goal
                </span>
                <h2 className="text-3xl font-heading font-extrabold text-on-surface mt-1">
                  Our Goal
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
              To build a trusted, inclusive platform that empowers individuals at every stage of their mental health journey, from those just starting to explore their emotions, to those actively seeking therapy- through accessible care, meaningful self-help content, and a supportive community that reminds them they are never alone.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ 6. CORE PRINCIPLES (What We Believe In) ═══ */}
      <section className="py-16 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
              Core Principles
            </p>
            <h2 className="text-3xl font-heading font-extrabold text-on-surface">
              What We Believe In
            </h2>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PRINCIPLES.map((principle, idx) => (
              <motion.div
                key={idx}
                variants={staggerItemVariants}
                className="w-full"
              >
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="p-6 rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-center cursor-default h-full text-left"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div
                      variants={iconVariants}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-primary bg-primary/10 shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">{principle.icon}</span>
                    </motion.div>
                    <h4 className="font-heading font-bold text-sm text-on-surface">
                      {principle.title}
                    </h4>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 7. BOTTOM CTA BANNER ═══ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-7 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Begin Your Journey to Well-being
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed font-normal">
            Experience compassionate support, expert therapy, self-help tools, and a welcoming community all in one place.
          </p>

          <div className="pt-2">
            <motion.button
              onClick={handleGetStarted}
              initial="rest"
              whileHover="hover"
              variants={buttonVariants}
              className="px-9 py-4 rounded-full bg-white text-primary hover:bg-surface-container-low font-heading font-extrabold text-sm shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started with Manraah</span>
              <motion.span variants={arrowVariants} className="material-symbols-outlined text-lg">
                arrow_forward
              </motion.span>
            </motion.button>
          </div>
        </div>
      </section>
      
    </div>
  );
}
