"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function WorkingProfessionalDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [showDecompressionModal, setShowDecompressionModal] = useState<boolean>(false);
  const [showFocusModal, setShowFocusModal] = useState<boolean>(false);
  const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
  const [showWorkLifeModal, setShowWorkLifeModal] = useState<boolean>(false);
  const [showApptModal, setShowApptModal] = useState<boolean>(false);
  const [showJournalModal, setShowJournalModal] = useState<boolean>(false);

  // Active Selected Date Str for calendar/schedule
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toDateString());

  // Focus Timer States
  const [isFocusRunning, setIsFocusRunning] = useState<boolean>(false);
  const [focusDuration, setFocusDuration] = useState<number>(25 * 60); 
  const [initialFocusDuration, setInitialFocusDuration] = useState<number>(25 * 60);
  const [focusIntervalId, setFocusIntervalId] = useState<any | null>(null);

  // Decompression Timer States
  const [decompressionTimeLeft, setDecompressionTimeLeft] = useState<number>(120); 
  const [isDecompressionRunning, setIsDecompressionRunning] = useState<boolean>(false);
  const [decompressionIntervalId, setDecompressionIntervalId] = useState<any | null>(null);

  // Goal States
  const [newGoalTitle, setNewGoalTitle] = useState<string>( "");
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState<string>("");
  const [isSavingEditGoal, setIsSavingEditGoal] = useState<boolean>(false);

  // Checkin Questionnaire Form State
  const [checkinMood, setCheckinMood] = useState<string>("Good");
  const [checkinStress, setCheckinStress] = useState<string>("Manageable");
  const [checkinEnergy, setCheckinEnergy] = useState<number>(4);
  const [checkinSleep, setCheckinSleep] = useState<number>(4);
  const [checkinBalance, setCheckinBalance] = useState<number>(3);
  const [checkinNote, setCheckinNote] = useState<string>("");
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState<boolean>(false);

  // Sleep Logger State
  const [sleepBedtime, setSleepBedtime] = useState<string>("11:30 PM");
  const [sleepWakeTime, setSleepWakeTime] = useState<string>("07:30 AM");
  const [sleepDurationMins, setSleepDurationMins] = useState<number>(480);
  const [sleepQuality, setSleepQuality] = useState<number>(75);
  const [isSavingSleep, setIsSavingSleep] = useState<boolean>(false);

  // Work-Life Logger State
  const [workVal, setWorkVal] = useState<number>(70);
  const [personalVal, setPersonalVal] = useState<number>(80);
  const [recoveryVal, setRecoveryVal] = useState<number>(60);
  const [isSavingWorkLife, setIsSavingWorkLife] = useState<boolean>(false);

  // Appointment Reschedule State
  const [apptRescheduleId, setApptRescheduleId] = useState<number | null>(null);
  const [apptNewDate, setApptNewDate] = useState<string>("");
  const [apptNewTime, setApptNewTime] = useState<string>("09:00 PM");
  const [isSavingAppt, setIsSavingAppt] = useState<boolean>(false);

  // Journal Logger State
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalTitle, setJournalTitle] = useState<string>("");
  const [journalContent, setJournalContent] = useState<string>("");
  const [journalMoodTag, setJournalMoodTag] = useState<string>("Reflective");
  const [journalCategory, setJournalCategory] = useState<string>("Personal");
  const [isSavingJournal, setIsSavingJournal] = useState<boolean>(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Mood overview selected dot state
  const [selectedMoodPoint, setSelectedMoodPoint] = useState<any | null>(null);

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth and category guard
  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.isAuthenticated) {
      router.push("/login");
      return;
    }
    const cat = session.user?.selectedCategory || (session.user as any)?.category;
    if (cat === "student") {
      router.push("/dashboard/student");
    }
  }, [router]);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/working-professional");
      if (!res.ok) {
        throw new Error("Failed to load dashboard data");
      }
      const json = await res.json();
      
      // Category Security Guard check from database response
      const dbCat = json.user?.selectedCategory || json.user?.category;
      if (dbCat === "student") {
        router.push("/dashboard/student");
        return;
      }

      setData(json);
      
      // Initialize edit values from DB profile
      setProfileName(json.user?.name || "");
      setProfileAvatar(json.user?.avatar || "");
    } catch (err: any) {
      setError(err.message || "An error occurred while loading dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Focus Timer logic
  useEffect(() => {
    if (isFocusRunning) {
      const interval = setInterval(() => {
        setFocusDuration((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsFocusRunning(false);
            logFocusSession(Math.round(initialFocusDuration / 60));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setFocusIntervalId(interval);
      return () => clearInterval(interval);
    } else {
      if (focusIntervalId) {
        clearInterval(focusIntervalId);
      }
    }
  }, [isFocusRunning]);

  // Decompression Timer logic
  useEffect(() => {
    if (isDecompressionRunning) {
      const interval = setInterval(() => {
        setDecompressionTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsDecompressionRunning(false);
            completeDecompressionSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setDecompressionIntervalId(interval);
      return () => clearInterval(interval);
    } else {
      if (decompressionIntervalId) {
        clearInterval(decompressionIntervalId);
      }
    }
  }, [isDecompressionRunning]);

  // Goals CRUD handlers
  const handleToggleGoal = async (goalId: number, currentCompleted: boolean) => {
    // Optimistic UI updates
    setData((prev: any) => {
      if (!prev) return prev;
      const updatedGoals = prev.goals.map((g: any) =>
        g.id === goalId ? { ...g, completed: !currentCompleted, completed_at: !currentCompleted ? new Date().toISOString() : null } : g
      );
      return { ...prev, goals: updatedGoals };
    });

    try {
      const res = await fetch("/api/working-professional/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goalId, completed: !currentCompleted }),
      });
      if (res.ok) {
        const updatedGoal = await res.json();
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedGoals = prev.goals.map((g: any) =>
            g.id === goalId ? updatedGoal : g
          );
          return { ...prev, goals: updatedGoals };
        });
      } else {
        throw new Error("Failed to toggle goal");
      }
    } catch (err) {
      triggerToast("Failed to toggle goal. Reverting...");
      // Revert optimistic update
      setData((prev: any) => {
        if (!prev) return prev;
        const updatedGoals = prev.goals.map((g: any) =>
          g.id === goalId ? { ...g, completed: currentCompleted } : g
        );
        return { ...prev, goals: updatedGoals };
      });
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    try {
      setIsAddingGoal(true);
      const res = await fetch("/api/working-professional/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newGoalTitle.trim() }),
      });
      if (res.ok) {
        const newGoal = await res.json();
        setData((prev: any) => {
          if (!prev) return prev;
          return { ...prev, goals: [...prev.goals, newGoal] };
        });
        setNewGoalTitle("");
        triggerToast("Goal created successfully! 🎯");
      }
    } catch (err) {
      triggerToast("Failed to create goal.");
    } finally {
      setIsAddingGoal(false);
    }
  };

  const handleEditGoalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoalId || !editingGoalTitle.trim()) return;

    try {
      setIsSavingEditGoal(true);
      const res = await fetch(`/api/working-professional/goals/${editingGoalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingGoalTitle.trim() }),
      });
      if (res.ok) {
        const updatedGoal = await res.json();
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedGoals = prev.goals.map((g: any) =>
            g.id === editingGoalId ? updatedGoal : g
          );
          return { ...prev, goals: updatedGoals };
        });
        setEditingGoalId(null);
        setEditingGoalTitle("");
        triggerToast("Goal updated successfully.");
      }
    } catch (err) {
      triggerToast("Failed to edit goal.");
    } finally {
      setIsSavingEditGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      const res = await fetch(`/api/working-professional/goals/${goalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedGoals = prev.goals.filter((g: any) => g.id !== goalId);
          return { ...prev, goals: updatedGoals };
        });
        triggerToast("Goal deleted.");
      }
    } catch (err) {
      triggerToast("Failed to delete goal.");
    }
  };

  // Focus Log API
  const logFocusSession = async (mins: number) => {
    try {
      const res = await fetch("/api/working-professional/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: mins }),
      });
      if (res.ok) {
        loadDashboardData();
        triggerToast(`Focus session logged: ${mins} minutes! ⏱️`);
        setShowFocusModal(false);
      }
    } catch (err) {
      console.error("Failed to log focus session:", err);
    }
  };

  // Decompression ritual API
  const completeDecompressionSession = async () => {
    try {
      const res = await fetch("/api/meditation/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutes: 2, title: "Work Decompression", category: "Decompression" }),
      });
      if (res.ok) {
        await fetch("/api/working-professional/decompression", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration: 120, completed: true, type: "decompression" }),
        });

        loadDashboardData();
        triggerToast("Decompression completed successfully! 🌿");
        setShowDecompressionModal(false);
        setDecompressionTimeLeft(120);
      }
    } catch (err) {
      console.error("Failed to save decompression session:", err);
    }
  };

  // Daily Checkin Form Submit API
  const handleSaveCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCheckin(true);

    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: checkinMood,
          stress: checkinStress,
          energy: checkinEnergy,
          sleepQuality: checkinSleep,
          workLifeBalance: checkinBalance,
          note: checkinNote,
        }),
      });
      if (res.ok) {
        setShowCheckinModal(false);
        setCheckinNote("");
        loadDashboardData();
        triggerToast("Daily Check-in completed successfully! 🌸");
      } else {
        const errJson = await res.json();
        triggerToast(errJson.error || "Failed to submit check-in.");
      }
    } catch (err) {
      triggerToast("Failed to submit check-in.");
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  // Sleep record API
  const handleSaveSleepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSleep(true);
    try {
      const res = await fetch("/api/working-professional/sleep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedtime: sleepBedtime,
          wakeTime: sleepWakeTime,
          duration: sleepDurationMins,
          score: sleepQuality,
        }),
      });
      if (res.ok) {
        setShowSleepModal(false);
        loadDashboardData();
        triggerToast("Sleep record updated successfully! 🌙");
      }
    } catch (err) {
      triggerToast("Failed to save sleep record.");
    } finally {
      setIsSavingSleep(false);
    }
  };

  // Work-Life Balance API
  const handleSaveWorkLifeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWorkLife(true);
    try {
      const res = await fetch("/api/working-professional/work-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work: workVal,
          personal: personalVal,
          recovery: recoveryVal,
        }),
      });
      if (res.ok) {
        setShowWorkLifeModal(false);
        loadDashboardData();
        triggerToast("Work-life balance updated! 📊");
      }
    } catch (err) {
      triggerToast("Failed to save work-life data.");
    } finally {
      setIsSavingWorkLife(false);
    }
  };

  // Appointment cancel & reschedule APIs
  const handleCancelAppointment = async (apptId: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`/api/working-professional/appointments/${apptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) {
        loadDashboardData();
        triggerToast("Appointment cancelled successfully.");
      }
    } catch (err) {
      triggerToast("Failed to cancel appointment.");
    }
  };

  const handleRescheduleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptRescheduleId || !apptNewDate || !apptNewTime) return;

    try {
      setIsSavingAppt(true);
      const res = await fetch(`/api/working-professional/appointments/${apptRescheduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentDate: apptNewDate, appointmentTime: apptNewTime }),
      });
      if (res.ok) {
        setShowApptModal(false);
        loadDashboardData();
        triggerToast("Appointment rescheduled successfully.");
      }
    } catch (err) {
      triggerToast("Failed to reschedule appointment.");
    } finally {
      setIsSavingAppt(false);
    }
  };

  // Journal CRUD APIs
  const handleSaveJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;

    try {
      setIsSavingJournal(true);
      let res;
      if (editingJournalId) {
        res = await fetch(`/api/journal/${editingJournalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: journalTitle.trim(),
            content: journalContent.trim(),
            moodTag: journalMoodTag,
            category: journalCategory,
          }),
        });
      } else {
        res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: journalTitle.trim(),
            content: journalContent.trim(),
            moodTag: journalMoodTag,
            category: journalCategory,
          }),
        });
      }

      if (res.ok) {
        setJournalTitle("");
        setJournalContent("");
        setEditingJournalId(null);
        loadDashboardData();
        triggerToast(editingJournalId ? "Journal entry updated! 📖" : "Journal entry saved successfully! 📖");
      }
    } catch (err) {
      triggerToast("Failed to save journal entry.");
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      const res = await fetch(`/api/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadDashboardData();
        triggerToast("Journal entry deleted.");
      }
    } catch (err) {
      triggerToast("Failed to delete journal entry.");
    }
  };

  // Profile Save API
  const handleSaveProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    try {
      setIsSavingProfile(true);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data?.user?.id,
          sanctuaryName: profileName.trim(),
          avatar: profileAvatar,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        // Update local session
        const activeSession = getClientSession();
        const updated = {
          ...activeSession,
          user: {
            ...activeSession.user,
            name: json.user.name,
            sanctuaryName: json.user.sanctuaryName,
            avatar: json.user.avatar,
          },
        };
        localStorage.setItem("manraah_auth_session", JSON.stringify(updated));
        document.cookie = `manraah_session=${JSON.stringify(updated)}; path=/; max-age=2592000`;
        
        setShowProfileModal(false);
        loadDashboardData();
        triggerToast("Profile updated successfully!");
      }
    } catch (err) {
      triggerToast("Failed to save profile updates.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Helpers
  const completedGoalsCount = data?.goals?.filter((g: any) => g.completed).length || 0;
  const totalGoalsCount = data?.goals?.length || 0;
  
  const progressPercent = data ? Math.round(
    ((data.todayCheckin ? 1 : 0) +
     (data.focus?.todaySessionsCount > 0 ? 1 : 0) +
     (totalGoalsCount > 0 ? (completedGoalsCount / totalGoalsCount) * 2 : 0)) * 25
  ) : 0;

  const formatFocusTime = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;
    return hrs > 0 ? `${hrs}h ${remaining}m` : `${remaining}m`;
  };

  const getEnergyText = (score: number) => {
    if (score >= 4) return "High";
    if (score === 3) return "Moderate";
    return "Low";
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Dynamic analytics compilers
  const getFocusAnalyticsData = () => {
    const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const minsMap: Record<string, number> = {};
    weekOrder.forEach(d => minsMap[d] = 0);

    if (data?.focus?.sessions) {
      data.focus.sessions.forEach((s: any) => {
        const day = new Date(s.created_at).toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3);
        if (minsMap[day] !== undefined) {
          minsMap[day] += s.duration_minutes || 0;
        }
      });
    }

    return weekOrder.map(day => {
      const minutes = minsMap[day];
      const pct = Math.min(100, Math.round((minutes / 120) * 100));
      return {
        day,
        minutes,
        pct: pct || 5
      };
    });
  };

  const getStressChartData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const stressMap: Record<string, number> = {
      "low": 20,
      "none": 10,
      "manageable": 40,
      "moderate": 60,
      "stressed": 80,
      "overwhelmed": 100,
    };

    const defaultData = [
      { day: "Mon", val: 30 },
      { day: "Tue", val: 55 },
      { day: "Wed", val: 20 },
      { day: "Thu", val: 40 },
      { day: "Fri", val: 65 },
      { day: "Sat", val: 25 },
      { day: "Sun", val: 35 },
    ];

    if (!data?.history || data.history.length === 0) {
      return defaultData;
    }

    const counts: Record<string, { total: number, count: number }> = {};
    days.forEach(d => counts[d] = { total: 0, count: 0 });

    data.history.forEach((h: any) => {
      const dayName = new Date(h.created_at).toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3);
      const strLevel = (h.stress || "manageable").toLowerCase();
      const score = stressMap[strLevel] || 40;
      if (counts[dayName]) {
        counts[dayName].total += score;
        counts[dayName].count += 1;
      }
    });

    const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return weekOrder.map(day => {
      const item = counts[day];
      const avg = item && item.count > 0 ? Math.round(item.total / item.count) : 0;
      return { day, val: avg || 25 };
    });
  };

  const getMoodOverviewData = () => {
    const weekOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const moodScores: Record<string, number> = {
      "joyful": 100,
      "amazing": 100,
      "good": 80,
      "calm": 80,
      "okay": 50,
      "neutral": 50,
      "stressed": 30,
      "anxious": 30,
      "drained": 15,
      "tired": 15,
      "overwhelmed": 10,
    };

    const dayCheckins: Record<string, any> = {};
    if (data?.history) {
      data.history.forEach((ch: any) => {
        const day = new Date(ch.created_at).toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3);
        if (!dayCheckins[day]) {
          dayCheckins[day] = ch;
        }
      });
    }

    return weekOrder.map(day => {
      const ch = dayCheckins[day];
      const moodVal = ch ? moodScores[ch.mood.toLowerCase()] || 50 : 50;
      return {
        day,
        val: moodVal,
        checkin: ch || null
      };
    });
  };

  // Guided breathing prompts config
  const getDecompressionInstruction = (timeLeft: number) => {
    const cycleTime = (120 - timeLeft) % 14;
    if (cycleTime < 4) {
      return { text: "Inhale", duration: 4, scale: 1.4, color: "text-[#0B4F3C]" };
    } else if (cycleTime < 8) {
      return { text: "Hold", duration: 4, scale: 1.4, color: "text-amber-600" };
    } else {
      return { text: "Exhale", duration: 6, scale: 1.0, color: "text-[#5F4EA5]" };
    }
  };

  // SVG circular loader
  const renderCircularProgress = (percentage: number, radius = 34, strokeWidth = 6) => {
    const circ = 2 * Math.PI * radius;
    const offset = circ - (Math.min(100, Math.max(0, percentage)) / 100) * circ;
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 select-none">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#EAF7F1"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#62B596"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
    );
  };

  // Calendar render week
  const renderCalendarDays = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start Monday

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(startOfWeek);
      dateObj.setDate(startOfWeek.getDate() + i);
      const isSelected = dateObj.toDateString() === selectedDateStr;
      const isToday = dateObj.toDateString() === today.toDateString();
      const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 3);
      const dayNum = dateObj.getDate();

      const hasEvent =
        (data?.upcomingAppointment && new Date(data.upcomingAppointment.appointment_date).toDateString() === dateObj.toDateString()) ||
        data?.appointments?.some((ap: any) => new Date(ap.appointment_date).toDateString() === dateObj.toDateString()) ||
        data?.scheduleEvents?.some((ev: any) => new Date(ev.event_date).toDateString() === dateObj.toDateString()) ||
        data?.history?.some((ch: any) => new Date(ch.created_at).toDateString() === dateObj.toDateString());

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => setSelectedDateStr(dateObj.toDateString())}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center flex-1 transition-all relative ${
            isSelected
              ? "bg-[#0B4F3C] text-white shadow-sm font-bold scale-105"
              : isToday
              ? "bg-[#EAF7F1] text-[#0B4F3C] font-bold"
              : "text-[#718079] hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">{dayName}</span>
          <span className="text-xs font-black mt-1 leading-none">{dayNum}</span>
          {hasEvent && !isSelected && (
            <span className="w-1 h-1 rounded-full bg-[#62B596] absolute bottom-1" />
          )}
        </button>
      );
    }
    return days;
  };

  // Schedule render
  const buildDailyItems = () => {
    const items: any[] = [];

    // Appointments match selected day
    if (data?.appointments) {
      data.appointments.forEach((appt: any) => {
        const apptDate = new Date(appt.appointment_date).toDateString();
        if (apptDate === selectedDateStr) {
          items.push({
            id: appt.id,
            title: `Consultation: ${appt.doctor_name}`,
            time: appt.appointment_time,
            desc: appt.doctor_title,
            icon: "🩺",
            color: "bg-[#FFF3EC]/60 border-[#FFF3EC]/30 text-amber-900",
            action: () => {
              setApptRescheduleId(appt.id);
              setApptNewDate(appt.appointment_date.split("T")[0]);
              setApptNewTime(appt.appointment_time);
              setShowApptModal(true);
            },
          });
        }
      });
    }

    // Schedule events matching selected day
    if (data?.scheduleEvents) {
      data.scheduleEvents.forEach((ev: any) => {
        const evDate = new Date(ev.event_date).toDateString();
        if (evDate === selectedDateStr) {
          items.push({
            id: ev.id,
            title: ev.title,
            time: `${ev.start_time} - ${ev.end_time}`,
            desc: "Daily Routine Schedule Activity",
            icon: "⏰",
            color: "bg-[#F3F0FA]/65 border-[#F3F0FA]/30 text-[#5F4EA5]",
            action: () => {},
          });
        }
      });
    }

    // Daily checkins logged on selected date
    if (data?.history) {
      data.history.forEach((ch: any) => {
        const checkDate = new Date(ch.created_at).toDateString();
        if (checkDate === selectedDateStr) {
          items.push({
            id: ch.id,
            title: `Check-in: Feeling ${ch.mood}`,
            time: `Logged at ${new Date(ch.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            desc: ch.note || "No reflection logged.",
            icon: ch.mood.toLowerCase() === "good" || ch.mood.toLowerCase() === "happy" || ch.mood.toLowerCase() === "joyful" ? "😊" : "😐",
            color: "bg-[#EAF7F1]/60 border-[#EAF7F1]/30 text-[#0B4F3C]",
            action: () => {},
          });
        }
      });
    }

    if (items.length === 0) {
      return (
        <div className="py-4 text-center flex flex-col items-center justify-center space-y-1.5">
          <span className="material-symbols-outlined text-lg text-slate-300 dark:text-slate-600">event_busy</span>
          <p className="text-[11px] font-bold text-slate-400">
            No activities scheduled for this date.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={item.action}
            className={`p-3 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] ${item.color}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">{item.icon}</span>
              <div className="truncate flex-1">
                <h5 className="text-[10px] font-black uppercase tracking-wider truncate leading-tight">{item.title}</h5>
                <p className="text-[9px] text-[#718079] font-bold mt-0.5 truncate">{item.desc}</p>
                <p className="text-[9px] font-black uppercase text-[#0B4F3C] mt-1 leading-none">{item.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Loading Skeletons
  if (isLoading) {
    return (
      <div className="w-full space-y-[32px] animate-pulse py-4 bg-[#F7FAF8] dark:bg-slate-900 min-h-screen p-[28px] lg:p-[36px]">
        <div className="h-28 bg-white dark:bg-slate-800 rounded-[20px]" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div className="h-36 bg-white dark:bg-slate-800 rounded-[20px]" />
              <div className="h-36 bg-white dark:bg-slate-800 rounded-[20px]" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="h-32 bg-white dark:bg-slate-800 rounded-[20px]" />
              <div className="h-32 bg-white dark:bg-slate-800 rounded-[20px]" />
            </div>
          </div>
          <div className="xl:col-span-4 h-64 bg-white dark:bg-slate-800 rounded-[20px]" />
        </div>
      </div>
    );
  }

  // Connection fail / error
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#F7FAF8] dark:bg-slate-900">
        <div className="w-full max-w-[400px] bg-white dark:bg-[#132E3F] rounded-[20px] p-8 border border-slate-200/50 text-center space-y-4 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-[#EA5E5E]">warning</span>
          <h4 className="font-heading font-black text-xs text-[#18322A] dark:text-slate-100 uppercase tracking-wider">Sanctuary Sync Failed</h4>
          <p className="text-[11px] font-bold text-slate-400 leading-normal">{error}</p>
          <button
            onClick={loadDashboardData}
            className="w-full py-3 rounded-xl bg-[#0B4F3C] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#073C2C] transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const moodOrderData = getMoodOverviewData();

  return (
    <div className="w-full space-y-[32px] bg-[#F7FAF8] dark:bg-slate-900 text-[#18322A] dark:text-[#E3EAE5] min-h-screen relative">
      
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-0 right-0 mx-auto z-50 w-fit max-w-[320px] px-4 py-2.5 bg-[#0B4F3C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border border-emerald-500/10 text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP SECTION GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* LEFT / MAIN COLUMN (col-span-8) */}
        <div className="xl:col-span-8 space-y-5">
          
          {/* Welcome Card */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden group min-h-[140px]">
            <div className="space-y-1.5 relative z-10">
              <p className="text-[11px] font-black text-[#62B596] uppercase tracking-widest leading-none">WELCOME BACK</p>
              <h2
                className="font-heading font-black text-2xl lg:text-3xl text-[#18322A] dark:text-slate-100 tracking-tight leading-tight cursor-pointer hover:underline flex items-center gap-2"
                onClick={() => setShowProfileModal(true)}
              >
                Hi, {data?.user?.name || "Sanctuary Member"}! 👋
              </h2>
              <p className="text-[13px] lg:text-[14px] text-[#718079] font-bold leading-normal max-w-xl">
                Let's make today a little lighter. Small steps matter, especially on busy days.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 bg-[#EAF7F1] text-[#0B4F3C] text-[10px] font-black uppercase tracking-wider rounded-full">💼 Working Professional</span>
                <span className="px-3 py-1 bg-[#FFF3EC] text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-full">🔥 {data?.streak?.currentStreak || 1} Day Streak</span>
                <span className="px-3 py-1 bg-[#F3F0FA] text-[#5F4EA5] text-[10px] font-black uppercase tracking-wider rounded-full">🙂 Feeling {data?.user?.currentMood || "Good"}</span>
              </div>
            </div>

            <div
              className="w-48 h-32 shrink-0 relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hidden md:block cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowProfileModal(true)}
            >
              <img
                src="/images/wp_welcome_illustration.jpg"
                alt="Workspace Wellness Illustration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Row 2: Check-In card + Upcoming Consultation card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Daily Check-In */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] flex flex-col justify-between min-h-[190px] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 text-left">
              <div>
                <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">DAILY CHECK-IN</h4>
              </div>

              {data?.todayCheckin ? (
                <div className="py-2 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#0B4F3C] dark:text-[#62B596] font-black text-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    <span>Check-in completed</span>
                  </div>
                  <div className="text-[11px] text-[#718079] font-bold space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <p>Feeling: <span className="text-[#18322A] dark:text-slate-100 font-extrabold">{data.todayCheckin.mood}</span></p>
                    <p>Stress: <span className="text-[#18322A] dark:text-slate-100 font-extrabold">{data.todayCheckin.stress}</span></p>
                    <p>Energy: <span className="text-[#18322A] dark:text-slate-100 font-extrabold">{getEnergyText(data.todayCheckin.energy)}</span></p>
                  </div>
                  <p className="text-[9px] text-[#718079] font-bold">
                    Completed today at {formatTime(data.todayCheckin.created_at)}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-[12px] font-black text-[#18322A] dark:text-slate-100 mt-2">How are you feeling today?</p>
                  <p className="text-[11px] text-[#718079] font-bold mt-1 leading-normal">Your check-in helps personalize your wellness journey.</p>
                </div>
              )}

              {data?.todayCheckin ? (
                <button
                  type="button"
                  onClick={() => {
                    setCheckinMood(data.todayCheckin.mood);
                    setCheckinStress(data.todayCheckin.stress);
                    setCheckinEnergy(data.todayCheckin.energy);
                    setCheckinSleep(data.todayCheckin.sleepQuality || 3);
                    setCheckinBalance(data.todayCheckin.workLifeBalance || 3);
                    setCheckinNote(data.todayCheckin.note || "");
                    setShowCheckinModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#0B4F3C]/20 hover:bg-[#EAF7F1]/30 text-[#0B4F3C] dark:text-[#62B596] text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  View Today's Check-in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCheckinMood("Good");
                    setCheckinStress("Manageable");
                    setCheckinEnergy(4);
                    setCheckinSleep(4);
                    setCheckinBalance(3);
                    setCheckinNote("");
                    setShowCheckinModal(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Check-in Now
                </button>
              )}
            </div>

            {/* Upcoming Consultations */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] flex flex-col justify-between min-h-[190px] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 text-left">
              <div>
                <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">UPCOMING APPOINTMENT</h4>
              </div>

              {data?.upcomingAppointment ? (
                <div className="space-y-2">
                  <div className="w-full h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img
                      src="/images/wp_appointment_illustration.jpg"
                      alt="Consultation Room Illustration"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EAF7F1] flex items-center justify-center shrink-0 text-[#0B4F3C]">
                      <span className="material-symbols-outlined text-lg leading-none">medical_services</span>
                    </div>
                    <div className="truncate flex-1">
                      <h5 className="text-[12px] font-black text-[#18322A] dark:text-slate-100 uppercase tracking-wider truncate leading-tight">
                        {data.upcomingAppointment.doctor_name}
                      </h5>
                      <p className="text-[11px] text-[#718079] font-bold truncate leading-none mt-0.5">
                        {data.upcomingAppointment.doctor_title}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-[11px] font-black text-[#0B4F3C] dark:text-[#62B596]">
                    <span className="flex items-center gap-1">📅 {new Date(data.upcomingAppointment.appointment_date).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
                    <span className="flex items-center gap-1">🕘 {data.upcomingAppointment.appointment_time}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(data.upcomingAppointment.video_call_url || "/call")}
                      className="flex-1 py-1.5 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Join Call
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelAppointment(data.upcomingAppointment.id)}
                      className="py-1.5 px-3 rounded-xl border border-red-200 text-red-650 hover:bg-red-50 text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-full h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                    <img
                      src="/images/wp_appointment_illustration.jpg"
                      alt="Consultation Room Illustration"
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  <div className="p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2">
                    <p className="text-[11px] font-bold text-[#718079]">No upcoming appointments.</p>
                    <button
                      type="button"
                      onClick={() => router.push("/professional-care")}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all text-[#0B4F3C]"
                    >
                      Find Support
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Row 3: Wellness Score + Daily Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Wellness Score */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4 text-left min-h-[190px]">
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">WELLNESS SCORE</h4>

              {!data?.wellnessScore ? (
                <div className="py-4 text-center flex flex-col items-center justify-center space-y-1">
                  <span className="material-symbols-outlined text-xl text-[#0B4F3C]">insights</span>
                  <p className="text-[11px] font-bold text-slate-400 leading-normal px-4">Complete logs to compute your wellness score.</p>
                </div>
              ) : (
                <div className="flex items-center gap-5">
                  <div className="w-18 h-18 shrink-0 relative flex items-center justify-center">
                    {renderCircularProgress(data.wellnessScore.score)}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-[#18322A] dark:text-slate-100">{data.wellnessScore.score}</span>
                      <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-none">/ 100</span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2 text-left">
                    {[
                      { label: "Mind", val: data.wellnessScore.breakdown.mind },
                      { label: "Stress", val: data.wellnessScore.breakdown.stress },
                      { label: "Sleep", val: data.wellnessScore.breakdown.sleep },
                      { label: "Balance", val: data.wellnessScore.breakdown.balance },
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[9px] font-bold text-[#718079]">
                          <span>{item.label}</span>
                          <span>{item.val}%</span>
                        </div>
                        <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-1 rounded-full bg-[#62B596]" style={{ width: `${item.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Progress */}
            <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 flex flex-col justify-between min-h-[190px] text-left">
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">DAILY PROGRESS</h4>

              <div className="flex items-center gap-5 justify-between py-1">
                <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                  {renderCircularProgress(progressPercent, 28, 5)}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[13px] font-black text-[#18322A] dark:text-slate-100">{progressPercent}%</span>
                    <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">DONE</span>
                  </div>
                </div>

                <div className="flex-1 text-left space-y-1">
                  <p className="text-[11px] font-bold text-[#718079]">
                    {completedGoalsCount} of {Math.max(1, totalGoalsCount)} daily targets completed
                  </p>
                  <p className="text-[10px] text-[#62B596] font-bold">Small actions add up today.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/journey")}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-[#0B4F3C] dark:text-[#62B596] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center"
              >
                View Goals
              </button>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (col-span-4) - CALENDAR & SCHEDULE */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* Calendar Box */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4 text-left min-h-[280px]">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">CALENDAR</h4>
                <p className="text-[12px] font-black text-[#18322A] dark:text-slate-100 mt-0.5">
                  {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Calendar weekly selector */}
            <div className="flex justify-between gap-1 pb-1">
              {renderCalendarDays()}
            </div>

            {/* Selected Date schedule events */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <h5 className="text-[10px] font-black text-[#718079] uppercase tracking-widest mb-2.5">
                SCHEDULE FOR {new Date(selectedDateStr).toLocaleDateString([], { month: "short", day: "numeric" }).toUpperCase()}
              </h5>
              {buildDailyItems()}
            </div>
          </div>

          {/* Quick Tools Tray */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4 text-left">
            <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">QUICK TOOLS</h4>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider text-center">
              <button
                type="button"
                onClick={() => setShowDecompressionModal(true)}
                className="p-3 bg-[#EAF7F1] rounded-xl hover:scale-[1.02] border border-[#62B596]/15 text-[#0B4F3C] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🧘 stress reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setSleepBedtime(data?.sleep?.bedtime || "11:30 PM");
                  setSleepWakeTime(data?.sleep?.wakeTime || "07:30 AM");
                  setSleepDurationMins(data?.sleep?.duration || 480);
                  setSleepQuality(data?.sleep?.score || 75);
                  setShowSleepModal(true);
                }}
                className="p-3 bg-[#F3F0FA] rounded-xl hover:scale-[1.02] border border-[#5F4EA5]/15 text-[#5F4EA5] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🌙 sleep reset
              </button>
              <button
                type="button"
                onClick={() => setShowFocusModal(true)}
                className="p-3 bg-[#FFF3EC] rounded-xl hover:scale-[1.02] border border-amber-500/15 text-amber-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                ⏱ focus log
              </button>
              <button
                type="button"
                onClick={() => {
                  setJournalTitle("");
                  setJournalContent("");
                  setEditingJournalId(null);
                  setShowJournalModal(true);
                }}
                className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl hover:scale-[1.02] border border-purple-250/20 text-purple-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📖 journal
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 2. WORK WELLNESS & ANALYTICS SECTION */}
      <section className="space-y-6 pt-8 border-t border-slate-200/50 dark:border-slate-800 text-left" id="work-wellness">
        
        <div>
          <h3 className="font-heading font-black text-lg uppercase tracking-widest text-[#0B4F3C] dark:text-[#62B596]">Work Wellness & Analytics</h3>
          <p className="text-[13px] text-[#718079] font-bold mt-1">Understand your workload, recovery and work-life balance over time.</p>
        </div>

        {/* 3-COLUMN CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Work-Life Balance Scales */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4 flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">WORK-LIFE BALANCE</h4>
              <button
                type="button"
                onClick={() => {
                  setWorkVal(data?.workLife?.work || 70);
                  setPersonalVal(data?.workLife?.personal || 80);
                  setRecoveryVal(data?.workLife?.recovery || 60);
                  setShowWorkLifeModal(true);
                }}
                className="text-[9px] font-black text-[#0B4F3C] hover:underline uppercase tracking-wider"
              >
                Edit
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: "Work", val: data?.workLife?.work || 70, color: "bg-[#0B4F3C]" },
                { label: "Personal", val: data?.workLife?.personal || 80, color: "bg-[#62B596]" },
                { label: "Recovery", val: data?.workLife?.recovery || 60, color: "bg-[#5FAF8A]" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-[10px] font-bold text-[#718079]">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-black text-[#718079] uppercase tracking-wider">Balance Score</span>
              <span className="text-xs font-black text-[#0B4F3C]">{data?.workLife?.balanceScore || 72} / 100</span>
            </div>
          </div>

          {/* Stress Tracker Graph */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4 min-h-[220px]">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">STRESS TRACKER</h4>
              <span className="text-[9px] font-bold text-[#718079] uppercase tracking-wider">This week</span>
            </div>

            {/* Stress Tracker dynamic bars */}
            <div className="h-28 w-full flex items-end justify-between px-2">
              {getStressChartData().map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="w-2 rounded-full bg-slate-100 dark:bg-slate-800 h-20 flex items-end">
                    <div
                      className="w-full rounded-full bg-[#EA5E5E]"
                      style={{ height: `${item.val}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Sessions Analytics */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div>
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">FOCUS SESSIONS</h4>
            </div>

            <div className="flex items-center gap-4 py-1">
              <div className="w-10 h-10 rounded-xl bg-[#EAF7F1] flex items-center justify-center shrink-0 text-[#0B4F3C]">
                <span className="material-symbols-outlined text-lg leading-none">timer</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#0B4F3C] leading-none">
                  {formatFocusTime(data?.focus?.weeklyMinutes || 0)}
                </p>
                <p className="text-[10px] font-bold text-[#718079] mt-0.5 leading-none">Weekly focused time</p>
                <p className="text-[8px] font-bold text-slate-400 leading-none mt-1">Sessions today: {data?.focus?.todaySessionsCount || 0}</p>
              </div>
            </div>

            {/* Weekly Analytics Bar Chart */}
            <div className="grid grid-cols-7 gap-1 h-14 items-end px-1 border-t border-slate-50 dark:border-slate-800 pt-2">
              {getFocusAnalyticsData().map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 group relative flex-1">
                  <div className="w-1.5 bg-slate-100 dark:bg-slate-800 rounded-full h-8 flex items-end">
                    <div
                      className="w-full rounded-full bg-[#0B4F3C] group-hover:bg-[#62B596] transition-all"
                      style={{ height: `${item.pct}%` }}
                    />
                  </div>
                  <span className="text-[7px] font-black text-slate-400 uppercase">{item.day}</span>
                  <span className="absolute bottom-6 bg-slate-800 text-white text-[7px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {item.minutes}m
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFocusModal(true)}
              className="w-full py-2 rounded-xl bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest transition-all mt-2 cursor-pointer"
            >
              Start Focus Session
            </button>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Sleep and Recovery */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div>
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">SLEEP & RECOVERY</h4>
            </div>

            <div className="space-y-3 py-1">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-[#0B4F3C] shrink-0 leading-none">bedtime</span>
                <div className="truncate flex-1">
                  <p className="text-[12px] font-black text-[#18322A] dark:text-slate-100 leading-tight">
                    {data?.sleep ? `${Math.floor(data.sleep.duration / 60)}h ${data.sleep.duration % 60}m` : "No sleep recorded"}
                  </p>
                  <p className="text-[9px] font-bold text-[#718079] leading-none mt-0.5">Sleep duration</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-[#0B4F3C] shrink-0 leading-none">battery_charging_80</span>
                <div className="truncate flex-1">
                  <p className="text-[12px] font-black text-[#18322A] dark:text-slate-100 leading-tight">
                    {data?.sleep ? `${data.sleep.score}%` : "0%"}
                  </p>
                  <p className="text-[9px] font-bold text-[#718079] leading-none mt-0.5">Recovery score</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSleepBedtime(data?.sleep?.bedtime || "11:30 PM");
                  setSleepWakeTime(data?.sleep?.wakeTime || "07:30 AM");
                  setSleepDurationMins(data?.sleep?.duration || 480);
                  setSleepQuality(data?.sleep?.score || 75);
                  setShowSleepModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Log Sleep
              </button>
              <button
                type="button"
                onClick={() => router.push("/sleep")}
                className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] font-black text-[#0B4F3C] dark:text-[#62B596] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                View Sleep Support
              </button>
            </div>
          </div>

          {/* Mood Overview Chart */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4 min-h-[220px]">
            <div>
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">MOOD OVERVIEW</h4>
            </div>

            {/* Interactive Mood SVG chart */}
            <div className="h-24 w-full pt-1 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 140 40">
                <defs>
                  <linearGradient id="wpMoodLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#62B596" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#62B596" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                
                {/* SVG Curve calculations dynamically built */}
                {(() => {
                  const points = moodOrderData.map((pt, idx) => {
                    const x = 10 + idx * 20;
                    const y = 35 - (pt.val / 100) * 25;
                    return { x, y, pt };
                  });

                  let path = points.length > 0 ? `M ${points[0].x} ${points[0].y}` : "";
                  for (let i = 0; i < points.length - 1; i++) {
                    const cpX1 = points[i].x + (points[i+1].x - points[i].x) / 2;
                    const cpY1 = points[i].y;
                    const cpX2 = points[i].x + (points[i+1].x - points[i].x) / 2;
                    const cpY2 = points[i+1].y;
                    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i+1].x} ${points[i+1].y}`;
                  }

                  const fillPath = points.length > 0 ? `${path} L ${points[points.length - 1].x} 40 L ${points[0].x} 40 Z` : "";

                  return (
                    <>
                      <path d={fillPath} fill="url(#wpMoodLineGrad)" />
                      <path d={path} fill="none" stroke="#62B596" strokeWidth="1.5" strokeLinecap="round" />
                      {points.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={selectedMoodPoint?.day === pt.pt.day ? "3.5" : "2"}
                          fill={selectedMoodPoint?.day === pt.pt.day ? "#0B4F3C" : "#62B596"}
                          className="cursor-pointer hover:r-4 transition-all"
                          onClick={() => setSelectedMoodPoint(pt.pt)}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between px-1 text-[8px] font-black text-slate-400 uppercase tracking-wider mt-1 select-none">
                {moodOrderData.map(d => <span key={d.day}>{d.day}</span>)}
              </div>
            </div>

            {selectedMoodPoint && (
              <div className="p-3 bg-[#EAF7F1] border border-[#62B596]/20 rounded-xl mt-3 text-[10px] font-bold text-[#0B4F3C] space-y-1 relative">
                <button type="button" className="absolute top-1 right-2 text-xs font-black text-slate-400" onClick={() => setSelectedMoodPoint(null)}>×</button>
                <p className="font-heading font-black uppercase text-[8px] tracking-widest text-[#0B4F3C]">{selectedMoodPoint.day}</p>
                {selectedMoodPoint.checkin ? (
                  <>
                    <p>Mood: {selectedMoodPoint.checkin.mood}</p>
                    <p>Stress: {selectedMoodPoint.checkin.stress}</p>
                    <p>Energy: {getEnergyText(selectedMoodPoint.checkin.energy)}</p>
                  </>
                ) : (
                  <p>No check-in recorded for today.</p>
                )}
              </div>
            )}
          </div>

          {/* Workload Risk */}
          <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
            <div>
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">WORKLOAD CHECK</h4>
            </div>

            <div className="py-2 text-center">
              <span className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-full inline-block leading-none ${
                data?.burnoutRisk === "HIGH" ? "bg-red-50 text-red-600 border border-red-200" :
                data?.burnoutRisk === "MEDIUM" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                "bg-[#EAF7F1] text-[#0B4F3C] border border-[#62B596]/20"
              }`}>
                {data?.burnoutRisk === "HIGH" ? "HIGH RISK" : data?.burnoutRisk === "MEDIUM" ? "MODERATE" : "LOW RISK"}
              </span>
              <p className="text-[11px] text-[#718079] mt-3 font-bold leading-normal">
                {data?.burnoutRisk === "HIGH" ? "High stress detected. Please consider scaling back tasks and scheduling a wellness consult." :
                 data?.burnoutRisk === "MEDIUM" ? "Moderate workload stress. Take regular breathing breaks and monitor sleep." :
                 "Your current workload appears manageable."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/reports")}
              className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[9px] font-black text-[#0B4F3C] dark:text-[#62B596] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              View Insights
            </button>
          </div>

        </div>

      </section>

      {/* 3. BOTTOM SECTION: GOALS + DECOMPRESSION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-left">
        
        {/* Goals checklist */}
        <div className="lg:col-span-2 p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">MY WELLNESS GOALS</h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Custom goals checklist</p>
            </div>
            <button type="button" onClick={() => router.push("/journey")} className="text-[10px] font-black text-[#0B4F3C] hover:underline uppercase tracking-wider">View all →</button>
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2">
            <input
              type="text"
              required
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="Add goal target..."
              className="flex-1 px-4 py-2 text-[11px] font-bold rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#0B4F3C]"
            />
            <button
              type="submit"
              disabled={isAddingGoal}
              className="px-4 py-2 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              + Add Goal
            </button>
          </form>

          <div className="space-y-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
            {data?.goals?.map((g: any) => (
              <div
                key={g.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 transition-all"
              >
                <div
                  onClick={() => handleToggleGoal(g.id, g.completed)}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <span className={`material-symbols-outlined text-sm shrink-0 leading-none ${
                    g.completed ? "text-[#62B596]" : "text-slate-300"
                  }`}>
                    {g.completed ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <div className="truncate">
                    <span className={`text-[11px] font-bold block leading-tight ${
                      g.completed ? "line-through text-slate-400" : "text-[#18322A] dark:text-slate-200"
                    }`}>
                      {g.title}
                    </span>
                    {g.description && (
                      <span className="text-[9px] text-slate-400 font-medium block mt-0.5 truncate">{g.description}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoalId(g.id);
                      setEditingGoalTitle(g.title);
                    }}
                    className="text-[9px] font-black text-slate-450 hover:text-[#0B4F3C] uppercase tracking-wider cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(g.id)}
                    className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(!data?.goals || data.goals.length === 0) && (
              <div className="py-4 text-center">
                <p className="text-[11px] text-[#718079] font-bold">You haven't created any goals yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Leave Work at Work */}
        <div className="p-6 rounded-[20px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(11,79,60,0.015)] hover:translate-y-[-2px] hover:shadow-[0_4px_16px_rgba(11,79,60,0.035)] transition-all duration-300 flex flex-col justify-between min-h-[220px]">
          <div>
            <h4 className="font-heading font-black text-[11px] text-[#718079] uppercase tracking-widest">LEAVE WORK AT WORK</h4>
            <p className="text-[12px] font-black text-[#18322A] dark:text-slate-100 mt-2">guided decompression ritual</p>
          </div>

          <p className="text-[12px] font-bold text-[#718079] leading-relaxed">
            A short decompression ritual to transition from work mode to personal time.
          </p>

          <div className="text-2xl text-center py-1">🌿</div>

          <button
            type="button"
            onClick={() => {
              setDecompressionTimeLeft(120);
              setShowDecompressionModal(true);
            }}
            className="w-full py-2.5 rounded-xl bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Start Decompression
          </button>
        </div>

      </div>

      {/* AI RECOMMENDATION BOTTOM BANNER */}
      <div className="p-6 rounded-[20px] bg-[#EAF7F1] dark:bg-[#17382B] border border-[#62B596]/15 shadow-[0_2px_12px_rgba(11,79,60,0.01)] text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0B4F3C] dark:text-emerald-450">✨ AI Recommendation for You</h4>
          <p className="text-[12px] font-bold text-[#718079] dark:text-slate-300 leading-relaxed pr-6">
            "{data?.recommendation || "You've had a demanding week. Try a short 2-minute reset session before starting your evening."}"
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDecompressionTimeLeft(120);
            setShowDecompressionModal(true);
          }}
          className="py-2.5 px-5 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shrink-0 cursor-pointer"
        >
          Start Recommendation
        </button>
      </div>

      {/* MODALS */}

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowProfileModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[420px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-4 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Sanctuary Profile Settings</h4>
              
              <div className="space-y-3 text-[11px] text-[#718079] font-bold bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                <p>Joined Date: <span className="text-slate-800 dark:text-slate-200">{data?.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Aug 2026"}</span></p>
                <p>Streak: <span className="text-slate-800 dark:text-slate-200">{data?.streak?.currentStreak || 1} Days</span></p>
                <p>Wellness Score: <span className="text-slate-800 dark:text-slate-200">{data?.wellnessScore?.score || 70}/100</span></p>
                <p>Category: <span className="text-slate-800 dark:text-slate-200">💼 Working Professional (Locked)</span></p>
              </div>

              <form onSubmit={handleSaveProfileSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Sanctuary Display Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B4F3C] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Avatar Image Path (URL or DataURL)</label>
                  <input
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="/images/user_avatar.jpg"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B4F3C] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-3 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Focus Timer Modal */}
      <AnimatePresence>
        {showFocusModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowFocusModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[400px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-8 space-y-6 shadow-2xl text-center"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Focus Session Timer</h4>

              <div className="py-6">
                <p className="text-4xl font-black text-slate-800 dark:text-slate-100 leading-none">
                  {Math.floor(focusDuration / 60)}:{String(focusDuration % 60).padStart(2, "0")}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">focused deep work block</p>
              </div>

              {!isFocusRunning && (
                <div className="flex justify-center gap-2">
                  {[10, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setFocusDuration(mins * 60);
                        setInitialFocusDuration(mins * 60);
                      }}
                      className={`px-3 py-1.5 border text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        focusDuration === mins * 60
                          ? "bg-[#0B4F3C] text-white border-[#0B4F3C]"
                          : "border-slate-250 text-slate-650 hover:bg-slate-50 text-slate-500"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFocusRunning(!isFocusRunning)}
                  className={`flex-1 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    isFocusRunning ? "bg-[#EA5E5E] hover:bg-[#D54D4D]" : "bg-[#0B4F3C] hover:bg-[#073C2C]"
                  }`}
                >
                  {isFocusRunning ? "Pause" : "Start Focus"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsFocusRunning(false);
                    setFocusDuration(25 * 60);
                  }}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Decompression Timer Modal */}
      <AnimatePresence>
        {showDecompressionModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowDecompressionModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[400px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-8 space-y-6 shadow-2xl text-center"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Leave Work at Work</h4>
              <p className="text-[10px] font-bold text-slate-450 leading-normal px-4">Take a short transition reset to leave your work tasks at your desk and start your personal time.</p>

              {/* Animated guided breathing circle */}
              {(() => {
                const instr = getDecompressionInstruction(decompressionTimeLeft);
                return (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <p className="text-4xl font-black text-[#62B596] leading-none">
                      {Math.floor(decompressionTimeLeft / 60)}:{String(decompressionTimeLeft % 60).padStart(2, "0")}
                    </p>
                    
                    <motion.div
                      animate={{ scale: isDecompressionRunning ? instr.scale : 1 }}
                      transition={{ duration: instr.duration, ease: "easeInOut" }}
                      className="w-28 h-28 rounded-full bg-emerald-500/10 border border-[#62B596]/30 flex items-center justify-center shadow-inner"
                    >
                      <span className={`text-xs font-black uppercase ${instr.color}`}>{instr.text}</span>
                    </motion.div>
                  </div>
                );
              })()}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDecompressionRunning(!isDecompressionRunning)}
                  className={`flex-1 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    isDecompressionRunning ? "bg-[#EA5E5E] hover:bg-[#D54D4D]" : "bg-[#0B4F3C] hover:bg-[#073C2C]"
                  }`}
                >
                  {isDecompressionRunning ? "Pause" : "Start Reset"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDecompressionRunning(false);
                    setDecompressionTimeLeft(120);
                  }}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily Check-In Modal Form */}
      <AnimatePresence>
        {showCheckinModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowCheckinModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-8 space-y-6 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Daily Wellbeing Check-In</h4>

              <form onSubmit={handleSaveCheckinSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                
                {/* Mood Select */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">How are you feeling today?</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { val: "Joyful", label: "Joyful", emoji: "😊" },
                      { val: "Good", label: "Good", emoji: "🙂" },
                      { val: "Okay", label: "Okay", emoji: "😐" },
                      { val: "Stressed", label: "Stressed", emoji: "😰" },
                      { val: "Drained", label: "Drained", emoji: "😫" },
                    ].map((m) => (
                      <button
                        key={m.val}
                        type="button"
                        disabled={!!data?.todayCheckin}
                        onClick={() => setCheckinMood(m.val)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          checkinMood === m.val
                            ? "border-[#0B4F3C] bg-[#0B4F3C]/5 text-[#0B4F3C]"
                            : "border-slate-150 hover:bg-slate-50"
                        } disabled:cursor-not-allowed`}
                      >
                        <span className="text-base block leading-none">{m.emoji}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider block mt-1 leading-none">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stress select */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Stress Level</label>
                  <select
                    value={checkinStress}
                    disabled={!!data?.todayCheckin}
                    onChange={(e) => setCheckinStress(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-5-0 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B4F3C] text-slate-800 dark:text-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="Low">Low Stress</option>
                    <option value="Manageable">Manageable</option>
                    <option value="Moderate">Moderate Stress</option>
                    <option value="Stressed">Stressed</option>
                    <option value="Overwhelmed">Overwhelmed</option>
                  </select>
                </div>

                {/* Slider values */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Energy Level ({checkinEnergy}/5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      disabled={!!data?.todayCheckin}
                      value={checkinEnergy}
                      onChange={(e) => setCheckinEnergy(Number(e.target.value))}
                      className="w-full accent-[#0B4F3C] disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Sleep Quality ({checkinSleep}/5)</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      disabled={!!data?.todayCheckin}
                      value={checkinSleep}
                      onChange={(e) => setCheckinSleep(Number(e.target.value))}
                      className="w-full accent-[#0B4F3C] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Work life balance */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Work-Life Balance Index ({checkinBalance}/5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    disabled={!!data?.todayCheckin}
                    value={checkinBalance}
                    onChange={(e) => setCheckinBalance(Number(e.target.value))}
                    className="w-full accent-[#0B4F3C] disabled:cursor-not-allowed"
                  />
                </div>

                {/* Reflection Note */}
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Reflection note</label>
                  <textarea
                    value={checkinNote}
                    disabled={!!data?.todayCheckin}
                    onChange={(e) => setCheckinNote(e.target.value)}
                    placeholder="Reflect on your day..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B4F3C] text-slate-800 dark:text-slate-100 min-h-[70px] disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {!data?.todayCheckin ? (
                    <button
                      type="submit"
                      disabled={isSubmittingCheckin}
                      className="flex-1 py-3 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      {isSubmittingCheckin ? "Submitting..." : "Submit Check-in"}
                    </button>
                  ) : (
                    <div className="flex-1 text-center py-2.5 px-4 bg-[#EAF7F1] text-[#0B4F3C] text-[10px] font-black uppercase tracking-wider rounded-xl">
                      ✓ Logged for Today
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCheckinModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Goal Edit Modal */}
      <AnimatePresence>
        {editingGoalId && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setEditingGoalId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[360px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-4 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Edit Wellness Goal</h4>
              <form onSubmit={handleEditGoalSave} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={editingGoalTitle}
                    onChange={(e) => setEditingGoalTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#0B4F3C] text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingEditGoal}
                    className="flex-1 py-2.5 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGoalId(null)}
                    className="px-4 py-2.5 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sleep Modal */}
      <AnimatePresence>
        {showSleepModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowSleepModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[400px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-4 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Log Sleep & Recovery</h4>
              
              <form onSubmit={handleSaveSleepSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Bedtime</label>
                    <input
                      type="text"
                      required
                      value={sleepBedtime}
                      onChange={(e) => setSleepBedtime(e.target.value)}
                      placeholder="11:30 PM"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Wake Time</label>
                    <input
                      type="text"
                      required
                      value={sleepWakeTime}
                      onChange={(e) => setSleepWakeTime(e.target.value)}
                      placeholder="07:30 AM"
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Sleep Duration (Minutes - e.g. 480 = 8 hrs)</label>
                  <input
                    type="number"
                    required
                    value={sleepDurationMins}
                    onChange={(e) => setSleepDurationMins(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Sleep Quality / Recovery ({sleepQuality}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={sleepQuality}
                    onChange={(e) => setSleepQuality(Number(e.target.value))}
                    className="w-full accent-[#0B4F3C]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingSleep}
                    className="flex-1 py-3 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Sleep Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSleepModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Work-Life Balance Modal */}
      <AnimatePresence>
        {showWorkLifeModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowWorkLifeModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[400px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-4 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Update Work-Life Balance</h4>
              
              <form onSubmit={handleSaveWorkLifeSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Work Sat / Effort ({workVal}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={workVal}
                    onChange={(e) => setWorkVal(Number(e.target.value))}
                    className="w-full accent-[#0B4F3C]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Personal / Family ({personalVal}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={personalVal}
                    onChange={(e) => setPersonalVal(Number(e.target.value))}
                    className="w-full accent-[#0B4F3C]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Recovery / Self-care ({recoveryVal}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={recoveryVal}
                    onChange={(e) => setRecoveryVal(Number(e.target.value))}
                    className="w-full accent-[#0B4F3C]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingWorkLife}
                    className="flex-1 py-3 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Balance Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWorkLifeModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Appointment Reschedule Modal */}
      <AnimatePresence>
        {showApptModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowApptModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[360px] h-fit bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-4 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Reschedule Appointment</h4>
              
              <form onSubmit={handleRescheduleApptSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    required
                    value={apptNewDate}
                    onChange={(e) => setApptNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Time (e.g. 09:00 PM)</label>
                  <input
                    type="text"
                    required
                    value={apptNewTime}
                    onChange={(e) => setApptNewTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingAppt}
                    className="flex-1 py-3 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Confirm Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApptModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Journal CRUD Modal */}
      <AnimatePresence>
        {showJournalModal && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowJournalModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="fixed inset-0 m-auto z-50 w-full max-w-[620px] max-h-[85vh] overflow-y-auto bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-6 shadow-2xl text-left"
            >
              <h4 className="font-heading font-black text-xs text-[#0B4F3C] uppercase tracking-widest">Sanctuary Journal Entry</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Journal Write Form */}
                <form onSubmit={handleSaveJournalSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Title</label>
                    <input
                      type="text"
                      required
                      value={journalTitle}
                      onChange={(e) => setJournalTitle(e.target.value)}
                      placeholder="My morning thoughts..."
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Category</label>
                      <select
                        value={journalCategory}
                        onChange={(e) => setJournalCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                      >
                        <option value="Personal">Personal</option>
                        <option value="Work">Work</option>
                        <option value="Reflection">Reflection</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Mood Tag</label>
                      <select
                        value={journalMoodTag}
                        onChange={(e) => setJournalMoodTag(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs"
                      >
                        <option value="Reflective">Reflective</option>
                        <option value="Calm">Calm</option>
                        <option value="Stressed">Stressed</option>
                        <option value="Inspired">Inspired</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Journal Content</label>
                    <textarea
                      required
                      value={journalContent}
                      onChange={(e) => setJournalContent(e.target.value)}
                      placeholder="Write your reflections here..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSavingJournal}
                      className="flex-1 py-2.5 bg-[#0B4F3C] hover:bg-[#073C2C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      {editingJournalId ? "Update Entry" : "Save Entry"}
                    </button>
                    {editingJournalId && (
                      <button
                        type="button"
                        onClick={() => {
                          setJournalTitle("");
                          setJournalContent("");
                          setEditingJournalId(null);
                        }}
                        className="px-3 py-2.5 border border-slate-200 text-[#718079] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>

                {/* Journal List Column */}
                <div className="space-y-3">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Previous Reflections</label>
                  <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
                    {data?.recentReflections?.map((ref: any) => (
                      <div key={ref.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-1 text-left relative group">
                        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingJournalId(ref.id);
                              setJournalTitle(ref.title);
                              setJournalContent(ref.content);
                              setJournalMoodTag(ref.mood_tag || "Reflective");
                              setJournalCategory(ref.category || "Personal");
                            }}
                            className="text-[8px] font-black uppercase text-[#0B4F3C] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteJournal(ref.id)}
                            className="text-[8px] font-black uppercase text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                        <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200">{ref.title}</h5>
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">{ref.content}</p>
                        <div className="flex gap-2 text-[8px] font-bold text-slate-450 pt-1 leading-none uppercase">
                          <span>🌿 {ref.category}</span>
                          <span>• {ref.mood_tag}</span>
                          <span>• {new Date(ref.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    ))}
                    {(!data?.recentReflections || data.recentReflections.length === 0) && (
                      <p className="text-[10px] text-slate-400 font-bold py-4 text-center">No journal logs recorded yet.</p>
                    )}
                  </div>
                </div>

              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-right">
                <button
                  type="button"
                  onClick={() => setShowJournalModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-[#718079] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Close Journal
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
