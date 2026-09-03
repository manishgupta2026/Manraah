"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";
import { getAssessmentMetadata } from "@/frontend/lib/assessment/questions/onboarding";

export function StudentWellnessContent() {
  const { user, assessmentStatus, setOnboardingStep, setOnboardingAnswers, setIsAssessmentPopupOpen, profileCategory } = useStudentDashboard();
  const metadata = getAssessmentMetadata(user?.selectedCategory || profileCategory || "student");

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Wellness Sanctuary</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Track your wellness scores, assessment logs, and personalized tips.</p>
      </div>

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F3FC] dark:bg-slate-800 flex items-center justify-center shrink-0 text-xl">
            🧠
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest">
              {metadata.title}
            </h4>
            {assessmentStatus?.completed ? (
              <>
                <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <span className="text-emerald-500 font-extrabold text-sm leading-none">✓</span> Assessment completed
                </h5>
                <p className="text-[10px] text-slate-400 font-bold leading-normal">
                  Your wellness profile has been updated. Last completed: {assessmentStatus.latestAssessment?.completedAt ? new Date(assessmentStatus.latestAssessment.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                </p>
              </>
            ) : (
              <>
                <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  Uncompleted Profile Assessment
                </h5>
                <p className="text-[10px] text-slate-400 font-bold leading-normal">
                  Take the optional 10-question wellness test to calibrate your support system.
                </p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setOnboardingStep(1);
            setOnboardingAnswers([]);
            setIsAssessmentPopupOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          {assessmentStatus?.completed ? "Retake Assessment" : "Do Assessment"}
        </button>
      </div>
    </div>
  );
}
