"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellness } from "@/frontend/lib/context/WellnessContext";

const MOOD_OPTIONS = [
  { id: "Happy", label: "Happy / Great", emoji: "😊", color: "from-amber-400/20 to-emerald-400/20" },
  { id: "Calm", label: "Calm / Peaceful", emoji: "😌", color: "from-emerald-400/20 to-teal-400/20" },
  { id: "Neutral", label: "Okay / Neutral", emoji: "😐", color: "from-slate-400/20 to-zinc-400/20" },
  { id: "Anxious", label: "Anxious", emoji: "😟", color: "from-violet-400/20 to-indigo-400/20" },
  { id: "Sad", label: "Low / Sad", emoji: "😔", color: "from-blue-400/20 to-cyan-400/20" },
  { id: "Stressed", label: "Stressed", emoji: "😤", color: "from-rose-400/20 to-orange-400/20" },
  { id: "Tired", label: "Tired", emoji: "😴", color: "from-purple-400/20 to-blue-400/20" },
  { id: "Motivated", label: "Motivated", emoji: "💪", color: "from-orange-400/20 to-amber-400/20" },
];

export default function DailyCheckInModal() {
  const {
    isCheckInModalOpen,
    closeCheckInModal,
    submitCheckIn,
    hasCheckedInToday,
  } = useWellness();

  const [selectedMood, setSelectedMood] = useState<string>("Calm");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCheckInModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood) {
      setErrorMessage("Please select your current mood.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await submitCheckIn({
        mood: selectedMood,
        note: note.trim(),
        reflection: note.trim(),
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        closeCheckInModal();
      }, 1200);
    } catch (err: any) {
      console.error("Failed to submit daily check-in:", err);
      setErrorMessage(err.message || "Failed to submit check-in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-xl shadow-xs">
              ✦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Today&apos;s Mood Check-In
              </h2>
              <p className="text-[11.5px] text-[#789389] dark:text-[#78958C] font-medium">
                Take a brief moment to check in with yourself.
              </p>
            </div>
          </div>
          <button
            onClick={closeCheckInModal}
            className="w-8 h-8 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] flex items-center justify-center hover:bg-[#E2ECE6] dark:hover:bg-[#1A483C] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-[#006C56] text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-[#006C56]/20">
                ✓
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Check-In Complete!
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium">
                  Your mood has been logged and your streak is updated.
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006C56] dark:text-[#00A982]">
                  Daily Check-In
                </span>
                <h3 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mt-0.5">
                  How are you feeling right now?
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
                  Select the mood that best resonates with your current state.
                </p>
              </div>

              {/* 8 Large Emoji Buttons with Spring Animation & Glow */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <motion.button
                      key={mood.id}
                      type="button"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => setSelectedMood(mood.id)}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer select-none relative overflow-hidden ${
                        isSelected
                          ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#008968] dark:border-[#00A982] shadow-lg shadow-[#008968]/15 ring-2 ring-[#008968]/30 dark:ring-[#00A982]/30"
                          : "bg-[#F8FCFA] dark:bg-[#0E2A23] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#008968]/50 dark:hover:border-[#00A982]/50 hover:bg-[#F2FAF6] dark:hover:bg-[#13352B]"
                      }`}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow-xs">
                        {mood.emoji}
                      </span>
                      <span
                        className={`text-[11px] font-bold leading-tight text-center ${
                          isSelected
                            ? "text-[#006C56] dark:text-[#00A982] font-black"
                            : "text-[#19332A] dark:text-[#F4FAF7]"
                        }`}
                      >
                        {mood.label}
                      </span>

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#006C56] text-white flex items-center justify-center text-[8px] font-bold">
                          ✓
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Optional Note / Reflection Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                  Add a note or reflection (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What is contributing to how you feel today? (e.g., restful sleep, busy workday, relaxing walk)"
                  rows={2}
                  maxLength={300}
                  className="w-full p-3 text-xs rounded-xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#789389] dark:placeholder:text-[#78958C] focus:outline-none focus:border-[#008968] dark:focus:border-[#00A982] resize-none"
                />
              </div>

              {errorMessage && (
                <p className="text-xs font-bold text-red-500 dark:text-red-400">
                  {errorMessage}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2ECE6] dark:border-[#23483E]">
                <button
                  type="button"
                  onClick={closeCheckInModal}
                  className="px-4 py-2.5 rounded-xl bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] text-[#4F685F] dark:text-[#A9C5BC] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold transition-all shadow-md shadow-[#006C56]/20 cursor-pointer flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Check-In</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
