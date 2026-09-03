"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentFocusContent() {
  const {
    timeLeft,
    setTimeLeft,
    timerRunning,
    setTimerRunning,
    focusPreset,
    setFocusPreset,
    handleCompleteFocus
  } = useStudentDashboard();

  const handlePresetSelect = (mins: number) => {
    setFocusPreset(mins);
    setTimeLeft(mins * 60);
    setTimerRunning(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-8 text-left animate-fadeIn">
      <div className="text-center space-y-1">
        <span className="text-4xl block select-none">⏱️</span>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Study Focus Timer</h2>
        <p className="text-xs font-semibold text-slate-400">Calibrate your focus session and block distractions.</p>
      </div>

      {/* Timer Clock View */}
      <div className="py-12 rounded-[28px] bg-[#EBE7FC] dark:bg-[#0D1F2D] border border-[#5F4EA5]/15 flex flex-col items-center justify-center space-y-2 relative overflow-hidden">
        <div className="text-5xl md:text-6xl font-heading font-black text-[#100E26] dark:text-slate-100 tracking-widest font-mono">
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {timerRunning ? "Focus Session Active" : "Session Paused"}
        </p>
      </div>

      {/* Preset selections */}
      <div className="space-y-3">
        <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Choose Session Duration</label>
        <div className="grid grid-cols-3 gap-3">
          {[15, 25, 45].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handlePresetSelect(mins)}
              className={`py-3.5 rounded-2xl border text-xs font-black transition-all cursor-pointer text-center ${
                focusPreset === mins
                  ? "bg-[#F5F3FC] border-[#5F4EA5] text-[#5F4EA5] font-black"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              {mins} Mins
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={() => setTimerRunning(!timerRunning)}
          className="flex-1 py-4 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold">
            {timerRunning ? "pause" : "play_arrow"}
          </span>
          <span>{timerRunning ? "Pause Timer" : "Start Session"}</span>
        </button>
        
        <button
          onClick={() => {
            setTimerRunning(false);
            setTimeLeft(focusPreset * 60);
          }}
          className="px-6 py-4 rounded-full border border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-355 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
