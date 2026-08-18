"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface WorkdayJournalCardProps {
  recentReflections?: any[];
  onReflectionSaved?: () => void;
}

export default function WorkdayJournalCard({
  recentReflections = [],
  onReflectionSaved,
}: WorkdayJournalCardProps) {
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          title: "Workday Decompression",
          moodTag: "Reflective",
          category: "Workday Decompression",
        }),
      });

      if (res.ok) {
        setContent("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2500);
        if (onReflectionSaved) {
          onReflectionSaved();
        }
      }
    } catch (err) {
      console.error("Failed to save reflection:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="rounded-[32px] bg-white/90 dark:bg-[#1E1933]/90 backdrop-blur-xl border border-purple-100/60 dark:border-purple-500/20 p-7 sm:p-8 shadow-[0_8px_30px_rgba(95,78,165,0.03)] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-[#6351A5]">edit_note</span>
            <h3 className="text-base font-heading font-extrabold text-[#231E39] dark:text-white">
              Workday Reflection
            </h3>
          </div>
          <p className="text-xs text-[#746F89] dark:text-purple-200/70 font-normal">
            Leave what happened at work on paper.
          </p>
        </div>

        <Link
          href="/journal"
          className="text-xs font-heading font-semibold text-[#6351A5] hover:text-[#7360B8] flex items-center gap-1"
        >
          <span>Open Journal</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {/* Quick Input Form */}
      <form onSubmit={handleSave} className="space-y-2 pt-1">
        <div className="relative">
          <textarea
            rows={2}
            placeholder="How was your day? Write a quick thought to clear your mind..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/10 text-xs text-[#231E39] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6351A5]/30 resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#746F89]">
            {showSuccess ? "✓ Reflection saved peacefully." : "Private & encrypted."}
          </span>
          <button
            type="submit"
            disabled={isSaving || !content.trim()}
            className="px-5 py-2 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {isSaving ? "Saving..." : "Save Reflection"}
          </button>
        </div>
      </form>

      {/* Recent Reflections List or Empty State */}
      <div className="pt-2 space-y-2">
        <div className="text-[11px] font-heading font-bold text-[#746F89] dark:text-purple-200/60">
          Recent Reflections
        </div>

        {recentReflections && recentReflections.length > 0 ? (
          <div className="space-y-2">
            {recentReflections.slice(0, 2).map((refl: any) => (
              <div
                key={refl.id}
                className="p-3 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100/60 dark:border-white/5 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-[#746F89]">
                  <span className="font-heading font-semibold text-[#6351A5] bg-purple-100/60 px-2 py-0.5 rounded-md">
                    {refl.mood_tag || "Reflective"}
                  </span>
                  <span>{formatDate(refl.created_at)}</span>
                </div>
                <p className="text-xs text-[#231E39] dark:text-white/90 line-clamp-2 leading-relaxed">
                  "{refl.content || refl.excerpt}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-dashed border-purple-100/80 text-center space-y-1">
            <p className="text-xs font-heading font-medium text-[#231E39] dark:text-white">
              No reflections yet today.
            </p>
            <p className="text-[11px] text-[#746F89]">
              Take 60 seconds to release a thought before your evening begins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
