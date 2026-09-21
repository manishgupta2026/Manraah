"use client";

import React, { useState, useEffect } from "react";
import { getClientSession } from "@/backend/auth/client";

interface JournalEntryItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  moodTag: string;
  createdAt: string;
}

const INITIAL_ENTRIES: JournalEntryItem[] = [
  {
    id: "j-1",
    title: "A moment of stillness between meetings",
    content:
      "Today was packed with back-to-back discussions, but I managed to step outside for 10 minutes at lunch. Just feeling the sunlight and focusing on deep breathing brought my heart rate right down. Reminding myself that pause is productive.",
    excerpt:
      "Today was packed with back-to-back discussions, but I managed to step outside for 10 minutes at lunch...",
    moodTag: "Calm",
    createdAt: "Today, 2:30 PM",
  },
  {
    id: "j-2",
    title: "Letting go of perfectionism on the project launch",
    content:
      "I noticed the familiar inner critic whispering that everything must be flawless before showing it. Instead of spiraling, I acknowledged the worry, took three box breaths, and asked: 'Is this good enough to serve the purpose?' It was.",
    excerpt:
      "I noticed the familiar inner critic whispering that everything must be flawless before showing it...",
    moodTag: "Reflective",
    createdAt: "Yesterday, 8:15 PM",
  },
  {
    id: "j-3",
    title: "Deep gratitude for gentle friends",
    content:
      "Had a brief check-in call with a close friend who simply listened without trying to solve everything immediately. Sometimes just being heard is the deepest medicine.",
    excerpt:
      "Had a brief check-in call with a close friend who simply listened without trying to solve everything...",
    moodTag: "Grateful",
    createdAt: "3 days ago",
  },
];

const PROMPT_SUGGESTIONS = [
  "What is one thing that brought me calm today?",
  "A boundary I held with compassion...",
  "What emotion am I ready to gently release?",
  "A small, quiet win worth honoring...",
  "What do I need right now to feel supported?",
];

const MOOD_TAGS = ["Reflective", "Grateful", "Calm", "Overwhelmed", "Hopeful", "Peaceful"];

export default function JournalView() {
  const [entries, setEntries] = useState<JournalEntryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedTag, setSelectedTag] = useState("Reflective");
  const [filterTag, setFilterTag] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeEntryModal, setActiveEntryModal] = useState<JournalEntryItem | null>(null);

  // Load from API on mount only when authenticated
  useEffect(() => {
    const session = getClientSession();
    if (!session?.isAuthenticated || !session?.user?.id) {
      setEntries([]);
      setLoading(false);
      return;
    }

    async function loadEntries() {
      try {
        setLoading(true);
        const res = await fetch("/api/journal");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const formatted = data.map((d: any) => ({
              id: d.id,
              title: d.title,
              content: d.content,
              excerpt: d.excerpt || d.content.substring(0, 100),
              moodTag: d.moodTag || d.mood_tag || "Reflective",
              createdAt: d.createdAt
                ? new Date(d.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recent",
            }));
            setEntries(formatted);
          }
        }
      } catch (err) {
        console.warn("Could not load backend journal entries:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();

    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any | null }>;
      const s = customEvent.detail?.session;
      if (!s?.isAuthenticated || !s?.user?.id) {
        setEntries([]);
      } else {
        loadEntries();
      }
    };

    window.addEventListener("manraah_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("manraah_auth_changed", handleAuthChange);
    };
  }, []);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSaving(true);
    const newEntry: JournalEntryItem = {
      id: `local-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      excerpt:
        newContent.length > 120
          ? newContent.trim().substring(0, 117) + "..."
          : newContent.trim(),
      moodTag: selectedTag,
      createdAt: "Just now",
    };

    // Optimistic UI update
    setEntries((prev) => [newEntry, ...prev]);
    setNewTitle("");
    setNewContent("");

    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEntry.title,
          content: newEntry.content,
          moodTag: newEntry.moodTag,
        }),
      });
    } catch (err) {
      console.warn("Journal entry saved locally only:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries((prev) => prev.filter((item) => item.id !== id));
    if (activeEntryModal?.id === id) {
      setActiveEntryModal(null);
    }
  };

  const filteredEntries = entries.filter((item) => {
    const matchesTag = filterTag === "All" || item.moodTag.toLowerCase() === filterTag.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.moodTag.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
              REFLECTIVE SANCTUARY
            </span>
            <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
              Journal & Reflections
            </h1>
            <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
              A private, unhurried space to process thoughts, celebrate gentle milestones, and record emotional clarity.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-4 py-2 rounded-2xl bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-center">
              <span className="block text-xs font-black text-[#006C56] dark:text-[#00A982]">
                {entries.length}
              </span>
              <span className="text-[10px] font-medium text-[#6B857C] dark:text-[#A9C5BC]">
                Entries
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-center">
              <span className="block text-xs font-black text-[#006C56] dark:text-[#00A982]">
                100%
              </span>
              <span className="text-[10px] font-medium text-[#6B857C] dark:text-[#A9C5BC]">
                Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Search & Quick Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2ECE6] dark:border-[#23483E]">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your journal reflections..."
              className="w-full py-2 pl-9 pr-4 rounded-full bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-[#8EAAA1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {["All", ...MOOD_TAGS].map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterTag === tag
                    ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                    : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#EAF6F0]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Editor Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                New Reflection Entry
              </h2>
              <p className="text-[11px] text-[#6B857C] dark:text-[#A9C5BC]">
                Write freely without judging the flow. What is alive in your mind right now?
              </p>
            </div>
            <span className="text-xs">✍️</span>
          </div>

          <form onSubmit={handleSaveEntry} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#4F685F] dark:text-[#A9C5BC] mb-1">
                Entry Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Give your thought a name (e.g. Unpacking morning tension...)"
                className="w-full py-2.5 px-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#4F685F] dark:text-[#A9C5BC] mb-1">
                Reflection & Thoughts
              </label>
              <textarea
                rows={6}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Describe what you felt, what challenged you, or what you learned about yourself today..."
                className="w-full p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs leading-relaxed text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
              />
            </div>

            {/* Suggested Prompts */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-[#4F685F] dark:text-[#A9C5BC] flex items-center gap-1.5">
                <span>💡</span> Suggested prompts (tap to apply):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      if (!newTitle) setNewTitle(prompt);
                      setNewContent((prev) => (prev ? `${prev}\n\n${prompt} ` : `${prompt} `));
                    }}
                    className="px-2.5 py-1 rounded-xl text-[10.5px] font-medium bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-[#4F685F] dark:text-[#A9C5BC] hover:border-[#006C56]/40 hover:text-[#006C56] dark:hover:text-[#00A982] transition-colors cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Tag & Save Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E2ECE6] dark:border-[#23483E]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-[#4F685F] dark:text-[#A9C5BC] mr-1">
                  Mood:
                </span>
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                      selectedTag === tag
                        ? "bg-[#006C56] text-white shadow-2xs"
                        : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#EAF6F0]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={saving || !newTitle.trim() || !newContent.trim()}
                className="py-2.5 px-6 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-sm shadow-[#006C56]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>{saving ? "Saving..." : "Save Reflection"}</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>

        {/* Past Entries List Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
              Past Reflections ({filteredEntries.length})
            </h2>
            <span className="text-[11px] text-[#6B857C] dark:text-[#A9C5BC] font-medium">
              Filter: {filterTag}
            </span>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#102F27] border border-dashed border-[#D5E3DB] dark:border-[#23483E] text-center space-y-2">
                <span className="text-2xl block">📖</span>
                <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                  No entries found
                </p>
                <p className="text-[11px] text-[#6B857C] dark:text-[#A9C5BC]">
                  Try adjusting your search query or create a new reflection on the left.
                </p>
              </div>
            ) : (
              filteredEntries.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveEntryModal(item)}
                  className="p-5 rounded-3xl bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs hover:border-[#006C56]/40 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8EAAA1] font-medium">
                      {item.createdAt}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10px] font-bold">
                        {item.moodTag}
                      </span>
                      <button
                        onClick={(e) => handleDeleteEntry(item.id, e)}
                        title="Delete entry"
                        className="opacity-0 group-hover:opacity-100 text-[#8EAAA1] hover:text-red-500 text-xs p-1 transition-opacity cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] group-hover:text-[#006C56] dark:group-hover:text-[#00A982] transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC] leading-relaxed line-clamp-2">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Detailed Entry Modal */}
      {activeEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#102F27] rounded-3xl border border-[#E2ECE6] dark:border-[#23483E] shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-xs font-bold">
                {activeEntryModal.moodTag}
              </span>
              <button
                onClick={() => setActiveEntryModal(null)}
                className="w-8 h-8 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1d463a] text-[#4F685F] dark:text-[#A9C5BC] flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[10px] text-[#8EAAA1] font-medium">
                Recorded on {activeEntryModal.createdAt}
              </span>
              <h2 className="text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mt-1">
                {activeEntryModal.title}
              </h2>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] text-xs leading-relaxed text-[#19332A] dark:text-[#F4FAF7] whitespace-pre-line max-h-72 overflow-y-auto">
              {activeEntryModal.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveEntryModal(null)}
                className="px-5 py-2 rounded-full bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] text-xs font-bold cursor-pointer"
              >
                Close Reflection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
