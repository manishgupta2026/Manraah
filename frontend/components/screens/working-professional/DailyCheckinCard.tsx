"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyCheckInCardProps {
  todayMood?: any;
  onSaveMood: (mood: string) => Promise<void>;
  onStartReset: () => void;
}

const MOODS = [
  {
    label: "Good",
    emoji: "😊",
    note: "Glad to see you grounded. A small pause helps you protect this peace.",
    color: "border-emerald-200 bg-emerald-50/50 text-emerald-800",
  },
  {
    label: "Okay",
    emoji: "🙂",
    note: "It's okay to feel okay. A small reset can make your evening lighter.",
    color: "border-purple-200 bg-purple-50/50 text-[#5F4EA5]",
  },
  {
    label: "Drained",
    emoji: "😐",
    note: "It's okay to feel drained. Let's make the next two minutes lighter.",
    color: "border-amber-200 bg-amber-50/50 text-amber-800",
  },
  {
    label: "Stressed",
    emoji: "😟",
    note: "Work pressure is heavy today. You are safe here to release it.",
    color: "border-orange-200 bg-orange-50/50 text-orange-800",
  },
  {
    label: "Overwhelmed",
    emoji: "😣",
    note: "Take a gentle breath. You don't have to carry anything else right now.",
    color: "border-rose-200 bg-rose-50/50 text-rose-800",
  },
];

export default function DailyCheckInCard({
  todayMood,
  onSaveMood,
  onStartReset,
}: DailyCheckInCardProps) {
  const [selectedMood, setSelectedMood] = useState<string>(todayMood?.mood || "Okay");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeMoodObj = MOODS.find((m) => m.label.toLowerCase() === selectedMood.toLowerCase()) || MOODS[1];

  const handleSelect = async (label: string) => {
    setSelectedMood(label);
    setIsSaving(true);
    try {
      await onSaveMood(label);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[28px] bg-white/85 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-[#E6DEFF]/80 dark:border-purple-500/20 p-6 sm:p-7 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[340px] space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#5F4EA5]">🪷</span>
          <h3 className="text-base font-heading font-extrabold text-[#1D192B] dark:text-white">
            How are you arriving today?
          </h3>
        </div>
        <p className="text-xs text-[#797582] dark:text-purple-200/70 font-normal">
          There's no right answer. Just check in with yourself.
        </p>
      </div>

      {/* 5 Mood Interactive Cards */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {MOODS.map((m) => {
          const isSelected = selectedMood.toLowerCase() === m.label.toLowerCase();
          return (
            <motion.button
              key={m.label}
              type="button"
              onClick={() => handleSelect(m.label)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`flex flex-col items-center justify-center py-3.5 px-1 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F3EEFF] dark:bg-purple-900/40 border-[#5F4EA5] text-[#5F4EA5] dark:text-purple-200 shadow-xs ring-2 ring-[#5F4EA5]/20 scale-105"
                  : "bg-white/70 dark:bg-white/5 border-purple-100/70 dark:border-white/10 text-[#484551] dark:text-purple-200/80 hover:bg-purple-50/40"
              }`}
            >
              <span className="text-2xl filter drop-shadow-xs">{m.emoji}</span>
              <span className="text-[10px] font-heading font-extrabold mt-1.5 truncate">
                {m.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Contextual Banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMood}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="p-3.5 rounded-2xl bg-[#F7F2FE] dark:bg-purple-950/40 border border-purple-100 dark:border-purple-800/40 text-xs text-[#484551] dark:text-purple-200 font-medium flex items-center gap-2"
        >
          <span className="text-sm shrink-0">💜</span>
          <p className="line-clamp-2 leading-relaxed">
            {activeMoodObj.note}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Single Clear Action */}
      <div className="pt-1 flex justify-end">
        <motion.button
          onClick={onStartReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 rounded-full bg-[#5F4EA5] hover:bg-[#7C6BC4] text-white font-heading font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Begin a 2-Minute Reset →</span>
        </motion.button>
      </div>
    </div>
  );
}
