"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";
import { useStudentDashboard } from "@/frontend/components/screens/StudentDashboard";

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

  const {
    assessmentStatus,
    assessmentStatusLoading,
    assessmentStatusError,
    fetchAssessmentStatus,
    setOnboardingStep,
    setOnboardingAnswers,
    setIsAssessmentPopupOpen,
  } = useStudentDashboard();

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
  const [togglingGoalId, setTogglingGoalId] = useState<number | null>(null);
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
    if (togglingGoalId === goalId) return;
    setTogglingGoalId(goalId);

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
    } catch (err: any) {
      triggerToast(err.message || "Failed to toggle goal");
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
      return { text: "Inhale", duration: 4, scale: 1.4, color: "text-[#5F4EA5]" };
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
          stroke="#F5F3FC"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke="#7C6BC4"
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
              ? "bg-[#5F4EA5] text-white shadow-sm font-bold scale-105"
              : isToday
              ? "bg-[#F5F3FC] text-[#5F4EA5] font-bold"
              : "text-[#8E8A9F] hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75">{dayName}</span>
          <span className="text-xs font-black mt-1 leading-none">{dayNum}</span>
          {hasEvent && !isSelected && (
            <span className="w-1 h-1 rounded-full bg-[#7C6BC4] absolute bottom-1" />
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
            color: "bg-[#F5F3FC]/60 border-[#F5F3FC]/30 text-[#5F4EA5]",
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
                <p className="text-[9px] text-[#8E8A9F] font-bold mt-0.5 truncate">{item.desc}</p>
                <p className="text-[9px] font-black uppercase text-[#5F4EA5] mt-1 leading-none">{item.time}</p>
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
      <div className="w-full space-y-[32px] animate-pulse py-4 bg-[#F5FAFB] dark:bg-slate-900 min-h-screen p-[28px] lg:p-[36px]">
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

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[#F5FAFB] dark:bg-[#0D1F2D]">
        <div className="w-full max-w-[400px] bg-white dark:bg-[#132E3F] rounded-[28px] p-8 border border-slate-200/60 text-center space-y-4 shadow-sm">
          <span className="material-symbols-outlined text-4xl text-[#EA5E5E]">warning</span>
          <h4 className="font-heading font-black text-xs text-[#100E26] dark:text-slate-100 uppercase tracking-wider">Dashboard Sync Failed</h4>
          <p className="text-[11px] font-bold text-slate-400 leading-normal">{error}</p>
          <button
            onClick={loadDashboardData}
            className="w-full py-3 rounded-xl bg-[#5F4EA5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#4A3C8C] transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const moodOrderData = getMoodOverviewData();

  return (
    <div className="w-full space-y-[32px] bg-[#F5FAFB] dark:bg-[#0D1F2D] text-[#100E26] dark:text-[#E2E8F0] min-h-screen relative">
      
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-0 right-0 mx-auto z-50 w-fit max-w-[320px] px-4 py-2.5 bg-[#5F4EA5] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border border-emerald-500/10 text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

            {/* 3-COLUMN MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fade-in-up">
        
        {/* COLUMN 1: Daily Check-in & Illustrations */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Daily Check-in Complete */}
          <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:translate-y-[-2px] transition-all duration-300 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-4xl select-none border-2 border-amber-100 dark:border-amber-900/50">
                {data?.todayCheckin ? (
                  (() => {
                    const mood = (data.todayCheckin.mood || "").toLowerCase();
                    if (mood === "joyful" || mood === "amazing") return "😁";
                    if (mood === "good" || mood === "calm") return "😊";
                    if (mood === "stressed" || mood === "anxious") return "😰";
                    if (mood === "tired" || mood === "drained") return "🥱";
                    if (mood === "sad" || mood === "down") return "😔";
                    return "😐";
                  })()
                ) : "😊"}
              </div>
              {data?.todayCheckin && (
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#132E3F] flex items-center justify-center text-white text-xs font-black">
                  ✓
                </div>
              )}
            </div>
            
            {data?.todayCheckin ? (
              <div className="space-y-1">
                <h4 className="font-heading font-black text-sm text-[#100E26] dark:text-slate-100">Daily Check-in Complete!</h4>
                <p className="text-[11px] text-slate-455 font-bold leading-relaxed">
                  You logged feeling <span className="text-[#5F4EA5] font-extrabold">{data.todayCheckin.mood}</span> today. Keep up the great work!
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h4 className="font-heading font-black text-sm text-[#100E26] dark:text-slate-100">Daily Check-in</h4>
                <p className="text-[11px] text-slate-455 font-bold leading-relaxed">
                  Take a moment to check in with yourself.
                </p>
              </div>
            )}

            {data?.todayCheckin ? (
              <button
                onClick={() => {
                  setCheckinMood(data.todayCheckin.mood);
                  setCheckinStress(data.todayCheckin.stress);
                  setCheckinEnergy(data.todayCheckin.energy);
                  setCheckinSleep(data.todayCheckin.sleepQuality || 3);
                  setCheckinBalance(data.todayCheckin.workLifeBalance || 3);
                  setCheckinNote(data.todayCheckin.note || "");
                  setShowCheckinModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#F5F3FC] dark:bg-purple-950/20 text-[#5F4EA5] dark:text-purple-300 text-[10px] font-black uppercase tracking-widest hover:bg-[#5F4EA5]/10 transition-all cursor-pointer text-center"
              >
                View Check-in
              </button>
            ) : (
              <button
                onClick={() => {
                  setCheckinMood("Good");
                  setCheckinStress("Manageable");
                  setCheckinEnergy(4);
                  setCheckinSleep(4);
                  setCheckinBalance(3);
                  setCheckinNote("");
                  setShowCheckinModal(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#5F4EA5] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#4A3C8C] transition-all cursor-pointer text-center shadow-sm"
              >
                Check-in Now
              </button>
            )}
          </div>

          {/* Desk Illustration Card */}
          <div className="rounded-[28px] overflow-hidden border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-transform duration-300">
            <img src="/images/wp_desk_illustration.jpg" alt="Workspace desk illustration" className="w-full h-auto object-cover" />
          </div>

          {/* 100% Confidential */}
          <div className="p-5 rounded-[28px] bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800 flex items-start gap-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-[#5F4EA5] shrink-0">
              <span className="material-symbols-outlined text-lg leading-none">lock</span>
            </div>
            <div className="space-y-0.5">
              <h5 className="text-[11px] font-black text-[#100E26] dark:text-slate-100 uppercase tracking-wider">100% Confidential</h5>
              <p className="text-[10px] text-slate-450 font-bold leading-normal">
                Your privacy is our top priority. Your data is safe and secure.
              </p>
            </div>
          </div>

          {/* Today's Motivation */}
          <div className="p-6 rounded-[28px] bg-[#F5F3FC] dark:bg-[#1C1635]/40 border border-[#5F4EA5]/15 text-left space-y-3 relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="absolute right-[-10px] bottom-[-10px] w-24 h-24 rounded-full bg-amber-200/10 filter blur-xl" />
            <p className="text-[9px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest leading-none">Today's Motivation</p>
            <blockquote className="text-[12px] font-extrabold text-[#100E26] dark:text-slate-200 leading-relaxed z-10 relative">
              "Discipline is choosing between what you want now and what you want most."
            </blockquote>
          </div>

        </div>

        {/* COLUMN 2: Hero & Performance widgets */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Welcome Back Hero */}
          <div className="text-left space-y-2 py-2">
            <p className="text-[10px] font-black text-[#5F4EA5] uppercase tracking-widest leading-none">Welcome Back</p>
            <h1 className="font-heading font-black text-3xl text-[#100E26] dark:text-slate-100 tracking-tight leading-none">
              Hi, <span className="text-[#5F4EA5]">{data?.user?.name || "Working_Pro"}</span>! 👋
            </h1>
            <p className="text-xs text-slate-500 font-bold leading-normal">
              Let's make today a productive and balanced day.
            </p>
            <div className="flex flex-wrap gap-2 pt-1.5">
              <span className="px-3 py-1 bg-purple-50 dark:bg-purple-955/30 text-[#5F4EA5] dark:text-purple-300 text-[9px] font-black uppercase tracking-wider rounded-full border border-purple-100/40 dark:border-purple-900/30">
                💼 Working Professional
              </span>
              <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-[9px] font-black uppercase tracking-wider rounded-full border border-amber-100/40 dark:border-amber-900/20">
                {data?.streak?.currentStreak || 5} Day Streak 🔥
              </span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-100/40 dark:border-emerald-900/20">
                🟢 Focus Mode: On
              </span>
            </div>
          </div>

          {/* Working Professional Wellness Assessment Status Card */}
          {!assessmentStatusLoading && assessmentStatus && (
            <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F3FC] dark:bg-slate-800 flex items-center justify-center shrink-0 text-xl select-none">
                  🧠
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-[#5F4EA5] dark:text-purple-300 uppercase tracking-widest leading-none">
                    WORKING PROFESSIONAL WELLNESS ASSESSMENT
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
                        Help us understand your work, stress, and wellness needs so we can personalize your Manraah experience.
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
          )}

          {/* Work Performance Overview */}
          <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-between gap-4 text-left">
            <div className="space-y-1 flex-1">
              <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">WORK PERFORMANCE OVERVIEW</h4>
              <div className="flex items-center gap-1.5 pt-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                <span>📈 Great Progress!</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-normal">
                You're completing more tasks and staying consistent.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/working-professional/analytics")}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-[#100E26] dark:text-slate-200 text-[10px] font-black uppercase tracking-widest rounded-full transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700"
            >
              View Insights
            </button>
          </div>

          {/* Today's Priorities */}
          <div className="p-5 lg:p-6 rounded-[28px] bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 text-left">
            <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">TODAY'S PRIORITIES</h4>
            
            {(!data?.goals || data.goals.length === 0) ? (
              <p className="text-xs text-slate-450 font-bold py-4 text-center">No priorities logged for today.</p>
            ) : (
              <div className="space-y-2.5">
                {data.goals.slice(0, 3).map((task: any) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      task.completed
                        ? "bg-slate-50/50 dark:bg-slate-850/20 border-slate-100 dark:border-slate-800 opacity-60"
                        : "bg-slate-50/50 dark:bg-slate-850/40 border-slate-200/30 dark:border-slate-850 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        disabled={togglingGoalId === task.id}
                        onChange={() => handleToggleGoal(task.id, task.completed)}
                        className="w-4 h-4 rounded border-slate-350 text-[#5F4EA5] focus:ring-[#5F4EA5] cursor-pointer shrink-0"
                      />
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                          (task.priority || 'Medium').toLowerCase() === "high" ? "bg-red-50 dark:bg-red-950/30 text-red-600" :
                          (task.priority || 'Medium').toLowerCase() === "low" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" :
                          "bg-amber-50 dark:bg-amber-950/30 text-amber-600"
                        }`}>
                          {task.priority || 'Medium'}
                        </span>
                        <p className={`text-xs font-black truncate leading-tight ${task.completed ? "line-through text-slate-400" : "text-[#100E26] dark:text-slate-100"}`}>
                          {task.title}
                        </p>
                      </div>
                    </div>
                    {task.due_date && (
                      <span className="text-[10px] text-slate-400 font-bold shrink-0 ml-2">
                        Due: {task.due_date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard/working-professional/task-manager")}
              className="w-full py-3.5 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white font-heading font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer text-center"
            >
              Manage Tasks
            </button>
          </div>

          {/* Upcoming Appointment */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">UPCOMING APPOINTMENT</h4>
              <button onClick={() => router.push("/dashboard/working-professional/exams")} className="text-[9px] font-black text-[#5F4EA5] hover:underline uppercase tracking-wider">
                Manage &rarr;
              </button>
            </div>

            {data?.upcomingAppointment ? (
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-200/30 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Date block */}
                  <div className="w-14 h-14 rounded-2xl bg-[#5F4EA5]/10 flex flex-col items-center justify-center border border-[#5F4EA5]/20 shrink-0 text-[#5F4EA5]">
                    <span className="text-[8px] font-black uppercase tracking-wider leading-none">
                      {new Date(data.upcomingAppointment.appointment_date).toLocaleString("en-US", { month: "short" }).toUpperCase()}
                    </span>
                    <span className="text-xl font-heading font-black leading-none mt-1">
                      {new Date(data.upcomingAppointment.appointment_date).getDate()}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest leading-none mt-0.5">
                      {new Date(data.upcomingAppointment.appointment_date).toLocaleString("en-US", { weekday: "short" }).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-black text-[#100E26] dark:text-slate-100">{data.upcomingAppointment.doctor_name || "Project Planning Discussion"}</h5>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold">
                      <span>👥 {data.upcomingAppointment.doctor_title || "Team Sync"}</span>
                      <span>•</span>
                      <span>📅 Tomorrow, {new Date(data.upcomingAppointment.appointment_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-[#5F4EA5] font-black pt-0.5">
                      <span>🕘 {data.upcomingAppointment.appointment_time || "10:00 AM - 11:00 AM"}</span>
                      <span>💻 Google Meet</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {/* Avatars group */}
                  <div className="flex -space-x-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" className="w-6 h-6 rounded-full border border-white bg-slate-100 shrink-0" />
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" className="w-6 h-6 rounded-full border border-white bg-slate-100 shrink-0" />
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anna" className="w-6 h-6 rounded-full border border-white bg-slate-100 shrink-0" />
                    <div className="w-6 h-6 rounded-full border border-white bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[7px] font-black text-slate-650 shrink-0">
                      +2
                    </div>
                  </div>

                  <button
                    onClick={() => window.open(data.upcomingAppointment.video_call_url || "https://meet.google.com", "_blank")}
                    className="px-4 py-2 bg-[#F5F3FC] dark:bg-purple-950/20 text-[#5F4EA5] dark:text-purple-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#5F4EA5]/10 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Join Meeting
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2 border border-dashed border-slate-200/30 dark:border-slate-700 rounded-[24px]">
                <p className="text-xs text-slate-450 font-bold">No upcoming appointments</p>
                <button
                  onClick={() => router.push("/dashboard/working-professional/professional-care")}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5F4EA5]/15 hover:bg-[#5F4EA5]/25 text-[#5F4EA5] font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            )}
          </div>

          {/* Upcoming Meetings */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left">
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">UPCOMING MEETINGS</h4>
              <button onClick={() => router.push("/dashboard/working-professional/exams")} className="text-[9px] font-black text-[#5F4EA5] hover:underline uppercase tracking-wider">
                Manage &rarr;
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 border border-slate-200/30 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#5F4EA5]/10 flex items-center justify-center text-[#5F4EA5] shrink-0">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-[#100E26] dark:text-slate-100 leading-tight">Project Planning Discussion</h5>
                    <p className="text-[9px] text-slate-450 font-bold mt-0.5">Team Sync</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-[#100E26] dark:text-slate-200">Tomorrow</p>
                  <p className="text-[9px] text-[#5F4EA5] font-black mt-0.5">10:00 AM</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 border border-slate-200/30 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#5F4EA5]/10 flex items-center justify-center text-[#5F4EA5] shrink-0">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black text-[#100E26] dark:text-slate-100 leading-tight">Client Review Meeting</h5>
                    <p className="text-[9px] text-slate-450 font-bold mt-0.5">External Call</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-extrabold text-[#100E26] dark:text-slate-200">Fri, Aug 29</p>
                  <p className="text-[9px] text-[#5F4EA5] font-black mt-0.5">04:00 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 3: Focus, Score & reflection */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Focus Time */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left flex flex-col justify-between min-h-[190px]">
            <div>
              <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">FOCUS TIME</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Today's Progress</p>
            </div>
            
            <div className="py-1">
              <span className="text-3xl font-heading font-black text-[#100E26] dark:text-slate-100 tracking-tight">
                {data?.focus?.todayMinutes || 120}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1.5">MINS</span>
            </div>

            <button
              onClick={() => router.push("/dashboard/working-professional/focus")}
              className="w-full py-2.5 rounded-xl bg-[#F5F3FC] dark:bg-purple-950/20 text-[#5F4EA5] dark:text-purple-300 text-[10px] font-black uppercase tracking-widest hover:bg-[#5F4EA5]/10 transition-all cursor-pointer text-center"
            >
              Start Focus Session
            </button>
          </div>

          {/* Productivity Score */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left">
            <div>
              <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">PRODUCTIVITY SCORE</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">This Week</p>
            </div>

            <div className="flex items-center gap-4.5">
              <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                {renderCircularProgress(82, 28, 5)}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-black text-[#100E26] dark:text-slate-100">82%</span>
                </div>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Excellent</h5>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">
                  You're more productive than 82% of professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Weekly Reflection */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left">
            <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">WEEKLY REFLECTION</h4>

            <div className="space-y-2.5 pt-1">
              {[
                { label: "Daily Check-in done", done: true },
                { label: "Focus sessions completed (2/2)", done: true },
                { label: "Tasks completed (6/8)", done: false },
                { label: "Weekly review pending", done: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-[10px] font-extrabold text-slate-650 dark:text-slate-350">
                  <span className={`material-symbols-outlined text-[15px] shrink-0 leading-none ${item.done ? "text-emerald-500" : "text-slate-300"}`}>
                    {item.done ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span className={item.done ? "text-slate-450" : ""}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Overview Chart */}
          <div className="p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:translate-y-[-2px] transition-all duration-300 space-y-4 min-h-[220px] text-left">
            <div>
              <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">MOOD OVERVIEW</h4>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">This Week</p>
            </div>

            {/* Interactive Mood SVG chart */}
            <div className="h-24 w-full pt-1 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 140 40">
                <defs>
                  <linearGradient id="wpMoodLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0"/>
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
                      <path d={path} fill="none" stroke="#7C6BC4" strokeWidth="1.5" strokeLinecap="round" />
                      {points.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={selectedMoodPoint?.day === pt.pt.day ? "3.5" : "2"}
                          fill={selectedMoodPoint?.day === pt.pt.day ? "#5F4EA5" : "#7C6BC4"}
                          className="cursor-pointer hover:r-4 transition-all"
                          onClick={() => setSelectedMoodPoint(pt.pt)}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>
              <div className="flex justify-between px-1 text-[8px] font-black text-slate-450 uppercase tracking-wider mt-1 select-none">
                {moodOrderData.map(d => <span key={d.day}>{d.day}</span>)}
              </div>
            </div>

            {selectedMoodPoint && (
              <div className="p-3 bg-[#F5F3FC] border border-[#7C6BC4]/20 rounded-xl mt-3 text-[10px] font-bold text-[#5F4EA5] space-y-1 relative">
                <button type="button" className="absolute top-1 right-2 text-xs font-black text-slate-400" onClick={() => setSelectedMoodPoint(null)}>×</button>
                <p className="font-heading font-black uppercase text-[8px] tracking-widest text-[#5F4EA5]">{selectedMoodPoint.day}</p>
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

        </div>

      </div>

      {/* BOTTOM SECTION: AI Recommendation & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-200/50 dark:border-slate-800 animate-fade-in-up">
        
        {/* AI Recommendation Banner */}
        <div className="lg:col-span-2 p-6 rounded-[24px] bg-[#F5F3FC] dark:bg-[#132D4E]/30 border border-[#5F4EA5]/15 text-left flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 flex-1">
            <h4 className="font-heading font-black text-[10px] text-[#5F4EA5] uppercase tracking-widest">AI RECOMMENDATION FOR YOU</h4>
            <p className="text-[12px] text-slate-700 dark:text-slate-300 font-extrabold leading-relaxed max-w-md">
              You've been working on reports for long hours. Take a 10-min mindfulness break to recharge.
            </p>
            <button
              onClick={() => {
                setDecompressionTimeLeft(120);
                setShowDecompressionModal(true);
              }}
              className="px-4 py-2.5 bg-white dark:bg-purple-950/40 text-[#5F4EA5] dark:text-purple-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#F5F3FC] transition-all cursor-pointer shadow-xs whitespace-nowrap"
            >
              Start Now
            </button>
          </div>
          <div className="w-32 h-32 shrink-0 overflow-hidden relative">
            <img src="/images/wp_yoga_illustration.jpg" alt="Yoga meditation" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Quick Tools section */}
        <div className="lg:col-span-1 p-6 rounded-[24px] bg-white dark:bg-[#132E3F] border border-slate-200/40 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 text-left">
          <h4 className="font-heading font-black text-[10px] text-slate-450 uppercase tracking-widest">QUICK TOOLS</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { name: "Focus Timer", icon: "timer", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-600 dark:text-amber-400", path: "/dashboard/working-professional/focus" },
              { name: "Task Manager", icon: "check_box", bg: "bg-purple-50 dark:bg-purple-950/20", text: "text-[#5F4EA5] dark:text-purple-350", path: "/dashboard/working-professional/study-planner" },
              { name: "Calendar", icon: "calendar_today", bg: "bg-blue-50 dark:bg-blue-950/20", text: "text-blue-600 dark:text-blue-400", path: "/dashboard/working-professional/exams" },
              { name: "Notes", icon: "note_alt", bg: "bg-amber-50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400", action: "journal" },
              { name: "Pomodoro", icon: "hourglass_empty", bg: "bg-red-50 dark:bg-red-950/20", text: "text-red-650 dark:text-red-400", path: "/dashboard/working-professional/focus" },
              { name: "Breathing", icon: "self_improvement", bg: "bg-sky-50 dark:bg-sky-950/20", text: "text-sky-655 dark:text-sky-400", action: "breathing" },
            ].map((tool, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (tool.action === "journal") {
                    setJournalTitle("");
                    setJournalContent("");
                    setEditingJournalId(null);
                    setShowJournalModal(true);
                  } else if (tool.action === "breathing") {
                    setShowDecompressionModal(true);
                  } else if (tool.path) {
                    router.push(tool.path);
                  }
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:scale-105 transition-transform cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full ${tool.bg} ${tool.text} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-lg">{tool.icon}</span>
                </div>
                <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 tracking-tight leading-none truncate w-full text-center">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>
        </div>

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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Profile Settings</h4>
              
              <div className="space-y-3 text-[11px] text-[#8E8A9F] font-bold bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                <p>Joined Date: <span className="text-slate-800 dark:text-slate-200">{data?.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Aug 2026"}</span></p>
                <p>Streak: <span className="text-slate-800 dark:text-slate-200">{data?.streak?.currentStreak || 1} Days</span></p>
                <p>Wellness Score: <span className="text-slate-800 dark:text-slate-200">{data?.wellnessScore?.score || 70}/100</span></p>
                <p>Category: <span className="text-slate-800 dark:text-slate-200">💼 Working Professional (Locked)</span></p>
              </div>

              <form onSubmit={handleSaveProfileSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Display Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Avatar Image Path (URL or DataURL)</label>
                  <input
                    type="text"
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="/images/user_avatar.jpg"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="flex-1 py-3 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Focus Session Timer</h4>

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
                          ? "bg-[#5F4EA5] text-white border-[#5F4EA5]"
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
                    isFocusRunning ? "bg-[#EA5E5E] hover:bg-[#D54D4D]" : "bg-[#5F4EA5] hover:bg-[#4A3C8C]"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Leave Work at Work</h4>
              <p className="text-[10px] font-bold text-slate-450 leading-normal px-4">Take a short transition reset to leave your work tasks at your desk and start your personal time.</p>

              {/* Animated guided breathing circle */}
              {(() => {
                const instr = getDecompressionInstruction(decompressionTimeLeft);
                return (
                  <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <p className="text-4xl font-black text-[#7C6BC4] leading-none">
                      {Math.floor(decompressionTimeLeft / 60)}:{String(decompressionTimeLeft % 60).padStart(2, "0")}
                    </p>
                    
                    <motion.div
                      animate={{ scale: isDecompressionRunning ? instr.scale : 1 }}
                      transition={{ duration: instr.duration, ease: "easeInOut" }}
                      className="w-28 h-28 rounded-full bg-emerald-500/10 border border-[#7C6BC4]/30 flex items-center justify-center shadow-inner"
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
                    isDecompressionRunning ? "bg-[#EA5E5E] hover:bg-[#D54D4D]" : "bg-[#5F4EA5] hover:bg-[#4A3C8C]"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Daily Wellbeing Check-In</h4>

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
                            ? "border-[#5F4EA5] bg-[#5F4EA5]/5 text-[#5F4EA5]"
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
                    className="w-full px-4 py-3 rounded-2xl bg-slate-5-0 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-100 disabled:cursor-not-allowed"
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
                      className="w-full accent-[#5F4EA5] disabled:cursor-not-allowed"
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
                      className="w-full accent-[#5F4EA5] disabled:cursor-not-allowed"
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
                    className="w-full accent-[#5F4EA5] disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-100 min-h-[70px] disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {!data?.todayCheckin ? (
                    <button
                      type="submit"
                      disabled={isSubmittingCheckin}
                      className="flex-1 py-3 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      {isSubmittingCheckin ? "Submitting..." : "Submit Check-in"}
                    </button>
                  ) : (
                    <div className="flex-1 text-center py-2.5 px-4 bg-[#F5F3FC] text-[#5F4EA5] text-[10px] font-black uppercase tracking-wider rounded-xl">
                      ✓ Logged for Today
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCheckinModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Edit Wellness Goal</h4>
              <form onSubmit={handleEditGoalSave} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={editingGoalTitle}
                    onChange={(e) => setEditingGoalTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingEditGoal}
                    className="flex-1 py-2.5 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGoalId(null)}
                    className="px-4 py-2.5 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Log Sleep & Recovery</h4>
              
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
                    className="w-full accent-[#5F4EA5]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingSleep}
                    className="flex-1 py-3 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Sleep Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSleepModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Update Work-Life Balance</h4>
              
              <form onSubmit={handleSaveWorkLifeSubmit} className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-350">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Work Sat / Effort ({workVal}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={workVal}
                    onChange={(e) => setWorkVal(Number(e.target.value))}
                    className="w-full accent-[#5F4EA5]"
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
                    className="w-full accent-[#5F4EA5]"
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
                    className="w-full accent-[#5F4EA5]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSavingWorkLife}
                    className="flex-1 py-3 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Save Balance Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWorkLifeModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Reschedule Appointment</h4>
              
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
                    className="flex-1 py-3 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Confirm Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApptModal(false)}
                    className="px-5 py-3 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
              <h4 className="font-heading font-black text-xs text-[#5F4EA5] uppercase tracking-widest">Journal Entry</h4>
              
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
                      className="flex-1 py-2.5 bg-[#5F4EA5] hover:bg-[#4A3C8C] text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
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
                        className="px-3 py-2.5 border border-slate-200 text-[#8E8A9F] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
                            className="text-[8px] font-black uppercase text-[#5F4EA5] hover:underline"
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
                  className="px-5 py-2.5 border border-slate-200 text-[#8E8A9F] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer"
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
