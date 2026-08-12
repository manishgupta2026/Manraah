"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyCheckinCardProps {
  todayMood: any | null;
  onSaveCheckin: (payload: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
  }) => Promise<boolean>;
}

const MOOD_OPTIONS = [
  { label: "Good", emoji: "😊", sub: "Clear & Grounded", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  { label: "Okay", emoji: "🙂", sub: "Steady pace", color: "bg-sky-500/10 text-sky-700 border-sky-200" },
  { label: "Drained", emoji: "😐", sub: "Running low", color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  { label: "Stressed", emoji: "😟", sub: "Workload pressure", color: "bg-orange-500/10 text-orange-700 border-orange-200" },
  { label: "Overwhelmed", emoji: "😣", sub: "Need space", color: "bg-rose-500/10 text-rose-700 border-rose-200" },
];

export default function DailyCheckinCard({
  todayMood,
  onSaveCheckin,
}: DailyCheckinCardProps) {
  const [selectedMood, setSelectedMood] = useState<string>("Okay");
  const [stressLevel, setStressLevel] = useState<number>(3); // 1 = Low, 5 = High
  const [energyLevel, setEnergyLevel] = useState<number>(3); // 1 = Low, 5 = High
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync state if todayMood exists
  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood || "Okay");
      setEnergyLevel(Number(todayMood.energy_level || todayMood.energy) || 3);
      const s = todayMood.stress;
      if (s === "Low" || s === "Peaceful") setStressLevel(1);
      else if (s === "Moderate" || s === "Manageable") setStressLevel(2);
      else if (s === "A little stressful") setStressLevel(3);
      else if (s === "Stressful" || s === "High") setStressLevel(4);
      else if (s === "Very High" || s === "Very overwhelming") setStressLevel(5);
      else setStressLevel(3);
    }
  }, [todayMood]);

  const getStressLabel = (val: number) => {
    switch (val) {
      case 1: return "Peaceful";
      case 2: return "Manageable";
      case 3: return "A little stressful";
      case 4: return "Stressful";
      case 5: return "Very overwhelming";
      default: return "Manageable";
    }
  };

  const getEnergyLabel = (val: number) => {
    switch (val) {
      case 1: return "Exhausted";
      case 2: return "Low";
      case 3: return "Moderate";
      case 4: return "Good";
      case 5: return "Vibrant";
      default: return "Moderate";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const stressString = getStressLabel(stressLevel);
      const success = await onSaveCheckin({
        mood: selectedMood,
        energy: energyLevel,
        stress: stressString,
      });
      if (success) {
        setSaveSuccess(true);
        setIsEditing(false);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isCheckedIn = Boolean(todayMood) && !isEditing;

  return (
    <div className="rounded-[32px] bg-white/75 backdrop-blur-xl border border-purple-100/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between">
      {/* Soft corner glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-purple-100/40 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              How are you arriving today?
            </h3>
          </div>
          {isCheckedIn && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Checked In
            </span>
          )}
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          There's no right answer. Just check in with yourself.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isCheckedIn ? (
          /* ================= Summary View when already checked in ================= */
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="py-4 space-y-4 relative z-10"
          >
            <div className="p-4 rounded-2xl bg-[#F7F1FF]/80 border border-purple-100/60 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl filter drop-shadow-xs">
                  {MOOD_OPTIONS.find((m) => m.label.toLowerCase() === todayMood?.mood?.toLowerCase())?.emoji || "🌸"}
                </span>
                <div>
                  <p className="text-xs font-bold text-[#5F4EA5] uppercase tracking-wider">Logged for Today</p>
                  <h4 className="text-base font-heading font-extrabold text-[#1D192B]">
                    Feeling {todayMood?.mood || selectedMood}
                  </h4>
                  <p className="text-[11px] text-[#484551]">
                    Stress: <span className="font-bold">{todayMood?.stress || getStressLabel(stressLevel)}</span> • Energy: <span className="font-bold">{getEnergyLabel(Number(todayMood?.energy_level || todayMood?.energy) || energyLevel)}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-full bg-white text-[#5F4EA5] border border-purple-200/60 text-xs font-bold hover:bg-purple-50 transition-all cursor-pointer shadow-xs"
              >
                Update
              </button>
            </div>

            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs text-center font-medium"
              >
                🌿 Check-in saved. Thank you for giving yourself this moment.
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* ================= Interactive Form ================= */
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSubmit}
            className="py-4 space-y-5 relative z-10"
          >
            {/* Quick Mood Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#484551] uppercase tracking-wider">
                Select your current mood
              </label>
              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map((opt) => {
                  const isSelected = selectedMood.toLowerCase() === opt.label.toLowerCase();
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedMood(opt.label)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-[#E6DEFF] border-[#5F4EA5] text-[#5F4EA5] shadow-xs scale-105"
                          : "bg-white/60 border-purple-100/60 text-[#484551] hover:bg-purple-50/50"
                      }`}
                    >
                      <span className="text-2xl filter drop-shadow-xs">{opt.emoji}</span>
                      <span className="text-[10px] font-bold mt-1 text-center truncate max-w-full">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider 1: Stress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1D192B]">How stressed are you?</span>
                <span className="font-bold text-[#5F4EA5]">{getStressLabel(stressLevel)}</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-[#5F4EA5]"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#797582]">
                <span>Low (Peaceful)</span>
                <span>High (Overwhelming)</span>
              </div>
            </div>

            {/* Slider 2: Energy */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-[#1D192B]">How much energy do you have?</span>
                <span className="font-bold text-[#006B56]">{getEnergyLabel(energyLevel)}</span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-[#006B56]"
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#797582]">
                <span>Low (Drained)</span>
                <span>High (Energized)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-[#797582] hover:text-[#1D192B] transition-colors"
                >
                  Cancel
                </button>
              )}
              <motion.button
                type="submit"
                disabled={isSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2.5 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-md hover:bg-[#7C6BC4] transition-all ml-auto disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Check-in</span>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
