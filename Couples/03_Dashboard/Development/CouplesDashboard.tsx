"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

// Time-based theme mapping matching clinical dashboard colors
const TIME_THEMES = {
  morning: {
    greeting: "Good Morning",
    icon: "🌅",
    subtitle: "Let's align your relationship harmony today"
  },
  afternoon: {
    greeting: "Good Afternoon",
    icon: "☀️",
    subtitle: "Check in on your partner and share a connection break"
  },
  evening: {
    greeting: "Good Evening",
    icon: "🌿",
    subtitle: "Settle into your evening retreat together"
  },
  night: {
    greeting: "Good Night",
    icon: "🌌",
    subtitle: "Reflect on your day's secure bond"
  }
};

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
  
  // Harmony Metrics and Data from API
  const [harmonyScore, setHarmonyScore] = useState(90);
  const [stressLevel, setStressLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [communicationScore, setCommunicationScore] = useState(8);
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time and interactive controls
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("morning");
  const [activeTab, setActiveTab] = useState<"Monthly" | "Daily">("Monthly");
  const [currentDateIdea, setCurrentDateIdea] = useState(DATE_NIGHT_IDEAS[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Empathy Calm Portal modal states
  const [calmZoneActive, setCalmZoneActive] = useState(false);
  const [calmStep, setCalmStep] = useState(1);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Calendar states
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 9, 1)); // October 2026 default matching mockup format
  const [selectedDay, setSelectedDay] = useState(6); // Highlight 6th like image mockup

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

  // Load dashboard data on mount
  useEffect(() => {
    // 1. Resolve local username session details
    const session = getClientSession();
    if (session && session.isAuthenticated && session.user) {
      setUserName(session.user.sanctuaryName || session.user.name || "Harmony Partner");
      setEmail(session.user.email || "");
    }

    // 2. Fetch couples database queries from backend API
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
        setLoading(false);
      })
      .catch((err) => {
        console.error("[Dashboard Fetch Error]:", err);
        setLoading(false);
      });

    // 3. Resolve greeting based on hour of day
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
    else if (hour >= 17 && hour < 21) setTimeOfDay("evening");
    else setTimeOfDay("night");
  }, []);

  // Update Partner Name inside database
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

  // Sync harmony metrics and recalculate score inside database
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

  // Toggle checklist habit completion
  const handleToggleTask = async (taskId: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI updates
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

  // Spin/draw random date night idea
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

  // Calculate dynamic task completion percentages
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 80;

  // SVG circular progress calculation
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  // Calendar Helpers for October 2026 mockup (grid alignment starts on Thursday)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const calendarPadding = Array.from({ length: 4 }); // Mock Thursday start padding

  return (
    <div className="w-full min-h-screen bg-[#E9F0EC] dark:bg-[#0D1F2D] text-slate-800 dark:text-slate-100 flex p-0 font-sans overflow-hidden">
      
      {/* 1. DARK SIDEBAR LAYOUT (Leftmost Panel) */}
      <aside className="w-[76px] bg-[#142C2A] dark:bg-[#091514] flex flex-col justify-between items-center py-6 border-r border-teal-950/20 z-20 flex-shrink-0">
        <div className="flex flex-col items-center gap-10 w-full">
          {/* Logo brand icon */}
          <div className="w-10 h-10 rounded-2xl bg-[#E8FAF5]/10 flex items-center justify-center text-teal-300 font-heading font-black cursor-pointer shadow-inner">
            <span className="material-symbols-outlined text-2xl font-black text-[#85B581]">filter_vintage</span>
          </div>

          {/* Navigation vertical list */}
          <nav className="flex flex-col gap-6 w-full px-2">
            <button className="w-12 h-12 rounded-xl bg-teal-900/40 text-[#85B581] flex flex-col items-center justify-center gap-0.5 mx-auto transition-all" title="Dashboard">
              <span className="material-symbols-outlined text-xl">grid_view</span>
              <span className="text-[7px] font-black uppercase tracking-wider">Dash</span>
            </button>

            <button onClick={() => setCalmZoneActive(true)} className="w-12 h-12 rounded-xl hover:bg-teal-900/20 text-slate-400 hover:text-slate-200 flex flex-col items-center justify-center gap-0.5 mx-auto transition-all" title="Calm Zone">
              <span className="material-symbols-outlined text-xl text-rose-300">security</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-rose-300">Calm</span>
            </button>

            <button onClick={() => router.push("/call")} className="w-12 h-12 rounded-xl hover:bg-teal-900/20 text-slate-400 hover:text-slate-200 flex flex-col items-center justify-center gap-0.5 mx-auto transition-all" title="Secure Call">
              <span className="material-symbols-outlined text-xl text-teal-300">ring_volume</span>
              <span className="text-[7px] font-black uppercase tracking-wider text-teal-300">Call</span>
            </button>
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="flex flex-col gap-5 items-center w-full">
          <button onClick={() => router.push("/faq")} className="text-slate-400 hover:text-white transition-colors" title="FAQ Help">
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
          <button 
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="text-slate-400 hover:text-rose-400 transition-colors" 
            title="Log Out"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </aside>

      {/* 2. MINT SIDEBAR PANEL (Check Your Condition Panel) */}
      <aside className="w-[245px] bg-[#E1EFE7] dark:bg-[#122A26] flex flex-col p-6 justify-between border-r border-[#D2E4DA] dark:border-teal-900/30 flex-shrink-0 relative overflow-hidden">
        <div className="space-y-6 z-10">
          {/* Avatar details */}
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 bg-[#E8FAF5] flex items-center justify-center shadow-sm">
                <span className="text-3xl">👩‍❤️‍👨</span>
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#85B581] border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
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
            className="w-full py-2.5 rounded-full bg-[#85B581] hover:bg-[#74A370] text-white font-bold text-xs shadow-md transition-all active:scale-95 text-center block"
          >
            Check It Now
          </button>

          {/* Sliders Grid embedded inside Sidebar for seamless interactive control */}
          <div className="space-y-4 pt-4 border-t border-slate-300/40">
            <h5 className="text-[9px] uppercase font-black tracking-widest text-[#74A370]">Harmony Metrics</h5>
            
            {/* Communication Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span>💬 Conversation</span>
                <span className="font-black text-[#74A370]">{communicationScore}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={communicationScore}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setCommunicationScore(val);
                  syncHarmonyMetrics(stressLevel, energyLevel, val);
                }}
                className="w-full accent-[#85B581] h-1 bg-white rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Energy Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span>⚡ Shared Energy</span>
                <span className="font-black text-[#74A370]">{energyLevel}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={energyLevel}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setEnergyLevel(val);
                  syncHarmonyMetrics(stressLevel, val, communicationScore);
                }}
                className="w-full accent-[#85B581] h-1 bg-white rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Stress Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
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
                className="w-full accent-rose-400 h-1 bg-white rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bottom decorative plant overlay matching mockup graphics */}
        <div className="absolute -bottom-6 -left-6 opacity-30 select-none pointer-events-none w-28 h-28 bg-[#85B581]/25 blur-xl rounded-full" />
      </aside>

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 bg-[#F5F8F6] dark:bg-[#0A161E] flex flex-col p-8 overflow-y-auto">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-xs font-bold text-slate-400">
            Syncing secure couples dashboard... 🔒
          </div>
        ) : (
          <div className="space-y-8 max-w-5xl">
            
            {/* Header Block */}
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-heading font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Hi, {userName} & {partnerName}
                </h1>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-wide leading-relaxed">
                  Let's track your relationship health daily!
                </p>
              </div>

              {/* Editing Partner widget */}
              <div className="text-right text-xs font-semibold">
                {isEditingPartner ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={tempPartnerName}
                      onChange={(e) => setTempPartnerName(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#85B581]"
                    />
                    <button onClick={savePartnerName} className="px-3 py-1 bg-[#85B581] text-white rounded-full font-bold">Save</button>
                    <button onClick={() => setIsEditingPartner(false)} className="text-slate-400">Cancel</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingPartner(true)}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] font-black text-[#74A370] tracking-wide hover:bg-slate-50 active:scale-95 transition-all"
                  >
                    Change Partner Name
                  </button>
                )}
              </div>
            </div>

            {/* Upcoming Appointment / Date Night card */}
            <section className="space-y-3">
              <h3 className="font-heading font-black text-slate-800 dark:text-slate-100 text-sm tracking-wide">Upcoming appointment</h3>
              <div className="bg-white dark:bg-[#122A26] rounded-3xl p-5 border border-[#E9F0EC] dark:border-teal-900/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                
                {/* Clinic Card Details */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-24 h-16 rounded-2xl bg-[#E8FAF5] dark:bg-teal-950/30 flex items-center justify-center text-2xl select-none flex-shrink-0">
                    🏥
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Manggis ST Hospital</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold">New York, USA</p>
                  </div>
                </div>

                {/* Doctor Info card */}
                <div className="flex items-center gap-3.5 bg-[#F5F8F6] dark:bg-teal-950/20 px-4 py-3 rounded-2xl border border-slate-200/50 dark:border-teal-900/20 flex-1 min-w-[200px]">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg">👩‍⚕️</div>
                  <div className="flex-1 space-y-0.5">
                    <h5 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Dr. Emilia Winson</h5>
                    <p className="text-[9px] text-[#85B581] font-black uppercase tracking-wider">Physiotherapy</p>
                  </div>
                  <button 
                    onClick={() => router.push("/call")}
                    className="px-4 py-1.5 rounded-full bg-[#85B581] hover:bg-[#74A370] text-white font-bold text-[10px] transition-all active:scale-95"
                  >
                    Video call
                  </button>
                </div>

                {/* Date / Time summary badges */}
                <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-teal-900/40 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    <span>14 Mar 2022</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-teal-900/40 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-xs">alarm</span>
                    <span>09.00 pm</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Patient Activities / Harmony Chart */}
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-black text-slate-800 dark:text-slate-100 text-sm tracking-wide">Patient activities</h3>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">Month</span>
                  <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#122A26] rounded-3xl p-6 border border-[#E9F0EC] dark:border-teal-900/30 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-sm">
                
                {/* Custom graph layout replicating the image mockup */}
                <div className="md:col-span-8 space-y-4">
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold">Today, 5 October 2022</p>
                  
                  {/* Grid of bars */}
                  <div className="h-40 flex items-end justify-between gap-2 pt-4 px-2">
                    {monthlyActivity.map((act, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div 
                          className="w-full bg-[#85B581]/20 hover:bg-[#85B581] rounded-t-lg transition-all duration-500 cursor-pointer relative group"
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

                {/* Info Card (Good Conditions) */}
                <div className="md:col-span-4 flex flex-col justify-center gap-4">
                  <div className="p-4 rounded-2xl bg-[#F5F8F6] dark:bg-teal-950/20 border border-slate-200/50 dark:border-teal-900/20 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-teal-950/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🩺</span>
                      <div>
                        <h5 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Good conditions</h5>
                        <p className="text-[9px] text-slate-400 font-bold">Anxiety & wellness</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
                  </div>
                  
                  {/* Spark ideas module */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E1EFE7] to-white dark:from-teal-950/30 dark:to-transparent border border-[#D2E4DA] dark:border-teal-900/30 space-y-3">
                    <div className="text-left space-y-1">
                      <span className="text-[8px] font-black uppercase text-[#74A370] tracking-widest">Interactive ideas</span>
                      <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Tailored Date Idea 🥂</h4>
                    </div>
                    
                    <div className="bg-white border border-[#D2E4DA]/20 p-3.5 rounded-xl text-center space-y-1">
                      <h5 className="font-heading font-black text-[11px] text-slate-800 pt-0.5">{currentDateIdea.title}</h5>
                      <p className="text-[9px] text-slate-400 leading-normal font-bold">
                        {currentDateIdea.desc}
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateDate}
                      disabled={isSpinning}
                      className="w-full py-2 bg-[#85B581] hover:bg-[#74A370] text-white rounded-full font-bold text-[9px] uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {isSpinning ? "Drawing... 🎲" : "Generate Idea ✨"}
                    </button>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}
      </main>

      {/* 4. APPOINTMENTS SCHEDULE & CALENDAR (Rightmost Panel) */}
      <aside className="w-[340px] bg-white dark:bg-[#11222C] border-l border-slate-200/50 dark:border-teal-900/30 p-6 flex flex-col justify-between flex-shrink-0 overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-heading font-black text-slate-800 dark:text-slate-100 text-sm tracking-wide">List of appointments</h3>
          </div>

          {/* Selector Switch (Monthly / Daily) */}
          <div className="grid grid-cols-2 p-1 bg-[#F5F8F6] dark:bg-teal-950/20 rounded-xl border border-slate-200/40">
            <button 
              onClick={() => setActiveTab("Monthly")}
              className={`py-2 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === "Monthly" 
                  ? "bg-[#85B581] text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setActiveTab("Daily")}
              className={`py-2 text-center rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeTab === "Daily" 
                  ? "bg-[#85B581] text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Daily
            </button>
          </div>

          {/* Interactive Calendar Grid */}
          <div className="bg-[#F5F8F6] dark:bg-teal-950/10 rounded-2xl p-4 border border-slate-200/35 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">October 2022</span>
              <div className="flex gap-2 text-slate-400">
                <span className="material-symbols-outlined text-sm cursor-pointer hover:text-slate-600">chevron_left</span>
                <span className="material-symbols-outlined text-sm cursor-pointer hover:text-slate-600">chevron_right</span>
              </div>
            </div>

            {/* Calendar grid wrapper */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500">
              {/* Day headers */}
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              
              {/* Padding */}
              {calendarPadding.map((_, i) => <span key={`pad-${i}`} />)}

              {/* Day numbers */}
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

          {/* Daily Progress circle matching image design */}
          <div className="bg-[#EBF7F2] dark:bg-teal-950/20 p-5 rounded-2xl border border-[#D2E4DA]/40 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Daily progress</h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-400 font-bold leading-normal">
                Keep improving the quality of your health
              </p>
            </div>
            
            {/* SVG circle */}
            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#D2E4DA" strokeWidth="4.5" fill="transparent" />
                <circle cx="32" cy="32" r="26" stroke="#85B581" strokeWidth="4.5" fill="transparent"
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

          {/* Activity schedule listing layout (Manage stress, Physiotherapy) */}
          <div className="space-y-3 pt-2">
            {tasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.completed)}
                className="p-3.5 rounded-2xl bg-[#F5F8F6] dark:bg-teal-950/20 border border-slate-200/50 dark:border-teal-900/20 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-all active:scale-[0.99] select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                    task.completed ? "bg-[#85B581] border-[#85B581] text-white" : "border-slate-300 bg-white"
                  }`}>
                    {task.completed && <span className="material-symbols-outlined text-[9px] font-black">check</span>}
                  </div>
                  <div>
                    <h5 className={`font-heading font-black text-xs text-slate-800 dark:text-slate-100 ${task.completed ? "line-through text-slate-400" : ""}`}>
                      {task.text.split(" ").slice(1, 4).join(" ")}
                    </h5>
                    <p className="text-[9px] text-slate-400 font-bold">Active Habit</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-slate-400">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* See More Schedules link */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
          <button 
            onClick={() => setCalmZoneActive(true)}
            className="flex items-center gap-1.5 text-[10px] font-black text-[#74A370] uppercase tracking-wider hover:underline"
          >
            <span>See More Schedule</span>
            <span className="material-symbols-outlined text-xs">arrow_right_alt</span>
          </button>
        </div>
      </aside>

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
              {/* Close Button */}
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

              {/* Steps Area */}
              <div className="bg-white dark:bg-[#1A3A4E] border border-slate-200/40 p-6 rounded-3xl min-h-[220px] flex flex-col justify-between text-left">
                
                {/* Step 1: Mutual Pause & Breathing */}
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
                            breathingPhase === "Inhale" ? "bg-[#85B581]/30" : breathingPhase === "Hold" ? "bg-amber-100/50" : "bg-teal-500/25"
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
                        className="px-4 py-2 bg-[#85B581] hover:bg-[#74A370] text-white text-xs font-bold rounded-full shadow-xs active:scale-95"
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
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Use "I Feel" phrasing</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
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
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Repeat back what you heard</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
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
                    <h4 className="font-heading font-black text-sm text-slate-800 dark:text-slate-100">Find a shared micro-action</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-300 leading-relaxed">
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
                        i + 1 === calmStep ? "w-6 bg-[#85B581]" : "w-1.5 bg-slate-200 dark:bg-slate-700"
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
                    className="flex-1 py-2.5 bg-[#85B581] hover:bg-[#74A370] text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setCalmZoneActive(false);
                      setBreathingActive(false);
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-tr from-[#85B581] to-teal-600 text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95 animate-bounce"
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
