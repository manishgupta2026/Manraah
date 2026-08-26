"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

// Calendar helper details
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Initial Tasks/Habits checklist
const INITIAL_HABITS = [
  { id: 1, text: "Share one genuine appreciation with your partner today", category: "Active Habit", completed: false },
  { id: 2, text: "Complete a 3-minute synchronized breathing pause together", category: "Active Habit", completed: false },
  { id: 3, text: "Set devices to 'Do Not Disturb' for at least 1 hour of quality time", category: "Active Habit", completed: false },
  { id: 4, text: "Leave a sweet or supportive note in their physical/digital journal", category: "Active Habit", completed: false }
];

// Tailored Date ideas
const DATE_NIGHT_IDEAS = [
  { category: "Cozy 🏡", title: "Indoor Fort & Movie", desc: "Build a classic living-room blanket fort, make homemade popcorn, and watch a nostalgic movie." },
  { category: "Creative 🎨", title: "Double-Sided Canvas Painting", desc: "Buy two canvases. Set up opposite each other and paint a portrait of your partner without looking at the canvas!" },
  { category: "Culinary 🍳", title: "Mystery Ingredient Cook-off", desc: "Assign each other 2 secret ingredients. Work together to cook a 3-course dinner utilizing all of them." },
  { category: "Adventure 🌌", title: "Midnight Stargazing & Picnic", desc: "Pack a thermos of hot cocoa, a heavy blanket, and drive to a local high point or open field to watch the night sky." },
  { category: "Active 🚶", title: "Memory Walk & Photo Hunt", desc: "Walk through a neighborhood that has meaning to your relationship, recreating past photos or capturing new ones." }
];

export default function CouplesDashboard() {
  const router = useRouter();

  // Core Authentication & Session States
  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState("Bloo");
  const [partnerName, setPartnerName] = useState("Elena");
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [tempPartnerName, setTempPartnerName] = useState("Elena");
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Gating & Onboarding Modals
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Streak & Harmony Metrics
  const [streakDays, setStreakDays] = useState(1);
  const [streakBroken, setStreakBroken] = useState(false);
  const [harmonyScore, setHarmonyScore] = useState(90);

  // Sliders metrics
  const [conversationScore, setConversationScore] = useState(8);
  const [sharedEnergyScore, setSharedEnergyScore] = useState(7);
  const [tensionRateScore, setTensionRateScore] = useState(3);

  // Checklist of Relationship Habits
  const [habits, setHabits] = useState(INITIAL_HABITS);

  // Calendar & Appointments State
  const [activeTab, setActiveTab] = useState<"monthly" | "daily">("monthly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2022, 9, 6)); // Default to October 6, 2022
  const [currentYear, setCurrentYear] = useState(2022);
  const [currentMonth, setCurrentMonth] = useState(9); // October is index 9
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  
  // Custom interactive appointments list
  const [appointments, setAppointments] = useState<any[]>([
    { id: 1, date: "2022-10-14", title: "Manggis ST Hospital", desc: "New York, USA", doctor: "Dr. Emilia Winson", time: "09.00 pm", type: "medical", videoCall: true },
    { id: 2, date: "2022-10-06", title: "Blanket Fort Movie Night", desc: "Cozy Living Room", doctor: "Elena & Bloo", time: "08.30 pm", type: "date", videoCall: false },
    { id: 3, date: "2022-10-22", title: "Canvas Painting Date", desc: "Artistic Studio", doctor: "Art Instructor", time: "07.00 pm", type: "class", videoCall: false }
  ]);

  // Add Appointment form input states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTime, setNewTime] = useState("08.00 pm");
  const [newType, setNewType] = useState("date");

  // Date Night Generator states
  const [currentDateIdea, setCurrentDateIdea] = useState(DATE_NIGHT_IDEAS[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  // Conflict Calm Zone modal states
  const [calmZoneActive, setCalmZoneActive] = useState(false);
  const [calmStep, setCalmStep] = useState(1);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Daily Connection Check-in Modal inputs
  const [selectedMood, setSelectedMood] = useState("Good");
  const [checkedActivities, setCheckedActivities] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [savingCheckin, setSavingCheckin] = useState(false);

  // Activities list for check-in form
  const checkinActivitiesList = [
    "Had a quality heart-to-heart conversation",
    "Spent focused screen-free time together",
    "Synchronized breathing or meditation pause",
    "Exchanged a sincere compliment/appreciation",
    "Resolved a disagreement with mutual empathy"
  ];

  // Synchronized breathing timer loop inside Calm Zone
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

  // Fetch initial dashboard state & check assessment completion status on mount
  useEffect(() => {
    const activeSession = getClientSession();
    setSession(activeSession);

    fetch("/api/dashboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load dashboard data");
      })
      .then((data) => {
        setDashboardData(data);
        if (data.user) {
          // Sync real username & partner name
          if (data.user.sanctuaryName || data.user.name) {
            setUserName(data.user.sanctuaryName || data.user.name);
          }

          // Check if assessment completed
          const localAssessmentCompleted = localStorage.getItem("couple_assessment_completed") === "true";
          const assessmentModalDismissed = localStorage.getItem("couple_assessment_modal_dismissed") === "true";
          const hasCoupleAssessment = (data.user.assessmentPercentage !== null && 
                                       data.user.assessmentPercentage !== undefined && 
                                       (data.user.assessmentCategory === "couples" || data.user.assessmentCategory === "couple")) || localAssessmentCompleted;

          if (hasCoupleAssessment || assessmentModalDismissed) {
            setHarmonyScore(data.user.assessmentPercentage || 90);
            
            // Show Retreat Privacy popup if not shown before
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

          // Check if streak is broken (diffDays > 1 since last check-in)
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
          } else {
            setStreakBroken(false);
          }

          // Restore streak days (0 if broken)
          const backendStreak = isBroken ? 0 : (data.streak?.currentStreak || data.user.streakDays || 1);
          setStreakDays(backendStreak);

          // Restore persisted dashboard states from database
          const ds = data.user.dashboardState;
          if (ds && typeof ds === "object") {
            if (ds.selectedMood) setSelectedMood(ds.selectedMood);
            if (ds.conversationScore !== undefined) setConversationScore(ds.conversationScore);
            if (ds.sharedEnergyScore !== undefined) setSharedEnergyScore(ds.sharedEnergyScore);
            if (ds.tensionRateScore !== undefined) setTensionRateScore(ds.tensionRateScore);
            if (ds.checkedActivities) setCheckedActivities(ds.checkedActivities);
            if (ds.reflectionText) setReflectionText(ds.reflectionText);
            if (ds.habits && Array.isArray(ds.habits)) {
              setHabits(ds.habits);
            }
            if (ds.appointments && Array.isArray(ds.appointments)) {
              setAppointments(ds.appointments);
            }
          }
        }
      })
      .catch((err) => {
        console.error("[Dashboard Fetch Error]:", err);
      });

    const storedPartner = localStorage.getItem("couple_partner_name") || "Elena";
    setPartnerName(storedPartner);
    setTempPartnerName(storedPartner);
  }, []);

  // Save Link Partner Name
  const savePartnerName = () => {
    if (!tempPartnerName.trim()) return;
    setPartnerName(tempPartnerName.trim());
    localStorage.setItem("couple_partner_name", tempPartnerName.trim());
    setIsEditingPartner(false);
  };

  // Toggle Habit completion
  const toggleHabit = (id: number) => {
    const updated = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updated);
    saveDashboardStateToDb({ habits: updated });
  };

  // Save checklist/sliders state back to server
  const saveDashboardStateToDb = async (updatedFields: any) => {
    if (!session?.user?.id) return;
    const previousState = dashboardData?.user?.dashboardState || {};
    const mergedState = {
      ...previousState,
      selectedMood,
      conversationScore,
      sharedEnergyScore,
      tensionRateScore,
      checkedActivities,
      reflectionText,
      habits,
      appointments,
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
      console.error("[Failed to sync dashboardState]:", err);
    }
  };

  // Log Daily Check-in Form submission
  const handleCheckinSubmit = async () => {
    if (!session?.user?.id) return;
    setSavingCheckin(true);

    try {
      const moodRes = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          score: selectedMood === "Great" ? 5 : selectedMood === "Good" ? 4 : selectedMood === "Normal" ? 3 : selectedMood === "Not Good" ? 2 : 1,
          notes: `[Mood Checkin]: ${selectedMood}. Connection Activities: ${checkedActivities.join(", ") || "None"}. Reflections: ${reflectionText}`
        })
      });

      const checkinRes = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          mood: selectedMood,
          stress: tensionRateScore,
          activities: checkedActivities,
          notes: reflectionText
        })
      });

      if (moodRes.ok && checkinRes.ok) {
        localStorage.setItem("couple_assessment_completed", "true");
        await saveDashboardStateToDb({
          selectedMood,
          checkedActivities,
          reflectionText
        });
        setShowCheckinModal(false);
      }
    } catch (err) {
      console.error("[Check-in save error]:", err);
    } finally {
      setSavingCheckin(false);
    }
  };

  // Add a new appointment to calendar
  const handleAddAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    const newEntry = {
      id: Date.now(),
      date: dateString,
      title: newTitle.trim(),
      desc: newDesc.trim(),
      doctor: newType === "medical" ? "Medical Care Team" : `${userName} & ${partnerName}`,
      time: newTime,
      type: newType,
      videoCall: newType === "medical"
    };

    const updatedAppointments = [...appointments, newEntry];
    setAppointments(updatedAppointments);
    saveDashboardStateToDb({ appointments: updatedAppointments });

    // Reset inputs
    setNewTitle("");
    setNewDesc("");
    setNewTime("08.00 pm");
    setNewType("date");
    setShowAddAppointment(false);
  };

  // Helper: Find appointments for specific date
  const getAppointmentsForDate = (date: Date) => {
    const formattedStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return appointments.filter(app => app.date === formattedStr);
  };

  // Find the closest upcoming chronological appointment to show in middle column
  const getUpcomingAppointment = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureApps = appointments
      .map(app => ({ ...app, dateObj: new Date(app.date) }))
      .filter(app => app.dateObj >= today)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    return futureApps.length > 0 ? futureApps[0] : null;
  };

  const upcomingApp = getUpcomingAppointment();

  // Calculations for connection progress
  const completedHabitsCount = habits.filter(h => h.completed).length;
  const habitsProgressPercent = habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;

  // Calendar grid construction logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Spin/Generate a new tailored date idea
  const handleGenerateDate = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * DATE_NIGHT_IDEAS.length);
      setCurrentDateIdea(DATE_NIGHT_IDEAS[randomIdx]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 120);
  };

  // Solid Pie Chart calculations (Harmony Overview)
  const getPieBreakdown = (score: number) => {
    const s = Math.min(50, Math.max(10, score / 2));
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
    const greatVal = distribution.great / 100;
    const goodVal = distribution.good / 100;
    const normalVal = distribution.normal / 100;
    const notGoodVal = distribution.notGood / 100;
    const badVal = distribution.bad / 100;

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
    const x = 50 + 32 * Math.cos(angle);
    const y = 50 + 32 * Math.sin(angle) + 2.5;
    return { x: x.toFixed(1), y: y.toFixed(1) };
  };

  return (
    <div className="min-h-screen bg-[#FCF8FB] p-3 md:p-6 text-slate-800 font-sans relative">
      
      <div className="z-10 relative space-y-6 max-w-7xl mx-auto">
        
        {/* ==================== TOP NAVIGATION CONTROLS ==================== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <button 
            onClick={() => setShowDisconnectModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-xs font-extrabold text-[#7C6BC4] border border-[#ECE5F5] shadow-sm hover:bg-slate-50 transition-all cursor-pointer w-fit"
          >
            <span className="material-symbols-outlined text-xs font-black">arrow_back</span>
            Back to home
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => {
                localStorage.removeItem("couple_assessment_completed");
                localStorage.removeItem("couple_assessment_modal_dismissed");
                localStorage.setItem("couple_reset_assessment_flow", "true");
                router.push("/assessment");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-xs font-extrabold text-[#D66B60] border border-[#FADCD9] hover:bg-rose-50/50 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-black">assignment</span>
              Retake Assessment
            </button>

            <button 
              onClick={() => {
                setCalmStep(1);
                setCalmZoneActive(true);
                setBreathingActive(false);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-xs font-extrabold text-[#9A6293] border border-[#F2D7EE] hover:bg-[#F2D7EE]/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs font-black">security</span>
              Empathy calm zone
            </button>

            <span className="px-4 py-2 rounded-full bg-[#E5F9F4] text-[#006B56] text-[10px] font-black uppercase tracking-wider border border-[#BFF3E7] flex items-center gap-1">
              <span>🔒 PRIVATE RETREAT CONNECTION</span>
            </span>
          </div>

        </div>

        {/* ==================== STREAK BROKEN BANNER ==================== */}
        {streakBroken && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#FFF2F2] border border-[#FADCD9] rounded-3xl p-4 flex items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🌱</span>
              <div>
                <h5 className="font-heading font-black text-xs text-[#D64E4D]">You broke your streak!</h5>
                <p className="text-[10px] text-[#A65B5B] font-bold leading-normal">
                  Don't worry, wellness is a continuous journey. Check in today to start a fresh streak!
                </p>
              </div>
            </div>
            <button 
              onClick={() => setStreakBroken(false)}
              className="text-[#D64E4D] font-bold text-xs hover:opacity-80"
            >
              dismiss
            </button>
          </motion.div>
        )}

        {/* ==================== THREE COLUMN GRID LAYOUT ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: LEFT SIDEBAR (MINT DESIGN) - 3/12 */}
          <div className="lg:col-span-3 bg-[#E5F5F0] rounded-[40px] p-6 border border-[#CDEAE1] flex flex-col justify-between space-y-6 shadow-sm min-h-[680px]">
            
            {/* Header / Condition check block */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full rounded-full bg-[#FCE3CF]/80 border-4 border-white flex items-center justify-center text-4xl shadow-sm">
                    💑
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 bg-[#006B56] border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-black text-slate-800 text-sm">Check your harmony</h4>
                  <p className="text-[10px] text-slate-600 font-bold leading-relaxed px-1">
                    Check your every situation, stress factors, and relationship activities.
                  </p>
                </div>
              </div>

              {/* Action check-in button */}
              <button 
                onClick={() => setShowCheckinModal(true)}
                className="w-full py-3 rounded-2xl bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                Check It Now
              </button>

              {/* Mockup Illustration artwork */}
              <div className="bg-[#FEF6EB] p-4 rounded-3xl border border-[#F7E7D0] flex flex-col items-center justify-center relative overflow-hidden">
                <img src="/category/couple.png" alt="Couple Illustration" className="h-32 object-contain rounded-2xl" />
              </div>
            </div>

            {/* Harmony Metrics sliders */}
            <div className="space-y-4 pt-4 border-t border-[#CDEAE1]/60">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#006B56]">Harmony Metrics</span>
              
              {/* Slider 1: Conversation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black text-[#006B56]">
                  <span className="flex items-center gap-1">💬 Conversation</span>
                  <span>{conversationScore}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={conversationScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setConversationScore(val);
                    saveDashboardStateToDb({ conversationScore: val });
                  }}
                  className="w-full accent-[#006B56] cursor-pointer"
                />
              </div>

              {/* Slider 2: Shared Energy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black text-[#006B56]">
                  <span className="flex items-center gap-1">⚡ Shared Energy</span>
                  <span>{sharedEnergyScore}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={sharedEnergyScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSharedEnergyScore(val);
                    saveDashboardStateToDb({ sharedEnergyScore: val });
                  }}
                  className="w-full accent-[#006B56] cursor-pointer"
                />
              </div>

              {/* Slider 3: Tension Rate (Reddish/rose accent) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black text-[#D64E4D]">
                  <span className="flex items-center gap-1">⚠️ Tension Rate</span>
                  <span>{tensionRateScore}/10</span>
                </div>
                <input 
                  type="range" min="1" max="10" 
                  value={tensionRateScore}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTensionRateScore(val);
                    saveDashboardStateToDb({ tensionRateScore: val });
                  }}
                  className="w-full accent-[#D64E4D] cursor-pointer"
                />
              </div>

            </div>

          </div>

          {/* COLUMN 2: MIDDLE COLUMN (WELCOME & CLINICAL LOG & OVERALL PIE) - 5/12 */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Welcome Greeting block */}
            <div className="bg-white border border-slate-100 p-6 rounded-[36px] shadow-soft-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-heading font-black text-slate-800">Hi, {userName}</h2>
                  <p className="text-[11px] text-slate-400 font-bold">Let's track your relationship health daily!</p>
                </div>
                
                {/* Link Partner control */}
                <div className="text-right">
                  {isEditingPartner ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={tempPartnerName}
                        onChange={(e) => setTempPartnerName(e.target.value)}
                        className="px-2 py-0.5 bg-slate-50 border border-[#ECE5F5] rounded text-[10px] text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-[#7C6BC4] w-20"
                      />
                      <button onClick={savePartnerName} className="text-[9px] font-black text-[#7C6BC4] uppercase hover:underline">Save</button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-600 font-bold">
                      Linked: <span className="text-[#7C6BC4] font-black">{partnerName}</span>{" "}
                      <button 
                        onClick={() => {
                          setTempPartnerName(partnerName);
                          setIsEditingPartner(true);
                        }} 
                        className="text-[#7C6BC4] font-black underline hover:opacity-85"
                      >
                        (Edit)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Streak info */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Streak Progress</span>
                <span className="px-3 py-1 rounded-full bg-[#FFF2EA] text-[#E37A47] font-black text-[10px] tracking-wide flex items-center gap-1.5">
                  Day {streakDays} Streak 🔥
                </span>
              </div>
            </div>

            {/* Upcoming Appointment card */}
            <div className="bg-white border border-slate-100 p-6 rounded-[36px] shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Upcoming Appointment</span>
                <span className="text-xs">📅</span>
              </div>

              {upcomingApp ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#EAEAFF] text-[#7C6BC4] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      🏥
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-black text-sm text-slate-800">{upcomingApp.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{upcomingApp.desc}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-[#F9FBFF] p-4 rounded-3xl border border-[#EDF3FF]">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-[#E5ECFF] text-[10px] flex items-center justify-center">👨‍⚕️</span>
                      <div>
                        <p className="text-[10px] font-black text-slate-700">{upcomingApp.doctor}</p>
                        <p className="text-[9px] text-[#006B56] font-black uppercase tracking-wider">PHYSIOTHERAPY</p>
                      </div>
                    </div>

                    {upcomingApp.videoCall && (
                      <button className="px-4 py-1.5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-[9px] uppercase tracking-wider shadow-sm transition-all">
                        Video Call
                      </button>
                    )}
                  </div>

                  {/* Time Footer */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px] font-black">calendar_today</span>{upcomingApp.date}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px] font-black">schedule</span>{upcomingApp.time}</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-[11px] text-slate-400 font-bold space-y-2">
                  <p>No upcoming appointments found.</p>
                  <button 
                    onClick={() => {
                      setActiveTab("monthly");
                      setShowAddAppointment(true);
                    }}
                    className="text-[#7C6BC4] hover:underline"
                  >
                    + Add New Appointment
                  </button>
                </div>
              )}
            </div>

            {/* Patient Activities chart widget */}
            <div className="bg-white border border-slate-100 p-6 rounded-[36px] shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Patient Activities</span>
                <span className="text-[9px] text-slate-400 font-bold border border-slate-100 rounded-md px-2 py-0.5 bg-slate-50/50">Month ▾</span>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold">Today, 5 October 2022</p>
              </div>

              {/* Connection Rating bar chart */}
              <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { day: "Jul", score: 6 },
                  { day: "Aug", score: 5 },
                  { day: "Sep", score: 9 },
                  { day: "Oct", score: 7 },
                  { day: "Nov", score: 8 },
                  { day: "Dec", score: 8 }
                ].map((d, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center h-20">
                      <div className="w-6 bg-[#CDEAE1] rounded-t-lg transition-all duration-300" style={{ height: `${d.score * 10}%` }} title={`Rating: ${d.score}`} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-black">{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Metrics - Harmony Overview Pie Chart (Mockup Alignment) */}
            <div className="bg-white border border-slate-100 p-6 rounded-[36px] shadow-soft-sm space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#006B56]">Overall Metrics</span>
                  <h3 className="text-sm font-heading font-black text-slate-800">Harmony Overview</h3>
                </div>
                <span className="text-xl">📊</span>
              </div>

              {/* Chart & Legend Grid */}
              <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
                
                {/* SVG Pie Chart */}
                <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Great Slice */}
                    {distribution.great > 0 && (
                      <path d={makePieSlicePath(greatStart, greatEnd)} fill="#006B56" />
                    )}
                    {/* Good Slice */}
                    {distribution.good > 0 && (
                      <path d={makePieSlicePath(goodStart, goodEnd)} fill="#5FCFB0" />
                    )}
                    {/* Normal Slice */}
                    {distribution.normal > 0 && (
                      <path d={makePieSlicePath(normalStart, normalEnd)} fill="#FCE3CF" />
                    )}
                    {/* Not Good Slice */}
                    {distribution.notGood > 0 && (
                      <path d={makePieSlicePath(notGoodStart, notGoodEnd)} fill="#E37A47" />
                    )}
                    {/* Bad Slice */}
                    {distribution.bad > 0 && (
                      <path d={makePieSlicePath(badStart, badEnd)} fill="#D64E4D" />
                    )}
                  </svg>

                  {/* Percentage Labels overlay inside slices */}
                  <div className="absolute inset-0 pointer-events-none text-[8px] font-black text-slate-800">
                    {distribution.great >= 5 && (
                      <span className="absolute" style={{ left: `${getLabelCoordinates(greatStart, greatEnd).x}%`, top: `${getLabelCoordinates(greatStart, greatEnd).y}%`, transform: "translate(-50%, -50%)" }}>
                        {distribution.great}%
                      </span>
                    )}
                    {distribution.good >= 5 && (
                      <span className="absolute" style={{ left: `${getLabelCoordinates(goodStart, goodEnd).x}%`, top: `${getLabelCoordinates(goodStart, goodEnd).y}%`, transform: "translate(-50%, -50%)" }}>
                        {distribution.good}%
                      </span>
                    )}
                    {distribution.normal >= 5 && (
                      <span className="absolute" style={{ left: `${getLabelCoordinates(normalStart, normalEnd).x}%`, top: `${getLabelCoordinates(normalStart, normalEnd).y}%`, transform: "translate(-50%, -50%)" }}>
                        {distribution.normal}%
                      </span>
                    )}
                    {distribution.notGood >= 5 && (
                      <span className="absolute text-white" style={{ left: `${getLabelCoordinates(notGoodStart, notGoodEnd).x}%`, top: `${getLabelCoordinates(notGoodStart, notGoodEnd).y}%`, transform: "translate(-50%, -50%)" }}>
                        {distribution.notGood}%
                      </span>
                    )}
                    {distribution.bad >= 5 && (
                      <span className="absolute text-white" style={{ left: `${getLabelCoordinates(badStart, badEnd).x}%`, top: `${getLabelCoordinates(badStart, badEnd).y}%`, transform: "translate(-50%, -50%)" }}>
                        {distribution.bad}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Legends */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[10px] font-bold text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#006B56] flex-shrink-0" />
                    <span>Great</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#5FCFB0] flex-shrink-0" />
                    <span>Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#FCE3CF] flex-shrink-0" />
                    <span>Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#E37A47] flex-shrink-0" />
                    <span>Not Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-[#D64E4D] flex-shrink-0" />
                    <span>Bad</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* COLUMN 3: RIGHT COLUMN (CALENDAR & HABITS & INTERACTIVE IDEAS) - 4/12 */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* List of Appointments Calendar Widget */}
            <div className="bg-white border border-slate-100 p-5 rounded-[36px] shadow-soft-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">List of Appointments</span>
              </div>

              {/* Monthly/Daily Tabs */}
              <div className="bg-slate-100/50 p-1 rounded-2xl flex gap-1 border border-slate-200/20">
                <button 
                  onClick={() => { setActiveTab("monthly"); setShowAddAppointment(false); }}
                  className={`flex-1 py-2 text-center rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "monthly" ? "bg-[#006B56] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => { setActiveTab("daily"); setShowAddAppointment(false); }}
                  className={`flex-1 py-2 text-center rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === "daily" ? "bg-[#006B56] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Daily
                </button>
              </div>

              {/* Tab: Monthly (Show Calendar) */}
              {activeTab === "monthly" && !showAddAppointment && (
                <div className="space-y-4">
                  {/* Calendar Month Header */}
                  <div className="flex justify-between items-center px-1">
                    <span className="font-heading font-black text-xs text-slate-800">{MONTH_NAMES[currentMonth]} {currentYear}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={handlePrevMonth} className="material-symbols-outlined text-sm font-bold text-slate-400 hover:text-slate-700 cursor-pointer select-none">chevron_left</button>
                      <button onClick={handleNextMonth} className="material-symbols-outlined text-sm font-bold text-slate-400 hover:text-slate-700 cursor-pointer select-none">chevron_right</button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-y-2 text-center">
                    {/* Weekdays */}
                    {WEEKDAYS.map((w, idx) => (
                      <span key={idx} className="text-[9px] text-slate-400 font-bold">{w}</span>
                    ))}
                    
                    {/* Empty starting padding days */}
                    {Array.from({ length: firstDayIndex }).map((_, idx) => (
                      <span key={`empty-${idx}`} />
                    ))}

                    {/* Active Days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const dateObj = new Date(currentYear, currentMonth, dayNumber);
                      const isSelected = selectedDate.getDate() === dayNumber && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
                      
                      // Highlight dates containing scheduled appointments
                      const hasAppointments = getAppointmentsForDate(dateObj).length > 0;

                      return (
                        <div key={dayNumber} className="flex justify-center items-center h-6">
                          <button 
                            onClick={() => setSelectedDate(dateObj)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer transition-all ${
                              isSelected 
                                ? "bg-[#E37A47] text-white font-extrabold shadow-sm" 
                                : hasAppointments 
                                  ? "bg-[#E5F5F0] text-[#006B56] border border-[#CDEAE1]/60" 
                                  : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {dayNumber}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Date Appointments List */}
                  <div className="pt-2 border-t border-slate-50 space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                      <span>Schedule: {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]}</span>
                      <button 
                        onClick={() => setShowAddAppointment(true)} 
                        className="text-[#7C6BC4] hover:underline"
                      >
                        + Add
                      </button>
                    </div>

                    {getAppointmentsForDate(selectedDate).length > 0 ? (
                      getAppointmentsForDate(selectedDate).map((app) => (
                        <div key={app.id} className="p-3 rounded-2xl bg-[#F9FBFF] border border-[#EDF3FF] flex items-center justify-between">
                          <div className="space-y-0.5 text-left">
                            <h5 className="text-[10px] font-black text-slate-800">{app.title}</h5>
                            <p className="text-[9px] text-slate-400 font-bold">{app.desc} ({app.time})</p>
                          </div>
                          <span className="text-[10px]">🥂</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold py-1">No activities set on this date.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Daily (Show Today's Schedule Overview) */}
              {activeTab === "daily" && !showAddAppointment && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase">
                    <span>Active Appointments List</span>
                    <button onClick={() => setShowAddAppointment(true)} className="text-[#7C6BC4] hover:underline">+ Add</button>
                  </div>

                  {appointments.length > 0 ? (
                    appointments.map(app => (
                      <div key={app.id} className="p-3 rounded-2xl border border-slate-100 space-y-1 text-left">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${app.type === 'medical' ? 'bg-[#E5F5F0] text-[#006B56]' : 'bg-[#FFF2EA] text-[#E37A47]'}`}>{app.type}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{app.date}</span>
                        </div>
                        <h5 className="text-[10px] font-black text-slate-800">{app.title}</h5>
                        <p className="text-[9px] text-slate-400 font-bold leading-normal">{app.desc} • {app.time}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold py-4 text-center">No active appointments set.</p>
                  )}
                </div>
              )}

              {/* Sub-State: Add Appointment Form */}
              {showAddAppointment && (
                <form onSubmit={handleAddAppointmentSubmit} className="space-y-3.5 text-left border border-slate-100 p-4 rounded-3xl bg-slate-50/20">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">New Appointment</span>
                    <button type="button" onClick={() => setShowAddAppointment(false)} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cinema Date Night" 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-[#7C6BC4]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase">Location / Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Regal Theater, NY" 
                      value={newDesc} 
                      onChange={e => setNewDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-[#7C6BC4]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Time</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 08.30 pm" 
                        value={newTime} 
                        onChange={e => setNewTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-[#7C6BC4]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">Type</label>
                      <select 
                        value={newType} 
                        onChange={e => setNewType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-[#7C6BC4]"
                      >
                        <option value="date">Date Night</option>
                        <option value="medical">Medical / Therapy</option>
                        <option value="class">Learning Class</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-xs transition-all cursor-pointer shadow-sm text-center"
                  >
                    Save Appointment
                  </button>
                </form>
              )}

            </div>

            {/* Daily Progress circle card */}
            <div className="bg-[#E5F5F0] border border-[#CDEAE1] p-6 rounded-[36px] shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h4 className="text-sm font-heading font-black text-slate-800">Daily progress</h4>
                <p className="text-[10px] text-slate-500 font-bold leading-normal">Keep improving your connection quality</p>
              </div>

              {/* Progress Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#CBECE2" strokeWidth="4.5" fill="transparent" />
                  <circle 
                    cx="32" cy="32" r="26" stroke="#006B56" strokeWidth="4.5" fill="transparent" 
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * habitsProgressPercent) / 100}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800">{habitsProgressPercent}%</span>
              </div>
            </div>

            {/* Daily Habits checklist */}
            <div className="space-y-3">
              {habits.map((habit) => (
                <div 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className="flex items-center justify-between p-4 rounded-3xl bg-white border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer shadow-soft-sm select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      habit.completed ? "bg-[#006B56] border-[#006B56] text-white" : "border-slate-300 bg-white"
                    }`}>
                      {habit.completed && <span className="material-symbols-outlined text-xs font-bold">check</span>}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <h5 className={`text-[10px] font-black leading-relaxed ${habit.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                        {habit.text}
                      </h5>
                      <p className="text-[8px] text-slate-400 font-bold">{habit.category}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-xs font-bold">chevron_right</span>
                </div>
              ))}
            </div>

            {/* Interactive Ideas - Tailored Date Idea (Mockup Alignment) */}
            <div className="bg-[#E5F5F0]/65 p-6 rounded-[36px] border border-[#CDEAE1]/60 shadow-sm space-y-5 text-left">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#006B56]">Interactive Ideas</span>
                <h3 className="text-sm font-heading font-black text-slate-800">Tailored Date Idea 🥂</h3>
              </div>

              <div className="bg-white border border-slate-100 p-5 rounded-3xl min-h-[120px] flex flex-col justify-between shadow-sm relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDateIdea.title}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-1 text-left"
                  >
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF2EA] text-[#E37A47] text-[8px] font-black uppercase tracking-wider">
                      {currentDateIdea.category}
                    </span>
                    <h4 className="font-heading font-black text-xs text-slate-800 pt-1">{currentDateIdea.title}</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                      {currentDateIdea.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={handleGenerateDate}
                disabled={isSpinning}
                className="w-full py-3 bg-[#006B56] hover:bg-[#005B48] text-white rounded-2xl font-bold text-xs shadow-md transition-all disabled:opacity-50 uppercase tracking-wider text-center cursor-pointer active:scale-95"
              >
                {isSpinning ? "Drawing Date Idea... 🎲" : "Generate Idea ✈"}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ==================== COMPLETE ASSESSMENT ONBOARDING MODAL ==================== */}
      <AnimatePresence>
        {showAssessmentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/80 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-[#EAEAFF]"
            >
              <div className="w-16 h-16 rounded-full bg-[#E37A47]/10 text-[#E37A47] flex items-center justify-center mx-auto border border-[#E37A47]/20">
                <span className="material-symbols-outlined text-3xl font-black">assignment</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#E37A47]">Onboarding Retreat</span>
                <h3 className="text-xl font-heading font-black text-slate-800">Complete Assessment</h3>
              </div>

              <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-2">
                To unlock your personalized Couples Dashboard, custom connection checklist, and relationship health tracking, please complete your initial assessment.
              </p>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    localStorage.setItem("couple_reset_assessment_flow", "true");
                    router.push("/assessment");
                  }}
                  className="w-full py-3.5 bg-[#E37A47] hover:bg-[#D36A37] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm font-black">play_arrow</span>
                  Start Assessment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== RETREAT PRIVACY GUARD POPUP ==================== */}
      <AnimatePresence>
        {showSecurityPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-[#EAEAFF]"
            >
              <div className="w-16 h-16 rounded-[20px] bg-[#EAE8F8] flex items-center justify-center mx-auto border border-[#E1DEFB]">
                <span className="material-symbols-outlined text-2xl text-[#7C6BC4]">filter_vintage</span>
              </div>

              <div className="space-y-1 font-heading">
                <h3 className="text-xl font-heading font-black text-slate-800 flex items-center justify-center gap-2">
                  <span>🌿</span> Your Retreat is Private
                </h3>
              </div>

              <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-2">
                Everything you write, journal, and share inside Manraah remains private. This is your personal space to reflect honestly and safely.
              </p>

              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EAE8F8] border border-[#E1DEFB] rounded-full text-[10px] font-black text-[#7C6BC4]">
                  <span>🔒</span> Your wellbeing belongs to you.
                </span>
              </div>

              <button 
                onClick={() => {
                  setShowSecurityPopup(false);
                }}
                className="w-full py-4 bg-[#5F4BB6] hover:bg-[#4E3CA3] text-white rounded-full font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                I Understand 💜
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== DISCONNECT SESSION WARNING MODAL ==================== */}
      <AnimatePresence>
        {showDisconnectModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/70 backdrop-blur-md flex items-center justify-center p-4 text-center"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white max-w-sm w-full p-8 rounded-[36px] space-y-6 shadow-2xl relative border border-[#EAEAFF]"
            >
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <span className="material-symbols-outlined text-3xl font-black">logout</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Session Warning</span>
                <h3 className="text-xl font-heading font-black text-slate-800">Disconnect Session?</h3>
              </div>

              <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-2">
                Going back to the landing page will disconnect your active session. You will need to authenticate again to view your dashboard.
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Stay
                </button>
                <button 
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== DAILY CHECK-IN MODAL ==================== */}
      <AnimatePresence>
        {showCheckinModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D283E]/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white max-w-md w-full p-8 rounded-[40px] border border-slate-100 shadow-2xl space-y-6 relative text-center"
            >
              <button 
                onClick={() => setShowCheckinModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="space-y-1">
                <span className="px-3.5 py-1 rounded-full bg-[#E5F5F0] text-[#006B56] text-[10px] font-black uppercase tracking-wider border border-[#CDEAE1]">
                  Daily Connection Check-in
                </span>
                <h3 className="text-xl font-heading font-black text-slate-800 pt-2">How is your connection today?</h3>
              </div>

              {/* Mood options */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Mood/Vibe</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { key: "Great", label: "😊 Great" },
                    { key: "Good", label: "🙂 Good" },
                    { key: "Normal", label: "😐 Okay" },
                    { key: "Not Good", label: "😕 Down" },
                    { key: "Bad", label: "😞 Bad" }
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelectedMood(m.key)}
                      className={`py-2 px-1 text-center rounded-xl text-[9px] font-black transition-all ${
                        selectedMood === m.key 
                          ? "bg-[#006B56] text-white shadow-sm" 
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activities Checklist */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Today's Connection Activities</label>
                <div className="space-y-2">
                  {checkinActivitiesList.map((activity) => {
                    const isChecked = checkedActivities.includes(activity);
                    return (
                      <div 
                        key={activity}
                        onClick={() => {
                          if (isChecked) {
                            setCheckedActivities(prev => prev.filter(a => a !== activity));
                          } else {
                            setCheckedActivities(prev => [...prev, activity]);
                          }
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 cursor-pointer select-none transition-all"
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isChecked ? "bg-[#006B56] border-[#006B56] text-white" : "border-slate-300 bg-white"
                        }`}>
                          {isChecked && <span className="material-symbols-outlined text-[10px] font-black">check</span>}
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">{activity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Short reflection note */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Journal Reflections</label>
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Share a brief private reflection about your relationship today..."
                  className="w-full px-3.5 py-3 border border-slate-200 rounded-2xl text-[11px] focus:outline-none focus:ring-1 focus:ring-[#006B56] min-h-[70px] bg-slate-50/20"
                />
              </div>

              <button
                onClick={handleCheckinSubmit}
                disabled={savingCheckin}
                className="w-full py-3.5 bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-xs rounded-full shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {savingCheckin ? "Saving Check-in... 💾" : "Save Connection Log"}
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== EMPATHY PAUSE / CALM ZONE DIALOG ==================== */}
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
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="space-y-1">
                <span className="px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                  Conflict Resolution Portal
                </span>
                <h3 className="text-2xl font-heading font-black text-slate-800 pt-2">Empathy Pause</h3>
              </div>

              {/* Steps Area */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl min-h-[220px] flex flex-col justify-between text-left">
                
                {/* Step 1: Mutual Pause & Breathing */}
                {calmStep === 1 && (
                  <div className="space-y-4 text-center">
                    <span className="text-3xl">🧘 Step 1: Synced Pause</span>
                    <h4 className="font-heading font-black text-sm text-slate-800">Slow down together</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
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
                            breathingPhase === "Inhale" ? "bg-emerald-200/50" : breathingPhase === "Hold" ? "bg-amber-100" : "bg-purple-200/50"
                          }`}
                        />
                        <span className="text-xs font-black text-slate-700">{breathingPhase} ({breathingSeconds}s)</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setBreathingActive(true);
                          setBreathingPhase("Inhale");
                          setBreathingSeconds(4);
                        }}
                        className="px-4 py-2 bg-[#7C6BC4] hover:bg-[#6A59B2] text-white text-xs font-bold rounded-full shadow-xs active:scale-95 cursor-pointer"
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
                    <h4 className="font-heading font-black text-sm text-slate-800">Use "I Feel" phrasing</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
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
                    <h4 className="font-heading font-black text-sm text-slate-800">Repeat back what you heard</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
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
                    <h4 className="font-heading font-black text-sm text-slate-800">Find a shared micro-action</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
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
                        i + 1 === calmStep ? "w-6 bg-rose-500" : "w-1.5 bg-slate-100"
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
                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-full font-bold text-xs hover:bg-slate-100 transition-transform active:scale-95"
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
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setCalmZoneActive(false);
                      setBreathingActive(false);
                    }}
                    className="flex-1 py-3 bg-gradient-to-tr from-rose-400 to-[#7C6BC4] text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95 animate-bounce"
                  >
                    We Are Calmer Now 💖
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
