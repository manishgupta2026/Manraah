"use client";

import React from "react";
import { MOCK_USER } from "@/frontend/lib/mock-data";

export default function WellnessReportsScreen() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
              Clinical Wellness Insights
            </span>
            <h1 className="text-3xl font-heading font-bold text-on-surface mt-2">Monthly Serenity & Mood Report</h1>
            <p className="text-sm text-on-surface-variant">Generated for {MOCK_USER.name} • August 2026</p>
          </div>
          <button className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-purple transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-on-surface">Emotional Stability Index</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your mood variance decreased by 18% over the past 30 days, indicating sustained emotional regulation and improved stress recovery times.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-peach/30 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">psychology_alt</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-on-surface">AI Companion Interaction Insights</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Top themes discussed during chat sessions included academic exam prep, sleep routine adjustments, and daily breathing exercises.
          </p>
        </div>
      </div>
    </div>
  );
}
