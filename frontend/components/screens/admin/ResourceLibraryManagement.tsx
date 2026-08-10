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
  const [resources, setResources] = useState<ResourceItem[]>([
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

  const columns: Column<ResourceItem>[] = [
    {
      header: "Resource Title & Format",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.title}</p>
          <span className="text-[10px] text-primary font-semibold">{row.type}</span>
        </div>
      ),
    },
    {
      header: "Category Tag",
      accessor: (row) => <span className="font-semibold text-on-surface-variant">{row.category}</span>,
    },
    {
      header: "Duration / Format",
      accessor: (row) => <span className="font-semibold text-on-surface">{row.duration}</span>,
    },
    {
      header: "Author / Practitioner",
      accessor: (row) => <span className="text-on-surface-variant font-medium">{row.author}</span>,
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge label={row.status} variant="success" />,
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <button
          onClick={() => alert(`Previewing resource: ${row.title}`)}
          className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-white font-bold transition-all text-xs"
        >
          Preview Resource
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminCard
        title="Resource Library & Audio Content Manager"
        subtitle="Manage psychoeducation articles, guided meditations, and sleep soundscapes."
      >
        <AdminTable
          columns={columns}
          data={resources}
          keyExtractor={(row) => row.id}
        />
      </AdminCard>
    </div>
  );
}
