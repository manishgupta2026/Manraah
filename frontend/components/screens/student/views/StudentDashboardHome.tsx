"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";
import { displayExamDate } from "@/frontend/lib/date-utils";
import type { StudyTask, Exam } from "../types";

// --- Main Dashboard Cards Content Grid ---
export function StudentDashboardContent() {
  const router = useRouter();
  const {
    data,
    tasks,
    exams,
    upcomingAppointment,
    focusSession,
    sleepRecord,
    todayCheckin,
    progressPercent,
    todayMood,
    pathD,
    moodPoints,
    wellnessActivities,
    recommendedTherapist,
    activeModal, setActiveModal,
    handleToggleTaskComplete,
    togglingTaskId,
    assessmentStatus,
    assessmentStatusLoading,
    assessmentStatusError,
    fetchAssessmentStatus,
    setOnboardingStep,
    setOnboardingAnswers,
    setIsAssessmentPopupOpen,
    formatFocusDuration,
    setExamName,
    setExamSubject,
    setExamDate,
    setExamTime,
    setExamPriority,
    setExamProgress,
    setEditingExamId
  } = useStudentDashboard();

  const upcomingExams = exams
    .filter((exam: Exam) => {
      const examDate = exam.date || exam.exam_date;
      if (!examDate) return false;
      const examDateObj = new Date(examDate);
      if (isNaN(examDateObj.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return examDateObj >= today;
    })
    .sort((a: Exam, b: Exam) => {
      const dateA = new Date(a.date || a.exam_date).getTime();
      const dateB = new Date(b.date || b.exam_date).getTime();
      return dateA - dateB;
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-[22px] lg:gap-6 max-w-[1600px] mx-auto w-full items-start animate-fadeIn">
      
      {/* ==================== LEFT COLUMN (xl-col-span-3) ==================== */}
      <div className="col-span-1 md:col-start-1 md:row-start-1 md:col-span-1 xl:col-span-3 xl:col-start-1 xl:row-start-1 xl:row-span-1 space-y-[22px] lg:space-y-6 order-2 xl:order-none">
        
        {/* Daily Check-in Card */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[290px] relative overflow-hidden text-left">
          {todayCheckin && (
            <div className="absolute inset-0 pointer-events-none opacity-40 select-none">
              <span className="absolute bottom-4 left-6 w-2 h-2 rounded-full bg-emerald-400 animate-float-slow" style={{ animationDelay: '0s' }} />
              <span className="absolute bottom-8 left-16 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-float-slow" style={{ animationDelay: '1.5s' }} />
              <span className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-emerald-400 animate-float-slow" style={{ animationDelay: '0.8s' }} />
            </div>
          )}

          <div className="space-y-4 z-10">
            {/* smiley avatar */}
            <div className="w-full flex justify-center py-1">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center relative shadow-inner ${
                todayCheckin ? (
                  todayCheckin.mood.toLowerCase() === "okay" ? "bg-amber-50 dark:bg-amber-950/20 animate-pulse-slow" :
                  todayCheckin.mood.toLowerCase() === "stressed" ? "bg-red-50 dark:bg-red-950/20 animate-glow-slow shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                  todayCheckin.mood.toLowerCase() === "overwhelmed" ? "bg-purple-50 dark:bg-purple-950/20 animate-orbit-slow" :
                  "bg-emerald-50 dark:bg-emerald-950/20"
                ) : "bg-[#EBE7FC] dark:bg-slate-850"
              }`}>
                <span className="text-2xl select-none">
                  {todayCheckin ? (
                    todayCheckin.mood.toLowerCase() === "good" || todayCheckin.mood.toLowerCase() === "happy" ? "😊" :
                    todayCheckin.mood.toLowerCase() === "okay" || todayCheckin.mood.toLowerCase() === "calm" ? "😐" :
                    todayCheckin.mood.toLowerCase() === "stressed" ? "😰" :
                    todayCheckin.mood.toLowerCase() === "overwhelmed" ? "😫" : "😊"
                  ) : "🌸"}
                </span>
                {todayCheckin && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[8px] font-black text-white items-center justify-center">✓</span>
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-center">
              <h4 className="text-sm font-heading font-black text-[#100E26] dark:text-slate-100">
                {todayCheckin ? "Check-in Logged!" : "Daily Sanctuary Reset"}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold leading-normal px-2">
                {todayCheckin
                  ? `You logged feeling ${todayCheckin.mood} today. Keep it up!`
                  : "How are you holding up today? Log your stress and mood to recalibrate."}
              </p>
            </div>
          </div>

          <div className="z-10 mt-6">
            {todayCheckin ? (
              <button
                onClick={() => {
                  setActiveModal("checkin");
                }}
                className="w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/50 dark:bg-emerald-950/20 text-[#5FAF8A] text-[9px] font-black uppercase tracking-widest text-center border border-emerald-100/30 transition-colors cursor-pointer"
              >
                View Check-in
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveModal("checkin");
                }}
                className="w-full py-3.5 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Check-in Now
              </button>
            )}
          </div>
        </div>

        {/* Student Writing Desk Illustration */}
        <div className="rounded-[28px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 group relative">
          <img
            src="/images/student_studying.jpg"
            alt="Student studying at desk"
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105 select-none"
          />
          <div className="absolute inset-0 bg-[#5F4EA5]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        {/* 100% Confidential card */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-start gap-4 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FC] dark:bg-slate-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg text-[#5F4EA5]">lock</span>
          </div>
          <div>
            <h5 className="text-[11px] font-black text-[#100E26] dark:text-slate-100">100% Confidential</h5>
            <p className="text-[9px] text-slate-400 font-bold leading-normal mt-0.5">
              Your privacy is our top priority. Your data is safe and secure.
            </p>
          </div>
        </div>

        {/* Today's Motivation quote card */}
        <div className="rounded-[28px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative min-h-[160px] border border-slate-200/60 dark:border-slate-800 bg-white group">
          <img
            src="/images/motivation_bg.png"
            alt="Motivation background"
            className="absolute inset-0 w-full h-full object-cover object-bottom select-none transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 p-5 lg:p-6 flex flex-col justify-between text-left z-10">
            <h6 className="text-[9px] font-black text-[#5F4EA5] uppercase tracking-wider">Today's Motivation</h6>
            <p className="text-xs font-heading font-black text-[#100E26] leading-relaxed pr-8 pt-4">
              "{data?.motivation || "Your sanctuary is here to support you at every step."}"
            </p>
            <div />
          </div>
        </div>

      </div>

      {/* ==================== MIDDLE COLUMN (xl-col-span-6) ==================== */}
      <div className="col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 md:col-span-1 xl:col-span-6 xl:col-start-4 xl:row-start-1 xl:row-span-1 space-y-[22px] lg:space-y-6 order-1 xl:order-none">
        
        {/* Welcome back header */}
        <div className="text-left">
          <p className="text-[9px] font-black text-[#5F4EA5] uppercase tracking-widest">WELCOME BACK</p>
          <h2 className="text-2xl md:text-3xl font-heading font-black text-[#100E26] dark:text-slate-100 mt-0.5">
            Hi, {data?.user?.name?.split(" ")[0] || "Aarav"}! 👋
          </h2>
          <p className="text-[11px] text-slate-500 font-bold mt-1">
            Let's make today a step closer to your goals.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2.5 mt-3">
            <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 text-[#5F4EA5] flex items-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              🎓 Student
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 text-[#E7A95F] flex items-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              🔥 {data?.user?.streakDays ?? 7} Day Streak
            </span>
            <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 text-[#5FAF8A] flex items-center gap-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
              😊 Feeling: {data?.user?.currentMood ?? "Good"}
            </span>
          </div>
        </div>

        {/* Student Wellness Assessment Status Card */}
        {assessmentStatusLoading ? (
          <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] animate-pulse h-32 flex items-center justify-center text-xs text-slate-400 font-bold">
            Loading assessment status...
          </div>
        ) : assessmentStatusError ? (
          <div className="p-5 lg:p-6 rounded-[28px] bg-red-50/50 dark:bg-red-950/10 border border-red-200/40 dark:border-red-900/40 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-red-500 uppercase tracking-widest">Student Wellness Assessment</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Unable to load assessment status</p>
            </div>
            <button
              onClick={fetchAssessmentStatus}
              className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-heading font-black text-[10px] uppercase tracking-wider hover:bg-red-200 transition-all shadow-2xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : assessmentStatus ? (
          <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F3FC] dark:bg-slate-800 flex items-center justify-center shrink-0 text-xl select-none">
                🧠
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest leading-none">
                  STUDENT WELLNESS ASSESSMENT
                </h4>
                {assessmentStatus.completed ? (
                  <>
                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="text-emerald-500 font-extrabold text-sm leading-none">✓</span> Assessment completed
                    </h5>
                    <p className="text-[9px] text-slate-400 font-bold leading-normal">
                      Your wellness profile has been updated. Last completed: {assessmentStatus.latestAssessment?.completedAt ? new Date(assessmentStatus.latestAssessment.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                    </p>
                  </>
                ) : (
                  <>
                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">
                      Complete Your Assessment
                    </h5>
                    <p className="text-[9px] text-slate-400 font-bold leading-normal">
                      Help us understand your wellness needs and personalize your Manraah experience.
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
              className={`px-5 py-3 rounded-2xl font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs shrink-0 self-stretch sm:self-auto text-center cursor-pointer ${
                assessmentStatus.completed
                  ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                  : "bg-[#5F4EA5] hover:bg-[#100E26] text-white"
              }`}
            >
              {assessmentStatus.completed ? "Retake Assessment" : "Do Assessment"}
            </button>
          </div>
        ) : null}

        {/* Upcoming Appointment */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 text-left">
          <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
            Upcoming Appointment
          </h4>

          {upcomingAppointment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
                {/* Left Hospital Card */}
                <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-[#FBFBFF] dark:bg-[#0D1F2D] shadow-3xs flex flex-col justify-between">
                  <img
                    src="/images/care_hospital.jpg"
                    alt="Care hospital facility"
                    className="w-full h-24 object-cover select-none"
                  />
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-center">
                    <h5 className="text-[10px] font-black text-slate-850 dark:text-slate-150 uppercase tracking-wider">Sanctuary Health Center</h5>
                    <p className="text-[8px] text-slate-400 font-bold leading-normal">
                      Suite 300, Medical Plaza Road. Fully covered by student insurance check.
                    </p>
                  </div>
                </div>

                {/* Right Specialist Card */}
                <div className="p-4 rounded-2xl border border-slate-150/60 dark:border-slate-800 bg-white dark:bg-[#132E3F] shadow-3xs flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={upcomingAppointment.avatar || "/images/therapist_sarah.jpg"}
                      alt={upcomingAppointment.therapistName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                    />
                    <div className="text-left flex flex-col justify-center">
                      <h5 className="text-[11px] font-heading font-black text-slate-850 dark:text-slate-100 truncate max-w-[130px]">
                        {upcomingAppointment.therapistName}
                      </h5>
                      <span className="text-[9px] text-[#5F4EA5] dark:text-purple-300 font-bold leading-none mt-0.5">
                        {upcomingAppointment.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[9px] font-bold text-slate-500 dark:text-slate-400 space-y-0.5 text-left mt-3">
                    <p>🗓️ Date: {upcomingAppointment.date}</p>
                    <p>⏱️ Time: {upcomingAppointment.time}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveModal("consult")}
                  className="flex-1 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white font-bold text-[10px] uppercase tracking-wider shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  Manage Appointment
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3.5">
              <span className="text-2xl select-none block">🩺</span>
              <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto leading-normal">
                No active appointments booked. You can book a free virtual call with our clinical therapist.
              </p>
              <button
                onClick={() => setActiveModal("consult")}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors shadow-3xs cursor-pointer"
              >
                Book Free Consultation
              </button>
            </div>
          )}
        </div>

        {/* Study Planner Board / Task log card */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
              Study Planner Tasks
            </h4>
            <button
              onClick={() => {
                router.push("/dashboard/student/study-planner");
              }}
              className="text-[9px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest hover:underline"
            >
              Manage &rarr;
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 font-bold py-4 text-center">No current study tasks active.</p>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 3).map((task: StudyTask) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? "bg-slate-50/50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800 opacity-60"
                      : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-250/20 dark:border-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!task.completed}
                      disabled={togglingTaskId === task.id}
                      onChange={() => handleToggleTaskComplete(task.id, task.completed)}
                      className="w-4 h-4 rounded border-slate-300 text-[#5F4EA5] focus:ring-[#5F4EA5] cursor-pointer"
                    />
                    <div>
                      <span className="text-[8px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 dark:bg-[#5F4EA5]/25 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        {task.subject}
                      </span>
                      <p className={`text-xs font-black text-slate-850 dark:text-slate-200 mt-1 ${task.completed ? "line-through" : ""}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exams schedule log card */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
              Upcoming Exams
            </h4>
            <button
              onClick={() => {
                router.push("/dashboard/student/exams");
              }}
              className="text-[9px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest hover:underline"
            >
              Manage &rarr;
            </button>
          </div>

          {upcomingExams.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-slate-400 font-bold">No upcoming exams</p>
              <button
                onClick={() => {
                  setExamName("");
                  setExamSubject("");
                  setExamDate(new Date().toISOString().split("T")[0]);
                  setExamTime("09:00 AM");
                  setExamPriority("Medium");
                  setExamProgress(0);
                  setEditingExamId(null);
                  setActiveModal("exam");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#5F4EA5]/15 hover:bg-[#5F4EA5]/25 text-[#5F4EA5] dark:text-purple-300 font-heading font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-xs"
              >
                Add Exam
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingExams.slice(0, 2).map((exam: Exam) => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-750 flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-[8px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                      {exam.subject}
                    </span>
                    <h5 className="text-xs font-black text-slate-850 dark:text-slate-200 mt-1">{exam.name || exam.exam_name}</h5>
                    <p className="text-[8px] text-slate-400 font-bold">Due: {displayExamDate(exam.date || exam.exam_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ==================== RIGHT COLUMN (xl-col-span-3) ==================== */}
      <div className="col-span-1 md:col-start-1 md:row-start-2 xl:col-span-3 xl:col-start-10 xl:row-start-1 xl:row-span-1 space-y-[22px] lg:space-y-6 order-3 xl:order-none">
        
        {/* Mindfulness Minutes */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[180px] text-left">
          <div className="space-y-0.5">
            <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Mindfulness Time</h5>
            <p className="text-[8px] text-emerald-500 font-black uppercase">Today's Progress</p>
          </div>

          <div className="py-2.5 flex items-baseline gap-1 select-none">
            <span className="text-4xl font-heading font-black text-[#100E26] dark:text-slate-100">
              {data?.user?.mindfulnessMinutes ?? 15}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">mins</span>
          </div>

          <button
            onClick={() => router.push("/dashboard/student/focus")}
            className="w-full py-2.5 rounded-2xl bg-[#5F4EA5]/5 hover:bg-[#5F4EA5]/10 text-[#5F4EA5] dark:text-purple-300 text-[9px] font-black uppercase tracking-widest text-center border border-[#5F4EA5]/10 transition-colors cursor-pointer"
          >
            Start Session
          </button>
        </div>

        {/* Study Statistics card */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[180px] text-left">
          <div className="space-y-0.5">
            <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Study Statistics</h5>
            <p className="text-[8px] text-[#E7A95F] font-black uppercase">Target / Achievements</p>
          </div>

          <div className="py-2 border-b border-slate-50 dark:border-slate-800/40 text-[9px] font-bold text-slate-500 dark:text-slate-450 space-y-1">
            <p>⏱️ Focused duration: {formatFocusDuration(focusSession?.duration || 0)}</p>
            <p>✅ Completed intervals: {focusSession?.completed || 0} / {focusSession?.total || 3}</p>
          </div>

          <button
            onClick={() => {
              setActiveModal("focus");
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 text-[9px] font-black uppercase tracking-widest text-center border border-slate-100 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Open Pomodoro Clock
          </button>
        </div>

        {/* Weekly Reflection checklist card */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[180px] text-left">
          <div className="space-y-2">
            <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Weekly reflection</h5>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px] text-slate-700 dark:text-slate-300 font-semibold leading-normal">
                <span className="text-emerald-500">✓</span> Daily Check-in done
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-750 dark:text-slate-350 font-semibold leading-normal">
                <span className="text-slate-300 dark:text-slate-700">○</span> Log sleep time (target 7h+)
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-750 dark:text-slate-350 font-semibold leading-normal">
                <span className="text-slate-300 dark:text-slate-700">○</span> Complete pomodoro focus timer
              </div>
            </div>
          </div>
          <div />
        </div>

        {/* Mood Overview Chart */}
        <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[180px] text-left">
          <div className="space-y-0.5">
            <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Mood Overview</h5>
            <p className="text-[8px] text-[#5F4EA5] font-bold uppercase">This Week</p>
          </div>

          {/* Line Chart */}
          <div className="h-16 relative flex items-end pt-2 select-none">
            {/* Grid Lines */}
            <div className="absolute inset-x-0 top-2 border-t border-slate-100 dark:border-slate-800/40" />
            <div className="absolute inset-x-0 top-8 border-t border-[#F0EEFC]/50 dark:border-slate-800/40" />
            
            {/* SVG line */}
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <motion.path
                d={pathD}
                fill="none"
                stroke="#5F4EA5"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              {moodPoints && moodPoints.map((pt: any, i: number) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="2" fill="#FFFFFF" stroke="#5F4EA5" strokeWidth="1" />
              ))}
            </svg>
          </div>

          <div className="flex justify-between text-[7px] font-black text-slate-400 uppercase tracking-widest">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>

      </div>

      {/* ==================== BOTTOM FULL-WIDTH TRAY ==================== */}
      <div className="col-span-1 md:col-span-2 xl:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-[22px] lg:gap-6 items-start max-w-[1600px] mx-auto w-full mt-2">
        
        {/* AI Recommendation */}
        <div className="col-span-1 lg:col-span-6 rounded-[28px] overflow-hidden min-h-[140px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-purple-200/40 bg-[#F5F3FC] dark:bg-[#1C1635] flex items-center relative text-left">
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-[#5F4EA5]/10 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-pink-500/5 blur-2xl pointer-events-none" />

          <div className="grid grid-cols-12 gap-5 items-center px-8 py-5 w-full z-10">
            <div className="col-span-8 space-y-2">
              <div className="flex items-center gap-2 text-[#5F4EA5] dark:text-purple-300">
                <span className="text-xs animate-pulse select-none">✨</span>
                <span className="text-[9px] font-black uppercase tracking-widest">AI Recommendation for You</span>
              </div>
              <p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-relaxed pr-2">
                {data?.recommendation || "You seem a little stressed today. Take a 5-minute breathing break before your next study session."}
              </p>
              <button
                onClick={() => router.push("/dashboard/student/focus")}
                className="text-[9px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest hover:underline flex items-center gap-0.5 mt-1.5"
              >
                Try Recommended Activity &rarr;
              </button>
            </div>
            <div className="col-span-4 flex justify-center shrink-0">
              <img
                src="/images/student_meditating.jpg"
                alt="Student meditating"
                className="w-16 h-16 rounded-2xl object-cover border border-purple-250/30 shadow-2xs select-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Tools */}
        <div className="col-span-1 lg:col-span-6 p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px] text-left">
          <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest mb-3">
            Quick Tools
          </h4>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { label: "Focus Timer", icon: "timer", action: () => router.push("/dashboard/student/focus") },
              { label: "Study Planner", icon: "assignment", action: () => router.push("/dashboard/student/study-planner") },
              { label: "Sleep Logs", icon: "bedtime", action: () => router.push("/dashboard/student/sleep") },
              { label: "Journal", icon: "auto_stories", action: () => router.push("/dashboard/student/journal") },
              { label: "AI Companion", icon: "smart_toy", action: () => router.push("/dashboard/student/ai-companion") },
              { label: "Check-in", icon: "mood", action: () => router.push("/dashboard/student/checkin") },
            ].map((tool, idx) => (
              <button
                key={idx}
                onClick={tool.action}
                className="px-2 py-3 rounded-2xl bg-slate-50 dark:bg-[#0D1F2D] border border-slate-100 dark:border-slate-800 hover:border-[#5F4EA5] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs hover:-translate-y-0.5 active:scale-95 text-center group"
              >
                <span className="material-symbols-outlined text-base text-[#5F4EA5] group-hover:scale-105 transition-transform">
                  {tool.icon}
                </span>
                <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                  {tool.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

