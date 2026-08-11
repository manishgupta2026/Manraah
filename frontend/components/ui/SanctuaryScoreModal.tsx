"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface SanctuaryScoreModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export default function SanctuaryScoreModal({ isOpen, onDismiss }: SanctuaryScoreModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleComplete = () => {
    router.push("/assessment");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Soft backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
          className="relative z-10 w-full max-w-md rounded-[32px] bg-white/90 backdrop-blur-2xl border border-white/70 p-6 md:p-8 shadow-[0_25px_60px_rgba(95,78,165,0.18)] space-y-6 text-center select-none overflow-hidden"
        >
          {/* Subtle Ambient Glow inside modal */}
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none" />

          {/* Close X */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container/50 hover:bg-surface-container text-on-surface-variant flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Icon & Title */}
          <div className="space-y-3 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/15 via-primary/10 to-transparent border border-primary/20 flex items-center justify-center mx-auto text-3xl shadow-soft-xs">
              🌿
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/15 inline-block">
                Sanctuary Discovery
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-black text-on-surface tracking-tight leading-tight">
                Let's discover your Sanctuary Score
              </h2>
            </div>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto font-medium">
              Take a few thoughtful moments to understand your current wellness. Your questions are personalized for your journey.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-full bg-primary hover:bg-[#7C6BC4] text-white font-heading font-bold text-xs shadow-[0_10px_25px_rgba(95,78,165,0.25)] hover:shadow-[0_12px_30px_rgba(95,78,165,0.35)] transition-all hover:-translate-y-0.5 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Complete My Sanctuary Score</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full bg-transparent hover:bg-primary/5 text-on-surface-variant font-heading font-semibold text-xs transition-all active:scale-98 cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
