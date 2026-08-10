"use client";

import React, { useState } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import ListenerCompanionController from "@/frontend/components/screens/human-companion-listener/ListenerCompanionController";

interface CompanionNode {
  id: string;
  listenerName: string;
  email: string;
  status: "ONLINE" | "IN_SESSION" | "OFFLINE";
  currentSessionUser?: string;
  talkTopic?: string;
  activeDuration?: string;
  rating: number;
}

export default function HumanCompanionNetworkOps() {
  const [activeSection, setActiveSection] = useState<"OVERVIEW" | "LISTENER_CONSOLE">("OVERVIEW");

  const [listeners] = useState<CompanionNode[]>([
    {
      id: "comp-1",
      listenerName: "Dr. Sarah Jenkins",
      email: "sarah@manraah.com",
      status: "ONLINE",
      rating: 4.9,
    },
    {
      id: "comp-2",
      listenerName: "Companion Listener #12",
      email: "listener12@manraah.com",
      status: "IN_SESSION",
      currentSessionUser: "Anonymous Member #582",
      talkTopic: "Academic stress before midterms",
      activeDuration: "12:45 mins",
      rating: 4.8,
    },
    {
      id: "comp-3",
      listenerName: "Companion Listener #08",
      email: "listener08@manraah.com",
      status: "OFFLINE",
      rating: 4.7,
    },
  ]);

  const columns: Column<CompanionNode>[] = [
    {
      header: "Peer Listener",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.listenerName}</p>
          <span className="text-[10px] text-on-surface-variant font-mono">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Availability Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "IN_SESSION" ? "info" : row.status === "ONLINE" ? "success" : "neutral"}
          pulse={row.status === "IN_SESSION"}
        />
      ),
    },
    {
      header: "Current Live Session",
      accessor: (row) => (
        row.currentSessionUser ? (
          <div>
            <p className="font-bold text-primary">{row.currentSessionUser}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">{row.talkTopic}</p>
          </div>
        ) : (
          <span className="text-on-surface-variant font-medium">None (Standby)</span>
        )
      ),
    },
    {
      header: "Session Duration",
      accessor: (row) => <span className="font-mono font-bold text-on-surface">{row.activeDuration || "—"}</span>,
    },
    {
      header: "Rating",
      accessor: (row) => <span className="font-bold text-amber-500">⭐ {row.rating}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Top Section Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift">
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Human Companion Network & Listener Workspace
          </h2>
          <p className="text-xs text-on-surface-variant">
            Monitor network capacity or interact directly using the live companion listener console.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-2xl border border-surface-variant/20">
          <button
            onClick={() => setActiveSection("OVERVIEW")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === "OVERVIEW"
                ? "bg-primary text-white shadow-soft"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            📊 Network Oversight
          </button>
          <button
            onClick={() => setActiveSection("LISTENER_CONSOLE")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === "LISTENER_CONSOLE"
                ? "bg-primary text-white shadow-soft"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            🎧 Live Listener Console
          </button>
        </div>
      </div>

      {activeSection === "OVERVIEW" ? (
        <>
          {/* Network Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminCard title="Online Volunteers" subtitle="Active Peer Listeners">
              <p className="text-2xl font-heading font-bold text-emerald-600">2 Available</p>
            </AdminCard>
            <AdminCard title="Live 1-on-1 Sessions" subtitle="Active Voice & Chat">
              <p className="text-2xl font-heading font-bold text-primary">1 Live Session</p>
            </AdminCard>
            <AdminCard title="Average Wait Time" subtitle="Real-time Queue Speed">
              <p className="text-2xl font-heading font-bold text-on-surface">1m 15s</p>
            </AdminCard>
          </div>

          {/* Aggregate Oversight Table */}
          <AdminCard
            title="Active Companion Listener Nodes"
            subtitle="Executive read-only view monitoring active peer listener nodes, live sessions, and network capacity."
          >
            <AdminTable
              columns={columns}
              data={listeners}
              keyExtractor={(row) => row.id}
            />
          </AdminCard>
        </>
      ) : (
        /* Embedded Interactive Listener Workspace */
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift">
          <div className="mb-6 border-b border-surface-variant/20 pb-4">
            <h3 className="font-heading font-bold text-base text-on-surface">
              Interactive Human Companion Listener Console
            </h3>
            <p className="text-xs text-on-surface-variant">
              Accept live incoming support requests, conduct real-time chat, and start WebRTC voice calls.
            </p>
          </div>
          <ListenerCompanionController />
        </div>
      )}
    </div>
  );
}
