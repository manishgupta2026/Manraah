"use client";

import React, { useState } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { MOCK_RESOURCES } from "@/frontend/lib/mock-data";

interface ResourceItem {
  id: string;
  type: "Article" | "Meditation" | "Sleep Soundscape";
  title: string;
  category: string;
  duration: string;
  author: string;
  status: "Published" | "Draft";
}

export default function ResourceLibraryManagement() {
  const [filter, setFilter] = useState("ALL");
  const [selectedPreview, setSelectedPreview] = useState<ResourceItem | null>(null);

  const [resources] = useState<ResourceItem[]>([
    ...MOCK_RESOURCES.map((r) => ({
      id: r.id,
      type: "Article" as const,
      title: r.title,
      category: r.category,
      duration: r.readTime,
      author: r.author,
      status: "Published" as const,
    })),
    {
      id: "med-1",
      type: "Meditation",
      title: "10-Minute Morning Calm & Grounding Breath",
      category: "Mindfulness",
      duration: "10 min audio",
      author: "Dr. Sarah Jenkins",
      status: "Published",
    },
    {
      id: "snd-1",
      type: "Sleep Soundscape",
      title: "Himalayan Forest Rain & Ocean Frequencies",
      category: "Sleep & Rest",
      duration: "45 min audio",
      author: "Manraah Sound Sanctuary",
      status: "Published",
    },
  ]);

  const filteredResources = resources.filter((r) => {
    if (filter === "ALL") return true;
    return r.type === filter;
  });

  const columns: Column<ResourceItem>[] = [
    {
      header: "Title & Content Format",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-base shrink-0">
            {row.type === "Article" ? "📄" : row.type === "Meditation" ? "🧘" : "🌧️"}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <span className="text-[10px] text-slate-500 font-medium">{row.type}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
          {row.category}
        </span>
      ),
    },
    {
      header: "Duration",
      accessor: (row) => (
        <span className="font-medium text-xs text-slate-700">{row.duration}</span>
      ),
    },
    {
      header: "Author / Practitioner",
      accessor: (row) => (
        <span className="text-slate-500 text-xs font-medium">{row.author}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge label={row.status} variant="success" size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <button
          onClick={() => setSelectedPreview(row)}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-semibold active:scale-[0.98] transition-all"
        >
          Preview
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      <AdminCard
        title="Resource Library & Audio Content Manager"
        subtitle="Manage psychoeducation articles, guided meditations, and sleep soundscape frequencies."
        action={
          <div className="flex items-center gap-1.5">
            {["ALL", "Article", "Meditation", "Sleep Soundscape"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  filter === f
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {f === "ALL" ? "All Resources" : f}
              </button>
            ))}
          </div>
        }
      >
        <AdminTable
          columns={columns}
          data={filteredResources}
          keyExtractor={(row) => row.id}
          emptyMessage="No resources found."
          emptySubtitle="No content matches the selected format filter."
          emptyIcon="library_books"
        />
      </AdminCard>

      {/* Resource Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                {selectedPreview.type}
              </span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                {selectedPreview.title}
              </h3>
              <p className="text-xs text-slate-500">
                By {selectedPreview.author} • Category: {selectedPreview.category} • {selectedPreview.duration}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                This psychoeducational resource is published to the Manraah mobile & desktop web sanctuary for registered members.
              </p>
              <p className="font-medium text-slate-800">
                Status: Published & Verified by Clinical Advisory
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
