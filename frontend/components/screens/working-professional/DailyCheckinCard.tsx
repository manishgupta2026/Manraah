"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyCheckInCardProps {
  todayCheckin?: any | null;
  onSaveCheckin: (checkinData: any) => Promise<void>;
  onStartReset: () => void;
}

const MOODS = [
  { label: "Good", emoji: "😊", sub: "Content" },
  { label: "Okay", emoji: "🙂", sub: "Managing" },
  { label: "Drained", emoji: "😐", sub: "Low energy" },
  { label: "Stressed", emoji: "😟", sub: "Heavy" },
  { label: "Overwhelmed", emoji: "😣", sub: "Needs space" },
];

export default function DailyCheckInCard({
  todayCheckin,
  onSaveCheckin,
  onStartReset,
}: DailyCheckInCardProps) {
  const [selectedMood, setSelectedMood] = useState<string>(todayCheckin?.mood || "Good");
  const [stress, setStress] = useState<string>(todayCheckin?.stress || "Manageable");
  const [energy, setEnergy] = useState<number>(todayCheckin?.energy || 4);
  const [sleepQuality, setSleepQuality] = useState<number>(todayCheckin?.sleep_quality || todayCheckin?.sleepQuality || 4);
  const [workLifeBalance, setWorkLifeBalance] = useState<number>(todayCheckin?.work_life_balance || todayCheckin?.workLifeBalance || 3);
  const [note, setNote] = useState<string>(todayCheckin?.note || "");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    if (todayCheckin) {
      setSelectedMood(todayCheckin.mood || "Good");
      setStress(todayCheckin.stress || "Manageable");
      setEnergy(Number(todayCheckin.energy) || 4);
      setSleepQuality(Number(todayCheckin.sleep_quality || todayCheckin.sleepQuality) || 4);
      setWorkLifeBalance(Number(todayCheckin.work_life_balance || todayCheckin.workLifeBalance) || 3);
      setNote(todayCheckin.note || "");
    }
  }, [todayCheckin]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveCheckin({
        mood: selectedMood,
        stress,
        energy,
        sleepQuality,
        workLifeBalance,
        note,
      });
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2500);
    } catch (err) {
      console.error("Failed to save checkin:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const isAlreadyCheckedIn = Boolean(todayCheckin);

  const getMoodNote = (mood: string) => {
    switch (mood) {
      case "Good":
        return "Steady energy today. Let's keep that grounded space for your evening.";
      case "Okay":
        return "You're holding things together. Remember small moments of quiet renew your energy.";
      case "Drained":
        return "Your reserves are low after today. Give yourself full permission to slow down and rest.";
      case "Stressed":
        return "Work was demanding today. Let's create space to release the pressure before your evening.";
      case "Overwhelmed":
        return "You made it through a very heavy day. You don't have to carry anything else right now.";
      default:
        return "A gentle 2-minute pause helps leave work where it belongs.";
    }
  };

  return (
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] space-y-4 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#6351A5] dark:text-purple-300">
              sentiment_satisfied
            </span>
            <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
              How are you arriving today?
            </h3>
          </div>
          <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
            {isAlreadyCheckedIn
              ? "✓ You completed today's check-in. Edit anytime below."
              : "Take 30 seconds to tell us how you're feeling after work."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-heading font-semibold text-[#6351A5] hover:text-[#7360B8] flex items-center gap-1 cursor-pointer"
        >
          <span>{isExpanded ? "Less details" : "More details"}</span>
          <span className="material-symbols-outlined text-sm">
            {isExpanded ? "expand_less" : "expand_more"}
          </span>
        </button>
      </div>

      {/* 5 Mood Pills */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.label;
          return (
            <motion.button
              key={m.label}
              type="button"
              onClick={() => setSelectedMood(m.label)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                isSelected
                  ? "bg-[#F3EDFB] dark:bg-purple-900/40 border-[#6351A5] shadow-xs text-[#231E39] dark:text-white ring-2 ring-[#6351A5]/20"
                  : "bg-[#FAF8FE] dark:bg-white/5 border-purple-100/60 dark:border-white/5 text-[#534F64] dark:text-purple-200/80 hover:bg-purple-50/70"
              }`}
            >
              <span className="text-xl sm:text-2xl select-none">{m.emoji}</span>
              <span className="text-[11px] font-heading font-extrabold leading-tight">
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Expanded Sliders (Stress, Energy, Sleep, Work-Life Balance, Note) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-2 overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Stress */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-heading font-bold text-[#231E39] dark:text-white">⚡ Stress</span>
                  <span className="text-[#6351A5] font-semibold text-[11px]">{stress}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {["Peaceful", "Manageable", "Stressful", "Overwhelming"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStress(s)}
                      className={`py-1 px-1 rounded-lg text-[9px] font-medium border text-center transition-all ${
                        stress === s
                          ? "bg-[#6351A5] text-white border-[#6351A5]"
                          : "bg-white dark:bg-white/5 text-[#534F64] border-purple-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-heading font-bold text-[#231E39] dark:text-white">🌿 Energy</span>
                  <span className="text-[#1F7A65] font-semibold text-[11px]">{energy} / 5</span>
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

              {/* Sleep */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-heading font-bold text-[#231E39] dark:text-white">🌙 Rest</span>
                  <span className="text-[#7C6BC4] font-semibold text-[11px]">{sleepQuality} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-[#7C6BC4] cursor-pointer"
                />
              </div>

              {/* Work-Life Balance */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-heading font-bold text-[#231E39] dark:text-white">⚖️ Boundaries</span>
                  <span className="text-[#6351A5] font-semibold text-[11px]">{workLifeBalance} / 5</span>
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
            </div>

            {/* Reflection note input */}
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Optional: A quick thought on today's workday..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#6351A5]/30"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual Guidance Note */}
      <div className="p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5">
        <p className="text-xs text-[#534F64] dark:text-purple-200/80 font-normal leading-relaxed">
          {getMoodNote(selectedMood)}
        </p>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isAlreadyCheckedIn ? "Update today's check-in" : "Save Check-in"}</span>
          )}
        </button>

        <button
          onClick={onStartReset}
          className="text-xs text-[#6351A5] hover:text-[#7360B8] font-heading font-semibold transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Take a 2-Minute Reset →</span>
        </button>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-4 right-4 bg-emerald-800 text-white px-4 py-2 rounded-full text-xs font-heading font-medium shadow-lg flex items-center gap-1.5 z-20"
          >
            <span>✓</span>
            <span>Check-in saved peacefully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
