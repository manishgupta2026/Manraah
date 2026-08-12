"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingPhase = "Inhale" | "Hold" | "Exhale" | "Rest";

export default function BreathingResetModal({
  isOpen,
  onClose,
}: BreathingResetModalProps) {
  const [phase, setPhase] = useState<BreathingPhase>("Inhale");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120); // 2-min timer
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Box Breathing cycle: 4s Inhale, 4s Hold, 4s Exhale, 2s Rest
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCompleted]);

  useEffect(() => {
    if (!isOpen || isCompleted) return;

    let phaseTimer: NodeJS.Timeout;
    const runCycle = () => {
      // Inhale 4s
      setPhase("Inhale");
      phaseTimer = setTimeout(() => {
        // Hold 4s
        setPhase("Hold");
        phaseTimer = setTimeout(() => {
          // Exhale 4s
          setPhase("Exhale");
          phaseTimer = setTimeout(() => {
            // Rest 2s
            setPhase("Rest");
            setCycleCount((c) => c + 1);
            phaseTimer = setTimeout(runCycle, 2000);
          }, 4000);
        }, 4000);
      }, 4000);
    };

    runCycle();

    return () => clearTimeout(phaseTimer);
  }, [isOpen, isCompleted]);

  const getPhaseInstruction = () => {
    switch (phase) {
      case "Inhale":
        return "Breathe in deeply through your nose...";
      case "Hold":
        return "Gently hold your breath in peace...";
      case "Exhale":
        return "Slowly release all workday tension...";
      case "Rest":
        return "Relax your shoulders and stay present...";
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#1D192B]/50 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="relative w-full max-w-lg rounded-[36px] bg-gradient-to-br from-[#FAF7FF] via-[#F4EEFF] to-[#EAE0FC] border border-purple-200/80 p-7 md:p-9 shadow-2xl overflow-hidden text-center select-none"
        >
          {/* Ambient Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E6DEFF] blur-3xl pointer-events-none opacity-60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 border border-purple-100 flex items-center justify-center text-[#797582] hover:text-[#1D192B] transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          {isCompleted ? (
            /* ================= Completed State ================= */
            <div className="py-8 space-y-5 relative z-10">
              <div className="w-20 h-20 rounded-full bg-emerald-100/80 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-sm">
                🌿
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-black text-[#1D192B]">
                  You're Grounded and Free
                </h3>
                <p className="text-sm text-[#484551] max-w-sm mx-auto leading-relaxed">
                  You completed {cycleCount} mindful breath cycles. The workday is behind you. Enjoy your evening.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-sm shadow-md hover:bg-[#7C6BC4] transition-all cursor-pointer"
              >
                Return to Sanctuary
              </button>
            </div>
          ) : (
            /* ================= Active Breathing Animation ================= */
            <div className="space-y-6 relative z-10">
              {/* Header */}
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#5F4EA5] bg-white/80 border border-purple-100 shadow-xs">
                  🌿 2-Minute Reset
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-[#1D192B]">
                  Leave Work at Work
                </h3>
                <p className="text-xs text-[#797582] font-semibold">
                  Time remaining: <span className="text-[#5F4EA5]">{formatTime(secondsRemaining)}</span>
                </p>
              </div>

              {/* Breathing Circle Container */}
              <div className="relative w-56 h-56 mx-auto flex items-center justify-center py-2">
                {/* Outer expanding halo */}
                <motion.div
                  animate={{
                    scale: phase === "Inhale" || phase === "Hold" ? 1.25 : 0.85,
                    opacity: phase === "Inhale" || phase === "Hold" ? 0.6 : 0.2,
                  }}
                  transition={{
                    duration: phase === "Inhale" ? 4 : phase === "Exhale" ? 4 : 1,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7C6BC4]/30 to-[#88F7D6]/30 blur-xl"
                />

                {/* Outer ring */}
                <motion.div
                  animate={{
                    scale: phase === "Inhale" || phase === "Hold" ? 1.18 : 0.9,
                  }}
                  transition={{
                    duration: phase === "Inhale" ? 4 : phase === "Exhale" ? 4 : 1,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-2 rounded-full border-2 border-dashed border-[#5F4EA5]/30"
                />

                {/* Main animated orb/circle */}
                <motion.div
                  animate={{
                    scale: phase === "Inhale" || phase === "Hold" ? 1 : 0.75,
                  }}
                  transition={{
                    duration: phase === "Inhale" ? 4 : phase === "Exhale" ? 4 : 1,
                    ease: "easeInOut",
                  }}
                  className="w-40 h-40 rounded-full bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#5FCFB0] shadow-[0_10px_35px_rgba(95,78,165,0.3)] flex flex-col items-center justify-center text-white"
                >
                  <motion.span
                    key={phase}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-heading font-black tracking-wider uppercase"
                  >
                    {phase}
                  </motion.span>
                </motion.div>
              </div>

              {/* Dynamic Guidance Text */}
              <div className="space-y-1">
                <p className="text-sm font-heading font-bold text-[#1D192B]">
                  {getPhaseInstruction()}
                </p>
                <p className="text-[11px] text-[#797582]">
                  Cycles completed: {cycleCount}
                </p>
              </div>

              {/* End early button */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs text-[#797582] hover:text-[#1D192B] transition-colors font-medium cursor-pointer"
                >
                  Pause & Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
