"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WorkdayReflectionCardProps {
  initialReflection?: string;
  onSaveReflection: (content: string) => Promise<boolean>;
}

export default function WorkdayReflectionCard({
  initialReflection = "",
  onSaveReflection,
}: WorkdayReflectionCardProps) {
  const [content, setContent] = useState<string>(initialReflection);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const ok = await onSaveReflection(content.trim());
      if (ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-[32px] bg-white/75 backdrop-blur-xl border border-purple-100/70 p-6 md:p-7 shadow-[0_8px_30px_rgba(95,78,165,0.04)] relative overflow-hidden flex flex-col justify-between">
      {/* Background Soft Glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-purple-100/30 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="text-base font-heading font-extrabold text-[#1D192B]">
              Leave the workday here.
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F4EA5] bg-[#E6DEFF]/60 px-2.5 py-0.5 rounded-full border border-purple-200/50">
            Closure
          </span>
        </div>
        <p className="text-xs text-[#484551]/80 font-normal">
          What's something you'd like to let go of before tonight?
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="py-4 space-y-3 relative z-10">
        <div className="relative">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write whatever is on your mind... an unfinished email, a challenging meeting, or just a deep breath..."
            className="w-full p-4 rounded-2xl bg-[#FAF8FF] border border-purple-100/80 text-xs sm:text-sm text-[#1D192B] placeholder:text-[#797582]/60 focus:outline-none focus:ring-2 focus:ring-[#5F4EA5]/30 focus:border-[#5F4EA5] resize-none transition-all"
          />
        </div>

        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs text-center font-medium"
            >
              🌿 Reflection released into your private sanctuary.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#797582] font-semibold">
            {content.length > 0 ? `${content.length} characters` : "Encrypted & Private"}
          </span>

          <motion.button
            type="submit"
            disabled={isSaving || !content.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-full bg-[#5F4EA5] text-white font-heading font-bold text-xs shadow-sm hover:bg-[#7C6BC4] transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Reflection</span>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
