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
      header: "Peer Listener / Companion",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-700 text-xs">
            {(row.name || row.email || "C")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-on-surface">{row.name}</p>
            <span className="text-[10px] text-on-surface-variant font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Platform Role",
      accessor: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface capitalize">
          {row.role}
        </span>
      ),
    },
    {
      header: "Live Node Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "ONLINE" ? "success" : row.status === "BUSY" ? "warning" : "neutral"}
          pulse={row.status === "ONLINE"}
        />
      ),
    },
    {
      header: "Joined Date",
      accessor: (row) => <span className="text-xs text-on-surface-variant font-medium">{row.joinedDate}</span>,
    },
    {
      header: "Status Toggle",
      accessor: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id, row.status)}
          className="px-3 py-1 rounded-xl bg-surface-container-low hover:bg-surface-container text-xs font-bold text-on-surface border border-surface-variant/30 transition-all"
        >
          Toggle → {row.status === "ONLINE" ? "BUSY" : row.status === "BUSY" ? "OFFLINE" : "ONLINE"}
        </button>
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

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface-container-low border border-surface-variant/20 w-fit">
        <button
          onClick={() => setActiveSection("OVERVIEW")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "OVERVIEW"
              ? "bg-surface-container-lowest text-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Network Roster & Nodes
        </button>
        <button
          onClick={() => setActiveSection("LISTENER_CONSOLE")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === "LISTENER_CONSOLE"
              ? "bg-surface-container-lowest text-primary shadow-xs"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Live Listener Console Test
        </button>
      </div>

      {activeSection === "OVERVIEW" ? (
        <div className="space-y-6">
          {/* Real-time Infrastructure Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminCard title="Online Listeners" subtitle="Ready to accept queue">
              <span className="text-3xl font-heading font-extrabold text-emerald-600">
                {companions.filter((c) => c.status === "ONLINE").length}
              </span>
            </AdminCard>

            <AdminCard title="In Active Session" subtitle="Audio / Chat ongoing">
              <span className="text-3xl font-heading font-extrabold text-amber-600">
                {companions.filter((c) => c.status === "BUSY").length}
              </span>
            </AdminCard>

            <AdminCard title="Total Companion Staff" subtitle="Registered in Neon DB">
              <span className="text-3xl font-heading font-extrabold text-primary">
                {companions.length}
              </span>
            </AdminCard>
          </div>

          {/* Active Nodes Table */}
          <AdminCard
            title="Companion Nodes & Live Listener Roster"
            subtitle="Real-time capacity and presence synchronized with companion_users table in PostgreSQL."
          >
            <AdminTable
              columns={columns}
              data={companions}
              loading={loading}
              emptyMessage="No companion nodes found."
            />
          </AdminCard>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs text-on-surface-variant flex items-center justify-between">
            <span>
              <strong>Peer Listener Live Preview:</strong> Test the volunteer console interface, accept sessions, and verify WebRTC audio signaling.
            </span>
            <button
              onClick={() => setActiveSection("OVERVIEW")}
              className="text-primary font-bold hover:underline"
            >
              ← Back to Ops Roster
            </button>
          </div>
          <ListenerCompanionController />
        </div>
      )}
    </div>
  );
}
