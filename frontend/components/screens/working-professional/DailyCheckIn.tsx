"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyCheckInProps {
  todayMood?: any;
  onSaveMood: (mood: string) => Promise<void>;
  onStartReset: () => void;
}

const MOODS = [
  {
    label: "Good",
    emoji: "😊",
    note: "Glad to see your spirit bright. Let's maintain that steady calm.",
    color: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-200",
    activeText: "text-emerald-800",
  },
  {
    label: "Okay",
    emoji: "🙂",
    note: "Holding your ground. A quiet moment can help you ease into the evening.",
    color: "from-purple-500/10 to-indigo-500/5",
    border: "border-purple-200",
    activeText: "text-[#5F4EA5]",
  },
  {
    label: "Drained",
    emoji: "😐",
    note: "Your energy is running low. Let's make the next few minutes gentle and quiet.",
    color: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-200",
    activeText: "text-amber-800",
  },
  {
    label: "Stressed",
    emoji: "😟",
    note: "You've been carrying a lot today. Let's make the next two minutes lighter.",
    color: "from-orange-500/10 to-rose-500/5",
    border: "border-orange-200",
    activeText: "text-orange-800",
  },
  {
    label: "Overwhelmed",
    emoji: "😣",
    note: "Everything feels loud right now. You are safe here to drop your shoulders and breathe.",
    color: "from-rose-500/10 to-pink-500/5",
    border: "border-rose-200",
    activeText: "text-rose-800",
  },
];

export default function DailyCheckIn({
  todayMood,
  onSaveMood,
  onStartReset,
}: DailyCheckInProps) {
  const initialSelected = todayMood?.mood || "Okay";
  const [selectedMood, setSelectedMood] = useState<string>(initialSelected);

  const activeMoodObj = MOODS.find((m) => m.label.toLowerCase() === selectedMood.toLowerCase()) || MOODS[1];

  const handleSelect = async (label: string) => {
    setSelectedMood(label);
    await onSaveMood(label);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      className={`relative rounded-[28px] bg-gradient-to-br ${activeMoodObj.color} bg-white/80 backdrop-blur-xl border border-[#E6DEFF]/80 p-6 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] transition-colors duration-500 overflow-hidden`}
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-heading font-black text-[#1D192B]">
            How are you arriving today?
          </h3>
          <p className="text-xs sm:text-sm text-[#484551]/80 font-normal">
            There's no right answer. Just check in with yourself.
          </p>
        </div>

        {/* 5 Simple Interactive Mood Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3.5">
          {MOODS.map((m) => {
            const isSelected = selectedMood.toLowerCase() === m.label.toLowerCase();
            return (
              <motion.button
                key={m.label}
                type="button"
                onClick={() => handleSelect(m.label)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? `bg-white ${m.border} shadow-sm ring-2 ring-[#5F4EA5]/20 scale-105`
                    : "bg-white/50 border-purple-100/50 hover:bg-white/80 hover:border-purple-200"
                }`}
              >
                <span className="text-2xl sm:text-3xl filter drop-shadow-xs">{m.emoji}</span>
                <span className={`text-xs font-heading font-extrabold mt-2 ${isSelected ? m.activeText : "text-[#484551]"}`}>
                  {m.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Contextual Response Note & Single Direct Action */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMood}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-purple-100/50"
          >
            <p className="text-xs sm:text-sm text-[#484551] font-medium leading-relaxed max-w-lg">
              "{activeMoodObj.note}"
            </p>

            <motion.button
              onClick={onStartReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-xs hover:bg-[#7C6BC4] transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Begin a 2-Minute Reset →</span>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
