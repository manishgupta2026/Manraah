"use client";

import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 border-b border-surface-variant/30 pb-8">
          <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
            Data Protection
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight">
            Manraah Privacy Policy
          </h1>
          <p className="text-xs text-on-surface-variant font-medium">
            Last Updated: January 2026 • Zero Data-Selling Commitment
          </p>
        </div>

        {/* Content Card */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-8 text-sm leading-relaxed text-on-surface-variant">
          
          {/* Commitment Highlight Box */}
          <div className="p-5 rounded-2xl bg-mint/15 border border-mint/30 space-y-2 text-xs text-[#004D3E]">
            <h3 className="font-heading font-bold text-sm text-[#006B56] flex items-center gap-2">
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>Our Sacred Privacy Promise</span>
            </h3>
            <p>
              Your emotional reflections, journal entries, and AI companion conversations are deeply personal. Manraah will NEVER sell, monetize, or rent your personal data, chat transcripts, or wellness scores to advertisers or third parties under any circumstances.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center text-xs font-extrabold">1</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              We collect minimal information necessary to deliver personalized mental wellness support:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Email address, hashed password, optional Full Name, and Sanctuary Alias.</li>
              <li><strong>Demographics (Optional):</strong> Date of birth, gender identity, country, and phone number (used for age-appropriate content adaptation and emergency helpline routing).</li>
              <li><strong>Wellness Logs:</strong> Mood check-ins, journal reflections, assessment answers, and companion chat sessions.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center text-xs font-extrabold">2</span>
              <span>How We Use Your Information</span>
            </h2>
            <p>Your data is strictly used to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Personalize AI companion responses based on your selected category (e.g. Student, Working Professional, Parent).</li>
              <li>Calculate your daily Wellness Score and track progress trends over time.</li>
              <li>Provide instant access to localized crisis support contacts when requested.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center text-xs font-extrabold">3</span>
              <span>Data Encryption & Storage</span>
            </h2>
            <p>
              All personal data is encrypted in transit via TLS 1.3 and at rest using AES-256 standards hosted on secure PostgreSQL infrastructure. Private journal logs remain encrypted and accessible only by you.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center text-xs font-extrabold">4</span>
              <span>Your Data Rights & One-Click Deletion</span>
            </h2>
            <p>
              You maintain total control over your data. At any time, you may request a full export of your account data or request complete account deletion, which permanently purges all logs from our servers.
            </p>
          </section>

          {/* Back button */}
          <div className="pt-6 border-t border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Return to Home</span>
            </Link>

            <div className="flex items-center gap-4 text-xs font-heading font-semibold text-primary">
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <span>•</span>
              <Link href="/security" className="hover:underline">Security Center</Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
