"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentJournalContent() {
  const { setActiveModal, data, setJournalTitle, setJournalContent, setJournalMood } = useStudentDashboard();
  const journalEntries = data?.journalEntries || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Private Journal</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Reflect honestly in your completely private and encrypted sanctuary journal.</p>
        </div>
        <button
          onClick={() => {
            setJournalTitle("");
            setJournalContent("");
            setJournalMood("Reflective");
            setActiveModal("journal");
          }}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Write New Entry
        </button>
      </div>

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
          Journal Entries ({journalEntries.length})
        </h3>

        {journalEntries.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold py-6 text-center">No journal logs written. Start journaling to track your mental state.</p>
        ) : (
          <div className="space-y-3">
            {journalEntries.map((j: any) => (
              <div
                key={j.id}
                className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-750 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {j.mood_tag}
                    </span>
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 mt-1">{j.title}</h4>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(j.created_at || j.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap pt-1 border-t border-slate-100 dark:border-slate-700/50">
                  {j.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
