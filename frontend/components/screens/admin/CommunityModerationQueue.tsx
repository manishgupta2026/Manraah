"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { getCommunityReports, updateCommunityReportStatus, CommunityReport } from "@/backend/queries/community";

export default function CommunityModerationQueue() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      const data = await getCommunityReports();
      setReports(data);
      setLoading(false);
    }
    loadReports();
  }, []);

  const handleResolve = async (id: string) => {
    await updateCommunityReportStatus(id, "RESOLVED", "Admin Moderator");
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)));
  };

  const columns: Column<CommunityReport>[] = [
    {
      header: "Post / Discussion Title",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.postTitle}</p>
          <span className="text-[10px] text-on-surface-variant font-mono">ID: {row.postId}</span>
        </div>
      ),
    },
    {
      header: "Reported Member",
      accessor: (row) => <span className="font-semibold text-on-surface">{row.reportedUser}</span>,
    },
    {
      header: "Reason & Notes",
      accessor: (row) => <span className="text-on-surface-variant font-medium">{row.reason}</span>,
    },
    {
      header: "Severity & Tag",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge
            label={row.severity}
            variant={row.severity === "CRITICAL" ? "error" : row.severity === "HIGH" ? "warning" : "info"}
          />
          {row.isSafetyRelated && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-extrabold border border-rose-500/20">
              SAFETY FLAG
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "RESOLVED" ? "success" : "warning"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        row.status === "OPEN" ? (
          <button
            onClick={() => handleResolve(row.id)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all text-xs"
          >
            Resolve Flag ✓
          </button>
        ) : (
          <span className="text-[11px] text-emerald-600 font-bold">Resolved</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminCard
        title="Community Moderation & Safety Queue"
        subtitle="Review community posts, safety flags, and member reports."
      >
        <AdminTable
          columns={columns}
          data={reports}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No community flags pending review."
        />
      </AdminCard>
    </div>
  );
}
