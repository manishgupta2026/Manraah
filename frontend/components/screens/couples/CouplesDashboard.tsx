"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

// Couples Relationship Goals & Tasks
const INITIAL_HARMONY_TASKS = [
  { id: 1, text: "💬 Share one genuine", completed: false },
  { id: 2, text: "🧘 Complete a 3-minute", completed: false },
  { id: 3, text: "🔇 Set devices to", completed: false },
  { id: 4, text: "💌 Leave a sweet", completed: false },
];

const DATE_NIGHT_IDEAS = [
  { category: "Cozy 🏡", title: "Indoor Fort & Movie", desc: "Build a classic living-room blanket fort, make homemade popcorn, and watch a nostalgic movie." },
  { category: "Creative 🎨", title: "Double-Sided Canvas Painting", desc: "Buy two small canvases. Set up opposite each other and paint a portrait of the other person without looking at the canvas!" },
  { category: "Culinary 🍳", title: "Mystery Ingredient Cook-off", desc: "Assign each other 2 secret ingredients. Work together to cook a 3-course dinner utilizing all of them." },
  { category: "Adventure 🌌", title: "Midnight Stargazing & Picnic", desc: "Pack a thermos of hot cocoa, a heavy blanket, and drive to a local high point or open field to watch the night sky." },
  { category: "Active 🚶", title: "Memory Walk & Photo Hunt", desc: "Walk through a neighborhood that has meaning to your relationship, recreating past photos or capturing new ones." }
];

const HEADER_THEMES = {
  morning: {
    cardBg: "bg-white border-slate-100 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-[#005B48]",
    textMuted: "text-slate-500",
    btnHover: "hover:bg-slate-50",
    bellIcon: "text-slate-655",
    bellHover: "hover:bg-slate-100",
  },
  afternoon: {
    cardBg: "bg-white border-slate-100 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-[#005B48]",
    textMuted: "text-slate-500",
    btnHover: "hover:bg-slate-50",
    bellIcon: "text-slate-650",
    bellHover: "hover:bg-slate-100",
  },
  evening: {
    cardBg: "bg-white border-slate-100 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-[#005B48] font-black",
    textMuted: "text-slate-500 font-semibold",
    btnHover: "hover:bg-slate-50",
    bellIcon: "text-slate-655",
    bellHover: "hover:bg-slate-100",
  },
  night: {
    cardBg: "bg-white border-slate-100 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-[#005B48] font-black",
    textMuted: "text-slate-500 font-semibold",
    btnHover: "hover:bg-slate-50",
    bellIcon: "text-slate-655",
    bellHover: "hover:bg-slate-100",
  }
};

export default function CouplesDashboard() {
  const router = useRouter();
  
  // Profile / Username & Partner link states
  const [partnerName, setPartnerName] = useState("Elena");
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [tempPartnerName, setTempPartnerName] = useState("Elena");
  
  const [userName, setUserName] = useState("Bloo");
  const [email, setEmail] = useState("");
  const [showName, setShowName] = useState(true);

  // Time-based Greetings
  const [greeting, setGreeting] = useState("Hello");
  const [timeIcon, setTimeIcon] = useState("🌅");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("morning");

  // Harmony Score & Sliders
  const [harmonyScore, setHarmonyScore] = useState(90);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [communicationScore, setCommunicationScore] = useState(8);

  // Today's Focus checklist
  const [tasks, setTasks] = useState(INITIAL_HARMONY_TASKS);
  
  // Date Night Generator states
  const [currentDateIdea, setCurrentDateIdea] = useState(DATE_NIGHT_IDEAS[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  // Gating & Streak state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [streakDays, setStreakDays] = useState(1);
  const [streakBroken, setStreakBroken] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);

  // Conflict Calm Zone modal states
  const [calmZoneActive, setCalmZoneActive] = useState(false);
  const [calmStep, setCalmStep] = useState(1);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Synchronized breathing loop
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
      setUserName(session.user.sanctuaryName || session.user.name || "Bloo");
    } else {
      setUserName("Bloo");
    }

    // Load live details from DB
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
          const localAssessmentCompleted = localStorage.getItem("couple_assessment_completed") === "true";
          const assessmentModalDismissed = localStorage.getItem("couple_assessment_modal_dismissed") === "true";
          const hasCoupleAssessment = (data.user.assessmentPercentage !== null && 
                                      data.user.assessmentPercentage !== undefined && 
                                      (data.user.assessmentCategory === "couples" || data.user.assessmentCategory === "couple")) || localAssessmentCompleted;

          if (hasCoupleAssessment || assessmentModalDismissed) {
            const securityPopupShown = localStorage.getItem("couple_security_popup_shown_once") === "true";
            const showImmediately = localStorage.getItem("couple_show_security_immediately") === "true";

            if (showImmediately) {
              setShowSecurityPopup(true);
              localStorage.setItem("couple_security_popup_shown_once", "true");
              localStorage.removeItem("couple_show_security_immediately");
            } else if (!securityPopupShown) {
              setShowSecurityPopup(true);
              localStorage.setItem("couple_security_popup_shown_once", "true");
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
            if (ds.partnerName) {
              setPartnerName(ds.partnerName);
              setTempPartnerName(ds.partnerName);
            }
            if (ds.harmonyScore !== undefined) setHarmonyScore(ds.harmonyScore);
            else if (data.user.assessmentPercentage !== null && data.user.assessmentPercentage !== undefined) {
              setHarmonyScore(data.user.assessmentPercentage);
            }
            if (ds.stressLevel !== undefined) setStressLevel(ds.stressLevel);
            if (ds.energyLevel !== undefined) setEnergyLevel(ds.energyLevel);
            if (ds.communicationScore !== undefined) setCommunicationScore(ds.communicationScore);
            if (ds.tasks && Array.isArray(ds.tasks)) setTasks(ds.tasks);
            if (ds.currentDateIdea) setCurrentDateIdea(ds.currentDateIdea);
          } else {
            // Restore from localStorage fallback
            const storedPartner = localStorage.getItem("couple_partner_name") || "Elena";
            setPartnerName(storedPartner);
            setTempPartnerName(storedPartner);
            if (data.user.assessmentPercentage !== null && data.user.assessmentPercentage !== undefined) {
              setHarmonyScore(data.user.assessmentPercentage);
            }
          }
        }
      })
      .catch((err) => console.error("Couples dashboard load error:", err));
  }, []);

  // Helper to persist updated states in the database
  const saveDashboardStateToDB = async (updatedFields: any) => {
    const session = getClientSession();
    if (!session || !session.isAuthenticated || !session.user?.id) return;

    const mergedState = {
      partnerName,
      harmonyScore,
      stressLevel,
      energyLevel,
      communicationScore,
      tasks,
      currentDateIdea,
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
      console.error("[Couples DB Save Error]:", err);
    }
  };

  // Save Partner Name
  const savePartnerName = () => {
    if (!tempPartnerName.trim()) return;
    const finalName = tempPartnerName.trim();
    setPartnerName(finalName);
    localStorage.setItem("couple_partner_name", finalName);
    saveDashboardStateToDB({ partnerName: finalName });
    setIsEditingPartner(false);
  };

  // Toggle Task Completion
  const toggleTask = (id: number) => {
    const nextTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(nextTasks);
    saveDashboardStateToDB({ tasks: nextTasks });
  };

  // Dynamic Harmony Score calculation based on slider inputs
  const calculateHarmonyScore = (comm: number, energy: number, tension: number) => {
    const raw = comm * 5 + energy * 4 + (10 - tension) * 2.5;
    return Math.min(100, Math.max(20, Math.round(raw)));
  };

  // Slider change helper
  const handleSliderChange = (type: "comm" | "energy" | "stress", val: number) => {
    let c = communicationScore;
    let e = energyLevel;
    let s = stressLevel;
    if (type === "comm") {
      c = val;
      setCommunicationScore(val);
    } else if (type === "energy") {
      e = val;
      setEnergyLevel(val);
    } else {
      s = val;
      setStressLevel(val);
    }
    setHarmonyScore(calculateHarmonyScore(c, e, s));
  };

  // Slider release save helper
  const handleSliderSave = (type: "comm" | "energy" | "stress", val: number) => {
    let c = communicationScore;
    let e = energyLevel;
    let s = stressLevel;
    if (type === "comm") c = val;
    else if (type === "energy") e = val;
    else s = val;
    
    const newHarmony = calculateHarmonyScore(c, e, s);
    saveDashboardStateToDB({
      communicationScore: c,
      energyLevel: e,
      stressLevel: s,
      harmonyScore: newHarmony
    });
  };

  // Spin/Generate a new date idea
  const handleGenerateDate = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * DATE_NIGHT_IDEAS.length);
      const selectedIdea = DATE_NIGHT_IDEAS[randomIdx];
      setCurrentDateIdea(selectedIdea);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsSpinning(false);
        saveDashboardStateToDB({ currentDateIdea: selectedIdea });
      }
    }, 120);
  };

  // Calculations
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Mood Overview SVG Pie calculations (from ParentDashboard)
  const getPieBreakdown = (score: number) => {
    const validScore = typeof score === "number" && !isNaN(score) ? score : 90;
    if (validScore >= 80) {
      return { great: 60, good: 25, normal: 10, notGood: 5, bad: 0 };
    }
    const s = Math.min(50, Math.max(10, validScore / 2));
    let great = 0, good = 0, normal = 0, notGood = 0, bad = 0;
    
    if (s >= 40) {
      const ratio = (s - 40) / 10;
      great = Math.round(30 + ratio * 70);
      good = Math.round(35 - ratio * 35);
      normal = Math.round(20 - ratio * 20);
      notGood = Math.round(10 - ratio * 10);
      bad = 100 - (great + good + normal + notGood);
    } else if (s >= 30) {
      const ratio = (s - 30) / 10;
      great = Math.round(10 + ratio * 20);
      good = Math.round(25 + ratio * 10);
      normal = Math.round(35 - ratio * 15);
      notGood = Math.round(20 - ratio * 10);
      bad = 100 - (great + good + normal + notGood);
    } else if (s >= 20) {
      const ratio = (s - 20) / 10;
      great = Math.round(5 + ratio * 5);
      good = Math.round(15 + ratio * 10);
      normal = Math.round(30 + ratio * 5);
      notGood = Math.round(35 - ratio * 15);
      bad = 100 - (great + good + normal + notGood);
    } else {
      const ratio = (s - 10) / 10;
      great = Math.round(ratio * 5);
      good = Math.round(ratio * 15);
      normal = Math.round(10 + ratio * 20);
      notGood = Math.round(20 + ratio * 15);
      bad = 100 - (great + good + normal + notGood);
    }
    return { great, good, normal, notGood, bad };
  };

  const distribution = useMemo(() => {
    return getPieBreakdown(harmonyScore);
  }, [harmonyScore]);

  const pieSlices = useMemo(() => {
    const greatVal = (distribution.great || 0) / 100;
    const goodVal = (distribution.good || 0) / 100;
    const normalVal = (distribution.normal || 0) / 100;
    const notGoodVal = (distribution.notGood || 0) / 100;
    const badVal = (distribution.bad || 0) / 100;

    const greatStart = 0;
    const greatEnd = greatVal;
    const goodStart = greatEnd;
    const goodEnd = goodStart + goodVal;
    const normalStart = goodEnd;
    const normalEnd = normalStart + normalVal;
    const notGoodStart = normalEnd;
    const notGoodEnd = notGoodStart + notGoodVal;
    const badStart = notGoodEnd;
    const badEnd = 1.0;

    return {
      greatStart, greatEnd,
      goodStart, goodEnd,
      normalStart, normalEnd,
      notGoodStart, notGoodEnd,
      badStart, badEnd
    };
  }, [distribution]);

  const {
    greatStart, greatEnd,
    goodStart, goodEnd,
    normalStart, normalEnd,
    notGoodStart, notGoodEnd,
    badStart, badEnd
  } = pieSlices;

  const getCoordinatesForPercent = (percent: number) => {
    const angle = 2 * Math.PI * (percent - 0.25);
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    return [x, y];
  };

  const makePieSlicePath = (startPercent: number, endPercent: number) => {
    if (endPercent - startPercent <= 0) return "";
    if (endPercent - startPercent >= 0.999) {
      return "M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0";
    }
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
    
    const x1 = 50 + 50 * startX;
    const y1 = 50 + 50 * startY;
    const x2 = 50 + 50 * endX;
    const y2 = 50 + 50 * endY;
    
    return `M 50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 50 50 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  };

  const getLabelCoordinates = (startPercent: number, endPercent: number) => {
    const midPercent = startPercent + (endPercent - startPercent) / 2;
    const angle = 2 * Math.PI * (midPercent - 0.25);
    const x = 50 + 37 * Math.cos(angle);
    const y = 50 + 37 * Math.sin(angle) + 2;
    return { x: x.toFixed(1), y: y.toFixed(1) };
  };

  // Calendar logic (Real current date by default)
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3); // Default selected date: 3 days from now
    return d;
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentCalendarDate);
  const firstDay = getFirstDayOfMonth(currentCalendarDate);
  const calendarCells = [];
  
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-7 w-7" />);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === new Date().getDate() && 
                    currentCalendarDate.getMonth() === new Date().getMonth() && 
                    currentCalendarDate.getFullYear() === new Date().getFullYear();
    const isSelected = day === selectedDate.getDate() &&
                       currentCalendarDate.getMonth() === selectedDate.getMonth() &&
                       currentCalendarDate.getFullYear() === selectedDate.getFullYear();
    
    const cellDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), day);

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        onClick={() => setSelectedDate(cellDate)}
        className={`h-7 w-7 flex items-center justify-center text-[10px] font-bold rounded-full select-none cursor-pointer transition-all ${
          isSelected 
            ? "bg-[#005B48] text-white font-black shadow-xs" 
            : isToday
              ? "bg-[#D96A59] text-white font-black shadow-xs"
              : "text-[#334155] hover:bg-slate-100"
        }`}
      >
        {day}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8FC] dark:bg-[#0D1F2D] p-3 md:p-6 text-slate-800 dark:text-slate-100 relative font-sans transition-colors duration-250">
      
      <div className="z-10 relative space-y-6 max-w-7xl mx-auto">
        
        {/* ==================== 1. TOP BAR NAVIGATION ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button 
            onClick={() => {
              setShowDisconnectModal(true);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#132E3F] text-[11px] font-extrabold text-[#7C6BC4] dark:text-purple-300 shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 self-start"
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
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#132E3F] border border-[#F5C99B]/40 dark:border-slate-800 text-[#D96A59] dark:text-[#F38A57] text-[11px] font-extrabold shadow-xs hover:bg-[#FFFDF9] dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
              Retake Assessment
            </button>
            <button 
              onClick={() => {
                setCalmStep(1);
                setCalmZoneActive(true);
                setBreathingActive(false);
              }} 
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-[#132E3F] border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-450 text-[11px] font-extrabold shadow-xs hover:bg-rose-50/30 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">security</span>
              Empathy calm zone
            </button>

            <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E3F2EC] dark:bg-[#0E3529]/40 text-[#005B48] dark:text-[#5FAF8A] text-[10px] font-black uppercase tracking-wider shadow-xs">
              <span className="material-symbols-outlined text-xs">lock</span>
              Private Retreat Connection
            </div>
          </div>
        </div>

        {/* ==================== STREAK BROKEN BANNER ==================== */}
        {streakBroken && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 shadow-sm gap-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <h5 className="font-heading font-black text-xs text-[#D64E4D]">You broke your streak!</h5>
                <p className="text-[10px] text-slate-500 font-bold">
                  Don't worry, wellness is a continuous journey. Check in today to start a fresh streak! 🌱
                </p>
              </div>
            </div>
            <button 
              onClick={() => setStreakBroken(false)}
              className="p-1 rounded-full hover:bg-rose-100 transition-colors text-slate-400"
            >
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </motion.div>
        )}

        {/* ==================== THREE-COLUMN LAYOUT GRID ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ==================== COLUMN 1: LEFT SIDE (width: 3/12) ==================== */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-[#E3F2EC] dark:bg-[#0E3529]/20 rounded-[32px] p-6 space-y-6 text-center shadow-soft-sm border border-[#CDE5DB]/40 dark:border-[#005B48]/20 animate-fadeIn">
              
              <div className="space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 bg-rose-50 dark:bg-[#1A3A34]/50 flex items-center justify-center shadow-sm">
                    <span className="text-4xl">👩‍❤️‍👨</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#005B48] border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-black text-slate-800 dark:text-slate-100 text-sm">Check your harmony</h4>
                  <p className="text-[10px] text-slate-550 dark:text-slate-400 font-bold leading-relaxed px-1">
                    Check your every situation, stress factors, and relationship activities.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => router.push("/checkin")}
                className="w-full py-3.5 rounded-2xl bg-[#005B48] hover:bg-[#004738] text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 uppercase tracking-wider"
              >
                Check It Now
              </button>

              {/* Cozy Illustration Card */}
              <div className="py-2">
                <div className="w-full overflow-hidden rounded-2xl border border-slate-105 dark:border-slate-800 shadow-xs bg-white dark:bg-[#0D1F2D]">
                  <img 
                    src="/category/couple.png" 
                    alt="Check Harmony" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* HARMONY METRICS */}
              <div className="text-left space-y-4 pt-2 border-t border-[#CDE5DB]/60 dark:border-[#005B48]/20">
                <h5 className="text-[10px] font-black text-[#005B48] dark:text-[#5FAF8A] uppercase tracking-wider">Harmony Metrics</h5>
                
                {/* Conversation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-200">
                    <span>Conversation</span>
                    <span className="font-extrabold text-[#005B48] dark:text-[#5FAF8A]">{communicationScore}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={communicationScore}
                    onChange={(e) => handleSliderChange("comm", parseInt(e.target.value))}
                    onMouseUp={(e) => handleSliderSave("comm", parseInt((e.target as HTMLInputElement).value))}
                    onTouchEnd={(e) => handleSliderSave("comm", parseInt((e.target as HTMLInputElement).value))}
                    className="w-full accent-[#005B48] dark:accent-[#5FAF8A] cursor-pointer h-1 bg-[#CDE5DB]/40 dark:bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                {/* Shared Energy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-200">
                    <span>Shared Energy</span>
                    <span className="font-extrabold text-[#005B48] dark:text-[#5FAF8A]">{energyLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={energyLevel}
                    onChange={(e) => handleSliderChange("energy", parseInt(e.target.value))}
                    onMouseUp={(e) => handleSliderSave("energy", parseInt((e.target as HTMLInputElement).value))}
                    onTouchEnd={(e) => handleSliderSave("energy", parseInt((e.target as HTMLInputElement).value))}
                    className="w-full accent-[#005B48] dark:accent-[#5FAF8A] cursor-pointer h-1 bg-[#CDE5DB]/40 dark:bg-slate-800 rounded-lg appearance-none"
                  />
                </div>

                {/* Tension Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-200">
                    <span>Tension Rate</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">{stressLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={stressLevel}
                    onChange={(e) => handleSliderChange("stress", parseInt(e.target.value))}
                    onMouseUp={(e) => handleSliderSave("stress", parseInt((e.target as HTMLInputElement).value))}
                    onTouchEnd={(e) => handleSliderSave("stress", parseInt((e.target as HTMLInputElement).value))}
                    className="w-full accent-rose-500 cursor-pointer h-1 bg-[#CDE5DB]/40 dark:bg-slate-800 rounded-lg appearance-none"
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
          </div>

          {/* ==================== COLUMN 2: CENTER SECTION (width: 6/12) ==================== */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Greeting Card - placed at the top of Center Column */}
            <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:border-slate-850 shadow-soft space-y-4 text-left">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-heading font-black text-slate-800 dark:text-slate-100">
                    Hi, Bloo
                  </h1>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold">
                    Let's track your relationship health daily!
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 text-[11px] font-extrabold text-[#005B48] dark:text-[#5FAF8A]">
                  <div className="flex items-center gap-1.5">
                    <span>Linked: <strong>{partnerName}</strong></span>
                    {isEditingPartner ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="text" 
                          value={tempPartnerName}
                          onChange={(e) => setTempPartnerName(e.target.value)}
                          className="px-1.5 py-0.5 bg-white dark:bg-[#0D1F2D] border border-slate-200 dark:border-slate-800 rounded text-[9px] focus:outline-none text-slate-800 dark:text-slate-100"
                        />
                        <button onClick={savePartnerName} className="px-1.5 py-0.5 bg-[#005B48] text-white text-[8px] font-bold rounded">Save</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setTempPartnerName(partnerName);
                          setIsEditingPartner(true);
                        }}
                        className="text-[9px] font-black underline hover:text-[#004738] dark:hover:text-[#82C3A6]"
                      >
                        (Edit)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Wellness Score & Current Streak side-by-side cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#E3F2EC] dark:bg-[#0E3529]/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 border border-[#CDE5DB]/40 dark:border-[#005B48]/30">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#005B48] dark:text-[#5FAF8A]">Wellness Score</span>
                  <span className="text-2xl font-black text-[#005B48] dark:text-[#5FAF8A]">{harmonyScore}%</span>
                  <span className="text-[8px] uppercase font-black text-[#005B48]/70 dark:text-[#5FAF8A]/75">
                    Level: {harmonyScore >= 80 ? "Flourishing" : harmonyScore >= 60 ? "Good" : harmonyScore >= 40 ? "Stable" : "Needs Focus"}
                  </span>
                </div>

                <div className="bg-[#FFFDF0] dark:bg-[#3B2C1B]/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 border border-[#F5C99B]/30 dark:border-[#D96A59]/30">
                  <span className="text-[9px] uppercase font-black tracking-wider text-[#D96A59] dark:text-[#F38A57]">Current Streak</span>
                  <span className="text-2xl font-black text-[#D96A59] dark:text-[#F38A57] flex items-center gap-1">Day {streakDays} 🔥</span>
                  <span className="text-[8px] uppercase font-black text-[#D96A59]/75 dark:text-[#F38A57]/75">Daily Check-in</span>
                </div>
              </div>
            </div>

            {/* Upcoming Appointment - shifted down below greeting card */}
            <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:bg-[#132E3F] dark:border-slate-850 shadow-soft space-y-4 text-left">
              <h3 className="text-[10px] font-black text-[#005B48] dark:text-[#5FAF8A] uppercase tracking-wider">Upcoming appointment</h3>
              
              {/* Hospital info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E3F2EC] dark:bg-[#0E3529]/40 flex items-center justify-center text-xl">
                  🏥
                </div>
                <div>
                  <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Manggis ST Hospital</h4>
                  <p className="text-[9px] text-slate-455 dark:text-slate-400 font-bold">New York, USA</p>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="flex justify-between items-center bg-[#E3F2EC]/30 dark:bg-[#0D1F2D]/50 border border-[#E3F2EC]/40 dark:border-slate-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-[#132E3F] flex items-center justify-center text-lg border border-slate-100 dark:border-slate-800">
                    👩‍⚕️
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Dr. Emilia Winson</h4>
                    <span className="text-[8px] text-[#005B48] dark:text-[#5FAF8A] font-black uppercase tracking-widest">Physiotherapy</span>
                  </div>
                </div>

                <button 
                  onClick={() => router.push("/call")}
                  className="px-4 py-1.5 rounded-full bg-[#005B48] hover:bg-[#004738] text-white font-black text-[9px] uppercase tracking-wider transition-all shadow-sm"
                >
                  Video call
                </button>
              </div>

              {/* Date & Time footer row */}
              <div className="flex justify-between items-center text-[10px] text-slate-550 dark:text-slate-400 font-bold border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#7C6BC4] text-sm">calendar_today</span>
                  <span>
                    {selectedDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#D96A59] text-sm">schedule</span>
                  <span>09.00 pm</span>
                </div>
              </div>
            </div>

            {/* Patient Activities card */}
            <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:border-slate-850 shadow-soft space-y-4 text-left">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-[#005B48] dark:text-[#5FAF8A] uppercase tracking-wider">Patient Activities</h3>
                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-350 bg-slate-50 dark:bg-[#0D1F2D] px-2 py-1 rounded-md cursor-pointer border border-slate-100 dark:border-slate-800">
                  Month ▾
                </div>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-400 font-extrabold block">Today, {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}</span>

              <div className="flex justify-between items-end h-32 pt-4 px-2">
                {[
                  { label: "Jul", value: 60 },
                  { label: "Aug", value: 40 },
                  { label: "Sep", value: 80 },
                  { label: "Oct", value: 50 },
                  { label: "Nov", value: 75 },
                  { label: "Dec", value: 80 },
                ].map((d, i) => (
                  <div key={i} className="flex flex-col items-center justify-end gap-2 flex-1">
                    <div className="w-full max-w-[28px] h-20 flex items-end bg-slate-50/10 dark:bg-slate-800/10 rounded-full overflow-hidden relative">
                      <div 
                        className={`w-full rounded-full transition-all duration-500 ${
                          d.label === "Dec" 
                            ? "bg-[#005B48] dark:bg-[#5FAF8A]" 
                            : "bg-[#D9EAE3] dark:bg-[#1E4A3F]"
                        }`} 
                        style={{ height: `${d.value}%` }} 
                      />
                      {d.label === "Dec" && (
                        <div className="absolute inset-0 bg-[#005B48]/15 dark:bg-[#5FAF8A]/15 rounded-full pointer-events-none" />
                      )}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-450">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Harmony Overview Pie chart card */}
            <div className="bg-white dark:bg-[#132E3F] p-6 rounded-[32px] border border-slate-100 dark:border-slate-850 shadow-soft space-y-4 text-left">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-[#005B48] dark:text-[#5FAF8A] uppercase tracking-wider">Overall Metrics</span>
                  <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100">Harmony Overview</h3>
                </div>
                {/* Mini chart graphic icon */}
                <div className="w-6 h-6 flex items-center justify-center bg-slate-50 dark:bg-[#0D1F2D] border border-slate-100 dark:border-slate-800 rounded-lg">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <rect x="3" y="12" width="4" height="8" rx="1" fill="#7C6BC4" />
                    <rect x="10" y="6" width="4" height="14" rx="1" fill="#F5C99B" />
                    <rect x="17" y="10" width="4" height="10" rx="1" fill="#E89E88" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
                <div className="relative w-36 h-36 mr-auto ml-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {greatEnd - greatStart > 0 && (
                      <path d={makePieSlicePath(greatStart, greatEnd)} fill="#005B48" />
                    )}
                    {goodEnd - goodStart > 0 && (
                      <path d={makePieSlicePath(goodStart, goodEnd)} fill="#82C3A6" />
                    )}
                    {normalEnd - normalStart > 0 && (
                      <path d={makePieSlicePath(normalStart, normalEnd)} fill="#F5C99B" />
                    )}
                    {notGoodEnd - notGoodStart > 0 && (
                      <path d={makePieSlicePath(notGoodStart, notGoodEnd)} fill="#E89E88" />
                    )}
                    {badEnd - badStart > 0 && (
                      <path d={makePieSlicePath(badStart, badEnd)} fill="#BA1A1A" />
                    )}
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-[#0D1F2D] flex flex-col items-center justify-center shadow-inner">
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">{harmonyScore}%</span>
                      <span className="text-[8px] font-black text-slate-400 dark:text-slate-555 uppercase tracking-widest">Harmony</span>
                    </div>
                  </div>

                  {/* Percentage Labels on top of slices */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {greatEnd - greatStart > 0.05 && (
                        <text x={getLabelCoordinates(greatStart, greatEnd).x} y={getLabelCoordinates(greatStart, greatEnd).y} fill="white" fontSize="5.5" fontWeight="900" textAnchor="middle">
                          {distribution.great}%
                        </text>
                      )}
                      {goodEnd - goodStart > 0.05 && (
                        <text x={getLabelCoordinates(goodStart, goodEnd).x} y={getLabelCoordinates(goodStart, goodEnd).y} fill="white" fontSize="5.5" fontWeight="900" textAnchor="middle">
                          {distribution.good}%
                        </text>
                      )}
                      {normalEnd - normalStart > 0.05 && (
                        <text x={getLabelCoordinates(normalStart, normalEnd).x} y={getLabelCoordinates(normalStart, normalEnd).y} fill="white" fontSize="5.5" fontWeight="900" textAnchor="middle">
                          {distribution.normal}%
                        </text>
                      )}
                      {notGoodEnd - notGoodStart > 0.05 && (
                        <text x={getLabelCoordinates(notGoodStart, notGoodEnd).x} y={getLabelCoordinates(notGoodStart, notGoodEnd).y} fill="white" fontSize="5.5" fontWeight="900" textAnchor="middle">
                          {distribution.notGood}%
                        </text>
                      )}
                      {badEnd - badStart > 0.05 && (
                        <text x={getLabelCoordinates(badStart, badEnd).x} y={getLabelCoordinates(badStart, badEnd).y} fill="white" fontSize="5.5" fontWeight="900" textAnchor="middle">
                          {distribution.bad}%
                        </text>
                      )}
                    </svg>
                  </div>
                </div>

                <div className="space-y-2 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#005B48] block" />
                    <span>Great ({distribution.great}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#82C3A6] block" />
                    <span>Good ({distribution.good}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#F5C99B] block" />
                    <span>Normal ({distribution.normal}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#E89E88] block" />
                    <span>Not Good ({distribution.notGood}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-[#BA1A1A] block" />
                    <span>Bad ({distribution.bad}%)</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ==================== COLUMN 3: RIGHT SIDE (width: 3/12) ==================== */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* List of appointments / Calendar Card */}
            <div className="bg-white dark:bg-[#132E3F] p-5 rounded-[36px] border border-slate-100 dark:border-slate-850 shadow-soft space-y-4 text-left">
              <h3 className="text-[10px] font-black text-[#005B48] dark:text-[#5FAF8A] uppercase tracking-wider">List of appointments</h3>
              
              <div className="space-y-4">
                {/* Tabs */}
                <div className="flex bg-slate-50 dark:bg-[#0D1F2D] p-1 rounded-full text-[9px] font-black text-slate-400 dark:text-slate-500">
                  <span className="flex-1 py-1.5 bg-[#005B48] text-white text-center rounded-full cursor-pointer shadow-xs">Monthly</span>
                  <span className="flex-1 py-1.5 text-center cursor-pointer hover:text-slate-650 dark:hover:text-slate-300 flex items-center justify-center">Daily</span>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-heading font-black text-[#0f172a] dark:text-slate-100">
                      {monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={handlePrevMonth} className="w-5 h-5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">chevron_left</span>
                      </button>
                      <button onClick={handleNextMonth} className="w-5 h-5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 text-center text-[9px] font-black text-slate-450 dark:text-slate-400 gap-y-2">
                    <div>S</div>
                    <div>M</div>
                    <div>T</div>
                    <div>W</div>
                    <div>T</div>
                    <div>F</div>
                    <div>S</div>
                    {calendarCells}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily progress gauge card */}
            <div className="bg-[#E3F2EC] dark:bg-[#0E3529]/20 rounded-[28px] p-5 shadow-soft-sm border border-[#CDE5DB]/40 dark:border-[#005B48]/20 flex justify-between items-center text-left">
              <div className="space-y-1">
                <h4 className="font-heading font-black text-slate-800 dark:text-slate-100 text-xs">Daily progress</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
                  Keep improving your connection quality
                </p>
              </div>
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    className="text-white/40 dark:text-slate-800/40"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="transition-all duration-1000 ease-out"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="#005B48"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-black text-slate-800 dark:text-slate-150">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Habits Checklist List */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-100/80 dark:border-slate-850/50 cursor-pointer shadow-soft-sm hover:scale-[1.01] transition-all select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      task.completed ? "bg-[#005B48] border-[#005B48] text-white" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0D1F2D]"
                    }`}>
                      {task.completed && <span className="material-symbols-outlined text-[10px] font-black">check</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10.5px] font-extrabold leading-snug ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-250"}`}>
                        {task.text.substring(2)}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400">Active Habit</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 text-xs font-black">chevron_right</span>
                </div>
              ))}
            </div>

            {/* Interactive Ideas Date Night Planner */}
            <div className="bg-[#E3F2EC] dark:bg-[#0E3529]/20 p-6 rounded-[32px] border border-[#CDE5DB]/40 dark:border-[#005B48]/20 shadow-soft space-y-4 text-left">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-black tracking-wider text-[#005B48] dark:text-[#5FAF8A]">Interactive Ideas</span>
                <h3 className="text-sm font-heading font-black text-slate-800 dark:text-slate-100">Tailored Date Idea 🥂</h3>
              </div>

              <div className="bg-white dark:bg-[#0D1F2D] border border-[#CDE5DB]/30 dark:border-slate-800 p-6 rounded-3xl min-h-[120px] flex flex-col items-center justify-center text-center shadow-xs relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDateIdea.title}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-col items-center justify-center text-center space-y-2"
                  >
                    <h4 className="font-heading font-black text-sm text-[#0f172a] dark:text-slate-150">{currentDateIdea.title}</h4>
                    <p className="text-[10px] text-slate-550 dark:text-slate-400 font-bold leading-relaxed max-w-[280px]">
                      {currentDateIdea.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={handleGenerateDate}
                disabled={isSpinning}
                className="w-full py-3 bg-[#005B48] hover:bg-[#004738] text-white rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSpinning ? "Drawing Date Idea... 🎲" : "GENERATE IDEA ✨"}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ==================== COMPLETE ASSESSMENT GATING MODAL ==================== */}
      <AnimatePresence>
        {showAssessmentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/85 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#132E3F] max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-[#EAEAFF] dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-[#7C6BC4]/10 text-[#7C6BC4] flex items-center justify-center mx-auto border border-[#7C6BC4]/20">
                <span className="material-symbols-outlined text-3xl font-black">assignment</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Onboarding Retreat</span>
                <h3 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100">Complete Assessment</h3>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-450 font-bold leading-relaxed px-2">
                To unlock your personalized Couples Dashboard, relationship habits checklist, and harmony tracking, please complete your initial assessment.
              </p>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    localStorage.setItem("parent_reset_assessment_flow", "true");
                    router.push("/assessment");
                  }}
                  className="w-full py-3.5 bg-[#7C6BC4] hover:bg-[#6A59B2] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm font-black">play_arrow</span>
                  Start Assessment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== CONFLICT CALM ZONE DIALOG ==================== */}
      <AnimatePresence>
        {calmZoneActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D283E]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#fdf7ff] max-w-md w-full p-8 rounded-[40px] border border-white/50 shadow-2xl space-y-6 relative text-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setCalmZoneActive(false);
                  setBreathingActive(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="space-y-1">
                <span className="px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                  Conflict Resolution Portal
                </span>
                <h3 className="text-2xl font-heading font-black text-on-surface pt-2">Empathy Pause</h3>
              </div>

              {/* Steps Area */}
              <div className="bg-white border border-surface-variant/20 p-6 rounded-3xl min-h-[220px] flex flex-col justify-between text-left">
                
                {/* Step 1: Mutual Pause & Breathing */}
                {calmStep === 1 && (
                  <div className="space-y-4 text-center">
                    <span className="text-3xl">🧘 Step 1: Synced Pause</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Slow down together</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Sit facing each other. Agree to hold a 1-minute silence. Click below to start the visual breathing guide.
                    </p>
                    
                    {breathingActive ? (
                      <div className="flex flex-col items-center space-y-2 pt-2">
                        <motion.div
                          animate={{
                            scale: breathingPhase === "Inhale" ? [1, 1.6] : breathingPhase === "Hold" ? 1.6 : [1.6, 1],
                          }}
                          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-500 ${
                            breathingPhase === "Inhale" ? "bg-emerald-200/50" : breathingPhase === "Hold" ? "bg-amber-100" : "bg-primary/25"
                          }`}
                        />
                        <span className="text-xs font-black text-on-surface">{breathingPhase} ({breathingSeconds}s)</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setBreathingActive(true);
                          setBreathingPhase("Inhale");
                          setBreathingSeconds(4);
                        }}
                        className="px-4 py-2 bg-[#005B48] text-white text-xs font-bold rounded-full shadow-xs active:scale-95"
                      >
                        Start Breathing Guide 🌀
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: "I Feel" Statements */}
                {calmStep === 2 && (
                  <div className="space-y-2">
                    <span className="text-3xl">🗣️ Step 2: Share Feelings</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Use "I Feel" phrasing</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      One partner shares their perspective using "I feel" instead of accusing "You did". 
                      <br /><br />
                      <em>Example: "I feel unheard when decisions are made without talking first," instead of "You never include me."</em>
                    </p>
                  </div>
                )}

                {/* Step 3: Mirror & Validate */}
                {calmStep === 3 && (
                  <div className="space-y-2">
                    <span className="text-3xl">🗣️ Step 3: Mirror & Validate</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Repeat back what you heard</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Before defending or replying, mirror your partner's feelings to ensure they feel heard.
                      <br /><br />
                      <em>Example: "What I hear you saying is that you felt stressed because you wanted to make that choice together. Is that right?"</em>
                    </p>
                  </div>
                )}

                {/* Step 4: Small Solutions */}
                {calmStep === 4 && (
                  <div className="space-y-2">
                    <span className="text-3xl">🤝 Step 4: Small Agreement</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Find a shared micro-action</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Co-create one small action you can both agree on to ease the situation right now. It doesn't have to fix the whole issue, just resolve the immediate tension.
                    </p>
                  </div>
                )}

                {/* Progress Indicators */}
                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === calmStep ? "w-6 bg-rose-500" : "w-1.5 bg-surface-container"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex gap-4">
                {calmStep > 1 && (
                  <button 
                    onClick={() => {
                      setCalmStep(prev => prev - 1);
                      setBreathingActive(false);
                    }}
                    className="flex-1 py-3 bg-surface-container text-on-surface rounded-full font-bold text-xs hover:bg-surface-container-high transition-transform active:scale-95"
                  >
                    Back
                  </button>
                )}
                
                {calmStep < 4 ? (
                  <button 
                    onClick={() => {
                      setCalmStep(prev => prev + 1);
                      setBreathingActive(false);
                    }}
                    className="flex-1 py-3 bg-[#005B48] hover:bg-[#004738] text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setCalmZoneActive(false);
                      setBreathingActive(false);
                      const lowTension = 2;
                      setStressLevel(lowTension);
                      const newHarmony = calculateHarmonyScore(communicationScore, energyLevel, lowTension);
                      setHarmonyScore(newHarmony);
                      saveDashboardStateToDB({
                        stressLevel: lowTension,
                        harmonyScore: newHarmony
                      });
                    }}
                    className="flex-1 py-3 bg-[#005B48] text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95 animate-bounce"
                  >
                    We Are Calmer Now 💖
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== DISCONNECT SESSION CONFIRMATION MODAL ==================== */}
      <AnimatePresence>
        {showDisconnectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs select-none"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-100 dark:border-slate-800 rounded-[32px] max-w-sm w-full p-6 text-center shadow-2xl space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/30">
                <span className="material-symbols-outlined text-3xl font-black">logout</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4] dark:text-purple-300">Session Warning</span>
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

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-2">
                Everything you write, journal, and share inside Manraah remains private. This is your personal space to reflect honestly and safely with your partner.
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
                className="w-full py-4 bg-[#005B48] hover:bg-[#004738] text-white rounded-full font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                I Understand 💚
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
