"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BottomCtaBand from "@/frontend/components/ui/BottomCtaBand";

function SolutionContent() {
  const searchParams = useSearchParams();
  const targetParam = searchParams.get("target");

  const [activeTab, setActiveTab] = useState<"colleges" | "corporates">(
    targetParam === "corporates" ? "corporates" : "colleges"
  );

  useEffect(() => {
    if (targetParam === "corporates") {
      setActiveTab("corporates");
    } else if (targetParam === "colleges") {
      setActiveTab("colleges");
    }
  }, [targetParam]);

  const triggerCallbackModal = (segment: "colleges" | "corporates") => {
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
      <div className="absolute bottom-96 left-10 w-96 h-96 bg-primary-purple/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ═══ 1. HERO HEADER ═══ */}
      <section className="relative pt-12 pb-10 md:pt-20 md:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-base">domain</span>
          <span>MANRAAH INSTITUTIONAL SUITE &bull; CAMPUSES &amp; WORKPLACES</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          Empowering India&apos;s Campuses &amp; Workplaces with{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#7C6BC4] to-secondary">
            Stigma-Free Mental Health Infrastructure
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed font-normal">
          From Supreme Court 2025 compliant student wellness packages to high-engagement enterprise EAPs, Manraah replaces passive checklists with 24/7 anonymous, outcome-driven emotional care.
        </p>

        {/* Top CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => triggerCallbackModal(activeTab)}
            className="px-6 sm:px-8 py-3.5 rounded-full bg-primary text-white font-heading font-bold text-sm shadow-md hover:bg-primary-purple hover:shadow-lg active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">support_agent</span>
            <span>Request Institutional Callback</span>
          </button>
          <a
            href="#compliance-section"
            className="px-6 py-3.5 rounded-full bg-surface-container border border-surface-variant/40 hover:bg-surface-variant/30 text-on-surface font-heading font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <span>Explore Supreme Court Compliance</span>
            <span className="material-symbols-outlined text-base">arrow_downward</span>
          </a>
        </div>

        {/* Segment Switcher Tabs */}
        <div className="pt-6 max-w-xl mx-auto">
          <div className="p-1.5 rounded-2xl bg-surface-container border border-surface-variant/30 grid grid-cols-2 gap-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab("colleges")}
              className={`py-3 px-3 sm:px-5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "colleges"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">school</span>
              <span>For Students &amp; Colleges</span>
            </button>
            <button
              onClick={() => setActiveTab("corporates")}
              className={`py-3 px-3 sm:px-5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "corporates"
                  ? "bg-surface-container-lowest text-secondary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">corporate_fare</span>
              <span>For Employees &amp; Corporates</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 2. DYNAMIC TAB CONTENT ═══ */}
      <AnimatePresence mode="wait">
        {activeTab === "colleges" ? (
          /* ============================================================
             TAB 1: FOR STUDENTS & HIGHER EDUCATION / SCHOOLS
             ============================================================ */
          <motion.div
            key="tab-colleges"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-16"
          >
            {/* 1A. Problem vs Manraah Solution Grid */}
            <section className="px-4 sm:px-6 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left: The Campus Reality & Compliance Urgency */}
                <div className="lg:col-span-5 p-7 sm:p-9 rounded-3xl bg-surface-container-low/70 border border-surface-variant/30 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-heading font-bold uppercase tracking-wider bg-error/10 text-error border border-error/20">
                      The Campus Reality
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
                      Why Students Avoid On-Campus Counselling
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      Walking into a physical counselling room on campus carries devastating social stigma. Over 84% of distressed students never seek help until it reaches an acute crisis point.
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
                          Severe emotional crises peak between 11 PM and 4 AM, when campus physical clinics are shuttered.
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
                      className="px-5 py-2.5 rounded-full bg-primary text-white font-heading font-bold text-xs shadow-xs hover:bg-primary-purple transition-all shrink-0 cursor-pointer"
                    >
                      Request Campus MoU Proposal
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 1B. Supreme Court 2025 Compliance Breakdown */}
            <section id="compliance-section" className="px-4 sm:px-6 max-w-6xl mx-auto">
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-surface-container-low border border-surface-variant/40 space-y-8">
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
          </motion.div>
        ) : (
          /* ============================================================
             TAB 2: FOR CORPORATES & ENTERPRISE WORKPLACES
             ============================================================ */
          <motion.div
            key="tab-corporates"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="space-y-16"
          >
            {/* 2A. Corporate Problem vs Manraah EAP Solution */}
            <section className="px-4 sm:px-6 max-w-6xl mx-auto">
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
                          High-velocity engineering, sales, and operations teams face chronic unaddressed emotional exhaustion.
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
                      className="px-5 py-2.5 rounded-full bg-secondary text-white font-heading font-bold text-xs shadow-xs hover:bg-[#005242] transition-all shrink-0 cursor-pointer"
                    >
                      Request Corporate EAP Pricing
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 3. CLINICAL GOVERNANCE & TRUST SECTION ═══ */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto pt-16 pb-12">
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
            <div className="w-10 h-10 rounded-xl bg-[#9E5D28]/15 text-[#9E5D28] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">emergency</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Standardized Crisis Escalation</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Automated high-risk sentiment triage linked with Tele-MANAS (14416) and institutional emergency referral pathways for acute self-harm prevention.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink/25 text-[#874959] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">translate</span>
            </div>
            <h4 className="font-heading font-bold text-sm text-on-surface">Pan-India Language Empathy</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Sessions conducted in 20+ Indian languages and dialects to ensure cultural resonance, emotional comfort, and nuanced communication.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ 4. DEDICATED CALLBACK CTA BANNER ═══ */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-primary via-[#7C6BC4] to-secondary text-white text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center mx-auto border border-white/20 shadow-inner">
            <span className="material-symbols-outlined text-3xl">support_agent</span>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-heading font-black tracking-tight">
              Ready to Transform Your Campus or Workplace?
            </h3>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed font-normal">
              Schedule a 20-minute discovery session with our Institutional Care Director. We will walk you through customized deployment models, SC 2025 compliance checklists, and volume pricing.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => triggerCallbackModal(activeTab)}
              className="px-8 py-3.5 rounded-full bg-white text-primary hover:bg-white/95 font-heading font-extrabold text-sm shadow-lg active:scale-98 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Schedule Institutional Callback</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-heading font-bold text-sm transition-all"
            >
              Contact Support
            </Link>
          </div>

          <p className="text-[11px] text-white/70">
            ⚡ Quick 4-hour response SLA &bull; Tailored for Directors, Deans &amp; CHROs
          </p>
        </div>
      </section>

      {/* ═══ 5. BOTTOM CTA BAND ═══ */}
      <BottomCtaBand
        title="Looking for Individual Personal Care?"
        description="Explore how Manraah also supports individual students, working professionals, and parents with daily wellness journeys and AI companions."
        buttonText="Explore Features for Individuals"
        buttonHref="/features"
      />
    </div>
  );
}

export default function OurSolutionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SolutionContent />
    </Suspense>
  );
}
