"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentCheckinContent() {
  const {
    todayCheckin,
    checkinMood, setCheckinMood,
    checkinStress, setCheckinStress,
    checkinEnergy, setCheckinEnergy,
    checkinNote, setCheckinNote,
    isSubmittingCheckin,
    handleDailyCheckinSubmit,
  } = useStudentDashboard();

  return (
    <div className="max-w-xl mx-auto p-8 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6 text-left animate-fadeIn">
      {todayCheckin ? (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-3xl block">🌿</span>
            <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Today's Wellness Check-in</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed for today ✓</p>
          </div>

          <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-350">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3">
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Mood</span>
                <span className="text-sm font-black text-[#5F4EA5] dark:text-purple-300">{todayCheckin.mood}</span>
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Stress Level</span>
                <span className="text-sm font-black text-slate-850 dark:text-slate-100">{todayCheckin.stress}</span>
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Energy Level</span>
                <span className="text-sm font-black text-slate-850 dark:text-slate-100">{todayCheckin.energy}/5</span>
              </div>
              <div>
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Reflection Note</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mt-0.5 whitespace-pre-wrap leading-relaxed">
                  {todayCheckin.note || "No reflection note added."}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center space-y-1">
            <span className="text-3xl block">🌿</span>
            <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Daily Wellness Check-in</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">How are you feeling today?</p>
          </div>

          <form
            onSubmit={handleDailyCheckinSubmit}
            className="space-y-4 text-left"
          >
            {/* Mood selection */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Select Mood</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Good", emoji: "😊" },
                  { label: "Okay", emoji: "😐" },
                  { label: "Stressed", emoji: "😰" },
                  { label: "Overwhelmed", emoji: "😫" }
                ].map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setCheckinMood(m.label)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      checkinMood === m.label
                        ? "bg-[#F5F3FC] border-[#5F4EA5] text-[#5F4EA5] font-black scale-105"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl select-none">{m.emoji}</span>
                    <span className="text-[9px] font-bold leading-none">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Stress Level</label>
              <div className="grid grid-cols-4 gap-2">
                {["Low", "Moderate", "High", "Very High"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCheckinStress(lvl)}
                    className={`py-2 px-1 rounded-xl border text-[9px] font-bold text-center transition-all cursor-pointer ${
                      checkinStress === lvl
                        ? "bg-[#F5F3FC] border-[#5F4EA5] text-[#5F4EA5] font-black"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Energy Level (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCheckinEnergy(val)}
                    className={`w-10 h-10 rounded-full border text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                      checkinEnergy === val
                        ? "bg-[#5F4EA5] border-[#5F4EA5] text-white font-black scale-110"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Reflection */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Reflection Note (Optional)</label>
              <textarea
                rows={3}
                value={checkinNote}
                onChange={(e) => setCheckinNote(e.target.value)}
                placeholder="How was your day? Write a brief note..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-205 font-bold resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingCheckin}
              className="w-full py-3.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmittingCheckin ? "Submitting..." : "Submit Check-in"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
