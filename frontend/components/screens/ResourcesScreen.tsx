"use client";

import React, { useState } from "react";
import { MOCK_RESOURCES } from "@/frontend/lib/mock-data";

export default function ResourcesScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MOCK_RESOURCES.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Psychoeducation Library
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Resource Library & Articles</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Explore evidence-based guides, mindfulness research, and practical mental health toolkits.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md pt-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles, CBT guides, or sleep science..."
            className="w-full py-3 pl-11 pr-4 rounded-full bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <span className="material-symbols-outlined absolute left-4 top-[18px] text-on-surface-variant/60 text-xl">
            search
          </span>
        </div>
      </div>

      {/* Article Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((res) => (
          <div key={res.id} className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span className="px-3 py-1 rounded-full bg-mint/20 text-secondary font-bold">{res.category}</span>
                <span>{res.readTime}</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-on-surface">{res.title}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{res.summary}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-variant/30 text-xs">
              <span className="text-on-surface-variant font-medium">By {res.author}</span>
              <button className="font-bold text-primary hover:underline">Read Guide →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
