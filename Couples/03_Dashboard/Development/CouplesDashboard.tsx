"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession } from "@/backend/auth/client";

// Tailored relationship ideas
const DATE_NIGHT_IDEAS = [
  { category: "Cozy 🏡", title: "Indoor Fort & Movie", desc: "Build a classic living-room blanket fort, make homemade popcorn, and watch a nostalgic movie." },
  { category: "Creative 🎨", title: "Double-Sided Canvas Painting", desc: "Buy two canvases. Set up opposite each other and paint a portrait of the other person!" },
  { category: "Culinary 🍳", title: "Mystery Ingredient Cook-off", desc: "Assign each other 2 secret ingredients and cook a dinner utilizing them." },
  { category: "Adventure 🌌", title: "Midnight Stargazing & Picnic", desc: "Pack a thermos of hot cocoa, a heavy blanket, and drive to an open field to watch the stars." },
  { category: "Active 🚶", title: "Memory Walk & Photo Hunt", desc: "Walk through a neighborhood that has meaning to your relationship." }
];

export default function CouplesDashboard() {
  const router = useRouter();
  
  // Base states
  const [userName, setUserName] = useState("Kartik");
  const [partnerName, setPartnerName] = useState("Elena");
  const [email, setEmail] = useState("");
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [tempPartnerName, setTempPartnerName] = useState("");
  
  // Dashboard & Metrics data
  const [harmonyScore, setHarmonyScore] = useState(90);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forced Onboarding & Gating popups
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [streakBroken, setStreakBroken] = useState(false);
  const [streakDays, setStreakDays] = useState(0);

  // Layout selection and interactive helpers
  const [activeTab, setActiveTab] = useState<"Monthly" | "Daily">("Monthly");
  const [currentDateIdea, setCurrentDateIdea] = useState(DATE_NIGHT_IDEAS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Empathy Calm modal states
  const [calmZoneActive, setCalmZoneActive] = useState(false);
  const [calmStep, setCalmStep] = useState(1);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Calendar selected day
  const [selectedDay, setSelectedDay] = useState(6);

  // Add Appointment Form states
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [apptTitle, setApptTitle] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptVenue, setApptVenue] = useState("");

  // Synchronized breathing timer loop
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

  // Load backend couples metrics on mount
  useEffect(() => {
    const session = getClientSession();
    if (session && session.isAuthenticated && session.user) {
      setUserName(session.user.sanctuaryName || session.user.name || "Harmony Partner");
      setEmail(session.user.email || "");
    }

    fetch("/api/couples/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => {
        if (data.profile) {
          setPartnerName(data.profile.partner_name);
          setTempPartnerName(data.profile.partner_name);
          setHarmonyScore(data.profile.harmony_score);
          setStressLevel(data.profile.stress_level);
          setEnergyLevel(data.profile.energy_level);
          setCommunicationScore(data.profile.communication_score);
        }
        if (data.tasks) setTasks(data.tasks);
        if (data.appointments) setAppointments(data.appointments);
        if (data.monthlyActivity) setMonthlyActivity(data.monthlyActivity);
        if (data.userProfile) setUserProfile(data.userProfile);

        // Calculate if streak is broken (diffDays > 1)
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
        setStreakDays(isBroken ? 0 : (data.streak?.currentStreak || 0));

        // Evaluate Forced Onboarding assessment gate
        const localAssessmentCompleted = localStorage.getItem("parent_assessment_completed") === "true";
        const hasCoupleAssessment = (data.userProfile && data.userProfile.percentage !== null) || localAssessmentCompleted;

        if (hasCoupleAssessment) {
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

        setLoading(false);
      })
      .catch((err) => {
        console.error("[Dashboard Fetch Error]:", err);
        setLoading(false);
      });
  }, []);

  // Update partner name in database
  const savePartnerName = async () => {
    if (!tempPartnerName.trim()) return;
    try {
      const res = await fetch("/api/couples/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updatePartner", partnerName: tempPartnerName.trim() })
      });
      if (res.ok) {
        setPartnerName(tempPartnerName.trim());
        setIsEditingPartner(false);
      }
    } catch (err) {
      console.error("[Save Partner Error]:", err);
    }
  };

  // Sync metrics update and calculate balance score
  const syncHarmonyMetrics = async (newStress: number, newEnergy: number, newComm: number) => {
    try {
      const res = await fetch("/api/couples/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateMetrics",
          stressLevel: newStress,
          energyLevel: newEnergy,
          communicationScore: newComm
        })
      });
      const data = await res.json();
      if (res.ok && data.harmonyScore !== undefined) {
        setHarmonyScore(data.harmonyScore);
      }
    } catch (err) {
      console.error("[Sync Metrics Error]:", err);
    }
  };

  // Toggle tasks checkin status
  const handleToggleTask = async (taskId: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: nextStatus } : t));
    try {
      await fetch("/api/couples/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleTask", taskId, completed: nextStatus })
      });
    } catch (err) {
      console.error("[Toggle Task Error]:", err);
    }
  };

  // Add a new Appointment/Schedule
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptTitle.trim() || !apptTime.trim() || !apptVenue.trim()) return;

    try {
      const res = await fetch("/api/couples/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addAppointment",
          title: apptTitle.trim(),
          category: "General Sync",
          doctor_name: partnerName,
          hospital_name: apptVenue.trim(),
          location: apptVenue.trim(),
          date: "Daily",
          time: apptTime.trim()
        })
      });

      if (res.ok) {
        const newAppt = {
          id: Date.now(),
          title: apptTitle.trim(),
          time: apptTime.trim(),
          hospital_name: apptVenue.trim(),
          category: "General Sync",
          doctor_name: partnerName,
          location: apptVenue.trim(),
          date: "Daily"
        };
        setAppointments(prev => [...prev, newAppt]);
        setApptTitle("");
        setApptTime("");
        setApptVenue("");
        setShowAddAppt(false);
      }
    } catch (err) {
      console.error("[Add Appointment Error]:", err);
    }
  };

  // Draw random date night ideas
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

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 80;

  // Solid SVG Pie Chart details mathematically calculated from harmonyScore
  const pieBreakdown = useMemo(() => {
    const score = harmonyScore / 2; // scale out of 50
    let great = 0, good = 0, normal = 0, notGood = 0, bad = 0;

    if (score >= 45) { great = 60; good = 25; normal = 10; notGood = 4; bad = 1; }
    else if (score >= 40) { great = 40; good = 35; normal = 15; notGood = 8; bad = 2; }
    else if (score >= 35) { great = 20; good = 45; normal = 20; notGood = 10; bad = 5; }
    else if (score >= 30) { great = 10; good = 30; normal = 40; notGood = 15; bad = 5; }
    else if (score >= 25) { great = 5; good = 20; normal = 45; notGood = 20; bad = 10; }
    else if (score >= 20) { great = 2; good = 15; normal = 30; notGood = 35; bad = 18; }
    else if (score >= 15) { great = 1; good = 5; normal = 20; notGood = 45; bad = 29; }
    else { great = 0; good = 2; normal = 10; notGood = 30; bad = 58; }

    return [
      { label: "Great", value: great, color: "#006B56" },
      { label: "Good", value: good, color: "#85B581" },
      { label: "Normal", value: normal, color: "#F5C99B" },
      { label: "Not Good", value: notGood, color: "#E37A47" },
      { label: "Bad", value: bad, color: "#D64E4D" }
    ];
  }, [harmonyScore]);

  // SVG drawing math
  let cumulativeAngle = 0;
  const pieSlices = pieBreakdown.map((slice) => {
    const angle = (slice.value / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const radStart = (startAngle - 90) * (Math.PI / 180);
    const radEnd = (endAngle - 90) * (Math.PI / 180);

    const x1 = 50 + 40 * Math.cos(radStart);
    const y1 = 50 + 40 * Math.sin(radStart);
    const x2 = 50 + 40 * Math.cos(radEnd);
    const y2 = 50 + 40 * Math.sin(radEnd);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const midAngle = startAngle + angle / 2;
    const radMid = (midAngle - 90) * (Math.PI / 180);
    const lx = 50 + 24 * Math.cos(radMid);
    const ly = 50 + 24 * Math.sin(radMid);

    return { ...slice, pathData, labelX: lx, labelY: ly };
  });

  // Calendar Padding
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const calendarPadding = Array.from({ length: 4 });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full">
      
      {/* 1. DISMISSABLE STREAK BROKEN BANNER */}
      {streakBroken && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <h5 className="font-heading font-black text-xs text-[#D64E4D] dark:text-[#EF6A6A]">You broke your streak!</h5>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                Don't worry, wellness is a continuous journey. Check in today to start a fresh streak! 🌱
              </p>
            </div>
          </div>
          <button 
            onClick={() => setStreakBroken(false)}
            className="w-6 h-6 rounded-full bg-rose-100/50 flex items-center justify-center text-[#D64E4D]"
          >
            ×
          </button>
        </motion.div>
      )}

      {/* Connection Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#132E3F] border border-[#EAEAFF] dark:border-slate-800 text-xs font-bold text-[#7C6BC4] dark:text-purple-300 shadow-sm hover:bg-[#F2F4FD] dark:hover:bg-slate-800 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
          Back to home
        </button>

        <div className="flex items-center gap-3">
          {/* Retake Assessment Button */}
          <button 
            onClick={() => {
              localStorage.removeItem("parent_assessment_completed");
              localStorage.removeItem("parent_assessment_modal_dismissed");
              localStorage.setItem("parent_reset_assessment_flow", "true");
              router.push("/assessment");
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#132E3F] border border-[#EAEAFF] dark:border-slate-800 text-xs font-bold text-[#E37A47] dark:text-[#F38A57] shadow-sm hover:bg-[#FFF6F2] dark:hover:bg-slate-800 active:scale-95 transition-all"
            title="Retake initial couples wellness assessment"
          >
            <span className="material-symbols-outlined text-sm font-black">assignment</span>
            Retake Assessment
          </button>

          <button 
            onClick={() => setCalmZoneActive(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#132E3F] border border-[#EAEAFF] dark:border-slate-800 text-xs font-bold text-rose-500 dark:text-rose-400 shadow-sm hover:bg-rose-50/50 dark:hover:bg-slate-800 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-black">security</span>
            Empathy calm zone
          </button>
          
          <span className="px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[#006B56] dark:text-[#5FAF8A] text-[10px] font-black uppercase tracking-wider border border-emerald-100/50 dark:border-emerald-900/30">
            🔒 Private Retreat Connection
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs font-bold text-slate-400">
          Syncing secure couples dashboard... 🔒
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ────────────────────────────────────────────────────────────
              COLUMN 1: MINT SIDEBAR PANEL (col-span-3)
              ──────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#E6F4F0] dark:bg-[#112F28] rounded-[32px] p-6 border border-[#CBECE2] dark:border-[#1C463C] shadow-[0_10px_35px_rgba(0,107,86,0.03)] text-center space-y-6 flex flex-col justify-between min-h-[480px]">
              
              {/* Profile details */}
              <div className="space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 bg-[#F5C99B]/40 flex items-center justify-center shadow-sm">
                    <span className="text-4xl">👩‍❤️‍👨</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#006B56] border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-black text-slate-800 dark:text-slate-100 text-sm">Check your harmony</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-1">
                    Check your every situation, stress factors, and relationship activities.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => router.push("/checkin")}
                className="w-full py-3 rounded-[20px] bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 text-center"
              >
                Check It Now
              </button>

              {/* Photo of the couple matching Parent pediatrics consult illustration panel */}
              <div className="pt-4 border-t border-[#CBECE2] dark:border-[#1C463C] flex justify-center overflow-hidden rounded-2xl">
                <img 
                  src="/category/couple.png" 
                  alt="Couple Connection" 
                  className="w-full h-auto object-cover max-h-[140px] hover:scale-105 transition-transform duration-500 rounded-xl"
                />
              </div>

              {/* Metrics Slider check-in tools */}
              <div className="space-y-4 pt-4 border-t border-[#CBECE2] dark:border-[#1C463C] text-left">
                <h5 className="text-[9px] uppercase font-black tracking-widest text-[#006B56] dark:text-[#5FAF8A]">Harmony Metrics</h5>
                
                {/* Communication Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <span>💬 Conversation</span>
                    <span className="font-black text-[#006B56] dark:text-[#5FAF8A]">{communicationScore}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={communicationScore}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setCommunicationScore(val);
                      syncHarmonyMetrics(stressLevel, energyLevel, val);
                    }}
                    className="w-full accent-[#006B56] dark:accent-[#5FAF8A] h-1 bg-white dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Energy Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <span>⚡ Shared Energy</span>
                    <span className="font-black text-[#006B56] dark:text-[#5FAF8A]">{energyLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={energyLevel}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setEnergyLevel(val);
                      syncHarmonyMetrics(stressLevel, val, communicationScore);
                    }}
                    className="w-full accent-[#006B56] dark:accent-[#5FAF8A] h-1 bg-white dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Stress Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    <span>🧘 Tension Rate</span>
                    <span className="font-black text-rose-500">{stressLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={stressLevel}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setStressLevel(val);
                      syncHarmonyMetrics(val, energyLevel, communicationScore);
                    }}
                    className="w-full accent-rose-400 h-1 bg-white dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────
              COLUMN 2: MAIN DASHBOARD AREA (col-span-5)
              ──────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header Block with Wellness Score & Streak indicators */}
            <div className="bg-white dark:bg-[#132E3F] rounded-[32px] border border-[#EAEAFF] dark:border-slate-800 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Hi, {userName}
                  </h1>
                  <p className="text-xs text-slate-400 dark:text-slate-400 font-bold">
                    Let's track your relationship health daily!
                  </p>
                </div>
                
                {isEditingPartner ? (
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="text" 
                      value={tempPartnerName}
                      onChange={(e) => setTempPartnerName(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#006B56]"
                    />
                    <button onClick={savePartnerName} className="px-3 py-1 bg-[#006B56] text-white rounded-full font-bold text-[10px]">Save</button>
                    <button onClick={() => setIsEditingPartner(false)} className="text-slate-400 text-[10px]">Cancel</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingPartner(true)}
                    className="text-[10px] font-black text-[#006B56] dark:text-[#5FAF8A] hover:underline"
                  >
                    Linked: {partnerName} (Edit)
                  </button>
                )}
              </div>

              {/* Dynamic Wellness Score and Streak display widgets */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="p-3 bg-[#E6F4F0] dark:bg-[#112F28] rounded-2xl text-center space-y-1 border border-[#CBECE2]/30">
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#006B56] dark:text-[#5FAF8A]">Wellness Score</span>
                  <h4 className="text-lg font-heading font-black text-[#006B56] dark:text-emerald-400">
                    {userProfile?.percentage || 75}%
                  </h4>
                  <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    Level: {userProfile?.wellness_level || "Stable"}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-center space-y-1 border border-amber-100/30">
                  <span className="text-[9px] uppercase font-black tracking-widest text-amber-750 dark:text-amber-400">Current Streak</span>
                  <h4 className="text-lg font-heading font-black text-amber-700 dark:text-amber-400">
                    Day {streakDays} 🔥
                  </h4>
                  <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    Daily check-in
                  </p>
                </div>
              </div>
            </div>

            {/* Upcoming Appointment */}
            <div className="bg-white dark:bg-[#132E3F] rounded-[32px] border border-[#EAEAFF] dark:border-slate-800 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-4">
              <h3 className="font-heading font-black text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-400">Upcoming appointment</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 rounded-xl bg-[#E6F4F0] dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    🏥
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Manggis ST Hospital</h4>
                    <p className="text-[10px] text-slate-400 font-bold">New York, USA</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#F5FBF9] dark:bg-slate-800/40 border border-[#E4EFE9]/40 dark:border-slate-700/40 px-4 py-3 rounded-2xl gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👩‍⚕️</span>
                    <div>
                      <h5 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Dr. Emilia Winson</h5>
                      <p className="text-[9px] text-[#006B56] dark:text-[#5FAF8A] font-black uppercase tracking-wider">Physiotherapy</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push("/call")}
                    className="px-4 py-1.5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-[10px] uppercase tracking-wider shadow-sm transition-all active:scale-95"
                  >
                    Video call
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    14 Mar 2022
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">alarm</span>
                    09.00 pm
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Activities chart and Generator */}
            <div className="bg-white dark:bg-[#132E3F] rounded-[32px] border border-[#EAEAFF] dark:border-slate-800 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-black text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-400">Patient activities</h3>
                <span className="text-[10px] font-bold text-slate-400">Month ▾</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold">Today, 5 October 2022</p>

              {/* Bar chart */}
              <div className="h-32 flex items-end justify-between gap-2.5 px-1 pt-2">
                {monthlyActivity.map((act, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div 
                      className="w-full bg-[#006B56]/20 dark:bg-emerald-500/10 hover:bg-[#006B56] dark:hover:bg-[#5FAF8A] rounded-t-lg transition-all duration-300 cursor-pointer relative group"
                      style={{ height: `${act.value}%` }}
                    >
                      <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {act.value}%
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">{act.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Overview Solid Pie Chart */}
            <div className="bg-white dark:bg-[#132E3F] rounded-[32px] border border-[#EAEAFF] dark:border-slate-800 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#006B56] dark:text-[#5FAF8A]">Overall Metrics</span>
                  <h3 className="text-base font-heading font-black text-slate-800 dark:text-slate-100">Harmony Overview</h3>
                </div>
                <span className="text-xl">📊</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                {/* SVG solid pie container */}
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 select-none">
                    {pieSlices.map((slice, idx) => (
                      <path 
                        key={idx}
                        d={slice.pathData}
                        fill={slice.color}
                        className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                    {pieSlices.map((slice, idx) => {
                      if (slice.value < 5) return null;
                      return (
                        <span 
                          key={`label-${idx}`}
                          className="absolute text-[8px] font-black text-white"
                          style={{
                            left: `${slice.labelX}%`,
                            top: `${slice.labelY}%`,
                            transform: "translate(-50%, -50%)"
                          }}
                        >
                          {slice.value}%
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Legends */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  {pieBreakdown.map((slice, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="truncate">{slice.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ────────────────────────────────────────────────────────────
              COLUMN 3: SCHEDULES & HABITS (col-span-4)
              ──────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Appointments switcher & Calendar / Daily Schedules */}
            <div className="bg-white dark:bg-[#132E3F] rounded-[32px] border border-[#EAEAFF] dark:border-slate-800 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] space-y-5">
              <h3 className="font-heading font-black text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider text-slate-400">List of appointments</h3>
              
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-[#F5F8F6] dark:bg-slate-800/60 rounded-xl border border-slate-200/40 dark:border-slate-700/30">
                <button 
                  onClick={() => {
                    setActiveTab("Monthly");
                    setShowAddAppt(false);
                  }}
                  className="py-1.5 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: activeTab === "Monthly" ? "#006B56" : "transparent",
                    color: activeTab === "Monthly" ? "white" : "#94A3B8"
                  }}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setActiveTab("Daily")}
                  className="py-1.5 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    backgroundColor: activeTab === "Daily" ? "#006B56" : "transparent",
                    color: activeTab === "Daily" ? "white" : "#94A3B8"
                  }}
                >
                  Daily
                </button>
              </div>

              {/* SWITCHABLE DISPLAY FOR MONTHLY / DAILY */}
              {activeTab === "Monthly" ? (
                /* Monthly calendar display */
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs font-black text-slate-700 dark:text-slate-200">
                    <span>October 2022</span>
                    <div className="flex gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-xs cursor-pointer">chevron_left</span>
                      <span className="material-symbols-outlined text-xs">chevron_right</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                    
                    {calendarPadding.map((_, i) => <span key={`pad-${i}`} />)}

                    {calendarDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center transition-all ${
                          selectedDay === day 
                            ? "bg-[#E67E22] text-white font-black" 
                            : "hover:bg-slate-200/50"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fully functional Daily appointments list with scheduler */
                <div className="space-y-4 pt-1">
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {appointments.length > 0 ? (
                      appointments.map((appt) => (
                        <div key={appt.id} className="p-3 bg-[#F5FBF9] dark:bg-slate-800/40 border border-[#E4EFE9]/40 dark:border-slate-700/40 rounded-2xl flex items-center justify-between text-xs transition-colors">
                          <div className="space-y-0.5 text-left">
                            <h4 className="font-heading font-black text-slate-800 dark:text-slate-100">{appt.title}</h4>
                            <p className="text-[9px] text-[#006B56] dark:text-[#5FAF8A] font-black uppercase tracking-wider">{appt.time}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">{appt.hospital_name || appt.location}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 font-bold text-center py-4">No appointments for today.</p>
                    )}
                  </div>

                  {/* Add Appointment form toggler */}
                  {!showAddAppt ? (
                    <button 
                      onClick={() => setShowAddAppt(true)}
                      className="w-full py-2 bg-[#006B56] hover:bg-[#005B48] text-white rounded-full font-bold text-[9px] uppercase tracking-wider transition-all"
                    >
                      + Schedule Appt
                    </button>
                  ) : (
                    <form onSubmit={handleAddAppointment} className="p-3 bg-[#F5FBF9] dark:bg-slate-800/20 border border-slate-200/40 rounded-2xl space-y-2.5 text-left">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400">Appointment Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Couples Massage"
                          value={apptTitle}
                          onChange={(e) => setApptTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006B56]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-400">Retreat/Venue</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Cozy Retreat Lounge"
                          value={apptVenue}
                          onChange={(e) => setApptVenue(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006B56]"
                          required
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 py-1.5 bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-[9px] uppercase tracking-wider rounded-lg">Save</button>
                        <button type="button" onClick={() => setShowAddAppt(false)} className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[9px] uppercase tracking-wider rounded-lg">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Daily progress circular ring */}
            <div className="bg-[#E6F4F0] dark:bg-[#112F28] border border-[#CBECE2] dark:border-[#1C463C] p-5 rounded-[24px] flex items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Daily progress</h4>
                <p className="text-[9px] text-[#006B56] dark:text-[#5FAF8A] font-bold leading-normal">
                  Keep improving your connection quality
                </p>
              </div>
              
              {/* SVG circle */}
              <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#CBECE2" strokeWidth="4.5" fill="transparent" />
                  <circle cx="32" cy="32" r="26" stroke="#006B56" strokeWidth="4.5" fill="transparent"
                    strokeDasharray="163.3"
                    strokeDashoffset={163.3 - (163.3 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-slate-800 dark:text-slate-100">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Habit schedules checkin logs */}
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.completed)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#132E3F] border border-[#EAEAFF] dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all active:scale-[0.99] select-none shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                      task.completed ? "bg-[#006B56] border-[#006B56] text-white" : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}>
                      {task.completed && <span className="material-symbols-outlined text-[9px] font-black">check</span>}
                    </div>
                    <div>
                      <h5 className={`font-heading font-black text-xs text-slate-800 dark:text-slate-100 ${task.completed ? "line-through text-slate-400" : ""}`}>
                        {task.text.replace(/^[\p{Emoji}\s]+/u, "")}
                      </h5>
                      <p className="text-[9px] text-slate-400 font-bold">Active Habit</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
                </div>
              ))}
            </div>

            {/* Date Generator spark panel */}
            <div className="bg-gradient-to-br from-[#E6F4F0] to-white dark:from-teal-950/20 dark:to-transparent border border-[#CBECE2] dark:border-slate-800 p-5 rounded-[24px] space-y-4">
              <div className="text-left space-y-1">
                <span className="text-[8px] font-black uppercase text-[#006B56] dark:text-[#5FAF8A] tracking-widest">Interactive ideas</span>
                <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Tailored Date Idea 🥂</h4>
              </div>
              
              <div className="bg-white dark:bg-[#132E3F]/40 border border-[#CBECE2]/20 p-4 rounded-xl text-center space-y-1.5">
                <h5 className="font-heading font-black text-[11px] text-slate-850 dark:text-slate-150 pt-0.5">{currentDateIdea.title}</h5>
                <p className="text-[9px] text-slate-400 font-bold leading-normal">
                  {currentDateIdea.desc}
                </p>
              </div>

              <button
                onClick={handleGenerateDate}
                disabled={isSpinning}
                className="w-full py-2 bg-[#006B56] hover:bg-[#005B48] text-white rounded-full font-bold text-[9px] uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isSpinning ? "Drawing... 🎲" : "Generate Idea ✨"}
              </button>
            </div>

          </div>

        </div>
      )}

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
              className="bg-[#fdf7ff] dark:bg-[#132E3F] max-w-md w-full p-8 rounded-[40px] border border-white/50 dark:border-slate-800 shadow-2xl space-y-6 relative text-center"
            >
              <button 
                onClick={() => {
                  setCalmZoneActive(false);
                  setBreathingActive(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="space-y-1">
                <span className="px-3.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-black uppercase tracking-wider">
                  Conflict Resolution Portal
                </span>
                <h3 className="text-2xl font-heading font-black text-slate-800 dark:text-slate-100 pt-2">Empathy Pause</h3>
              </div>

              <div className="bg-white dark:bg-[#1A3A4E] border border-slate-200/40 p-6 rounded-3xl min-h-[220px] flex flex-col justify-between text-left">
                
                {calmStep === 1 && (
                  <div className="space-y-4 text-center">
                    <span className="text-3xl">🧘 Step 1: Synced Pause</span>
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Slow down together</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
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
                            breathingPhase === "Inhale" ? "bg-[#006B56]/30" : breathingPhase === "Hold" ? "bg-amber-100/50" : "bg-teal-500/25"
                          }`}
                        />
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200">{breathingPhase} ({breathingSeconds}s)</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setBreathingActive(true);
                          setBreathingPhase("Inhale");
                          setBreathingSeconds(4);
                        }}
                        className="px-4 py-2 bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-bold rounded-full shadow-xs active:scale-95"
                      >
                        Start Breathing Guide 🌀
                      </button>
                    )}
                  </div>
                )}

                {calmStep === 2 && (
                  <div className="space-y-2">
                    <span className="text-3xl">🗣️ Step 2: Share Feelings</span>
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Use "I Feel" phrasing</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
                      One partner shares their perspective using "I feel" instead of accusing "You did". 
                      <br /><br />
                      <em>Example: "I feel unheard when decisions are made without talking first," instead of "You never include me."</em>
                    </p>
                  </div>
                )}

                {calmStep === 3 && (
                  <div className="space-y-2">
                    <span className="text-3xl">🗣️ Step 3: Mirror & Validate</span>
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Repeat back what you heard</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
                      Before defending or replying, mirror your partner's feelings to ensure they feel heard.
                      <br /><br />
                      <em>Example: "What I hear you saying is that you felt stressed because you wanted to make that choice together. Is that right?"</em>
                    </p>
                  </div>
                )}

                {calmStep === 4 && (
                  <div className="space-y-2">
                    <span className="text-3xl">🤝 Step 4: Small Agreement</span>
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Find a shared micro-action</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
                      Co-create one small action you can both agree on to ease the situation right now. It doesn't have to fix the whole issue, just resolve the immediate tension.
                    </p>
                  </div>
                )}

                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === calmStep ? "w-6 bg-[#006B56]" : "w-1.5 bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                {calmStep > 1 && (
                  <button 
                    onClick={() => {
                      setCalmStep(prev => prev - 1);
                      setBreathingActive(false);
                    }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full font-bold text-xs transition-transform active:scale-95"
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
                    className="flex-1 py-2.5 bg-[#006B56] hover:bg-[#005B48] text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setCalmZoneActive(false);
                      setBreathingActive(false);
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-tr from-[#006B56] to-teal-600 text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95 animate-bounce"
                  >
                    We Are Calmer Now 💖
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== 2. PERIODIC SECURITY PRIVACY POPUP ==================== */}
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
              className="bg-white dark:bg-[#132E3F] max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-[#EAEAFF] dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-[20px] bg-[#EAE8F8] dark:bg-[#202E4E] flex items-center justify-center mx-auto border border-[#E1DEFB] dark:border-[#2D3F66]">
                <span className="material-symbols-outlined text-2xl text-[#7C6BC4] dark:text-[#AFA4EC]">filter_vintage</span>
              </div>

              <div className="space-y-1 font-heading">
                <h3 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                  <span>🌿</span> Your Retreat is Private
                </h3>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-2">
                Everything you write, journal, and share inside Manraah remains private. This is your personal space to reflect honestly and safely.
              </p>

              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EAE8F8] dark:bg-[#202E4E] border border-[#E1DEFB] dark:border-[#2D3F66] rounded-full text-[10px] font-black text-[#7C6BC4] dark:text-[#AFA4EC]">
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

      {/* ==================== 3. COMPLETE ASSESSMENT FORCED GATED MODAL ==================== */}
      <AnimatePresence>
        {showAssessmentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-[#0F1E19]/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-[#132E3F] max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-[#EAEAFF] dark:border-slate-800"
            >
              <div className="w-16 h-16 rounded-full bg-[#E37A47]/10 text-[#E37A47] flex items-center justify-center mx-auto border border-[#E37A47]/20">
                <span className="material-symbols-outlined text-3xl font-black">assignment</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#E37A47]">Onboarding Retreat</span>
                <h3 className="text-xl font-heading font-black text-slate-800 dark:text-slate-100">Complete Assessment</h3>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-2">
                To unlock your personalized Couples Dashboard, habit challenges, and wellness schedule, please complete your initial assessment.
              </p>

              <button 
                onClick={() => {
                  localStorage.setItem("parent_reset_assessment_flow", "true");
                  router.push("/assessment");
                }}
                className="w-full py-4 bg-[#E37A47] hover:bg-[#D26936] text-white rounded-full font-bold text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Start Assessment
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
