"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

// Vector Battery Component for Energy Step
const BatteryIcon = ({ level }: { level: number }) => {
  const getColor = () => {
    if (level === 5) return "#10B981"; // green
    if (level === 4) return "#34D399"; // light green
    if (level === 3) return "#F59E0B"; // yellow/orange
    if (level === 2) return "#F97316"; // orange
    return "#EF4444"; // red
  };
  const getWidth = () => {
    if (level === 5) return 16;
    if (level === 4) return 12;
    if (level === 3) return 8;
    if (level === 2) return 5;
    return 2;
  };
  return (
    <svg viewBox="0 0 24 14" className="w-8 h-5 shrink-0 select-none pointer-events-none">
      <rect x="1" y="1" width="20" height="12" rx="3" fill="none" stroke="#94A3B8" strokeWidth="2" />
      <rect x="22" y="4" width="2" height="6" rx="1" fill="#94A3B8" />
      <rect x="3" y="3" width={getWidth()} height="8" rx="1.5" fill={getColor()} />
    </svg>
  );
};

// Calming SVG illustrations
const CalmLotusIllustration = () => (
  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
    <motion.div
      animate={{ scale: [1, 1.15, 1], rotate: [0, 4, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-primary/10 rounded-full blur-xl"
    />
    <svg viewBox="0 0 100 100" className="w-24 h-24 text-primary opacity-90">
      <path d="M50 15 C40 30, 45 60, 50 85 C55 60, 60 30, 50 15 Z" fill="currentColor" />
      <path d="M50 35 C30 45, 30 65, 50 85 C70 65, 70 45, 50 35 Z" fill="currentColor" opacity="0.75" />
      <path d="M50 50 C20 55, 15 70, 50 85 C85 70, 80 55, 50 50 Z" fill="currentColor" opacity="0.5" />
    </svg>
  </div>
);

const CalmMoonIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 text-indigo-400/80 mx-auto select-none pointer-events-none">
    <motion.g
      animate={{ y: [0, -5, 0], rotate: [0, 5, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <path d="M60 65 C45 65, 35 55, 35 40 C35 30, 40 22, 47 17 C35 19, 25 30, 25 43 C25 58, 37 70, 52 70 C60 70, 67 66, 72 60 C68 63, 64 65, 60 65 Z" fill="currentColor" />
      <circle cx="68" cy="25" r="2" fill="currentColor" className="animate-pulse" />
      <circle cx="28" cy="30" r="1.5" fill="currentColor" className="animate-pulse" />
    </motion.g>
  </svg>
);

const CalmLeafIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 text-emerald-400/70 mx-auto select-none pointer-events-none">
    <motion.g
      animate={{ rotate: [-8, 8, -8], y: [0, -3, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M50 80 C35 70, 30 50, 35 35 C40 20, 60 20, 65 35 C70 50, 65 70, 50 80 Z" fill="currentColor" />
      <path d="M50 80 L50 35" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </motion.g>
  </svg>
);

const CalmHeartIllustration = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20 text-pink-400/80 mx-auto select-none pointer-events-none">
    <motion.g
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <path d="M50 78 L45 73 C28 58, 16 47, 16 33 C16 22, 24 14, 35 14 C41 14, 47 17, 50 22 C53 17, 59 14, 65 14 C76 14, 84 22, 84 33 C84 47, 72 58, 55 73 L50 78 Z" fill="currentColor" />
    </motion.g>
  </svg>
);

const MOODS = [
  { label: "Amazing", emoji: "😁" },
  { label: "Happy", emoji: "😊" },
  { label: "Calm", emoji: "🙂" },
  { label: "Okay", emoji: "😐" },
  { label: "Low", emoji: "😔" },
  { label: "Overwhelmed", emoji: "😣" },
];

const ENERGY_OPTIONS = [
  { label: "Very High", value: 5, emoji: "🔋" },
  { label: "Good", value: 4, emoji: "😊" },
  { label: "Moderate", value: 3, emoji: "🙂" },
  { label: "Low", value: 2, emoji: "😴" },
  { label: "Exhausted", value: 1, emoji: "🥱" },
];

const STRESS_OPTIONS = [
  { label: "Peaceful", emoji: "😌" },
  { label: "Manageable", emoji: "🙂" },
  { label: "A little stressful", emoji: "😐" },
  { label: "Stressful", emoji: "😟" },
  { label: "Very overwhelming", emoji: "😣" },
];

const SLEEP_OPTIONS = [
  { label: "Excellent", value: 5, emoji: "😴" },
  { label: "Good", value: 4, emoji: "😊" },
  { label: "Okay", value: 3, emoji: "🙂" },
  { label: "Poor", value: 2, emoji: "🥱" },
  { label: "Very Poor", value: 1, emoji: "😫" },
];

export default function DailyCheckInScreen() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { dashboardData, submitCheckIn } = useWellness();

  // Wizard step state: 
  // 0: Welcome, 1: Mood, 2: Energy, 3: Stress, 4: Sleep, 5: Gratitude, 6: Reflection, 7: Success
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check-in Inputs
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState("");
  const [sleep, setSleep] = useState<number | null>(null);
  const [gratitude, setGratitude] = useState("");
  const [reflection, setReflection] = useState("");

  const [dateString, setDateString] = useState("");
  const [ambientLeaves, setAmbientLeaves] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    // Format date beautifully
    const d = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    setDateString(`${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`);

    // Generate falling leaf particles
    const leaves = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 10 + Math.random() * 10,
    }));
    setAmbientLeaves(leaves);
  }, []);

  const streakVal = dashboardData?.streak?.currentStreak || 12;

  // Empathetic microcopy tips
  const encouragementText = (() => {
    if (step <= 1) return "Slowing down is a powerful form of self-care.";
    if (step === 2) return "Energy levels fluctuate naturally. Accept where you are.";
    if (step === 3) return "Stress is a wave. It will rise, but it will also fall.";
    if (step === 4) return "Sleep is the bridge to physical and emotional healing.";
    return "Your sanctuary grows and sparkles with every reflection.";
  })();

  const dailyTip = (() => {
    if (step <= 1) return "Taking three deep breaths activates your parasympathetic system, instantly calming the nervous system.";
    if (step === 2) return "If your energy is low, seek short rests instead of forcing productivity. Listen to your body's request.";
    if (step === 3) return "Writing down your stressful feelings helps move them from emotional centers to cognitive zones, reducing intensity.";
    if (step === 4) return "Keep devices out of bed. The blue light mimics morning sun, blocking melatonin production.";
    return "Acknowledge one tiny win today. Small moments build deep internal resilience.";
  })();

  const handleNext = () => {
    if (step < 7) setStep((p) => p + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((p) => p - 1);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await submitCheckIn({
        mood: mood || "Calm",
        energy: energy || 3,
        stress: stress || "Manageable",
        sleep: sleep || 3,
        reflection: reflection || "A quiet moment of reflection.",
        factors: gratitude || "Sanctuary logs",
      });
      setStep(7);
    } catch (err) {
      console.error("Failed saving daily log:", err);
    } finally {
      setLoading(false);
    }
  };

  // Step transitions
  const transitionVariants = {
    initial: { opacity: 0, x: shouldReduceMotion ? 0 : 30, scale: shouldReduceMotion ? 1 : 0.98 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
    exit: { opacity: 0, x: shouldReduceMotion ? 0 : -30, scale: shouldReduceMotion ? 1 : 0.98, transition: { duration: 0.3 } },
  };

  // Plant plant graphic scaling based on streak
  const plantProgressScale = Math.min(0.6 + streakVal * 0.05, 1.8);

  return (
    <div className="max-w-7xl mx-auto py-4 px-3 md:px-6 relative min-h-[85vh] flex flex-col justify-between overflow-hidden select-none">
      <ScreenHeader title="🌸 Daily Check-in" showBackButton={true} fallbackRoute="/dashboard" />
      
      {/* Background Breathing Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-10 w-96 h-96 rounded-full bg-primary/5 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-secondary-container/5 blur-[120px]"
        />
      </div>

      {/* Floating leaves backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {ambientLeaves.map((l) => (
          <motion.div
            key={l.id}
            initial={{ y: -50, x: 0, rotate: 0, opacity: 0 }}
            animate={{
              y: "90vh",
              x: [0, 50, -50, 0],
              rotate: 360,
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: l.duration,
              repeat: Infinity,
              delay: l.delay,
              ease: "easeInOut",
            }}
            className="absolute text-emerald-800/10 text-xl"
            style={{ left: `${l.left}%` }}
          >
            🍃
          </motion.div>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 w-full grow my-auto">
        
        {/* Step Container (8 columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 0: WELCOME SCREEN */}
            {step === 0 && (
              <motion.div
                key="welcome"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft text-center space-y-8 flex flex-col items-center justify-center min-h-[460px]"
              >
                <div className="space-y-3">
                  <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary-container/10 px-4 py-1.5 rounded-full inline-block">
                    🌸 Daily Check-in
                  </span>
                  <h1 className="text-3xl md:text-4xl font-heading font-black text-on-surface pt-2">
                    Welcome back
                  </h1>
                  <p className="text-sm font-semibold text-on-surface-variant/90 max-w-sm mx-auto leading-relaxed">
                    "Let's spend a quiet moment understanding how you're feeling today."
                  </p>
                </div>

                <CalmLotusIllustration />

                <div className="text-[10px] font-bold text-on-surface-variant/80 flex items-center gap-3">
                  <span>📅 {dateString}</span>
                  <span>•</span>
                  <span>🔥 Day {streakVal} Streak</span>
                </div>

                <button
                  onClick={handleNext}
                  className="px-12 py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
                >
                  Begin Reflection
                </button>
              </motion.div>
            )}

            {/* STEP 1: MOOD SCREEN */}
            {step === 1 && (
              <motion.div
                key="mood"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-6 min-h-[460px] flex flex-col justify-between"
              >
                <div className="space-y-2 text-center">
                  <span className="text-2xl filter drop-shadow-sm">😊</span>
                  <h2 className="text-2xl font-heading font-black text-on-surface">How are you feeling right now?</h2>
                  <p className="text-xs text-on-surface-variant">Select the card that closest matches your state.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto w-full">
                  {MOODS.map((m) => {
                    const isSelected = mood === m.label;
                    return (
                      <motion.button
                        key={m.label}
                        whileHover={{ y: -2 }}
                        onClick={() => setMood(m.label)}
                        className={`p-4.5 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all relative ${
                          isSelected
                            ? "bg-primary-container/15 border-primary text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-102"
                            : "bg-white/30 border-white/30 text-on-surface-variant hover:bg-white/60"
                        }`}
                      >
                        <span className="text-3xl filter drop-shadow-xs">{m.emoji}</span>
                        <span className="text-xs font-bold">{m.label}</span>

                        {isSelected && (
                          <span className="absolute top-2 right-2 text-primary material-symbols-outlined text-sm font-bold">
                            check_circle
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center w-full pt-4">
                  <button onClick={handleBack} className="text-xs font-bold text-on-surface-variant hover:opacity-80">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!mood}
                    className="px-8 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ENERGY SCREEN */}
            {step === 2 && (
              <motion.div
                key="energy"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-6 min-h-[460px] flex flex-col justify-between"
              >
                <div className="space-y-2 text-center">
                  <span className="text-2xl filter drop-shadow-sm">⚡</span>
                  <h2 className="text-2xl font-heading font-black text-on-surface">How is your energy today?</h2>
                  <p className="text-xs text-on-surface-variant">Assess your physical and mental energy levels.</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5 max-w-md mx-auto w-full">
                  {ENERGY_OPTIONS.map((e) => {
                    const isSelected = energy === e.value;
                    return (
                      <motion.button
                        key={e.value}
                        whileHover={{ y: -1 }}
                        onClick={() => setEnergy(e.value)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-primary-container/15 border-primary text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]"
                            : "bg-white/30 border-white/30 text-on-surface-variant hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <BatteryIcon level={e.value} />
                          <div>
                            <span className="text-xs font-black block text-on-surface">{e.label}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-base font-bold">check_circle</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center w-full pt-4">
                  <button onClick={handleBack} className="text-xs font-bold text-on-surface-variant hover:opacity-80">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={energy === null}
                    className="px-8 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: STRESS SCREEN */}
            {step === 3 && (
              <motion.div
                key="stress"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                  <CalmLeafIllustration />
                </div>

                <div className="space-y-2 text-center">
                  <span className="text-2xl filter drop-shadow-sm">🌿</span>
                  <h2 className="text-2xl font-heading font-black text-on-surface">How overwhelming has today felt?</h2>
                  <p className="text-xs text-on-surface-variant">Measure today's stress capacity levels.</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5 max-w-md mx-auto w-full">
                  {STRESS_OPTIONS.map((s) => {
                    const isSelected = stress === s.label;
                    return (
                      <motion.button
                        key={s.label}
                        whileHover={{ y: -1 }}
                        onClick={() => setStress(s.label)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-primary-container/15 border-primary text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]"
                            : "bg-white/30 border-white/30 text-on-surface-variant hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl filter drop-shadow-xs">{s.emoji}</span>
                          <span className="text-xs font-black text-on-surface">{s.label}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-base font-bold">check_circle</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center w-full pt-4">
                  <button onClick={handleBack} className="text-xs font-bold text-on-surface-variant hover:opacity-80">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!stress}
                    className="px-8 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SLEEP SCREEN */}
            {step === 4 && (
              <motion.div
                key="sleep"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                  <CalmMoonIllustration />
                </div>

                <div className="space-y-2 text-center">
                  <span className="text-2xl filter drop-shadow-sm">🌙</span>
                  <h2 className="text-2xl font-heading font-black text-on-surface">How did you sleep last night?</h2>
                  <p className="text-xs text-on-surface-variant">Evaluate your overnight recovery and rest quality.</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5 max-w-md mx-auto w-full">
                  {SLEEP_OPTIONS.map((s) => {
                    const isSelected = sleep === s.value;
                    return (
                      <motion.button
                        key={s.value}
                        whileHover={{ y: -1 }}
                        onClick={() => setSleep(s.value)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? "bg-primary-container/15 border-primary text-primary shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.01]"
                            : "bg-white/30 border-white/30 text-on-surface-variant hover:bg-white/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl filter drop-shadow-xs">{s.emoji}</span>
                          <span className="text-xs font-black text-on-surface">{s.label}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary text-base font-bold">check_circle</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center w-full pt-4">
                  <button onClick={handleBack} className="text-xs font-bold text-on-surface-variant hover:opacity-80">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={sleep === null}
                    className="px-8 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: GRATITUDE SCREEN */}
            {step === 5 && (
              <motion.div
                key="gratitude"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 opacity-10 pointer-events-none">
                  <CalmHeartIllustration />
                </div>

                <div className="space-y-2 text-center">
                  <span className="text-2xl filter drop-shadow-sm">❤️</span>
                  <h2 className="text-2xl font-heading font-black text-on-surface">What's one thing you're grateful for today?</h2>
                  <p className="text-xs text-on-surface-variant">Optional. Slow down and note down a positive details.</p>
                </div>

                <div className="max-w-md mx-auto w-full">
                  <textarea
                    rows={4}
                    value={gratitude}
                    onChange={(e) => setGratitude(e.target.value)}
                    placeholder="I'm grateful for..."
                    className="w-full p-5 rounded-2xl bg-white/30 border border-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 leading-relaxed text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>

                <div className="flex justify-between items-center w-full pt-4">
                  <button onClick={handleBack} className="text-xs font-bold text-on-surface-variant hover:opacity-80">
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: REFLECTION SCREEN */}
            {step === 6 && (
              <motion.div
                key="reflection"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-6 min-h-[460px] flex flex-col justify-between"
              >
                <div className="space-y-2 text-center">
                  <span className="text-2xl filter drop-shadow-sm">📝</span>
                  <h2 className="text-2xl font-heading font-black text-on-surface">Would you like to write a few thoughts?</h2>
                  <p className="text-xs text-on-surface-variant">Optional. Free writing inside your private sanctuary.</p>
                </div>

                <div className="max-w-lg mx-auto w-full">
                  <textarea
                    rows={5}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Anything you'd like to share with yourself today..."
                    className="w-full p-5 rounded-2xl bg-white/30 border border-white/40 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 leading-relaxed text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>

                <div className="flex justify-between items-center w-full pt-4">
                  <button onClick={handleBack} className="text-xs font-bold text-on-surface-variant hover:opacity-80">
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-10 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {loading ? "Saving Today's Reflection..." : "Save Today's Reflection"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: SUCCESS SCREEN */}
            {step === 7 && (
              <motion.div
                key="success"
                variants={transitionVariants}
                initial="initial"
                animate="animate"
                className="p-8 md:p-10 rounded-[32px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft text-center space-y-8 flex flex-col items-center justify-center min-h-[460px]"
              >
                <div className="space-y-3">
                  <span className="text-4xl filter drop-shadow-xs">✨</span>
                  <h2 className="text-3xl font-heading font-black text-on-surface">🌸 Check-in Complete</h2>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-semibold max-w-xs mx-auto">
                    "You showed up for yourself today. Small moments of reflection create lasting change."
                  </p>
                </div>

                {/* Sanctuary Plant streak celebration */}
                <div className="p-6 rounded-[28px] bg-white/60 border border-white/40 shadow-soft max-w-xs mx-auto space-y-3 w-full">
                  <div>
                    <span className="text-xl filter drop-shadow-sm">🌱</span>
                    <p className="text-xs font-black text-slate-800 mt-1">Your sanctuary plant grew today.</p>
                  </div>

                  {/* Plant SVG scale animation */}
                  <div className="relative w-28 h-28 bg-slate-50/70 rounded-full mx-auto flex items-end justify-center pb-3 overflow-hidden border border-slate-100">
                    <motion.div
                      initial={{ scale: 0, y: 15 }}
                      animate={{ scale: plantProgressScale, y: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    >
                      <svg width="40" height="60" viewBox="0 0 60 90" fill="none">
                        <ellipse cx="30" cy="85" rx="20" ry="5" fill="#78350F" opacity="0.6" />
                        <path d="M30 85C30 50 30 25 30 15" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
                        <path d="M30 70C20 65 15 55 20 50C25 45 28 55 30 70Z" fill="#059669" />
                        <path d="M30 65C40 60 45 50 40 45C35 40 32 50 30 65Z" fill="#34D399" />
                      </svg>
                    </motion.div>
                  </div>
                  <span className="text-[9px] font-bold text-on-surface-variant block">Streak: {streakVal} Days</span>
                </div>

                {/* Summary Row */}
                <div className="flex flex-wrap gap-2.5 justify-center max-w-md bg-white/20 p-4 rounded-2xl border border-white/25">
                  <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[9px] font-black text-slate-700">😊 Mood: {mood}</span>
                  <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[9px] font-black text-slate-700">⚡ Energy: {energy}/5</span>
                  <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[9px] font-black text-slate-700">🌿 Stress: {stress}</span>
                  <span className="px-3 py-1 rounded-full bg-white/80 border border-white/40 text-[9px] font-black text-slate-700">🌙 Sleep: {sleep}/5</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-sm justify-center pt-2">
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 py-3.5 rounded-full bg-primary hover:bg-primary-purple text-white text-xs font-bold shadow-md scale-102 hover:scale-105 active:scale-98 transition-all"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => router.push("/mood-tracking")}
                    className="flex-1 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm scale-102 hover:scale-105 active:scale-98 transition-all"
                  >
                    View Mood History
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Sidebar (4 columns) */}
        <aside className="lg:col-span-4 space-y-6 h-full">
          
          {/* Streak Indicator */}
          <div className="p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Sanctuary Streak</h4>
            </div>
            
            <div>
              <span className="text-3xl font-black text-primary">{streakVal} Days</span>
              <p className="text-[10px] text-on-surface-variant font-bold mt-1">
                Your sanctuary feels a little brighter today.
              </p>
            </div>
          </div>

          {/* Calming Encourgement Card */}
          <div className="p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary">favorite</span>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Encouragement</h4>
            </div>
            <p className="text-xs text-on-surface-variant font-bold leading-relaxed italic">
              "{encouragementText}"
            </p>
          </div>

          {/* Daily Tip Card */}
          <div className="p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4 relative overflow-hidden">
            {/* Tiny botanical illustration inside background */}
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-[80px]">
              🍃
            </div>

            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-amber-500">lightbulb</span>
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Daily Tip</h4>
            </div>
            <p className="text-xs text-on-surface-variant font-semibold leading-relaxed">
              {dailyTip}
            </p>
          </div>

          {/* AI Chat Card */}
          <div className="p-6 rounded-[28px] bg-white/50 backdrop-blur-xl border border-white/40 shadow-soft space-y-4">
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-sm text-on-surface">Need Help?</h4>
              <p className="text-[10px] text-on-surface-variant font-bold">Talk with your AI companion for immediate guided relief.</p>
            </div>
            <button
              onClick={() => router.push("/ai-chat")}
              className="w-full py-3 rounded-full bg-primary-container/10 border border-primary/10 text-primary hover:bg-primary-container/20 font-bold text-xs transition-all text-center block"
            >
              Chat with AI Companion
            </button>
          </div>

        </aside>

      </div>

      {/* Bottom Progress Bar */}
      {step > 0 && step < 7 && (
        <div className="w-full max-w-xl mx-auto pt-6 text-center space-y-3 relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Today's Reflection</p>
          <div className="flex justify-center items-center gap-4 text-[10px] font-black text-slate-400">
            <span className={step >= 1 ? "text-primary flex items-center gap-0.5" : ""}>
              ● Mood
            </span>
            <span className={step >= 2 ? "text-primary flex items-center gap-0.5" : ""}>
              ● Energy
            </span>
            <span className={step >= 3 ? "text-primary flex items-center gap-0.5" : ""}>
              ● Stress
            </span>
            <span className={step >= 4 ? "text-primary flex items-center gap-0.5" : ""}>
              ● Sleep
            </span>
            <span className={step >= 5 ? "text-primary flex items-center gap-0.5" : ""}>
              ● Gratitude
            </span>
            <span className={step >= 6 ? "text-primary flex items-center gap-0.5" : ""}>
              ● Reflection
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
