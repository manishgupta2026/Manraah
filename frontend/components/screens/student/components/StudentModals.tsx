"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";
import { renderAvatar } from "@/frontend/components/screens/student/components/StudentSidebar";
import { getAssessmentMetadata } from "@/frontend/lib/assessment/questions/onboarding";

// --- Student Modals Container (Excludes Shell) ---
export function StudentModals() {
  const {
    activeModal, setActiveModal,
    todayCheckin,
    checkinMood, setCheckinMood,
    checkinStress, setCheckinStress,
    checkinEnergy, setCheckinEnergy,
    checkinNote, setCheckinNote,
    isSubmittingCheckin,
    handleDailyCheckinSubmit,
    user,
    profileName, setProfileName,
    profileAvatar, setProfileAvatar,
    handleUpdateProfileSubmit,
    tasks,
    editingTaskId, setEditingTaskId,
    taskSubject, setTaskSubject,
    taskTitle, setTaskTitle,
    taskPriority, setTaskPriority,
    taskDate, setTaskDate,
    taskDuration, setTaskDuration,
    handleSaveTask,
    handleDeleteTask,
    exams,
    editingExamId, setEditingExamId,
    examName, setExamName,
    examSubject, setExamSubject,
    examDate, setExamDate,
    examTime, setExamTime,
    examPriority, setExamPriority,
    examProgress, setExamProgress,
    handleSaveExam,
    handleDeleteExam,
    sleepTimeInput, setSleepTimeInput,
    wakeTimeInput, setWakeTimeInput,
    sleepQuality, setSleepQuality,
    handleSaveSleep,
    recommendedTherapist,
    upcomingAppointment,
    handleBookConsultation,
    handleCancelConsultation,
    journalTitle, setJournalTitle,
    journalContent, setJournalContent,
    journalMood, setJournalMood,
    handleSaveJournal,
    isAssessmentPopupOpen, setIsAssessmentPopupOpen,
    showInvitationPopup, setShowInvitationPopup,
    setAssessmentStatus,
    onboardingStep, setOnboardingStep,
    onboardingAnswers, setOnboardingAnswers,
    isOnboardingSubmitting,
    onboardingSubmitError, setOnboardingSubmitError,
    onboardingValidationError, setOnboardingValidationError,
    showPersonalizingState,
    handleOnboardingSubmit,
    isPrivacyPopupOpen, setIsPrivacyPopupOpen,
    timeLeft, setTimeLeft,
    timerRunning, setTimerRunning,
    handleCompleteFocus,
    ONBOARDING_QUESTIONS,
    profileCategory,
    toast
  } = useStudentDashboard();

  const category = (user?.selectedCategory || profileCategory || "student").toLowerCase().trim();
  const metadata = getAssessmentMetadata(category);

  return (
    <>
      {/* Toast Notifier */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-55 bg-[#100E26] border border-purple-200 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
          >
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="text-xs font-bold leading-none">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Focus Timer Modal */}
      <AnimatePresence>
        {activeModal === "focus" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setTimerRunning(false);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="space-y-1">
                <span className="text-4xl select-none block">⏱️</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Study Focus Timer</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Session Active</p>
              </div>

              <div className="py-6 rounded-3xl bg-[#EBE7FC] dark:bg-[#0D1F2D] border border-[#5F4EA5]/20 relative flex items-center justify-center">
                <div className="text-4xl font-heading font-black text-[#100E26] dark:text-slate-100 tracking-widest font-mono">
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="flex-1 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {timerRunning ? "pause" : "play_arrow"}
                  </span>
                  <span>{timerRunning ? "Pause" : "Resume"}</span>
                </button>
                <button
                  onClick={handleCompleteFocus}
                  className="px-4 py-3 rounded-full border border-teal-500 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-50 dark:hover:bg-teal-950/10 transition-all cursor-pointer"
                >
                  Finish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Tasks Modal */}
      <AnimatePresence>
        {activeModal === "task" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingTaskId(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">📝</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">
                  {editingTaskId ? "Edit Study Task" : "Add Study Task"}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan your academic work</p>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Subject</label>
                  <input
                    type="text"
                    required
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="e.g. Mathematics, History"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Read Chapter 4, Write Essay"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={480}
                      value={taskDuration}
                      onChange={(e) => setTaskDuration(parseInt(e.target.value) || 30)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  {editingTaskId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(editingTaskId)}
                      className="px-4 py-3 rounded-full border border-red-500 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/10 transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center cursor-pointer"
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Exams Modal */}
      <AnimatePresence>
        {activeModal === "exam" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingExamId(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">📚</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">
                  {editingExamId ? "Edit Exam Info" : "Schedule New Exam"}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Track exam stress & prepare</p>
              </div>

              <form onSubmit={handleSaveExam} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Exam Name / Title</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Midterm, Quiz 1"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Subject</label>
                  <input
                    type="text"
                    required
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    placeholder="e.g. Biology, Chemistry"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Priority</label>
                    <select
                      value={examPriority}
                      onChange={(e) => setExamPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Prep Progress (%)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={100}
                      value={examProgress}
                      onChange={(e) => setExamProgress(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Date</label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Time</label>
                    <input
                      type="text"
                      required
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      placeholder="e.g. 09:00 AM, 2:30 PM"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {editingExamId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExam(editingExamId)}
                      className="px-4 py-3 rounded-full border border-red-500 text-red-500 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-950/10 transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center cursor-pointer"
                  >
                    Save Exam
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Sleep Log Modal */}
      <AnimatePresence>
        {activeModal === "sleep" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">🛌</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Log Sleep Session</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Save sleep quality logs</p>
              </div>

              <form onSubmit={handleSaveSleep} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Bedtime</label>
                  <input
                    type="text"
                    required
                    value={sleepTimeInput}
                    onChange={(e) => setSleepTimeInput(e.target.value)}
                    placeholder="e.g. 10:30 PM, 11:00 PM"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Wake Up Time</label>
                  <input
                    type="text"
                    required
                    value={wakeTimeInput}
                    onChange={(e) => setWakeTimeInput(e.target.value)}
                    placeholder="e.g. 06:30 AM, 07:00 AM"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Sleep Quality Score (0-100)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(parseInt(e.target.value) || 75)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6 cursor-pointer"
                >
                  Save Sleep Log
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Consultation Booking Modal */}
      <AnimatePresence>
        {activeModal === "consult" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-md w-full space-y-6 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">🩺</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Wellness Care Consultation</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Book a virtual call with a therapist</p>
              </div>

              {upcomingAppointment ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={upcomingAppointment.avatar || "/images/therapist_sarah.jpg"}
                      alt={upcomingAppointment.therapistName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="text-xs font-heading font-black text-slate-850 dark:text-slate-100">{upcomingAppointment.therapistName}</h5>
                      <p className="text-[9px] text-[#5F4EA5] dark:text-purple-300 font-bold">{upcomingAppointment.specialty}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-500">
                    <p>🗓️ {upcomingAppointment.date}</p>
                    <p className="mt-1">⏱️ {upcomingAppointment.time}</p>
                  </div>
                  <button
                    onClick={handleCancelConsultation}
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 font-bold text-[10px] uppercase tracking-wider hover:bg-red-50 transition-colors mt-2 cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                    Choose our recommended student support specialist for a free 30-minute mental health check-in:
                  </p>
                  {recommendedTherapist && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={recommendedTherapist.avatar}
                          alt={recommendedTherapist.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="text-xs font-heading font-black text-slate-850 dark:text-slate-100">{recommendedTherapist.name}</h5>
                          <p className="text-[9px] text-slate-400 font-bold">{recommendedTherapist.specialty}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleBookConsultation}
                        className="px-3.5 py-2 rounded-xl bg-[#5F4EA5] text-white text-[9px] font-black uppercase tracking-wider hover:bg-[#100E26] shadow-2xs cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Journal Modal */}
      <AnimatePresence>
        {activeModal === "journal" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full space-y-6 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">📓</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Write in Sanctuary Journal</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your personal private thoughts</p>
              </div>

              <form onSubmit={handleSaveJournal} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Title</label>
                  <input
                    type="text"
                    required
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="e.g. Feeling overwhelmed today..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Mood tag</label>
                  <select
                    value={journalMood}
                    onChange={(e) => setJournalMood(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none text-slate-850 dark:text-slate-200 font-bold"
                  >
                    <option value="Reflective">Reflective 😐</option>
                    <option value="Hopeful">Hopeful 😊</option>
                    <option value="Stressed">Stressed 😰</option>
                    <option value="Exhausted">Exhausted 😫</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Entry Content</label>
                  <textarea
                    rows={4}
                    required
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write honestly, safely, privately..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6 cursor-pointer"
                >
                  Save Journal Entry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Privacy & Consent Modal */}
      <AnimatePresence>
        {isPrivacyPopupOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-md rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 p-7 shadow-2xl text-center space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-[#5F4EA5] mx-auto flex items-center justify-center select-none">
                <span className="material-symbols-outlined text-2xl font-bold">shield</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Privacy &amp; Data Consent</h3>
                <p className="text-xs font-semibold text-slate-555 dark:text-slate-400 leading-relaxed text-left">
                  Welcome to Manraah Sanctuary. To ensure a safe space for your mental wellness journey:
                </p>
                <ul className="text-xs font-semibold text-slate-555 dark:text-slate-400 leading-relaxed text-left list-disc list-inside space-y-1">
                  <li>Your check-ins and journal entries are 100% encrypted.</li>
                  <li>No personal identifiers are shared with third parties.</li>
                  <li>You can change your visibility settings anytime in Profile Settings.</li>
                </ul>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    sessionStorage.setItem("manraah_student_privacy_acknowledged", "true");
                    setIsPrivacyPopupOpen(false);
                  }}
                  className="w-full py-3.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-xs transition-all cursor-pointer"
                >
                  I Acknowledge &amp; Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Daily Wellness Check-in Modal */}
      <AnimatePresence>
        {activeModal === "checkin" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full space-y-6 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">🌿</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Daily Wellness Check-in</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">How are you feeling today?</p>
              </div>

              {todayCheckin ? (
                <div className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-350">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-3">
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Mood</span>
                      <span className="text-sm font-black text-[#5F4EA5] dark:text-purple-300">{todayCheckin.mood}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Stress Level</span>
                      <span className="text-sm font-black text-slate-855 dark:text-slate-100">{todayCheckin.stress || todayCheckin.stress_level}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Energy Level</span>
                      <span className="text-sm font-black text-slate-855 dark:text-slate-100">{todayCheckin.energy || todayCheckin.energy_level}/5</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Reflection Note</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {todayCheckin.note || todayCheckin.reflection || "No reflection note added."}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full py-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-heading font-black text-xs text-center cursor-pointer"
                  >
                    Close Check-in
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleDailyCheckinSubmit}
                  className="space-y-4 text-left"
                >
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
                              : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-2xl select-none">{m.emoji}</span>
                          <span className="text-[9px] font-bold leading-none">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

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

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Reflection Note (Optional)</label>
                    <textarea
                      rows={3}
                      value={checkinNote}
                      onChange={(e) => setCheckinNote(e.target.value)}
                      placeholder="How was your day? Write a brief note..."
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-855 dark:text-slate-200 font-bold resize-none"
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
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. Profile Edit Modal */}
      <AnimatePresence>
        {activeModal === "profile" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-sm w-full space-y-6 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">👤</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Sanctuary Profile Settings</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Update your avatar &amp; alias</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative w-20 h-20">
                  {renderAvatar(user, "w-20 h-20 text-xl")}
                  <label className="absolute bottom-0 right-0 w-6.5 h-6.5 rounded-full bg-[#5F4EA5] border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-[#100E26] transition-colors">
                    <span className="material-symbols-outlined text-[13px] font-bold">edit</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileAvatar(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <form onSubmit={handleUpdateProfileSubmit} className="w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Sanctuary Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-150/60 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-855 dark:text-slate-200 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Email Address (Read-only)</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ""}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-505 font-bold cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center cursor-pointer mt-2"
                  >
                    Update Profile Info
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 10. Student Assessment Questionnaire Modal */}
      <AnimatePresence>
        {isAssessmentPopupOpen && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setIsAssessmentPopupOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>
                  {category.includes("working") || category.includes("professional") || category === "young_pro" || category === "youngprofessional"
                    ? "Working Professional Assessment"
                    : category === "couple" || category === "couples"
                    ? "Couple Assessment"
                    : category === "parent" || category === "parents"
                    ? "Parent Assessment"
                    : category === "student"
                    ? "Student Assessment"
                    : "Personal Assessment"}
                </span>
                <span>Question {onboardingStep} of 10</span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5F4EA5] transition-all duration-300"
                  style={{ width: `${(onboardingStep / 10) * 100}%` }}
                />
              </div>

              {showPersonalizingState ? (
                <div className="py-8 text-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5F4EA5] mx-auto" />
                  <p className="text-xs font-bold text-[#5F4EA5]">Personalizing your sanctuary recommendations...</p>
                </div>
              ) : (
                <>
                  <h4 className="text-sm md:text-base font-heading font-black text-[#100E26] dark:text-slate-100 leading-snug">
                    {ONBOARDING_QUESTIONS[onboardingStep - 1].question}
                  </h4>

                  <div className="space-y-2">
                    {ONBOARDING_QUESTIONS[onboardingStep - 1].options.map((opt: any) => {
                      const isSelected = onboardingAnswers[onboardingStep - 1]?.answer === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setOnboardingAnswers((prev: any) => {
                              const next = [...prev];
                              next[onboardingStep - 1] = {
                                questionId: ONBOARDING_QUESTIONS[onboardingStep - 1].id,
                                question: ONBOARDING_QUESTIONS[onboardingStep - 1].question,
                                answer: opt.val
                              };
                              return next;
                            });
                            setOnboardingValidationError(null);
                            setOnboardingSubmitError(null);
                          }}
                          className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#F5F3FC] dark:bg-[#1C1635]/60 border-[#5F4EA5] text-[#5F4EA5] dark:text-purple-300 font-extrabold"
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span>{opt.text}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-sm font-black text-[#5F4EA5] dark:text-purple-300">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {onboardingSubmitError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold border border-red-200/20">
                      ⚠️ {onboardingSubmitError}
                    </div>
                  )}

                  {onboardingValidationError && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-200/20">
                      ⚠️ {onboardingValidationError}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={onboardingStep === 1}
                      onClick={() => {
                        setOnboardingStep(onboardingStep - 1);
                        setOnboardingValidationError(null);
                      }}
                      className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                        onboardingStep === 1
                          ? "text-slate-300 dark:text-slate-700 cursor-not-allowed"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs font-black">arrow_back</span>
                      Back
                    </button>

                    {onboardingStep < 10 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onboardingAnswers[onboardingStep - 1]) {
                            setOnboardingValidationError("Please select an option to continue.");
                            return;
                          }
                          setOnboardingValidationError(null);
                          setOnboardingStep(onboardingStep + 1);
                        }}
                        className="py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all bg-[#5F4EA5] hover:bg-[#100E26] text-white"
                      >
                        Next
                        <span className="material-symbols-outlined text-xs font-black">arrow_forward</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isOnboardingSubmitting}
                        onClick={() => {
                          if (!onboardingAnswers[onboardingStep - 1]) {
                            setOnboardingValidationError("Please select an option to continue.");
                            return;
                          }
                          setOnboardingValidationError(null);
                          handleOnboardingSubmit();
                        }}
                        className={`py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all bg-[#5FAF8A] hover:bg-[#4d9774] text-white ${
                          isOnboardingSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {isOnboardingSubmitting ? "Saving..." : "Complete"}
                        <span className="material-symbols-outlined text-xs font-black">done_all</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 11. Onboarding Assessment Invitation Popup */}
      <AnimatePresence>
        {showInvitationPopup && (
          <div className="fixed inset-0 z-50 bg-[#121212]/75 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 max-w-sm w-full space-y-6 shadow-2xl relative text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-[#5F4EA5] mx-auto flex items-center justify-center select-none">
                <span className="material-symbols-outlined text-2xl font-bold">assignment</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100 uppercase tracking-wide">
                  {metadata.title}
                </h3>
                <p className="text-xs font-semibold text-slate-555 dark:text-slate-400 leading-relaxed">
                  {metadata.description}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={async () => {
                    // Skip for now
                    try {
                      await fetch("/api/student/assessment/status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ skipped: true }),
                      });
                      // Update local state
                      setAssessmentStatus((prev: any) => prev ? { ...prev, skipped: true } : { completed: false, skipped: true, latestAssessment: null });
                    } catch (e) {
                      // ignore
                    }
                    setShowInvitationPopup(false);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 font-heading font-black text-xs transition-all cursor-pointer"
                >
                  Skip for Now
                </button>
                <button
                  onClick={() => {
                    setShowInvitationPopup(false);
                    setOnboardingStep(1);
                    setOnboardingAnswers([]);
                    setIsAssessmentPopupOpen(true);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-xs transition-all cursor-pointer shadow-md"
                >
                  Do Assessment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

