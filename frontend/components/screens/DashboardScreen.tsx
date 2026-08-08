"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useDashboard } from "@/frontend/lib/context/WellnessContext";
import ParentDashboard from "@/parent/Research/Documentation/Dashboard Planning/AI Knowledge/Feature Documentation/Development/ParentDashboard";
import DailyPrivacyReminder from "@/frontend/components/ui/DailyPrivacyReminder";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { getCategoryJourneyBadge } from "@/frontend/lib/constants";

interface TimeTheme {
  bgGradient: string;
  glowColor: string;
  particles: string[];
}

const THEMES: Record<string, TimeTheme> = {
  morning: {
    bgGradient: "from-[#FFFDF2] via-[#FFF3EB] to-[#ECE5F5]",
    glowColor: "bg-amber-200/15",
    particles: ["✨", "☀️", "🌸"],
  },
  afternoon: {
    bgGradient: "from-[#F2F4FD] via-[#ECE6F6] to-[#FCE6EC]",
    glowColor: "bg-primary-container/20",
    particles: ["🍃", "✨", "🌸"],
  },
  evening: {
    bgGradient: "from-[#FFF4E4] via-[#FDE4EB] to-[#ECE7F6]",
    glowColor: "bg-orange-300/15",
    particles: ["🍂", "✨", "🌸"],
  },
  night: {
    bgGradient: "from-[#0A0D18] via-[#12192C] to-[#221B3F]",
    glowColor: "bg-indigo-300/10",
    particles: ["⭐", "✨", "🌙"],
  },
};

// Container variants for staggered card entrance animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 14 } },
};

function getOptionEmoji(score: number): string {
  if (score >= 5) return "😊";
  if (score >= 4) return "🙂";
  if (score >= 3) return "😐";
  if (score >= 2) return "😕";
  return "😞";
}

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardData, isLoading, isFetching, error, refetch } = useDashboard();
  const [themeKey, setThemeKey] = useState<"morning" | "afternoon" | "evening" | "night">("evening");
  const [currentDateString, setCurrentDateString] = useState("6 Aug 2026");
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setThemeKey("morning");
    else if (hour >= 12 && hour < 17) setThemeKey("afternoon");
    else if (hour >= 17 && hour < 21) setThemeKey("evening");
    else setThemeKey("night");

    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setCurrentDateString(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  }, []);

  // 8-second safety timeout so user is never stuck on skeleton indefinitely
  useEffect(() => {
    if (!isLoading && dashboardData) {
      setIsTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      if (isLoading || !dashboardData) {
        setIsTimedOut(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isLoading, dashboardData]);

  if (error || (isTimedOut && !dashboardData)) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center mx-auto text-primary text-3xl">
          🌿
        </div>
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-xl text-on-surface">
            {isTimedOut ? "Your sanctuary is taking a little longer to open." : "We couldn't load your sanctuary right now."}
          </h3>
          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
            Please check your connection or try refreshing your sanctuary.
          </p>
        </div>
        <button
          onClick={() => {
            setIsTimedOut(false);
            refetch();
          }}
          className="px-8 py-3.5 rounded-full bg-primary hover:bg-[#7C6BC4] text-white text-xs font-bold shadow-md hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto py-4 px-4 space-y-8 animate-pulse select-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-8 h-[260px] rounded-[32px] bg-slate-200/50" />
          <div className="col-span-1 md:col-span-4 h-[260px] rounded-[32px] bg-slate-200/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-4 h-[220px] rounded-[32px] bg-slate-200/50" />
          <div className="col-span-1 md:col-span-4 h-[220px] rounded-[32px] bg-slate-200/50" />
          <div className="col-span-1 md:col-span-4 h-[220px] rounded-[32px] bg-slate-200/50" />
        </div>
      </div>
    );
  }

  const { user, todayMood, latestCheckIn, moodHistory: history = [], wellnessMetrics = [], streak, recommendation, insights } = dashboardData;
  const name = user?.sanctuaryName || user?.name || "Sanctuary Member";
  const category = user?.selectedCategory || "student";
  const streakDays = typeof streak === "number" 
    ? streak 
    : (streak && typeof streak === "object" && "currentStreak" in streak 
        ? (streak as any).currentStreak 
        : 1);

  const currentTheme = THEMES[themeKey];
  const isNight = themeKey === "night";

  const getCategoryName = (cat: string) => {
    const map: Record<string, string> = {
      student: "Student Journey",
      young_pro: "Young Professional",
      youngprofessional: "Young Professional",
      working_professional: "Working Professional",
      workingprofessional: "Working Professional",
      parent: "Parent Journey",
      couple: "Harmony Journey",
      family: "Family Journey",
      women: "Women's Journey",
      men: "Men's Journey",
      senior_citizen: "Golden Journey",
    };
    return map[cat] || "Wellness Journey";
  };

  const getTimeGreeting = () => {
    if (themeKey === "morning") return "Good Morning";
    if (themeKey === "afternoon") return "Good Afternoon";
    if (themeKey === "evening") return "Good Evening";
    return "Good Night";
  };

  const oneInsight = insights?.[0]?.insightText || "Small moments of calm today create stronger resilience tomorrow.";

  // Dynamic AI Companion bubble context
  const aiCompanionBubble = (() => {
    if (todayMood) {
      return `It looks like you logged feeling ${todayMood.mood} today. Would you like a short breathing exercise before ending your day?`;
    }
    return `I noticed you haven't checked in today. Would you like to slow down and share how you feel?`;
  })();

  if (category === "parent") {
    return <ParentDashboard />;
  }

  const moodScoreMap: Record<string, number> = {
    Amazing: 5,
    Happy: 4.5,
    Calm: 4,
    Okay: 3,
    Low: 2,
    Overwhelmed: 1
  };

  const getMoodEmoji = (moodStr: string) => {
    const emojis: Record<string, string> = {
      Amazing: "😁",
      Happy: "😊",
      Calm: "🙂",
      Okay: "😐",
      Low: "😔",
      Overwhelmed: "😣"
    };
    return emojis[moodStr] || "🌸";
  };

  const recentCheckins = history.slice(0, 7).reverse();
  const plotPoints = recentCheckins.map((item: any) => {
    const d = new Date(item.created_at);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const label = `${d.getDate()} ${months[d.getMonth()]}`;
    const score = moodScoreMap[item.mood] || 3;
    return { label, score, item };
  });

  const svgW = 320;
  const svgH = 80;
  
  let coords: any[] = [];
  if (plotPoints.length === 1) {
    coords = [{ x: svgW / 2, y: svgH / 2, score: plotPoints[0].score, label: "Today", item: plotPoints[0].item }];
  } else if (plotPoints.length > 1) {
    coords = plotPoints.map((pt, idx) => {
      const divider = plotPoints.length - 1;
      const x = 20 + idx * ((svgW - 40) / divider);
      const y = svgH - 12 - (pt.score - 1) * ((svgH - 24) / 4); // graded 1 to 5
      return { x, y, score: pt.score, label: pt.label, item: pt.item };
    });
  }

  // Calculate SVG curve path using Bezier Cubic
  let pathD = coords.length > 1 ? `M ${coords[0].x} ${coords[0].y}` : "";
  for (let i = 0; i < coords.length - 1; i++) {
    const cpX1 = coords[i].x + (coords[i + 1].x - coords[i].x) / 2;
    const cpY1 = coords[i].y;
    const cpX2 = coords[i].x + (coords[i + 1].x - coords[i].x) / 2;
    const cpY2 = coords[i + 1].y;
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i + 1].x} ${coords[i + 1].y}`;
  }

  const fillD = coords.length > 1 ? `${pathD} L ${coords[coords.length - 1].x} ${svgH} L ${coords[0].x} ${svgH} Z` : "";

  return (
    <div className={`max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 space-y-6 relative select-none animate-fadeIn transition-colors duration-1000 ${
      isNight ? "text-slate-100" : "text-on-background"
    }`}>
      <ScreenHeader title="🌸 Manraah Sanctuary" showBackButton={true} fallbackRoute="/" />
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-10 right-1/4 w-96 h-96 rounded-full blur-[110px] opacity-35 ${currentTheme.glowColor}`}
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-secondary-container/15 blur-[120px] opacity-25"
        />
      </div>

      {/* 12-Column Grid Area */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 z-10 relative"
      >
        
        {/* ==================== ROW 1 ==================== */}

        {/* Hero Card (col-span-8) */}
        <motion.section
          variants={cardVariants}
          className="col-span-12 md:col-span-8 relative rounded-[32px] bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#1E1B4B] p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(99,102,241,0.25)] border border-white/10 min-h-[220px]"
        >
          {/* SVG Sunset/Landscape Illustration on right */}
          <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden sm:block pointer-events-none z-0 opacity-80">
            <svg viewBox="0 0 200 200" className="w-full h-full object-cover">
              <defs>
                <linearGradient id="sunGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Mountains */}
              <path d="M 50 200 L 110 120 L 160 170 L 200 130 L 200 200 Z" fill="#312E81" opacity="0.8" />
              <path d="M 0 200 L 70 140 L 120 180 L 170 150 L 200 200 Z" fill="#1E1B4B" opacity="0.9" />
              {/* Sun/Moon */}
              <circle cx="140" cy="110" r="28" fill="url(#sunGlow)" />
              <circle cx="140" cy="110" r="16" fill="#FEF3C7" />
              {/* Lotus in lake */}
              <path d="M 120 185 C 120 180, 125 175, 130 180 C 135 175, 140 180, 140 185 Z" fill="#F472B6" opacity="0.75" />
            </svg>
          </div>
 
          <div className="space-y-4 z-10 flex-1 flex flex-col justify-center">
            <div className="flex flex-wrap gap-2">
              <span className="px-3.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10 flex items-center gap-1 shadow-inner">
                📅 {currentDateString}
              </span>
              <span className="px-3.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10 flex items-center gap-1 shadow-inner">
                🌿 Day {streakDays}
              </span>
              <span className="px-3.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10 flex items-center gap-1 shadow-inner">
                {themeKey === "night" ? "🌙 Night" : "☀️ " + themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
              </span>
              <span className="px-3.5 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10 flex items-center gap-1 shadow-inner select-none pointer-events-none">
                {getCategoryJourneyBadge(category)}
              </span>
            </div>
 
            <h1 className="text-3xl md:text-4xl font-heading font-black leading-tight tracking-tight text-white">
              {getTimeGreeting()}, {name} ✨
            </h1>
            <p className="text-sm font-medium max-w-md leading-relaxed text-indigo-100/80">
              Every step you take in your sanctuary nurtures your inner balance.
            </p>
          </div>
        </motion.section>
 
        {/* AI Companion Card (col-span-4) */}
        <motion.section
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/ai-chat")}
          className="col-span-12 md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px] relative overflow-hidden"
        >
          {/* Floating AI Robot companion vector */}
          <div className="absolute right-2 bottom-2 w-28 h-28 pointer-events-none z-0">
            <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse duration-[3s]">
              <circle cx="50" cy="50" r="30" fill="#ECEFF8" />
              <rect x="35" y="32" width="30" height="24" rx="10" fill="#4F46E5" />
              {/* Screen eyes */}
              <circle cx="43" cy="44" r="3" fill="#34D399" />
              <circle cx="57" cy="44" r="3" fill="#34D399" />
              {/* Cheeks */}
              <ellipse cx="39" cy="49" rx="2" ry="1" fill="#F472B6" />
              <ellipse cx="61" cy="49" rx="2" ry="1" fill="#F472B6" />
              {/* Antenna */}
              <line x1="50" y1="32" x2="50" y2="20" stroke="#4F46E5" strokeWidth="3" />
              <circle cx="50" cy="18" r="4" fill="#FDBA74" />
              {/* Hover hands */}
              <circle cx="28" cy="55" r="4" fill="#4F46E5" />
              <circle cx="72" cy="55" r="4" fill="#4F46E5" />
            </svg>
          </div>
 
          <div className="space-y-3.5 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-sm">favorite</span>
              </div>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">AI Companion</h4>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold max-w-[200px]">
              "{aiCompanionBubble}"
            </p>
          </div>
 
          <div className="z-10 pt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/ai-chat");
              }}
              className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-[10px] shadow-sm hover:bg-primary-purple transition-all scale-102 hover:scale-105"
            >
              Let's Talk ✨
            </button>
          </div>
        </motion.section>
 
        {/* ==================== ROW 2 ==================== */}
 
        {/* Today's Check-in (col-span-4) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => {
            if (todayMood) {
              setShowReflectionModal(true);
            } else {
              router.push("/checkin");
            }
          }}
          className="col-span-12 md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[260px] relative overflow-hidden"
        >
          {/* Leaf outline illustration inside background */}
          <div className="absolute right-4 bottom-10 opacity-20 pointer-events-none text-emerald-800 text-[90px] select-none">
            🍃
          </div>

          {todayMood ? (
            // CASE 2: User HAS completed check-in
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl filter drop-shadow-sm">🌸</span>
                    <h4 className="font-heading font-extrabold text-sm text-on-surface">
                      Today's Check-in
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                    Completed
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-3xl filter drop-shadow-sm">
                    {getMoodEmoji(todayMood.mood)}
                  </span>
                  <div>
                    <p className="text-base font-black text-on-surface leading-tight">
                      {todayMood.mood}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-bold leading-normal mt-0.5">
                      Completed at {(() => {
                        try {
                          const d = new Date(todayMood.created_at);
                          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } catch (e) {
                          return "";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics Pills */}
              <div className="grid grid-cols-3 gap-1.5 text-center bg-white/35 p-2.5 rounded-2xl border border-white/40">
                <div className="p-1 rounded-xl bg-white/50">
                  <span className="text-[8px] font-bold text-on-surface-variant block">Energy</span>
                  <span className="text-xs font-black text-emerald-700">{todayMood.energy_level}/5</span>
                </div>
                <div className="p-1 rounded-xl bg-white/50">
                  <span className="text-[8px] font-bold text-on-surface-variant block">Stress</span>
                  <span className="text-xs font-black text-orange-600 truncate block">{todayMood.stress || "Manageable"}</span>
                </div>
                <div className="p-1 rounded-xl bg-white/50">
                  <span className="text-[8px] font-bold text-on-surface-variant block">Sleep</span>
                  <span className="text-xs font-black text-indigo-700">{todayMood.sleep_quality}/5</span>
                </div>
              </div>

              {/* Reflection preview if written */}
              {todayMood.reflection && todayMood.reflection.trim().length > 0 && (
                <div className="bg-white/30 p-2.5 rounded-xl border border-white/30 text-[10px] text-on-surface-variant font-semibold">
                  <p className="italic line-clamp-2">
                    "{todayMood.reflection}"
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReflectionModal(true);
                    }}
                    className="text-[9px] font-bold text-primary hover:underline mt-1 block"
                  >
                    Read reflection →
                  </button>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReflectionModal(true);
                }}
                className="px-6 py-2 rounded-full bg-primary text-white font-bold text-xs transition-all self-start shadow-sm mt-1 hover:bg-primary-purple active:scale-98"
              >
                View Reflection
              </button>
            </div>
          ) : (
            // CASE 1: User has NOT completed check-in
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl filter drop-shadow-sm">🌸</span>
                  <h4 className="font-heading font-extrabold text-sm text-on-surface">
                    Today's Check-in
                  </h4>
                </div>
                <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
                  "Take a moment to check in with yourself."
                </p>
              </div>

              <div className="text-xs font-bold text-on-surface-variant/70">
                Status: <span className="text-rose-500 font-extrabold">Not Completed</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push("/checkin");
                }}
                className="px-6 py-3 rounded-full bg-primary text-white hover:bg-primary-purple font-bold text-xs transition-all self-start shadow-md active:scale-98"
              >
                Complete Check-in
              </button>
            </div>
          )}
        </motion.div>

        {/* Mood Trend Chart (col-span-4) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => history.length > 0 && router.push("/mood-tracking")}
          className="col-span-12 md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[250px] relative"
        >
          {history.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-3 flex-1 min-h-[160px]">
              <span className="text-4xl">🌱</span>
              <p className="text-xs text-on-surface-variant font-semibold">
                Your emotional journey starts with today's reflection.
              </p>
              <button
                onClick={() => router.push("/checkin")}
                className="px-6 py-2.5 rounded-full bg-primary text-white hover:bg-primary-purple font-bold text-xs shadow-md transition-all scale-102 hover:scale-105"
              >
                Complete Daily Check-in
              </button>
            </div>
          ) : (
            <div className="space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">trending_up</span>
                  <h4 className="font-heading font-extrabold text-sm text-on-surface">Mood Trend</h4>
                </div>

                {/* Custom SVG Line Chart with Emojis */}
                <div className="w-full h-24 relative mt-1 overflow-visible select-none">
                  <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid guidelines */}
                    <line x1="20" y1={svgH - 12} x2={svgW - 20} y2={svgH - 12} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" />
                    <line x1="20" y1={svgH / 2} x2={svgW - 20} y2={svgH / 2} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" />
                    <line x1="20" y1="12" x2={svgW - 20} y2="12" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3" />
                    
                    {/* Area under curve */}
                    {coords.length > 1 && <path d={fillD} fill="url(#chartGrad)" />}
                    {/* Trend line */}
                    {coords.length > 1 && <path d={pathD} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" />}
                    
                    {/* Points & Emojis */}
                    {coords.map((pt, idx) => (
                      <g key={idx}>
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r="4" 
                          fill="#7C3AED" 
                          className="cursor-pointer hover:r-6 hover:fill-primary-purple transition-all"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        <text x={pt.x} y={pt.y - 8} className="text-[12px] filter drop-shadow-sm select-none pointer-events-none" textAnchor="middle">
                          {getOptionEmoji(pt.score)}
                        </text>
                      </g>
                    ))}
                  </svg>

                  {hoveredPoint && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900/95 text-white text-[9px] p-2.5 rounded-xl shadow-lg border border-white/10 z-30 pointer-events-none min-w-[125px] space-y-0.5">
                      <p className="font-bold border-b border-white/10 pb-0.5 mb-1">{hoveredPoint.label}</p>
                      <p>Mood: {hoveredPoint.item.mood}</p>
                      <p>Energy: {(() => {
                        const map: Record<number, string> = { 5: "Very High", 4: "Good", 3: "Moderate", 2: "Low", 1: "Exhausted" };
                        return map[hoveredPoint.item.energy] || hoveredPoint.item.energy;
                      })()}</p>
                      <p>Stress: {hoveredPoint.item.stress}</p>
                      <p>Sleep: {(() => {
                        const matchMetric = wellnessMetrics.find((w: any) => new Date(w.date).toDateString() === new Date(hoveredPoint.item.created_at).toDateString());
                        const sleepVal = matchMetric ? matchMetric.sleep_score : (hoveredPoint.item.sleep_quality || 3);
                        const map: Record<number, string> = { 5: "Excellent", 4: "Good", 3: "Okay", 2: "Poor", 1: "Very Poor" };
                        return map[sleepVal] || sleepVal;
                      })()}</p>
                    </div>
                  )}
                </div>

                {/* Dates Row */}
                <div className="flex justify-between px-1 text-[8px] font-bold text-on-surface-variant/70 tracking-wider">
                  {plotPoints.map((pt, idx) => (
                    <span key={idx}>{pt.label}</span>
                  ))}
                </div>
              </div>

              {history.length === 1 ? (
                <p className="text-[9px] text-on-surface-variant/90 font-bold leading-normal text-center italic">
                  "Your journey has just begun. Complete a few more daily reflections to discover meaningful patterns."
                </p>
              ) : (
                <button
                  className="text-[9px] font-bold text-primary uppercase tracking-widest self-start flex items-center gap-1 mt-1 hover:opacity-85"
                >
                  <span>View Full Report</span>
                  <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Today's Insight (col-span-4) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-12 md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[250px] relative overflow-hidden"
        >
          {/* Subtle flower drawing inside background */}
          <div className="absolute right-2 bottom-2 opacity-25 pointer-events-none text-[80px] select-none">
            🌸
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-500">lightbulb</span>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Today's Insight</h4>
            </div>
            
            <p className="text-xs text-on-surface-variant/90 leading-relaxed font-semibold max-w-[210px] italic">
              "{oneInsight}"
            </p>
          </div>

          <span className="text-[9px] font-bold text-primary uppercase tracking-widest self-start flex items-center gap-1 hover:opacity-85">
            <span>See More Insights</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          </span>
        </motion.div>

        {/* ==================== ROW 3 ==================== */}

        {/* 1. Sleep Quality (col-span-3) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/sleep")}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px] relative overflow-hidden"
        >
          {/* Moonlight graphic */}
          <div className="absolute right-0 bottom-0 w-16 h-16 pointer-events-none opacity-80">
            <svg viewBox="0 0 60 60" className="w-full h-full">
              <path d="M 40 45 C 30 45, 25 35, 30 25 C 20 28, 20 40, 30 45 Z" fill="#FDE047" opacity="0.6" />
              {/* Clouds */}
              <path d="M 10 50 C 15 45, 25 45, 30 50 Z" fill="#E2E8F0" opacity="0.8" />
            </svg>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg filter drop-shadow-xs">🌙</span>
              <h4 className="font-heading font-extrabold text-xs text-on-surface-variant">Sleep Quality</h4>
            </div>
            
            {latestCheckIn ? (
              <>
                <div className="pt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-on-surface">
                    {(() => {
                      const map: Record<number, string> = { 5: "Excellent", 4: "Good", 3: "Okay", 2: "Poor", 1: "Very Poor" };
                      return map[latestCheckIn.sleep_quality] || "Good";
                    })()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {latestCheckIn.sleep_quality}/5
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/80 font-bold leading-normal">
                  Sleep score recorded in your daily check-in.
                </p>
              </>
            ) : (
              <>
                <div className="pt-2">
                  <span className="text-base font-extrabold text-rose-500">No logs today</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/80 font-bold leading-normal">
                  Reflect on your sleep today to see insights.
                </p>
              </>
            )}
          </div>

          <span className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:opacity-85 mt-2">
            <span>Sleep Insights</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          </span>
        </motion.div>

        {/* 2. Stress Level (col-span-3) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg filter drop-shadow-xs">🍃</span>
              <h4 className="font-heading font-extrabold text-xs text-on-surface-variant">Stress Level</h4>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              {latestCheckIn ? (
                <>
                  <div className="space-y-1">
                    <span className="text-lg font-black text-orange-600 block truncate max-w-[90px]">
                      {latestCheckIn.stress || "Manageable"}
                    </span>
                    <span className="text-[9px] text-on-surface-variant/85 font-semibold block leading-normal max-w-[100px]">
                      Stress indices logged from reflection.
                    </span>
                  </div>

                  {/* Radial Gauge SVG */}
                  <div className="w-14 h-14 relative shrink-0">
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      <path d="M 5 25 A 15 15 0 0 1 35 25" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 5 25 A 15 15 0 0 1 25 12" fill="none" stroke="#F97316" strokeWidth="4" strokeLinecap="round" />
                      {/* Needle */}
                      <polygon 
                        points="20,20 18,22 20,5 22,22" 
                        fill="#475569" 
                        transform={`rotate(${(() => {
                          const stressStr = (latestCheckIn.stress || "").toLowerCase();
                          if (stressStr.includes("peace") || stressStr.includes("low")) return -45;
                          if (stressStr.includes("manage")) return -15;
                          if (stressStr.includes("little")) return 15;
                          if (stressStr.includes("stressful")) return 45;
                          return 75; // overwhelming
                        })()} 20 20)`} 
                      />
                      <circle cx="20" cy="20" r="3" fill="#1E293B" />
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-base font-extrabold text-rose-500 block">No logs today</span>
                    <span className="text-[9px] text-on-surface-variant/85 font-semibold block leading-normal max-w-[100px]">
                      Record today's check-in to trace tension.
                    </span>
                  </div>
                  <div className="w-14 h-14 relative shrink-0">
                    <svg viewBox="0 0 40 40" className="w-full h-full opacity-40">
                      <path d="M 5 25 A 15 15 0 0 1 35 25" fill="none" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="20" cy="20" r="3" fill="#1E293B" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>

          <span className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:opacity-85 mt-2">
            <span>Manage Stress</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          </span>
        </motion.div>

        {/* 3. Energy Level (col-span-3) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg filter drop-shadow-xs">⚡</span>
              <h4 className="font-heading font-extrabold text-xs text-on-surface-variant">Energy Level</h4>
            </div>

            <div className="flex items-center justify-between pt-1 gap-2">
              {latestCheckIn ? (
                <>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-emerald-600 block">
                      {(() => {
                        const map: Record<number, string> = { 5: "Very High", 4: "Good", 3: "Moderate", 2: "Low", 1: "Exhausted" };
                        return map[latestCheckIn.energy_level] || "Moderate";
                      })()}
                    </span>
                    <span className="text-[9px] text-on-surface-variant/85 font-semibold block leading-normal max-w-[100px]">
                      Energy logged: {latestCheckIn.energy_level}/5
                    </span>
                  </div>

                  {/* Custom SVG Battery Illustration */}
                  <div className="w-10 h-14 relative shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 40" className="w-8 h-12 overflow-visible">
                      <rect x="2" y="4" width="20" height="34" rx="4" fill="none" stroke="#94A3B8" strokeWidth="2" />
                      <rect x="8" y="0" width="8" height="4" rx="1" fill="#94A3B8" />
                      {/* Battery Segments */}
                      {latestCheckIn.energy_level >= 1 && <rect x="5" y="28" width="14" height="7" rx="1" fill="#10B981" />}
                      {latestCheckIn.energy_level >= 3 && <rect x="5" y="19" width="14" height="7" rx="1" fill="#10B981" />}
                      {latestCheckIn.energy_level >= 5 && <rect x="5" y="10" width="14" height="7" rx="1" fill="#10B981" />}
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-base font-extrabold text-rose-500 block">No logs today</span>
                    <span className="text-[9px] text-on-surface-variant/85 font-semibold block leading-normal max-w-[100px]">
                      Log your emotional energy reservoir.
                    </span>
                  </div>
                  <div className="w-10 h-14 relative shrink-0 opacity-40">
                    <svg viewBox="0 0 24 40" className="w-8 h-12 overflow-visible">
                      <rect x="2" y="4" width="20" height="34" rx="4" fill="none" stroke="#94A3B8" strokeWidth="2" />
                      <rect x="8" y="0" width="8" height="4" rx="1" fill="#94A3B8" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          </div>

          <span className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:opacity-85 mt-2">
            <span>View Tips</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          </span>
        </motion.div>

        {/* 4. Personalized Recommendation (col-span-3) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/meditation")}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px] relative overflow-hidden"
        >
          {/* Flowery corner vector */}
          <div className="absolute right-0 bottom-0 opacity-15 text-[80px] pointer-events-none select-none text-pink-600">
            🌸
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg filter drop-shadow-xs">🌿</span>
              <h4 className="font-heading font-extrabold text-xs text-on-surface-variant">Recommendation</h4>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed font-bold italic pt-2 line-clamp-4">
              "{recommendation || "We're still getting to know your wellness patterns. Keep checking in daily for more personalized suggestions."}"
            </p>
          </div>

          <span className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:opacity-85 mt-2">
            <span>Start Practice</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          </span>
        </motion.div>

        {/* ==================== ROW 4 ==================== */}

        {/* Recommended For You (col-span-8) */}
        <motion.div
          variants={cardVariants}
          className="col-span-12 md:col-span-8 p-6 md:p-7 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-5"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-extrabold text-sm text-on-surface">Recommended for You</h4>
            <button 
              onClick={() => router.push("/resources")}
              className="text-[9px] font-black text-primary uppercase tracking-wider hover:opacity-80 flex items-center gap-1"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </button>
          </div>

          {/* 4 horizontal cards layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Tile 1: 5-Min Breathing */}
            <motion.div
              whileHover={{ y: -3, scale: 1.015 }}
              onClick={() => router.push("/meditation")}
              className="p-3.5 rounded-[22px] bg-[#FFF5F6] border border-pink-100 hover:border-pink-300 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-soft-xs mx-auto flex items-center justify-center text-lg filter drop-shadow-sm select-none">
                🧘
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-800 leading-tight">5 Min Breathing</p>
                <p className="text-[8px] text-slate-500 font-bold mt-0.5">Reduce stress instantly</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white shadow-soft-xs mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-xs text-primary font-bold">play_arrow</span>
              </div>
            </motion.div>

            {/* Tile 2: Evening Journal */}
            <motion.div
              whileHover={{ y: -3, scale: 1.015 }}
              onClick={() => router.push("/journal")}
              className="p-3.5 rounded-[22px] bg-[#F3F4FF] border border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-soft-xs mx-auto flex items-center justify-center text-lg filter drop-shadow-sm select-none">
                📖
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Evening Journal</p>
                <p className="text-[8px] text-slate-500 font-bold mt-0.5">Write your thoughts</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white shadow-soft-xs mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-xs text-primary font-bold">play_arrow</span>
              </div>
            </motion.div>

            {/* Tile 3: Sleep Sounds */}
            <motion.div
              whileHover={{ y: -3, scale: 1.015 }}
              onClick={() => router.push("/sleep")}
              className="p-3.5 rounded-[22px] bg-[#EDF8FF] border border-sky-100 hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-soft-xs mx-auto flex items-center justify-center text-lg filter drop-shadow-sm select-none">
                🌙
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Sleep Sounds</p>
                <p className="text-[8px] text-slate-500 font-bold mt-0.5">Relax your mind</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white shadow-soft-xs mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-xs text-primary font-bold">play_arrow</span>
              </div>
            </motion.div>

            {/* Tile 4: Study Focus */}
            <motion.div
              whileHover={{ y: -3, scale: 1.015 }}
              onClick={() => router.push("/meditation")}
              className="p-3.5 rounded-[22px] bg-[#F0FDF4] border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-soft-xs mx-auto flex items-center justify-center text-lg filter drop-shadow-sm select-none">
                📚
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Study Focus</p>
                <p className="text-[8px] text-slate-500 font-bold mt-0.5">Improve concentration</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white shadow-soft-xs mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-xs text-primary font-bold">play_arrow</span>
              </div>
            </motion.div>

          </div>
        </motion.div>

        {/* Weekly Reflection Progress Indicators (col-span-4) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/mood-tracking")}
          className="col-span-12 md:col-span-4 p-6 md:p-7 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft hover:shadow-soft-lg cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base filter drop-shadow-sm">🗓️</span>
              <div>
                <h4 className="font-heading font-extrabold text-sm text-on-surface leading-tight">Weekly Reflection</h4>
                <p className="text-[9px] text-on-surface-variant/70 font-semibold mt-0.5">Your progress this week</p>
              </div>
            </div>
 
            {/* Metrics List with Circular/Status Progress */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Check-ins */}
              <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-on-surface-variant/80 block">Check-ins</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">
                    {(() => {
                      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                      return history.filter((item: any) => new Date(item.created_at).getTime() >= oneWeekAgo).length;
                    })()}/7
                  </span>
                </div>
                {/* Micro circular progress */}
                <div className="w-7 h-7 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="14" cy="14" r="10" stroke="#F1F5F9" strokeWidth="2.5" fill="none" />
                    <circle 
                      cx="14" 
                      cy="14" 
                      r="10" 
                      stroke="#8B5CF6" 
                      strokeWidth="2.5" 
                      fill="none" 
                      strokeDasharray="62.8" 
                      strokeDashoffset={(() => {
                        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                        const count = history.filter((item: any) => new Date(item.created_at).getTime() >= oneWeekAgo).length;
                        return 62.8 - (62.8 * Math.min(count, 7)) / 7;
                      })()} 
                    />
                  </svg>
                </div>
              </div>
 
              {/* Avg Mood */}
              <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-on-surface-variant/80 block">Latest Mood</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block truncate max-w-[50px]">
                    {latestCheckIn ? latestCheckIn.mood : "None"}
                  </span>
                </div>
                <span className="text-base">
                  {latestCheckIn ? getMoodEmoji(latestCheckIn.mood) : "🌸"}
                </span>
              </div>
 
              {/* Meditation */}
              <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-on-surface-variant/80 block">Meditation</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">
                    {wellnessMetrics.filter((w: any) => w.mindfulness_minutes > 0).length} Mins
                  </span>
                </div>
                <div className="w-7 h-7 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="14" cy="14" r="10" stroke="#F1F5F9" strokeWidth="2.5" fill="none" />
                    <circle cx="14" cy="14" r="10" stroke="#3B82F6" strokeWidth="2.5" fill="none" strokeDasharray="62.8" strokeDashoffset="45" />
                  </svg>
                </div>
              </div>
 
              {/* Journal */}
              <div className="p-2.5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-bold text-on-surface-variant/80 block">Journal Logs</span>
                  <span className="text-xs font-black text-slate-800 mt-1 block">
                    {dashboardData.journalEntries ? dashboardData.journalEntries.length : 0} Entries
                  </span>
                </div>
                <div className="w-7 h-7 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="14" cy="14" r="10" stroke="#F1F5F9" strokeWidth="2.5" fill="none" />
                    <circle cx="14" cy="14" r="10" stroke="#10B981" strokeWidth="2.5" fill="none" strokeDasharray="62.8" strokeDashoffset="35" />
                  </svg>
                </div>
              </div>
 
            </div>
          </div>
        </motion.div>
      </motion.div>
 
      {/* Reflection Details Modal */}
      <AnimatePresence>
        {showReflectionModal && todayMood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReflectionModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-lg rounded-[32px] bg-white/95 backdrop-blur-xl border border-white/60 p-6 md:p-8 shadow-2xl space-y-6 text-slate-800 select-text max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getMoodEmoji(todayMood.mood)}</span>
                  <div>
                    <h3 className="font-heading font-black text-lg text-slate-800">
                      Today's Sanctuary Reflection
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      Recorded at {(() => {
                        try {
                          const d = new Date(todayMood.created_at);
                          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " · " + currentDateString;
                        } catch (e) {
                          return currentDateString;
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReflectionModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Metrics Summary */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100/60">
                  <span className="text-[10px] font-bold text-indigo-600 block">Mood</span>
                  <span className="text-sm font-black text-indigo-950 mt-0.5 block">{todayMood.mood}</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100/60">
                  <span className="text-[10px] font-bold text-emerald-600 block">Energy</span>
                  <span className="text-sm font-black text-emerald-950 mt-0.5 block">{todayMood.energy_level}/5</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100/60">
                  <span className="text-[10px] font-bold text-amber-600 block">Stress</span>
                  <span className="text-sm font-black text-amber-950 mt-0.5 block truncate">{todayMood.stress || "Manageable"}</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100/60">
                  <span className="text-[10px] font-bold text-purple-600 block">Sleep</span>
                  <span className="text-sm font-black text-purple-950 mt-0.5 block">{todayMood.sleep_quality}/5</span>
                </div>
              </div>

              {/* Written Reflection */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📝</span> Personal Thoughts & Notes
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {todayMood.reflection && todayMood.reflection.trim().length > 0 ? (
                    todayMood.reflection
                  ) : (
                    <span className="italic text-slate-400">No written thoughts recorded for this reflection.</span>
                  )}
                </div>
              </div>

              {/* Gratitude / Context */}
              {todayMood.gratitude_reflection && todayMood.gratitude_reflection.trim().length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✨</span> What mattered today
                  </h4>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 text-xs text-slate-700 leading-relaxed font-medium">
                    {todayMood.gratitude_reflection}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => router.push("/checkin")}
                  className="px-5 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Edit Reflection
                </button>
                <button
                  onClick={() => setShowReflectionModal(false)}
                  className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-purple transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DailyPrivacyReminder />
    </div>
  );
}
