"use client";

import React from "react";
import BottomCtaBand from "@/frontend/components/ui/BottomCtaBand";

export default function StudentsSolutionPage() {
  const triggerCallbackModal = (segment: "colleges" | "corporates" = "colleges") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-callback-modal", { detail: { segment } })
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-primary/12 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-96 left-10 w-96 h-96 bg-mint/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ═══ 1. HERO HEADER ═══ */}
      <section className="relative pt-12 pb-8 md:pt-20 md:pb-12 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-base">school</span>
          <span>CAMPUS &amp; HIGHER EDUCATION WELLNESS SUITE</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Stigma-Free Mental Health Infrastructure for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#005B48] to-secondary">
            India&apos;s Campuses &amp; Students
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed font-normal">
          From Supreme Court 2025 compliant student wellness programs to confidential 24/7 tele-counselling, Manraah replaces passive checklists with active, anonymous care for academic stress, exam anxiety, and emotional wellbeing.
        </p>

        {/* Top CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => triggerCallbackModal("colleges")}
            className="px-6 sm:px-8 py-3.5 rounded-full bg-primary text-white font-heading font-bold text-sm shadow-md hover:bg-[#005241] hover:shadow-lg active:scale-98 active:bg-[#004537] transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span className="material-symbols-outlined text-lg text-white">support_agent</span>
            <span className="text-white">Request Institutional Callback</span>
          </button>
          <a
            href="#compliance-section"
            className="px-6 py-3.5 rounded-full bg-primary text-white font-heading font-bold text-sm shadow-md hover:bg-[#005241] hover:shadow-lg active:scale-98 active:bg-[#004537] transition-all flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span className="text-white">Explore Supreme Court Compliance</span>
            <span className="material-symbols-outlined text-base text-white">arrow_downward</span>
          </a>
        </div>
      </section>

      {/* ═══ 2. CAMPUS REALITY & SUITE ARCHITECTURE ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto space-y-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: The Campus Reality */}
          <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl bg-surface-container-low/70 border border-surface-variant/30 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-error/10 text-error border border-error/20">
                The Campus Reality
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
                Why Students Avoid On-Campus Counselling
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Walking into a physical counselling room on campus carries social stigma. Over 84% of distressed students never seek help until it reaches an acute crisis point.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">visibility_off</span>
                <div>
                  <div className="text-xs font-heading font-bold text-on-surface">Fear of Exposure</div>
                  <div className="text-[11px] text-on-surface-variant">
                    Worries that professors, peers, or placement cells will find out about mental health consultations.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">timer_off</span>
                <div>
                  <div className="text-xs font-heading font-bold text-on-surface">Zero Late-Night Access</div>
                  <div className="text-[11px] text-on-surface-variant">
                    Severe emotional crises peak between 11 PM and 4 AM in hostels, when campus physical clinics are shuttered.
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">balance</span>
                <div>
                  <div className="text-xs font-heading font-bold text-on-surface">Mandatory SC Compliance</div>
                  <div className="text-[11px] text-on-surface-variant">
                    July 2025 Supreme Court ruling mandates 24/7 counsellor access, bi-annual staff training, and annual audit reports.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary font-semibold">
              💡 Manraah enables 100% anonymous care sponsored by the institution, keeping identities confidential from campus authorities.
            </div>
          </div>

          {/* Right: The Complete Manraah Campus Suite */}
          <div className="lg:col-span-7 p-7 sm:p-9 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                Campus Offering Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
                Comprehensive Student Wellness &amp; Compliance Suite
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Designed for Universities, Engineering Colleges, Medical Institutes, Coaching Hubs, and Residential Schools.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">vpn_key</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">100% Anonymous Teletherapy</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Students register with domain email (e.g., <code className="text-[10px] text-primary">@iitb.ac.in</code>) to unlock unlimited sessions. Names are never disclosed to the institution.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">schedule</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">24/7 Multi-Modal Care</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Immediate text chat, audio calls, or video counselling within 45 seconds. Covers 20+ Indian languages including Hindi, Marathi, Tamil, and Bengali.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">model_training</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">Faculty &amp; Staff Training</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Bi-annual certified workshops in Psychological First Aid for professors, wardens, and admin staff to spot distress signals early.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-surface-variant/20 space-y-2 hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">crisis_alert</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">Crisis Referral &amp; Tele-MANAS</h4>
                <p className="text-xs text-on-surface-variant leading-snug">
                  Automated triage protocols connecting acute cases to certified psychiatrists, emergency helplines, and institutional nodal officers.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-surface-variant/20">
              <div className="text-xs text-on-surface-variant">
                <span className="font-bold text-on-surface">MoU Model:</span> Predictable annual per-student contract with zero out-of-pocket fees for students.
              </div>
              <button
                onClick={() => triggerCallbackModal("colleges")}
                className="px-5 py-2.5 rounded-full bg-primary text-white font-heading font-bold text-xs shadow-xs hover:bg-[#005241] transition-all shrink-0 cursor-pointer"
              >
                Request Campus MoU Proposal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. STUDENT-SPECIFIC WELLNESS PILLARS ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-16">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
            TAILORED FOR ACADEMIC LIFE
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-on-surface">
            How Manraah Helps Students Overcome Daily Academic Stress
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Designed specifically for student lifestyles, late-night study cycles, exam pressures, and competitive environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-[#E6F4F0]/80 dark:bg-[#1B332B] border border-[#CBECE2] dark:border-[#2E4E44] space-y-4 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-mint/20 text-[#006B56] dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Student Wellness Assessments
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Anonymous life-stage evaluations designed for students to track emotional wellbeing, sleep health, burnout risk, and exam readiness over time.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-surface-variant/20 text-xs text-on-surface-variant font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Anxiety &amp; depression baseline scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Personalized coping &amp; study habits</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>100% confidential student dashboard</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-[#EDF6F2] dark:bg-[#20372F] border border-[#BCE2D2] dark:border-[#325246] space-y-4 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">headphones</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                Exam Stress &amp; CBT Soundscapes
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                Evidence-based cognitive restructuring prompts, binaural focus beats, and guided de-escalation audio to relieve acute test panic.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-surface-variant/20 text-xs text-on-surface-variant font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>15-min pre-exam nerve reset audio</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Anti-imposter syndrome journal prompts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Hostel sleep aid soundscapes</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-[#EAF5F0] dark:bg-[#1C342C] border border-[#B8DFC8] dark:border-[#2C4A3E] space-y-4 shadow-card-lift flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary dark:text-[#88F7D6] flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-on-surface">
                24/7 AI Companion &amp; Check-ins
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                An empathetic, non-judgmental AI companion available day or night for emotional decompression, daily mood logging, and peer grounding.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-surface-variant/20 text-xs text-on-surface-variant font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Late-night emotional venting companion</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Daily mood &amp; gratitude check-ins</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                <span>Immediate 45-second therapist escalation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ 4. SUPREME COURT COMPLIANCE SECTION ═══ */}
      <section id="compliance-section" className="px-4 sm:px-6 max-w-6xl mx-auto pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container-low border border-surface-variant/40 space-y-8 shadow-card-lift">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-xs font-heading font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">gavel</span>
              <span>REGULATORY COMPLIANCE MANDATE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
              Turn the Supreme Court 2025 Order Into a Frictionless Campus Standard
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Under the landmark Supreme Court judgment (<em>Sukdeb Saha v. State of Andhra Pradesh, July 2025</em>), student mental health is officially protected under the Article 21 Right to Life. Manraah directly addresses every core institutional mandate:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-heading font-bold flex items-center justify-center text-xs">
                01
              </div>
              <h5 className="font-heading font-bold text-sm text-on-surface">Qualified Counsellor Provisioning</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Every campus with 100+ students must appoint qualified mental health professionals. Manraah fulfills this with verified, RCI-registered psychologists on demand.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-heading font-bold flex items-center justify-center text-xs">
                02
              </div>
              <h5 className="font-heading font-bold text-sm text-on-surface">Mandatory Staff Training</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Teaching and non-teaching staff must undergo certified psychological first aid training twice annually. Manraah delivers and certifies all sessions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-heading font-bold flex items-center justify-center text-xs">
                03
              </div>
              <h5 className="font-heading font-bold text-sm text-on-surface">Annual Compliance &amp; Audit Report</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Automated audit dashboard capturing anonymous uptake, de-identified stress indicators, and training logs ready for submission to UGC, AICTE, or State Education Boards.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
              <span className="text-xs sm:text-sm font-heading font-bold text-on-surface">
                Need our ready-to-use Supreme Court 2025 Compliance Checklist?
              </span>
            </div>
            <button
              onClick={() => triggerCallbackModal("colleges")}
              className="px-6 py-2.5 rounded-full bg-secondary text-white font-heading font-bold text-xs shadow-xs hover:bg-[#005242] transition-colors shrink-0 cursor-pointer"
            >
              Request Compliance Pack &amp; Call
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 5. CLINICAL GOVERNANCE & TRUST ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pb-10 sm:pb-14">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <span className="px-3.5 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
            CLINICAL GOVERNANCE &amp; SAFETY
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-on-surface">
            Institutional Trust Engineered into Every Interaction
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            We hold our platform to the highest clinical protocols under Indian law, including the Mental Healthcare Act 2017, Telemedicine Practice Guidelines, and the DPDP Act.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint/20 text-[#006B56] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">badge</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">RCI-Registered Psychologists</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every clinical psychologist on our panel undergoes multi-stage credential verification, criminal background vetting, and continuous clinical supervision.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">lock</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">DPDP Act Compliant</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Strict parental consent mechanisms for users under 18, zero data tracking, zero ad monetization, and 100% Indian data residency standards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDF6F2] dark:bg-[#20372F] text-[#006B56] dark:text-[#88F7D6] border border-[#BCE2D2] dark:border-[#325246] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">emergency</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Standardized Crisis Escalation</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Automated high-risk sentiment triage linked with Tele-MANAS (14416) and institutional emergency referral pathways for acute self-harm prevention.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-mint/20 dark:bg-[#1B332B] text-[#006B56] dark:text-[#88F7D6] border border-mint/30 dark:border-[#2E4E44] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">translate</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Pan-India Language Empathy</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sessions conducted in 20+ Indian languages and dialects to ensure cultural resonance, emotional comfort, and nuanced communication.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 6. BOTTOM CTA BAND ═══ */}
      <BottomCtaBand
        title="Looking for Individual Student Care?"
        description="Explore how Manraah also supports individual students with self-paced wellness assessments, AI companions, and exam calm soundscapes."
        buttonText="Explore Features for Students"
        buttonHref="/features"
        variant="green"
      />
    </div>
  );
}
