"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_JOURNAL_ENTRIES } from "@/frontend/lib/mock-data";
import { JournalEntry } from "@/backend/types";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function JournalScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_JOURNAL_ENTRIES);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("Reflective");

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      title: newTitle,
      excerpt: newContent.slice(0, 80) + "...",
      content: newContent,
      moodTag: selectedTag,
      category: "Personal",
    };

    setEntries([entry, ...entries]);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="space-y-8">
      <ScreenHeader title="📖 Journal" showBackButton={true} fallbackRoute="/dashboard" />
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-pale-yellow/40 text-on-surface text-xs font-semibold uppercase tracking-wider">
          Mindful Journaling
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Your Private Reflection Sanctuary</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Write freely, process thoughts, and track your internal growth over time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Form */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
          <h3 className="font-heading font-bold text-xl text-on-surface">New Reflection Entry</h3>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Entry title (e.g. Finding Stillness...)"
              className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-heading font-semibold"
            />
            <textarea
              rows={6}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What thoughts or feelings are present for you right now?"
              className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-on-surface-variant">Mood Tag:</span>
                {["Reflective", "Joyful", "Calm", "Anxious"].map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedTag === tag ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-purple transition-all"
              >
                Save Entry →
              </button>
            </div>
          </form>
        </div>

        {/* Past Entries List */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-lg text-on-surface">Past Entries ({entries.length})</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between text-xs text-on-surface-variant/70">
                  <span>{entry.date}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                    {entry.moodTag}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-base text-on-surface">{entry.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
