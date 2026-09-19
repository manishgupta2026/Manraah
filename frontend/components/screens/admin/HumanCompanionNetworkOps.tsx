"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import ListenerCompanionController from "@/frontend/components/screens/human-companion-listener/ListenerCompanionController";

interface CompanionNode {
  id: string;
  name: string;
  email: string;
  status: "ONLINE" | "BUSY" | "OFFLINE" | string;
  role: string;
  joinedDate: string;
}

export default function HumanCompanionNetworkOps() {
  const [activeSection, setActiveSection] = useState<"OVERVIEW" | "LISTENER_CONSOLE">("OVERVIEW");
  const [companions, setCompanions] = useState<CompanionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCompanions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        if (data.team) {
          setCompanions(data.team);
        }
      }
    } catch (err) {
      console.error("Error loading companions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanions();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ONLINE" ? "BUSY" : currentStatus === "BUSY" ? "OFFLINE" : "ONLINE";
    setCompanions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );

    try {
      await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status: nextStatus }),
      });
      showToast(`Updated companion node status to ${nextStatus}.`);
    } catch (err) {
      console.error("Error updating status:", err);
      await loadCompanions();
    }
  };

  const columns: Column<CompanionNode>[] = [
    {
      header: "Peer Listener / Node",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
            {(row.name || row.email || "C")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <span className="text-[10px] text-slate-400 font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 capitalize">
          {row.role}
        </span>
      ),
    },
    {
      header: "Live Node State",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "ONLINE" ? "success" : row.status === "BUSY" ? "warning" : "neutral"}
          pulse={row.status === "ONLINE"}
          size="sm"
        />
      ),
    },
    {
      header: "Joined Date",
      accessor: (row) => <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{row.joinedDate}</span>,
    },
    {
      header: "Status Toggle",
      className: "text-right",
      accessor: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id, row.status)}
          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200/80 active:scale-[0.98] transition-all"
        >
          Set → {row.status === "ONLINE" ? "BUSY" : row.status === "BUSY" ? "OFFLINE" : "ONLINE"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60 w-fit">
        <button
          onClick={() => setActiveSection("OVERVIEW")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            activeSection === "OVERVIEW"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Companion Node Roster
        </button>
        <button
          onClick={() => setActiveSection("LISTENER_CONSOLE")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            activeSection === "LISTENER_CONSOLE"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Active Listener Live Console
        </button>
      </div>

      {activeSection === "OVERVIEW" ? (
        <AdminCard
          title="Human Companion & Peer Listener Network"
          subtitle="Real-time WebRTC node availability and listener dispatch management."
          action={
            <button
              onClick={loadCompanions}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
              <span>Sync Nodes</span>
            </button>
          }
        >
          <AdminTable
            columns={columns}
            data={companions}
            keyExtractor={(row) => row.id}
            loading={loading}
            emptyMessage="No companion nodes found."
            emptySubtitle="Add peer listeners under Team & Role Access."
            emptyIcon="headset_mic"
          />
        </AdminCard>
      ) : (
        <AdminCard
          title="Peer Listener Active Console"
          subtitle="Direct supervisor preview of the companion's operational voice dispatch interface."
        >
          <div className="pt-2">
            <ListenerCompanionController />
          </div>
        </AdminCard>
      )}
    </div>
  );
}
