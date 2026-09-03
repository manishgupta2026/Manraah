"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentSleepContent() {
  const { sleepRecord, setActiveModal, setSleepTimeInput, setWakeTimeInput, setSleepQuality } = useStudentDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Sleep Tracking</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Log bedtime, wake up cycles, and sleep quality scores.</p>
        </div>
        <button
          onClick={() => {
            setSleepTimeInput("10:30 PM");
            setWakeTimeInput("06:30 AM");
            setSleepQuality(75);
            setActiveModal("sleep");
          }}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Log Sleep Session
        </button>
      </div>

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
          Sleep Summary
        </h3>

        {sleepRecord ? (
          <div className="p-5 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/30 dark:border-slate-750 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-xl">
              🛌
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <h4 className="text-xs font-black text-slate-850 dark:text-slate-100">Bedtime Cycle</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                  Sleep: {sleepRecord.bed_time} | Wake: {sleepRecord.wake_time}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Sleep Quality Score</span>
                  <span>{sleepRecord.quality_score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${sleepRecord.quality_score}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-bold py-6 text-center">No sleep logs created. Keep log to track sleep health.</p>
        )}
      </div>
    </div>
  );
}
