"use client";
 
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
 
// Core Parent Themes & Colors from Design.md
// Parent accent is Peach (#F5C99B) and Primary is Lavender/Purple (#7C6BC4)
const MOODS = [
  { emoji: "😊", name: "Joyful", color: "bg-amber-100 text-amber-800" },
  { emoji: "😌", name: "Calm", color: "bg-emerald-100 text-emerald-800" },
  { emoji: "🥱", name: "Tired", color: "bg-blue-100 text-blue-800" },
  { emoji: "🤯", name: "Overwhelmed", color: "bg-rose-100 text-rose-800" },
  { emoji: "😔", name: "Anxious", color: "bg-purple-100 text-purple-800" },
];

const getMoodEmoji = (moodStr: string) => {
  const emojis: Record<string, string> = {
    Joyful: "😊",
    Calm: "😌",
    Tired: "🥱",
    Overwhelmed: "🤯",
    Anxious: "😔",
    Amazing: "😁",
    Happy: "😊",
    Okay: "😐",
    Low: "😔"
  };
  return emojis[moodStr] || "🌸";
};
 
const RESOURCE_LIBRARY = [
  {
    type: "article",
    title: "Navigating Toddler Tantrums with Mindful Presence",
    duration: "5 min read",
    author: "Dr. Sarah Jenkins",
    icon: "article",
    bg: "bg-peach/10",
    color: "text-tertiary",
  },
  {
    type: "video",
    title: "3-Minute De-escalation for Parents",
    duration: "3 min watch",
    author: "Marcus Vance",
    icon: "play_circle",
    bg: "bg-mint/10",
    color: "text-secondary",
  },
  {
    type: "podcast",
    title: "Mindful Parenting in a Digital Age",
    duration: "18 min listen",
    author: "The Sanctuary Podcast",
    icon: "mic",
    bg: "bg-primary-fixed/30",
    color: "text-primary",
  },
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
 
const MOCK_TAKEN_USERNAMES = ["elena", "parent", "mama", "papa", "user", "admin", "mom", "dad", "parent123"];
 
export default function ParentDashboard() {
  const router = useRouter();
  const { dashboardData, refetchDashboardData } = useWellness();
  const latestCheckIn = dashboardData?.latestCheckIn;
  const history = dashboardData?.moodHistory || [];
  const wellnessMetrics = dashboardData?.wellnessMetrics || [];
  const dbJournalEntries = dashboardData?.journalEntries || [];
  const streak = dashboardData?.streak;
  const currentStreak = streak?.currentStreak || 1;
  
  // Custom Username & Visibility States
  const [username, setUsername] = useState("CalmParent-3804");
  const [showName, setShowName] = useState(true);
 
  // Phone Number & Visibility States
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [phoneNumber] = useState("+91 ••••• ••982");
 
  // Dynamic Greeting based on time
  const [greeting, setGreeting] = useState("Hello");
  const [timeIcon, setTimeIcon] = useState("🌅");
 
  // Today's Focus checklist
  const [tasks, setTasks] = useState([
    { id: 1, text: "💧 Log water intake (at least 4 glasses)?", completed: false },
    { id: 2, text: "🧘 Complete a 2-minute breathing space?", completed: false },
    { id: 3, text: "🔇 Put devices away for family dinner time?", completed: false },
    { id: 4, text: "🚶 Take a 15-minute mindful self-care walk?", completed: false },
  ]);
 
  // Family Wellness
  const [familyScore, setFamilyScore] = useState(82);
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

  // Set greeting, username and security popup times
  useEffect(() => {
    // 1. Initial Load Username
    const session = getClientSession();
    const storedUsername = localStorage.getItem("parent_username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else if (session.user && (session.user.sanctuaryName || session.user.name)) {
      const name = session.user.sanctuaryName || session.user.name || "Mindful Parent";
      setUsername(name);
      localStorage.setItem("parent_username", name);
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
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
      setTimeIcon("☀️");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
      setTimeIcon("🌿");
    } else {
      setGreeting("Good Night");
      setTimeIcon("🌌");
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

  // Note: Username settings & phone number visibility controls moved to Settings & Privacy profile screen.

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
  const handleSaveJournal = async () => {
    if (!journalInput.trim()) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: journalInput.trim() }),
      });
      if (res.ok) {
        setJournalInput("");
        setSaveStatus("saved");
        refetchDashboardData();
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      setSaveStatus("error");
    }
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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8 relative select-none animate-fadeIn bg-[#fdf7ff]">
      
      {/* Ambient background glow - Peach & Purple */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[110px] opacity-25 bg-[#F5C99B]" />
        <div className="absolute bottom-1/4 left-1/4 w-[450px] h-[450px] rounded-full blur-[130px] opacity-20 bg-[#7C6BC4]" />
      </div>

      <div className="z-10 relative space-y-6">
        
        {/* ==================== BACK BUTTON ==================== */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-surface-variant/20 text-xs font-bold text-primary shadow-sm hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
            Back to home
          </button>
        </div>

        {/* ==================== CATCHY DISCLAIMER BANNER ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-peach/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤫</span>
            <div>
              <h4 className="font-heading font-black text-xs text-on-surface">Under Lock & Key</h4>
              <p className="text-[10px] text-on-surface-variant font-semibold">
                We are not revealing your identity. Everything you log, write, or ask here remains 100% private to your device.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
            Private Connection
          </span>
        </motion.div>

        {/* ==================== 1. HEADER ==================== */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-soft gap-4"
        >
          <div className="flex items-start gap-4 flex-1">
            {/* Profile Avatar in Left Corner */}
            <div 
              onClick={() => router.push("/profile")} 
              className="w-14 h-14 rounded-full border-2 border-primary/20 bg-peach/40 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform flex-shrink-0"
              title="View Profile"
            >
              <span className="text-2xl">👩‍👦</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">{timeIcon}</span>
                <span className="text-xs uppercase tracking-wider font-extrabold text-tertiary">Mindful Parenting Sanctuary</span>
              </div>
            
            {/* Custom Username Header Display */}
            <div className="flex items-center flex-wrap gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-on-surface flex items-center gap-2">
                {greeting}, {showName ? username : "••••••••"}
              </h1>
              
              {/* Hide/Show Name Toggle */}
              <button 
                onClick={() => setShowName(!showName)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant/85 transition-colors"
                title={showName ? "Hide Username" : "Show Username"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showName ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-semibold">
              <span>Today is {getFormattedDate()}</span>
              {showPhoneNumber && (
                <span className="px-2.5 py-0.5 rounded-md bg-peach/20 text-tertiary border border-peach/30 font-bold">
                  📞 {phoneNumber}
                </span>
              )}
            </div>
          </div>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0 self-end sm:self-center">
            {/* Notification Icon */}
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-tertiary rounded-full ring-2 ring-white" />
            </div>
          </div>
        </motion.div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* ==================== 2. DAILY WELLNESS SUMMARY (col-span-8) ==================== */}
          <div className="md:col-span-8 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">spa</span>
                  Daily Wellness Summary
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/60">Updated Live</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mood Card */}
                <div className="bg-surface-container-lowest border border-surface-variant/20 rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Daily Mood</span>
                  <div className="flex items-center gap-3 my-2">
                    <span className="text-4xl select-none">{latestCheckIn ? getMoodEmoji(latestCheckIn.mood) : "🌸"}</span>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-on-surface">
                        {latestCheckIn ? latestCheckIn.mood : "Not Completed"}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-medium">Logged today</p>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-dashed border-surface-variant/30 text-[9px] font-bold text-on-surface-variant/80">
                    {latestCheckIn ? "Completed Check-in" : "Check-in in Progress"}
                  </div>
                </div>

                {/* Stress Level Card */}
                <div className="bg-surface-container-lowest border border-surface-variant/20 rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Stress Level</span>
                    <span className="text-xs font-bold text-tertiary">
                      {latestCheckIn ? (() => {
                        const stressStr = (latestCheckIn.stress || "").toLowerCase();
                        if (stressStr.includes("peace") || stressStr.includes("low")) return 2;
                        if (stressStr.includes("manage")) return 4;
                        if (stressStr.includes("little")) return 6;
                        if (stressStr.includes("stressful")) return 8;
                        if (stressStr.includes("overwhelming")) return 10;
                        return 4;
                      })() : 0}/10
                    </span>
                  </div>
                  <div className="my-2 space-y-1.5">
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-tertiary h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${latestCheckIn ? (() => {
                            const stressStr = (latestCheckIn.stress || "").toLowerCase();
                            if (stressStr.includes("peace") || stressStr.includes("low")) return 20;
                            if (stressStr.includes("manage")) return 40;
                            if (stressStr.includes("little")) return 60;
                            if (stressStr.includes("stressful")) return 80;
                            if (stressStr.includes("overwhelming")) return 100;
                            return 40;
                          })() : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant/80">
                    Status: {(() => {
                      if (!latestCheckIn) return "No Check-in logged";
                      const stressStr = (latestCheckIn.stress || "").toLowerCase();
                      if (stressStr.includes("peace") || stressStr.includes("low")) return "😊 Peaceful Grounding";
                      if (stressStr.includes("manage")) return "🍃 Moderate Tension";
                      return "⚠️ High Overload - Pause!";
                    })()}
                  </span>
                </div>

                {/* Energy Level Card */}
                <div className="bg-surface-container-lowest border border-surface-variant/20 rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Energy Reservoir</span>
                    <span className="text-xs font-bold text-secondary">
                      {latestCheckIn ? latestCheckIn.energy_level * 2 : 0}/10
                    </span>
                  </div>
                  <div className="my-2 space-y-2">
                    <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-mint to-secondary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${latestCheckIn ? latestCheckIn.energy_level * 20 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sleep Summary Card */}
                <div className="bg-surface-container-lowest border border-surface-variant/20 rounded-2xl p-4 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant">Sleep Log</span>
                    <span className="text-xs font-bold text-primary">
                      {latestCheckIn ? `${latestCheckIn.sleep_quality + 3.0} hours` : "N/A"}
                    </span>
                  </div>
                  <div className="my-1 text-center">
                    <span className="text-xs font-semibold text-on-surface">
                      {latestCheckIn ? `${latestCheckIn.sleep_quality >= 4 ? "Deep" : latestCheckIn.sleep_quality >= 2 ? "Light" : "Interrupted"} Quality` : "No logs today"}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-dashed border-surface-variant/30 text-[9px] font-bold text-on-surface-variant/80">
                    Logged: {latestCheckIn ? `Rating: ${latestCheckIn.sleep_quality}/5` : "N/A"}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ==================== 3. TODAY'S FOCUS (col-span-4) ==================== */}
          <div className="md:col-span-4 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft flex flex-col justify-between min-h-[300px]">
            <div className="space-y-4">
              <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">emoji_objects</span>
                Today's Focus
              </h3>
              
              {/* AI Recommended Goal */}
              <div className="bg-peach/10 border border-peach/30 rounded-2xl p-3 text-xs text-on-surface">
                <span className="font-bold text-tertiary block mb-1">💡 AI Recommended Goal</span>
                "Breathe out when entering the house. Pause at the door for two breaths to shift parent modes."
              </div>

              {/* Task list with emojis in questions */}
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors"
                  >
                    <span className={`material-symbols-outlined text-lg ${task.completed ? "text-secondary font-black" : "text-outline"}`}>
                      {task.completed ? "check_circle" : "radio_button_unchecked"}
                    </span>
                    <span className={`text-xs font-semibold leading-snug ${task.completed ? "line-through text-on-surface-variant/50" : "text-on-surface"}`}>
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Circular Progress Indicator */}
            <div className="pt-4 border-t border-surface-container flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" className="stroke-surface-container" strokeWidth="4" fill="none" />
                    <circle cx="24" cy="24" r="20" className="stroke-secondary transition-all duration-300" strokeWidth="4" fill="none" strokeDasharray="125" strokeDashoffset={125 - (125 * progressPercent) / 100} />
                  </svg>
                  <span className="text-[10px] font-black text-on-surface">{progressPercent}%</span>
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-on-surface">Daily Checkoff</h4>
                  <p className="text-[9px] text-on-surface-variant font-medium">{completedCount} of {tasks.length} tasks completed</p>
                </div>
              </div>

              <button
                disabled={progressPercent < 100}
                onClick={() => alert("🎉 Beautiful job dedicating time to parenting mindfulness today!")}
                className="px-4 py-2 rounded-full font-bold text-[10px] text-white bg-primary hover:bg-primary-purple disabled:opacity-40 disabled:cursor-not-allowed transition-all scale-102 hover:scale-105 active:scale-95"
              >
                Complete
              </button>
            </div>
          </div>

          {/* ==================== 4. FAMILY WELLNESS (col-span-6) ==================== */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft space-y-4">
            <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">family_home</span>
              Family Wellness
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Family Wellness Score */}
              <div className="p-4 bg-gradient-to-tr from-mint/10 to-[#88F7D6]/20 border border-mint/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
                <span className="text-[10px] font-black text-secondary uppercase tracking-wider">Family Wellness Score</span>
                <span className="text-4xl font-heading font-black text-secondary">{familyScore}</span>
                <span className="text-[9px] text-on-surface-variant font-medium">Strong Harmony • Top 15%</span>
                <button 
                  onClick={() => setFamilyScore(prev => Math.min(100, prev + 1))}
                  className="mt-2 text-[9px] font-black bg-white/80 hover:bg-white text-secondary py-1 px-3 rounded-full border border-secondary/20 transition-transform active:scale-95"
                >
                  Boost Score +
                </button>
              </div>

              {/* Family Time Progress */}
              <div className="p-4 bg-surface-container-low border border-surface-variant/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Family Connection Time</span>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-2xl font-black text-on-surface">{familyTime}</span>
                    <span className="text-xs text-on-surface-variant font-medium">/ 60 mins</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-surface-variant/10">
                    <div 
                      className="bg-secondary h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (familyTime / 60) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => setFamilyTime(prev => Math.max(0, prev - 10))}
                    className="flex-1 bg-white hover:bg-surface-container text-[10px] font-extrabold py-1 rounded-md border border-surface-variant/20 active:scale-95 transition-transform"
                  >
                    -10m
                  </button>
                  <button 
                    onClick={() => setFamilyTime(prev => prev + 10)}
                    className="flex-1 bg-white hover:bg-surface-container text-[10px] font-extrabold py-1 rounded-md border border-surface-variant/20 active:scale-95 transition-transform"
                  >
                    +10m
                  </button>
                </div>
              </div>

            </div>

            {/* Weekly Family Goal */}
            <div className="p-4 bg-surface-container-lowest border border-surface-variant/20 rounded-2xl flex items-start gap-3">
              <span className="text-2xl mt-0.5">🏡</span>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-tertiary">Weekly Family Challenge</span>
                <h4 className="font-heading font-extrabold text-sm text-on-surface">Device-Free Dinner Challenge</h4>
                <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                  Put all family phones in a basket during dinner. Eat, laugh, and ask: "What was the best part of your day?"
                </p>
              </div>
            </div>

            {/* Rotating Healthy Communication Reminder */}
            <div className="bg-surface p-3.5 rounded-xl border border-surface-variant/15 text-center min-h-[60px] flex items-center justify-center transition-all duration-500">
              <p className="text-[11px] font-medium italic text-on-surface-variant/90 leading-normal">
                💬 "{COMMUNICATION_TIPS[activeTipIdx]}"
              </p>
            </div>
          </div>

          {/* ==================== 5. PERSONAL CARE (col-span-6) ==================== */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft space-y-4">
            <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">self_care</span>
              Personal Care
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Personal Time Tracker */}
              <div className="p-4 bg-surface-container-low border border-surface-variant/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Daily Me-Time Log</span>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-2xl font-black text-on-surface">{meTimeMinutes}</span>
                    <span className="text-xs text-on-surface-variant font-medium">/ 30 mins</span>
                  </div>
                  <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-surface-variant/10">
                    <div 
                      className="bg-tertiary h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (meTimeMinutes / 30) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3">
                  <button 
                    onClick={() => setMeTimeMinutes(prev => prev + 5)}
                    className="flex-1 bg-white hover:bg-surface text-[9px] font-black py-1 rounded-md border border-surface-variant/25 active:scale-95"
                  >
                    +5m
                  </button>
                  <button 
                    onClick={() => setMeTimeMinutes(prev => prev + 15)}
                    className="flex-1 bg-white hover:bg-surface text-[9px] font-black py-1 rounded-md border border-surface-variant/25 active:scale-95"
                  >
                    +15m
                  </button>
                </div>
              </div>

              {/* Water Intake */}
              <div className="p-4 bg-surface-container-low border border-surface-variant/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant">Water Intake ({waterGlasses}/8)</span>
                  <div className="grid grid-cols-4 gap-2 my-2.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => toggleWaterGlass(i)}
                        className={`text-xl transition-all hover:scale-110 active:scale-90 ${
                          i < waterGlasses ? "opacity-100 filter drop-shadow-sm scale-105" : "opacity-30 hover:opacity-50"
                        }`}
                      >
                        💧
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-secondary">
                  {waterGlasses >= 8 ? "🏆 Daily Hydration Achieved!" : "Keep drinking to nurture your body"}
                </span>
              </div>

            </div>

            {/* Breathing Exercise & Meditation Shortcuts */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setBreathingActive(true);
                  setBreathingPhase("Inhale");
                  setBreathingSeconds(4);
                }}
                className="p-3.5 bg-gradient-to-tr from-primary to-primary-purple text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-lg">nature_people</span>
                Breathing Guide
              </button>

              <button 
                onClick={() => router.push("/meditation")}
                className="p-3.5 bg-gradient-to-tr from-[#F5C99B] to-[#F4A6B8] text-tertiary rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                <span className="material-symbols-outlined text-lg text-tertiary">mindfulness</span>
                Meditation
              </button>
            </div>

          </div>

          {/* ==================== 6. JOURNAL (col-span-5) ==================== */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft flex flex-col justify-between min-h-[360px]">
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">edit_note</span>
                Parenting Journal
              </h3>
              
              {/* Daily Prompt */}
              <div className="bg-pale-yellow/20 border border-pale-yellow/60 rounded-xl p-3 text-[11px] text-on-surface leading-relaxed">
                <span className="font-bold text-on-surface-variant block mb-0.5">📝 Today's Reflection Prompt</span>
                "What is one parenting moment that made you smile, laugh, or feel proud today?"
              </div>

              {/* Inline Editor */}
              <textarea
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                placeholder="Log your parenting reflections here..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-surface-variant/20 bg-surface focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveJournal}
                  disabled={!journalInput.trim() || saveStatus === "saving"}
                  className="bg-primary text-white px-4 py-2 rounded-full font-bold text-[10px] hover:bg-primary-purple disabled:opacity-40 transition-all active:scale-95"
                >
                  {saveStatus === "saving" ? "Saving..." : "Save Entry"}
                </button>
                {saveStatus === "saved" && (
                  <span className="text-[10px] text-secondary font-black flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm font-black">check</span> Saved!
                  </span>
                )}
              </div>
            </div>

            {/* Previous Entries */}
            <div className="mt-4 pt-4 border-t border-dashed border-surface-variant/20 space-y-2">
              <span className="text-[10px] font-black uppercase text-on-surface-variant/60 block">Recent Entries</span>
              <div className="max-h-[100px] overflow-y-auto space-y-2 pr-1">
                {dbJournalEntries.length > 0 ? (
                  dbJournalEntries.map((entry: any, idx: number) => (
                    <div key={idx} className="bg-surface-container-low p-2 rounded-lg text-[10px] leading-relaxed text-on-surface">
                      <div className="flex justify-between font-bold text-on-surface-variant mb-0.5">
                        <span>Reflections</span>
                        <span>{new Date(entry.created_at || entry.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                      </div>
                      <p className="italic text-on-surface-variant">"{entry.content}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-on-surface-variant/70 italic text-center py-2">No entries logged yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* ==================== 7. AI COMPANION (col-span-7) ==================== */}
          <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft flex flex-col justify-between min-h-[360px] space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">forum</span>
                Parenting AI Companion
              </h3>
              
              <button 
                onClick={launchOverwhelmedMode}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-[9px] uppercase tracking-wider py-1.5 px-3.5 rounded-full shadow-[0_4px_12px_rgba(244,63,94,0.3)] transition-all animate-pulse"
              >
                🚨 Feeling Overwhelmed?
              </button>
            </div>

            {/* Quick Parenting Advice scenario buttons with Emojis in Questions */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">Common Scenario Questions</span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ADVICE_SCENARIOS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setAiChatLogs(prev => [
                        ...prev, 
                        { sender: "user", text: `How can I handle a ${item.title.toLowerCase()} right now?` },
                        { sender: "ai", text: item.advice }
                      ]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-peach/20 hover:bg-peach/30 text-tertiary transition-transform active:scale-95 text-left border border-peach/10"
                  >
                    {item.title}?
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div className="flex-1 bg-surface-container-lowest border border-surface-variant/25 rounded-2xl p-3 flex flex-col justify-between h-[160px]">
              <div className="overflow-y-auto space-y-2 max-h-[110px] text-[11px] pr-1">
                {aiChatLogs.map((log, idx) => (
                  <div key={idx} className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] p-2 rounded-xl leading-relaxed ${
                      log.sender === "user" 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-surface-container-low text-on-surface rounded-bl-none border border-surface-variant/15"
                    }`}>
                      {log.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAiChatSubmit} className="flex gap-2 pt-2 border-t border-surface-container mt-2">
                <input
                  type="text"
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder="Ask for parenting advice..."
                  className="flex-1 text-[11px] px-3 py-1.5 bg-surface border border-surface-variant/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <button 
                  type="submit" 
                  className="p-1.5 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-primary-purple active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            </div>

          </div>

          {/* ==================== 8. RESOURCES (col-span-6) ==================== */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">library_books</span>
                Recommended Resources
              </h3>
              <button 
                onClick={() => router.push("/resources")} 
                className="text-[10px] font-extrabold text-primary hover:underline uppercase tracking-wider"
              >
                View Library
              </button>
            </div>

            <div className="space-y-3">
              {RESOURCE_LIBRARY.map((item, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-surface-variant/10 hover:shadow-sm cursor-pointer transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-xs text-on-surface leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-on-surface-variant/80 mt-0.5">{item.author} • {item.duration}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 hover:text-primary">arrow_forward_ios</span>
                </div>
              ))}
            </div>
          </div>

          {/* ==================== 9. WEEKLY PROGRESS (col-span-6) ==================== */}
          <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-surface-variant/15 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">monitoring</span>
                Weekly Progress
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pale-yellow text-amber-800">
                🔥 {currentStreak}-Day Streak
              </span>
            </div>
 
            <div className="grid grid-cols-3 gap-3">
              
              {/* Mood Chart (Pure CSS/SVG Line wave) */}
              <div className="p-3 bg-surface-container-low rounded-2xl flex flex-col justify-between items-center text-center h-[140px] relative overflow-hidden">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">Mood Trend</span>
                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[9px] text-on-surface-variant/70 italic">
                    <span>🌱 No logs</span>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-12 flex items-end justify-center">
                      <svg viewBox="0 0 100 40" className="w-full h-full stroke-primary fill-none" strokeWidth="2.5" strokeLinecap="round">
                        {(() => {
                          const recent = history.slice(0, 7).reverse();
                          const moodMap: Record<string, number> = { Amazing: 5, Happy: 4.5, Calm: 4, Okay: 3, Low: 2, Overwhelmed: 1 };
                          const coords = recent.map((item: any, idx: number) => {
                            const divider = Math.max(recent.length - 1, 1);
                            const x = 5 + idx * (90 / divider);
                            const val = moodMap[item.mood] || 3;
                            const y = 35 - (val - 1) * 30 / 4;
                            return { x, y };
                          });
                          
                          let path = coords.length > 0 ? `M ${coords[0].x} ${coords[0].y}` : "";
                          for (let i = 0; i < coords.length - 1; i++) {
                            path += ` L ${coords[i+1].x} ${coords[i+1].y}`;
                          }
                          return (
                            <>
                              {path && <path d={path} />}
                              {coords.length > 0 && <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3.5" className="fill-primary" />}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold text-on-surface">
                      {latestCheckIn ? latestCheckIn.mood : "Active"}
                    </span>
                  </>
                )}
              </div>
 
              {/* Stress Curve */}
              <div className="p-3 bg-surface-container-low rounded-2xl flex flex-col justify-between items-center text-center h-[140px] relative overflow-hidden">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">Stress Log</span>
                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[9px] text-on-surface-variant/70 italic">
                    <span>🌱 No logs</span>
                  </div>
                ) : (
                  <>
                    <div className="w-full h-12 flex items-end justify-center">
                      <svg viewBox="0 0 100 40" className="w-full h-full stroke-tertiary fill-none" strokeWidth="2.5" strokeLinecap="round">
                        {(() => {
                          const recent = history.slice(0, 7).reverse();
                          const coords = recent.map((item: any, idx: number) => {
                            const divider = Math.max(recent.length - 1, 1);
                            const x = 5 + idx * (90 / divider);
                            const stressStr = (item.stress || "").toLowerCase();
                            let val = 2;
                            if (stressStr.includes("peace") || stressStr.includes("low")) val = 1;
                            else if (stressStr.includes("manage")) val = 2;
                            else if (stressStr.includes("little")) val = 3;
                            else if (stressStr.includes("stressful")) val = 4;
                            else if (stressStr.includes("overwhelming")) val = 5;
                            const y = 35 - (val - 1) * 30 / 4;
                            return { x, y };
                          });

                          let path = coords.length > 0 ? `M ${coords[0].x} ${coords[0].y}` : "";
                          for (let i = 0; i < coords.length - 1; i++) {
                            path += ` L ${coords[i+1].x} ${coords[i+1].y}`;
                          }
                          return (
                            <>
                              {path && <path d={path} />}
                              {coords.length > 0 && <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3.5" className="fill-tertiary" />}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold text-on-surface">
                      {latestCheckIn ? latestCheckIn.stress : "Active"}
                    </span>
                  </>
                )}
              </div>
 
              {/* Sleep Hours Log */}
              <div className="p-3 bg-surface-container-low rounded-2xl flex flex-col justify-between items-center text-center h-[140px] relative overflow-hidden">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase">Sleep (h)</span>
                {history.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-[9px] text-on-surface-variant/70 italic">
                    <span>🌱 No logs</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-end justify-between w-full px-2 h-12">
                      {history.slice(0, 5).reverse().map((item: any, idx: number) => {
                        const sleepVal = item.sleep_quality || 3;
                        const height = (sleepVal / 5) * 40;
                        return (
                          <div 
                            key={idx} 
                            className="w-2.5 bg-primary/80 hover:bg-primary rounded-t transition-all" 
                            style={{ height: `${height}px` }} 
                            title={`Sleep: ${sleepVal}/5`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[10px] font-extrabold text-on-surface">
                      Avg: {(() => {
                        const slice = history.slice(0, 7);
                        const avg = slice.reduce((sum: number, item: any) => sum + (item.sleep_quality || 3) + 3, 0) / Math.max(slice.length, 1);
                        return avg.toFixed(1);
                      })()} hrs
                    </span>
                  </>
                )}
              </div>
 
            </div>

            {/* Streak & Activity Info */}
            <div className="flex items-center justify-between p-3 bg-[#fdf7ff] rounded-xl border border-surface-variant/15 text-[10px] text-on-surface-variant">
              <span>🎯 Weekly Target: 5 mindfulness tasks</span>
              <span className="font-bold text-secondary">4 / 5 Complete</span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Navigation Removed */}

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
              className="bg-white max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setBreathingActive(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high active:scale-95"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-secondary">Breathing Space</span>
                <h3 className="text-xl font-heading font-black text-on-surface">Relax & Re-center</h3>
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
                    breathingPhase === "Inhale" ? "bg-mint/45" : breathingPhase === "Hold" ? "bg-peach/45" : "bg-primary/35"
                  }`}
                />
                
                <div className="z-10 bg-white w-20 h-20 rounded-full flex flex-col items-center justify-center border border-surface-variant/15 shadow-md">
                  <span className="text-xs font-black text-on-surface">{breathingPhase}</span>
                  <span className="text-sm font-bold text-on-surface-variant mt-0.5">{breathingSeconds}s</span>
                </div>
              </div>

              <p className="text-[11px] text-on-surface-variant leading-relaxed px-4">
                {breathingPhase === "Inhale" 
                  ? "Breathe in slowly through your nose, expanding your belly." 
                  : breathingPhase === "Hold" 
                    ? "Keep the breath resting gently inside your body." 
                    : "Exhale softly through your mouth, letting go of all tension."}
              </p>

              <button 
                onClick={() => setBreathingActive(false)}
                className="w-full py-3 bg-gradient-to-tr from-mint to-secondary text-white rounded-full font-bold text-xs shadow-md"
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
              className="bg-[#fdf7ff] max-w-md w-full p-8 rounded-[40px] border border-white/50 shadow-2xl space-y-6 relative"
            >
              <button 
                onClick={() => setOverwhelmedMode(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-sm font-bold">close</span>
              </button>

              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                  Emergency Calm Zone
                </span>
                <h3 className="text-2xl font-heading font-black text-on-surface pt-2">Grounding Exercise</h3>
                <p className="text-[11px] text-on-surface-variant font-medium">Let's calm your nervous system together step-by-step.</p>
              </div>

              {/* Grounding Content based on steps */}
              <div className="bg-white border border-surface-variant/20 p-5 rounded-3xl min-h-[180px] flex flex-col justify-between">
                
                {groundingStep === 1 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👀 Step 1 of 5</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Find 5 things you can see</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Look around your current room or environment. Name five things in your mind: a picture on the wall, a cup, a shoe, a door, a plant.
                    </p>
                  </div>
                )}

                {groundingStep === 2 && (
                  <div className="space-y-2">
                    <span className="text-2xl">🖐️ Step 2 of 5</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Notice 4 things you can feel</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Pay attention to your body. Identify four sensations: the weight of your feet on the ground, the texture of your shirt, the backrest of your chair, the cool air on your skin.
                    </p>
                  </div>
                )}

                {groundingStep === 3 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👂 Step 3 of 5</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Identify 3 things you can hear</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Listen to the sounds around you. Listen carefully: a car passing by outside, the buzz of a refrigerator, a bird chirping, your own breathing.
                    </p>
                  </div>
                )}

                {groundingStep === 4 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👃 Step 4 of 5</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Acknowledge 2 things you can smell</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Take a gentle breath in. Can you smell the soap on your hands, the scent of wood, the aroma of a candle, or even just fresh air?
                    </p>
                  </div>
                )}

                {groundingStep === 5 && (
                  <div className="space-y-2">
                    <span className="text-2xl">👅 Step 5 of 5</span>
                    <h4 className="font-heading font-black text-sm text-on-surface">Acknowledge 1 thing you can taste</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Become aware of your mouth. Notice if there's a lingering taste of coffee, toothpaste, mint, or simply the neutral taste of cool water.
                    </p>
                  </div>
                )}

                {/* Progress dot indicators */}
                <div className="flex justify-center gap-1.5 pt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i + 1 === groundingStep ? "w-6 bg-rose-500" : "w-1.5 bg-surface-container"
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
                    className="flex-1 py-3 bg-surface-container text-on-surface rounded-full font-bold text-xs hover:bg-surface-container-high transition-transform active:scale-95"
                  >
                    Back
                  </button>
                )}
                
                {groundingStep < 5 ? (
                  <button 
                    onClick={() => setGroundingStep(prev => prev + 1)}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => setOverwhelmedMode(false)}
                    className="flex-1 py-3 bg-gradient-to-tr from-mint to-secondary text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95 animate-bounce"
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
              className="bg-white max-w-sm w-full p-8 rounded-[36px] text-center space-y-6 shadow-2xl relative border border-surface-variant/20"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <span className="material-symbols-outlined text-3xl font-black">lock_open</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-secondary">Sanctuary Guard</span>
                <h3 className="text-xl font-heading font-black text-on-surface">You Are Safe Here</h3>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed px-2 font-medium">
                🛡️ **We assure you that you are not being watched.**
                <br /><br />
                Your reflections, journal logs, and custom wellness data are completely encrypted and stored securely. We do not track or sell your emotional state.
              </p>

              <button 
                onClick={() => setShowSecurityPopup(false)}
                className="w-full py-3.5 bg-gradient-to-tr from-primary to-primary-purple text-white rounded-full font-bold text-xs shadow-md transition-transform active:scale-95"
              >
                I Feel Secure
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
