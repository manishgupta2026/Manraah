"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

// Core Parent Themes & Colors
const MOODS = [
  { emoji: "😊", name: "Joyful", color: "bg-amber-100 text-amber-800" },
  { emoji: "😌", name: "Calm", color: "bg-emerald-100 text-emerald-800" },
  { emoji: "🥱", name: "Tired", color: "bg-blue-100 text-blue-800" },
  { emoji: "🤯", name: "Overwhelmed", color: "bg-rose-100 text-rose-800" },
  { emoji: "😔", name: "Anxious", color: "bg-purple-100 text-purple-800" },
];

const ADVICE_SCENARIOS = {
  tantrum: {
    title: "🍼 Toddler Tantrum",
    advice: "A child's meltdown is a reflection of their nervous system being overloaded, not your parenting. Drop your shoulders, breathe in deeply for 4 seconds, and meet their big feelings with your calm."
  },
  sibling: {
    title: "💥 Sibling Conflict",
    advice: "Avoid taking sides immediately. Separate the children if needed, and let each describe their feelings. Use reflective listening: 'It sounds like you felt frustrated when your block tower was knocked down.'"
  },
  screentime: {
    title: "📱 Screen Time Battle",
    advice: "Establish clear boundaries in advance. Use a visual timer and offer a pleasant transition activity (like a shared puzzle, story, or outdoor play) to ease the transition."
  },
  bedtime: {
    title: "😴 Bedtime Struggle",
    advice: "Create a warm, consistent wind-down routine 1 hour before bed. Eliminate screens, dim lights, and read a gentle story together. Keep your own energy calm and grounded as they transition."
  }
};

const COMMUNICATION_TIPS = [
  "A child's behavior is communication. Look for the need beneath.",
  "Connect before you redirect. Hug or make eye contact first.",
  "Use 'I' statements: 'I feel worried when there's shouting because it's hard to hear.'",
  "Praise the effort, not the outcome: 'I noticed how hard you worked on cleaning up.'",
  "Pause for 3 seconds before responding to a stressful question."
];

export default function ParentDashboard() {
  const router = useRouter();
  
  // Custom Username & Visibility States
  const [username, setUsername] = useState("CalmParent-3804");
  const [email, setEmail] = useState("");
  const [showName, setShowName] = useState(true);

  // Phone Number & Visibility States
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [phoneNumber] = useState("+91 ••••• ••982");

  // Dynamic Greeting based on time
  const [greeting, setGreeting] = useState("Hello");
  const [timeIcon, setTimeIcon] = useState("🌅");
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("morning");

  // User States
  const [selectedMood, setSelectedMood] = useState("Calm");
  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState("😌");
  const [stressLevel, setStressLevel] = useState(4);
  const [energyLevel, setEnergyLevel] = useState(6);
  const [sleepHours, setSleepHours] = useState(7.0);
  const [sleepQuality, setSleepQuality] = useState<"Deep" | "Light" | "Interrupted">("Light");

  // Today's Focus checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: "💧 Log water intake (at least 4 glasses)?", completed: false },
    { id: 2, text: "🧘 Complete a 2-minute breathing space?", completed: false },
    { id: 3, text: "🔇 Put devices away for family dinner time?", completed: false },
    { id: 4, text: "🚶 Take a 15-minute mindful self-care walk?", completed: false },
  ]);

  // Family Wellness
  const [familyScore, setFamilyScore] = useState(82);
  const [selectedDay, setSelectedDay] = useState(6);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [familyTime, setFamilyTime] = useState(40); // in minutes
  const [activeTipIdx, setActiveTipIdx] = useState(0);

  // Personal Care
  const [meTimeMinutes, setMeTimeMinutes] = useState(15);
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathingSeconds, setBreathingSeconds] = useState(4);

  // Journal
  const [journalInput, setJournalInput] = useState("");
  const [journalEntries, setJournalEntries] = useState([
    { date: "Yesterday", content: "Had a wonderful screen-free dinner. The kids shared funny stories from school." },
    { date: "Aug 3", content: "Felt overwhelmed in the morning, but taking a 3-minute pause helped me react calmly." }
  ]);
  const [saveStatus, setSaveStatus] = useState("");

  // AI Chat & Advice
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatLogs, setAiChatLogs] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! How is your parenting journey going today? Ask me any advice or vent your feelings." }
  ]);

  // Overwhelmed Grounding Box
  const [overwhelmedMode, setOverwhelmedMode] = useState(false);
  const [groundingStep, setGroundingStep] = useState(1);

  // Periodic Privacy "Not Watched" Popup State
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Set greeting, username and security popup times
  useEffect(() => {
    // 1. Initial Load Username
    const session = getClientSession();
    const storedUsername = localStorage.getItem("parent_username");
    if (storedUsername) {
      setUsername(storedUsername);
      if (session && session.isAuthenticated && session.user) {
        setEmail(session.user.email || "");
      }
    } else if (session && session.isAuthenticated && session.user) {
      setUsername(session.user.sanctuaryName || session.user.name || "Mindful Parent");
      setEmail(session.user.email || "");
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const initialName = `CalmParent-${randomNum}`;
      setUsername(initialName);
      localStorage.setItem("parent_username", initialName);
    }

    // 2. Load ShowPhone Setting
    const storedShowPhone = localStorage.getItem("parent_show_phone");
    if (storedShowPhone === "true") {
      setShowPhoneNumber(true);
    }

    // 3. Time Greeting
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

    // 4. Periodic "Not Watched" Popup check (2 minutes interval for demo convenience)
    const lastPopupTime = localStorage.getItem("parent_last_security_popup");
    const now = Date.now();
    
    if (!lastPopupTime || now - parseInt(lastPopupTime) > 120000) {
      // Show popup
      setShowSecurityPopup(true);
      localStorage.setItem("parent_last_security_popup", now.toString());
    }
  }, []);

  // Fetch live dashboard & assessment details on mount
  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load dashboard data");
      })
      .then((data) => {
        setDashboardData(data);
        if (data.user) {
          // Sync real sanctuary name
          if (data.user.sanctuaryName || data.user.name) {
            setUsername(data.user.sanctuaryName || data.user.name);
          }
          // Calculate wellness score as per the assessment completion percentage
          if (data.user.assessmentPercentage !== null && data.user.assessmentPercentage !== undefined) {
            setFamilyScore(data.user.assessmentPercentage);
          }
        }
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoadingData(false);
      });
  }, []);

  // Tip rotator timer
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTipIdx((prev) => (prev + 1) % COMMUNICATION_TIPS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Breathing Visualizer Loop
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

  // Tasks progress calculations
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Toggle Task Completion
  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Add Water Glass
  const toggleWaterGlass = (index: number) => {
    if (index + 1 === waterGlasses) {
      setWaterGlasses(index); 
    } else {
      setWaterGlasses(index + 1);
    }
  };

  // Save Journal Entry
  const handleSaveJournal = () => {
    if (!journalInput.trim()) return;
    setSaveStatus("saving");
    setTimeout(() => {
      setJournalEntries(prev => [
        { date: "Today", content: journalInput.trim() },
        ...prev
      ]);
      setJournalInput("");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    }, 800);
  };

  // Quick AI Chat Submit
  const handleAiChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = aiChatInput.trim();
    setAiChatLogs(prev => [...prev, { sender: "user", text: userMsg }]);
    setAiChatInput("");

    // Simulate AI response
    setTimeout(() => {
      let reply = "I understand. That sounds challenging. Take a deep breath. Remember that you are doing your best, and that is enough.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes("tantrum") || lower.includes("scream") || lower.includes("crying")) {
        reply = ADVICE_SCENARIOS.tantrum.advice;
      } else if (lower.includes("sleep") || lower.includes("bedtime") || lower.includes("wake")) {
        reply = ADVICE_SCENARIOS.bedtime.advice;
      } else if (lower.includes("fight") || lower.includes("sibling") || lower.includes("brother") || lower.includes("sister")) {
        reply = ADVICE_SCENARIOS.sibling.advice;
      } else if (lower.includes("screen") || lower.includes("ipad") || lower.includes("phone") || lower.includes("game")) {
        reply = ADVICE_SCENARIOS.screentime.advice;
      } else if (lower.includes("tired") || lower.includes("exhausted") || lower.includes("burnout")) {
        reply = "Parental fatigue is real and heavy. Today, can you drop one non-essential chore and choose 10 minutes of quiet rest instead?";
      }

      setAiChatLogs(prev => [...prev, { sender: "ai", text: reply }]);
    }, 1000);
  };

  // Trigger Overwhelmed mode
  const launchOverwhelmedMode = () => {
    setOverwhelmedMode(true);
    setGroundingStep(1);
  };

  // Date Formatting
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString("en-US", options);
  };

  // State for right panel tabs (Monthly vs Daily)
  const [activeTab, setActiveTab] = useState<"monthly" | "daily">("monthly");

  // Mood Overview segments calculation from weekly mood checkins
  const getWeeklyMoodDistribution = () => {
    const defaultDistribution = { amazing: 30, good: 25, neutral: 20, notGood: 15, bad: 10 };
    if (!dashboardData || !dashboardData.history) return defaultDistribution;
    
    // Filter history to last 7 days
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEntries = dashboardData.history.filter((e: any) => new Date(e.created_at || e.createdAt) >= startOfWeek);
    
    if (weeklyEntries.length === 0) return defaultDistribution;
    
    let amazing = 0, good = 0, neutral = 0, notGood = 0, bad = 0;
    
    weeklyEntries.forEach((e: any) => {
      const m = (e.mood || "").toLowerCase();
      if (m === "amazing" || m === "happy" || m === "joyful") {
        amazing++;
      } else if (m === "calm" || m === "good") {
        good++;
      } else if (m === "neutral") {
        neutral++;
      } else if (m === "low" || m === "sad" || m === "frustrated" || m === "exhausted" || m === "tired") {
        notGood++;
      } else if (m === "anxious" || m === "overwhelmed") {
        bad++;
      } else {
        good++; // default fallback
      }
    });
    
    const total = amazing + good + neutral + notGood + bad;
    if (total === 0) return defaultDistribution;
    
    const amazingPct = Math.round((amazing / total) * 100);
    const goodPct = Math.round((good / total) * 100);
    const neutralPct = Math.round((neutral / total) * 100);
    const notGoodPct = Math.round((notGood / total) * 100);
    const badPct = 100 - amazingPct - goodPct - neutralPct - notGoodPct;
    
    return { amazing: amazingPct, good: goodPct, neutral: neutralPct, notGood: notGoodPct, bad: badPct };
  };

  const distribution = getWeeklyMoodDistribution();

  const amazingVal = distribution.amazing / 100;
  const notGoodVal = distribution.notGood / 100;
  const badVal = distribution.bad / 100;
  const neutralVal = distribution.neutral / 100;
  const goodVal = distribution.good / 100;

  // Slices
  const amazingStart = 0;
  const amazingEnd = amazingVal;
  
  const notGoodStart = amazingEnd;
  const notGoodEnd = notGoodStart + notGoodVal;
  
  const badStart = notGoodEnd;
  const badEnd = badStart + badVal;
  
  const neutralStart = badEnd;
  const neutralEnd = neutralStart + neutralVal;
  
  const goodStart = neutralEnd;
  const goodEnd = 1.0;

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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 relative select-none animate-fadeIn bg-[#F8F9FD] min-h-screen">
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-[0.02] bg-[#F5C99B]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full blur-[140px] opacity-[0.02] bg-[#7C6BC4]" />
      </div>

      <div className="z-10 relative space-y-6">
        
        {/* ==================== TOP NAVIGATION ROW ==================== */}
        <div className="flex items-center justify-between">
          <button 
            onClick={async () => {
              window.location.href = "/";
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EAEAFF] text-xs font-bold text-[#7C6BC4] shadow-sm hover:bg-[#F2F4FD] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
            Back to home
          </button>

          <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-[#006B56] text-[10px] font-black uppercase tracking-wider border border-emerald-100/50">
            🔒 Private Sanctuary Connection
          </span>
        </div>

        {/* ==================== THREE-COLUMN LAYOUT GRID ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ────────────────────────────────────────────────────────────
              COLUMN 1: MINT SIDEBAR (col-span-3)
              ──────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#E6F4F0] rounded-[32px] p-6 border border-[#CBECE2] shadow-[0_10px_35px_rgba(0,107,86,0.03)] text-center space-y-6 flex flex-col justify-between min-h-[480px]">
              
              {/* Profile details */}
              <div className="space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-full h-full rounded-full border-4 border-white bg-[#F5C99B]/40 flex items-center justify-center shadow-sm">
                    <span className="text-4xl">👩‍👦</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#006B56] border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white">✓</span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-black text-slate-800 text-sm">Check your condition</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Check your every situation, stress factors, and parenting activities.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => router.push("/checkin")}
                className="w-full py-3 rounded-2xl bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                Check It Now
              </button>

              {/* Vector Artwork/Illustration placeholder */}
              <div className="pt-4 border-t border-[#D0EDE4] flex justify-center overflow-hidden rounded-2xl">
                <img 
                  src="/images/pediatrician_consult.jpg" 
                  alt="Pediatrician Consult" 
                  className="w-full h-auto object-cover max-h-[140px] hover:scale-105 transition-transform duration-500 rounded-xl"
                />
              </div>

            </div>

            {/* Extra safety assurances */}
            <div className="bg-white rounded-[24px] border border-[#EAEAFF] p-4 flex items-center gap-3">
              <span className="text-xl">🤫</span>
              <div>
                <h5 className="text-[11px] font-heading font-black text-slate-800">100% Confidential</h5>
                <p className="text-[9px] text-slate-400 font-semibold leading-tight">No data ever leaves this device.</p>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────
              COLUMN 2: MAIN PANEL (col-span-6)
              ──────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Header / Greet */}
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4] block mb-0.5 font-heading">
                Welcome back
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-800 flex items-center gap-2">
                Hi, {showName ? username : "••••••••"}
              </h1>
              <p className="text-xs text-slate-400 font-bold">Let's track your health & parenting wellness daily!</p>
            </div>

            {/* Upcoming Appointment Card */}
            <div className="bg-white rounded-[32px] border border-[#EAEAFF] shadow-[0_10px_35px_rgba(95,78,165,0.02)] p-6 space-y-4">
              <h3 className="font-heading font-black text-xs text-slate-800 uppercase tracking-wider">Upcoming appointment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Left Card: Hospital details */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div className="rounded-2xl overflow-hidden relative aspect-video bg-sky-100 flex items-center justify-center border border-[#EAEAFF] min-h-[120px]">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/clinic_card_bg.jpg')" }} />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-800">Manggis ST Hospital</h4>
                    <p className="text-[9px] text-slate-400 font-bold">New York, USA</p>
                  </div>
                </div>

                {/* Right Card: Doctor Details & Action */}
                <div className="bg-[#F8F9FD] border border-[#EAEAFF] rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#006B56]/10 flex items-center justify-center text-lg flex-shrink-0 border border-white shadow-sm overflow-hidden">
                      <img 
                        src="/images/therapist_sarah.jpg" 
                        alt="Doctor Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="material-symbols-outlined text-base text-[#006B56] font-black">person</span>
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-xs text-slate-800">Dr. Sarah Jenkins</h4>
                      <p className="text-[9px] text-slate-400 font-bold">Child Psychology</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#EAEAFF]/70">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Sanctuary Consultant</span>
                    <button 
                      onClick={() => router.push("/call")}
                      className="px-4 py-1.5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white font-bold text-[9px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[10px] font-black">videocam</span>
                      Video call
                    </button>
                  </div>
                </div>
              </div>

              {/* Scheduled slots row below both cards */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#EAEAFF]/50">
                <div className="p-3 bg-[#F8F9FD] border border-[#EAEAFF] rounded-2xl flex items-center gap-2 text-[10px] text-slate-500 font-semibold shadow-2xs">
                  <span className="material-symbols-outlined text-xs text-[#006B56] font-black">calendar_today</span>
                  <span>14 June 2026</span>
                </div>

                <div className="p-3 bg-[#F8F9FD] border border-[#EAEAFF] rounded-2xl flex items-center gap-2 text-[10px] text-slate-500 font-semibold shadow-2xs">
                  <span className="material-symbols-outlined text-xs text-[#006B56] font-black">schedule</span>
                  <span>09.00 pm</span>
                </div>
              </div>
            </div>

            {/* Activities & Progress Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
              
              {/* Left card: Patient activities (Stress levels/activity trends) */}
              <div className="sm:col-span-7 bg-white rounded-[32px] border border-[#EAEAFF] shadow-[0_10px_35px_rgba(95,78,165,0.02)] p-5 flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-heading font-black text-xs text-slate-800">Parent Activities</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">Stress level & engagement trends</p>
                  </div>
                  
                  <span className="text-[9px] font-black text-[#7C6BC4] bg-[#7C6BC4]/10 py-1 px-2.5 rounded-full">Weekly</span>
                </div>

                {/* Pure CSS Bar Chart */}
                <div className="h-32 flex items-end justify-between px-2 pt-2">
                  {[
                    { val: 65, label: "Mon" },
                    { val: 80, label: "Tue" },
                    { val: 45, label: "Wed" },
                    { val: 70, label: "Thu" },
                    { val: 85, label: "Fri" },
                    { val: 90, label: "Sat" },
                    { val: 50, label: "Sun" }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-3.5 bg-[#E6F4F0] rounded-full h-24 relative overflow-hidden">
                        <div 
                          className="bg-[#006B56] w-full rounded-full absolute bottom-0 transition-all duration-500" 
                          style={{ height: `${bar.val}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 font-bold">{bar.label}</span>
                    </div>
                  ))}
                </div>

                {/* Status Indicator (Restyled to match mockup) */}
                <button 
                  onClick={() => router.push("/journey")}
                  className="w-full p-3 bg-white border border-[#EAEAFF] hover:border-[#7C6BC4]/20 hover:bg-[#F8F9FD] rounded-2xl flex items-center justify-between text-[10px] transition-all shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-sm shadow-2xs flex-shrink-0">💙</div>
                    <div className="text-left">
                      <span className="font-heading font-black text-slate-800 block">Good conditions</span>
                      <span className="text-[9px] text-slate-400 font-bold">Anxiety & wellness stable</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward_ios</span>
                </button>
              </div>

              {/* Right card: Daily progress ring (Soft-green theme matching mockup) */}
              <div 
                onClick={() => setShowProgressModal(true)}
                className="sm:col-span-5 bg-[#EAF6F2] rounded-[32px] border border-[#CBECE2] shadow-[0_10px_35px_rgba(0,107,86,0.01)] p-5 text-center flex flex-col justify-between min-h-[220px] cursor-pointer hover:shadow-[0_12px_40px_rgba(0,107,86,0.05)] hover:border-[#006B56]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              >
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-xs text-[#004D3D] flex items-center justify-center gap-1.5">
                    Daily progress
                    <span className="material-symbols-outlined text-[10px] text-[#006B56]">open_in_new</span>
                  </h4>
                  <p className="text-[9px] text-[#006B56]/60 font-bold">Keep improving the quality of your health</p>
                </div>

                {/* Radial progress ring */}
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="44" className="stroke-white" strokeWidth="7.5" fill="none" />
                    <circle cx="56" cy="56" r="44" className="stroke-[#006B56] transition-all duration-300" strokeWidth="7.5" fill="none" strokeDasharray="276.4" strokeDashoffset={276.4 - (276.4 * progressPercent) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-heading font-black text-[#004D3D]">{progressPercent}%</span>
                    <span className="text-[8px] text-[#006B56]/70 font-bold">Complete</span>
                  </div>
                </div>

                <span className="text-[9px] font-bold text-[#006B56] bg-white py-1 px-3.5 rounded-full inline-block mx-auto hover:bg-[#006B56]/10 transition-colors shadow-2xs border border-[#CBECE2]/50">
                  Tap to Log Goals
                </span>
              </div>

            </div>

            {/* Mood Overview Card */}
            <div className="bg-white rounded-[32px] border border-[#EAEAFF] shadow-[0_10px_35px_rgba(95,78,165,0.02)] p-6 space-y-4">
              <div>
                <h3 className="font-heading font-black text-xs text-slate-800">Mood Overview</h3>
                <p className="text-[9px] text-slate-400 font-bold">Track your mood over time for deeper insights.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left Side: SVG Pie Chart */}
                <div className="md:col-span-6 flex justify-center items-center py-2">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                      {/* 1. Amazing (Blue) */}
                      {distribution.amazing > 0 && (
                        <path d={makePieSlicePath(amazingStart, amazingEnd)} fill="#4A99D3" />
                      )}
                      
                      {/* 2. Not Good (Orange) */}
                      {distribution.notGood > 0 && (
                        <path d={makePieSlicePath(notGoodStart, notGoodEnd)} fill="#E37A47" />
                      )}
                      
                      {/* 3. Bad (Red) */}
                      {distribution.bad > 0 && (
                        <path d={makePieSlicePath(badStart, badEnd)} fill="#D64E4D" />
                      )}
                      
                      {/* 4. Neutral (Yellow) */}
                      {distribution.neutral > 0 && (
                        <path d={makePieSlicePath(neutralStart, neutralEnd)} fill="#ECB22E" />
                      )}
                      
                      {/* 5. Good (Green) */}
                      {distribution.good > 0 && (
                        <path d={makePieSlicePath(goodStart, goodEnd)} fill="#5FBA5A" />
                      )}
                      
                      {/* Inner cutout for donut chart style (makes it feel premium) */}
                      <circle cx="50" cy="50" r="18" fill="white" className="shadow-sm" />
                      <text x="50" y="52.5" fill="#7C6BC4" fontSize="5px" fontWeight="900" textAnchor="middle" letterSpacing="0.2">MOODS</text>

                      {/* Percentage labels centered inside each slice */}
                      {distribution.amazing > 0 && (
                        <text x={getLabelCoordinates(amazingStart, amazingEnd).x} y={getLabelCoordinates(amazingStart, amazingEnd).y} fill="white" fontSize="5.5px" fontWeight="900" textAnchor="middle">{distribution.amazing}%</text>
                      )}
                      {distribution.notGood > 0 && (
                        <text x={getLabelCoordinates(notGoodStart, notGoodEnd).x} y={getLabelCoordinates(notGoodStart, notGoodEnd).y} fill="white" fontSize="5.5px" fontWeight="900" textAnchor="middle">{distribution.notGood}%</text>
                      )}
                      {distribution.bad > 0 && (
                        <text x={getLabelCoordinates(badStart, badEnd).x} y={getLabelCoordinates(badStart, badEnd).y} fill="white" fontSize="5.5px" fontWeight="900" textAnchor="middle">{distribution.bad}%</text>
                      )}
                      {distribution.neutral > 0 && (
                        <text x={getLabelCoordinates(neutralStart, neutralEnd).x} y={getLabelCoordinates(neutralStart, neutralEnd).y} fill="white" fontSize="5.5px" fontWeight="900" textAnchor="middle">{distribution.neutral}%</text>
                      )}
                      {distribution.good > 0 && (
                        <text x={getLabelCoordinates(goodStart, goodEnd).x} y={getLabelCoordinates(goodStart, goodEnd).y} fill="white" fontSize="5.5px" fontWeight="900" textAnchor="middle">{distribution.good}%</text>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Right Side: Legends & Summarize */}
                <div className="md:col-span-6 space-y-4">
                  {/* Legend Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-2 bg-[#D64E4D] rounded-sm" />
                      <span>Bad</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-2 bg-[#ECB22E] rounded-sm" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-2 bg-[#E37A47] rounded-sm" />
                      <span>Not Good</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-2 bg-[#5FBA5A] rounded-sm" />
                      <span>Good</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:col-span-2">
                      <span className="w-3.5 h-2 bg-[#4A99D3] rounded-sm" />
                      <span>Amazing</span>
                    </div>
                  </div>

                  {/* Summarize Text Box */}
                  <div className="space-y-1.5 pt-2.5 border-t border-[#EAEAFF]">
                    <h5 className="text-[9px] uppercase font-black tracking-wider text-slate-700 font-heading">Summarize</h5>
                    <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                      You experienced a range of moods this week. To stay balanced, try journaling, light exercise, talking to someone you trust, or taking rest and reflect regularly.
                    </p>
                  </div>
                </div>
              </div>
            </div>



          </div>

          {/* ────────────────────────────────────────────────────────────
              COLUMN 3: RIGHT PANEL (col-span-3)
              ──────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4 flex flex-col gap-4 space-y-0">
            
            {/* List of Appointments card */}
            <div className="bg-white rounded-[32px] border border-[#EAEAFF] shadow-[0_10px_35px_rgba(95,78,165,0.02)] p-5 space-y-4">
              <h3 className="font-heading font-black text-xs text-slate-800">List of appointments</h3>
              
              {/* Aligned Tabs Switcher */}
              <div className="flex border-b border-[#EAEAFF] w-full">
                <button
                  onClick={() => setActiveTab("monthly")}
                  className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all ${
                    activeTab === "monthly" 
                      ? "border-[#006B56] text-[#006B56]" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setActiveTab("daily")}
                  className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all ${
                    activeTab === "daily" 
                      ? "border-[#006B56] text-[#006B56]" 
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Daily Focus
                </button>
              </div>

              {/* Tab 1 content: Monthly Calendar view */}
              {activeTab === "monthly" && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-600 font-extrabold px-1 font-heading">
                    <span>October 2026</span>
                    <div className="flex gap-1.5">
                      <button className="w-5 h-5 rounded bg-[#F8F9FD] border border-[#EAEAFF] flex items-center justify-center hover:bg-slate-50 text-[10px]">‹</button>
                      <button className="w-5 h-5 rounded bg-[#F8F9FD] border border-[#EAEAFF] flex items-center justify-center hover:bg-slate-50 text-[10px]">›</button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[8px] font-bold">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                      <span key={i} className="text-slate-400 uppercase font-black pb-1">{d}</span>
                    ))}
                    {Array.from({ length: 31 }).map((_, idx) => {
                      const day = idx + 1;
                      const isSelected = day === selectedDay;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDay(day)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-[8px] ${
                            isSelected 
                              ? "bg-[#E37A47] text-white font-black shadow-sm scale-110" 
                              : "text-slate-700 hover:bg-[#F8F9FD]"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2 content: Daily Focus checklist */}
              {activeTab === "daily" && (
                <div className="space-y-3 pt-2">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8F9FD] cursor-pointer transition-colors"
                    >
                      <span className={`material-symbols-outlined text-base ${task.completed ? "text-[#006B56] font-black" : "text-slate-300"}`}>
                        {task.completed ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={`text-[10px] font-semibold leading-snug ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Scheduled slots detail boxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 font-heading">
                  Schedule for Oct {selectedDay}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#006B56] animate-pulse" />
              </div>

              {selectedDay % 2 === 0 ? (
                <>
                  {/* Slot 1 */}
                  <button 
                    onClick={() => {
                      setBreathingActive(true);
                      setBreathingPhase("Inhale");
                      setBreathingSeconds(4);
                    }}
                    className="w-full p-4 bg-white border border-[#EAEAFF] hover:border-[#7C6BC4]/20 hover:shadow-xs transition-all rounded-[24px] text-left flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E6F4F0] border border-[#CBECE2] flex items-center justify-center text-sm shadow-2xs">🧘</div>
                      <div>
                        <h5 className="text-[11px] font-heading font-black text-slate-800">Manage Stress Space</h5>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">10:00 pm - 10:30 pm</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward_ios</span>
                  </button>

                  {/* Slot 2 */}
                  <button 
                    onClick={() => router.push("/meditation")}
                    className="w-full p-4 bg-white border border-[#EAEAFF] hover:border-[#7C6BC4]/20 hover:shadow-xs transition-all rounded-[24px] text-left flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ECE5F5] border border-[#D5C2EB] flex items-center justify-center text-sm shadow-2xs">🌸</div>
                      <div>
                        <h5 className="text-[11px] font-heading font-black text-slate-800">Mindfulness Breathing</h5>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">09:00 am - 10:00 am</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward_ios</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Slot 3 */}
                  <button 
                    onClick={() => router.push("/journey")}
                    className="w-full p-4 bg-white border border-[#EAEAFF] hover:border-[#7C6BC4]/20 hover:shadow-xs transition-all rounded-[24px] text-left flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFF6EB] border border-[#FFE1C2] flex items-center justify-center text-sm shadow-2xs">🧸</div>
                      <div>
                        <h5 className="text-[11px] font-heading font-black text-slate-800">Play Time with Kids</h5>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">04:00 pm - 05:00 pm</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward_ios</span>
                  </button>

                  {/* Slot 4 */}
                  <button 
                    onClick={() => router.push("/journey")}
                    className="w-full p-4 bg-white border border-[#EAEAFF] hover:border-[#7C6BC4]/20 hover:shadow-xs transition-all rounded-[24px] text-left flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ECE5F5] border border-[#D5C2EB] flex items-center justify-center text-sm shadow-2xs">🏡</div>
                      <div>
                        <h5 className="text-[11px] font-heading font-black text-slate-800">Family Harmony Check-in</h5>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">07:00 pm - 07:30 pm</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-xs text-slate-400">arrow_forward_ios</span>
                  </button>
                </>
              )}
              
              {/* See More Link */}
              <button 
                onClick={() => router.push("/journey")}
                className="w-full text-center py-2.5 text-[#006B56] hover:underline text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <span>See More Schedule</span>
                <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
              </button>
            </div>

            {/* Family Wellness Summary Block */}
            <div className="bg-white rounded-[32px] border border-[#EAEAFF] shadow-[0_10px_35px_rgba(95,78,165,0.02)] p-5 space-y-4">
              <h4 className="font-heading font-black text-xs text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006B56] font-black text-base">family_home</span>
                Family Alignment
              </h4>

              {/* Mini display */}
              <div className="flex items-center justify-between bg-[#F8F9FD] p-3 rounded-xl border border-[#EAEAFF]">
                <span className="text-[10px] text-slate-500 font-semibold">Wellness Score:</span>
                <span className="text-sm font-heading font-black text-[#006B56]">{familyScore}/100</span>
              </div>

              {/* Challenge text */}
              <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                🏡 **Today's Challenge:** Keep devices in a basket during family dinner. Ask children about their best moments today.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ==================== BREATHING GUIDE DIALOG ==================== */}
      <AnimatePresence>
        {breathingActive && (
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
              <button 
                onClick={() => setBreathingActive(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Breathing Space</span>
                <h3 className="text-lg font-heading font-black text-slate-800">Relax & Re-center</h3>
              </div>

              {/* Dynamic Breathing Ring */}
              <div className="flex justify-center items-center h-48 relative">
                <motion.div
                  animate={{
                    scale: breathingPhase === "Inhale" ? [1, 1.8] : breathingPhase === "Hold" ? 1.8 : [1.8, 1],
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center absolute shadow-inner transition-colors duration-500 ${
                    breathingPhase === "Inhale" ? "bg-emerald-500/20" : breathingPhase === "Hold" ? "bg-[#F5C99B]/35" : "bg-[#7C6BC4]/20"
                  }`}
                />
                
                <div className="z-10 bg-white w-20 h-20 rounded-full flex flex-col items-center justify-center border border-[#EAEAFF] shadow-sm">
                  <span className="text-[10px] font-black text-slate-700">{breathingPhase}</span>
                  <span className="text-xs font-bold text-slate-400 mt-0.5">{breathingSeconds}s</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed px-4">
                {breathingPhase === "Inhale" 
                  ? "Breathe in slowly through your nose, expanding your belly." 
                  : breathingPhase === "Hold" 
                    ? "Keep the breath resting gently inside your body." 
                    : "Exhale softly through your mouth, letting go of all tension."}
              </p>

              <button 
                onClick={() => setBreathingActive(false)}
                className="w-full py-3 bg-[#7C6BC4] hover:bg-[#6B5BB3] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95"
              >
                End Exercise
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== OVERWHELMED MODE MODAL ==================== */}
      <AnimatePresence>
        {overwhelmedMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D283E]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              className="bg-white max-w-md w-full p-8 rounded-[36px] border border-[#EAEAFF] shadow-2xl space-y-6 relative"
            >
              <button 
                onClick={() => setOverwhelmedMode(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="text-center space-y-1 font-heading">
                <span className="px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider border border-rose-100">
                  Emergency Calm Zone
                </span>
                <h3 className="text-xl font-heading font-black text-slate-800 pt-2">Grounding Exercise</h3>
                <p className="text-[10px] text-slate-400 font-bold">Let's calm your nervous system together step-by-step.</p>
              </div>

              {/* Grounding Content based on steps */}
              <div className="bg-slate-50 border border-[#EAEAFF] p-5 rounded-3xl min-h-[180px] flex flex-col justify-between">
                
                {groundingStep === 1 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👀 Step 1 of 5</span>
                    <h4 className="font-heading font-black text-xs text-slate-800">Find 5 things you can see</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Look around your current room or environment. Name five things in your mind: a picture on the wall, a cup, a shoe, a door, a plant.
                    </p>
                  </div>
                )}

                {groundingStep === 2 && (
                  <div className="space-y-2">
                    <span className="text-2xl">🖐️ Step 2 of 5</span>
                    <h4 className="font-heading font-black text-xs text-slate-800">Notice 4 things you can feel</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Pay attention to your body. Identify four sensations: the weight of your feet on the ground, the texture of your shirt, the backrest of your chair, the cool air on your skin.
                    </p>
                  </div>
                )}

                {groundingStep === 3 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👂 Step 3 of 5</span>
                    <h4 className="font-heading font-black text-xs text-slate-800">Identify 3 things you can hear</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Listen to the sounds around you. Listen carefully: a car passing by outside, the buzz of a refrigerator, a bird chirping, your own breathing.
                    </p>
                  </div>
                )}

                {groundingStep === 4 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👃 Step 4 of 5</span>
                    <h4 className="font-heading font-black text-xs text-slate-800">Acknowledge 2 things you can smell</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Take a gentle breath in. Can you smell the soap on your hands, the scent of wood, the aroma of a candle, or even just fresh air?
                    </p>
                  </div>
                )}

                {groundingStep === 5 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👅 Step 5 of 5</span>
                    <h4 className="font-heading font-black text-xs text-slate-800">Acknowledge 1 thing you can taste</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Become aware of your mouth. Notice if there's a lingering taste of coffee, toothpaste, mint, or simply the taste of cool water.
                    </p>
                  </div>
                )}

                {/* Progress dot indicators */}
                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i + 1 === groundingStep ? "w-6 bg-rose-500" : "w-1.5 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex gap-4">
                {groundingStep > 1 && (
                  <button 
                    onClick={() => setGroundingStep(prev => prev - 1)}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-full font-bold text-xs hover:bg-slate-200 transition-transform active:scale-95"
                  >
                    Back
                  </button>
                )}
                
                {groundingStep < 5 ? (
                  <button 
                    onClick={() => setGroundingStep(prev => prev + 1)}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => setOverwhelmedMode(false)}
                    className="flex-1 py-3 bg-[#7C6BC4] hover:bg-[#6B5BB3] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95 animate-bounce"
                  >
                    I Feel Calmer Now
                  </button>
                )}
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
            className="fixed inset-0 z-50 bg-[#2E2A3D]/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-[#EAEAFF]"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 animate-pulse">
                <span className="material-symbols-outlined text-3xl font-black">lock_open</span>
              </div>

              <div className="space-y-1 font-heading">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Sanctuary Guard</span>
                <h3 className="text-xl font-heading font-black text-slate-800">You Are Safe Here</h3>
              </div>

              <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-2">
                Your parenting reflections, journal entries, and custom wellness metrics are fully protected. We do not track or share your logs.
              </p>

              <button 
                onClick={() => setShowSecurityPopup(false)}
                className="w-full py-3.5 bg-[#7C6BC4] hover:bg-[#6B5BB3] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95"
              >
                I Feel Secure
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== DAILY PROGRESS CHECKLIST MODAL ==================== */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2E2A3D]/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white max-w-md w-full p-6 sm:p-8 rounded-[36px] space-y-6 shadow-2xl relative border border-[#EAEAFF]"
            >
              <button 
                onClick={() => setShowProgressModal(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#F8F9FD] border border-[#EAEAFF] hover:bg-[#F2F4FD] flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-sm font-black">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#7C6BC4]">Daily Focus Checklist</span>
                <h3 className="text-lg font-heading font-black text-slate-800">Complete Daily Goals</h3>
                <p className="text-[10px] text-slate-400 font-bold">Check off completed goals to improve your wellness score</p>
              </div>

              {/* Progress visual inside modal */}
              <div className="flex items-center gap-4 bg-[#F8F9FD] border border-[#EAEAFF] p-4 rounded-[24px]">
                <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="26" className="stroke-[#EAEAFF]" strokeWidth="4.5" fill="none" />
                    <circle cx="32" cy="32" r="26" className="stroke-[#006B56] transition-all duration-300" strokeWidth="4.5" fill="none" strokeDasharray="163.3" strokeDashoffset={163.3 - (163.3 * progressPercent) / 100} strokeLinecap="round" />
                  </svg>
                  <span className="text-xs font-heading font-black text-slate-800">{progressPercent}%</span>
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-heading font-black text-slate-700 block">
                    {completedCount} of {tasks.length} Completed
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    Keep going! Every milestone improves family alignment.
                  </span>
                </div>
              </div>

              {/* Checklist Group */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#F8F9FD] border border-[#EAEAFF] hover:border-[#7C6BC4]/20 cursor-pointer transition-all active:scale-[0.99] bg-white text-left"
                  >
                    <span className={`material-symbols-outlined text-lg ${task.completed ? "text-[#006B56] font-black" : "text-slate-300"}`}>
                      {task.completed ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className={`text-[11px] font-semibold leading-relaxed ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowProgressModal(false)}
                className="w-full py-3.5 bg-[#7C6BC4] hover:bg-[#6B5BB3] text-white rounded-full font-bold text-xs shadow-sm transition-transform active:scale-95"
              >
                Close & Save Goals
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
