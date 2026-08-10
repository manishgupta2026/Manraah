"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { getAICrisisFlags, updateAICrisisStatus, AICrisisFlag } from "@/backend/queries/ai-crisis-flags";
import { getCommunityReports, updateCommunityReportStatus, CommunityReport } from "@/backend/queries/community";

interface UnifiedCrisisFeedItem {
  id: string;
  source: "Human Companion Flag" | "AI Companion Safety" | "Community Moderation Report";
  sourceOrigin: string;
  userTag: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  details: string;
  timestamp: string;
  assignedTo: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
}

export default function CrisisEscalationCenter() {
  const [feed, setFeed] = useState<UnifiedCrisisFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUnifiedCrisisFeed() {
      const [aiFlags, communityReports] = await Promise.all([
        getAICrisisFlags(),
        getCommunityReports(),
      ]);

      const unified: UnifiedCrisisFeedItem[] = [
        // 1. Human Companion PostSessionFlag Submissions
        {
          id: "flag-hc-1",
          source: "Human Companion Flag",
          sourceOrigin: "PostSessionFlag Submission",
          userTag: "Anonymous Member #204",
          severity: "CRITICAL",
          details: "Listener requested immediate supervisor intervention due to severe distress during voice session.",
          timestamp: "5 mins ago",
          assignedTo: "Unassigned",
          status: "OPEN",
        },
        // 2. AI Companion Crisis Detection
        ...aiFlags.map((f) => ({
          id: f.id,
          source: "AI Companion Safety" as const,
          sourceOrigin: `AI Category: ${f.aiGuidelineCategory}`,
          userTag: f.userTag,
          severity: f.severity,
          details: f.triggerMessage,
          timestamp: f.timestamp,
          assignedTo: f.assignedTo || "Unassigned",
          status: f.status,
        })),
        // 3. Community Moderation Safety Reports
        ...communityReports
          .filter((c) => c.isSafetyRelated)
          .map((c) => ({
            id: c.id,
            source: "Community Moderation Report" as const,
            sourceOrigin: `Post: ${c.postTitle}`,
            userTag: c.reportedUser,
            severity: c.severity === "LOW" ? "MEDIUM" : (c.severity as any),
            details: c.reason,
            timestamp: c.timestamp,
            assignedTo: c.assignedTo || "Unassigned",
            status: c.status === "DISMISSED" ? "RESOLVED" : (c.status as any),
          })),
      ];

      setFeed(unified);
      setLoading(false);
    }

    loadUnifiedCrisisFeed();
  }, []);

  const handleAssign = (id: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, assignedTo: "Ashutosh Sahu (Admin)", status: "IN_REVIEW" } : item
      )
    );
  };

  const handleResolve = (id: string) => {
    setFeed((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "RESOLVED" } : item))
    );
  };

  const columns: Column<UnifiedCrisisFeedItem>[] = [
    {
      header: "Origin & Source",
      accessor: (row) => (
        <div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
            row.source === "Human Companion Flag"
              ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
              : row.source === "AI Companion Safety"
              ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
          }`}>
            {row.source}
          </span>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">{row.sourceOrigin}</p>
        </div>
      ),
    },
    {
      header: "Member Tag",
      accessor: (row) => <span className="font-bold text-on-surface">{row.userTag}</span>,
    },
    {
      header: "Severity Level",
      accessor: (row) => (
        <StatusBadge
          label={row.severity}
          variant={row.severity === "CRITICAL" ? "error" : row.severity === "HIGH" ? "warning" : "info"}
          pulse={row.severity === "CRITICAL"}
        />
      ),
    },
    {
      header: "Trigger / Flag Details",
      accessor: (row) => <span className="text-on-surface-variant font-medium max-w-xs block truncate">{row.details}</span>,
    },
    {
      header: "Assignment & Status",
      accessor: (row) => (
        <div>
          <StatusBadge
            label={row.status}
            variant={row.status === "RESOLVED" ? "success" : row.status === "IN_REVIEW" ? "info" : "warning"}
          />
          <p className="text-[10px] text-on-surface-variant font-semibold mt-1">
            Assignee: {row.assignedTo}
          </p>
        </div>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        row.status !== "RESOLVED" ? (
          <div className="flex items-center justify-end gap-2">
            {row.assignedTo === "Unassigned" && (
              <button
                onClick={() => handleAssign(row.id)}
                className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs"
              >
                Assign to Me
              </button>
            )}
            <button
              onClick={() => handleResolve(row.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
            >
              Mark Resolved ✓
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-bold text-emerald-600">✓ Case Closed</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      <AdminCard
        title="Crisis Escalation Center (Unified Triage Feed)"
        subtitle="Consolidated real-time emergency triage merging Human Companion flags, AI safety triggers, and Community safety reports."
      >
        <AdminTable
          columns={columns}
          data={feed}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No open crisis escalation flags."
        />
      </AdminCard>
    </div>
  );
}
