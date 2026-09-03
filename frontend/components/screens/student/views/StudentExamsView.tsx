"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";
import { displayExamDate } from "@/frontend/components/screens/StudentDashboard";
import type { Exam } from "@/frontend/components/screens/student/types";

export function StudentExamsContent() {
  const { exams, setActiveModal, setEditingExamId, setExamName, setExamSubject, setExamDate, setExamTime, setExamPriority, setExamProgress } = useStudentDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Exams Schedule</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Monitor upcoming tests, prep progress, and dates.</p>
        </div>
        <button
          onClick={() => {
            setExamName("");
            setExamSubject("");
            setExamDate(new Date().toISOString().split("T")[0]);
            setExamTime("09:00 AM");
            setExamPriority("Medium");
            setExamProgress(50);
            setEditingExamId(null);
            setActiveModal("exam");
          }}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Schedule Exam
        </button>
      </div>

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
          Scheduled Exams ({exams.length})
        </h3>

        {exams.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold py-6 text-center">No exams scheduled. Relax, or schedule one if needed.</p>
        ) : (
          <div className="space-y-2">
            {exams.map((exam: Exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-750 flex items-center justify-between gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[8px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {exam.subject}
                    </span>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      exam.priority.toLowerCase() === "high" ? "bg-red-50 dark:bg-red-950/20 text-red-600" :
                      exam.priority.toLowerCase() === "low" ? "bg-slate-100 dark:bg-slate-850 text-slate-500" :
                      "bg-amber-50 dark:bg-amber-950/20 text-amber-600"
                    }`}>
                      {exam.priority}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">{exam.name || exam.exam_name}</h4>
                    <p className="text-[9px] text-slate-400 font-bold">
                      🗓️ {displayExamDate(exam.date || exam.exam_date)} | ⏱️ {exam.time || exam.exam_time}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      <span>Prep Progress</span>
                      <span>{exam.progress || exam.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-400 rounded-full" 
                        style={{ width: `${exam.progress || exam.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setExamName(exam.name || exam.exam_name);
                    setExamSubject(exam.subject);
                    const examDateStr = exam.date || exam.exam_date;
                    setExamDate(examDateStr ? new Date(examDateStr).toISOString().split("T")[0] : "");
                    setExamTime(exam.time || exam.exam_time);
                    setExamPriority(exam.priority);
                    setExamProgress(exam.progress || exam.progress_percentage || 0);
                    setEditingExamId(exam.id);
                    setActiveModal("exam");
                  }}
                  className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
