"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

const DAILY_QUOTES = [
  "Small steps every day bring you closer to your grandest goals.",
  "Focus on progress, not perfection. Every study session counts.",
  "Resting is an active part of learning. Give your mind room to absorb.",
  "Your dedication today builds the bridge to tomorrow's success.",
  "Deep breaths lead to clear thoughts. Stay centered and calm.",
  "Knowledge builds brick by brick. Keep going at your own pace.",
  "Trust the process. Growth happens quietly in moments of focus."
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 14 } },
};

function getDailyQuote() {
  const dayOfWeek = new Date().getDay();
  return DAILY_QUOTES[dayOfWeek % DAILY_QUOTES.length];
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}

// ─── Focus Ring SVG ───────────────────────────────────────────────────────
function FocusRing({ score, color }: { score: number; color: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const filled = circ * (score / 100);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - filled}
        transform="rotate(-90 50 50)"
        className="transition-all duration-1000 ease-out"
      />
      <text
        x="50"
        y="46"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-on-surface font-heading font-black text-xl"
      >
        {score}
      </text>
      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-on-surface-variant/70 font-semibold text-[8px]"
      >
        / 100
      </text>
    </svg>
  );
}

// ─── Interactive Pomodoro Timer ──────────────────────────────────────────
function PomodoroCard() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const selectPreset = (mins: number) => {
    setSelectedPreset(mins);
    setSecondsLeft(mins * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const PRESETS = [
    { mins: 25, label: "25 min Focus", emoji: "🍅" },
    { mins: 45, label: "45 min Deep", emoji: "📚" },
    { mins: 15, label: "15 min Sprint", emoji: "⚡" },
  ];

  return (
    <div className="space-y-3 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🍅</span>
          <h4 className="font-heading font-extrabold text-xs text-on-surface">Study Session Planner</h4>
        </div>
        {isRunning && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.mins}
            onClick={() => selectPreset(p.mins)}
            className={`py-1.5 px-2 rounded-xl text-[9px] font-bold transition-all text-center ${
              selectedPreset === p.mins
                ? "bg-primary text-white shadow-xs"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <div>{p.emoji} {p.mins}m</div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between py-1 px-3 rounded-2xl bg-surface-container-lowest border border-surface-variant/30">
        <div className="text-xl font-heading font-black text-on-surface tracking-wider">
          {timeStr}
        </div>
        <div className="text-[10px] text-on-surface-variant font-semibold">
          {selectedPreset} min Pomodoro
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTimer}
          className={`flex-1 py-2.5 rounded-full font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${
            isRunning
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-primary text-white hover:bg-primary-purple"
          }`}
        >
          <span className="material-symbols-outlined text-sm">
            {isRunning ? "pause" : "play_arrow"}
          </span>
          <span>{isRunning ? "Pause" : "Start Focus Session"}</span>
        </button>

        {isRunning && (
          <button
            onClick={() => selectPreset(selectedPreset)}
            className="p-2.5 rounded-full bg-surface-container-low border border-surface-variant/40 text-on-surface-variant hover:bg-surface-container-high transition-all"
            title="Reset timer"
          >
            <span className="material-symbols-outlined text-sm">replay</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Exam / Deadline Tracker ─────────────────────────────────────────────
function ExamDeadlineCard() {
  const router = useRouter();
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [activeDeadline, setActiveDeadline] = useState<{ name: string; daysLeft: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("manraah_student_deadline");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const diffDays = Math.ceil((new Date(parsed.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (diffDays >= 0) {
          setActiveDeadline({ name: parsed.name, daysLeft: diffDays });
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim() || !examDate) return;
    const diffDays = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const deadlineObj = { name: examName.trim(), date: examDate };
    localStorage.setItem("manraah_student_deadline", JSON.stringify(deadlineObj));
    setActiveDeadline({ name: examName.trim(), daysLeft: Math.max(0, diffDays) });
    setExamName("");
    setExamDate("");
  };

  const clearDeadline = () => {
    localStorage.removeItem("manraah_student_deadline");
    setActiveDeadline(null);
  };

  return (
    <div className="space-y-3 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
          <h4 className="font-heading font-extrabold text-xs text-on-surface">Exam / Deadline Tracker</h4>
        </div>
        {activeDeadline && (
          <button onClick={clearDeadline} className="text-[9px] font-bold text-on-surface-variant/60 hover:text-red-500">
            Clear
          </button>
        )}
      </div>

      {activeDeadline ? (
        <div className="space-y-2 p-3 rounded-2xl bg-primary-container/10 border border-primary/20">
          <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Upcoming Deadline</p>
          <div className="flex justify-between items-baseline">
            <h5 className="text-sm font-bold text-on-surface">{activeDeadline.name}</h5>
            <span className="text-base font-black text-primary">{activeDeadline.daysLeft} days left</span>
          </div>
          <button
            onClick={() => router.push("/meditation")}
            className="w-full py-1.5 rounded-xl bg-white text-primary font-bold text-[10px] border border-primary/20 shadow-xs hover:bg-primary/5 transition-all text-center block"
          >
            🎧 Take Pre-Exam Calm Session
          </button>
        </div>
      ) : (
        <form onSubmit={handleSet} className="space-y-2">
          <p className="text-[10px] text-on-surface-variant/80 font-medium leading-relaxed">
            Add an upcoming exam to calculate countdown & unlock anxiety relief.
          </p>
          <input
            type="text"
            placeholder="Exam or deadline name..."
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-on-surface"
          />
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/40 text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 text-on-surface"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary/20 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all"
          >
            Set Countdown →
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Belonging Signal ──────────────────────────────────────────────────
function BelongingSignal() {
  const [selected, setSelected] = useState<string | null>(null);

  const OPTIONS = [
    { id: "connected", label: "Connected", emoji: "🤝" },
    { id: "neutral", label: "Neutral", emoji: "😐" },
    { id: "isolated", label: "Isolated", emoji: "🫂" },
  ];

  return (
    <div className="space-y-3 flex flex-col justify-between h-full">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-base">🤝</span>
          <h4 className="font-heading font-extrabold text-xs text-on-surface">Belonging Signal</h4>
        </div>
        <p className="text-[10px] text-on-surface-variant/80 font-medium leading-relaxed">
          How connected have you felt with peers this week?
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
              selected === opt.id
                ? "bg-primary-container/20 border-primary text-primary font-bold shadow-xs scale-105"
                : "bg-surface-container-low border-surface-variant/30 text-on-surface-variant hover:border-primary/30"
            }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-[10px] font-bold">{opt.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-[10px] text-on-surface-variant/80 text-center font-medium">
          {selected === "connected" && "Great to hear! Connection is protective for mental health 💚"}
          {selected === "neutral" && "Neutral is okay — consider reaching out to one person today 🌿"}
          {selected === "isolated" && "You're not alone. The Human Companion is here anytime 🫂"}
        </p>
      )}
    </div>
  );
}

// ─── Weekly Progress Chart ─────────────────────────────────────────────
function WeeklyProgressChart({ history = [] }: { history?: any[] }) {
  const router = useRouter();
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  if (Array.isArray(history) && history.length > 0) {
    history.forEach((item: any) => {
      if (item.created_at) {
        const d = new Date(item.created_at);
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
        if (dayCounts[dayName] !== undefined) {
          dayCounts[dayName] += 1;
        }
      }
    });
  }

  const weeklyData = daysOfWeek.map((day) => ({
    day,
    studyHours: dayCounts[day] || 0,
  }));

  const maxHours = Math.max(...weeklyData.map((d) => d.studyHours), 1);
  const todayDayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

  return (
    <div className="space-y-4 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">bar_chart</span>
          <h4 className="font-heading font-extrabold text-sm text-on-surface">Weekly Study & Check-in Activity</h4>
        </div>
        <span className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-wider">Sessions / day</span>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-24">
        {weeklyData.map((d) => {
          const heightPct = (d.studyHours / maxHours) * 100;
          const isToday = d.day === todayDayName;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full relative group flex items-end justify-center" style={{ height: "80px" }}>
                <div
                  className={`w-full rounded-t-xl transition-all duration-500 ${
                    isToday ? "bg-primary shadow-md" : "bg-primary/30"
                  }`}
                  style={{ height: `${Math.max(12, heightPct)}%` }}
                />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {d.studyHours} sessions
                </span>
              </div>
              <span className={`text-[9px] font-bold ${isToday ? "text-primary" : "text-on-surface-variant/70"}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => router.push("/reports")}
        className="text-[9px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 hover:opacity-80"
      >
        <span>Full Report</span>
        <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
      </button>
    </div>
  );
}

// ─── Main StudentDashboard Component ─────────────────────────────────────
export default function StudentDashboard() {
  const router = useRouter();
  const { dashboardData, isLoading } = useWellness();
  const [themeKey, setThemeKey] = useState<"morning" | "afternoon" | "evening" | "night">("evening");
  const [currentDateString, setCurrentDateString] = useState("Today");
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const session = getClientSession();
    if (!session?.isAuthenticated || !session.user) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setGreeting(getTimeGreeting());
    const h = new Date().getHours();
    if (h >= 5 && h < 12) setThemeKey("morning");
    else if (h >= 12 && h < 17) setThemeKey("afternoon");
    else if (h >= 17 && h < 21) setThemeKey("evening");
    else setThemeKey("night");

    const d = new Date();
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    setCurrentDateString(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);
  }, []);

  if (isLoading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto py-4 px-4 space-y-8 animate-pulse select-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-8 h-[260px] rounded-[32px] bg-slate-200/50" />
          <div className="col-span-1 md:col-span-4 h-[260px] rounded-[32px] bg-slate-200/50" />
        </div>
      </div>
    );
  }

  const { user, streak, history } = dashboardData;
  const name = user?.sanctuaryName || user?.name || "Scholar";
  const streakDays = typeof streak === "number"
    ? streak
    : (streak && typeof streak === "object" && "currentStreak" in streak ? (streak as any).currentStreak : 1);

  const hasCompletedAssessment = !!(user as any)?.assessmentScore || !!(user as any)?.wellnessScore;

  const mindfulnessMins = (user as any)?.mindfulnessMinutes || 0;
  const focusScoreVal = Math.min(100, Math.max(25, 50 + Math.floor(mindfulnessMins / 5) + streakDays * 2));
  const focusLabel = focusScoreVal >= 80 ? "Optimal Focus" : focusScoreVal >= 60 ? "Good Focus" : "Building Focus";
  const focusDesc = `${mindfulnessMins} min of mindfulness logged.`;

  const activeProgDays = Math.min(14, Math.max(1, streakDays));
  const activeProgPct = Math.round((activeProgDays / 14) * 100);

  const quote = getDailyQuote();

  return (
    <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 space-y-6 relative select-none animate-fadeIn">
      <ScreenHeader title="🎓 Student Sanctuary" showBackButton={true} fallbackRoute="/" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6 z-10 relative"
      >
        {/* Hero Card */}
        <motion.section
          variants={cardVariants}
          className="col-span-12 md:col-span-8 relative rounded-[32px] bg-gradient-to-r from-[#1a6640] via-[#155c38] to-[#0d3d25] p-6 md:p-8 flex flex-col justify-between overflow-hidden shadow-[0_20px_50px_rgba(95,207,176,0.2)] border border-white/10 min-h-[240px]"
        >
          <div className="space-y-4 z-10">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10">
                📅 {currentDateString}
              </span>
              <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10">
                🔥 {streakDays}-Day Streak
              </span>
              <span className="px-3 py-1 rounded-full text-[9px] font-bold tracking-wider bg-white/15 text-white/90 border border-white/10">
                🎓 Student Journey
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-black leading-tight tracking-tight text-white">
              {greeting}, {name} 📚
            </h1>
            <p className="text-sm font-medium max-w-md leading-relaxed text-emerald-100/80">
              Your sanctuary is ready. Take a breath — then conquer what's ahead.
            </p>
          </div>

          <div className="pt-6 z-10 flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/checkin")}
              className="px-7 py-3.5 rounded-full bg-white text-emerald-900 font-bold text-xs shadow-md transition-all hover:scale-105 hover:bg-slate-50 active:scale-98"
            >
              Log Today's Check-in
            </button>
            <button
              onClick={() => router.push("/meditation")}
              className="px-5 py-3.5 rounded-full bg-white/15 text-white font-bold text-xs border border-white/20 hover:bg-white/25 transition-all"
            >
              🧘 Focus Session
            </button>
          </div>
        </motion.section>

        {/* Daily Quote Card */}
        <motion.section
          variants={cardVariants}
          className="col-span-12 md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft flex flex-col justify-between min-h-[240px] relative overflow-hidden"
        >
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-500">format_quote</span>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Today's Scholar Quote</h4>
            </div>
            <p className="text-xs text-on-surface-variant/90 leading-relaxed font-semibold italic max-w-[220px]">
              "{quote}"
            </p>
          </div>
          <button
            onClick={() => router.push("/ai-chat")}
            className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-[10px] shadow-sm hover:bg-primary-purple transition-all z-10 self-start"
          >
            Talk to AI Companion ✨
          </button>
        </motion.section>

        {/* ── Assessment Widget: Score display + Retest button OR Initial CTA ─── */}
        <motion.section
          variants={cardVariants}
          className="col-span-12 relative rounded-[28px] overflow-hidden"
        >
          {hasCompletedAssessment ? (
            <div className="bg-surface-container-lowest border border-surface-variant/30 shadow-soft p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-container/15 flex flex-col items-center justify-center border border-primary/20 shrink-0">
                  <span className="text-lg font-heading font-extrabold text-primary">
                    {(user as any).assessmentPercentage || (user as any).assessmentScore || 75}%
                  </span>
                  <span className="text-[8px] font-bold text-on-surface-variant/70 uppercase">Score</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-heading font-bold text-on-surface">Wellness Assessment Profile</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                      {(user as any).wellnessLevel || "Active"}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant/80 mt-0.5">
                    Your assessment results have calibrated your AI companion and personalized recommendations.
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => router.push("/assessment")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-4 py-2 rounded-full bg-surface-container-low border border-surface-variant/40 text-primary hover:bg-primary-container/10 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 self-end sm:self-center cursor-pointer"
              >
                <span>Retest</span>
                <span className="material-symbols-outlined text-sm">restart_alt</span>
              </motion.button>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[28px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#5f4ea5] via-[#7C6BC4] to-[#a46172] opacity-90" />
              <div className="relative z-10 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
                  <span className="text-2xl">🧠</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-bold uppercase tracking-wider">New</span>
                    <h3 className="text-base font-heading font-bold text-white">Discover Your Wellness Score</h3>
                  </div>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Take a 5-minute assessment to unlock personalized insights, tailored recommendations, and your full wellness profile.
                  </p>
                </div>

                <motion.button
                  onClick={() => router.push("/assessment")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="shrink-0 px-6 py-3 rounded-full bg-white text-[#5f4ea5] font-bold text-xs shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
                >
                  Start Assessment →
                </motion.button>
              </div>
            </div>
          )}
        </motion.section>

        {/* ── ROW 2: 4 small widgets ─── */}
        <motion.div
          variants={cardVariants}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft min-h-[240px]"
        >
          <BelongingSignal />
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft min-h-[240px]"
        >
          <ExamDeadlineCard />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/reports")}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft cursor-pointer min-h-[240px] flex flex-col justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h4 className="font-heading font-extrabold text-xs text-on-surface-variant">Focus Score</h4>
          </div>
          <div className="w-20 h-20 mx-auto my-2">
            <FocusRing score={focusScoreVal} color="#5FCFB0" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-on-surface">{focusLabel}</p>
            <p className="text-[10px] text-on-surface-variant/80 font-semibold leading-normal">
              {focusDesc}
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="col-span-12 sm:col-span-6 md:col-span-3 p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft min-h-[240px]"
        >
          <PomodoroCard />
        </motion.div>

        {/* ── ROW 3: Weekly Progress + Active Program ─── */}
        <motion.div
          variants={cardVariants}
          className="col-span-12 md:col-span-8 p-6 md:p-7 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft min-h-[220px]"
        >
          <WeeklyProgressChart history={history} />
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          onClick={() => router.push("/meditation")}
          className="col-span-12 md:col-span-4 p-6 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft cursor-pointer flex flex-col justify-between min-h-[220px] relative overflow-hidden"
        >
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-2">
              <span className="text-base">🏃</span>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Active Program</h4>
            </div>
            <p className="text-xs font-black text-on-surface leading-tight">Exam Season Resilience</p>
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              A guided track for managing academic pressure, sleep, and focus.
            </p>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-on-surface-variant/70">
                <span>Day {activeProgDays} of 14</span>
                <span>{activeProgPct}% complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${activeProgPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="z-10 space-y-2">
            <p className="text-[9px] font-bold text-on-surface-variant/70 uppercase tracking-wider">Next Session</p>
            <p className="text-[11px] font-bold text-primary">Focus Breathing for Pre-Exam Calm</p>
            <span className="text-[9px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 hover:opacity-80">
              <span>Start Now</span>
              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </span>
          </div>
        </motion.div>

        {/* ── ROW 4: Recommended For You tiles ─── */}
        <motion.div
          variants={cardVariants}
          className="col-span-12 p-6 md:p-7 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-5"
        >
          <div className="flex justify-between items-center">
            <h4 className="font-heading font-extrabold text-sm text-on-surface">Recommended for Students</h4>
            <button
              onClick={() => router.push("/resources")}
              className="text-[9px] font-black text-primary uppercase tracking-wider hover:opacity-80 flex items-center gap-1"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "🧘", bg: "bg-[#FFF5F6]", border: "border-pink-100 hover:border-pink-300", label: "Exam Anxiety Relief", sub: "5-min breathing", href: "/meditation" },
              { icon: "📖", bg: "bg-[#F3F4FF]", border: "border-indigo-100 hover:border-indigo-300", label: "Pre-Exam Journal", sub: "Clear your mind", href: "/journal" },
              { icon: "🎯", bg: "bg-[#F0FDF4]", border: "border-emerald-100 hover:border-emerald-300", label: "Study Focus Music", sub: "432Hz binaural", href: "/meditation" },
              { icon: "🌙", bg: "bg-[#EDF8FF]", border: "border-sky-100 hover:border-sky-300", label: "Sleep Before Exams", sub: "Restore and retain", href: "/sleep" },
            ].map((tile) => (
              <motion.div
                key={tile.label}
                whileHover={{ y: -3, scale: 1.015 }}
                onClick={() => router.push(tile.href)}
                className={`p-3.5 rounded-[22px] ${tile.bg} border ${tile.border} transition-all cursor-pointer flex flex-col justify-between min-h-[140px] text-center`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white/80 shadow-xs mx-auto flex items-center justify-center text-lg select-none">
                  {tile.icon}
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{tile.label}</p>
                  <p className="text-[8px] text-slate-500 font-bold mt-0.5">{tile.sub}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-white shadow-xs mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-xs text-primary font-bold">play_arrow</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
