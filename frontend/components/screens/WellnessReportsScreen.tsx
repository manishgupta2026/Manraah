"use client";

import React from "react";
import { MOCK_USER, getCategoryPersonalization } from "@/frontend/lib/mock-data";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

export default function WellnessReportsScreen() {
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const handleExport = () => {
    alert("Exporting PDF report...");
  };

  return (
    <div className="space-y-8">
      <ScreenHeader
        title="📊 Wellness Reports"
        showBackButton={true}
        fallbackRoute="/dashboard"
        action={{ label: "Export PDF", onClick: handleExport }}
      />
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
              Clinical Wellness Insights
            </span>
            <h1 className="text-3xl font-heading font-bold text-on-surface mt-2">
              {p.reportTitle}
            </h1>
            <p className="text-sm text-on-surface-variant">Generated for {session?.user?.sanctuaryName || session?.user?.name || "Sanctuary Member"} • August 2026</p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-mint/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">analytics</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-on-surface">
            {p.report1Heading}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {p.report1Body}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-peach/30 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">psychology_alt</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-on-surface">
            {p.report2Heading}
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {p.report2Body}
          </p>
        </div>
      </div>
    </div>
  );
}
