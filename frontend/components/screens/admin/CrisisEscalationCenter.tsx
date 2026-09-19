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

export default function CrisisEscalationCenter() {
  const [feed, setFeed] = useState<UnifiedCrisisFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleUpdateStatus = async (id: string, newStatus: "OPEN" | "IN_REVIEW" | "RESOLVED") => {
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

  const columns: Column<UnifiedCrisisFeedItem>[] = [
    {
      header: "Origin & Severity",
      accessor: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <StatusBadge
              label={row.severity}
              variant={row.severity === "CRITICAL" ? "error" : "warning"}
              pulse={row.severity === "CRITICAL" && row.status !== "RESOLVED"}
            />
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary">
              {row.source}
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant font-mono">{row.sourceOrigin}</p>
        </div>
      ),
    },
    {
      header: "Member Tag",
      accessor: (row) => (
        <span className="font-bold text-xs text-on-surface">{row.userTag}</span>
      ),
    },
    {
      header: "Trigger Details",
      accessor: (row) => (
        <p className="text-xs text-on-surface font-medium max-w-sm line-clamp-2">
          {row.details}
        </p>
      ),
    },
    {
      header: "Timestamp",
      accessor: (row) => (
        <span className="text-xs text-on-surface-variant font-medium">{row.timestamp}</span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status.replace("_", " ")}
          variant={row.status === "RESOLVED" ? "success" : row.status === "IN_REVIEW" ? "info" : "error"}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === "OPEN" && (
            <button
              onClick={() => handleUpdateStatus(row.id, "IN_REVIEW")}
              className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-all"
            >
              Take Case
            </button>
          )}
          {row.status !== "RESOLVED" && (
            <button
              onClick={() => handleUpdateStatus(row.id, "RESOLVED")}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
            >
              Resolve
            </button>
          )}
          {row.status === "RESOLVED" && (
            <span className="text-[11px] text-emerald-600 font-bold">Resolved ✓</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold text-center animate-fadeIn">
          ✓ {toastMessage}
        </div>
      )}

      {/* Triage Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white shadow-card-lift flex items-center justify-between">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-widest">
            24/7 Clinical Safety Protocols
          </span>
          <h2 className="text-xl font-heading font-extrabold mt-1">Crisis Escalation Center</h2>
          <p className="text-xs text-white/90 max-w-xl">
            Live triage signals from high-distress user check-ins and human companion voice sessions. Tele-MANAS (14416) emergency protocols ready.
          </p>
        </div>
        <StatusBadge label="Protocols Active" variant="info" pulse />
      </div>

      {/* Escalation Feed Table */}
      <AdminCard
        title="Active Escalation Queue"
        subtitle="Priority incidents requiring supervisor intervention or crisis escalation."
      >
        <AdminTable
          columns={columns}
          data={feed}
          loading={loading}
          emptyMessage="No open crisis flags. All member check-ins within baseline safety parameters."
        />
      </AdminCard>
    </div>
  );
}
