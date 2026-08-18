"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategoryPersonalization } from "@/frontend/lib/mock-data";
import { JournalEntry } from "@/backend/types";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

export default function JournalScreen() {
  const router = useRouter();
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);
  const featuredPrompts = p.journalPrompts;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("Reflective");

  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch("/api/journal");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((item: any) => ({
              id: item.id,
              date: item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
              title: item.title,
              excerpt: item.excerpt || (item.content ? item.content.substring(0, 80) + "..." : ""),
              content: item.content,
              moodTag: item.mood_tag || item.moodTag || "Reflective",
              category: item.category || "Personal",
            }));
            setEntries(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load journal entries:", err);
      } finally {
        setLoadingEntries(false);
      }
    }
    loadEntries();
  }, []);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          moodTag: selectedTag,
          category: resolvedCategory,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        const newEntry: JournalEntry = {
          id: saved.id || Date.now().toString(),
          date: saved.created_at ? new Date(saved.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          title: saved.title || newTitle.trim(),
          excerpt: saved.excerpt || newContent.slice(0, 80) + "...",
          content: saved.content || newContent.trim(),
          moodTag: saved.mood_tag || selectedTag,
          category: saved.category || resolvedCategory,
        };
        setEntries([newEntry, ...entries]);
        setNewTitle("");
        setNewContent("");
      }
    } catch (err) {
      console.error("Error saving journal entry:", err);
    }
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

            {/* Featured Prompt Chips */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-on-surface-variant">
                💡 Suggested prompts — tap to use:
              </p>
              <div className="flex flex-wrap gap-2">
                {featuredPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setNewContent(prompt)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-surface-container border border-surface-variant/30 text-on-surface-variant hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

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
            {loadingEntries ? (
              <div className="p-6 text-center text-xs text-on-surface-variant/60 animate-pulse">
                Loading your sanctuary journal...
              </div>
            ) : entries.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface-container-lowest border border-dashed border-surface-variant/40 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-primary/60">edit_note</span>
                <p className="text-xs font-bold text-on-surface">No reflection entries yet</p>
                <p className="text-[10px] text-on-surface-variant">Write your first journal entry using the form on the left.</p>
              </div>
            ) : (
              entries.map((entry) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
