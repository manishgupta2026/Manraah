"use client";

import React, { useState } from "react";

interface ContentItem {
  id: string;
  type: "Meditation" | "Sleep Soundscape" | "Article";
  title: string;
  category: string;
  duration: string;
  status: "Published" | "Draft";
  plays: number;
}

export default function ContentManagementTab() {
  const [activeType, setActiveType] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Stress Release");

  const [contentList, setContentList] = useState<ContentItem[]>([
    {
      id: "cnt_1",
      type: "Meditation",
      title: "10-Min Evening Anxiety Release",
      category: "Stress Release",
      duration: "10 min",
      status: "Published",
      plays: 1420,
    },
    {
      id: "cnt_2",
      type: "Sleep Soundscape",
      title: "Himalayan Rain & Ocean Drift",
      category: "Sleep Support",
      duration: "45 min",
      status: "Published",
      plays: 3100,
    },
    {
      id: "cnt_3",
      type: "Article",
      title: "Navigating Workplace Burnout as a Student",
      category: "Academic Stress",
      duration: "4 min read",
      status: "Published",
      plays: 890,
    },
    {
      id: "cnt_4",
      type: "Meditation",
      title: "Parenting Mindfulness Breathwork",
      category: "Parenting",
      duration: "8 min",
      status: "Draft",
      plays: 0,
    },
  ]);

  const filteredContent = contentList.filter(
    (item) => activeType === "ALL" || item.type === activeType
  );

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ContentItem = {
      id: `cnt_${Date.now()}`,
      type: activeType === "ALL" ? "Meditation" : (activeType as any),
      title: newTitle,
      category: newCategory,
      duration: "10 min",
      status: "Published",
      plays: 0,
    };

    setContentList([newItem, ...contentList]);
    setNewTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Wellness Content & Audio Library Manager
          </h2>
          <p className="text-xs text-on-surface-variant">
            Manage guided meditations, ambient sleep soundscapes, and psychoeducation articles.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-soft transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add New Content
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["ALL", "Meditation", "Sleep Soundscape", "Article"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeType === t
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-surface-container-lowest text-on-surface-variant border-surface-variant/30 hover:border-primary/40"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-variant/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="pb-3 px-3">Title & Type</th>
              <th className="pb-3 px-3">Category Tag</th>
              <th className="pb-3 px-3">Duration / Format</th>
              <th className="pb-3 px-3">Total Plays / Reads</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10 text-xs">
            {filteredContent.map((item) => (
              <tr key={item.id} className="hover:bg-surface-container-low/50 transition-all">
                <td className="py-3.5 px-3 font-bold text-on-surface">
                  {item.title}
                  <span className="block text-[10px] font-semibold text-primary">{item.type}</span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant font-medium">
                  {item.category}
                </td>
                <td className="py-3.5 px-3 font-semibold text-on-surface">
                  {item.duration}
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant font-semibold">
                  {item.plays.toLocaleString()}
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.status === "Published"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    ● {item.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => alert(`Previewing content: ${item.title}`)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-white text-on-surface font-bold transition-all text-xs"
                  >
                    Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddContent}
            className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft-xl max-w-md w-full space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
              <h3 className="font-heading font-bold text-base text-on-surface">
                Add New Wellness Resource
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-on-surface block mb-1">Content Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Deep Rest Sleep Soundscape"
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="font-bold text-on-surface block mb-1">Category Tag</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="Stress Release">Stress Release</option>
                  <option value="Sleep Support">Sleep Support</option>
                  <option value="Academic Stress">Academic Stress</option>
                  <option value="Parenting">Parenting</option>
                  <option value="Senior Serenity">Senior Serenity</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs"
              >
                Publish Content
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
