"use client";

import React from "react";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentProfessionalCareContent() {
  const { upcomingAppointment, recommendedTherapist, setActiveModal } = useStudentDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Professional Care</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Book consultations with free student counselors and clinical therapists.</p>
        </div>
        <button
          onClick={() => setActiveModal("consult")}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          Book Counselor Check-in
        </button>
      </div>

      {upcomingAppointment && (
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          <h3 className="font-heading font-black text-xs text-slate-850 dark:text-slate-100 uppercase tracking-widest">
            Upcoming Appointment
          </h3>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={upcomingAppointment.avatar || "/images/therapist_sarah.jpg"}
                alt={upcomingAppointment.therapistName}
                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h5 className="text-xs font-heading font-black text-slate-850 dark:text-slate-100">{upcomingAppointment.therapistName}</h5>
                <p className="text-[9px] text-[#5F4EA5] dark:text-purple-300 font-bold">{upcomingAppointment.specialty}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-500">
              <p>🗓️ Date: {upcomingAppointment.date}</p>
              <p className="mt-1">⏱️ Time: {upcomingAppointment.time}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-slate-850 dark:text-slate-100 uppercase tracking-widest">
          Available Wellbeing Advisors
        </h3>
        {recommendedTherapist && (
          <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-750 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={recommendedTherapist.avatar}
                alt={recommendedTherapist.name}
                className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h5 className="text-xs font-heading font-black text-slate-850 dark:text-slate-100">{recommendedTherapist.name}</h5>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{recommendedTherapist.specialty}</p>
                <p className="text-[9px] text-[#5F4EA5] dark:text-purple-300 font-bold mt-1">⭐⭐⭐⭐⭐ Professional advisor</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal("consult")}
              className="px-5 py-3 rounded-2xl bg-[#5F4EA5] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#100E26] shadow-2xs cursor-pointer"
            >
              Consult
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
