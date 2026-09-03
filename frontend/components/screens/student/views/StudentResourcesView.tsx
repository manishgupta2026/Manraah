"use client";

import React from "react";

export function StudentResourcesContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Sanctuary Resources</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Read self-care guides, breathing manuals, audio, and wellness reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Breathing Exercises 101", desc: "Ground stress immediately using simple square breathing.", icon: "air" },
          { title: "Study Hacks for Exam Stress", desc: "Scientific methods to avoid cramming and prepare calmly.", icon: "school" },
          { title: "Sleep Hygiene Guidelines", desc: "Tips to maintain quality bedtime patterns.", icon: "bedtime" },
          { title: "Mindful Journal Writing Guide", desc: "How to use logs to release emotional weight.", icon: "auto_stories" },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#5F4EA5]/10 text-[#5F4EA5] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </div>
            <h4 className="font-heading font-black text-xs text-slate-850 dark:text-slate-100">{item.title}</h4>
            <p className="text-[10px] text-slate-400 font-bold leading-normal">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
