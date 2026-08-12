"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkdayJournalCardProps {
  initialContent?: string;
  onSaveReflection: (content: string) => Promise<boolean>;
}

export default function WorkdayJournalCard({
  initialContent = "",
  onSaveReflection,
}: WorkdayJournalCardProps) {
  const [content, setContent] = useState<string>(initialContent);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const ok = await onSaveReflection(content.trim());
      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[28px] bg-white/85 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-[#E6DEFF]/80 dark:border-purple-500/20 p-6 shadow-[0_6px_24px_rgba(95,78,165,0.03)] flex flex-col justify-between min-h-[280px] space-y-3">
      {/* Header */}
      <div className="space-y-0.5">
        <h3 className="text-base font-heading font-extrabold text-[#1D192B] dark:text-white">
          Leave the workday here.
        </h3>
        <p className="text-xs text-[#797582] dark:text-purple-200/70 font-normal leading-tight">
          What's something you'd like to let go of before tonight?
        </p>
      </div>

      {/* Textarea Form */}
      <form onSubmit={handleSubmit} className="space-y-3 flex-1 flex flex-col justify-between">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write whatever is on your mind..."
          className="w-full p-3.5 rounded-2xl bg-[#FAF8FF] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs text-[#1D192B] dark:text-white placeholder:text-[#797582]/60 dark:placeholder:text-purple-200/40 focus:outline-none focus:ring-1.5 focus:ring-[#5F4EA5]/40 focus:border-[#5F4EA5] resize-none transition-all flex-1"
        />

        {/* Footer & Action */}
        <div className="flex items-center justify-between pt-0.5">
          <AnimatePresence>
            {savedSuccess ? (
              <motion.span
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300"
              >
                ✓ Saved to encrypted journal
              </motion.span>
            ) : (
              <span className="text-[10px] text-[#797582] dark:text-purple-200/60 font-medium">
                🔒 Private &amp; encrypted
              </span>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={isSaving || !content.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2 rounded-full bg-[#5F4EA5] hover:bg-[#7C6BC4] text-white font-heading font-bold text-xs shadow-xs transition-all ml-auto disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            {isSaving ? "Saving..." : "Save Reflection"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
