"use client";

import React from "react";
import BottomCtaBand from "@/frontend/components/ui/BottomCtaBand";

export default function CorporatesSolutionPage() {
  const triggerCallbackModal = (segment: "colleges" | "corporates" = "corporates") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-callback-modal", { detail: { segment } })
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-secondary/12 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-96 left-10 w-96 h-96 bg-mint/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ═══ 1. HERO HEADER ═══ */}
      <section className="relative pt-12 pb-8 md:pt-20 md:pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/15 border border-secondary/25 text-secondary text-xs font-heading font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-base">corporate_fare</span>
          <span>ENTERPRISE &amp; WORKPLACE MENTAL WELLNESS</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Modern Employee Assistance Programs That{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#005B48] to-secondary">
            People Actually Use
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed font-normal">
          Replace 2% shelfware EAPs with 24/7 confidential employee support, burnout telemetry, manager empathy enablement, and measurable organizational vitality for modern workplaces.
        </p>

        {/* Top CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => triggerCallbackModal("corporates")}
            className="px-6 sm:px-8 py-3.5 rounded-full bg-[#E3F3EE] hover:bg-[#006F5B] border border-[#B9DFD4] hover:border-[#006F5B] text-[#006F5B] hover:text-white font-heading font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all duration-300 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006F5B]/50"
          >
            <span className="material-symbols-outlined text-lg transition-colors">support_agent</span>
            <span>Request Callback</span>
          </button>
          <a
            href="#chro-compass"
            className="px-6 py-3.5 rounded-full bg-[#E3F3EE] hover:bg-[#006F5B] border border-[#B9DFD4] hover:border-[#006F5B] text-[#006F5B] hover:text-white font-heading font-bold text-sm shadow-md hover:shadow-lg active:scale-98 transition-all duration-300 flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006F5B]/50"
          >
            <span>Explore CHRO Wellbeing Compass</span>
            <span className="material-symbols-outlined text-base transition-colors">arrow_downward</span>
          </a>
        </div>
      </section>

      {/* ═══ 2. THE WORKPLACE CHALLENGE & SUITE ARCHITECTURE ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto space-y-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: The Corporate Reality */}
          <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl bg-surface-container-low/70 border border-surface-variant/30 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-error/10 text-error border border-error/20">
                The Workplace Challenge
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
                Legacy EAPs Have a 2% Utilization Problem
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Traditional corporate EAPs are treated as shelfware insurance benefits. Employees worry HR will track their sessions, and clinical booking flows feel intimidating.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">psychology_alt</span>
                <div>
                  <div className="text-xs font-heading font-bold text-on-surface">Burnout &amp; Quiet Quitting</div>
                  <div className="text-[11px] text-on-surface-variant">
                    High-velocity engineering, sales, and operations teams face chronic unaddressed emotional exhaustion and high attrition.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">lock_open</span>
                <div>
                  <div className="text-xs font-heading font-bold text-on-surface">Lack of Perceived Privacy</div>
                  <div className="text-[11px] text-on-surface-variant">
                    Staff refuse to use wellness services routed through corporate single sign-on without strict anonymity safeguards.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">bar_chart</span>
                <div>
                  <div className="text-xs font-heading font-bold text-on-surface">Zero Actionable Insights</div>
                  <div className="text-[11px] text-on-surface-variant">
                    CHROs receive vague annual invoice summaries without meaningful metrics on team psychological safety or stress hotspots.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-xs text-secondary font-semibold">
              📈 Manraah achieves 6x the industry average EAP utilization through frictionless micro-habits, anonymous teletherapy, and proactive workshops.
            </div>
          </div>

          {/* Right: The Complete Manraah Corporate Suite */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-secondary/15 text-secondary border border-secondary/20">
                Enterprise Suite Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
                Modern Employee Assistance &amp; Organizational Vitality
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Designed for Enterprises, Fast-Growth Tech Startups, BFSI, and Distributed Remote Workforces.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-secondary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">diversity_1</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">24/7 EAP for Employees &amp; Family</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Immediate access to certified psychologists, marriage counsellors, and life coaches for employees plus their immediate dependents.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-secondary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">insights</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">Wellbeing Compass for CHROs</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Anonymized organizational stress telemetry tracking team burnout indices, sentiment trends, and department wellness without violating individual privacy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-secondary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">Manager &amp; Leadership Enablement</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Interactive masterclasses helping people managers cultivate psychological safety, conduct empathetic check-ins, and prevent burnout cycles.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-secondary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">military_tech</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">Gamified Wellness Challenges</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Company-wide mindfulness sprints, step challenges, and stress detox streaks that boost cross-department morale and genuine app engagement.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-variant/20">
              <div className="text-xs text-on-surface-variant">
                <span className="font-bold text-on-surface">Commercial Model:</span> Flexible Per-Employee-Per-Year (PEPY) contract tailored to company headcount.
              </div>
              <button
                onClick={() => triggerCallbackModal("corporates")}
                className="px-5 py-2.5 rounded-full bg-[#E3F3EE] hover:bg-[#006F5B] border border-[#B9DFD4] hover:border-[#006F5B] text-[#006F5B] hover:text-white font-heading font-bold text-xs shadow-xs hover:shadow-md transition-all duration-300 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006F5B]/50"
              >
                Request Callback
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. WORKPLACE WELLNESS PILLARS ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-heading font-bold bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wider">
            WORKPLACE PSYCHOLOGICAL SAFETY
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-on-surface">
            Holistic Wellbeing Architecture for High-Performance Teams
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            From individual confidential therapy to leadership workshops, Manraah embeds wellness directly into the daily workday.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-[#E6F4F0]/80 dark:bg-[#1B332B] border border-[#CBECE2] dark:border-[#2E4E44] space-y-4 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">bedtime</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Workplace Burnout Prevention
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Micro-rituals designed to combat meeting fatigue, establish evening rest boundaries, and prevent quiet quitting.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-surface-variant/20 text-xs text-on-surface-variant font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Leave-Work-at-Work evening transition</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Midday 3-minute nervous system reset</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Screen fatigue decompression soundscapes</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-[#EDF6F2] dark:bg-[#20372F] border border-[#BCE2D2] dark:border-[#325246] space-y-4 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 text-[#006B56] dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">verified_user</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Confidential Employee Assessments
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Evidence-based self-assessments covering burnout, imposter syndrome, work-life balance, and chronic stress without HR tracking.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-surface-variant/20 text-xs text-on-surface-variant font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Zero employer surveillance guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Personal serenity and resilience scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Custom wellness habit recommendations</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-[#EAF5F0] dark:bg-[#1C342C] border border-[#B8DFC8] dark:border-[#2C4A3E] space-y-4 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">supervisor_account</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Manager &amp; Team Enablement
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Empower team leads and department heads with psychological safety frameworks, empathetic feedback tools, and burnout identification.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-surface-variant/20 text-xs text-on-surface-variant font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Certified Manager Psychological First Aid</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Empathetic 1-on-1 meeting guide</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">check_circle</span>
                <span>Early distress identification training</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ 4. CHRO WELLBEING COMPASS SECTION ═══ */}
      <section id="chro-compass" className="px-4 sm:px-6 max-w-6xl mx-auto pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container-low border border-surface-variant/40 space-y-8 shadow-card-lift">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-heading font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">analytics</span>
              <span>ORGANIZATIONAL WELLBEING TELEMETRY</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
              CHRO Wellbeing Compass: Data-Driven Psychological Safety
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Transform qualitative employee sentiment into quantifiable organizational vitality. Our enterprise dashboard delivers actionable macro insights while upholding strict zero-knowledge individual privacy:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary font-heading font-bold flex items-center justify-center text-xs">
                01
              </div>
              <h5 className="font-heading font-bold text-sm text-on-surface">Burnout Heatmap Analytics</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                De-identified department-level stress indexes that identify fatigue hotspots before they cause attrition or team derailment.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary font-heading font-bold flex items-center justify-center text-xs">
                02
              </div>
              <h5 className="font-heading font-bold text-sm text-on-surface">Measurable Wellness ROI</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Quarterly reports tracking uptake, sick leave reductions, presenteeism recovery, and estimated healthcare cost savings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary font-heading font-bold flex items-center justify-center text-xs">
                03
              </div>
              <h5 className="font-heading font-bold text-sm text-on-surface">Privacy-Preserving Telemetry</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Differential privacy mechanisms ensuring that any team smaller than 10 members is aggregated into broader clusters to eliminate re-identification.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl">query_stats</span>
              <span className="text-xs sm:text-sm font-heading font-bold text-on-surface">
                Want a live walkthrough of the CHRO Wellbeing Compass dashboard?
              </span>
            </div>
            <button
              onClick={() => triggerCallbackModal("corporates")}
              className="px-6 py-2.5 rounded-full bg-[#E3F3EE] hover:bg-[#006F5B] border border-[#B9DFD4] hover:border-[#006F5B] text-[#006F5B] hover:text-white font-heading font-bold text-xs shadow-xs hover:shadow-md transition-all duration-300 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006F5B]/50"
            >
              Request Dashboard Demo
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 5. CLINICAL GOVERNANCE & SECURITY ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-10 sm:pb-14">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-heading font-bold bg-secondary/15 text-secondary border border-secondary/20 uppercase tracking-wider">
            ENTERPRISE SECURITY &amp; CLINICAL STANDARDS
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-on-surface">
            Enterprise-Grade Compliance &amp; Absolute Confidentiality
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Engineered to satisfy stringent information security audits from global enterprises, BFSI institutions, and ISO/SOC standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">security</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Zero-Knowledge Encryption</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              End-to-end AES-256 encrypted chat and telehealth sessions. Neither employers nor third parties can ever access personal consultation records.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">database</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">100% Indian Data Residency</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              All servers, backups, and database clusters reside strictly within Indian sovereign borders in full compliance with the DPDP Act 2023.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] dark:bg-[#20372F] text-[#006B56] dark:text-[#88F7D6] border border-[#BCE2D2] dark:border-[#325246] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">RCI-Accredited Therapists</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Multi-tiered vetting ensures psychologists hold Rehabilitation Council of India licenses with clinical supervision and emergency triage certification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint/20 dark:bg-[#1B332B] text-[#006B56] dark:text-[#88F7D6] border border-mint/30 dark:border-[#2E4E44] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">family_restroom</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Full Dependent Coverage</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Support extends to employee spouses, elderly parents, and teenage children with specialized child/adolescent psychologists.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 6. BOTTOM CTA BAND ═══ */}
      <BottomCtaBand
        title="Looking for Individual Care?"
        description="Explore how Manraah also supports individual professionals and entrepreneurs with evening decompression, mood tracking, and AI companions."
        buttonText="Explore Features for Working Pros"
        buttonHref="/features"
        variant="green"
      />
    </div>
  );
}
