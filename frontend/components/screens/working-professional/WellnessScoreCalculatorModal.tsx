"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateWellnessScore } from "@/frontend/lib/wellness-scoring";

interface WellnessScoreCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreCalculated: (newScore: number, level: string) => void;
}

const MOOD_OPTIONS = [
  { label: "Good", emoji: "😊" },
  { label: "Okay", emoji: "🙂" },
  { label: "Drained", emoji: "😐" },
  { label: "Stressed", emoji: "😟" },
  { label: "Overwhelmed", emoji: "😣" },
];

export default function WellnessScoreCalculatorModal({
  isOpen,
  onClose,
  onScoreCalculated,
}: WellnessScoreCalculatorModalProps) {
  const [mood, setMood] = useState<string>("Good");
  const [stress, setStress] = useState<string>("Manageable");
  const [energy, setEnergy] = useState<number>(4);
  const [sleep, setSleep] = useState<number>(4);
  const [workLifeBalance, setWorkLifeBalance] = useState<number>(3);

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleCalculate = async () => {
    setIsCalculating(true);

    const calculated = calculateWellnessScore({
      mood,
      stress,
      energy,
      sleep,
      workLifeBalance,
    });

    try {
      await fetch("/api/wellness-score/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          stress,
          energy,
          sleep,
          workLifeBalance,
        }),
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setResult(calculated);
      setIsCalculating(false);
      onScoreCalculated(calculated.score, calculated.level);
    }, 1000);
  };

  const handleReset = () => {
    setResult(null);
    setIsCalculating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#1D192B]/40 backdrop-blur-md flex items-center justify-center p-4 select-none"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          className="relative w-full max-w-lg rounded-[36px] bg-gradient-to-br from-[#FCFBFE] via-[#F6F0FD] to-[#EDE5FA] border border-purple-100/80 p-8 sm:p-10 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/80 border border-purple-100/70 flex items-center justify-center text-[#746F89] hover:text-[#231E39] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          {result ? (
            /* Result Screen */
            <div className="space-y-6 text-center py-2">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-medium bg-white/90 text-[#6351A5] border border-purple-100/80">
                  🌿 Sanctuary Assessment Result
                </span>
                <h3 className="text-2xl font-heading font-extrabold text-[#231E39]">
                  Your Wellness Score
                </h3>
              </div>

              {/* Animated Progress Gauge */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-purple-100"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-[#6351A5]"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * result.score) / 100 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-heading font-extrabold text-[#231E39]">
                    {result.score}
                  </span>
                  <span className="text-[10px] font-bold text-[#746F89] tracking-wider uppercase">
                    {result.level}
                  </span>
                </div>
              </div>

              {/* Supportive Explanation */}
              <div className="p-4 rounded-2xl bg-white/80 border border-purple-100/80 text-left space-y-1.5 text-xs">
                <p className="font-heading font-bold text-[#231E39]">
                  {result.summary}
                </p>
                <p className="text-[#746F89] font-normal leading-relaxed">
                  Your strongest area is <strong className="text-[#1F7A65]">{result.strengths}</strong>, while{" "}
                  <strong className="text-[#6351A5]">{result.opportunities}</strong> could use a little extra care.
                </p>
              </div>

              {/* Component breakdown */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-xl bg-white/70 border border-purple-100">
                  <div className="text-gray-400">Mind</div>
                  <div className="font-bold text-[#6351A5]">{result.breakdown.mind}%</div>
                </div>
                <div className="p-2 rounded-xl bg-white/70 border border-purple-100">
                  <div className="text-gray-400">Energy</div>
                  <div className="font-bold text-[#1F7A65]">{result.breakdown.energy}%</div>
                </div>
                <div className="p-2 rounded-xl bg-white/70 border border-purple-100">
                  <div className="text-gray-400">Rest</div>
                  <div className="font-bold text-[#7C6BC4]">{result.breakdown.rest}%</div>
                </div>
                <div className="p-2 rounded-xl bg-white/70 border border-purple-100">
                  <div className="text-gray-400">Balance</div>
                  <div className="font-bold text-[#6351A5]">{result.breakdown.balance}%</div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Apply to Sanctuary Dashboard
              </button>
            </div>
          ) : (
            /* Input Questions */
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-medium bg-white/90 text-[#6351A5] border border-purple-100/80">
                  ✨ Interactive Calculator
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#231E39]">
                  Let's understand how you're doing
                </h3>
                <p className="text-xs text-[#746F89]">
                  Rate your current work-wellness baseline to calculate your score.
                </p>
              </div>

              {/* 1. Mood */}
              <div className="space-y-1.5">
                <label className="text-xs font-heading font-bold text-[#231E39]">
                  1. How are you arriving?
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(m.label)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        mood === m.label
                          ? "bg-[#6351A5] text-white border-[#6351A5]"
                          : "bg-white/80 border-purple-100 text-[#534F64]"
                      }`}
                    >
                      <div className="text-lg">{m.emoji}</div>
                      <div className="text-[10px] font-medium truncate">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Stress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-heading font-bold text-[#231E39]">
                    2. Stress level
                  </label>
                  <span className="text-[#6351A5] font-semibold">{stress}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {["Peaceful", "Manageable", "Stressful", "Overwhelming"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStress(s)}
                      className={`py-1.5 rounded-lg text-[10px] font-medium border text-center transition-all ${
                        stress === s
                          ? "bg-[#6351A5] text-white border-[#6351A5]"
                          : "bg-white/80 border-purple-100 text-[#534F64]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Energy */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-heading font-bold text-[#231E39]">
                    3. Energy reserves ({energy}/5)
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energy}
                  onChange={(e) => setEnergy(Number(e.target.value))}
                  className="w-full accent-[#1F7A65] cursor-pointer"
                />
              </div>

              {/* 4. Sleep */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-heading font-bold text-[#231E39]">
                    4. Sleep &amp; recovery ({sleep}/5)
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleep}
                  onChange={(e) => setSleep(Number(e.target.value))}
                  className="w-full accent-[#7C6BC4] cursor-pointer"
                />
              </div>

              {/* 5. Balance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-heading font-bold text-[#231E39]">
                    5. Work-life balance ({workLifeBalance}/5)
                  </label>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workLifeBalance}
                  onChange={(e) => setWorkLifeBalance(Number(e.target.value))}
                  className="w-full accent-[#6351A5] cursor-pointer"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="w-full py-3 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Analyzing your check-in...</span>
                    </>
                  ) : (
                    <span>Calculate Wellness Score →</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
