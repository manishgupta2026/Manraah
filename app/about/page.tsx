"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { signOut } from "@/backend/auth/client";

const PILLARS = [
  {
    num: "01",
    icon: "psychology",
    title: "Professional Therapy",
    description: "Professional therapy for those who need expert guidance.",
  },
  {
    num: "02",
    icon: "self_improvement",
    title: "Self-Help Tools",
    description: "Practical self-help tools and resources for everyday emotional care.",
  },
  {
    num: "03",
    icon: "groups",
    title: "Supportive Community",
    description: "A compassionate community of people who understand what you're going through.",
  },
];

const PRINCIPLES = [
  {
    icon: "favorite",
    title: "Compassion First",
    description:
      "Every interaction on Manraah is rooted in empathy, warmth, and respect for each person's unique story.",
  },
  {
    icon: "accessibility_new",
    title: "Accessibility for All",
    description:
      "Mental health support shouldn't be a privilege; we strive to make it affordable and easy to reach for everyone.",
  },
  {
    icon: "sentiment_satisfied",
    title: "No Judgment, Ever",
    description:
      "We create a safe space where people can be honest without fear of shame or stigma.",
  },
  {
    icon: "groups",
    title: "Community & Connection",
    description:
      "Healing happens faster when we don't feel alone; we foster genuine peer support alongside professional care.",
  },
  {
    icon: "verified_user",
    title: "Trust & Confidentiality",
    description:
      "We hold the privacy and safety of every individual's journey as sacred.",
  },
  {
    icon: "spa",
    title: "Holistic Well-being",
    description:
      "We look beyond symptoms to support the whole person — mind, emotions, relationships, and daily life.",
  },
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

  const sectionRevealVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: "easeOut" },
    },
  };

  const cardHoverVariants = {
    rest: {
      y: 0,
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
      borderColor: "rgba(226, 232, 240, 0.8)",
    },
    hover: {
      y: shouldReduceMotion ? 0 : -6,
      boxShadow:
        "0 20px 25px -5px rgba(124, 58, 237, 0.08), 0 10px 10px -5px rgba(124, 58, 237, 0.04)",
      borderColor: "rgba(124, 58, 237, 0.3)",
      transition: { duration: 0.28, ease: "easeOut" },
    },
  };

  const iconVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: shouldReduceMotion ? 1 : 1.08,
      y: shouldReduceMotion ? 0 : -2,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

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
      {/* ═══ 1. HERO SECTION: ABOUT US ═══ */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={heroContainerVariants}
        className="relative pt-14 pb-16 md:pt-20 md:pb-20 px-6 max-w-5xl mx-auto text-center space-y-6"
      >
        {/* Ambient Atmosphere Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-peach/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <motion.div
          variants={heroItemVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>ABOUT US • MANRAAH</span>
        </motion.div>

        <motion.h1
          variants={heroItemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.15]"
        >
          About Us
        </motion.h1>

        {/* Core Opening Quote / Philosophy */}
        <motion.div
          variants={heroItemVariants}
          className="max-w-3xl mx-auto p-6 sm:p-8 rounded-[28px] bg-surface-container-lowest/80 backdrop-blur-md border border-primary/20 shadow-sm space-y-3"
        >
          <p className="text-lg sm:text-xl font-heading font-bold text-primary leading-snug">
            &ldquo;At Manraah, we believe healing begins the moment someone feels truly heard. We believe mental well-being isn&apos;t a destination — it&apos;s a journey, and no one should have to walk it alone.&rdquo;
          </p>
        </motion.div>

        {/* Narrative Description */}
        <motion.p
          variants={heroItemVariants}
          className="text-base sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed font-normal text-center"
        >
          We are a team of mental health professionals, counselors, and everyday people united by one shared belief: that support should be accessible, compassionate, and free of judgment — for everyone, regardless of age, background, or stage of life. Whether you&apos;re a student navigating pressure, a professional managing burnout, a parent holding it all together, or simply someone trying to understand yourself a little better — Manraah is built for you.
        </motion.p>

        {/* Quick CTA */}
        <motion.div variants={heroItemVariants} className="pt-2">
          <motion.button
            onClick={handleGetStarted}
            initial="rest"
            whileHover="hover"
            variants={buttonVariants}
            className="px-8 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Your Path</span>
            <motion.span variants={arrowVariants} className="material-symbols-outlined text-base">
              arrow_forward
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* ═══ 2. ABOUT MANRAAH & THREE PILLARS ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionRevealVariants}
          className="rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift p-8 sm:p-12 space-y-10"
        >
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-surface-variant/20">
            <div className="space-y-3 max-w-3xl text-left">
              <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                Our Essence &amp; Meaning
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface">
                About Manraah
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed">
                The name Manraah comes from <span className="font-semibold text-primary">&quot;Man&quot;</span> (mind) and <span className="font-semibold text-primary">&quot;raah&quot;</span> (path) — quite literally, a path for the mind. We created Manraah as a warm, welcoming space that brings together three essential pillars of mental wellness: professional therapy for those who need expert guidance, self-help tools for everyday emotional care, and a community of people who understand what you&apos;re going through. We don&apos;t believe in a one-size-fits-all approach to healing. Instead, we meet you where you are, and walk with you toward where you want to be.
              </p>
            </div>

            <motion.button
              onClick={handleGetStarted}
              initial="rest"
              whileHover="hover"
              variants={buttonVariants}
              className="px-7 py-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-heading font-bold text-sm transition-all inline-flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-center"
            >
              <span>Get Started</span>
              <motion.span variants={arrowVariants} className="material-symbols-outlined text-base">
                arrow_forward
              </motion.span>
            </motion.button>
          </div>

          {/* Three Pillars Showcase */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-mint text-2xl">auto_awesome</span>
              <h3 className="font-heading font-extrabold text-xl text-on-surface">
                Three Essential Pillars of Mental Wellness
              </h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              Every feature and resource inside Manraah is crafted around these three core foundations:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {PILLARS.map((pillar, idx) => (
                <motion.div
                  key={idx}
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="p-6 rounded-[24px] bg-surface-container-low/60 border border-surface-variant/30 flex flex-col justify-between hover:border-primary/30 transition-all cursor-default"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <motion.div
                        variants={iconVariants}
                        className="w-11 h-11 rounded-2xl bg-surface-container-lowest text-primary shadow-xs flex items-center justify-center shrink-0 border border-primary/10"
                      >
                        <span className="material-symbols-outlined text-2xl">{pillar.icon}</span>
                      </motion.div>
                      <span className="text-xs font-heading font-extrabold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                        {pillar.num}
                      </span>
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-on-surface">
                      {pillar.title}
                    </h4>
                    <p className="text-sm text-on-surface-variant font-normal leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ 3. VISION & MISSION ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* VISION CARD */}
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
              className="h-full p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-4 cursor-default text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                  Vision
                </span>
                <span className="material-symbols-outlined text-primary/40 text-2xl">visibility</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
                Our Vision
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed font-normal">
                A world where mental health is treated with the same care, openness, and priority as physical health — where seeking support is seen as a sign of strength, not stigma, and where every individual has a safe path toward emotional well-being.
              </p>
            </motion.div>
          </motion.div>

          {/* MISSION CARD */}
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
              className="h-full p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-4 cursor-default text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-[#006B56]/15 text-[#006B56] border border-[#006B56]/20 uppercase tracking-wider">
                  Mission
                </span>
                <span className="material-symbols-outlined text-[#006B56]/40 text-2xl">flag</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
                Our Mission
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed font-normal">
                To make mental health support accessible, affordable, and human — by combining professional therapy, practical self-help resources, and a compassionate community, so that no one has to face their struggles in silence or alone.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 4. PROBLEM STATEMENT & GOAL ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PROBLEM STATEMENT CARD */}
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
              className="h-full p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-4 cursor-default text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-pink/30 text-[#874959] border border-pink/40 uppercase tracking-wider">
                  Problem Statement
                </span>
                <span className="material-symbols-outlined text-[#874959]/40 text-2xl">report_problem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
                Problem Statement
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed font-normal">
                Millions of people silently carry emotional pain they&apos;ve never spoken about — held back by stigma, high costs, inaccessible services, or simply not knowing where a safe conversation might begin. Existing solutions are often expensive, impersonal, or disconnected from the cultural realities people live in. What&apos;s missing is a space that offers real hope: professional care that&apos;s easy to reach, self-help that actually helps, and a community that reminds people they were never alone in the first place.
              </p>
            </motion.div>
          </motion.div>

          {/* GOAL CARD */}
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
              className="h-full p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift space-y-4 cursor-default text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-[#9E5D28]/15 text-[#9E5D28] border border-[#9E5D28]/30 uppercase tracking-wider">
                  Goal
                </span>
                <span className="material-symbols-outlined text-[#9E5D28]/40 text-2xl">track_changes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
                Our Goal
              </h2>
              <p className="text-base text-on-surface-variant leading-relaxed font-normal">
                To build a trusted, inclusive platform that empowers individuals at every stage of their mental health journey, from those just starting to explore their emotions, to those actively seeking therapy — through accessible care, meaningful self-help content, and a supportive community that reminds them they are never alone.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. CORE PRINCIPLES ═══ */}
      <section className="py-16 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
              Core Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-on-surface">
              What We Believe In
            </h2>
            <p className="text-sm text-on-surface-variant">
              The foundational values guiding every interaction, feature, and connection on Manraah.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PRINCIPLES.map((principle, idx) => (
              <motion.div key={idx} variants={staggerItemVariants} className="w-full">
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="p-6 rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-default h-full text-left"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        variants={iconVariants}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 shrink-0"
                      >
                        <span className="material-symbols-outlined text-xl">{principle.icon}</span>
                      </motion.div>
                      <h3 className="font-heading font-bold text-base text-on-surface">
                        {principle.title}
                      </h3>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ 6. BOTTOM CTA BANNER ═══ */}
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
