"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/StudentDashboard";

export function WorkingProfessionalAnalyticsContent() {
  const { isDarkMode } = useStudentDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Analytics</h2>
        <p className="text-xs font-semibold text-slate-450 mt-1">
          Work-life metrics, mood statistics, and decompression indicators.
        </p>
      </div>

      {/* Main Premium Coming Soon Card */}
      <div className="p-8 md:p-12 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center text-center space-y-6 relative overflow-hidden">
        
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-200/20 dark:bg-purple-900/10 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-100/20 dark:bg-amber-950/10 rounded-full filter blur-2xl pointer-events-none" />

        {/* Coming Soon Badge */}
        <span className="px-4 py-1.5 rounded-full bg-[#5F4EA5]/10 dark:bg-[#5F4EA5]/25 text-[#5F4EA5] dark:text-purple-300 text-[10px] font-black uppercase tracking-widest leading-none">
          ✨ Coming Soon
        </span>

        {/* Big visual icon */}
        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/40 dark:border-slate-700 flex items-center justify-center text-[#5F4EA5] dark:text-purple-300 shadow-2xs">
          <span className="material-symbols-outlined text-3xl font-black">monitoring</span>
        </div>

        {/* Content */}
        <div className="space-y-3 max-w-lg">
          <h3 className="font-heading font-black text-lg text-[#100E26] dark:text-slate-100">
            Your work and wellness insights are coming soon.
          </h3>
          <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-semibold">
            Track productivity, focus, habits, work-life balance, and personal progress in one place. We are crafting a highly customized statistical dashboard to help you align your professional milestones with emotional sanctuary care.
          </p>
        </div>

        {/* Sneak peek grids */}
        <div className="w-full pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/20 dark:border-slate-750 flex flex-col items-center space-y-2">
            <span className="material-symbols-outlined text-lg text-emerald-500">timer</span>
            <span className="text-[10px] font-black uppercase text-[#100E26] dark:text-slate-200 tracking-wider">
              Focus Trends
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Deep work logs
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/20 dark:border-slate-750 flex flex-col items-center space-y-2">
            <span className="material-symbols-outlined text-lg text-[#5F4EA5] dark:text-purple-400">balance</span>
            <span className="text-[10px] font-black uppercase text-[#100E26] dark:text-slate-200 tracking-wider">
              Work-Life Score
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Personal rhythm indicators
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/20 dark:border-slate-750 flex flex-col items-center space-y-2">
            <span className="material-symbols-outlined text-lg text-amber-500">bedtime</span>
            <span className="text-[10px] font-black uppercase text-[#100E26] dark:text-slate-200 tracking-wider">
              Sleep Quality
            </span>
            <span className="text-[9px] font-semibold text-slate-400">
              Bedtime stability analysis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
