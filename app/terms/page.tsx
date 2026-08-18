"use client";

import React from "react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 border-b border-surface-variant/30 pb-8">
          <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
            Legal Terms
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight">
            Terms of Service & User Agreement
          </h1>
          <p className="text-xs text-on-surface-variant font-medium">
            Effective Date: January 1, 2026 • Version 1.2
          </p>
        </div>

        {/* Content Card */}
        <div className="p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-8 text-sm leading-relaxed text-on-surface-variant">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, or creating an account on the Manraah platform (&quot;Manraah&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you confirm that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, you should not access or use our services.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">2</span>
              <span>Platform Description & Medical Disclaimer</span>
            </h2>
            <p>
              Manraah provides digital mental wellness tools, AI companion conversational features, guided journals, mood tracking, peer listening support, and category-based reflection resources designed to foster self-awareness and emotional resilience.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 space-y-1 font-medium">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span>IMPORTANT MEDICAL NOTICE</span>
              </p>
              <p>
                Manraah is NOT a licensed medical care provider, hospital dispatch, or clinical emergency service. Our AI Companion and peer listeners do not provide clinical medical diagnoses or psychiatric treatment. If you are experiencing an immediate crisis or suicidal thoughts, please call local emergency services or visit our <Link href="/crisis" className="underline font-bold">Crisis Support</Link> page immediately.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">3</span>
              <span>Account Registration & Security</span>
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate email details and notify us immediately of any unauthorized access. You may choose an anonymous Retreat Alias to represent your display identity in community spaces.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">4</span>
              <span>Community Conduct & Peer Respect</span>
            </h2>
            <p>
              Manraah operates on a zero-tolerance policy regarding harassment, hate speech, bullying, or abusive behavior toward fellow members or peer listeners. Violation of community guidelines will result in immediate suspension or account termination.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">5</span>
              <span>Intellectual Property & Journal Ownership</span>
            </h2>
            <p>
              You retain 100% ownership of your private journal entries, personal reflection notes, and mood logs. Manraah owns all platform software, visual assets, AI algorithms, and educational resources.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-on-surface flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-extrabold">6</span>
              <span>Modifications to Terms</span>
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the platform following any updates constitutes acceptance of the revised Terms.
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
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <span>•</span>
              <Link href="/security" className="hover:underline">Security Center</Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
