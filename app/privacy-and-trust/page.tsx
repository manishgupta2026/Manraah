"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "@/backend/auth/client";

export default function PrivacyAndTrustPage() {
  const router = useRouter();

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
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-20 px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Glow Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-mint/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#006B56]/10 border border-[#006B56]/20 text-[#006B56] text-xs font-heading font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-[#006B56] animate-pulse" />
          <span>Uncompromising Safety &bull; Clinical Integrity</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Built on Absolute Privacy &amp;{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#006B56] via-[#5FCFB0] to-primary">
            Trust
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          Your emotional retreat is protected by enterprise-grade 256-bit encryption, complete user anonymity, zero data monetization, and evidence-based psychological frameworks.
        </p>
      </section>

      {/* ═══ 2. CORE SECURITY PLEDGE BENTO GRID ═══ */}
      <section className="px-6 max-w-7xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Tile 1: Large Anchor Shield Badge */}
          <div className="md:col-span-2 lg:col-span-5 rounded-[32px] bg-gradient-to-br from-[#006B56]/15 via-primary/10 to-surface-container-lowest border border-[#006B56]/30 shadow-card-lift p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden space-y-8">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-mint/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 pt-4">
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-mint via-primary to-pink blur-md"
                />
                <div className="relative w-20 h-20 rounded-3xl bg-surface-container-lowest border border-white/60 shadow-xl flex items-center justify-center text-[#006B56]">
                  <span className="material-symbols-outlined text-4xl font-extrabold">verified_user</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-heading font-extrabold bg-[#006B56]/15 text-[#006B56] border border-[#006B56]/30 uppercase tracking-wider">
                  Our Sacred Foundation
                </span>
                <p className="text-base sm:text-lg font-heading font-extrabold text-on-surface leading-snug">
                  Privacy isn&apos;t an added feature at Manraah — it is the sacred foundation every line of code is built upon.
                </p>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 text-center pt-6 border-t border-surface-variant/20">
              <div className="p-2.5 rounded-2xl bg-surface-container-lowest/80 border border-surface-variant/30 text-[11px] font-heading font-bold text-on-surface">
                🔒 256-Bit SSL
              </div>
              <div className="p-2.5 rounded-2xl bg-surface-container-lowest/80 border border-surface-variant/30 text-[11px] font-heading font-bold text-on-surface">
                🛡️ Zero Ad Tracking
              </div>
              <div className="p-2.5 rounded-2xl bg-surface-container-lowest/80 border border-surface-variant/30 text-[11px] font-heading font-bold text-on-surface">
                👁️ Pseudonymous
              </div>
            </div>
          </div>

          {/* Tile Stack Right */}
          <div className="md:col-span-2 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Zero-Knowledge Encryption */}
            <div className="p-8 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift hover:-translate-y-1 hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 text-[#006B56] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl font-bold">lock</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-on-surface">Zero-Knowledge Encryption</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                  All personal reflections, journal entries, mood scores, and AI conversation logs are encrypted end-to-end using TLS 1.3 and AES-256. Your private thoughts remain strictly yours.
                </p>
              </div>
            </div>

            {/* Complete Anonymity */}
            <div className="p-8 rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift hover:-translate-y-1 hover:shadow-xl transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl font-bold">visibility_off</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-xl text-on-surface">Complete Anonymity &amp; Pseudonymity</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                  Participate in community circles, AI check-ins, and peer listener chats with an avatar and nickname. We never require real names, address information, or social identity linking.
                </p>
              </div>
            </div>
          </div>

          {/* Full Width CBT/MBSR Banner */}
          <div className="md:col-span-2 lg:col-span-12 p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-pink/30 shadow-card-lift hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-pink/20 text-[#874959] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl font-bold">psychology</span>
              </div>
              <div className="space-y-1.5 max-w-3xl">
                <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-on-surface">
                  Evidence-Based Clinical Frameworks
                </h3>
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                  Our AI companion prompt architecture and guided exercises integrate Cognitive Behavioral Therapy (CBT), Mindfulness-Based Stress Reduction (MBSR), and positive psychology principles for safe, uplifting guidance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-extrabold bg-pink/15 text-[#874959] border border-pink/30">
                CBT &bull; MBSR &bull; Positive Psych
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ═══ 3. DETAILED PRIVACY PILLARS ═══ */}
      <section className="py-16 bg-[#F2EBFF]/40 border-y border-surface-variant/20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-heading font-extrabold text-on-surface">
              Our 4 Pillars of Data Governance
            </h2>
            <p className="text-sm text-on-surface-variant max-w-xl mx-auto font-normal">
              How we guarantee your privacy at every layer of platform architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="p-7 rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary font-heading font-bold flex items-center justify-center text-xs">
                  01
                </span>
                <h3 className="font-heading font-bold text-lg text-on-surface">Zero Data Selling Guarantee</h3>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                We will never sell, rent, or monetize your personal thoughts, journal entries, assessment scores, or emotional logs to third-party data brokers or advertisers.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#006B56]/10 text-[#006B56] font-heading font-bold flex items-center justify-center text-xs">
                  02
                </span>
                <h3 className="font-heading font-bold text-lg text-on-surface">Complete Data Portability &amp; Erasure</h3>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                You hold 100% ownership of your mental wellness data. Export your journal reflections anytime or permanently purge your account and log history with one tap.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-peach/30 text-[#9E5D28] font-heading font-bold flex items-center justify-center text-xs">
                  03
                </span>
                <h3 className="font-heading font-bold text-lg text-on-surface">Verified Practitioner Credentials</h3>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                All certified therapists and counselors listed in Professional Care undergo manual license verification, credential checks, and background screening before onboarding.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 rounded-[24px] bg-surface-container-lowest border border-surface-variant/30 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-pink/30 text-[#874959] font-heading font-bold flex items-center justify-center text-xs">
                  04
                </span>
                <h3 className="font-heading font-bold text-lg text-on-surface">Encrypted Voice &amp; Audio Processing</h3>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                Voice journal recordings and WebRTC audio streams in peer listener calls are encrypted during transmission and stored in protected, access-controlled cloud nodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4. STILL HAVE PRIVACY QUESTIONS CARD ═══ */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-2xl bg-[#006B56]/10 text-[#006B56] flex items-center justify-center mx-auto shadow-xs">
          <span className="material-symbols-outlined text-2xl font-bold">shield</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-heading font-black text-on-surface">
          Have Questions About Our Privacy Standards?
        </h2>

        <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-xl mx-auto font-normal">
          Our security and compliance team is available to address any data protection or privacy concerns.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-7 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white text-xs sm:text-sm font-heading font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <span>Contact Privacy Support</span>
            <span className="material-symbols-outlined text-base">mail</span>
          </Link>

          <Link
            href="/faq"
            className="px-7 py-3.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-surface-variant/50 text-xs sm:text-sm font-heading font-semibold transition-all"
          >
            Explore FAQ Hub
          </Link>
        </div>
      </section>

      {/* ═══ 5. BOTTOM CTA BANNER ═══ */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#4A388E] via-[#5F4EA5] to-[#3B2C78] text-white px-6 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-7 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight">
            Your Private Mind Sanctuary Awaits
          </h2>

          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto leading-relaxed font-normal">
            Begin your journey in a safe, zero-judgment, encrypted environment designed around your well-being.
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
