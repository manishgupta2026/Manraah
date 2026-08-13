"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyPrivacyReminder() {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check local storage for shown status today
    const shownDate = localStorage.getItem("manraah_privacy_reminder_shown");
    const today = new Date().toDateString();

    if (shownDate === today) return;

    // Start a 60 seconds (60000ms) timer
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("manraah_privacy_reminder_shown", today);
    }, 60000);

    return () => clearTimeout(timer);
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus primary button when opened
    setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 100);

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll(
          'button, [tabindex="0"]'
        );
        if (focusable.length === 0) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleFocusTrap);
    return () => window.removeEventListener("keydown", handleFocusTrap);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const shiftGradientStyle = {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(243, 244, 255, 0.92))",
    backgroundSize: "200% 200%",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-[5px] select-none"
        >
          {/* Glassmorphic Modal Card */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { type: "spring", stiffness: 100, damping: 15 }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              y: 15,
              transition: { duration: 0.25 }
            }}
            // Float gently effect
            style={shiftGradientStyle}
            className="w-full max-w-md rounded-[32px] border border-white/70 shadow-[0_20px_50px_rgba(124,107,196,0.15)] p-8 relative overflow-hidden text-center backdrop-blur-xl flex flex-col items-center gap-6"
          >
            {/* Pulsing Animated Border Ring */}
            <div className="absolute inset-0 border-[2px] border-transparent rounded-[32px] pointer-events-none after:content-[''] after:absolute after:inset-[-2px] after:rounded-[32px] after:border-2 after:border-primary/20 after:animate-pulse" />

            {/* Glowing Lotus Illustration */}
            <div className="w-16 h-16 rounded-3xl bg-primary-container/20 flex items-center justify-center text-primary relative shadow-inner shrink-0 mt-2">
              <span className="material-symbols-outlined text-4xl animate-pulse">filter_vintage</span>
              <div className="absolute inset-0 bg-primary/10 rounded-3xl filter blur-md animate-ping pointer-events-none" />
            </div>

            {/* Ambient Upward Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [120, -100],
                    x: [0, (i % 2 === 0 ? 30 : -30) * Math.random(), 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 6 + Math.random() * 5,
                    repeat: Infinity,
                    delay: i * 1.5,
                  }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary/20"
                  style={{
                    left: `${15 + i * 14}%`,
                    bottom: "-10px",
                  }}
                />
              ))}
            </div>

            {/* Main Content */}
            <div className="space-y-3 z-10">
              <h2 className="text-2xl font-heading font-black text-on-surface leading-tight">
                🌿 Your Retreat is Private
              </h2>
              <p className="text-sm font-medium text-on-surface-variant/90 leading-relaxed max-w-sm">
                Everything you write, journal, and share inside Manraah remains private. This is your personal space to reflect honestly and safely.
              </p>
            </div>

            {/* Footer with lock */}
            <div className="z-10 py-1.5 px-4 rounded-full bg-primary-container/10 border border-primary/10 text-xs font-bold text-primary flex items-center gap-1.5">
              <span>🔒 Your wellbeing belongs to you.</span>
            </div>

            {/* Primary Action Button */}
            <button
              ref={primaryButtonRef}
              onClick={handleClose}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-102 hover:scale-105 active:scale-98 z-10 focus:outline-none focus:ring-4 focus:ring-primary/45"
            >
              I Understand 💜
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
