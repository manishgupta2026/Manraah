"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import { saveDailyCheckInAction, getUserStreakAction } from "@/backend/auth/actions";

// Calming colors and configurations for mood cards
const MOODS = [
  { label: "Serene", emoji: "🌸", subtitle: "Peaceful & light", color: "from-teal-100 to-mint-50", text: "text-teal-800" },
  { label: "Calm", emoji: "🍃", subtitle: "Centered & steady", color: "from-blue-100 to-sky-50", text: "text-blue-800" },
  { label: "Reflective", emoji: "⭐", subtitle: "Thoughtful & quiet", color: "from-indigo-100 to-purple-50", text: "text-indigo-800" },
  { label: "Anxious", emoji: "☁️", subtitle: "Restless & uneasy", color: "from-amber-100 to-orange-50", text: "text-amber-800" },
  { label: "Exhausted", emoji: "🍂", subtitle: "Low battery & tired", color: "from-rose-100 to-red-50", text: "text-rose-800" },
];

const SLEEP_LEVELS = [
  { val: 1, label: "Restless 😴", desc: "Tossed and turned frequently" },
  { val: 2, label: "Light ⏳", desc: "Short or interrupted sleep" },
  { val: 3, label: "Balanced ⚖️", desc: "Decent rest, average recovery" },
  { val: 4, label: "Deep 💤", desc: "Solid hours, woke up feeling good" },
  { val: 5, label: "Regenerative 🔋", desc: "Perfect sleep, fully energized" },
];

const INTENTIONS = [
  "Stay hydrated & present",
  "Take short screen breaks",
  "Walk in nature",
  "Practice mindful listening",
  "Be kind to myself",
  "Listen to my body's needs",
];

export default function DailyCheckInScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // Flow State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Check-in Answers
  const [mood, setMood] = useState("Calm");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [gratitude, setGratitude] = useState("");
  const [intention, setIntention] = useState("");
  const [customIntention, setCustomIntention] = useState("");
  const [streak, setStreak] = useState({ currentStreak: 1, longestStreak: 1 });

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUserId(session.user.id);
    }
  }, []);

  // Fetch affirmation text based on mood selection
  const getAffirmation = (selectedMood: string) => {
    switch (selectedMood) {
      case "Serene":
        return "I carry this sense of peace within me, letting it radiate outward to those around me.";
      case "Calm":
        return "I am anchored in the present. My breathing is deep, and my thoughts are clear.";
      case "Reflective":
        return "I trust the quiet wisdom of my thoughts and allow myself the grace to observe without judgment.";
      case "Anxious":
        return "I release what I cannot control and return to my breath. I am safe in this very moment.";
      case "Exhausted":
        return "I give myself permission to rest and recharge. Taking care of my energy is an act of love.";
      default:
        return "I am worthy of peace, patience, and gentle progress. Every step I take today is enough.";
    }
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteCheckIn = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const finalIntention = intention === "custom" ? customIntention : intention;
      const res = await saveDailyCheckInAction(userId, {
        mood,
        energyLevel,
        sleepQuality,
        gratitudeReflection: gratitude,
        dailyIntention: finalIntention || "Be present",
      });

      if (res.success) {
        // Fetch updated streak details
        const streakRes = await getUserStreakAction(userId);
        if (streakRes.success) {
          setStreak({
            currentStreak: streakRes.currentStreak || 1,
            longestStreak: streakRes.longestStreak || 1,
          });
        }
        setStep(8); // Proceed to Plant Streak screen
      }
    } catch (err) {
      console.error("Checkin save error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Plant streaking stage configurations
  const getPlantStage = (streakCount: number) => {
    if (streakCount <= 1) {
      return { stage: "Sprout 🌱", desc: "A tiny seed taking root in your sanctuary.", scale: 0.6, color: "#10B981" };
    } else if (streakCount <= 4) {
      return { stage: "Seedling 🌿", desc: "Growing leaves and adapting gracefully.", scale: 0.8, color: "#059669" };
    } else if (streakCount <= 9) {
      return { stage: "Budding Stem 🌸", desc: "Preparing to bloom with peaceful strength.", scale: 1.0, color: "#D946EF" };
    } else if (streakCount <= 14) {
      return { stage: "Flowering Bush 🌹", desc: "A colorful testament to your daily mindfulness.", scale: 1.2, color: "#E11D48" };
    } else {
      return { stage: "Wellness Tree 🌳", desc: "Stately, rooted, and beautifully complete.", scale: 1.4, color: "#047857" };
    }
  };

  const plantInfo = getPlantStage(streak.currentStreak);

  // Framer Motion Animation Variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 select-none min-h-[75vh] flex flex-col justify-center">
      <AnimatePresence mode="wait" custom={step}>
        {/* STEP 1: WELCOME BREATHE SCREEN */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center space-y-8"
          >
            <div className="space-y-3">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                Sanctuary Check-in
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
                Time for a Mindful Pause
              </h1>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Connect with your mind and body. Let's take two minutes to log your current state.
              </p>
            </div>

            {/* Breathing Circle Animation */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.25, 1.25, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-primary/15"
              />
              <motion.div
                animate={{
                  scale: [0.8, 1.15, 1.15, 0.8],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center"
              />
              <span className="text-xs font-bold text-primary tracking-widest uppercase z-10">Breathe</span>
            </div>

            <button
              onClick={handleNextStep}
              className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-sm font-bold shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105"
            >
              Begin Journey →
            </button>
          </motion.div>
        )}

        {/* STEP 2: MOOD SELECTION */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-on-surface">How are you feeling right now?</h2>
              <p className="text-xs text-on-surface-variant">Select the feeling that is closest to your heart.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
              {MOODS.map((m) => {
                const active = mood === m.label;
                return (
                  <button
                    key={m.label}
                    onClick={() => setMood(m.label)}
                    className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                      active
                        ? "bg-surface-container-lowest border-primary shadow-sm scale-[1.02] ring-2 ring-primary/20"
                        : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    <div className="text-3xl">{m.emoji}</div>
                    <div className="flex-1">
                      <h4 className="font-heading font-bold text-sm text-on-surface">{m.label}</h4>
                      <p className="text-xs text-on-surface-variant">{m.subtitle}</p>
                    </div>
                    {active && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between max-w-sm mx-auto pt-4">
              <button onClick={handlePrevStep} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: ENERGY LEVEL */}
        {step === 3 && (
          <motion.div
            key="step-3"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="space-y-8 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-on-surface">What is your energy level?</h2>
              <p className="text-xs text-on-surface-variant">Rate your current physical and cognitive capacity.</p>
            </div>

            {/* Energy Slider widget */}
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 space-y-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">
                  {energyLevel <= 1 ? "🔋❌" : energyLevel <= 2 ? "🪫" : energyLevel <= 4 ? "🔋" : "⚡"}
                </span>
                <div>
                  <h4 className="font-heading font-bold text-xl text-primary">{energyLevel} / 5</h4>
                  <p className="text-xs text-on-surface-variant">
                    {energyLevel === 1
                      ? "Fully depleted. Need absolute rest."
                      : energyLevel === 2
                      ? "Running low. Focus on recovery."
                      : energyLevel === 3
                      ? "Balanced. Decent focus levels."
                      : energyLevel === 4
                      ? "Highly energized. Ready to focus."
                      : "Peak condition. Unleashing potential."}
                  </p>
                </div>
              </div>

              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-container-high accent-primary"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider">
                <span>Depleted</span>
                <span>Balanced</span>
                <span>Charged</span>
              </div>
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrevStep} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: SLEEP QUALITY */}
        {step === 4 && (
          <motion.div
            key="step-4"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-on-surface">How did you sleep last night?</h2>
              <p className="text-xs text-on-surface-variant">Sleep is the foundation of your recovery journey.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {SLEEP_LEVELS.map((s) => {
                const active = sleepQuality === s.val;
                return (
                  <button
                    key={s.val}
                    onClick={() => setSleepQuality(s.val)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      active
                        ? "bg-surface-container-lowest border-primary shadow-sm ring-2 ring-primary/20 scale-[1.02]"
                        : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    <div>
                      <h4 className="font-heading font-bold text-sm text-on-surface">{s.label}</h4>
                      <p className="text-xs text-on-surface-variant">{s.desc}</p>
                    </div>
                    {active && <span className="material-symbols-outlined text-primary text-xl">check_circle</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrevStep} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: GRATITUDE REFLECTION */}
        {step === 5 && (
          <motion.div
            key="step-5"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-on-surface">Gratitude Reflection</h2>
              <p className="text-xs text-on-surface-variant">Name one small, peaceful thing you are grateful for today.</p>
            </div>

            <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 space-y-4 max-w-md mx-auto text-left">
              <label className="block text-xs font-bold text-primary uppercase tracking-wider">Grateful Moment:</label>
              <textarea
                rows={4}
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="Examples: The sound of rain, warm coffee, a kind message, or simply taking this slow breath..."
                className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35 leading-relaxed text-on-surface"
              />
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrevStep} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: DAILY INTENTION */}
        {step === 6 && (
          <motion.div
            key="step-6"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-on-surface">Today's Intention</h2>
              <p className="text-xs text-on-surface-variant">Focus your energy on a calm wellness target today.</p>
            </div>

            <div className="space-y-4 max-w-md mx-auto text-left">
              <div className="grid grid-cols-1 gap-2.5">
                {INTENTIONS.map((item) => {
                  const active = intention === item;
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        setIntention(item);
                        setCustomIntention("");
                      }}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                        active
                          ? "bg-surface-container-lowest border-primary shadow-sm scale-[1.01]"
                          : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
                <button
                  onClick={() => setIntention("custom")}
                  className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                    intention === "custom"
                      ? "bg-surface-container-lowest border-primary shadow-sm scale-[1.01]"
                      : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                  }`}
                >
                  Type custom intention...
                </button>
              </div>

              {intention === "custom" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2"
                >
                  <input
                    type="text"
                    required
                    value={customIntention}
                    onChange={(e) => setCustomIntention(e.target.value)}
                    placeholder="Enter intention, e.g. Call a close friend..."
                    className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 font-semibold text-on-surface"
                  />
                </motion.div>
              )}
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrevStep} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={intention === "custom" && !customIntention.trim()}
                className="px-8 py-3 rounded-full bg-primary text-white font-bold text-xs shadow-md disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 7: PERSONALIZED AFFIRMATION SCREEN */}
        {step === 7 && (
          <motion.div
            key="step-7"
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            className="space-y-8 text-center"
          >
            <div className="space-y-2">
              <span className="px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                Sanctuary Affirmation
              </span>
              <h2 className="text-2xl font-heading font-bold text-on-surface pt-3">Affirmation for {mood} Mood</h2>
            </div>

            {/* Affirmation Display Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-tr from-primary-container/20 to-secondary/10 border border-primary/20 max-w-md mx-auto relative overflow-hidden flex flex-col justify-center min-h-[160px]">
              {/* Soft glow */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />
              <p className="text-lg font-medium text-on-surface leading-relaxed z-10 italic">
                "{getAffirmation(mood)}"
              </p>
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-4">
              <button onClick={handlePrevStep} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleCompleteCheckIn}
                disabled={loading}
                className="px-10 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-102 hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Saving Sanctuary Logs..." : "Save Today's Log →"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 8: COMPLETION & PLANT GROWTH SCREEN */}
        {step === 8 && (
          <motion.div
            key="step-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-full bg-mint/20 text-secondary mx-auto flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h2 className="text-3xl font-heading font-bold text-on-surface">Sanctuary Log Complete!</h2>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Thank you for checking in with yourself. Every reflection brings you closer to emotional clarity.
              </p>
            </div>

            {/* Streak & Plant Growth Card */}
            <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft max-w-sm mx-auto space-y-6">
              <div>
                <p className="text-xs text-on-surface-variant/80 font-bold uppercase tracking-wider">Sanctuary Streak</p>
                <p className="text-3xl font-heading font-extrabold text-primary pt-1">
                  {streak.currentStreak} Days 🔥
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-1">Longest Streak: {streak.longestStreak} days</p>
              </div>

              {/* Plant Visual Sprout/Seedling SVG */}
              <div className="relative w-36 h-36 bg-surface-container-low rounded-full mx-auto flex items-end justify-center pb-4 overflow-hidden border border-surface-variant/20">
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-mint-green/10 blur-xl pointer-events-none" />
                
                {/* Animated Growing Plant Node */}
                <motion.div
                  initial={{ scale: 0, y: 30 }}
                  animate={{ scale: plantInfo.scale, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                    delay: 0.3,
                  }}
                  className="z-10"
                >
                  <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
                    {/* Dirt Mound */}
                    <ellipse cx="30" cy="85" rx="20" ry="5" fill="#78350F" opacity="0.6" />
                    
                    {/* Stem */}
                    <path
                      d="M30 85C30 50 30 25 30 15"
                      stroke={plantInfo.color}
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    
                    {/* Leaves based on scale/stages */}
                    {streak.currentStreak >= 1 && (
                      <>
                        <path d="M30 70C20 65 15 55 20 50C25 45 28 55 30 70Z" fill={plantInfo.color} />
                        <path d="M30 65C40 60 45 50 40 45C35 40 32 50 30 65Z" fill={plantInfo.color} />
                      </>
                    )}
                    {streak.currentStreak >= 5 && (
                      <>
                        <path d="M30 45C22 40 18 32 22 28C26 24 28 32 30 45Z" fill={plantInfo.color} />
                        <path d="M30 40C38 35 42 27 38 23C34 19 32 27 30 40Z" fill={plantInfo.color} />
                      </>
                    )}
                    
                    {/* Flowers/Buds based on stages */}
                    {streak.currentStreak >= 10 && (
                      <circle cx="30" cy="15" r="10" fill="#EF4444" />
                    )}
                    {streak.currentStreak >= 15 && (
                      <>
                        <circle cx="20" cy="10" r="5" fill="#FBBF24" />
                        <circle cx="40" cy="10" r="5" fill="#FBBF24" />
                      </>
                    )}
                    
                    {/* Active sprout top leaf */}
                    <path d="M30 15C25 10 28 2 30 0C32 2 35 10 30 15Z" fill="#34D399" />
                  </svg>
                </motion.div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-mint-green/20 text-emerald-800 uppercase tracking-wide">
                  Stage: {plantInfo.stage}
                </span>
                <p className="text-xs text-on-surface-variant font-medium mt-2 leading-relaxed">
                  {plantInfo.desc} Keep up your sanctuary check-ins to water your plant!
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-sm font-bold shadow-md transition-all scale-102 hover:scale-105"
            >
              Return to Sanctuary Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
