"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 border-b border-surface-variant/30 pb-8">
          <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
            Our Story & Mission
          </p>
          <h1 className="text-3xl sm:text-5xl font-heading font-black text-on-surface tracking-tight leading-tight">
            Bridging Technology & Human Empathy
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant font-normal max-w-2xl mx-auto leading-relaxed">
            Manraah was built on a simple premise: Everyone deserves a safe, private space to process life&apos;s weights without fear of judgment.
          </p>
        </div>

        {/* Impact Numbers Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift text-center">
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-primary">14,00+</h3>
            <p className="text-xs text-on-surface-variant font-semibold">Active Sanctuary Members</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-mint-dark text-[#006B56]">9</h3>
            <p className="text-xs text-on-surface-variant font-semibold">Life Stage Categories</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-peach-dark text-[#9E5D28]">24/7</h3>
            <p className="text-xs text-on-surface-variant font-semibold">AI & Peer Availability</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-heading font-black text-pink-dark text-[#A83256]">100%</h3>
            <p className="text-xs text-on-surface-variant font-semibold">Private & Encrypted</p>
          </div>
        </div>

        {/* Story Narrative Card */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-8 text-sm leading-relaxed text-on-surface-variant">
          
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-extrabold text-on-surface">
              Why We Founded Manraah (&quot;Strong Minds&quot;)
            </h2>
            <p>
              In today&apos;s fast-paced world, stress affects everyone differently — a student overwhelmed by exams faces distinct pressures from a working parent balancing deadlines or a couple navigating relationship changes. Existing mental health apps often offer generic, one-size-fits-all advice.
            </p>
            <p>
              Manraah was created to offer personalized, category-adapted support. We combine 24/7 empathetic AI companionship for instant relief, verified human peer listeners for shared empathy, and professional therapist care for deeper healing.
            </p>
          </section>

          {/* Our Core Values */}
          <section className="space-y-4 pt-4 border-t border-surface-variant/20">
            <h2 className="text-xl font-heading font-extrabold text-on-surface">
              Our Core Principles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-variant/30 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">shield</span>
                </div>
                <h4 className="font-heading font-bold text-on-surface text-sm">Unconditional Privacy</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your journal entries and chats are encrypted. We never sell user reflections or monetization data.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-variant/30 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-mint/25 text-[#006B56] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">psychology</span>
                </div>
                <h4 className="font-heading font-bold text-on-surface text-sm">Evidence-Based Care</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Grounded in Cognitive Behavioral Therapy (CBT) and Mindfulness-Based Stress Reduction (MBSR).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-variant/30 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-peach/30 text-[#9E5D28] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-lg">groups</span>
                </div>
                <h4 className="font-heading font-bold text-on-surface text-sm">Human + AI Hybrid</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Instant 24/7 AI companion availability backed by trained human peer listeners and verified counselors.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <div className="pt-6 border-t border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Home</span>
            </Link>

            <Link
              href="/category-selection"
              className="px-7 py-3 rounded-full bg-mint/25 text-[#006B56] border border-mint/40 font-heading font-bold text-xs hover:bg-mint/40 transition-all"
            >
              <span>Explore Manraah Sanctuary</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
