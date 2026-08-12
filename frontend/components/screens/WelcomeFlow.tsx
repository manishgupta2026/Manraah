"use client";

/**
 * ARCHIVED / RETIRED COMPONENT
 * Replaced by MarketingLandingPage.tsx for the public-facing marketing landing page at root route /.
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getClientSession, signOut } from "@/backend/auth/client";
import Logo from "@/frontend/components/ui/Logo";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 85, damping: 14 },
  },
};

const TRUST_CARDS = [
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
    title: "Anonymous Identity",
    desc: "No real-name required",
    bg: "bg-primary-container/10",
    iconColor: "text-primary",
    border: "border-primary/20",
  },
  {
    icon: "diversity_1",
    title: "AI + Human Support",
    desc: "Empathy-driven peer listening",
    bg: "bg-peach/20",
    iconColor: "text-tertiary",
    border: "border-peach/30",
  },
  {
    icon: "psychology",
    title: "Evidence-Based Wellness",
    desc: "Clinical science backed tools",
    bg: "bg-pink/20",
    iconColor: "text-[#874959]",
    border: "border-pink/30",
  },
];

export default function WelcomeFlow() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface flex flex-col select-none">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Logo size="md" priority className="h-8 sm:h-9" />
        </Link>

        <Link
          href="/login"
          className="px-6 py-2 rounded-full bg-surface-container border border-surface-variant/40 text-primary font-heading font-bold text-xs hover:bg-primary/5 transition-all duration-200"
        >
          Login
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 md:py-16 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center"
        >
          {/* Left: Headline + CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <motion.div variants={itemVariants} className="space-y-4">
              <span className="px-3.5 py-1.5 rounded-full text-[10px] font-heading font-bold tracking-widest bg-primary-container/10 text-primary border border-primary/20 uppercase w-fit inline-block">
                🌿 Mindful Mental Space
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight leading-[1.1] text-on-surface">
                Your Personal Sanctuary{" "}
                <span className="text-primary">for a Healthier Mind</span>
              </h2>
              <p className="text-sm md:text-base leading-relaxed font-normal max-w-xl text-on-surface-variant">
                A private, compassionate space where AI gently helps you understand your emotions, build healthier habits, and grow at your own pace.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={async () => {
                  await signOut();
                  router.push("/category-selection");
                }}
                className="w-full sm:w-auto px-9 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                🌿 Get Started
              </button>
              <Link
                href="/login"
                className="w-full sm:w-auto text-center px-9 py-4 rounded-full bg-surface-container border border-surface-variant/40 font-heading font-semibold text-sm text-on-surface-variant hover:bg-primary/5 hover:-translate-y-0.5 transition-all duration-200"
              >
                Already have an account? Log In
              </Link>
            </motion.div>
          </div>

          {/* Right: Illustration */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex items-center justify-center"
          >
            <div className="w-full max-w-[340px] md:max-w-[400px]">
              <svg viewBox="0 0 400 400" className="w-full h-full select-none pointer-events-none drop-shadow-xl">
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F2EEFC" />
                    <stop offset="100%" stopColor="#FDF7FF" />
                  </linearGradient>
                  <linearGradient id="mountainGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#5F4EA5" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="mountainGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8F7FD8" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#251E52" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Sky circle */}
                <circle cx="200" cy="200" r="180" fill="url(#skyGrad)" />

                {/* Sun */}
                <motion.circle
                  cx="240"
                  cy="140"
                  r="28"
                  fill="#FDBA74"
                  opacity="0.8"
                  animate={{ scale: [1, 1.08, 1], y: [0, -3, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Mountains (back) */}
                <path d="M 50 350 L 150 210 L 250 350 Z" fill="url(#mountainGrad1)" />
                {/* Mountains (front) */}
                <path d="M 120 350 L 240 170 L 350 350 Z" fill="url(#mountainGrad2)" />

                {/* Lake */}
                <ellipse cx="200" cy="340" rx="140" ry="24" fill="#F2EBFF" opacity="0.3" />

                {/* Lotus */}
                <motion.g
                  transform="translate(160, 290) scale(0.8)"
                  animate={{ scale: [0.76, 0.83, 0.76], rotate: [-0.8, 0.8, -0.8] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M 50 80 C 10 70, 0 40, 50 10 C 60 40, 50 70, 50 80 Z" fill="#F4A6B8" opacity="0.75" />
                  <path d="M 50 80 C 90 70, 100 40, 50 10 C 60 40, 50 70, 50 80 Z" fill="#F4A6B8" opacity="0.75" />
                  <path d="M 50 80 C 25 50, 25 20, 50 0 C 75 20, 75 50, 50 80 Z" fill="#7C6BC4" opacity="0.9" />
                  <path d="M 50 80 C 35 60, 35 40, 50 20 C 65 40, 65 60, 50 80 Z" fill="#FEF3C7" opacity="0.9" />
                </motion.g>
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Trust Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 lg:mt-24 w-full"
        >
          {TRUST_CARDS.map((card, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className={`p-5 rounded-[28px] bg-surface-container-lowest border ${card.border} shadow-soft flex flex-col justify-between h-40 hover:-translate-y-1 hover:shadow-md transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${card.bg} ${card.iconColor}`}>
                <span className="material-symbols-outlined text-xl font-bold">{card.icon}</span>
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-xs font-heading font-black text-on-surface">{card.title}</h4>
                <p className="text-[10px] text-on-surface-variant font-semibold opacity-80 leading-tight">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
