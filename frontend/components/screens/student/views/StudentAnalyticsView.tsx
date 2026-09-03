"use client";

import React from "react";

export function StudentAnalyticsContent() {
  return (
    <div className="max-w-4xl mx-auto p-12 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-[28px] bg-[#5F4EA5]/10 text-[#5F4EA5] flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-4xl">bar_chart</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-black text-slate-850 dark:text-slate-100">Mindfulness Analytics</h2>
        <p className="text-xs font-semibold text-slate-400 leading-normal max-w-sm mx-auto">
          View custom reports showing your mood charts, sleep patterns, study metrics, and stress tracking metrics.
        </p>
      </div>

      <div className="inline-block py-2 px-5 rounded-full bg-[#5F4EA5]/5 border border-[#5F4EA5]/15 text-[10px] font-black text-[#5F4EA5] uppercase tracking-wider">
        🚀 Coming Soon to Sanctuary
      </div>
    </div>
  );
}
