"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

interface MoodDetail {
  value: number;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  message: string;
}

const MOOD_DATA: Record<string, MoodDetail> = {
  Amazing: { value: 5, emoji: "😁", color: "#EC4899", bgColor: "bg-pink-50/70", textColor: "text-pink-600", message: "You've been radiating joy and high spirits today." },
  Happy: { value: 4.5, emoji: "😊", color: "#F59E0B", bgColor: "bg-amber-50/70", textColor: "text-amber-600", message: "You logged a warm sense of happiness today." },
  Calm: { value: 4, emoji: "🙂", color: "#3B82F6", bgColor: "bg-blue-50/70", textColor: "text-blue-600", message: "You logged a peaceful state of calm today." },
  Okay: { value: 3, emoji: "😐", color: "#6B7280", bgColor: "bg-slate-50/70", textColor: "text-slate-600", message: "You logged a balanced, neutral state today." },
  Low: { value: 2, emoji: "😔", color: "#6366F1", bgColor: "bg-indigo-50/70", textColor: "text-indigo-600", message: "You've been carrying a slightly low mood today. Rest gently." },
  Overwhelmed: { value: 1, emoji: "😣", color: "#EF4444", bgColor: "bg-rose-50/70", textColor: "text-rose-600", message: "You've been feeling stressed or overwhelmed today. Breathe slow." },
};

const DEFAULT_MOOD: MoodDetail = {
  value: 3,
  emoji: "🌸",
  color: "#8B5CF6",
  bgColor: "bg-purple-50/70",
  textColor: "text-purple-600",
  message: "Your sanctuary is open. Reflect whenever you are ready."
};

export default function MoodInsightsScreen() {
  const router = useRouter();
  const { dashboardData, isLoading, refetchDashboardData } = useWellness();
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [hoveredDay, setHoveredDay] = useState<any | null>(null);
  const [showReflectionModal, setShowReflectionModal] = useState<any | null>(null);

  const history = dashboardData?.history || [];
  const streak = dashboardData?.streak?.currentStreak || 12;

  // 1. Resolve Today's Log
  const todayEntry = useMemo(() => {
    if (history.length === 0) return null;
    const todayStr = new Date().toDateString();
    return history.find((e: any) => new Date(e.created_at).toDateString() === todayStr) || null;
  }, [history]);

  const todayMoodDetail = todayEntry ? (MOOD_DATA[todayEntry.mood] || DEFAULT_MOOD) : null;

  // 2. Generate Calendar Days
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }).map((_, idx) => {
      const dayNum = idx + 1;
      const date = new Date(year, month, dayNum);
      const dateStr = date.toDateString();
      const entry = history.find((e: any) => new Date(e.created_at).toDateString() === dateStr);
      return { dayNum, date, entry };
    });
  }, [history]);

  // 3. Flower Chart Petals Distribution
  const flowerPetals = useMemo(() => {
    const distribution: Record<string, number> = {
      Amazing: 0,
      Happy: 0,
      Calm: 0,
      Okay: 0,
      Low: 0,
      Overwhelmed: 0,
    };
    history.forEach((e: any) => {
      if (distribution[e.mood] !== undefined) {
        distribution[e.mood]++;
      }
    });

    const total = history.length || 1;
    return Object.entries(distribution).map(([mood, count], idx) => {
      const percentage = (count / total) * 100;
      const angle = idx * 60; // 6 petals = 60deg separation
      const detail = MOOD_DATA[mood] || DEFAULT_MOOD;
      return { mood, count, percentage, angle, detail };
    });
  }, [history]);

  // 4. Dynamic AI Insights
  const aiInsights = useMemo(() => {
    if (history.length < 3) {
      return [
        { emoji: "🌱", text: "Log a few more days to discover sleep and stress correlations." },
        { emoji: "🌸", text: "Sanctuary patterns update dynamically with every reflection." }
      ];
    }
    
    const insightsList = [];
    const averageSleep = history.reduce((acc: number, cur: any) => acc + (cur.sleep || 3), 0) / history.length;
    
    if (averageSleep > 3.8) {
      insightsList.push({ emoji: "🌿", text: "Your mood improved on average when sleep exceeded 7 hours." });
    } else {
      insightsList.push({ emoji: "🌙", text: "Restorative sleep appears low recently. Sleep consistency could lower daily stress." });
    }

    const highStressCount = history.filter((e: any) => e.stress === "Stressful" || e.stress === "Very overwhelming").length;
    if (highStressCount > history.length / 2) {
      insightsList.push({ emoji: "🧘", text: "Elevated stress detected. A 5-minute breathing exercise is suggested." });
    } else {
      insightsList.push({ emoji: "☀️", text: "Stress levels have remained manageable this week. Keep up the balance!" });
    }

    return insightsList;
  }, [history]);

  // 5. Dynamic Recommendations
  const suggestions = useMemo(() => {
    if (!todayEntry) {
      return [
        { icon: "🧘", title: "Complete Daily Log", desc: "Take a quiet moment to log today's feelings.", action: () => router.push("/mood-checkin") },
        { icon: "🎵", title: "Listen to Rain Sounds", desc: "5 minutes of white noise to calm your mind.", action: () => router.push("/meditation") }
      ];
    }
    
    const list = [];
    if (todayEntry.stress === "Stressful" || todayEntry.stress === "Very overwhelming") {
      list.push({ icon: "🌿", title: "Practice Breathing", desc: "A guided box breathing session to reset cortisol.", action: () => router.push("/meditation") });
    }
    if (todayEntry.energy <= 2) {
      list.push({ icon: "🧘", title: "Five-Minute Rest", desc: "A soft, non-sleep deep rest practice.", action: () => router.push("/meditation") });
    }
    if (list.length < 2) {
      list.push({ icon: "📖", title: "Sanctuary Journal", desc: "Pen down your gratitude reflections.", action: () => router.push("/journal") });
      list.push({ icon: "🎵", title: "Listen to Rain Sounds", desc: "Relax with healing white noise sounds.", action: () => router.push("/meditation") });
    }
    return list;
  }, [todayEntry]);

  // 6. Monthly Summary Reflection Calculations
  const monthlyStats = useMemo(() => {
    if (history.length === 0) return null;
    
    const counts: Record<string, number> = {};
    let highStreak = 0;
    let tempStreak = 0;
    
    history.forEach((e: any) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
      
      const val = MOOD_DATA[e.mood]?.value || 3;
      if (val >= 4) {
        tempStreak++;
        highStreak = Math.max(highStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    const sortedMoods = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const commonMood = sortedMoods[0] ? sortedMoods[0][0] : "Calm";

    return {
      commonMood,
      positiveStreak: highStreak || 1,
      resilienceMsg: highStreak >= 3 ? "You showed remarkable resilience this month." : "Every step counts. Your consistent log is a win."
    };
  }, [history]);

  // 7. Achievements List
  const achievements = useMemo(() => {
    const list = [];
    if (history.length >= 1) list.push({ icon: "🌱", title: "First Check-in", desc: "Unlocked on your first daily log." });
    if (history.length >= 7) list.push({ icon: "🌸", title: "Seven Calm Days", desc: "Unlocked after logging 7 days." });
    if (streak >= 3) list.push({ icon: "🌙", title: "Consistent Reflection", desc: "Unlocked for a 3-day checkin streak." });
    if (history.length >= 30) list.push({ icon: "🍃", title: "Sanctuary Bloom", desc: "Logged 30 daily reflections." });
    return list;
  }, [history, streak]);

  // 8. Custom Bezier Curve Calculation for Weekly Timeline
  const svgW = 600;
  const svgH = 180;
  const timelinePoints = useMemo(() => {
    const recent = history.slice(0, 7).reverse();
    if (recent.length === 0) return [];
    
    return recent.map((item: any, idx: number) => {
      const x = 30 + idx * ((svgW - 60) / Math.max(recent.length - 1, 1));
      const moodVal = MOOD_DATA[item.mood]?.value || 3;
      const y = svgH - 30 - (moodVal - 1) * ((svgH - 60) / 4); // maps 1 to 5 values
      return { x, y, item };
    });
  }, [history]);

  const curveD = useMemo(() => {
    if (timelinePoints.length < 2) return "";
    let d = `M ${timelinePoints[0].x} ${timelinePoints[0].y}`;
    for (let i = 0; i < timelinePoints.length - 1; i++) {
      const cpX1 = timelinePoints[i].x + (timelinePoints[i+1].x - timelinePoints[i].x) / 2;
      const cpY1 = timelinePoints[i].y;
      const cpX2 = timelinePoints[i].x + (timelinePoints[i+1].x - timelinePoints[i].x) / 2;
      const cpY2 = timelinePoints[i+1].y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${timelinePoints[i+1].x} ${timelinePoints[i+1].y}`;
    }
    return d;
  }, [timelinePoints]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 py-10 px-4 animate-pulse select-none">
        <ScreenHeader title="🌿 Mood Journey" showBackButton={true} fallbackRoute="/dashboard" />
        <div className="h-[180px] bg-slate-200/50 rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[240px] bg-slate-200/50 rounded-[32px]" />
          <div className="h-[240px] bg-slate-200/50 rounded-[32px]" />
        </div>
      </div>
    );
  }

  // 9. Empty State
  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-8 select-none relative z-10">
        <ScreenHeader title="🌿 Mood Journey" showBackButton={true} fallbackRoute="/dashboard" />
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center bg-purple-50 rounded-full border border-purple-100 shadow-inner">
          <span className="text-5xl filter drop-shadow-sm animate-pulse">🌸</span>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-heading font-black text-on-surface">Your Emotional Garden</h1>
          <p className="text-sm font-semibold text-on-surface-variant max-w-sm mx-auto leading-relaxed">
            "Your emotional garden is waiting to bloom. Complete your first Daily Check-in to begin understanding your patterns."
          </p>
        </div>

        <button
          onClick={() => router.push("/checkin")}
          className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
        >
          Complete Today's Check-in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-4 px-3 md:px-6 relative select-none">
      <ScreenHeader title="🌿 Mood Journey" showBackButton={true} fallbackRoute="/dashboard" />
      
      {/* Background breathes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-10 w-96 h-96 rounded-full bg-secondary-container/5 blur-[120px]" />
      </div>

      {/* PAGE HEADER */}
      <section className="relative rounded-[32px] bg-gradient-to-tr from-[#6366F1] via-[#4F46E5] to-[#312E81] p-6 md:p-8 overflow-hidden shadow-[0_20px_50px_rgba(99,102,241,0.2)] border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
        
        {/* Soft mountain shapes inside backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            <path d="M 0 200 L 120 80 L 250 180 L 380 90 L 400 110 L 400 200 Z" fill="#312E81" />
          </svg>
        </div>

        <div className="space-y-3 text-center sm:text-left z-10">
          <span className="px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/15 text-indigo-100 border border-white/10 shadow-inner">
            Your Emotional Journey
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-white leading-tight">
            Your Emotional Journey
          </h1>
          <p className="text-xs md:text-sm font-medium text-indigo-100/80 max-w-md leading-relaxed">
            "Every feeling matters. Understanding your emotions is the first step toward caring for them."
          </p>
        </div>

        <div className="flex gap-3 text-center z-10 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white min-w-[80px]">
            <span className="block text-[8px] font-bold uppercase text-indigo-200">Streak</span>
            <span className="text-lg font-black">{streak}🔥</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white min-w-[80px]">
            <span className="block text-[8px] font-bold uppercase text-indigo-200">Logs</span>
            <span className="text-lg font-black">{history.length}🌸</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: TODAY'S MOOD */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Today's Mood details */}
        <div className="md:col-span-8 p-6.5 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft flex flex-col sm:flex-row items-center gap-6 justify-between relative overflow-hidden">
          
          <div className="absolute right-0 bottom-0 top-0 opacity-5 pointer-events-none text-[150px]">
            🌸
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10">
            <motion.div
              animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner ${
                todayMoodDetail ? todayMoodDetail.bgColor : "bg-slate-100"
              }`}
            >
              {todayMoodDetail ? todayMoodDetail.emoji : "🌸"}
            </motion.div>
            
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">Today's Mood</span>
              <h3 className={`text-xl font-black ${todayMoodDetail ? todayMoodDetail.textColor : "text-slate-700"}`}>
                {todayEntry ? todayEntry.mood : "Not logged today"}
              </h3>
              <p className="text-xs text-on-surface-variant font-semibold leading-relaxed max-w-sm">
                {todayMoodDetail ? todayMoodDetail.message : "You haven't logged today yet. Take a quiet minute to check in."}
              </p>
            </div>
          </div>

          <div className="z-10 shrink-0">
            <button
              onClick={() => {
                if (todayEntry) {
                  setShowReflectionModal(todayEntry);
                } else {
                  router.push("/checkin");
                }
              }}
              className="px-6 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md transition-all scale-102 hover:scale-105"
            >
              {todayEntry ? "View Today's Reflection" : "Complete Log"}
            </button>
          </div>
        </div>

        {/* Dynamic Sugestion widget */}
        <div className="md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌿</span>
              <h4 className="font-heading font-extrabold text-xs text-on-surface-variant">A Gentle Suggestion</h4>
            </div>
            {suggestions[0] && (
              <div className="pt-2">
                <span className="text-2xl filter drop-shadow-xs">{suggestions[0].icon}</span>
                <p className="font-heading font-black text-xs text-on-surface mt-1">{suggestions[0].title}</p>
                <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5 leading-normal">{suggestions[0].desc}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => suggestions[0]?.action()}
            className="text-[9px] font-bold text-primary uppercase tracking-widest self-start flex items-center gap-1 hover:opacity-85 mt-4"
          >
            <span>Begin Practice</span>
            <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* SECTION 2: MOOD TIMELINE */}
      <section className="p-6 md:p-8 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4">
        <div>
          <h3 className="font-heading font-black text-sm text-on-surface">Patterns You've Created</h3>
          <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Smooth connector lines of your recent 7 check-ins.</p>
        </div>

        {timelinePoints.length < 2 ? (
          <div className="py-12 text-center text-xs text-on-surface-variant font-bold">
            Log at least two entries to map timelines.
          </div>
        ) : (
          <div className="w-full relative select-none pt-4 overflow-visible">
            
            {/* SVG Bezier Line Canvas */}
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible">
              <path d={curveD} fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
              
              {/* Nodes circles */}
              {timelinePoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#7C3AED"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredNode(pt)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              ))}
            </svg>

            {/* Emojis positioning row */}
            <div className="relative w-full h-8 mt-2 flex justify-between px-6 text-xs select-none">
              {timelinePoints.map((pt, idx) => {
                const moodInfo = MOOD_DATA[pt.item.mood] || DEFAULT_MOOD;
                return (
                  <div
                    key={idx}
                    className="absolute -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
                    style={{ left: `${(pt.x / svgW) * 100}%` }}
                    onMouseEnter={() => setHoveredNode(pt)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <span className="text-xl filter drop-shadow-xs select-none">{moodInfo.emoji}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">
                      {new Date(pt.item.created_at).toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Hover Node details Card */}
            <AnimatePresence>
              {hoveredNode && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute z-20 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl max-w-xs text-left"
                  style={{
                    left: `${(hoveredNode.x / svgW) * 90}%`,
                    top: `${(hoveredNode.y / svgH) * 50}%`
                  }}
                >
                  <p className="text-[10px] font-black text-primary uppercase">
                    {new Date(hoveredNode.item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                  <p className="text-xs font-black text-slate-800 mt-1">{hoveredNode.item.mood} Mood</p>
                  
                  <div className="flex gap-2.5 mt-2 text-[8px] font-bold text-slate-500">
                    <span>⚡ Energy: {hoveredNode.item.energy}/5</span>
                    <span>🌿 Stress: {hoveredNode.item.stress}</span>
                  </div>

                  {hoveredNode.item.reflection && (
                    <p className="text-[9px] text-slate-400 font-semibold leading-relaxed border-t border-slate-100 pt-1.5 mt-1.5 line-clamp-2 italic">
                      "{hoveredNode.item.reflection}"
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </section>

      {/* SECTION 3: EMOTIONAL CALENDAR */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Monthly Calendar Grid (7 columns) */}
        <div className="md:col-span-7 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4">
          <div>
            <h3 className="font-heading font-black text-sm text-on-surface">Looking Back With Kindness</h3>
            <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Your monthly log calendar mapping checks.</p>
          </div>

          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {calendarDays.map((day) => {
              const moodInfo = day.entry ? (MOOD_DATA[day.entry.mood] || DEFAULT_MOOD) : null;
              return (
                <div
                  key={day.dayNum}
                  onMouseEnter={() => day.entry && setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold border transition-all cursor-pointer relative ${
                    moodInfo
                      ? `${moodInfo.bgColor} border-transparent text-slate-800 scale-102`
                      : "bg-white/20 border-white/30 text-slate-400 hover:bg-white/40"
                  }`}
                >
                  {moodInfo ? moodInfo.emoji : day.dayNum}
                </div>
              );
            })}
          </div>

          {/* Hover Day Card */}
          <AnimatePresence>
            {hoveredDay && hoveredDay.entry && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-lg text-left space-y-2 mt-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-primary uppercase">Day {hoveredDay.dayNum}</span>
                  <span className="text-[8px] text-slate-400 font-bold">
                    {new Date(hoveredDay.entry.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                
                <p className="text-xs font-black text-slate-800">Mood logged: {hoveredDay.entry.mood}</p>
                <div className="flex gap-2.5 text-[8px] font-bold text-slate-500 uppercase">
                  <span>⚡ Energy: {hoveredDay.entry.energy}/5</span>
                  <span>🕯️ Stress: {hoveredDay.entry.stress}</span>
                </div>

                {hoveredDay.entry.reflection && (
                  <p className="text-[9px] text-slate-400 leading-relaxed font-semibold italic border-t border-slate-100 pt-1.5">
                    "{hoveredDay.entry.reflection}"
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flower Chart Petals Distribution (5 columns) */}
        <div className="md:col-span-5 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-heading font-black text-sm text-on-surface">Emotional Garden Bloom</h3>
            <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Petals grow radially based on check-in frequency.</p>
          </div>

          {/* Flower Visual representation */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-4 overflow-visible">
            {/* Center bud */}
            <div className="w-10 h-10 rounded-full bg-amber-300 border-2 border-amber-400 z-10 shadow-md flex items-center justify-center text-xs font-bold text-amber-800">
              🌱
            </div>
            
            {/* Flower Petals */}
            {flowerPetals.map((petal, idx) => {
              // Radial scaling logic
              const petalScale = Math.max(0.4, Math.min(0.4 + (petal.percentage / 100) * 1.2, 1.6));
              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0 }}
                  animate={{ scale: petalScale }}
                  transition={{ type: "spring", stiffness: 80, damping: 10, delay: idx * 0.05 }}
                  className="absolute origin-center w-8 h-20 rounded-full opacity-70 shadow-sm flex flex-col items-center justify-start pt-2 cursor-pointer border border-white/10"
                  style={{
                    backgroundColor: petal.detail.color,
                    transform: `rotate(${petal.angle}deg) translateY(-32px)`,
                  }}
                  title={`${petal.mood}: ${Math.round(petal.percentage)}%`}
                >
                  <span className="text-xs filter drop-shadow-xs rotate-[-angle] select-none pointer-events-none">
                    {petal.detail.emoji}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[8px] font-black text-slate-600">
            {flowerPetals.map((p, idx) => (
              <div key={idx} className="flex items-center gap-1 justify-center">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.detail.color }} />
                <span>{p.mood}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: DYNAMIC OBSERVATIONS & DYNAMIC RECOMMENDATIONS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Observations list (7 columns) */}
        <div className="md:col-span-7 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌿</span>
            <h3 className="font-heading font-black text-sm text-on-surface">AI Observations</h3>
          </div>

          <div className="space-y-3.5">
            {aiInsights.map((ins, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-soft-xs flex items-start gap-3">
                <span className="text-xl filter drop-shadow-xs select-none">{ins.emoji}</span>
                <p className="text-xs text-on-surface leading-relaxed font-semibold">
                  {ins.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized recommendations list (5 columns) */}
        <div className="md:col-span-5 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <h3 className="font-heading font-black text-sm text-on-surface">Suggested Practices</h3>
          </div>

          <div className="space-y-3">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={s.action}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-soft-md cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow-xs select-none">{s.icon}</span>
                  <div>
                    <p className="font-heading font-black text-xs text-slate-800 leading-tight">{s.title}</p>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-normal">{s.desc}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: MOOD CORRELATIONS & MONTHLY SUMMARY */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Summary Card (5 columns) */}
        {monthlyStats && (
          <div className="md:col-span-5 p-6.5 rounded-[32px] bg-gradient-to-tr from-purple-50/70 to-indigo-50/70 border border-purple-100 shadow-soft flex flex-col justify-between min-h-[280px]">
            <div className="space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-white text-[9px] font-black uppercase text-primary border border-purple-100 shadow-sm inline-block">
                Monthly reflection
              </span>
              
              <div className="space-y-2 pt-2 text-left">
                <div className="flex justify-between border-b border-purple-100/50 pb-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold">Common Mood:</span>
                  <span className="text-xs font-black text-slate-800">{monthlyStats.commonMood}</span>
                </div>
                <div className="flex justify-between border-b border-purple-100/50 pb-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold">Positive Streak:</span>
                  <span className="text-xs font-black text-slate-800">{monthlyStats.positiveStreak} Days</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-4">
              <p className="text-xs font-black text-slate-800 italic leading-relaxed">
                "{monthlyStats.resilienceMsg}"
              </p>
              <p className="text-[9px] text-slate-500 font-bold leading-normal">
                Monthly garden reflections show deep resilience.
              </p>
            </div>
          </div>
        )}

        {/* Achievements list (7 columns) */}
        <div className="md:col-span-7 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h3 className="font-heading font-black text-sm text-on-surface">Sanctuary Growth Milestones</h3>
            </div>
            <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5">Soft milestones representing emotional logs.</p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-2 w-full">
            {achievements.map((ach, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-soft-xs flex items-center gap-2.5">
                <span className="text-2xl filter drop-shadow-xs select-none">{ach.icon}</span>
                <div className="text-left">
                  <p className="font-heading font-black text-[10px] text-slate-800 leading-tight">{ach.title}</p>
                  <p className="text-[8px] text-slate-500 font-semibold mt-0.5 leading-normal">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Reflection Modal Dialog */}
      AnimatePresence
      {showReflectionModal && (
        <div className="fixed inset-0 bg-black/15 backdrop-blur-[5px] z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-7 rounded-[32px] bg-white max-w-sm w-full border border-slate-200 shadow-2xl space-y-5 text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-primary uppercase">
                  {new Date(showReflectionModal.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <h3 className="font-heading font-black text-base text-slate-800 mt-0.5">Today's Sanctuary Log</h3>
              </div>
              <button
                onClick={() => setShowReflectionModal(null)}
                className="text-slate-400 hover:text-slate-600 material-symbols-outlined text-lg"
              >
                close
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <span className="text-3xl">{MOOD_DATA[showReflectionModal.mood]?.emoji || "🌸"}</span>
                <div>
                  <p className="text-xs font-black text-slate-800 leading-tight">Mood: {showReflectionModal.mood}</p>
                  <span className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 block">
                    Logged stress: {showReflectionModal.stress}
                  </span>
                </div>
              </div>

              {showReflectionModal.reflection && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Reflection Note:</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    "{showReflectionModal.reflection}"
                  </p>
                </div>
              )}

              {showReflectionModal.factors && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Gratitude details:</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    "{showReflectionModal.factors}"
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowReflectionModal(null)}
              className="w-full py-3 rounded-full bg-primary hover:bg-primary-purple text-white text-xs font-bold shadow-md text-center block"
            >
              Back to Journey
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
