"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import MobileDrawer from "@/frontend/components/shell/MobileDrawer";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";
import StudentDashboardLayoutShell from "./StudentDashboardLayoutShell";
import { getAssessmentMetadata, getOnboardingQuestions } from "@/frontend/lib/assessment/questions/onboarding";

// --- Colors Palette Custom Mappings ---
// Background: #F5FAFB
// Primary/Purple: #5F4EA5
// Slate/Gray: #8E8A9F
// Deep Navy: #100E26
// Card bg: #FFFFFF
// Positive: #5FAF8A
// Warning: #E7A95F
// Critical: #D96C6C

export interface StudyTask {
  id: number;
  subject: string;
  title: string;
  priority: string;
  date: string;
  due_date: string;
  duration: number;
  duration_minutes: number;
  completed: boolean;
}

export interface Exam {
  id: number;
  subject: string;
  name: string;
  exam_name: string;
  date: string;
  exam_date: string;
  time: string;
  exam_time: string;
  priority: string;
  progress: number;
  progress_percentage: number;
  daysLeft: number;
}

export function displayExamDate(dateVal: string | null | undefined): string {
  if (!dateVal) return "Date not scheduled";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Date unavailable";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function displayTaskDate(dateVal: string | null | undefined): string {
  if (!dateVal) return "No due date";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Date unavailable";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const ONBOARDING_QUESTIONS = [
  {
    id: "workload",
    question: "How has your academic workload been feeling lately?",
    options: [
      { text: "Very manageable", val: "Very manageable" },
      { text: "Mostly manageable", val: "Mostly manageable" },
      { text: "A little heavy", val: "A little heavy" },
      { text: "Very overwhelming", val: "Very overwhelming" }
    ]
  },
  {
    id: "stress",
    question: "How would you describe your academic stress levels today?",
    options: [
      { text: "Calm & relaxed", val: "Calm & relaxed" },
      { text: "Manageable", val: "Manageable" },
      { text: "Elevated", val: "Elevated" },
      { text: "Overwhelming", val: "Overwhelming" }
    ]
  },
  {
    id: "sleep",
    question: "How many hours of quality sleep are you getting per night?",
    options: [
      { text: "8+ hours", val: "8+ hours" },
      { text: "6 to 8 hours", val: "6 to 8 hours" },
      { text: "4 to 6 hours", val: "4 to 6 hours" },
      { text: "Under 4 hours", val: "Under 4 hours" }
    ]
  },
  {
    id: "focus",
    question: "How easy is it for you to maintain focus during study sessions?",
    options: [
      { text: "Very easy", val: "Very easy" },
      { text: "Mostly easy", val: "Mostly easy" },
      { text: "Easily distracted", val: "Easily distracted" },
      { text: "Extremely difficult", val: "Extremely difficult" }
    ]
  },
  {
    id: "routine",
    question: "How consistent is your study routine?",
    options: [
      { text: "Highly disciplined", val: "Highly disciplined" },
      { text: "Moderately regular", val: "Moderately regular" },
      { text: "Mostly cramming", val: "Mostly cramming" },
      { text: "Very chaotic", val: "Very chaotic" }
    ]
  },
  {
    id: "examPressure",
    question: "How do you feel about your upcoming exams?",
    options: [
      { text: "Confident & prepared", val: "Confident & prepared" },
      { text: "Mildly anxious", val: "Mildly anxious" },
      { text: "Quite stressed", val: "Quite stressed" },
      { text: "Panicked / Unprepared", val: "Panicked / Unprepared" }
    ]
  },
  {
    id: "motivation",
    question: "How is your motivation to complete academic tasks today?",
    options: [
      { text: "High & inspired", val: "High & inspired" },
      { text: "Moderate", val: "Moderate" },
      { text: "Low", val: "Low" },
      { text: "Completely drained", val: "Completely drained" }
    ]
  },
  {
    id: "balance",
    question: "How well are you balancing study time with your social/personal life?",
    options: [
      { text: "Excellent balance", val: "Excellent balance" },
      { text: "Good balance", val: "Good balance" },
      { text: "Study takes over", val: "Study takes over" },
      { text: "No personal time", val: "No personal time" }
    ]
  },
  {
    id: "mood",
    question: "How is your general mood baseline this week?",
    options: [
      { text: "Good / Happy", val: "Good / Happy" },
      { text: "Okay / Neutral", val: "Okay / Neutral" },
      { text: "Stressed / Anxious", val: "Stressed / Anxious" },
      { text: "Down / Sad", val: "Down / Sad" }
    ]
  },
  {
    id: "supportPreference",
    question: "What kind of support is most important for you right now?",
    options: [
      { text: "Stress & anxiety relief", val: "Stress & anxiety relief" },
      { text: "Focus & study planning", val: "Focus & study planning" },
      { text: "Sleep & rest optimization", val: "Sleep & rest optimization" },
      { text: "AI companion conversations", val: "AI companion conversations" }
    ]
  }
];

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
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
      const category = (session?.user?.selectedCategory || "student").toLowerCase().trim();
      const isWp = category.includes("working") || category.includes("prof");
      
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
        const targetRoute = json.redirect || getCategoryDashboardRoute(json.category);
        router.replace(targetRoute);
        return;
      }

      if (!res.ok) {
        throw new Error(json.error || "Failed to load Dashboard payload.");
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

// --- Initials Avatar Fallback Helper ---
export const renderAvatar = (user: any, sizeClass = "w-9 h-9 text-xs") => {
  const hasCustomAvatar = user?.avatar && user.avatar !== "" && user.avatar !== "/images/user_avatar.jpg" && !user.avatar.includes("placeholder") && user.avatar.startsWith("data:");
  
  if (hasCustomAvatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || "Profile"}
        className={`${sizeClass} rounded-full object-cover border border-white/10 shrink-0`}
      />
    );
  }
  
  const name = user?.name || user?.sanctuaryName || "Member";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
    
  return (
    <div className={`${sizeClass} rounded-full bg-[#5F4EA5] text-white flex items-center justify-center font-bold tracking-wider border border-white/10 shrink-0 select-none`}>
      {initials || "M"}
    </div>
  );
};

// --- Left Sidebar Component ---
export function StudentSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isDarkMode, setActiveModal, setIsLeaveModalOpen } = useStudentDashboard();
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryDisplayName = (cat: string) => {
    if (!cat) return "Student";
    return cat
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
  const category = (session?.user?.selectedCategory || user?.selectedCategory || "student").toLowerCase().trim();
  const isStudent = category === "student";
  const categorySlug = category === "working_professional" ? "working-professional" : category;

  const groups = isStudent
    ? [
        {
          title: "MAIN",
          items: [
            { label: "Dashboard", icon: "dashboard", href: "/dashboard/student" },
            { label: "AI Companion", icon: "smart_toy", href: "/dashboard/student/ai-companion" },
            { label: "Daily Check-in", icon: "mood", href: "/dashboard/student/checkin" },
          ]
        },
        {
          title: "STUDY",
          items: [
            { label: "Focus Timer", icon: "timer", href: "/dashboard/student/focus" },
            { label: "Study Planner", icon: "assignment", href: "/dashboard/student/study-planner" },
            { label: "Exams", icon: "school", href: "/dashboard/student/exams" },
            { label: "Analytics", icon: "bar_chart", href: "/dashboard/student/analytics" },
          ]
        },
        {
          title: "WELLNESS",
          items: [
            { label: "Wellness", icon: "spa", href: "/dashboard/student/wellness" },
            { label: "Journal", icon: "auto_stories", href: "/dashboard/student/journal" },
            { label: "Sleep", icon: "bedtime", href: "/dashboard/student/sleep" },
          ]
        },
        {
          title: "SUPPORT",
          items: [
            { label: "Resources", icon: "library_books", href: "/dashboard/student/resources" },
            { label: "Community", icon: "forum", href: "/dashboard/student/community" },
            { label: "Professional Care", icon: "medical_services", href: "/dashboard/student/professional-care" },
          ]
        },
        {
          title: "ACCOUNT",
          items: [
            { label: "Settings", icon: "settings", href: "/dashboard/student/settings" },
          ]
        }
      ]
    : [
        {
          title: "MAIN",
          items: [
            { label: "Dashboard", icon: "dashboard", href: "/dashboard/working-professional" },
            { label: "AI Companion", icon: "smart_toy", href: "/dashboard/working-professional/ai-companion" },
            { label: "Daily Check-in", icon: "mood", href: "/dashboard/working-professional/checkin" },
          ]
        },
        {
          title: "WORK",
          items: [
            { label: "Focus Timer", icon: "timer", href: "/dashboard/working-professional/focus" },
            { label: "Task Manager", icon: "assignment", href: "/dashboard/working-professional/study-planner" },
            { label: "Calendar", icon: "calendar_month", href: "/dashboard/working-professional/calendar" },
            { label: "Meetings", icon: "groups", href: "/dashboard/working-professional/meetings" },
            { label: "Analytics", icon: "bar_chart", href: "/dashboard/working-professional/analytics" },
          ]
        },
        {
          title: "WELLNESS",
          items: [
            { label: "Wellness", icon: "spa", href: "/dashboard/working-professional/wellness" },
            { label: "Journal", icon: "auto_stories", href: "/dashboard/working-professional/journal" },
            { label: "Sleep", icon: "bedtime", href: "/dashboard/working-professional/sleep" },
          ]
        },
        {
          title: "SUPPORT",
          items: [
            { label: "Resources", icon: "library_books", href: "/dashboard/working-professional/resources" },
            { label: "Community", icon: "forum", href: "/dashboard/working-professional/community" },
            { label: "Professional Care", icon: "medical_services", href: "/dashboard/working-professional/professional-care" },
          ]
        },
        {
          title: "ACCOUNT",
          items: [
            { label: "Settings", icon: "settings", href: "/dashboard/working-professional/settings" },
          ]
        }
      ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? "230px" : "72px",
        transition: "width 200ms ease-in-out",
      }}
      className={`hidden md:flex fixed top-0 left-0 bottom-0 h-screen z-50 select-none flex-col justify-between shadow-lg shrink-0 border-r overflow-hidden ${
        isDarkMode
          ? "bg-[#100E26] text-slate-350 border-white/5"
          : "bg-white text-slate-700 border-slate-200"
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo Brand Header */}
        <div className="px-[18px] py-4 flex items-center shrink-0 mb-4 mt-2 h-16">
          <div className="w-9 h-9 rounded-xl bg-[#5F4EA5] flex items-center justify-center text-white shadow-md shrink-0">
            <span className="material-symbols-outlined text-xl font-black select-none">spa</span>
          </div>
          <div
            className={`text-left flex flex-col justify-center transition-all duration-200 overflow-hidden ${
              isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
            }`}
          >
            <h1 className={`font-heading font-black text-sm leading-none ${isDarkMode ? "text-white" : "text-[#100E26]"}`}>
              Manraah
            </h1>
            <p className="text-[9px] text-[#8E8A9F] font-bold uppercase tracking-wider mt-1 leading-none">
              Sanctuary for Mind
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <span
                className={`text-[9px] font-black tracking-widest px-4 block uppercase transition-all duration-200 overflow-hidden ${
                  isHovered ? "opacity-75 h-auto mt-2 mb-1" : "opacity-0 h-0"
                } ${isDarkMode ? "text-purple-400/70" : "text-[#5F4EA5]/70"}`}
              >
                {group.title}
              </span>
              <div className="space-y-1">
                {group.items.map((item, idx) => {
                  const isActive = pathname === item.href || (item.href !== `/dashboard/${categorySlug}` && pathname.startsWith(item.href));
                  return (
                    <button
                      key={idx}
                      onClick={() => router.push(item.href)}
                      aria-label={item.label}
                      className={`w-full flex items-center h-[38px] px-3 gap-0 rounded-xl transition-all duration-200 group/item relative select-none cursor-pointer ${
                        isHovered ? "justify-start" : "justify-center"
                      } ${
                        isActive
                          ? isDarkMode
                            ? "bg-[#5F4EA5] text-white shadow-[0_4px_12px_rgba(95,78,165,0.25)] font-black"
                            : "bg-[#F5F3FC] text-[#5F4EA5] font-black"
                          : isDarkMode
                            ? "text-[#8E8A9F] hover:bg-white/[0.05] hover:text-white"
                            : "text-slate-555 hover:bg-[#F5F3FC]/60 hover:text-[#5F4EA5]"
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/item:translate-x-0.5 select-none">
                          {item.icon}
                        </span>
                      </div>
                      <span
                        className={`text-[12px] font-bold leading-none tracking-normal whitespace-nowrap transition-all duration-200 ${
                          isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Profile Footer Panel */}
      <div
        className={`p-3 border-t shrink-0 ${
          isDarkMode
            ? "bg-[#0A091A] border-white/5"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div
          onClick={() => setActiveModal("profile")}
          className={`flex items-center p-2 rounded-xl transition-colors cursor-pointer ${
            isHovered ? "justify-between" : "justify-center"
          } ${
            isDarkMode
              ? "hover:bg-white/5"
              : "hover:bg-slate-200/50"
          }`}
        >
          <div className="flex items-center">
            {renderAvatar(user, "w-8 h-8 text-[10px] shrink-0")}
            <div
              className={`text-left flex flex-col justify-center transition-all duration-200 overflow-hidden ${
                isHovered ? "opacity-100 ml-3 max-w-[120px]" : "opacity-0 w-0 pointer-events-none"
              }`}
            >
              <p className={`text-xs font-semibold leading-tight truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                {user?.name || "Member"}
              </p>
              <span className="text-[9px] text-[#8E8A9F] font-bold block mt-0.5 leading-none">
                {getCategoryDisplayName(user?.selectedCategory || "student")}
              </span>
            </div>
          </div>
          {isHovered && (
            <span className="material-symbols-outlined text-[16px] text-[#8E8A9F] select-none">expand_more</span>
          )}
        </div>

        {/* Settings & Logout */}
        <div
          className={`border-t mt-2 pt-2 flex flex-col gap-0.5 ${
            isDarkMode ? "border-white/5" : "border-slate-200"
          }`}
        >
          <button
            onClick={() => router.push(`/dashboard/${categorySlug}/settings`)}
            aria-label="Settings"
            className={`w-full flex items-center h-[36px] px-3 gap-0 rounded-xl transition-all duration-200 group/settings cursor-pointer ${
              isHovered ? "justify-start" : "justify-center"
            } ${
              isDarkMode
                ? "text-[#8E8A9F] hover:bg-white/[0.05] hover:text-white"
                : "text-slate-555 hover:bg-[#F5F3FC]/50 hover:text-slate-800"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/settings:translate-x-0.5 select-none">
                settings
              </span>
            </div>
            <span
              className={`text-[12px] font-bold leading-none tracking-normal transition-all duration-200 ${
                isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
              }`}
            >
              Settings
            </span>
          </button>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            aria-label="Logout"
            className={`w-full flex items-center h-[36px] px-3 gap-0 rounded-xl transition-all duration-200 group/logout cursor-pointer ${
              isHovered ? "justify-start" : "justify-center"
            } ${
              isDarkMode
                ? "text-red-400/85 hover:bg-red-500/10 hover:text-red-300"
                : "text-red-500 hover:bg-red-50/50 hover:text-red-650"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/logout:translate-x-0.5 select-none">
                logout
              </span>
            </div>
            <span
              className={`text-[12px] font-bold leading-none tracking-normal transition-all duration-200 ${
                isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// --- Top Navigation Header ---
export function StudentHeader() {
  const { user, isDarkMode, toggleTheme, setIsMobileDrawerOpen } = useStudentDashboard();
  const router = useRouter();

  return (
    <header className="px-[28px] lg:px-[32px] py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-[#F5FAFB] dark:bg-[#0D1F2D] shrink-0 z-20">
      {/* Search box with mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Open menu"
          className="md:hidden w-10 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all shadow-2xs shrink-0"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">menu</span>
        </button>

        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search Manraah..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-semibold shadow-2xs"
          />
        </div>
      </div>

      {/* Right Header items */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all shadow-2xs">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">notifications</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border border-white">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-16 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-between px-2.5 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
        >
          <span className={`material-symbols-outlined text-base ${!isDarkMode ? "text-amber-500 font-bold" : "text-slate-400"}`}>
            light_mode
          </span>
          <span className={`material-symbols-outlined text-base ${isDarkMode ? "text-indigo-400 font-bold" : "text-slate-400"}`}>
            dark_mode
          </span>
        </button>

        {/* Crisis Help */}
        <button
          onClick={() => router.push("/crisis-support")}
          className="px-5 py-3 rounded-2xl bg-[#FEEAEA] border border-[#FEEAEA] hover:border-red-300 text-[#D96C6C] font-heading font-black text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold animate-spin-slow">local_hospital</span>
          Crisis Help
        </button>
      </div>
    </header>
  );
}

// --- Leave Confirmation Modal Component ---
export function LeaveConfirmationModal() {
  const { isLeaveModalOpen, setIsLeaveModalOpen } = useStudentDashboard();

  const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
  const category = (session?.user?.selectedCategory || "student").toLowerCase().trim();
  const isWp = category === "working_professional" || category === "working-professional";

  return (
    <AnimatePresence>
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="w-full max-w-sm rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-850 p-7 shadow-2xl text-center space-y-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">logout</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-black text-slate-800 dark:text-slate-100">
                {isWp ? "Go Back?" : "Log Out?"}
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {isWp ? "Do you really want to go back?" : "Do you really want to log out?"}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="flex-1 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-350 font-heading font-black text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { signOut } = await import("@/backend/auth/client");
                  await signOut();
                  window.location.href = "/login";
                }}
                className="flex-1 py-3.5 rounded-full bg-[#D96C6C] hover:bg-red-600 text-white font-heading font-black text-xs transition-all cursor-pointer"
              >
                {isWp ? "Logout" : "Log Out"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

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

// --- Student Wellness Assessment Subpage ---
export function StudentWellnessContent() {
  const { user, assessmentStatus, fetchAssessmentStatus, setOnboardingStep, setOnboardingAnswers, setIsAssessmentPopupOpen, profileCategory } = useStudentDashboard();
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

// --- Study Planner Subpage ---
export function StudentStudyPlannerContent() {
  const { tasks, handleToggleTaskComplete, togglingTaskId, setActiveModal, setEditingTaskId, setTaskSubject, setTaskTitle, setTaskPriority, setTaskDate, setTaskDuration } = useStudentDashboard();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Study Planner</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">Organize your academic tasks, routine, and preparation focus.</p>
        </div>
        <button
          onClick={() => {
            setTaskSubject("");
            setTaskTitle("");
            setTaskPriority("Medium");
            setTaskDate(new Date().toISOString().split("T")[0]);
            setTaskDuration(30);
            setEditingTaskId(null);
            setActiveModal("task");
          }}
          className="px-5 py-3 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
        >
          + Add Study Task
        </button>
      </div>

      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">
          Your Study Tasks ({tasks.length})
        </h3>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 font-bold py-6 text-center">No tasks planned yet. Add tasks to stay on track.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  task.completed
                    ? "bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60"
                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/30 dark:border-slate-750 hover:bg-slate-100/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    disabled={togglingTaskId === task.id}
                    onChange={() => handleToggleTaskComplete(task.id, task.completed)}
                    className="w-4.5 h-4.5 rounded-lg border-slate-300 text-[#5F4EA5] focus:ring-[#5F4EA5] cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black text-[#5F4EA5] dark:text-purple-300 bg-[#5F4EA5]/10 dark:bg-[#5F4EA5]/20 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {task.subject}
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        task.priority.toLowerCase() === "high" ? "bg-red-50 dark:bg-red-950/20 text-red-600" :
                        task.priority.toLowerCase() === "low" ? "bg-slate-100 dark:bg-slate-850 text-slate-500" :
                        "bg-amber-50 dark:bg-amber-950/20 text-amber-600"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className={`text-xs font-black text-slate-850 dark:text-slate-200 mt-1.5 ${task.completed ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                      ⏱️ {task.duration || task.duration_minutes || 30} mins | Due: {displayTaskDate(task.date || task.due_date)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTaskSubject(task.subject);
                    setTaskTitle(task.title);
                    setTaskPriority(task.priority);
                    const taskDateStr = task.date || task.due_date;
                    setTaskDate(taskDateStr ? new Date(taskDateStr).toISOString().split("T")[0] : "");
                    setTaskDuration(task.duration || task.duration_minutes || 30);
                    setEditingTaskId(task.id);
                    setActiveModal("task");
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

// --- Exams Subpage ---
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

// --- Journal Subpage ---
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

// --- Sleep Subpage ---
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

// --- Professional Care Subpage ---
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

// --- Resources Subpage ---
export function StudentResourcesContent() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Sanctuary Resources</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Read self-care guides, breathing manuals, audio, and wellness reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "Breathing Exercises 101", desc: "Ground stress immediately using simple square breathing.", icon: "air" },
          { title: "Study Hacks for Exam Stress", desc: "Scientific methods to avoid cramming and prepare calmly.", icon: "school" },
          { title: "Sleep Hygiene Guidelines", desc: "Tips to maintain quality bedtime patterns.", icon: "bedtime" },
          { title: "Mindful Journal Writing Guide", desc: "How to use logs to release emotional weight.", icon: "auto_stories" },
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#5F4EA5]/10 text-[#5F4EA5] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
            </div>
            <h4 className="font-heading font-black text-xs text-slate-850 dark:text-slate-100">{item.title}</h4>
            <p className="text-[10px] text-slate-400 font-bold leading-normal">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Community Subpage ---
export function StudentCommunityContent() {
  return (
    <div className="max-w-4xl mx-auto p-12 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-[28px] bg-[#5F4EA5]/10 text-[#5F4EA5] flex items-center justify-center mx-auto animate-pulse">
        <span className="material-symbols-outlined text-4xl">forum</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-black text-slate-850 dark:text-slate-100">Student Forums & Chats</h2>
        <p className="text-xs font-semibold text-slate-400 leading-normal max-w-sm mx-auto">
          Share tips, focus together, and talk anonymously in study support forums.
        </p>
      </div>

      <div className="inline-block py-2 px-5 rounded-full bg-[#5F4EA5]/5 border border-[#5F4EA5]/15 text-[10px] font-black text-[#5F4EA5] uppercase tracking-wider">
        🚀 Coming Soon to Sanctuary
      </div>
    </div>
  );
}

// --- Analytics Subpage ---
export function StudentAnalyticsContent() {
  return (
    <div className="max-w-4xl mx-auto p-12 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-6 animate-fadeIn">
      <div className="w-20 h-20 rounded-[28px] bg-[#5F4EA5]/10 text-[#5F4EA5] flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-4xl">bar_chart</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-black text-slate-850 dark:text-slate-100">Mindfulness Analytics</h2>
        <p className="text-xs font-semibold text-slate-400 leading-normal max-w-sm mx-auto">
          View custom reports showing your mood charts, sleep patterns, study metrics, and stress tracking metrics.
        </p>
      </div>

      <div className="inline-block py-2 px-5 rounded-full bg-[#5F4EA5]/5 border border-[#5F4EA5]/15 text-[10px] font-black text-[#5F4EA5] uppercase tracking-wider">
        🚀 Coming Soon to Sanctuary
      </div>
    </div>
  );
}

// --- Student AI Companion Chat Component ---
export function StudentAICompanionContent() {
  const { user } = useStudentDashboard();
  const [activeTab, setActiveTab] = useState<"chat" | "modes" | "voice">("chat");
  const [selectedEmotion, setSelectedEmotion] = useState<string>("Seeking Calm");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([
    {
      id: "1",
      sender: "ai",
      text: `Hello! I'm your Manraah Companion, calibrated for student wellness. How are you holding up today? You can share whatever is on your mind.`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");

    setTimeout(() => {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `I hear you completely. It takes strength to express how you feel. Let's take a slow 4-second breath together. What feels most challenging right now?`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">AI Companion</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Talk with your private AI reset partner, practice breathing, or vent anonymously.</p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between p-1.5 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("modes")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "modes" ? "bg-[#5F4EA5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-[#5F4EA5]"
          }`}
        >
          Emotion Mode
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "chat" ? "bg-[#5F4EA5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-[#5F4EA5]"
          }`}
        >
          Text Chat
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "voice" ? "bg-[#5F4EA5] text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-[#5F4EA5]"
          }`}
        >
          Voice Call
        </button>
      </div>

      {/* EMOTION MODE */}
      {activeTab === "modes" && (
        <div className="p-8 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F3FC] dark:bg-slate-850/50 text-[#5F4EA5] mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-heading font-black text-slate-850 dark:text-slate-100">Choose Companion Support Tone</h3>
            <p className="text-xs font-semibold text-slate-400">Select the energy you need from your AI companion today:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {[
              { title: "Seeking Calm", desc: "Gentle, slow-paced grounding", icon: "filter_vintage", color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" },
              { title: "Academic / Study Help", desc: "Structured problem solving", icon: "lightbulb", color: "bg-[#F5F3FC] dark:bg-purple-950/20 text-[#5F4EA5]" },
              { title: "Empathetic Venting", desc: "Non-judgmental listener", icon: "favorite", color: "bg-pink-50 dark:bg-pink-950/20 text-pink-500" },
              { title: "Crisis Redirection", desc: "Direct wellness resources", icon: "local_hospital", color: "bg-red-50 dark:bg-red-950/20 text-red-500" }
            ].map((tone) => (
              <button
                key={tone.title}
                onClick={() => {
                  setSelectedEmotion(tone.title);
                  setActiveTab("chat");
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      sender: "ai",
                      text: `Support tone updated to **${tone.title}**. Ready when you are.`,
                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    }
                  ]);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedEmotion === tone.title
                    ? "bg-[#F5F3FC] dark:bg-slate-800 border-[#5F4EA5] scale-102"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-850 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tone.color}`}>
                    <span className="material-symbols-outlined text-base">{tone.icon}</span>
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">{tone.title}</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{tone.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TEXT CHAT */}
      {activeTab === "chat" && (
        <div className="p-6 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 flex flex-col h-[500px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${m.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm select-none ${
                  m.sender === "user" ? "bg-[#5F4EA5] text-white" : "bg-[#F5F3FC] dark:bg-slate-800 text-[#5F4EA5]"
                }`}>
                  {m.sender === "user" ? "👤" : "🤖"}
                </div>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#5F4EA5] text-white rounded-tr-none"
                    : "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-750 rounded-tl-none"
                }`}>
                  <p>{m.text}</p>
                  <span className="block text-[8px] text-slate-400 font-bold text-right mt-1.5">{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Write a message to your sanctuary companion..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
            />
            <button
              onClick={handleSendMessage}
              className="w-11 h-11 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white flex items-center justify-center shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      )}

      {/* VOICE CALL */}
      {activeTab === "voice" && (
        <div className="p-12 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center mx-auto animate-pulse">
            <span className="material-symbols-outlined text-4xl">phone_in_talk</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-heading font-black text-slate-850 dark:text-slate-100">Sanctuary Voice Support</h3>
            <p className="text-xs font-semibold text-slate-400 max-w-xs mx-auto leading-normal">
              Practice slow-paced breathing exercises with real-time interactive guide voice help.
            </p>
          </div>

          <div className="inline-block py-2 px-5 rounded-full bg-[#5F4EA5]/5 border border-[#5F4EA5]/15 text-[10px] font-black text-[#5F4EA5] uppercase tracking-wider">
            🚀 Coming Soon to Student Portal
          </div>
        </div>
      )}
    </div>
  );
}

// --- Student Wellness Checkin Component ---
export function StudentCheckinContent() {
  const {
    todayCheckin,
    checkinMood, setCheckinMood,
    checkinStress, setCheckinStress,
    checkinEnergy, setCheckinEnergy,
    checkinNote, setCheckinNote,
    isSubmittingCheckin,
    handleDailyCheckinSubmit,
    setActiveModal
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

// --- Student Settings Page Component ---
export function StudentSettingsContent() {
  const {
    user,
    profileName, setProfileName,
    profileAvatar, setProfileAvatar,
    handleUpdateProfileSubmit,
    isDarkMode, toggleTheme,
    triggerToast
  } = useStudentDashboard();

  const [notificationsAlert, setNotificationsAlert] = useState(true);
  const [dataVisibility, setDataVisibility] = useState("Private");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      if (res.ok) {
        triggerToast("Account deleted successfully.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred deleting account.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-fadeIn">
      <div>
        <h2 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">Settings & Privacy</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1">Manage your profile, display preferences, and account privacy options.</p>
      </div>

      {/* Profile Card Section */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
          Profile Information
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
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

          <form onSubmit={handleUpdateProfileSubmit} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Display Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-150/60 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-850 dark:text-slate-200 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Email Address (Read-only)</label>
              <input
                type="text"
                disabled
                value={user?.email || ""}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Category Lock (Read-only)</label>
              <input
                type="text"
                disabled
                value={user?.selectedCategory === "working-professional" || user?.selectedCategory === "working_professional" ? "Working Professional" : "Student"}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed"
              />
            </div>

            <div className="flex items-end pt-2 sm:pt-0">
              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center cursor-pointer"
              >
                Update Profile Info
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
          Theme & Preferences
        </h3>

        <div className="space-y-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Portal Dark Mode</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Toggle system color theme for midnight browsing comfort.</p>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                isDarkMode ? "bg-[#5F4EA5]" : "bg-slate-200"
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                isDarkMode ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>

          {/* Notifications Alert Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Daily Reminders & Alerts</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Get desktop toast reminder alerts when study planner tasks are due.</p>
            </div>
            <button
              onClick={() => {
                setNotificationsAlert(!notificationsAlert);
                triggerToast(notificationsAlert ? "Alerts disabled." : "Alerts enabled.");
              }}
              className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${
                notificationsAlert ? "bg-[#5F4EA5]" : "bg-slate-200"
              }`}
            >
              <div className={`w-5.5 h-5.5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${
                notificationsAlert ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800 pb-2">
          Sanctuary Privacy Visibility
        </h3>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 font-heading">Forum Visibility Options</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Select how your credentials appear to other students in community chats.</p>
            </div>
            <select
              value={dataVisibility}
              onChange={(e) => {
                setDataVisibility(e.target.value);
                triggerToast(`Privacy updated to ${e.target.value}`);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-150/60 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-350 focus:outline-none"
            >
              <option value="Anonymous">Anonymous (Initials only)</option>
              <option value="Private">Fully Private (Invisible)</option>
              <option value="Visible">Visible (Show sanctuary name)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-red-200/20 dark:border-red-950/20 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h3 className="font-heading font-black text-xs text-red-500 uppercase tracking-widest border-b border-red-50 dark:border-red-950/10 pb-2">
          Danger Zone
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Delete Sanctuary Account</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">Permanently delete your wellbeing files, credentials, and settings logs.</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-3 rounded-2xl bg-[#D96C6C] hover:bg-red-650 text-white font-heading font-black text-[10px] uppercase tracking-wider transition-all shadow-2xs cursor-pointer animate-pulse"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[3px]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="w-full max-w-sm rounded-[32px] bg-white dark:bg-[#132E3F] border border-red-200 dark:border-red-950/40 p-7 shadow-2xl text-center space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 mx-auto flex items-center justify-center select-none">
                <span className="material-symbols-outlined text-2xl font-bold">warning</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-heading font-black text-red-500">Delete Sanctuary Permanently?</h3>
                <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 leading-relaxed">
                  This action is irreversible. All of your wellness records, tasks, journal logs, and credentials will be deleted forever.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-heading font-black text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3.5 rounded-full bg-red-500 hover:bg-red-650 text-white font-heading font-black text-xs transition-all cursor-pointer"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

export default function StudentDashboard() {
  return (
    <StudentDashboardProvider>
      <StudentDashboardLayoutShell>
        <StudentDashboardContent />
      </StudentDashboardLayoutShell>
    </StudentDashboardProvider>
  );
}
