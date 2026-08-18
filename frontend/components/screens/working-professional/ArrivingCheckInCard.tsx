"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ArrivingCheckInCardProps {
  todayMood?: any;
  onSaveCheckin: (payload: {
    mood: string;
    energy: number;
    stress: string;
  }) => Promise<boolean>;
}

const MOODS = [
  { label: "Good", emoji: "😊" },
  { label: "Okay", emoji: "🙂" },
  { label: "Drained", emoji: "😐" },
  { label: "Stressed", emoji: "😟" },
  { label: "Overwhelmed", emoji: "😣" },
];

export default function ArrivingCheckInCard({
  todayMood,
  onSaveCheckin,
}: ArrivingCheckInCardProps) {
  const [selectedMood, setSelectedMood] = useState<string>("Okay");
  const [stressLevel, setStressLevel] = useState<number>(3); // 1-5
  const [energyLevel, setEnergyLevel] = useState<number>(3); // 1-5
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (todayMood) {
      setSelectedMood(todayMood.mood || "Okay");
      setEnergyLevel(Number(todayMood.energy_level || todayMood.energy) || 3);
      const s = todayMood.stress;
      if (s === "Peaceful" || s === "Low") setStressLevel(1);
      else if (s === "Manageable") setStressLevel(2);
      else if (s === "A little stressful") setStressLevel(3);
      else if (s === "Stressful" || s === "High") setStressLevel(4);
      else if (s === "Very overwhelming" || s === "Very High") setStressLevel(5);
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
      default: return "A little stressful";
    }
  };

  const getEnergyLabel = (val: number) => {
    switch (val) {
      case 1: return "Exhausted";
      case 2: return "Low";
      case 3: return "Moderate";
      case 4: return "Good";
      case 5: return "Energized";
      default: return "Moderate";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const ok = await onSaveCheckin({
        mood: selectedMood,
        energy: energyLevel,
        stress: getStressLabel(stressLevel),
      });
      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[28px] bg-white/85 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[360px] space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌸</span>
          <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
            How are you arriving today?
          </h3>
        </div>
        <p className="text-xs text-[#797582] font-normal">
          There's no right answer. Just check in with yourself.
        </p>
      </div>

      {/* 5 Mood Boxes */}
      <div className="grid grid-cols-5 gap-2">
        {MOODS.map((m) => {
          const isSelected = selectedMood.toLowerCase() === m.label.toLowerCase();
          return (
            <motion.button
              key={m.label}
              type="button"
              onClick={() => setSelectedMood(m.label)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F3EEFF] border-[#5F4EA5] text-[#5F4EA5] shadow-xs"
                  : "bg-white/70 border-purple-100/70 text-[#484551] hover:bg-purple-50/40"
              }`}
            >
              <span className="text-xl filter drop-shadow-xs">{m.emoji}</span>
              <span className="text-[10px] font-heading font-extrabold mt-1 truncate">
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Slider 1: Stress */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-bold text-[#1D192B]">How stressed are you?</span>
          <span className="font-heading font-extrabold text-[#5F4EA5]">{getStressLabel(stressLevel)}</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={stressLevel}
          onChange={(e) => setStressLevel(Number(e.target.value))}
          className="w-full h-1.5 bg-[#E6DEFF] rounded-lg appearance-none cursor-pointer accent-[#5F4EA5]"
        />
        <div className="flex justify-between text-[9px] font-bold text-[#797582]">
          <span>Low (Peaceful)</span>
          <span>High (Overwhelming)</span>
        </div>
      </div>

      {/* Slider 2: Energy */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-heading font-bold text-[#1D192B]">How much energy do you have?</span>
          <span className="font-heading font-extrabold text-[#006B56]">{getEnergyLabel(energyLevel)}</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
          className="w-full h-1.5 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-[#006B56]"
        />
        <div className="flex justify-between text-[9px] font-bold text-[#797582]">
          <span>Low (Drained)</span>
          <span>High (Energized)</span>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="pt-2 flex items-center justify-between">
        <AnimatePresence>
          {savedSuccess && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-bold text-emerald-700"
            >
              ✓ Saved peaceful check-in
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSave}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-xs hover:bg-[#7C6BC4] transition-all ml-auto disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <span>Save Check-in</span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
