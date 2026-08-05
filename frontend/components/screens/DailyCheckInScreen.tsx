"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { useWellness } from "@/frontend/lib/context/WellnessContext";

const MOODS = [
  { label: "Amazing", emoji: "😊", color: "hover:bg-emerald-50 hover:border-emerald-200" },
  { label: "Happy", emoji: "🙂", color: "hover:bg-green-50 hover:border-green-200" },
  { label: "Calm", emoji: "😌", color: "hover:bg-sky-50 hover:border-sky-200" },
  { label: "Okay", emoji: "😐", color: "hover:bg-slate-50 hover:border-slate-200" },
  { label: "Low", emoji: "😔", color: "hover:bg-indigo-50 hover:border-indigo-200" },
  { label: "Sad", emoji: "😢", color: "hover:bg-blue-50 hover:border-blue-200" },
  { label: "Anxious", emoji: "😣", color: "hover:bg-amber-50 hover:border-amber-200" },
  { label: "Exhausted", emoji: "😴", color: "hover:bg-rose-50 hover:border-rose-200" },
];

const ENERGY_LEVELS = [
  { level: 1, emoji: "🪫", label: "Depleted", desc: "Completely run out of charge" },
  { level: 2, emoji: "🔌", label: "Low", desc: "Need rest and recharging" },
  { level: 3, emoji: "⚖️", label: "Balanced", desc: "Steady, average day-to-day capacity" },
  { level: 4, emoji: "🔋", label: "Charged", desc: "Feeling focused and active" },
  { level: 5, emoji: "⚡", label: "Radiant", desc: "Peak energy, full vitality" },
];

const SLEEP_LEVELS = [
  { level: 1, emoji: "☁️", label: "Restless", desc: "Tossed and turned, barely slept" },
  { level: 2, emoji: "🌙", label: "Light", desc: "Frequent waking, shallow rest" },
  { level: 3, emoji: "✨", label: "Restful", desc: "Decent sleep, normal recovery" },
  { level: 4, emoji: "⭐", label: "Deep", desc: "Sound, uninterrupted rest" },
  { level: 5, emoji: "🔮", label: "Healing", desc: "Perfect recovery, fully restored" },
];

const GRATITUDE_PILLS = [
  "Family",
  "Friends",
  "Health",
  "Learning",
  "Nature",
  "Food",
  "Music",
  "Home",
  "Pet",
];

const INTENTIONS = [
  "Drink more water",
  "Walk in nature",
  "Meditate for 5 mins",
  "Study patiently",
  "Read a book",
  "Journal thoughts",
  "Sleep early",
  "Talk to a loved one",
  "Stretch gently",
];

const REFLECTIONS = [
  "You've been carrying a lot lately. Remember, you don't need to solve everything today.",
  "Every breath is a fresh start. Allow yourself to release today's weight.",
  "Progress is not always a straight line. Your quiet presence today is enough.",
  "It is okay to rest. Your worth is not defined by your productivity.",
  "Your peace is your sanctuary. Let go of whatever is beyond your control right now.",
];

export default function DailyCheckInScreen() {
  const router = useRouter();
  const { dashboardData, submitCheckIn } = useWellness();
  const [userId, setUserId] = useState<string | null>(null);

  // Time based greeting
  const [greeting, setGreeting] = useState("Good Evening 🌸");
  const [step, setStep] = useState(0); // 0: Welcome, 1: Mood, 2: Energy, 3: Sleep, 4: Gratitude, 5: Intention, 6: AI Reflection, 7: Completion
  const [loading, setLoading] = useState(false);

  // Checkin Answers
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [selectedGratitudes, setSelectedGratitudes] = useState<string[]>([]);
  const [customGratitude, setCustomGratitude] = useState("");
  const [intention, setIntention] = useState("");
  const [aiReflectionText, setAiReflectionText] = useState("");

  const gardenStats = {
    count: (dashboardData?.history?.length || 0) + 1, // predict count on completion
    currentStreak: dashboardData?.streak?.currentStreak || 1,
  };

  // Floating petals animation configuration
  const [petals, setPetals] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUserId(session.user.id);
    }

    // Determine greeting
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) setGreeting("Good Morning 🌸");
    else if (hours >= 12 && hours < 17) setGreeting("Good Afternoon 🌸");
    else if (hours >= 17 && hours < 21) setGreeting("Good Evening 🌸");
    else setGreeting("Good Night 🌸");

    // Initialize floating petals coordinates
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
    }));
    setPetals(list);
  }, []);

  const handleBegin = () => {
    setStep(1);
  };

  const handleMoodSelect = (val: string) => {
    setMood(val);
    // Move to next step with a slight ripple delay
    setTimeout(() => {
      setStep(2);
    }, 300);
  };

  const handleNext = () => {
    if (step === 5) {
      // Pick a random reflection for Screen 6
      const randomMsg = REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)];
      setAiReflectionText(randomMsg);
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const toggleGratitude = (pill: string) => {
    setSelectedGratitudes((prev) =>
      prev.includes(pill) ? prev.filter((p) => p !== pill) : [...prev, pill]
    );
  };

  const handleSaveCheckIn = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const gratitudeJoined = [
        ...selectedGratitudes,
        ...(customGratitude.trim() ? [customGratitude.trim()] : []),
      ].join(", ");

      await submitCheckIn({
        mood,
        energy,
        stress: "Medium", // default stress
        sleep,
        reflection: aiReflectionText,
        factors: gratitudeJoined || "Being alive",
      });

      setStep(7); // Proceed to Completion screen
    } catch (err) {
      console.error("Failed to save checkin:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sanctuary Garden stages definition
  const getGardenStage = (count: number) => {
    if (count <= 1) return { stage: "Seed 🌱", desc: "A tiny seed taking root in your sanctuary.", scale: 0.7, color: "#10B981" };
    if (count <= 3) return { stage: "Sprout 🌿", desc: "A small sprout adapting gently.", scale: 0.9, color: "#059669" };
    if (count <= 6) return { stage: "Leaf 🍃", desc: "Multiple leaves absorbing calm energy.", scale: 1.1, color: "#34D399" };
    if (count <= 10) return { stage: "Flower 🌸", desc: "A lovely blossom beginning to unfold.", scale: 1.3, color: "#EC4899" };
    if (count <= 15) return { stage: "Tree 🌳", desc: "A strong, deep-rooted sanctuary tree.", scale: 1.5, color: "#047857" };
    if (count <= 21) return { stage: "Sanctuary Garden 🏡", desc: "A serene clearing with beautiful plants.", scale: 1.7, color: "#4F46E5" };
    return { stage: "Forest 🌲", desc: "A lush, thriving forest of mindfulness.", scale: 1.9, color: "#065F46" };
  };

  const gardenInfo = getGardenStage(gardenStats.count);

  return (
    <div className="max-w-xl mx-auto min-h-[80vh] flex flex-col justify-center py-10 px-4 relative overflow-hidden select-none">
      
      {/* Floating Petals Effect for Step 7 (Completion) */}
      {step === 7 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {petals.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -50, x: 0, rotate: 0, opacity: 0 }}
              animate={{
                y: "100vh",
                x: [0, 40, -40, 0],
                rotate: 360,
                opacity: [0, 0.7, 0.7, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeInOut",
              }}
              className="absolute text-xl"
              style={{ left: `${p.left}%` }}
            >
              🌸
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {/* STEP 0: WELCOME SCREEN */}
        {step === 0 && (
          <motion.div
            key="step-welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center space-y-8 z-10"
          >
            <div className="space-y-4">
              <span className="text-4xl">✨</span>
              <h1 className="text-4xl font-heading font-extrabold text-on-surface leading-tight">
                {greeting}
              </h1>
              <p className="text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                Let's slow down for two minutes.<br />How has today been for you?
              </p>
            </div>

            {/* Pulsing visual */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/10 blur-md"
              />
              <motion.div
                animate={{ scale: [0.8, 1.15, 0.8] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center"
              />
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Begin</span>
            </div>

            <button
              onClick={handleBegin}
              className="px-12 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
            >
              Begin Reflection
            </button>
          </motion.div>
        )}

        {/* STEP 1: MOOD SELECTION */}
        {step === 1 && (
          <motion.div
            key="step-mood"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">How are you feeling right now?</h2>
              <p className="text-xs text-on-surface-variant">Select the card that closest matches your state.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {MOODS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => handleMoodSelect(m.label)}
                  className={`p-5 rounded-3xl border border-surface-variant/35 bg-surface-container-low text-center transition-all duration-300 transform hover:-translate-y-1.5 active:scale-95 ${m.color}`}
                >
                  <div className="text-4xl mb-2">{m.emoji}</div>
                  <h4 className="font-heading font-extrabold text-sm text-on-surface">{m.label}</h4>
                </button>
              ))}
            </div>
            
            <div className="pt-4">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ENERGY LEVEL */}
        {step === 2 && (
          <motion.div
            key="step-energy"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">How's your energy today?</h2>
              <p className="text-xs text-on-surface-variant">Assess your mental and physical capacity battery.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
              {ENERGY_LEVELS.map((e) => {
                const active = energy === e.level;
                return (
                  <button
                    key={e.level}
                    onClick={() => setEnergy(e.level)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      active
                        ? "bg-surface-container-lowest border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                        : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{e.emoji}</span>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-on-surface">{e.label}</h4>
                        <p className="text-[10px] text-on-surface-variant">{e.desc}</p>
                      </div>
                    </div>
                    {active && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between max-w-sm mx-auto pt-4">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: SLEEP QUALITY */}
        {step === 3 && (
          <motion.div
            key="step-sleep"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">How was your sleep?</h2>
              <p className="text-xs text-on-surface-variant">Evaluate the quality of your overnight recovery.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
              {SLEEP_LEVELS.map((s) => {
                const active = sleep === s.level;
                return (
                  <button
                    key={s.level}
                    onClick={() => setSleep(s.level)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      active
                        ? "bg-surface-container-lowest border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                        : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-on-surface">{s.label}</h4>
                        <p className="text-[10px] text-on-surface-variant">{s.desc}</p>
                      </div>
                    </div>
                    {active && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between max-w-sm mx-auto pt-4">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: GRATITUDE REFLECTION */}
        {step === 4 && (
          <motion.div
            key="step-gratitude"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">Gratitude Reflection</h2>
              <p className="text-xs text-on-surface-variant">Select what you are thankful for today, or write details below.</p>
            </div>

            <div className="p-6 rounded-[28px] bg-surface-container-lowest border border-surface-variant/20 shadow-soft max-w-md mx-auto space-y-4 text-left">
              <div className="flex flex-wrap gap-2">
                {GRATITUDE_PILLS.map((pill) => {
                  const active = selectedGratitudes.includes(pill);
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => toggleGratitude(pill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        active
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface-container-low border-surface-variant/30 text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-primary uppercase tracking-wider">Custom Reflection (Optional):</label>
                <textarea
                  rows={3}
                  value={customGratitude}
                  onChange={(e) => setCustomGratitude(e.target.value)}
                  placeholder="Something warm or pleasant that happened..."
                  className="w-full p-4 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed text-on-surface"
                />
              </div>
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: TODAY'S INTENTION */}
        {step === 5 && (
          <motion.div
            key="step-intention"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-on-surface">Today's Intention</h2>
              <p className="text-xs text-on-surface-variant">Focus your calm energy on ONE specific wellness target.</p>
            </div>

            <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-left">
              {INTENTIONS.map((item) => {
                const active = intention === item;
                return (
                  <button
                    key={item}
                    onClick={() => setIntention(item)}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      active
                        ? "bg-surface-container-lowest border-primary shadow-sm ring-2 ring-primary/20 scale-[1.01]"
                        : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between max-w-sm mx-auto pt-4">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!intention}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: AI CALMING REFLECTION */}
        {step === 6 && (
          <motion.div
            key="step-reflection"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center z-10"
          >
            <div className="space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                Sanctuary Guidance
              </span>
              <h2 className="text-2xl font-heading font-extrabold text-on-surface pt-4">Empathetic Reflection</h2>
            </div>

            <div className="p-8 rounded-[36px] bg-gradient-to-tr from-primary-container/20 to-secondary/10 border border-primary/20 max-w-md mx-auto min-h-[160px] flex items-center justify-center relative overflow-hidden">
              <p className="text-base font-semibold leading-relaxed text-on-surface z-10 italic">
                "{aiReflectionText}"
              </p>
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleSaveCheckIn}
                disabled={loading}
                className="px-10 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-102 hover:scale-105 active:scale-98 disabled:opacity-50"
              >
                {loading ? "Saving Sanctuary Logs..." : "Save Today's Log →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 7: COMPLETION SCREEN */}
        {step === 7 && (
          <motion.div
            key="step-complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 z-10"
          >
            {/* Celebration Greeting */}
            <div className="space-y-4">
              <span className="text-4xl">✨</span>
              <h2 className="text-3xl font-heading font-extrabold text-on-surface">Thank you.</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-semibold">
                You showed up for yourself today.<br />That's enough.
              </p>
            </div>

            {/* Soft pulsing breathing guide */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-mint-green/10"
              />
              <div className="w-10 h-10 rounded-full bg-mint-green/20" />
            </div>

            {/* Sanctuary Garden growth display */}
            <div className="p-8 rounded-[36px] bg-white border border-surface-variant/15 shadow-soft max-w-sm mx-auto space-y-6">
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant/80 uppercase tracking-widest">Sanctuary Garden</p>
                <p className="text-2xl font-heading font-black text-primary pt-1">{gardenInfo.stage}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1">Total Reflections Complete: {gardenStats.count}</p>
              </div>

              {/* Plant Growth Display Stage */}
              <div className="relative w-36 h-36 bg-surface-container-low rounded-full mx-auto flex items-end justify-center pb-4 overflow-hidden border border-surface-variant/20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-mint-green/10 blur-xl pointer-events-none" />
                <motion.div
                  initial={{ scale: 0, y: 35 }}
                  animate={{ scale: gardenInfo.scale, y: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 11, delay: 0.2 }}
                  className="z-10"
                >
                  <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
                    <ellipse cx="30" cy="85" rx="20" ry="5" fill="#78350F" opacity="0.6" />
                    <path d="M30 85C30 50 30 25 30 15" stroke={gardenInfo.color} strokeWidth="4" strokeLinecap="round" />
                    {gardenStats.count >= 2 && (
                      <>
                        <path d="M30 70C20 65 15 55 20 50C25 45 28 55 30 70Z" fill={gardenInfo.color} />
                        <path d="M30 65C40 60 45 50 40 45C35 40 32 50 30 65Z" fill={gardenInfo.color} />
                      </>
                    )}
                    {gardenStats.count >= 4 && (
                      <>
                        <path d="M30 45C22 40 18 32 22 28C26 24 28 32 30 45Z" fill={gardenInfo.color} />
                        <path d="M30 40C38 35 42 27 38 23C34 19 32 27 30 40Z" fill={gardenInfo.color} />
                      </>
                    )}
                    {gardenStats.count >= 7 && (
                      <circle cx="30" cy="15" r="9" fill="#EF4444" />
                    )}
                    {gardenStats.count >= 11 && (
                      <>
                        <circle cx="20" cy="10" r="5" fill="#FBBF24" />
                        <circle cx="40" cy="10" r="5" fill="#FBBF24" />
                      </>
                    )}
                    <path d="M30 15C25 10 28 2 30 0C32 2 35 10 30 15Z" fill="#34D399" />
                  </svg>
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  {gardenInfo.desc} Continue checking in daily to expand your sanctuary ecosystem.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-sm font-bold shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
            >
              Return to Sanctuary
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
