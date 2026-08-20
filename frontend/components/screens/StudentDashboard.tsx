"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import MobileDrawer from "@/frontend/components/shell/MobileDrawer";

// --- Colors Palette Custom Mappings ---
// Background: #F5FAFB
// Primary/Purple: #5F4EA5
// Slate/Gray: #8E8A9F
// Deep Navy: #100E26
// Card bg: #FFFFFF
// Positive: #5FAF8A
// Warning: #E7A95F
// Critical: #D96C6C

export default function StudentDashboard() {
  const router = useRouter();

  // Sidebar hover/expand and mobile drawer states
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // --- States ---
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [tasks, setTasks] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
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

  const [journalTitle, setJournalTitle] = useState("");
  const [journalContent, setJournalContent] = useState("");
  const [journalMood, setJournalMood] = useState("Reflective");

  // Focus Timer Clock
  const [focusPreset, setFocusPreset] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Calendar selected date (October 6, 2026 default to match image)
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 9, 1));
  const [selectedDateStr, setSelectedDateStr] = useState(new Date(2026, 9, 6).toDateString());

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

  // --- Initial Data Load ---
  const fetchAllData = async () => {
    try {
      const res = await fetch("/api/dashboard/student");
      if (!res.ok) throw new Error("Failed to load Student Dashboard payload.");
      const json = await res.json();
      
      setData(json);
      setTasks(json.tasks || []);
      setExams(json.exams || []);
      setUpcomingAppointment(json.upcomingAppointment || null);
      if (json.focusSession) {
        setFocusSession(json.focusSession);
      }
      setSleepRecord(json.sleepRecord || null);

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

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: mood === "Good" ? "Happy" : mood === "Okay" ? "Calm" : mood === "Drained" ? "Okay" : mood === "Stressed" ? "Low" : "Overwhelmed",
          stress: stressStr,
          energy: energyLvl,
          sleepQuality: sleepRecord?.score || 4,
          workLifeBalance: 4,
          note: checkinNote || "Logged check-in",
        }),
      });

      if (!res.ok) throw new Error("Daily check-in could not be saved.");
      triggerToast("Daily check-in saved! Score updated. 🌿");
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  const handleDailyCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinMood) {
      triggerToast("Please select your mood.");
      return;
    }

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: checkinMood,
          stress: checkinStress,
          energy: checkinEnergy,
          sleepQuality: sleepRecord?.score || 4,
          workLifeBalance: 4,
          note: checkinNote || "Logged check-in",
        }),
      });

      if (!res.ok) throw new Error("Daily check-in could not be saved.");
      triggerToast("Daily check-in saved! Score updated. 🌿");
      setActiveModal(null);
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  // 2. Study Tasks CRUD
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskSubject.trim() || !taskTitle.trim() || !taskDate) {
      triggerToast("Please input all required fields");
      return;
    }

    try {
      const isEdit = editingTaskId !== null;
      const url = "/api/student/tasks";
      const method = isEdit ? "PUT" : "POST";
      const payload = isEdit
        ? { id: editingTaskId, subject: taskSubject, title: taskTitle, priority: taskPriority, date: taskDate, duration: taskDuration }
        : { subject: taskSubject, title: taskTitle, priority: taskPriority, date: taskDate, duration: taskDuration };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save task.");
      triggerToast(isEdit ? "Task updated! 📝" : "Task added to Planner! 🎓");
      
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

  const handleToggleTaskComplete = async (task: any) => {
    try {
      const res = await fetch("/api/student/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          completed: !task.completed,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle task completion.");
      triggerToast(task.completed ? "Task marked active." : "Task completed! 🎉");
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/student/tasks?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task.");
      triggerToast("Task deleted.");
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
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
    try {
      const res = await fetch(`/api/student/exams?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete exam.");
      triggerToast("Exam deleted.");
      fetchAllData();
    } catch (err: any) {
      triggerToast(err.message);
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
      <svg className="w-full h-full transform -rotate-90 select-none">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#F0EEFC" strokeWidth={stroke} className="dark:stroke-slate-800" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#5F4EA5"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
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
      const isTargetDate = d === 6; // October 6
      const isSelected = dateObj.toDateString() === selectedDateStr;
      
      days.push(
        <button
          key={`day-${d}`}
          onClick={() => setSelectedDateStr(dateObj.toDateString())}
          className={`w-8 h-8 rounded-full text-xs font-black relative flex items-center justify-center transition-all ${
            isSelected || isTargetDate
              ? "bg-[#5F4EA5] text-white shadow-md font-extrabold"
              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span>{d}</span>
          {(d === 14 || d === 2 || d === 8) && (
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
    // Show static scheduled activities as matches the reference design
    const items = [
      {
        title: "Manage Stress Space",
        time: "10:00 am - 10:30 am",
        icon: "🧘",
        color: "bg-[#F5F3FC] dark:bg-[#1C1635]/40 border-[#5F4EA5]/15 text-[#5F4EA5]",
        action: () => router.push("/meditation"),
      },
      {
        title: "Mindfulness Breathing",
        time: "09:00 am - 10:00 am",
        icon: "🌬️",
        color: "bg-pink-50/50 dark:bg-pink-950/10 border-pink-200/30 text-pink-600",
        action: () => router.push("/meditation"),
      },
      {
        title: "Study Focus Session",
        time: "11:00 am - 12:00 pm",
        icon: "🎯",
        color: "bg-emerald-50 dark:bg-[#132E3F]/40 border-emerald-200/20 text-[#5FAF8A]",
        action: () => handleStartFocusTimer(25),
      },
    ];

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

  const { user, streak, todayMood, wellnessScore, recommendation } = data;

  // Calculate dynamic progress percentage
  let completedActivities = 0;
  let totalActivities = 3;
  if (todayMood) completedActivities += 1;
  if (focusSession.completed >= focusSession.total) completedActivities += 1;
  
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t: any) => t.completed).length;
  if (totalTasksCount > 0) {
    totalActivities += 1;
    if (completedTasksCount === totalTasksCount) completedActivities += 1;
  }
  const progressPercent = 62; // Hardcode default to match reference layout 100%
  return (
    <div className="min-h-screen w-full bg-[#F5FAFB] dark:bg-[#0D1F2D] text-slate-800 dark:text-slate-100 flex overflow-hidden">
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
        }
        @keyframes glowSlow {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.15); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        }
        @keyframes orbitSlow {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(1px, -2px); }
          50% { transform: translate(-2px, 1px); }
          75% { transform: translate(-1px, -1px); }
        }
        .animate-float-slow {
          animation: floatSlow 4s infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite ease-in-out;
        }
        .animate-glow-slow {
          animation: glowSlow 4s infinite ease-in-out;
        }
        .animate-orbit-slow {
          animation: orbitSlow 6s infinite ease-in-out;
        }
      `}</style>
      
      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
        onFocus={() => setIsSidebarExpanded(true)}
        onBlur={() => setIsSidebarExpanded(false)}
        className={`hidden md:flex h-screen bg-[#100E26] text-slate-300 z-40 select-none flex-col justify-between transition-all duration-300 ease-out shadow-lg shrink-0 ${
          isSidebarExpanded ? "w-[250px]" : "w-[72px]"
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Logo Brand Header */}
          <div className="p-5 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-[#5F4EA5] flex items-center justify-center text-white shadow-md shrink-0">
              <span className="material-symbols-outlined text-2xl font-black">spa</span>
            </div>
            <div className={`text-left transition-opacity duration-300 ${
              isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 h-0 overflow-hidden"
            }`}>
              <h1 className="font-heading font-black text-sm text-white leading-tight">Manraah</h1>
              <p className="text-[9px] text-[#8E8A9F] font-bold uppercase tracking-wider">Sanctuary for Mind</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {[
              { label: "DASHBOARD", icon: "dashboard", href: "/dashboard/student", active: true },
              { label: "AI COMPANION", icon: "smart_toy", href: "/ai-chat" },
              { label: "CHECK-IN", icon: "mood", href: "/checkin" },
              { label: "FOCUS TIMER", icon: "timer", href: "#", action: () => handleStartFocusTimer(25) },
              { label: "STUDY PLANNER", icon: "assignment", href: "#", action: () => setActiveModal("task") },
              { label: "EXAMS", icon: "school", href: "#", action: () => setActiveModal("exam") },
              { label: "ANALYTICS", icon: "bar_chart", href: "#" },
              { label: "WELLNESS", icon: "spa", href: "#" },
              { label: "JOURNAL", icon: "auto_stories", href: "#", action: () => setActiveModal("journal") },
              { label: "SLEEP", icon: "bedtime", href: "#", action: () => setActiveModal("sleep") },
              { label: "RESOURCES", icon: "library_books", href: "/resources" },
              { label: "COMMUNITY", icon: "forum", href: "/community" },
              { label: "PROFESSIONAL CARE", icon: "medical_services", href: "#", action: () => setActiveModal("consult") },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.action || (() => router.push(item.href))}
                aria-label={item.label}
                className={`w-full flex items-center rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative group/item ${
                  isSidebarExpanded ? "px-4.5 py-3 gap-3.5 justify-start" : "p-3.5 justify-center"
                } ${
                  item.active
                    ? "bg-[#5F4EA5] text-white shadow-[0_4px_20px_rgba(95,78,165,0.4)]"
                    : "text-[#8E8A9F] hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-base shrink-0">{item.icon}</span>
                <span className={`transition-all duration-300 whitespace-nowrap ${
                  isSidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 w-0 overflow-hidden translate-x-2"
                }`}>
                  {item.label}
                </span>

                {/* Tooltip for Collapsed State */}
                {!isSidebarExpanded && (
                  <div className="absolute left-16 bg-[#1F1A3A] border border-white/10 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Footer Panel */}
        <div className="p-3 border-t border-white/5 shrink-0 bg-[#0A091A]">
          <div
            onClick={() => setActiveModal("profile")}
            className={`flex items-center rounded-2xl hover:bg-white/5 transition-colors cursor-pointer ${
              isSidebarExpanded ? "p-2 justify-between" : "p-1.5 justify-center"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || "/images/user_avatar.jpg"}
                alt={user?.name || "Profile"}
                className="w-10 h-10 rounded-2xl object-cover border border-white/10 shrink-0"
              />
              <div className={`text-left transition-opacity duration-300 ${
                isSidebarExpanded ? "opacity-100" : "opacity-0 w-0 h-0 overflow-hidden"
              }`}>
                <p className="text-xs font-black text-white leading-tight">{user?.name || "Member"}</p>
                <span className="text-[9px] text-[#8E8A9F] font-bold block mt-0.5">View Profile</span>
              </div>
            </div>
            {isSidebarExpanded && (
              <span className="material-symbols-outlined text-xs text-[#8E8A9F]">expand_more</span>
            )}
          </div>

          <div className={`flex border-t border-white/5 mt-3 pt-2 ${
            isSidebarExpanded ? "flex-row justify-between px-2 text-[10px]" : "flex-col items-center gap-3"
          }`}>
            <button
              onClick={() => setActiveModal("journal")}
              aria-label="Settings"
              className="relative group/settings flex items-center gap-1 text-[#8E8A9F] hover:text-white"
            >
              <span className="material-symbols-outlined text-base">settings</span>
              {isSidebarExpanded && <span>Settings</span>}

              {/* Tooltip */}
              {!isSidebarExpanded && (
                <div className="absolute left-16 bg-[#1F1A3A] border border-white/10 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider opacity-0 group-hover/settings:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                  Settings
                </div>
              )}
            </button>
            <button
              onClick={async () => {
                const { signOut } = await import("@/backend/auth/client");
                await signOut();
                window.location.href = "/login";
              }}
              aria-label="Logout"
              className="relative group/logout flex items-center gap-1 text-red-400 hover:text-red-300 font-bold"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              {isSidebarExpanded && <span>Logout</span>}

              {/* Tooltip */}
              {!isSidebarExpanded && (
                <div className="absolute left-16 bg-[#1F1A3A] border border-white/10 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider opacity-0 group-hover/logout:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-md">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== MAIN CONTENT CONTAINER ==================== */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto pb-6">
        
        {/* Toast Notifier */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-6 right-6 z-50 bg-[#100E26] border border-purple-200 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2"
            >
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="text-xs font-bold leading-none">{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== TOP NAVIGATION HEADER ==================== */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-[#F5FAFB] dark:bg-[#0D1F2D] shrink-0">
          
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
              className="w-16 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-between px-2.5 hover:bg-slate-50 transition-all shadow-2xs"
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
              className="px-5 py-3 rounded-2xl bg-[#FEEAEA] border border-[#FEEAEA] hover:border-red-300 text-[#D96C6C] font-heading font-black text-xs transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm font-bold animate-spin-slow">local_hospital</span>
              Crisis Help
            </button>
          </div>
        </header>

        {/* ==================== CONTENT GRID ==================== */}
        <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto w-full items-start">
          
          {/* ==================== LEFT COLUMN (xl-col-span-3) ==================== */}
          <div className="col-span-1 xl:col-span-3 space-y-6">
            
            {/* Daily Check-in Card */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[300px] relative overflow-hidden">
              {todayMood && todayMood.toLowerCase() === "good" && (
                <div className="absolute inset-0 pointer-events-none opacity-40 select-none">
                  <span className="absolute bottom-4 left-6 w-2 h-2 rounded-full bg-emerald-400 animate-float-slow" style={{ animationDelay: '0s' }} />
                  <span className="absolute bottom-8 left-16 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-float-slow" style={{ animationDelay: '1.5s' }} />
                  <span className="absolute bottom-6 right-8 w-2 h-2 rounded-full bg-emerald-400 animate-float-slow" style={{ animationDelay: '0.8s' }} />
                </div>
              )}

              <div className="space-y-4 z-10">
                {/* smiley avatar */}
                <div className="w-full flex justify-center py-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center relative shadow-inner ${
                    todayMood ? (
                      todayMood.toLowerCase() === "okay" ? "bg-amber-50 dark:bg-amber-950/20 animate-pulse-slow" :
                      todayMood.toLowerCase() === "stressed" ? "bg-red-50 dark:bg-red-950/20 animate-glow-slow shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                      todayMood.toLowerCase() === "overwhelmed" ? "bg-purple-50 dark:bg-purple-950/20 animate-orbit-slow" :
                      "bg-emerald-50 dark:bg-emerald-950/20"
                    ) : "bg-[#EBE7FC] dark:bg-slate-850"
                  }`}>
                    <span className="text-3xl select-none">
                      {todayMood ? (
                        todayMood.toLowerCase() === "good" ? "😊" :
                        todayMood.toLowerCase() === "okay" ? "😐" :
                        todayMood.toLowerCase() === "stressed" ? "😰" :
                        todayMood.toLowerCase() === "overwhelmed" ? "😫" :
                        "😊"
                      ) : "😊"}
                    </span>
                    {todayMood && (
                      <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#5F4EA5] border-2 border-white flex items-center justify-center text-white text-[8px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1 px-2">
                  <h4 className="text-xs font-black text-[#100E26] dark:text-slate-100">Daily Check-in</h4>
                  {todayMood ? (
                    <div className="space-y-2 mt-1">
                      <p className="text-[10px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest leading-none">
                        Today: {todayMood}
                      </p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {todayMood.toLowerCase() === "good" ? "Excellent! Keep riding this positive momentum today. 🌟" :
                         todayMood.toLowerCase() === "okay" ? "A steady day is a good day. Take things step by step. 🕊️" :
                         todayMood.toLowerCase() === "stressed" ? "Take a deep breath. Remember to take study breaks today. 🧘" :
                         todayMood.toLowerCase() === "overwhelmed" ? "It's okay to feel this way. Consider lowering your task load today. 💜" :
                         "Your check-in is complete. Have a wonderful day!"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-bold text-slate-400">How are you feeling today?</p>
                      <p className="text-[9px] text-slate-400 leading-relaxed pt-1">
                        Your check-in helps us personalize your day.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Checkin button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 z-10">
                {todayMood ? (
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-[#5FAF8A] text-[9px] font-black uppercase tracking-widest text-center border border-emerald-100/30">
                    Checked In &bull; Dynamic Score Updated
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveModal("checkin");
                    }}
                    className="w-full py-3.5 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-xs shadow-md hover:shadow-lg transition-all"
                  >
                    Check-in Now
                  </button>
                )}
              </div>
            </div>

            {/* Student Writing Desk Illustration */}
            <div className="rounded-[28px] overflow-hidden shadow-2xs bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 group relative">
              <img
                src="/images/student_studying.jpg"
                alt="Student studying at desk"
                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105 select-none"
              />
              <div className="absolute inset-0 bg-[#5F4EA5]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            {/* 100% Confidential card */}
            <div className="p-5.5 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex items-start gap-4 text-left">
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
            <div className="rounded-[28px] overflow-hidden shadow-2xs relative min-h-[170px] border border-slate-200/50 dark:border-slate-800 bg-white group">
              <img
                src="/images/motivation_bg.png"
                alt="Motivation background"
                className="absolute inset-0 w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-left z-10">
                <h6 className="text-[9px] font-black text-[#5F4EA5] uppercase tracking-wider">Today's Motivation</h6>
                <p className="text-xs font-heading font-black text-[#100E26] leading-relaxed pr-8 pt-4">
                  "Small progress today, big change tomorrow."
                </p>
                <div />
              </div>
            </div>

          </div>

          {/* ==================== MIDDLE COLUMN (xl-col-span-6) ==================== */}
          <div className="col-span-1 xl:col-span-6 space-y-6">
            
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
                <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 text-[#5F4EA5] flex items-center gap-1.5 shadow-2xs">
                  🎓 Student
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 text-[#E7A95F] flex items-center gap-1.5 shadow-2xs">
                  🔥 {data?.user?.streakDays ?? 7} Day Streak
                </span>
                <span className="px-3.5 py-1.5 rounded-full text-[9px] font-black bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 text-[#5FAF8A] flex items-center gap-1.5 shadow-2xs">
                  😊 Feeling: {data?.user?.currentMood ?? "Good"}
                </span>
              </div>
            </div>

            {/* Upcoming Appointment */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs space-y-4">
              <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest text-left">
                Upcoming Appointment
              </h4>

              {data?.upcomingAppointment ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                    {/* Left Hospital Card */}
                    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-[#FBFBFF] dark:bg-[#0D1F2D] shadow-3xs flex flex-col justify-between">
                      <img
                        src="/images/care_hospital.jpg"
                        alt="Care Hospital"
                        className="w-full h-24 object-cover select-none"
                      />
                      <div className="p-3 text-left">
                        <h5 className="text-[10px] font-black text-slate-800 dark:text-slate-200 leading-none">Care Hospital,</h5>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">New York, USA</p>
                      </div>
                    </div>

                    {/* Right Doctor Details */}
                    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-[#FBFBFF] dark:bg-[#0D1F2D] p-4 flex flex-col justify-between text-left">
                      <div className="flex items-center gap-3">
                        <img
                          src={data.upcomingAppointment.avatar || "/images/therapist_sarah.jpg"}
                          alt={data.upcomingAppointment.name}
                          className="w-10 h-10 rounded-xl object-cover shadow-2xs border border-slate-100"
                        />
                        <div>
                          <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">{data.upcomingAppointment.name}</h5>
                          <p className="text-[9px] text-[#5F4EA5] font-bold">{data.upcomingAppointment.title}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          SANCTUARY CONSULTANT
                        </span>
                        {data.upcomingAppointment.video_call_url && (
                          <button
                            onClick={() => window.open(data.upcomingAppointment.video_call_url, "_blank")}
                            className="px-3.5 py-2 rounded-xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md"
                          >
                            <span className="material-symbols-outlined text-xs">video_call</span>
                            VIDEO CALL
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Date/Time row spans full-width below */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="px-4 py-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#0D1F2D]/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-2 text-[9px] font-bold">
                      <span className="material-symbols-outlined text-[11px] text-[#5F4EA5]">calendar_today</span>
                      {new Date(data.upcomingAppointment.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-[#F5F3FC] dark:bg-[#0D1F2D]/50 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-2 text-[9px] font-bold">
                      <span className="material-symbols-outlined text-[11px] text-[#5F4EA5]">schedule</span>
                      {data.upcomingAppointment.time}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <span className="material-symbols-outlined text-3xl text-slate-350 dark:text-slate-700">event_busy</span>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No upcoming appointments</p>
                  <button
                    onClick={() => setActiveModal("consult")}
                    className="text-[10px] font-black text-[#5F4EA5] uppercase tracking-wider hover:underline"
                  >
                    Explore Professional Care &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Wellness Score & Daily Progress Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Wellness Score */}
              <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="text-left">
                  <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Wellness Score</h4>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">Your overall wellness today</p>
                </div>

                {(!data?.history || data.history.length === 0) ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center space-y-2">
                    <span className="material-symbols-outlined text-2xl text-[#5F4EA5]">insights</span>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal px-4">
                      Complete a few check-ins to build your wellness score.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                        {renderCircularProgress(data?.wellnessScore?.score ?? 78, 38, 7)}
                        <div className="absolute flex flex-col items-center">
                          <span className="text-base font-black text-slate-800 dark:text-slate-100">{data?.wellnessScore?.score ?? 78}</span>
                          <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest leading-none">/ 100</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-2">
                        {[
                          { label: "Mood", pct: data?.wellnessScore?.breakdown?.mood ?? 82 },
                          { label: "Stress", pct: data?.wellnessScore?.breakdown?.stress ?? 54 },
                          { label: "Sleep", pct: data?.wellnessScore?.breakdown?.sleep ?? 71 },
                          { label: "Focus", pct: data?.wellnessScore?.breakdown?.focus ?? 86 },
                        ].map((sub) => (
                          <div key={sub.label} className="space-y-0.5">
                            <div className="flex justify-between text-[8px] font-bold text-slate-500 dark:text-slate-400">
                              <span>{sub.label}</span>
                              <span>{sub.pct}%</span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-[#F0EEFC] dark:bg-slate-800">
                              <div
                                className="h-1 rounded-full bg-[#5F4EA5] transition-all"
                                style={{ width: `${sub.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center font-bold text-[9px] text-[#5FAF8A] uppercase tracking-wider">
                      {data?.wellnessScore?.level ?? "Good"}
                    </div>
                  </>
                )}
              </div>

              {/* Daily Progress */}
              <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[190px]">
                <div className="text-left">
                  <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Daily Progress</h4>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">Keep improving yourself every day!</p>
                </div>

                <div className="w-20 h-20 relative flex items-center justify-center mx-auto my-2">
                  {renderCircularProgress(progressPercent, 38, 7)}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">{progressPercent}%</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest leading-none">Complete</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/journey")}
                  className="w-full py-2.5 rounded-xl border border-[#F0EEFC] text-[9px] font-black text-[#5F4EA5] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  View Goals
                </button>
              </div>

            </div>

            {/* Study Focus, Study Analytics, Exam Tracker, Mood Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Study Focus */}
              <div className="p-4 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[180px] text-left">
                <div className="space-y-1">
                  <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Study Focus</h5>
                  <p className="text-[8px] text-slate-400 font-bold">Today's Focus Session</p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="w-9 h-9 rounded-full bg-[#EBE7FC] flex items-center justify-center text-lg select-none shrink-0">
                    ⏱️
                  </div>
                  <div>
                    <h6 className="text-xs font-black text-slate-800 dark:text-slate-100">
                      {data?.focusSession?.completed ?? 2} / {data?.focusSession?.total ?? 3}
                    </h6>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Sessions Completed</p>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-[#5F4EA5]"
                      style={{
                        width: `${Math.round(
                          ((data?.focusSession?.completed ?? 2) / (data?.focusSession?.total ?? 3)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-400">
                    <span>{formatFocusDuration(data?.focusSession?.duration ?? 100)}</span>
                    <span>Focused Today</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartFocusTimer(25)}
                  className="w-full py-1.5 rounded-lg border border-[#F0EEFC] text-[8px] font-black text-[#5F4EA5] uppercase tracking-widest hover:bg-slate-50 transition-all mt-2 text-center"
                >
                  Start Focus
                </button>
              </div>

              {/* Study Analytics */}
              <div className="p-4 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[180px] text-left">
                <div className="space-y-0.5">
                  <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Study Analytics</h5>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[8px] text-[#5F4EA5] font-bold uppercase">This Week</span>
                    <span className="text-[8px] text-slate-400 font-bold">8h 30m <span className="opacity-60">Total</span></span>
                  </div>
                </div>

                {/* SVG Bar Chart */}
                <div className="h-16 flex items-end justify-between px-1 pt-2 select-none">
                  {[20, 45, 30, 60, 50, 80, 40].map((h, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 mx-0.5">
                      <div className="w-2.5 bg-[#EBE7FC] dark:bg-slate-800 rounded-t-sm h-12 relative overflow-hidden">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-[#5F4EA5] rounded-t-sm"
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className="text-[7px] font-black text-slate-400 mt-1 uppercase">
                        {["M", "T", "W", "T", "F", "S", "S"][i]}
                      </span>
                    </div>
                  ))}
                </div>
                <div />
              </div>

              {/* Exam Tracker */}
              <div className="p-4 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[180px] text-left">
                <div className="space-y-0.5">
                  <h5 className="text-[9px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-widest">Exam Tracker</h5>
                  <p className="text-[8px] text-slate-400 font-bold">Upcoming Exams</p>
                </div>

                <div className="space-y-2 pt-2 flex-1 flex flex-col justify-center">
                  {(data?.exams && data.exams.length > 0) ? (
                    data.exams.slice(0, 2).map((ex: any) => (
                      <div key={ex.id} className="space-y-0.5">
                        <div className="flex justify-between text-[8px] font-bold text-slate-600 dark:text-slate-300">
                          <span className="truncate pr-1">{ex.name}</span>
                          <span className="text-[#E7A95F] shrink-0">{ex.daysLeft}d Left</span>
                        </div>
                        <div className="w-full h-1 bg-[#F0EEFC] rounded-full overflow-hidden">
                          <div className="h-full bg-[#5F4EA5]" style={{ width: `${ex.progress}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[8px] text-slate-400 font-bold text-center">No upcoming exams</p>
                  )}
                </div>

                <button
                  onClick={() => setActiveModal("exam")}
                  className="text-[8px] font-black text-[#5F4EA5] uppercase tracking-widest hover:underline mt-2 text-center"
                >
                  View All Exams &rarr;
                </button>
              </div>

              {/* Mood Overview */}
              <div className="p-4 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[180px] text-left">
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
                    <path
                      d="M 5 22 Q 20 5 35 15 T 65 25 T 95 12"
                      fill="none"
                      stroke="#5F4EA5"
                      strokeWidth="2"
                    />
                    {[
                      { x: 5, y: 22 },
                      { x: 20, y: 8 },
                      { x: 35, y: 15 },
                      { x: 50, y: 20 },
                      { x: 65, y: 25 },
                      { x: 80, y: 32 },
                      { x: 95, y: 12 }
                    ].map((pt, i) => (
                      <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="#FFFFFF" stroke="#5F4EA5" strokeWidth="1.5" />
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

          </div>

          {/* ==================== RIGHT COLUMN (xl-col-span-3) ==================== */}
          <div className="col-span-1 xl:col-span-3 space-y-6">
            
            {/* Calendar Card */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs">
              {renderCalendarDays()}
            </div>

            {/* Schedule Events List */}
            <div className="p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest text-left">
                  Schedule for Oct 6
                </h4>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5F4EA5]" />
              </div>

              {renderScheduleItems()}

              <button
                onClick={() => router.push("/journey")}
                className="w-full text-center text-[9px] font-black text-[#5F4EA5] uppercase tracking-widest hover:underline pt-2 block"
              >
                View Full Schedule →
              </button>
            </div>

          </div>

        </main>

        {/* ==================== BOTTOM FULL-WIDTH TRAY ==================== */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-7xl mx-auto w-full mt-4">
          
          {/* AI Recommendation */}
          <div className="col-span-1 lg:col-span-6 rounded-[32px] overflow-hidden min-h-[140px] shadow-2xs border border-slate-250/20 bg-[#F5F3FC] dark:bg-[#1C1635] flex items-center relative text-left">
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
                  onClick={() => router.push("/meditation")}
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
          <div className="col-span-1 lg:col-span-6 p-5 rounded-[32px] bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-800 shadow-2xs flex flex-col justify-between min-h-[140px] text-left">
            <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-widest mb-3">
              Quick Tools
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: "2-Min Reset", icon: "restart_alt", action: () => router.push("/meditation") },
                { label: "Meditation", icon: "self_improvement", action: () => router.push("/meditation") },
                { label: "Breathing", icon: "air", action: () => router.push("/meditation") },
                { label: "Sleep Support", icon: "bedtime", action: () => setActiveModal("sleep") },
                { label: "Journal", icon: "auto_stories", action: () => setActiveModal("journal") },
                { label: "AI Companion", icon: "smart_toy", action: () => router.push("/ai-chat") },
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

      {/* Mobile Animated Drawer navigation overlay */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <MobileDrawer
            isOpen={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ==================== MODALS ==================== */}

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
                  className="flex-1 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">
                    {timerRunning ? "pause" : "play_arrow"}
                  </span>
                  <span>{timerRunning ? "Pause" : "Resume"}</span>
                </button>
                <button
                  onClick={handleCompleteFocus}
                  className="px-4 py-3 rounded-full border border-teal-500 text-teal-600 dark:text-teal-400 font-bold text-xs hover:bg-teal-50 dark:hover:bg-teal-950/10 transition-all"
                >
                  Finish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Add/Edit Task Modal */}
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
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">📋</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">
                  {editingTaskId !== null ? "Edit Study Task" : "Add Study Task"}
                </h4>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                  <input
                    type="text"
                    required
                    value={taskSubject}
                    onChange={(e) => setTaskSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Details</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Read Chapter 4"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration (m)</label>
                    <input
                      type="number"
                      required
                      value={taskDuration}
                      onChange={(e) => setTaskDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6"
                >
                  {editingTaskId !== null ? "Update Task" : "Add to Schedule"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Add/Edit Exam Modal */}
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
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">📝</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">
                  {editingExamId !== null ? "Edit Exam Progress" : "Add Upcoming Exam"}
                </h4>
              </div>

              <form onSubmit={handleSaveExam} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Name</label>
                  <input
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Physics Midterm"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</label>
                  <input
                    type="text"
                    required
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</label>
                    <input
                      type="text"
                      required
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      placeholder="e.g. 09:00 AM"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prep Progress</label>
                    <span className="text-xs font-black text-[#5F4EA5]">{examProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={examProgress}
                    onChange={(e) => setExamProgress(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5F4EA5]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6"
                >
                  {editingExamId !== null ? "Update Exam" : "Add Exam"}
                </button>
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
                <span className="text-3xl block">🌙</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Log Sleep Details</h4>
              </div>

              <form onSubmit={handleSaveSleep} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sleep Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={sleepTimeInput}
                    onChange={(e) => setSleepTimeInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wake Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={wakeTimeInput}
                    onChange={(e) => setWakeTimeInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Score</label>
                    <span className="text-xs font-black text-[#5F4EA5]">{sleepQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#5F4EA5]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6"
                >
                  Save Sleep Record
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Book Consultation Modal */}
      <AnimatePresence>
        {activeModal === "consult" && (
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
                <span className="text-3xl block">🤝</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Book Professional Care</h4>
                <p className="text-[10px] text-[#5F4EA5] font-bold uppercase tracking-wider">Exam season stress consult</p>
              </div>

              <div className="space-y-4 text-left">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D1F2D] border border-slate-100 dark:border-slate-800 flex gap-3 items-center">
                  <img
                    src="/images/therapist_sarah.jpg"
                    alt="Dr. Sarah Jenkins"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">Dr. Sarah Jenkins</h5>
                    <p className="text-[9px] text-slate-400 font-bold">Child Psychology</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Available Slot</span>
                  <span className="text-xs font-black text-[#5F4EA5] block">Tomorrow, 09:00 PM (Video Call)</span>
                </div>

                <button
                  onClick={handleBookConsultation}
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-4"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Log Journal Reflection Modal */}
      <AnimatePresence>
        {activeModal === "journal" && (
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
                <span className="text-3xl block">📖</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Sanctuary Journal Entry</h4>
              </div>

              <form onSubmit={handleSaveJournal} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Title</label>
                  <input
                    type="text"
                    required
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    placeholder="e.g. Calm reflection"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reflections</label>
                  <textarea
                    required
                    rows={4}
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write here..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6"
                >
                  Save Reflection
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Daily Check-in Modal */}
      <AnimatePresence>
        {activeModal === "checkin" && (
          <div className="fixed inset-0 z-50 bg-[#121212]/70 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 max-w-md w-full space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-3xl block">🌿</span>
                <h4 className="text-lg font-heading font-black text-[#100E26] dark:text-slate-100">Daily Wellness Check-in</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">How are you feeling today?</p>
              </div>

              <form onSubmit={handleDailyCheckinSubmit} className="space-y-4 text-left">
                {/* Mood selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Select Mood</label>
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
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
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
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Stress Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Low", "Moderate", "High", "Very High"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCheckinStress(lvl)}
                        className={`py-2 px-1 rounded-xl border text-[9px] font-bold text-center transition-all ${
                          checkinStress === lvl
                            ? "bg-[#F5F3FC] border-[#5F4EA5] text-[#5F4EA5] font-black"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Energy Level (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCheckinEnergy(val)}
                        className={`w-10 h-10 rounded-full border text-xs font-black transition-all flex items-center justify-center ${
                          checkinEnergy === val
                            ? "bg-[#5F4EA5] border-[#5F4EA5] text-white font-black scale-110"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Reflection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Reflection Note (Optional)</label>
                  <textarea
                    rows={2}
                    value={checkinNote}
                    onChange={(e) => setCheckinNote(e.target.value)}
                    placeholder="How was your day? Write a brief note..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6"
                >
                  Submit Check-in
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. User Profile Modal */}
      <AnimatePresence>
        {activeModal === "profile" && (
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

              <div className="text-center space-y-3">
                <div className="relative w-20 h-20 mx-auto">
                  <img
                    src={profileAvatar || "/images/user_avatar.jpg"}
                    alt="Profile Avatar"
                    className="w-20 h-20 rounded-3xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#5F4EA5] border-2 border-white flex items-center justify-center text-white cursor-pointer hover:bg-[#100E26] transition-colors">
                    <span className="material-symbols-outlined text-xs">edit</span>
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
                <div className="space-y-0.5">
                  <h4 className="text-base font-heading font-black text-[#100E26] dark:text-slate-100">{user?.name || "Sanctuary Member"}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfileSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Sanctuary Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Category</label>
                  <select
                    value={profileCategory}
                    onChange={(e) => setProfileCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-bold"
                  >
                    <option value="student">Student</option>
                    <option value="working_professional">Working Professional</option>
                    <option value="parent">Parent</option>
                    <option value="couple">Couple</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-bold shadow-md transition-all text-center block mt-6"
                >
                  Save Profile Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Inline SVG Illustrations (EXACT MATCHING THE REFERENCE DESIGN) ---

function StudentWritingIllustration() {
  return (
    <svg viewBox="0 0 280 180" className="w-full h-auto bg-[#FBFBFF] dark:bg-slate-900 select-none">
      <defs>
        <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF2AF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFF9E0" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="hoodieGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A76E5" />
          <stop offset="100%" stopColor="#5F4EA5" />
        </linearGradient>
      </defs>

      {/* Wall Shelf */}
      <line x1="20" y1="40" x2="100" y2="40" stroke="#E2DFEE" strokeWidth="3" strokeLinecap="round" />
      <rect x="35" y="15" width="12" height="25" fill="#8E8A9F" rx="1" />
      <rect x="50" y="20" width="10" height="20" fill="#E7A95F" rx="1" />
      <rect x="63" y="10" width="14" height="30" fill="#5F4EA5" rx="1" />

      {/* Window/Light background */}
      <circle cx="210" cy="70" r="50" fill="#EBE7FC" opacity="0.4" />

      {/* Desk Lamp */}
      <path d="M 230 130 C 230 90 200 90 200 90" fill="none" stroke="#8E8A9F" strokeWidth="4" strokeLinecap="round" />
      <polygon points="190,85 210,85 220,105 180,105" fill="#5F4EA5" />
      {/* Light glow */}
      <polygon points="200,105 110,180 280,180" fill="url(#glow)" />
      
      {/* Desk Table */}
      <rect x="0" y="145" width="280" height="10" fill="#B0A8C9" rx="2" />
      <rect x="0" y="155" width="280" height="25" fill="#E2DFEE" />

      {/* Laptop */}
      <path d="M 170 145 L 210 145 L 220 120 L 180 120 Z" fill="#100E26" />
      <rect x="165" y="143" width="50" height="3" fill="#8E8A9F" rx="1" />

      {/* Desk Plant */}
      <rect x="235" y="125" width="18" height="20" fill="#E7A95F" rx="2" />
      <path d="M 238 125 Q 230 110 240 105 Q 248 115 244 125 Z" fill="#5FAF8A" />
      <path d="M 244 125 Q 255 110 248 100 Q 240 112 242 125 Z" fill="#5FAF8A" />

      {/* The Chair */}
      <rect x="60" y="110" width="40" height="35" fill="#8E8A9F" rx="8" />
      <line x1="80" y1="145" x2="80" y2="160" stroke="#8E8A9F" strokeWidth="4" />

      {/* Student Figure */}
      {/* Torso in Hoodie */}
      <path d="M 70 145 L 120 145 L 125 110 L 80 110 Z" fill="url(#hoodieGrad)" />
      {/* Arms writing */}
      <path d="M 125 110 Q 140 120 150 145" fill="none" stroke="url(#hoodieGrad)" strokeWidth="12" strokeLinecap="round" />
      <path d="M 90 115 Q 115 130 135 145" fill="none" stroke="url(#hoodieGrad)" strokeWidth="12" strokeLinecap="round" />
      {/* Head */}
      <circle cx="108" cy="85" r="14" fill="#FDD3B5" />
      {/* Hair (Black/Dark) */}
      <path d="M 96 82 Q 102 70 118 74 Q 120 86 114 90" fill="#100E26" />
      {/* Notebook/Papers */}
      <rect x="130" y="141" width="30" height="5" fill="#FFFFFF" rx="1" />
    </svg>
  );
}

function HospitalIllustration() {
  return (
    <svg viewBox="0 0 160 100" className="w-full h-auto bg-[#EBE7FC] select-none">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0DDF3" />
          <stop offset="100%" stopColor="#FFF" />
        </linearGradient>
      </defs>
      
      {/* Sky Background */}
      <rect x="0" y="0" width="160" height="100" fill="url(#sky)" />

      {/* Clouds */}
      <circle cx="20" cy="20" r="10" fill="#FFFFFF" opacity="0.6" />
      <circle cx="30" cy="22" r="8" fill="#FFFFFF" opacity="0.6" />
      <circle cx="140" cy="15" r="12" fill="#FFFFFF" opacity="0.6" />

      {/* Hills/Trees behind */}
      <ellipse cx="40" cy="80" rx="30" ry="20" fill="#5FAF8A" opacity="0.8" />
      <ellipse cx="120" cy="80" rx="40" ry="25" fill="#5FAF8A" opacity="0.8" />

      {/* Hospital Modern Building */}
      <rect x="45" y="25" width="70" height="60" fill="#FFFFFF" rx="4" />
      {/* Side wings */}
      <rect x="30" y="40" width="20" height="45" fill="#F5F3FC" rx="2" />
      <rect x="110" y="40" width="20" height="45" fill="#F5F3FC" rx="2" />

      {/* Main Glass entrance block */}
      <rect x="65" y="45" width="30" height="40" fill="#EBE7FC" rx="2" />
      <rect x="70" y="65" width="20" height="20" fill="#100E26" rx="2" />

      {/* Windows rows */}
      <rect x="35" y="48" width="10" height="8" fill="#B0A8C9" rx="1" />
      <rect x="35" y="62" width="10" height="8" fill="#B0A8C9" rx="1" />
      <rect x="115" y="48" width="10" height="8" fill="#B0A8C9" rx="1" />
      <rect x="115" y="62" width="10" height="8" fill="#B0A8C9" rx="1" />
      
      <rect x="52" y="32" width="10" height="8" fill="#B0A8C9" rx="1" />
      <rect x="75" y="32" width="10" height="8" fill="#B0A8C9" rx="1" />
      <rect x="98" y="32" width="10" height="8" fill="#B0A8C9" rx="1" />

      {/* Medical Blue Logo on top */}
      <rect x="73" y="12" width="14" height="14" fill="#5F4EA5" rx="3" />
      <rect x="78" y="15" width="4" height="8" fill="#FFFFFF" />
      <rect x="76" y="17" width="8" height="4" fill="#FFFFFF" />

      {/* Ground Grass */}
      <rect x="0" y="85" width="160" height="15" fill="#5FAF8A" />
    </svg>
  );
}

function MeditationIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" className="select-none">
      <defs>
        <linearGradient id="medG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2AF" />
          <stop offset="100%" stopColor="#5F4EA5" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Glow background */}
      <circle cx="50" cy="45" r="32" fill="url(#medG)" opacity="0.6" />

      {/* Floating leaves */}
      <path d="M 20 25 Q 12 18 10 30 Q 18 35 20 25 Z" fill="#5FAF8A" opacity="0.7" />
      <path d="M 85 45 Q 92 38 95 50 Q 88 55 85 45 Z" fill="#5FAF8A" opacity="0.7" />

      {/* Sparkles */}
      <circle cx="25" cy="55" r="1.5" fill="#E7A95F" />
      <circle cx="75" cy="20" r="1.5" fill="#E7A95F" />
      <circle cx="50" cy="10" r="2" fill="#E7A95F" />

      {/* meditating girl */}
      <circle cx="50" cy="25" r="8" fill="#100E26" />
      {/* Torso */}
      <path d="M42,50 L58,50 L54,32 L46,32 Z" fill="#100E26" />
      {/* Legs in cross lotus */}
      <path d="M30,60 Q50,45 70,60 Q50,68 30,60" fill="#5F4EA5" />
      {/* Hands in mudra position */}
      <circle cx="34" cy="54" r="2" fill="#100E26" />
      <circle cx="66" cy="54" r="2" fill="#100E26" />
    </svg>
  );
}

function MountainIllustration() {
  return (
    <svg viewBox="0 0 240 170" className="absolute inset-0 w-full h-full object-cover select-none">
      <rect width="240" height="170" fill="#EBE7FC" />
      {/* Soft gradient sun */}
      <circle cx="190" cy="65" r="32" fill="#FFF2AF" opacity="0.75" />
      {/* Mountain Back layer */}
      <path d="M -20 170 L 80 80 L 180 170 Z" fill="#D2C9FA" opacity="0.8" />
      {/* Mountain Front layer */}
      <path d="M 70 170 L 170 95 L 270 170 Z" fill="#B2A5F5" opacity="0.75" />
      {/* Soft hills floor */}
      <ellipse cx="120" cy="175" rx="140" ry="25" fill="#9C8CF0" opacity="0.9" />
    </svg>
  );
}
