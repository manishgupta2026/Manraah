"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

interface UnifiedCrisisFeedItem {
  id: string;
  source: string;
  sourceOrigin: string;
  userTag: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  details: string;
  timestamp: string;
  assignedTo: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
}

const FILTER_TABS = [
  { key: "ALL", label: "All Signals" },
  { key: "OPEN", label: "Open Triage" },
  { key: "IN_REVIEW", label: "In Review" },
  { key: "RESOLVED", label: "Resolved" },
];

export default function CrisisEscalationCenter() {
  const [feed, setFeed] = useState<UnifiedCrisisFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCrisisFeed = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/crisis");
      if (res.ok) {
        const data = await res.json();
        if (data.feed) {
          setFeed(data.feed);
        }
      }
    } catch (err) {
      console.error("Error loading crisis feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrisisFeed();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    newStatus: "OPEN" | "IN_REVIEW" | "RESOLVED"
  ) => {
    setFeed((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await fetch("/api/admin/crisis", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      showToast(`Crisis flag marked as ${newStatus.replace("_", " ")}.`);
    } catch (err) {
      console.error("Error updating crisis status:", err);
    }
  };

  const filteredFeed = feed.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const openCriticalCount = feed.filter(
    (item) => item.status === "OPEN" && item.severity === "CRITICAL"
  ).length;

  const columns: Column<UnifiedCrisisFeedItem>[] = [
    {
      header: "Severity & Source",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <StatusBadge
              label={row.severity}
              variant={row.severity === "CRITICAL" ? "error" : "warning"}
              pulse={row.severity === "CRITICAL" && row.status !== "RESOLVED"}
              size="sm"
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {row.source}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">{row.sourceOrigin}</p>
        </div>
      ),
    },
    {
      header: "Member Tag",
      accessor: (row) => (
        <span className="font-semibold text-xs text-slate-900">{row.userTag}</span>
      ),
    },
    {
      header: "Trigger Details",
      accessor: (row) => (
        <p className="text-xs text-slate-700 font-normal max-w-sm line-clamp-2 leading-relaxed">
          {row.details}
        </p>
      ),
    },
    {
      header: "Timestamp",
      accessor: (row) => (
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {row.timestamp}
        </span>
      ),
    },
    {
      header: "Case Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status.replace("_", " ")}
          variant={
            row.status === "RESOLVED"
              ? "success"
              : row.status === "IN_REVIEW"
              ? "info"
              : "error"
          }
          size="sm"
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === "OPEN" && (
            <button
              onClick={() => handleUpdateStatus(row.id, "IN_REVIEW")}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-semibold active:scale-[0.98] transition-all duration-150"
            >
              Take Case
            </button>
          )}
          {row.status !== "RESOLVED" && (
            <button
              onClick={() => handleUpdateStatus(row.id, "RESOLVED")}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-semibold active:scale-[0.98] transition-all duration-150"
            >
              Resolve
            </button>
          )}
          {row.status === "RESOLVED" && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Resolved</span>
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Critical Alert Banner if open critical items exist */}
      {openCriticalCount > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-600 text-xl">
              warning
            </span>
            <div>
              <p className="text-xs font-bold text-rose-900">
                {openCriticalCount} Critical Triage Signal{openCriticalCount > 1 ? "s" : ""} Requiring Immediate Review
              </p>
              <p className="text-[11px] text-rose-700">
                Signals originated from self-reported severe distress in daily check-ins or automated keyword flags.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("OPEN")}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            Filter Open
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <AdminCard
        title="Unified Crisis Escalation Triage Feed"
        subtitle="Monitors self-reported high distress check-ins, keywords, and peer listener safety escalations."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadCrisisFeed}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>Sync Feed</span>
            </button>
          </div>
        }
      >
        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                statusFilter === tab.key
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab.label}
              {tab.key === "OPEN" && openCriticalCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                  {openCriticalCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Crisis Feed Table */}
        <AdminTable
          columns={columns}
          data={filteredFeed}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No crisis escalation records found."
          emptySubtitle="All clear. No safety signals or critical check-ins require intervention."
          emptyIcon="verified"
        />
      </AdminCard>
    </div>
  );
}
