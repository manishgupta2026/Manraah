"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { getClientSession } from "@/backend/auth/client";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

const MOODS = [
  { label: "Amazing", emoji: "😊", desc: "Feeling on top of the world", color: "hover:bg-emerald-50 hover:border-emerald-200" },
  { label: "Happy", emoji: "😁", desc: "Joyful, vibrant, and positive", color: "hover:bg-green-50 hover:border-green-200" },
  { label: "Calm", emoji: "😌", desc: "Centered, quiet, and peaceful", color: "hover:bg-sky-50 hover:border-sky-200" },
  { label: "Good", emoji: "🙂", desc: "Satisfied, content, and balanced", color: "hover:bg-slate-50 hover:border-slate-200" },
  { label: "Neutral", emoji: "😐", desc: "Neither up nor down", color: "hover:bg-gray-50 hover:border-gray-200" },
  { label: "Low", emoji: "😔", desc: "Slightly down or listless", color: "hover:bg-indigo-50 hover:border-indigo-200" },
  { label: "Sad", emoji: "😢", desc: "Feeling blue, teary, or low", color: "hover:bg-blue-50 hover:border-blue-200" },
  { label: "Anxious", emoji: "😣", desc: "Uneasy, worried, or tense", color: "hover:bg-amber-50 hover:border-amber-200" },
  { label: "Frustrated", emoji: "😡", desc: "Irritated, annoyed, or stuck", color: "hover:bg-orange-50 hover:border-orange-200" },
  { label: "Overwhelmed", emoji: "😩", desc: "Too much carrying, high pressure", color: "hover:bg-rose-50 hover:border-rose-200" },
  { label: "Exhausted", emoji: "😴", desc: "Fully drained, need deep rest", color: "hover:bg-red-50 hover:border-red-200" },
];

const FACTORS = [
  "Work", "Studies", "Family", "Friends", "Relationship", "Health", 
  "Sleep", "Exercise", "Food", "Weather", "Money", "Social Media", 
  "Travel", "Achievement", "Failure", "Other"
];

const STRESS_LEVELS = ["Low", "Medium", "High", "Very High"];

export default function MoodCheckInScreen() {
  const router = useRouter();
  const { submitCheckIn } = useWellness();
  const [userId, setUserId] = useState<string | null>(null);

  // Steps: 0: Welcome, 1: Mood, 2: Factors, 3: Reflection, 4: Energy, 5: Stress, 6: Completion
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("Good Evening 🌸");

  // Answers
  const [mood, setMood] = useState("");
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState("Medium");

  // Animation particles
  const [petals, setPetals] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUserId(session.user.id);
    }

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning 🌸");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon 🌸");
    else if (hour >= 17 && hour < 21) setGreeting("Good Evening 🌸");
    else setGreeting("Good Night 🌸");

    // Pre-calculate falling flower petals coordinates
    const list = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
    }));
    setPetals(list);
  }, []);

  const handleBegin = () => setStep(1);

  const handleMoodSelect = (val: string) => {
    setMood(val);
    setTimeout(() => {
      setStep(2);
    }, 250);
  };

  const toggleFactor = (item: string) => {
    setSelectedFactors((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrev = () => setStep((prev) => Math.max(0, prev - 1));

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await submitCheckIn({
        mood,
        energy,
        stress,
        reflection,
        factors: selectedFactors.join(", "),
      });
      setStep(6); // Success / Completion Screen
    } catch (err) {
      console.error("Error saving check-in:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto min-h-[80vh] flex flex-col justify-center py-8 px-4 relative overflow-hidden select-none">
      <ScreenHeader
        title="🌿 Log Mood"
        showBackButton={true}
        onBack={step > 0 && step < 6 ? handlePrev : () => router.push("/dashboard")}
      />
      
      {/* Falling Flower Petals success animation for Step 6 */}
      {step === 6 && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {petals.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -50, x: 0, rotate: 0, opacity: 0 }}
              animate={{
                y: "100vh",
                x: [0, 45, -45, 0],
                rotate: 360,
                opacity: [0, 0.75, 0.75, 0],
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
        
        {/* STEP 0: WELCOME */}
        {step === 0 && (
          <motion.div
            key="step-welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="text-center space-y-8 z-10"
          >
            <div className="space-y-4">
              <span className="text-4xl">🌿</span>
              <h1 className="text-4xl font-heading font-black text-on-surface leading-tight">
                {greeting}
              </h1>
              <p className="text-sm text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                Take a moment.<br />There is no right or wrong emotion. Let's check in with yourself.
              </p>
            </div>

            {/* Breathing Ambient Circle */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/10 blur-md"
              />
              <motion.div
                animate={{ scale: [0.8, 1.15, 0.8] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-24 h-24 rounded-full bg-primary/15"
              />
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase z-10">Breathe</span>
            </div>

            <button
              onClick={handleBegin}
              className="px-12 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
            >
              Begin Check-in
            </button>
          </motion.div>
        )}

        {/* STEP 1: EMOTION SELECTION */}
        {step === 1 && (
          <motion.div
            key="step-mood"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-black text-on-surface">How are you feeling today?</h2>
              <p className="text-xs text-on-surface-variant">Tap the card that matches your emotional resonance.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-lg mx-auto max-h-[50vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-surface-variant/40">
              {MOODS.map((m) => (
                <motion.button
                  key={m.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleMoodSelect(m.label)}
                  className={`p-4 rounded-2xl border border-surface-variant/35 bg-surface-container-low transition-all duration-300 text-center ${m.color}`}
                >
                  <span className="text-3xl block mb-1">{m.emoji}</span>
                  <h4 className="font-heading font-bold text-xs text-on-surface">{m.label}</h4>
                  <p className="text-[9px] text-on-surface-variant mt-0.5 leading-none">{m.desc}</p>
                </motion.button>
              ))}
            </div>

            <div className="pt-2">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: FACTORS INFLUENCE */}
        {step === 2 && (
          <motion.div
            key="step-factors"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-black text-on-surface">What influenced your mood today?</h2>
              <p className="text-xs text-on-surface-variant">Select multiple factors that shaped your day.</p>
            </div>

            <div className="p-6 rounded-[32px] bg-white border border-surface-variant/15 shadow-soft max-w-md mx-auto">
              <div className="flex flex-wrap justify-center gap-2 max-h-[40vh] overflow-y-auto p-1">
                {FACTORS.map((item) => {
                  const active = selectedFactors.includes(item);
                  return (
                    <motion.button
                      key={item}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleFactor(item)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        active
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-surface-container-low border-surface-variant/30 text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      {item}
                    </motion.button>
                  );
                })}
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

        {/* STEP 3: OPTIONAL REFLECTION */}
        {step === 3 && (
          <motion.div
            key="step-reflection"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-black text-on-surface">Would you like to write a few thoughts?</h2>
              <p className="text-xs text-on-surface-variant">Putting feelings into words helps process emotions.</p>
            </div>

            <div className="p-6 rounded-[32px] bg-white border border-surface-variant/15 shadow-soft max-w-md mx-auto text-left">
              <textarea
                rows={5}
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write whatever is on your heart right now..."
                className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/35 text-xs focus:outline-none focus:ring-2 focus:ring-primary/45 leading-relaxed text-on-surface"
              />
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

        {/* STEP 4: ENERGY LEVEL */}
        {step === 4 && (
          <motion.div
            key="step-energy"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-black text-on-surface">How's your energy today?</h2>
              <p className="text-xs text-on-surface-variant">Rate your capacity from depleted (1) to radiant (10).</p>
            </div>

            <div className="p-8 rounded-[36px] bg-white border border-surface-variant/15 shadow-soft max-w-md mx-auto space-y-6">
              <div className="text-center">
                <span className="text-5xl">
                  {energy <= 3 ? "🔋🪫" : energy <= 6 ? "🔋🔋" : "⚡🚀"}
                </span>
                <h4 className="font-heading font-black text-2xl text-primary mt-2">{energy} / 10</h4>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-surface-container accent-primary"
              />

              <div className="flex justify-between text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider">
                <span>Depleted</span>
                <span>Balanced</span>
                <span>Radiant</span>
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

        {/* STEP 5: STRESS LEVEL */}
        {step === 5 && (
          <motion.div
            key="step-stress"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6 text-center z-10"
          >
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-heading font-black text-on-surface">Stress Level</h2>
              <p className="text-xs text-on-surface-variant">Assess the tension rate registered in your body right now.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {STRESS_LEVELS.map((s) => {
                const active = stress === s;
                return (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStress(s)}
                    className={`p-6 rounded-[24px] border transition-all text-center flex flex-col items-center justify-center min-h-[100px] ${
                      active
                        ? "bg-surface-container-lowest border-primary shadow-sm ring-2 ring-primary/25"
                        : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                    }`}
                  >
                    <span className="text-xs font-bold text-on-surface">{s}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex justify-between max-w-md mx-auto pt-6">
              <button onClick={handlePrev} className="text-xs font-bold text-on-surface-variant hover:underline">
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-10 py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-102 hover:scale-105 active:scale-98 disabled:opacity-50"
              >
                {loading ? "Saving log..." : "Save Reflection"}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: COMPLETION */}
        {step === 6 && (
          <motion.div
            key="step-complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 z-10"
          >
            <div className="space-y-4">
              <span className="text-5xl block animate-pulse">🌸</span>
              <h2 className="text-3xl font-heading font-black text-on-surface">Thank you.</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-semibold max-w-xs mx-auto">
                Checking in with yourself is a genuine act of self-care.
              </p>
            </div>

            {/* Glowing breathing center */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-primary/10"
              />
              <div className="w-10 h-10 rounded-full bg-primary/20" />
            </div>

            <button
              onClick={() => router.push("/mood-tracking")}
              className="px-10 py-4 rounded-full bg-primary hover:bg-primary-purple text-white text-sm font-bold shadow-md hover:shadow-lg transition-all scale-102 hover:scale-105 active:scale-98"
            >
              See Insights
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
