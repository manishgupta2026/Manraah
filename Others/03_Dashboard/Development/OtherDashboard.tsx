"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

// General Wellness Goals & Tasks for Other category
const INITIAL_WELLNESS_TASKS = [
  { id: 1, text: "🧘 Complete a 5-minute breathing session", completed: false },
  { id: 2, text: "📖 Log feelings in Sanctuary Journal", completed: false },
  { id: 3, text: "🚶 Go for a 15-minute outdoor walk", completed: false },
  { id: 4, text: "🔒 Review your privacy retreat status", completed: false },
];

const GENERAL_ADVICE_TIPS = [
  { category: "Rest 💤", title: "Unplug 30 mins before bed", desc: "Disconnect from screen blue light to promote deep, restorative melatonin production." },
  { category: "Mind 🧠", title: "Try Box Breathing technique", desc: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s to reset your nervous system." },
  { category: "Focus ⚡", title: "Block time for deep work", desc: "Set a 25-minute timer and focus on one task without checking communications." },
  { category: "Energy 🌿", title: "Hydrate and stretch daily", desc: "A large glass of water and simple shoulder rolls can lift afternoon fatigue instantly." }
];

export default function OtherDashboard() {
  const router = useRouter();

  // Profile / Username states
  const [userName, setUserName] = useState("Samantha W.");
  const [email, setEmail] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Time-based Greetings
  const [greeting, setGreeting] = useState("Hello");
  const [timeIcon, setTimeIcon] = useState("🌅");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("morning");

  // Wellness Score & Sliders
  const [wellnessScore, setWellnessScore] = useState(80);
  const [stressLevel, setStressLevel] = useState(3); // 1-5
  const [energyLevel, setEnergyLevel] = useState(4); // 1-5
  const [focusScore, setFocusScore] = useState(4); // 1-5

  // Daily Tasks Checklist
  const [tasks, setTasks] = useState(INITIAL_WELLNESS_TASKS);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(6); // Default highlight day 6 from mockup
  const [activeTab, setActiveTab] = useState<"monthly" | "daily">("monthly");

  // Breathing tool overlay states
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Modals & themes
  const [streakDays, setStreakDays] = useState(1);
  const [streakBroken, setStreakBroken] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync theme with local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("manraah-theme") || "light";
      const isDark = saved === "dark";
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

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

  // Breathing Box Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathingSeconds((prev) => {
          if (prev <= 1) {
            if (breathingPhase === "Inhale") {
              setBreathingPhase("Hold");
              return 4;
            } else if (breathingPhase === "Hold") {
              setBreathingPhase("Exhale");
              return 4;
            } else {
              setBreathingPhase("Inhale");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathingPhase]);

  // DB Load Mount hook
  useEffect(() => {
    const session = getClientSession();
    
    // Greeting time icon setup
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
      setTimeIcon("🌅");
      setTimeOfDay("morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
      setTimeIcon("☀️");
      setTimeOfDay("afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
      setTimeIcon("🌿");
      setTimeOfDay("evening");
    } else {
      setGreeting("Good Night");
      setTimeIcon("🌌");
      setTimeOfDay("night");
    }

    if (session && session.isAuthenticated && session.user) {
      setEmail(session.user.email || "");
      setUserName(session.user.sanctuaryName || session.user.name || "Samantha W.");
    }

    // Load details from DB
    fetch("/api/dashboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load dashboard data");
      })
      .then((data) => {
        setDashboardData(data);
        if (data.user) {
          if (data.user.sanctuaryName || data.user.name) {
            setUserName(data.user.sanctuaryName || data.user.name);
          }
          
          // Check if onboarding assessment is completed
          const localAssessmentCompleted = localStorage.getItem("other_assessment_completed") === "true";
          const assessmentModalDismissed = localStorage.getItem("other_assessment_modal_dismissed") === "true";
          const hasOtherAssessment = (data.user.assessmentPercentage !== null && 
                                      data.user.assessmentPercentage !== undefined && 
                                      (data.user.assessmentCategory === "other" || data.user.assessmentCategory === "others")) || localAssessmentCompleted;

          if (hasOtherAssessment || assessmentModalDismissed) {
            const securityPopupShown = localStorage.getItem("other_security_popup_shown_once") === "true";
            const showImmediately = localStorage.getItem("other_show_security_immediately") === "true";

            if (showImmediately) {
              setShowSecurityPopup(true);
              localStorage.setItem("other_security_popup_shown_once", "true");
              localStorage.removeItem("other_show_security_immediately");
            } else if (!securityPopupShown) {
              setShowSecurityPopup(true);
              localStorage.setItem("other_security_popup_shown_once", "true");
            }
          } else {
            setShowAssessmentModal(true);
          }

          // Hydrate streak
          let isBroken = false;
          if (data.streak?.lastCheckinDate) {
            const lastCheck = new Date(data.streak.lastCheckinDate);
            const lastDate = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
            const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 1) {
              isBroken = true;
              setStreakBroken(true);
            } else {
              setStreakBroken(false);
            }
          }
          const backendStreak = isBroken ? 0 : (data.streak?.currentStreak || data.user.streakDays || 0);
          setStreakDays(backendStreak);

          // Restore dashboard state from DB
          const ds = data.user.dashboardState;
          if (ds && typeof ds === "object") {
            if (ds.wellnessScore !== undefined) setWellnessScore(ds.wellnessScore);
            else if (data.user.assessmentPercentage !== null && data.user.assessmentPercentage !== undefined) {
              setWellnessScore(data.user.assessmentPercentage);
            }
            if (ds.stressLevel !== undefined) setStressLevel(ds.stressLevel);
            if (ds.energyLevel !== undefined) setEnergyLevel(ds.energyLevel);
            if (ds.focusScore !== undefined) setFocusScore(ds.focusScore);
            if (ds.tasks && Array.isArray(ds.tasks)) setTasks(ds.tasks);
          } else {
            if (data.user.assessmentPercentage !== null && data.user.assessmentPercentage !== undefined) {
              setWellnessScore(data.user.assessmentPercentage);
            }
          }
        }
      })
      .catch((err) => console.error("Other dashboard load error:", err));
  }, []);

  // Helper to persist updated states in the database
  const saveDashboardStateToDB = async (updatedFields: any) => {
    const session = getClientSession();
    if (!session || !session.isAuthenticated || !session.user?.id) return;

    const currentStress = updatedFields.stressLevel !== undefined ? updatedFields.stressLevel : stressLevel;
    const currentEnergy = updatedFields.energyLevel !== undefined ? updatedFields.energyLevel : energyLevel;
    const currentFocus = updatedFields.focusScore !== undefined ? updatedFields.focusScore : focusScore;

    const points = (6 - currentStress) + currentEnergy + currentFocus;
    const newWellnessScore = Math.round((points / 15) * 100);

    setWellnessScore(newWellnessScore);

    const mergedState = {
      wellnessScore: newWellnessScore,
      stressLevel: currentStress,
      energyLevel: currentEnergy,
      focusScore: currentFocus,
      tasks: updatedFields.tasks !== undefined ? updatedFields.tasks : tasks,
      ...updatedFields
    };

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          dashboardState: mergedState
        })
      });
      const resData = await res.json();
      if (res.ok && resData.user) {
        if (resData.user.streakDays !== undefined) {
          setStreakDays(resData.user.streakDays);
          setStreakBroken(false);
        }
      }

      setDashboardData((prev: any) => {
        if (!prev || !prev.user) return prev;
        return {
          ...prev,
          user: {
            ...prev.user,
            dashboardState: mergedState
          }
        };
      });
    } catch (err) {
      console.error("[Other DB Save Error]:", err);
    }
  };

  // Toggle tasks completion
  const handleToggleTask = (id: number) => {
    const nextTasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(nextTasks);
    saveDashboardStateToDB({ tasks: nextTasks });
  };

  // Update wellness sliders
  const handleSliderChange = (type: "stress" | "energy" | "focus", val: number) => {
    if (type === "stress") {
      setStressLevel(val);
      saveDashboardStateToDB({ stressLevel: val });
    } else if (type === "energy") {
      setEnergyLevel(val);
      saveDashboardStateToDB({ energyLevel: val });
    } else if (type === "focus") {
      setFocusScore(val);
      saveDashboardStateToDB({ focusScore: val });
    }
  };

  // Date utilities
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const currentDateString = useMemo(() => {
    const d = new Date();
    return `${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
  }, []);

  const activeTip = GENERAL_ADVICE_TIPS[currentTipIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0D1F2D] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 pb-16 md:pb-8">
      
      {/* Dynamic Streak Restorer Warning */}
      <AnimatePresence>
        {streakBroken && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-rose-500 text-white text-center py-2 px-4 text-xs font-black z-50 flex items-center justify-center gap-2 shadow-md"
          >
            <span>🚨 Your check-in streak was broken! Log your mood check-in today to reset your wellness record.</span>
            <button 
              onClick={() => router.push("/checkin")}
              className="px-3 py-1 bg-white text-rose-600 rounded-full font-bold hover:bg-rose-50 transition-all active:scale-95"
            >
              Check-in Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Navigation */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-6 pt-4 md:pt-6 z-10 relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button 
          onClick={() => {
            setShowDisconnectModal(true);
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#132E3F] text-[11px] font-extrabold text-[#005B48] dark:text-emerald-450 shadow-sm border border-slate-105 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 self-start cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
          Back to home
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              localStorage.setItem("parent_reset_assessment_flow", "true");
              router.push("/assessment");
            }} 
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#132E3F] border border-emerald-100/40 dark:border-slate-800 text-[#005B48] dark:text-emerald-450 text-[11px] font-extrabold shadow-xs hover:bg-[#FFFDF9] dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
            Retake Assessment
          </button>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1">
        
        {/* ==================== LEFT SIDEBAR PANEL (col-span-3) ==================== */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Main Condition check card */}
          <div className="p-6 rounded-[36px] bg-[#E6F4F0] dark:bg-[#112F28] border border-[#CBECE2] dark:border-[#1C463C] shadow-soft flex flex-col justify-between space-y-6">
            <div className="space-y-6 text-center">
              
              {/* User Profile Info */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-orange-100 flex items-center justify-center">
                    {/* Person avatar from mockup */}
                    <img 
                      src="/category/other.png" 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#006B56] border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                </div>
                
                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-heading font-black text-[#005B48] dark:text-emerald-450">Check your condition</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-1">
                    Check your every situation, stress factors, and wellness activities.
                  </p>
                </div>
              </div>

              {/* Check It Now CTA Button */}
              <button 
                onClick={() => router.push("/checkin")}
                className="w-full py-3.5 rounded-2xl bg-[#006B56] hover:bg-[#005B48] text-white font-black text-xs shadow-md transition-transform active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Check It Now
              </button>

              {/* Vector Artwork/Illustration matching mockup */}
              <div className="pt-2 border-t border-[#D0EDE4] dark:border-[#1C463C] flex justify-center overflow-hidden rounded-2xl bg-white dark:bg-[#132E3F]">
                <img 
                  src="/category/other.png" 
                  alt="Mindfulness Check" 
                  className="w-full h-auto object-cover max-h-[140px] hover:scale-105 transition-transform duration-500 rounded-xl"
                />
              </div>

            </div>
          </div>

          {/* 100% Confidential Info Card */}
          <div className="bg-white dark:bg-[#132E3F] p-4 rounded-[24px] border border-[#EAEAFF] dark:border-slate-800 shadow-soft flex items-center gap-3 text-left w-full">
            <span className="text-2xl filter drop-shadow-sm select-none">🤫</span>
            <div>
              <h4 className="text-[11px] font-heading font-black text-slate-800 dark:text-slate-100 leading-tight">100% Confidential</h4>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold leading-normal mt-0.5">No data ever leaves this device.</p>
            </div>
          </div>

        </section>

        {/* ==================== CENTER DASHBOARD GRID (col-span-6) ==================== */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Main Welcome Greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft">
            <div className="space-y-1">
              <h1 className="text-3xl font-heading font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Hi, {userName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                Let's track your health daily!
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 rounded-2xl shadow-2xs font-bold text-xs select-none">
              <span className="material-symbols-outlined text-sm font-black text-orange-500 animate-pulse">local_fire_department</span>
              <span>Day {streakDays} Streak</span>
            </div>
          </div>

          {/* Upcoming Appointment Widget */}
          <section className="bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Upcoming appointment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* ST Hospital illustration on left */}
              <div className="md:col-span-5 rounded-2xl overflow-hidden relative border border-slate-100 dark:border-slate-800">
                <svg viewBox="0 0 150 100" className="w-full h-full bg-[#EAF5F0]">
                  {/* Sky */}
                  <rect x="0" y="0" width="150" height="70" fill="#EAF5F0" />
                  <circle cx="120" cy="30" r="16" fill="#FEE2E2" opacity="0.6" />
                  {/* Building */}
                  <rect x="30" y="30" width="90" height="70" fill="#FFFFFF" rx="6" />
                  <rect x="50" y="20" width="50" height="80" fill="#FED7AA" rx="6" />
                  {/* Windows */}
                  <rect x="40" y="45" width="8" height="15" fill="#38BDF8" rx="1" />
                  <rect x="58" y="35" width="8" height="15" fill="#38BDF8" rx="1" />
                  <rect x="70" y="35" width="8" height="15" fill="#38BDF8" rx="1" />
                  <rect x="82" y="35" width="8" height="15" fill="#38BDF8" rx="1" />
                  <rect x="100" y="45" width="8" height="15" fill="#38BDF8" rx="1" />
                  {/* Door */}
                  <rect x="68" y="70" width="14" height="30" fill="#34D399" />
                </svg>
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 dark:bg-[#132E3F]/95 p-2 rounded-lg border border-slate-100/50 dark:border-slate-800/40">
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-tight">Manggis ST Hospital</h4>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">New York, USA</p>
                </div>
              </div>

              {/* Consultant Details */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-emerald-100 flex items-center justify-center shrink-0">
                      <span className="text-xl">👩‍⚕️</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">Dr. Emilia Winson</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">Physiotherapy</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push("/call")}
                    className="px-3.5 py-1.5 bg-[#006B56] hover:bg-[#005B48] text-white rounded-full font-black text-[9px] transition-transform active:scale-95 shadow-sm"
                  >
                    Video call
                  </button>
                </div>

                {/* Date capsules matching mockup */}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-[#18364B] rounded-xl border border-slate-100/60 dark:border-slate-800/40 text-[9px] font-black">
                    <span className="material-symbols-outlined text-xs text-[#006B56]">calendar_month</span>
                    <span>14 Mar 2022</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-[#18364B] rounded-xl border border-slate-100/60 dark:border-slate-800/40 text-[9px] font-black">
                    <span className="material-symbols-outlined text-xs text-amber-500">schedule</span>
                    <span>09.00 pm</span>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Activities Graph and Score Panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Patient activities bar chart (col-span-7) */}
            <section className="md:col-span-7 bg-white dark:bg-[#132E3F] p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Patient activities
                  </h3>
                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">Today, 5 October 2022</p>
                </div>
                
                <span className="px-2.5 py-1 bg-slate-50 dark:bg-[#18364B] border border-slate-100 dark:border-slate-800 rounded-lg text-[8px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>Month</span>
                  <span className="material-symbols-outlined text-[10px]">expand_more</span>
                </span>
              </div>

              {/* Bar graph bars */}
              <div className="h-28 flex items-end justify-between px-2 pt-2 pb-1 relative">
                {/* Horizontal reference grid lines */}
                <div className="absolute left-0 right-0 top-0 border-t border-slate-100 dark:border-slate-800/60 border-dashed" />
                <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 dark:border-slate-800/60 border-dashed" />

                {[
                  { m: "Jul", h: "h-14" },
                  { m: "Aug", h: "h-20" },
                  { m: "Sep", h: "h-24" },
                  { m: "Oct", h: "h-12" },
                  { m: "Nov", h: "h-16" },
                  { m: "Oct", h: "h-22", active: true } // Active highlighting
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 z-10">
                    <div className="w-6 rounded-full bg-slate-100 dark:bg-[#18364B] h-24 flex items-end overflow-hidden">
                      <div className={`w-full ${bar.h} rounded-full ${bar.active ? "bg-[#005B48]" : "bg-[#B2D8C6]"}`} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-450">{bar.m}</span>
                  </div>
                ))}
              </div>

              {/* Bottom Condition Indicator */}
              <button 
                onClick={() => router.push("/reports")}
                className="w-full p-3 bg-slate-50 dark:bg-[#18364B] rounded-2xl border border-slate-100 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-[#20445E] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#132E3F] text-[#006B56] flex items-center justify-center border border-slate-150 dark:border-slate-800">
                    <span className="material-symbols-outlined text-sm font-black">favorite</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-tight">Good conditions</h4>
                    <p className="text-[8px] text-slate-400 font-bold mt-0.5">Anxiety & wellness</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
              </button>
            </section>

            {/* Daily progress circle (col-span-5) */}
            <section className="md:col-span-5 bg-[#EAF6F2] dark:bg-[#112F28] p-5 rounded-[32px] border border-[#CBECE2] dark:border-[#1C463C] shadow-soft flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-heading font-black text-[#006B56] dark:text-[#5FAF8A] uppercase tracking-wider">
                  Daily progress
                </h3>
                <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold mt-1 leading-normal">
                  Keep improving the quality of your health
                </p>
              </div>

              {/* Progress Radial Circle */}
              <div className="relative w-24 h-24 mx-auto shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Track */}
                  <path
                    className="text-white/80 dark:text-[#18364B]/40"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Circle */}
                  <path
                    className="text-[#006B56] dark:text-[#5FAF8A] transition-all duration-700"
                    strokeDasharray={`${wellnessScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-[#006B56] dark:text-[#5FAF8A] tracking-tight">
                    {wellnessScore}%
                  </span>
                </div>
              </div>

              {/* Recommendation tip */}
              <div className="pt-2 border-t border-[#CBECE2]/60 dark:border-emerald-900/30 text-center">
                <p className="text-[8px] text-[#006B56] dark:text-[#5FAF8A] font-black italic">
                  "Try completing box breathing to reset stress parameters."
                </p>
              </div>
            </section>

          </div>

          {/* Dynamic Sliders Section */}
          <section className="bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Sanctuary Sliders
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-wider border border-emerald-500/20">
                Live Calibration
              </span>
            </div>

            <div className="space-y-4">
              {/* Stress Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black">
                  <span className="text-slate-600 dark:text-slate-400">Stress Intensity</span>
                  <span className="text-rose-500">{stressLevel === 1 ? "Minimal" : stressLevel === 2 ? "Low" : stressLevel === 3 ? "Moderate" : stressLevel === 4 ? "High" : "Extreme"}</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={stressLevel} 
                  onChange={(e) => handleSliderChange("stress", parseInt(e.target.value))}
                  className="w-full accent-[#006B56] bg-slate-100 dark:bg-[#18364B] rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Energy Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black">
                  <span className="text-slate-600 dark:text-slate-400">Energy Level</span>
                  <span className="text-emerald-500">{energyLevel === 1 ? "Exhausted" : energyLevel === 2 ? "Tired" : energyLevel === 3 ? "Balanced" : energyLevel === 4 ? "High" : "Peak"}</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={energyLevel} 
                  onChange={(e) => handleSliderChange("energy", parseInt(e.target.value))}
                  className="w-full accent-[#006B56] bg-slate-100 dark:bg-[#18364B] rounded-lg h-2 cursor-pointer"
                />
              </div>

              {/* Focus Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black">
                  <span className="text-slate-600 dark:text-slate-400">Focus & Clarity</span>
                  <span className="text-sky-500">{focusScore === 1 ? "Highly Distracted" : focusScore === 2 ? "Fuzzy" : focusScore === 3 ? "Average" : focusScore === 4 ? "Focused" : "Laser Sharp"}</span>
                </div>
                <input 
                  type="range" min="1" max="5" value={focusScore} 
                  onChange={(e) => handleSliderChange("focus", parseInt(e.target.value))}
                  className="w-full accent-[#006B56] bg-slate-100 dark:bg-[#18364B] rounded-lg h-2 cursor-pointer"
                />
              </div>
            </div>
          </section>

        </main>

        {/* ==================== RIGHT SIDEBAR COLUMN (col-span-3) ==================== */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Calendar & Task List Panel */}
          <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[36px] border border-slate-100 dark:border-slate-800 shadow-soft space-y-6">
            <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider text-center lg:text-left">
              List of appointments
            </h3>

            {/* Monthly / Daily Switcher Tabs */}
            <div className="flex p-1 bg-slate-50 dark:bg-[#18364B] rounded-2xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setActiveTab("monthly")}
                className={`flex-1 py-2 rounded-xl font-black text-[9px] transition-all cursor-pointer ${
                  activeTab === "monthly"
                    ? "bg-white dark:bg-[#132E3F] text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-650"
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setActiveTab("daily")}
                className={`flex-1 py-2 rounded-xl font-black text-[9px] transition-all cursor-pointer ${
                  activeTab === "daily"
                    ? "bg-white dark:bg-[#132E3F] text-slate-800 dark:text-slate-100 shadow-sm"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-650"
                }`}
              >
                Daily Focus
              </button>
            </div>

            {activeTab === "monthly" ? (
              <>
                {/* Calendar widget container */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-heading font-black text-slate-800 dark:text-slate-150">
                      {currentMonthName} {currentYear}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={handlePrevMonth} className="w-7 h-7 rounded-full bg-slate-50 dark:bg-[#18364B] flex items-center justify-center border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-[#20445E]">
                        <span className="material-symbols-outlined text-[10px]">chevron_left</span>
                      </button>
                      <button onClick={handleNextMonth} className="w-7 h-7 rounded-full bg-slate-50 dark:bg-[#18364B] flex items-center justify-center border border-slate-100 dark:border-slate-850 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-[#20445E]">
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center list-none">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                      <span key={idx} className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase">
                        {d}
                      </span>
                    ))}

                    {calendarDays.map((day, idx) => {
                      if (day === null) return <div key={idx} className="w-7 h-7" />;
                      const isTodayHighlight = day === selectedCalendarDate;

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedCalendarDate(day)}
                          className={`w-7 h-7 rounded-full text-[9px] font-black mx-auto flex items-center justify-center transition-all ${
                            isTodayHighlight
                              ? "!bg-[#E37A47] !text-white shadow-md scale-105"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#18364B]"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* List of Tasks / Appointments */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  
                  {/* Manage stress appointment */}
                  <div className="p-3 bg-slate-50 dark:bg-[#18364B] rounded-2xl border border-slate-100/60 dark:border-slate-850/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-200/20">
                        <span className="material-symbols-outlined text-sm font-black">spa</span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-tight">Manage stress</h4>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">10:00pm - 12:00 pm</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                  </div>

                  {/* Physiotherapy appointment */}
                  <div className="p-3 bg-slate-50 dark:bg-[#18364B] rounded-2xl border border-slate-100/60 dark:border-slate-850/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center border border-orange-200/20">
                        <span className="material-symbols-outlined text-sm font-black">handshake</span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-100 leading-tight">Physiotherapy</h4>
                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">09:00am - 10:00 am</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                  </div>

                  {/* See More Schedule Link */}
                  <button 
                    onClick={() => router.push("/resources")}
                    className="w-full text-center text-[9px] font-black text-[#006B56] hover:text-[#005B48] flex items-center justify-center gap-1.5 mt-2"
                  >
                    <span>See More Schedule</span>
                    <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                  </button>

                </div>
              </>
            ) : (
              <>
                {/* Daily Focus Habits Checklist */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-black text-[#006B56] dark:text-[#5FAF8A] uppercase tracking-wider">Sanctuary Checklist</h5>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4F0] dark:bg-[#112F28] border border-[#CBECE2]/40 text-[#006B56] dark:text-[#5FAF8A] text-[8px] font-black">
                      {tasks.filter((t) => t.completed).length}/{tasks.length} Completed
                    </span>
                  </div>

                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleToggleTask(task.id)}
                        className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#18364B] border border-slate-100 dark:border-slate-850/40 hover:bg-slate-100 dark:hover:bg-[#20445E] flex items-center justify-between text-left transition-all active:scale-[0.99]"
                      >
                        <span className={`text-[10px] font-bold ${task.completed ? "line-through text-slate-400 dark:text-slate-600" : "text-slate-700 dark:text-slate-350"}`}>
                          {task.text}
                        </span>
                        
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          task.completed 
                            ? "bg-[#006B56] border-[#006B56] text-white" 
                            : "border-slate-300 dark:border-slate-700"
                        }`}>
                          {task.completed && <span className="material-symbols-outlined text-xs font-black">check</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>


        </section>

      </div>

      {/* ==================== BREATHING BOX TIMER OVERLAY ==================== */}
      <AnimatePresence>
        {breathingActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0D1F2D]/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="text-center space-y-8 max-w-sm w-full">
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-black text-white">Box Breathing</h3>
                <p className="text-xs text-slate-400">Match your breathing cycle to the indicators</p>
              </div>

              {/* Pulsing visual container */}
              <div className="w-48 h-48 rounded-full border-4 border-[#006B56]/30 mx-auto flex items-center justify-center relative">
                <motion.div 
                  animate={{
                    scale: breathingPhase === "Inhale" ? [1, 1.4] : breathingPhase === "Exhale" ? [1.4, 1] : 1.4
                  }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="absolute inset-4 rounded-full bg-[#006B56]/20"
                />
                <div className="z-10 space-y-1">
                  <span className="text-xl font-heading font-black text-white block uppercase tracking-widest">
                    {breathingPhase}
                  </span>
                  <span className="text-3xl font-black text-[#006B56]">
                    {breathingSeconds}s
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setBreathingActive(false)}
                className="px-8 py-3 bg-white text-slate-900 rounded-full font-black text-xs shadow-md transition-transform active:scale-95 hover:bg-slate-100"
              >
                Close Exercise
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PERIODIC PRIVACY MODAL ==================== */}
      <AnimatePresence>
        {showSecurityPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/70 backdrop-blur-md flex items-center justify-center p-4 select-none"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#132E3F] max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-[20px] bg-[#E3F2EC] dark:bg-[#0E3529]/40 flex items-center justify-center mx-auto border border-[#CDE5DB]/40 dark:border-[#005B48]/20">
                <span className="material-symbols-outlined text-2xl text-[#005B48] dark:text-[#5FAF8A]">filter_vintage</span>
              </div>

              <div className="space-y-1 font-heading">
                <h3 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                  <span>🌿</span> Your Retreat is Private
                </h3>
              </div>

              <p className="text-[11px] text-slate-550 dark:text-slate-400 font-bold leading-relaxed px-2">
                Everything you write, journal, and share inside Manraah remains private. This is your personal space to reflect honestly and safely.
              </p>

              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E3F2EC] dark:bg-[#0E3529]/40 border border-[#CDE5DB]/40 dark:border-[#005B48]/20 rounded-full text-[10px] font-black text-[#005B48] dark:text-[#5FAF8A]">
                  <span>🔒</span> Your wellbeing belongs to you.
                </span>
              </div>

              <button 
                onClick={() => {
                  setShowSecurityPopup(false);
                }}
                className="w-full py-4 bg-[#006B56] hover:bg-[#005B48] text-white rounded-full font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                I Understand 💚
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== COMPLETE ASSESSMENT BLURRED MODAL ==================== */}
      <AnimatePresence>
        {showAssessmentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/80 backdrop-blur-xl flex items-center justify-center p-4 select-none"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#132E3F] max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-[#006B56]/10 text-[#006B56] flex items-center justify-center mx-auto border border-[#006B56]/20">
                <span className="material-symbols-outlined text-3xl font-black">assignment</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#006B56]">Onboarding Retreat</span>
                <h3 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100">Complete Assessment</h3>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-450 font-bold leading-relaxed px-2">
                To unlock your personalized Wellness Dashboard, personal habits checklist, and daily wellness tracking, please complete your initial assessment.
              </p>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    localStorage.setItem("parent_reset_assessment_flow", "true");
                    router.push("/assessment");
                  }}
                  className="w-full py-3.5 bg-[#006B56] hover:bg-[#005B48] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-black">play_arrow</span>
                  Start Assessment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== DISCONNECT WARNING MODAL ==================== */}
      <AnimatePresence>
        {showDisconnectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D283E]/70 backdrop-blur-md flex items-center justify-center p-4 select-none"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#132E3F] max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
                <span className="material-symbols-outlined text-3xl font-black">warning</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-rose-500">Session Warning</span>
                <h3 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100">Disconnect Session?</h3>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-bold leading-relaxed px-2">
                Going back to the landing page will disconnect your active session. You will need to authenticate again to view your dashboard.
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-[#0D1F2D] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-full font-bold text-xs transition-all active:scale-95"
                >
                  Stay
                </button>
                <button 
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs shadow-sm transition-all active:scale-95"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
