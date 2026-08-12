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
  },
  {
    label: "Okay",
    emoji: "🙂",
    note: "It's okay to feel okay. A small reset can make your evening lighter.",
  },
  {
    label: "Drained",
    emoji: "😐",
    note: "It's okay to feel drained. Let's make the next two minutes lighter.",
  },
  {
    label: "Stressed",
    emoji: "😟",
    note: "Work has felt heavy today. You are safe here to let it go.",
  },
  {
    label: "Overwhelmed",
    emoji: "😣",
    note: "Take a gentle breath. You don't have to carry anything else right now.",
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
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[340px] space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-lg text-[#6351A5]">🪷</span>
          <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
            How are you arriving today?
          </h3>
        </div>
        <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
          There's no right answer. Just check in with yourself.
        </p>
      </div>

      {/* 5 Mood Interactive Cards */}
      <div className="grid grid-cols-5 gap-2.5 pt-1">
        {MOODS.map((m) => {
          const isSelected = selectedMood.toLowerCase() === m.label.toLowerCase();
          return (
            <motion.button
              key={m.label}
              type="button"
              onClick={() => handleSelect(m.label)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-col items-center justify-center py-3.5 px-1 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-[#F4EEFC] dark:bg-purple-900/40 border-[#6351A5]/50 text-[#6351A5] dark:text-purple-200 shadow-2xs ring-2 ring-[#6351A5]/15"
                  : "bg-[#FCFBFE] dark:bg-white/5 border-purple-100/50 dark:border-white/5 text-[#534F64] dark:text-purple-200/80 hover:bg-[#F7F2FD]"
              }`}
            >
              <span className="text-2xl filter drop-shadow-2xs">{m.emoji}</span>
              <span className="text-[10px] font-heading font-bold mt-1.5 truncate">
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
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.25 }}
          className="p-3.5 rounded-2xl bg-[#FAF7FD] dark:bg-purple-950/30 border border-purple-100/60 dark:border-purple-800/30 text-xs text-[#534F64] dark:text-purple-200 font-medium flex items-center gap-2.5"
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
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="px-6 py-2.5 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs shadow-[0_3px_12px_rgba(99,81,165,0.18)] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Begin a 2-Minute Reset →</span>
        </motion.button>
      </div>
    </div>
  );
}
