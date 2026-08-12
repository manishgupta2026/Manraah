"use client";

import React from "react";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans py-12 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3 border-b border-surface-variant/30 pb-8">
          <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
            Security Infrastructure
          </p>
          <h1 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight">
            Security & Trust Center
          </h1>
          <p className="text-xs text-on-surface-variant font-medium">
            Enterprise-Grade Safeguards Protecting Your Mind & Data
          </p>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">lock</span>
            </div>
            <h3 className="font-heading font-extrabold text-base text-on-surface">
              End-to-End Encryption
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
              All chat transcripts, journal reflections, and personal responses are encrypted using AES-256 at rest and TLS 1.3 in transit.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-mint/25 text-[#006B56] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">shield_person</span>
            </div>
            <h3 className="font-heading font-extrabold text-base text-on-surface">
              Anonymous Alias Protection
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
              Community participation relies strictly on optional Sanctuary Aliases, insulating your public identity from your email address.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-peach/30 text-[#9E5D28] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">psychology</span>
            </div>
            <h3 className="font-heading font-extrabold text-base text-on-surface">
              Clinical & AI Safety Guardrails
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
              Our AI companion operates under strict evidence-based CBT guidelines, trained to recognize crisis triggers and route to human care.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-pink/25 text-[#A83256] flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">published_with_changes</span>
            </div>
            <h3 className="font-heading font-extrabold text-base text-on-surface">
              Continuous Vulnerability Audits
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-normal">
              Automated database backups, rate-limiting, and continuous vulnerability scans safeguard server stability and block unauthorized intrusions.
            </p>
          </div>
        </div>

        {/* Back Link Bar */}
        <div className="p-6 rounded-[24px] bg-surface-container border border-surface-variant/40 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">Contact Support</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
