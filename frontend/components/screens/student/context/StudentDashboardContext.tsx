"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getClientSession } from "@/backend/auth/client";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";
import { getAssessmentMetadata, getOnboardingQuestions } from "@/frontend/lib/assessment/questions/onboarding";
import { motion } from "framer-motion";
import type { StudyTask, Exam } from "../types";
import { ONBOARDING_QUESTIONS } from "../types";

let memoryDashboardCache: any = null;

export const StudentDashboardContext = createContext<any>(null);

export function useStudentDashboard() {
  return useContext(StudentDashboardContext);
}


export function StudentDashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar hover/expand and mobile drawer states
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // --- States ---
  const [data, setData] = useState<any>(() => {
    if (memoryDashboardCache) return memoryDashboardCache;
    if (typeof window !== "undefined") {
      try {
        const local = localStorage.getItem("manraah_dashboard_cache");
        if (local) return JSON.parse(local);
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => !memoryDashboardCache);
  const [error, setError] = useState<string | null>(null);

  // --- Student Onboarding States ---
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingAnswers, setOnboardingAnswers] = useState<any[]>([]);
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState<boolean>(false);
  const [onboardingSubmitError, setOnboardingSubmitError] = useState<string | null>(null);
  const [onboardingValidationError, setOnboardingValidationError] = useState<string | null>(null);
  const [showPersonalizingState, setShowPersonalizingState] = useState<boolean>(false);

  // Modals & Popups States
  const [isPrivacyPopupOpen, setIsPrivacyPopupOpen] = useState(false);
  const [isAssessmentPopupOpen, setIsAssessmentPopupOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);

  // Assessment Status States
  const [assessmentStatus, setAssessmentStatus] = useState<any>(null);
  const [assessmentStatusLoading, setAssessmentStatusLoading] = useState(true);
  const [assessmentStatusError, setAssessmentStatusError] = useState<string | null>(null);

  const fetchAssessmentStatus = async () => {
    try {
      setAssessmentStatusLoading(true);
      setAssessmentStatusError(null);
      const res = await fetch("/api/student/assessment/status");
      if (!res.ok) {
        throw new Error("Failed to fetch assessment status");
      }
      const data = await res.json();
      setAssessmentStatus(data);
      setAssessmentStatusLoading(false);
    } catch (err: any) {
      setAssessmentStatusError(err.message || "Failed to fetch assessment status");
      setAssessmentStatusLoading(false);
    }
  };

  // App Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modals & Panels Toggles
  const [activeModal, setActiveModal] = useState<
    "focus" | "task" | "exam" | "sleep" | "consult" | "journal" | "checkin" | "profile" | null
  >(null);
  
  const [toast, setToast] = useState<string | null>(null);

  // Profile Edit States
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileCategory, setProfileCategory] = useState("student");

  // Sub-data States
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [focusSession, setFocusSession] = useState({ completed: 2, total: 3, duration: 100 }); // default matching reference image

  const formatFocusDuration = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) return `${hrs}h ${m}m`;
    return `${m}m`;
  };
  const [sleepRecord, setSleepRecord] = useState<any>(null);

  // Forms states
  const [taskSubject, setTaskSubject] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskDate, setTaskDate] = useState("");
  const [taskDuration, setTaskDuration] = useState(30);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [examName, setExamName] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("09:00 AM");
  const [examPriority, setExamPriority] = useState("Medium");
  const [examProgress, setExamProgress] = useState(50);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);

  const [sleepTimeInput, setSleepTimeInput] = useState("");
  const [wakeTimeInput, setWakeTimeInput] = useState("");
  const [sleepQuality, setSleepQuality] = useState(78);

  const [checkinMood, setCheckinMood] = useState<string | null>(null);
  const [checkinStress, setCheckinStress] = useState("Manageable");
  const [checkinEnergy, setCheckinEnergy] = useState(3);
  const [checkinNote, setCheckinNote] = useState("");
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalMood, setJournalMood] = useState("Reflective");

  // Focus Timer Clock
  const [focusPreset, setFocusPreset] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Calendar selected date (initialize to current date dynamically)
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toDateString());



  // Show Toast helper
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sanctuaryName: profileName,
          category: profileCategory,
          avatar: profileAvatar
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to update profile.");
      }

      const resJson = await res.json();
      triggerToast("Profile updated successfully!");
      setActiveModal(null);
      
      // Update session cookie manually on frontend
      if (resJson.user) {
        const sessionCookieVal = document.cookie
          .split("; ")
          .find((row) => row.startsWith("manraah_session="));
        if (sessionCookieVal) {
          try {
            const currentSession = JSON.parse(decodeURIComponent(sessionCookieVal.split("=")[1]));
            currentSession.user = {
              ...currentSession.user,
              name: resJson.user.name,
              sanctuaryName: resJson.user.sanctuaryName,
              avatar: resJson.user.avatar,
              selectedCategory: resJson.user.selectedCategory,
            };
            document.cookie = `manraah_session=${encodeURIComponent(JSON.stringify(currentSession))}; path=/; max-age=2592000`;
          } catch (e) {
            console.error("Failed to update manraah_session cookie:", e);
          }
        }
      }

      // Re-fetch all data to refresh components
      await fetchAllData();
      
      // If user category changes to something other than student, redirect
      if (resJson.user?.selectedCategory && resJson.user.selectedCategory !== "student") {
        router.push(`/dashboard/${resJson.user.selectedCategory}`);
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to update profile.");
    }
  };

  // --- Student Onboarding Submit ---
  const handleOnboardingSubmit = async () => {
    if (isOnboardingSubmitting) return;

    const answersToSubmit = onboardingAnswers;
    const category = (data?.user?.selectedCategory || profileCategory || "student").toLowerCase().trim();
    const questionsList = getOnboardingQuestions(category);

    if (answersToSubmit.length < 10 || answersToSubmit.some((a) => !a || !a.answer)) {
      setOnboardingSubmitError("Please answer all questions before submitting.");
      return;
    }

    setIsOnboardingSubmitting(true);
    setOnboardingSubmitError(null);

    try {
      const isStudent = category === "student";

      if (isStudent) {
        const res = await fetch("/api/onboarding/student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: answersToSubmit }),
        });

        const resJson = await res.json();

        if (!res.ok) {
          throw new Error(resJson.error || "Unable to save your assessment. Please try again.");
        }
      } else {
        const mappedAnswers = answersToSubmit.map((ans, idx) => {
          const matchingQ = questionsList[idx];
          const selectedOpt = matchingQ.options.find((opt: any) => opt.val === ans.answer);
          
          const score = selectedOpt && 'score' in selectedOpt ? (selectedOpt as any).score : 3;
          const optId = selectedOpt && 'id' in selectedOpt ? (selectedOpt as any).id : `${matchingQ.id}_opt_default`;
          const selectedText = selectedOpt ? selectedOpt.text : ans.answer;

          return {
            questionId: Number(matchingQ.id) || idx + 6,
            selectedOptionId: optId,
            score: score,
            selectedText: selectedText
          };
        });

        const res = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: mappedAnswers }),
        });

        const resJson = await res.json();

        if (!res.ok) {
          throw new Error(resJson.error || "Unable to save your assessment. Please try again.");
        }
      }

      // Show personalizing screen briefly
      setShowPersonalizingState(true);

      // Sync onboardingCompleted in client session
      const activeSession = getClientSession();
      if (activeSession) {
        const updatedSession = {
          ...activeSession,
          user: {
            ...activeSession.user,
            onboardingCompleted: true
          }
        };
        localStorage.setItem("manraah_auth_session", JSON.stringify(updatedSession));
        document.cookie = `manraah_session=${encodeURIComponent(JSON.stringify(updatedSession))}; path=/; max-age=2592000`;
      }

      // Wait 1.5 seconds for personalization message, then close modal
      setTimeout(async () => {
        // Update user state so overlay fades out
        setData((prev: any) => ({
          ...prev,
          user: {
            ...prev.user,
            onboardingCompleted: true
          }
        }));
        setShowPersonalizingState(false);
        setIsAssessmentPopupOpen(false);
        // Refresh data to load the personalized wellness sanctuary recommendations
        await fetchAllData();
        await fetchAssessmentStatus();
      }, 1500);

    } catch (err: any) {
      console.error("[Onboarding submit error]:", err);
      setOnboardingSubmitError(err.message || "Unable to save your assessment. Please try again.");
      setIsOnboardingSubmitting(false);
    }
  };

  // --- Initial Data Load ---
  const fetchAllData = async () => {
    try {
      const localDate = getLocalDateString();
      const isWpPath = pathname?.includes("working-professional") || pathname?.includes("working_professional");
      const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
      const category = (session?.user?.selectedCategory || (isWpPath ? "working-professional" : "student")).toLowerCase().trim();
      const isWp = isWpPath || category.includes("working") || category.includes("prof");
      
      const apiEndpoint = isWp 
        ? `/api/dashboard/working-professional?localDate=${localDate}` 
        : `/api/dashboard/student?localDate=${localDate}`;

      const res = await fetch(apiEndpoint);
      const json = await res.json();

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (res.status === 403 || json.redirect) {
        if (!isWpPath || !json.redirect?.includes("student")) {
          const targetRoute = json.redirect || getCategoryDashboardRoute(json.category);
          router.replace(targetRoute);
          return;
        }
      }

      if (!res.ok) {
        throw new Error(json.error || "Failed to load Dashboard payload.");
      }
      
      memoryDashboardCache = json;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("manraah_dashboard_cache", JSON.stringify(json));
        } catch {}
      }
      setData(json);
      setTasks(isWp ? (json.goals || []) : (json.tasks || []));
      setExams(isWp ? (json.appointments || []) : (json.exams || []));
      setUpcomingAppointment(json.upcomingAppointment || null);
      
      if (json.focusSession) {
        setFocusSession(json.focusSession);
      } else if (isWp && json.focus) {
        setFocusSession({
          completed: json.focus.todaySessionsCount || 0,
          total: 3,
          duration: json.focus.weeklyMinutes || 0
        });
      }
      setSleepRecord(isWp ? (json.sleep || null) : (json.sleepRecord || null));

      if (json.user) {
        setProfileName(json.user.name || "");
        setProfileAvatar(json.user.avatar || "");
        setProfileCategory(json.user.selectedCategory || "student");
      }
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchAssessmentStatus();

    // Check Theme preference
    const saved = localStorage.getItem("manraah-theme");
    const isDark = saved === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Trigger assessment popup invitation after 1 minute if never completed and not skipped
  useEffect(() => {
    if (assessmentStatus && !assessmentStatusLoading) {
      if (!assessmentStatus.completed && !assessmentStatus.skipped) {
        const timer = setTimeout(() => {
          setShowInvitationPopup(true);
        }, 60000); // 1 minute
        return () => clearTimeout(timer);
      }
    }
  }, [assessmentStatus, assessmentStatusLoading]);

  // Theme Toggler
  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    localStorage.setItem("manraah-theme", nextDark ? "dark" : "light");
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Focus Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleCompleteFocus();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // --- Actions ---

  // 1. Submit Daily Check-in
  const handleSubmitCheckin = async (mood: string) => {
    let stressStr = "Manageable";
    let energyLvl = 3;

    if (mood === "Good") {
      stressStr = "Low";
      energyLvl = 5;
    } else if (mood === "Okay") {
      stressStr = "Manageable";
      energyLvl = 4;
    } else if (mood === "Drained") {
      stressStr = "Moderate";
      energyLvl = 2;
    } else if (mood === "Stressed") {
      stressStr = "High";
      energyLvl = 2;
    } else if (mood === "Overwhelmed") {
      stressStr = "Very High";
      energyLvl = 1;
    }

    if (isSubmittingCheckin) return;
    setIsSubmittingCheckin(true);

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: mood === "Good" ? "Happy" : mood === "Okay" ? "Calm" : mood === "Drained" ? "Okay" : mood === "Stressed" ? "Low" : "Overwhelmed",
          stressLevel: stressStr,
          energyLevel: energyLvl,
          reflection: "Logged check-in",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Today's check-in is already completed.");
        } else {
          throw new Error("Unable to save your check-in. Please try again.");
        }
      }

      triggerToast("Daily check-in saved! Score updated. 🌿");
      
      if (json.checkIn) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            todayMood: json.checkIn.mood,
            todayCheckin: {
              id: json.checkIn.id,
              mood: json.checkIn.mood,
              stress: json.checkIn.stress_level,
              energy: json.checkIn.energy_level,
              note: json.checkIn.reflection,
              created_at: json.checkIn.created_at,
            }
          };
        });
      }

      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  const handleDailyCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinMood) {
      triggerToast("Please select your mood.");
      return;
    }
    if (isSubmittingCheckin) return;

    setIsSubmittingCheckin(true);

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: checkinMood,
          stressLevel: checkinStress,
          energyLevel: checkinEnergy,
          reflection: checkinNote || "",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Today's check-in is already completed.");
        } else {
          throw new Error("Unable to save your check-in. Please try again.");
        }
      }

      triggerToast("Daily check-in saved! Score updated. 🌿");
      setActiveModal(null);
      // Clear form
      setCheckinMood(null);
      setCheckinStress("Manageable");
      setCheckinEnergy(3);
      setCheckinNote("");

      if (json.checkIn) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            todayMood: json.checkIn.mood,
            todayCheckin: {
              id: json.checkIn.id,
              mood: json.checkIn.mood,
              stress: json.checkIn.stress_level,
              energy: json.checkIn.energy_level,
              note: json.checkIn.reflection,
              created_at: json.checkIn.created_at,
            }
          };
        });
      }

      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  // 2. Study Tasks / WP Goals CRUD
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDate) {
      triggerToast("Please input all required fields");
      return;
    }

    try {
      const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
      const category = (session?.user?.selectedCategory || "student").toLowerCase().trim();
      const isWp = category.includes("working") || category.includes("prof");

      const isEdit = editingTaskId !== null;
      const url = isWp 
        ? (isEdit ? `/api/working-professional/goals/${editingTaskId}` : "/api/working-professional/goals")
        : "/api/student/tasks";
      const method = isWp
        ? (isEdit ? "PATCH" : "POST")
        : (isEdit ? "PUT" : "POST");
      
      const payload = isWp
        ? { title: taskTitle, description: taskSubject, priority: taskPriority, due_date: taskDate }
        : (isEdit
            ? { id: editingTaskId, subject: taskSubject, title: taskTitle, priority: taskPriority, date: taskDate, duration: taskDuration }
            : { subject: taskSubject, title: taskTitle, priority: taskPriority, date: taskDate, duration: taskDuration });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save task.");
      triggerToast(isEdit ? "Task updated! 📝" : "Task added! 🎓");
      
      // Reset
      setTaskSubject("");
      setTaskTitle("");
      setTaskPriority("Medium");
      setTaskDate("");
      setTaskDuration(30);
      setEditingTaskId(null);
      setActiveModal(null);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  const handleToggleTaskComplete = async (id: number, completed: boolean) => {
    if (togglingTaskId === id) return;
    setTogglingTaskId(id);
    try {
      const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
      const category = (session?.user?.selectedCategory || "student").toLowerCase().trim();
      const isWp = category.includes("working") || category.includes("prof");

      const endpoint = isWp ? "/api/working-professional/goals" : "/api/student/tasks";
      const method = isWp ? "POST" : "PUT";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          completed: !completed,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle task completion.");
      triggerToast(completed ? "Task marked active." : "Task completed! 🎉");
      await fetchAllData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to toggle task completion.");
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
      const category = (session?.user?.selectedCategory || "student").toLowerCase().trim();
      const isWp = category.includes("working") || category.includes("prof");

      const url = isWp ? `/api/working-professional/goals/${id}` : `/api/student/tasks?id=${id}`;
      const res = await fetch(url, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task.");
      triggerToast("Task deleted.");
      await fetchAllData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete task.");
    }
  };

  // 3. Exams CRUD
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examSubject.trim() || !examDate) {
      triggerToast("Please input all required fields");
      return;
    }

    try {
      const isEdit = editingExamId !== null;
      const url = "/api/student/exams";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { id: editingExamId, name: examName, subject: examSubject, date: examDate, time: examTime, priority: examPriority, progress: examProgress }
        : { name: examName, subject: examSubject, date: examDate, time: examTime, priority: examPriority, progress: examProgress };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save exam.");
      triggerToast(isEdit ? "Exam details updated! 📝" : "Exam added! 🎓");
      
      setExamName("");
      setExamSubject("");
      setExamDate("");
      setExamTime("09:00 AM");
      setExamPriority("Medium");
      setExamProgress(50);
      setEditingExamId(null);
      setActiveModal(null);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  const handleDeleteExam = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) {
      return;
    }
    try {
      const res = await fetch(`/api/student/exams?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete exam.");
      triggerToast("Exam deleted.");
      await fetchAllData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete exam.");
    }
  };

  // 4. Focus Timer complete session
  const handleStartFocusTimer = (mins: number) => {
    setFocusPreset(mins);
    setTimeLeft(mins * 60);
    setTimerRunning(true);
    setActiveModal("focus");
  };

  const handleCompleteFocus = async () => {
    try {
      const res = await fetch("/api/student/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: focusPreset }),
      });
      if (!res.ok) throw new Error("Could not log focus session.");
      triggerToast("Excellent focus! Logged to profile. 🎓");
      setActiveModal(null);
      setTimerRunning(false);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  // 5. Sleep Log
  const handleSaveSleep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sleepTimeInput || !wakeTimeInput) {
      triggerToast("Please enter sleep and wake times");
      return;
    }

    try {
      const sleepD = new Date(sleepTimeInput);
      const wakeD = new Date(wakeTimeInput);
      const diffMs = wakeD.getTime() - sleepD.getTime();
      const diffMins = Math.round(diffMs / (1000 * 60));

      const res = await fetch("/api/student/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepTime: sleepD.toISOString(),
          wakeTime: wakeD.toISOString(),
          duration: diffMins,
          score: sleepQuality,
        }),
      });

      if (!res.ok) throw new Error("Failed to log sleep.");
      triggerToast("Sleep record saved! 🌙");
      setSleepTimeInput("");
      setWakeTimeInput("");
      setSleepQuality(78);
      setActiveModal(null);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  // 6. Consultations (Appointments)
  const handleBookConsultation = async () => {
    try {
      const res = await fetch("/api/student/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Dr. Sarah Jenkins",
          title: "Child Psychology",
          avatar: "/images/therapist_sarah.jpg",
          date: new Date("2026-06-14T21:00:00Z").toISOString(),
          time: "09:00 PM",
        }),
      });
      if (!res.ok) throw new Error("Failed to book consultation.");
      triggerToast("Consultation booked with Dr. Sarah Jenkins! 📅");
      setActiveModal(null);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  const handleCancelConsultation = async (id: number) => {
    try {
      const res = await fetch(`/api/student/appointments?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to cancel appointment.");
      triggerToast("Appointment cancelled successfully.");
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  // 7. Journal entry submit
  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) {
      triggerToast("Please fill in journal fields");
      return;
    }

    try {
      const id = "j_" + Date.now();
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          title: journalTitle,
          content: journalContent,
          moodTag: journalMood,
          category: "Personal",
        }),
      });

      if (!res.ok) throw new Error("Failed to save journal entry.");
      triggerToast("Reflection entry logged to journal. 📖");
      setJournalTitle("");
      setJournalContent("");
      setJournalMood("Reflective");
      setActiveModal(null);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };
  // Rendering Helpers
  const renderCircularProgress = (pct: number, radius = 38, stroke = 8) => {
    const circ = 2 * Math.PI * radius;
    const offset = circ - (Math.min(100, Math.max(0, pct)) / 100) * circ;
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 select-none">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F0EEFC" strokeWidth={stroke} className="dark:stroke-slate-800" />
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#5F4EA5"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    );
  };

  const renderCalendarDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }
    
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const isToday = dateObj.toDateString() === new Date().toDateString();
      const isSelected = dateObj.toDateString() === selectedDateStr;
      
      const hasEvent = exams.some((ex: any) => new Date(ex.date).toDateString() === dateObj.toDateString()) ||
                        tasks.some((t: any) => new Date(t.date).toDateString() === dateObj.toDateString()) ||
                        (upcomingAppointment && new Date(upcomingAppointment.date).toDateString() === dateObj.toDateString()) ||
                        data?.history?.some((ch: any) => new Date(ch.created_at).toDateString() === dateObj.toDateString());
      
      days.push(
        <button
          key={`day-${d}`}
          onClick={() => setSelectedDateStr(dateObj.toDateString())}
          className={`w-8 h-8 rounded-full text-xs font-black relative flex items-center justify-center transition-all ${
            isSelected
              ? "bg-[#5F4EA5] text-white shadow-md font-extrabold"
              : isToday
              ? "border border-[#5F4EA5] text-[#5F4EA5] dark:text-purple-300 font-extrabold"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>{d}</span>
          {hasEvent && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E7A95F]" />
          )}
        </button>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-heading font-black text-sm text-[#100E26] dark:text-slate-100">
            {calendarDate.toLocaleString("default", { month: "long" })} {year}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button
              onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
            <span key={idx}>{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days}
        </div>
      </div>
    );
  };

  const renderScheduleItems = () => {
    const items: any[] = [];
    
    // 1. Appointments on selected day
    if (upcomingAppointment) {
      const apptDateStr = new Date(upcomingAppointment.date).toDateString();
      if (apptDateStr === selectedDateStr) {
        items.push({
          title: `Consult: ${upcomingAppointment.name}`,
          time: upcomingAppointment.time,
          icon: "👩‍⚕️",
          color: "bg-[#F5F3FC] dark:bg-[#1C1635]/40 border-[#5F4EA5]/15 text-[#5F4EA5]",
          action: () => setActiveModal("consult"),
        });
      }
    }

    // 2. Exams on selected day
    exams.forEach((ex: any) => {
      const examDateStr = new Date(ex.date).toDateString();
      if (examDateStr === selectedDateStr) {
        items.push({
          title: `Exam: ${ex.name} (${ex.subject})`,
          time: ex.time || "09:00 AM",
          icon: "📝",
          color: "bg-pink-50/50 dark:bg-pink-950/10 border-pink-200/30 text-pink-600",
          action: () => {
            setEditingExamId(ex.id);
            setExamName(ex.name);
            setExamSubject(ex.subject);
            setExamDate(ex.date.split("T")[0]);
            setExamTime(ex.time || "09:00 AM");
            setExamPriority(ex.priority || "Medium");
            setExamProgress(ex.progress || 50);
            setActiveModal("exam");
          },
        });
      }
    });

    // 3. Tasks (Study Planner) on selected day
    tasks.forEach((t: any) => {
      const taskDateStr = new Date(t.date).toDateString();
      if (taskDateStr === selectedDateStr) {
        items.push({
          title: `${t.title} (${t.subject})`,
          time: `${t.duration} min duration`,
          icon: "🎯",
          color: t.completed
            ? "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 line-through"
            : "bg-emerald-50 dark:bg-[#132E3F]/40 border-emerald-200/20 text-[#5FAF8A]",
          action: () => {
            setEditingTaskId(t.id);
            setTaskSubject(t.subject);
            setTaskTitle(t.title);
            setTaskDate(t.date.split("T")[0]);
            setTaskDuration(t.duration);
            setTaskPriority(t.priority);
            setActiveModal("task");
          },
        });
      }
    });
    // 4. Completed Check-ins on selected day
    if (data?.history) {
      data.history.forEach((ch: any) => {
        const checkinDateStr = new Date(ch.created_at).toDateString();
        if (checkinDateStr === selectedDateStr) {
          items.push({
            title: `Check-in: Feeling ${ch.mood}`,
            time: `Logged at ${new Date(ch.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            icon: ch.mood.toLowerCase() === "good" || ch.mood.toLowerCase() === "happy" || ch.mood.toLowerCase() === "amazing" ? "😊" :
                  ch.mood.toLowerCase() === "okay" || ch.mood.toLowerCase() === "calm" ? "😐" :
                  ch.mood.toLowerCase() === "stressed" || ch.mood.toLowerCase() === "low" || ch.mood.toLowerCase() === "anxious" ? "😰" : "😫",
            color: "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-250/20 text-[#5FAF8A]",
            action: () => {
              setActiveModal("checkin");
            },
          });
        }
      });
    }

    // If it's today and empty, show default/recommended things
    if (items.length === 0) {
      return (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
          <span className="material-symbols-outlined text-2xl text-slate-350 dark:text-slate-700">event_busy</span>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-normal px-4">
            No academic or wellness events scheduled for this day.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3 pr-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:translate-x-1 ${item.color}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl select-none">{item.icon}</span>
              <div className="text-left">
                <h5 className="text-[11px] font-black leading-tight text-slate-800 dark:text-slate-100">{item.title}</h5>
                <p className="text-[8px] font-bold opacity-80 mt-0.5">{item.time}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-xs font-black">chevron_right</span>
          </div>
        ))}
      </div>
    );
  };
  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto py-4 px-4 space-y-8 animate-pulse select-none bg-[#F5FAFB] dark:bg-[#0D1F2D] min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-8 h-[260px] rounded-[32px] bg-slate-200/50 dark:bg-slate-800" />
          <div className="col-span-12 md:col-span-4 h-[260px] rounded-[32px] bg-slate-200/50 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  const { user, streak, todayMood, todayCheckin, wellnessScore, recommendation, weeklyFocus, weeklyMoods } = data;

  // 3b. Scale Study Focus sessions bar heights
  const weeklyFocusData = weeklyFocus || [0, 0, 0, 0, 0, 0, 0];
  const maxWeeklyFocus = Math.max(1, ...weeklyFocusData);
  const focusBarHeights = weeklyFocusData.map((mins: number) => {
    return Math.max(0, Math.round((mins / maxWeeklyFocus) * 100));
  });
  const totalWeeklyFocusMinutes = weeklyFocusData.reduce((a: number, b: number) => a + b, 0);
  const formattedWeeklyFocusTotal = totalWeeklyFocusMinutes > 0
    ? `${Math.floor(totalWeeklyFocusMinutes / 60)}h ${totalWeeklyFocusMinutes % 60}m`
    : "0h";

  // 2b. Scale Mood Overview coordinates
  const weeklyMoodData = weeklyMoods || [4, 4, 4, 4, 4, 4, 4];
  const moodPoints = weeklyMoodData.map((val: number, i: number) => {
    const x = 5 + i * 15;
    // Map: 5 (Good) -> y = 6
    //      4 (Okay) -> y = 14
    //      3 (Stressed) -> y = 22
    //      2 (Overwhelmed/Drained) -> y = 28
    const y = val === 5 ? 6 : val === 4 ? 14 : val === 3 ? 22 : 28;
    return { x, y };
  });

  const pathD = `M ${moodPoints[0].x} ${moodPoints[0].y} ` + moodPoints.slice(1).map((pt: any) => `L ${pt.x} ${pt.y}`).join(" ");

  // Calculate dynamic progress percentage based on check-ins, focus sessions, and tasks
  let completedActivities = 0;
  let totalActivities = 0;
  
  // 1. Daily Check-in
  totalActivities += 1;
  if (todayMood) completedActivities += 1;

  // 2. Focus Sessions (target of 3)
  totalActivities += 3;
  completedActivities += Math.min(3, focusSession?.completed || 0);

  // 3. Study Tasks
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t: any) => t.completed).length;
  if (totalTasksCount > 0) {
    totalActivities += totalTasksCount;
    completedActivities += completedTasksCount;
  }

  const progressPercent = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
  const showOnboarding = data && !data.user?.onboardingCompleted;
  return (
    <StudentDashboardContext.Provider value={{
      data, setData,
      isLoading, error,
      user: data?.user || null,
      onboardingStep, setOnboardingStep,
      onboardingAnswers, setOnboardingAnswers,
      isOnboardingSubmitting,
      onboardingSubmitError, setOnboardingSubmitError,
      onboardingValidationError, setOnboardingValidationError,
      showPersonalizingState,
      isPrivacyPopupOpen, setIsPrivacyPopupOpen,
      isAssessmentPopupOpen, setIsAssessmentPopupOpen,
      showInvitationPopup, setShowInvitationPopup,
      assessmentStatus, setAssessmentStatus,
      assessmentStatusLoading, assessmentStatusError,
      fetchAssessmentStatus,
      isDarkMode, toggleTheme,
      activeModal, setActiveModal,
      toast, triggerToast,
      profileName, setProfileName,
      profileAvatar, setProfileAvatar,
      profileCategory, setProfileCategory,
      tasks, setTasks,
      exams, setExams,
      upcomingAppointment, setUpcomingAppointment,
      focusSession, setFocusSession,
      sleepRecord, setSleepRecord,
      sleepTimeInput, setSleepTimeInput,
      wakeTimeInput, setWakeTimeInput,
      sleepQuality, setSleepQuality,
      checkinMood, setCheckinMood,
      checkinStress, setCheckinStress,
      checkinEnergy, setCheckinEnergy,
      checkinNote, setCheckinNote,
      isSubmittingCheckin,
      togglingTaskId,
      handleDailyCheckinSubmit,
      handleUpdateProfileSubmit,
      handleOnboardingSubmit,
      handleStartFocusTimer,
      handleCompleteFocus,
      handleSaveTask,
      handleToggleTaskComplete,
      handleDeleteTask,
      handleSaveExam,
      handleDeleteExam,
      handleSaveSleep,
      handleBookConsultation,
      handleCancelConsultation,
      handleSaveJournal,
      isSidebarExpanded, setIsSidebarExpanded,
      isMobileDrawerOpen, setIsMobileDrawerOpen,
      timeLeft, setTimeLeft,
      timerRunning, setTimerRunning,
      focusPreset, setFocusPreset,
      calendarDate, setCalendarDate,
      selectedDateStr, setSelectedDateStr,
      fetchAllData,
      isLeaveModalOpen, setIsLeaveModalOpen,
      progressPercent,
      todayMood: data?.todayMood || null,
      todayCheckin: data?.todayCheckin || null,
      streakHistory: data?.streakHistory || [],
      wellnessActivities: data?.wellnessActivities || [],
      recommendedTherapist: data?.recommendedTherapist || null,
      moodHistory: data?.moodHistory || [],
      pathD,
      moodPoints,
      formatFocusDuration,
      taskSubject, setTaskSubject,
      taskTitle, setTaskTitle,
      taskPriority, setTaskPriority,
      taskDate, setTaskDate,
      taskDuration, setTaskDuration,
      editingTaskId, setEditingTaskId,
      examName, setExamName,
      examSubject, setExamSubject,
      examDate, setExamDate,
      examTime, setExamTime,
      examPriority, setExamPriority,
      examProgress, setExamProgress,
      editingExamId, setEditingExamId,
      journalTitle, setJournalTitle,
      journalContent, setJournalContent,
      journalMood, setJournalMood,
      ONBOARDING_QUESTIONS: getOnboardingQuestions(data?.user?.selectedCategory || profileCategory || "student")
    }}>
      {children}
    </StudentDashboardContext.Provider>
  );
}
