"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

// Couples Relationship Goals & Tasks
const INITIAL_HARMONY_TASKS = [
  { id: 1, text: "💬 Share one genuine appreciation with your partner today", completed: false },
  { id: 2, text: "🧘 Complete a 3-minute synchronized breathing pause together", completed: false },
  { id: 3, text: "🔇 Set devices to 'Do Not Disturb' for at least 1 hour of quality time", completed: false },
  { id: 4, text: "💌 Leave a sweet or supportive note in their physical/digital journal", completed: false },
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
    cardBg: "bg-gradient-to-r from-[#FFFDF2]/90 via-[#FFF3EB]/90 to-[#ECE5F5]/90 border-amber-200/50 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-tertiary",
    textMuted: "text-slate-600",
    btnHover: "hover:bg-black/5",
    bellIcon: "text-slate-700",
    bellHover: "hover:bg-slate-800/10",
  },
  afternoon: {
    cardBg: "bg-gradient-to-r from-[#F2F4FD]/90 via-[#ECE6F6]/90 to-[#FCE6EC]/90 border-primary/20 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-primary",
    textMuted: "text-slate-600",
    btnHover: "hover:bg-black/5",
    bellIcon: "text-slate-700",
    bellHover: "hover:bg-slate-800/10",
  },
  evening: {
    cardBg: "bg-gradient-to-r from-[#FFF4E4]/95 via-[#FDE4EB]/95 to-[#ECE7F6]/95 border-orange-200/60 shadow-soft",
    textTitle: "text-slate-800",
    textSubtitle: "text-tertiary font-black",
    textMuted: "text-slate-600 font-semibold",
    btnHover: "hover:bg-black/5",
    bellIcon: "text-slate-700",
    bellHover: "hover:bg-slate-800/10",
  },
  night: {
    cardBg: "bg-gradient-to-r from-[#0C0F1A]/95 via-[#141B2E]/95 to-[#2A2045]/95 border-[#2A2045]/60 shadow-dark-soft",
    textTitle: "text-white",
    textSubtitle: "text-pink/90 font-black",
    textMuted: "text-slate-300 font-semibold",
    btnHover: "hover:bg-white/10",
    bellIcon: "text-slate-200",
    bellHover: "hover:bg-white/10",
  }
};

export default function CouplesDashboard() {
  const router = useRouter();
  
  // Profile / Username & Partner link states
  const [partnerName, setPartnerName] = useState("Elena");
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [tempPartnerName, setTempPartnerName] = useState("Elena");
  
  const [userName, setUserName] = useState("Kartik");
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

  useEffect(() => {
    const session = getClientSession();
    if (session && session.isAuthenticated && session.user) {
      setUserName(session.user.sanctuaryName || session.user.name || "Harmony Partner");
      setEmail(session.user.email || "");
    } else {
      const storedUsername = localStorage.getItem("couple_username") || "RomanticSparrow";
      setUserName(storedUsername);
    }

    const storedPartner = localStorage.getItem("couple_partner_name") || "Elena";
    setPartnerName(storedPartner);
    setTempPartnerName(storedPartner);

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
  }, []);

  // Save Partner Name
  const savePartnerName = () => {
    if (!tempPartnerName.trim()) return;
    setPartnerName(tempPartnerName.trim());
    localStorage.setItem("couple_partner_name", tempPartnerName.trim());
    setIsEditingPartner(false);
  };

  // Toggle Task Completion
  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Spin/Generate a new date idea
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

  // Calculations
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F4FD] via-[#ECE6F6] to-[#FCE6EC] p-3 md:p-6 text-on-surface relative font-sans">
      
      {/* Background Graphic Blurs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[110px] opacity-25 bg-[#FDA4AF]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full blur-[130px] opacity-20 bg-[#8F7FD8]" />
      </div>

      <div className="z-10 relative space-y-6 max-w-7xl mx-auto">
        
        {/* ==================== BACK NAVIGATION ==================== */}
        <div className="flex items-center justify-between">
          <button 
            onClick={async () => {
              await signOut();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-variant/20 text-xs font-bold text-primary shadow-sm hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
            Back to home
          </button>
        </div>

        {/* ==================== DISCLAIMER BANNER ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-rose-200/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤫</span>
            <div>
              <h4 className="font-heading font-black text-xs text-on-surface">Private Harmony Sanctum</h4>
              <p className="text-[10px] text-on-surface-variant font-semibold">
                Your partnership reflections remain fully confidential. Everything you journal, rate, or resolve is stored strictly on your device.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
            Private Connection
          </span>
        </motion.div>

        {/* ==================== 1. HEADER & CONNECTION STATE ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 rounded-3xl border backdrop-blur-md gap-4 transition-all duration-500 ${HEADER_THEMES[timeOfDay].cardBg}`}
        >
          <div className="flex items-start gap-4 flex-1">
            {/* Profile Avatar in Left Corner */}
            <div 
              onClick={() => router.push("/profile")} 
              className="w-14 h-14 rounded-full border-2 border-rose-300/20 bg-rose-100 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform flex-shrink-0"
              title="View Profile"
            >
              <span className="text-2xl">💖</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{timeIcon}</span>
                <span className={`text-xs uppercase tracking-wider font-extrabold transition-colors duration-500 ${HEADER_THEMES[timeOfDay].textSubtitle}`}>
                  Couples Harmony Sanctuary
                </span>
              </div>
              
              <div className="flex items-center flex-wrap gap-2">
                <h1 className={`text-2xl sm:text-3xl font-heading font-black flex items-center gap-2 transition-colors duration-500 ${HEADER_THEMES[timeOfDay].textTitle}`}>
                  {greeting}, {showName ? userName : "••••••••"}
                </h1>
                
                {/* Hide/Show Name Toggle */}
                <button 
                  onClick={() => setShowName(!showName)}
                  className={`p-1 rounded-full transition-colors duration-300 ${HEADER_THEMES[timeOfDay].btnHover} ${HEADER_THEMES[timeOfDay].textTitle}`}
                  title={showName ? "Hide Name" : "Show Name"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showName ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Partner Link Info */}
              <div className={`flex items-center gap-2 flex-wrap pt-0.5 text-xs font-semibold transition-colors duration-500 ${HEADER_THEMES[timeOfDay].textMuted}`}>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${timeOfDay === 'night' ? 'bg-white/10 border-white/10 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                  <span className="material-symbols-outlined text-xs">link</span>
                  <span>Linked with: <strong>{partnerName}</strong></span>
                </span>
                {email && <span className="opacity-90">• {email}</span>}
                
                {isEditingPartner ? (
                  <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                    <input 
                      type="text" 
                      value={tempPartnerName}
                      onChange={(e) => setTempPartnerName(e.target.value)}
                      className="px-2 py-0.5 bg-white border border-surface-variant/40 rounded text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button onClick={savePartnerName} className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">Save</button>
                    <button onClick={() => setIsEditingPartner(false)} className={`text-[10px] font-bold ${timeOfDay === 'night' ? 'text-slate-300 hover:text-white' : 'text-on-surface-variant'}`}>Cancel</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setTempPartnerName(partnerName);
                      setIsEditingPartner(true);
                    }}
                    className={`text-[10px] font-bold hover:underline ${timeOfDay === 'night' ? 'text-rose-300' : 'text-primary'}`}
                  >
                    (Change Partner Name)
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0 self-end sm:self-center">
            {/* Notification Icon */}
            <div className={`relative cursor-pointer p-2 rounded-full transition-colors duration-300 ${HEADER_THEMES[timeOfDay].btnHover}`}>
              <span className={`material-symbols-outlined text-2xl transition-colors duration-500 ${HEADER_THEMES[timeOfDay].bellIcon}`}>notifications</span>
              <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ${timeOfDay === 'night' ? 'ring-slate-900' : 'ring-white'}`} />
            </div>
          </div>
        </motion.div>

        {/* ==================== 2. MAIN WIDGETS GRID ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Wellness Summary (Left Column - 7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Harmony score widget */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[36px] border border-white/60 shadow-soft space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Harmony Status</span>
                  <h3 className="text-xl font-heading font-black text-on-surface">Relationship Balance</h3>
                </div>
                <span className="text-3xl">🧩</span>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs font-bold text-on-surface-variant">
                  <span>Connection Strength</span>
                  <span className="text-primary text-sm font-black">{harmonyScore}%</span>
                </div>
                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-surface-variant/10 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7C6BC4] to-[#FDA4AF] rounded-full"
                    style={{ width: `${harmonyScore}%` }}
                  />
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                
                {/* Communication Slider */}
                <div className="p-4 rounded-2xl bg-white/40 border border-white/40 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>💬 Conversation</span>
                    <span className="text-primary font-black">{communicationScore}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={communicationScore}
                    onChange={(e) => setCommunicationScore(parseInt(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <p className="text-[9px] text-on-surface-variant leading-tight">Rate your communication quality today.</p>
                </div>

                {/* Energy Slider */}
                <div className="p-4 rounded-2xl bg-white/40 border border-white/40 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>⚡ Energy</span>
                    <span className="text-secondary font-black">{energyLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full accent-secondary cursor-pointer"
                  />
                  <p className="text-[9px] text-on-surface-variant leading-tight">Shared physical and emotional capacity.</p>
                </div>

                {/* Stress Slider */}
                <div className="p-4 rounded-2xl bg-white/40 border border-white/40 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span>🧘 Stress</span>
                    <span className="text-rose-500 font-black">{stressLevel}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                  <p className="text-[9px] text-on-surface-variant leading-tight">Perceived relationship tension rate.</p>
                </div>

              </div>
            </div>

            {/* Today's Focus Task List */}
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[36px] border border-white/60 shadow-soft space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Daily Milestones</span>
                  <h3 className="text-xl font-heading font-black text-on-surface">Relationship Habits</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-black border border-rose-100">
                    {progressPercent}% Complete
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-400 to-[#7C6BC4] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/45 cursor-pointer active:scale-[0.99] transition-all select-none"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-surface-variant/50 bg-white"
                    }`}>
                      {task.completed && <span className="material-symbols-outlined text-xs font-black">check</span>}
                    </div>
                    <span className={`text-xs font-semibold leading-relaxed ${task.completed ? "line-through text-on-surface-variant/65" : "text-on-surface"}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Side Panels (Right Column - 5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interactive Date Night Spinner */}
            <div className="bg-gradient-to-br from-rose-50 to-[#FCE6EC] p-6 rounded-[36px] border border-rose-200/50 shadow-soft space-y-5">
              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-rose-700">Spark Harmony</span>
                <h3 className="text-xl font-heading font-black text-on-surface">Date Night Planner 🥂</h3>
                <p className="text-[10px] text-on-surface-variant/80 font-medium">Need inspiration? Generate a tailored activity to do together.</p>
              </div>

              <div className="bg-white border border-rose-200/35 p-5 rounded-3xl min-h-[140px] flex flex-col justify-between shadow-soft-sm relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentDateIdea.title}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="space-y-2 text-center"
                  >
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                      {currentDateIdea.category}
                    </span>
                    <h4 className="font-heading font-black text-sm text-on-surface pt-1">{currentDateIdea.title}</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed px-2 font-medium">
                      {currentDateIdea.desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={handleGenerateDate}
                disabled={isSpinning}
                className="w-full py-3.5 bg-gradient-to-tr from-rose-400 to-[#7C6BC4] text-white rounded-full font-bold text-xs shadow-md hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50"
              >
                {isSpinning ? "Drawing Date Idea... 🎲" : "Generate Date Idea ✨"}
              </button>
            </div>

            {/* Conflict Calm Zone trigger */}
            <div className="bg-[#2E2A3D] text-white p-6 rounded-[36px] border border-white/10 shadow-soft flex flex-col justify-between min-h-[220px]">
              <div className="space-y-2 text-left">
                <span className="px-3 py-1 rounded-full bg-white/15 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                  calm emergency portal
                </span>
                <h3 className="text-xl font-heading font-black pt-2">Relationship Calm Zone</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  In a high-tension conversation or disagreement? Let's take a mutual pause to slow down and listen with empathy.
                </p>
              </div>

              <button
                onClick={() => {
                  setCalmStep(1);
                  setCalmZoneActive(true);
                  setBreathingActive(false);
                }}
                className="w-full py-3 bg-white/15 hover:bg-white/25 border border-white/20 text-white rounded-full font-bold text-xs transition-all active:scale-95 text-center"
              >
                Open Calm Guide 🛡️
              </button>
            </div>

          </div>

        </div>

      </div>

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
                        className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-full shadow-xs active:scale-95"
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
