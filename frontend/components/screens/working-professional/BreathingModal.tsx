"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "Inhale" | "Hold" | "Exhale" | "Rest";

export default function BreathingModal({ isOpen, onClose }: BreathingModalProps) {
  const [phase, setPhase] = useState<Phase>("Inhale");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [cycles, setCycles] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  // 2-minute timer
  useEffect(() => {
    if (!isOpen || isDone) return;

    const interval = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          setIsDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isDone]);

  // Breathing Box Cycle: 4s Inhale, 4s Hold, 4s Exhale, 2s Rest
  useEffect(() => {
    if (!isOpen || isDone) return;

    let timer: NodeJS.Timeout;
    const cycle = () => {
      setPhase("Inhale");
      timer = setTimeout(() => {
        setPhase("Hold");
        timer = setTimeout(() => {
          setPhase("Exhale");
          timer = setTimeout(() => {
            setPhase("Rest");
            setCycles((c) => c + 1);
            timer = setTimeout(cycle, 2000);
          }, 4000);
        }, 4000);
      }, 4000);
    };

    cycle();

    return () => clearTimeout(timer);
  }, [isOpen, isDone]);

  const getPhaseGuide = () => {
    switch (phase) {
      case "Inhale":
        return "Breathe in deeply through your nose...";
      case "Hold":
        return "Gently hold stillness within...";
      case "Exhale":
        return "Slowly release all tension from the day...";
      case "Rest":
        return "Drop your shoulders and stay present...";
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
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          className="relative w-full max-w-md rounded-[32px] bg-gradient-to-br from-[#FAF8FF] via-[#F4EEFF] to-[#EAE0FC] border border-[#E6DEFF] p-7 sm:p-9 shadow-2xl text-center select-none overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#E6DEFF] blur-3xl opacity-60 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/80 border border-purple-100 flex items-center justify-center text-[#797582] hover:text-[#1D192B] transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>

          {isDone ? (
            <div className="py-6 space-y-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100/80 text-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-xs">
                🌿
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-heading font-black text-[#1D192B]">
                  You are centered and ready.
                </h3>
                <p className="text-xs sm:text-sm text-[#484551] max-w-xs mx-auto leading-relaxed">
                  You completed {cycles} mindful breathing cycles. Work can wait — enjoy the rest of your evening.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-md hover:bg-[#7C6BC4] transition-all cursor-pointer"
              >
                Return to Sanctuary
              </button>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-[#5F4EA5] bg-white/80 border border-[#E6DEFF] shadow-xs">
                  🌿 2-Minute Reset
                </span>
                <h3 className="text-xl font-heading font-black text-[#1D192B]">
                  Leave Work at Work
                </h3>
                <p className="text-xs text-[#797582] font-semibold">
                  Time remaining: <span className="text-[#5F4EA5]">{formatTime(secondsRemaining)}</span>
                </p>
              </div>

              {/* Animated Breathing Circle */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
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

                <motion.div
                  animate={{
                    scale: phase === "Inhale" || phase === "Hold" ? 1 : 0.75,
                  }}
                  transition={{
                    duration: phase === "Inhale" ? 4 : phase === "Exhale" ? 4 : 1,
                    ease: "easeInOut",
                  }}
                  className="w-36 h-36 rounded-full bg-gradient-to-br from-[#5F4EA5] via-[#7C6BC4] to-[#5FCFB0] shadow-[0_10px_35px_rgba(95,78,165,0.3)] flex flex-col items-center justify-center text-white"
                >
                  <motion.span
                    key={phase}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-base font-heading font-black tracking-wider uppercase"
                  >
                    {phase}
                  </motion.span>
                </motion.div>
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-heading font-bold text-[#1D192B]">
                  {getPhaseGuide()}
                </p>
                <p className="text-[11px] text-[#797582]">
                  Cycles completed: {cycles}
                </p>
              </div>

              <div>
                <button
                  onClick={onClose}
                  className="text-xs text-[#797582] hover:text-[#1D192B] transition-colors font-medium cursor-pointer"
                >
                  Pause &amp; Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
