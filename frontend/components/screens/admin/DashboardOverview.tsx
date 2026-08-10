"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState({
    totalUsers: 1428,
    activeListeners: 14,
    pendingTherapists: 2,
    openCrisisFlags: 3,
    avgSerenity: 78,
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary-purple to-secondary text-white shadow-card-lift flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
            Executive Control Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">
            Platform Operations & Telemetry Overview
          </h1>
          <p className="text-xs text-white/80 max-w-xl">
            Real-time analytics for user serenity indexes, crisis escalation feeds, companion network load, and team role oversight.
          </p>
        </div>
        <StatusBadge label="All Systems Operational" variant="success" pulse />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard title="Registered Members" subtitle="Active Neon DB Users">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-on-surface">{metrics.totalUsers}</span>
            <span className="material-symbols-outlined text-primary text-2xl">group</span>
          </div>
        </AdminCard>

        <AdminCard title="Online Peer Listeners" subtitle="Human Companion Network">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-emerald-600">{metrics.activeListeners}</span>
            <span className="material-symbols-outlined text-emerald-500 text-2xl">sensor_occupied</span>
          </div>
        </AdminCard>

        <AdminCard title="Pending Therapists" subtitle="RCI Credential Queue">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-amber-600">{metrics.pendingTherapists}</span>
            <StatusBadge label="2 Pending" variant="warning" />
          </div>
        </AdminCard>

        <AdminCard title="Open Crisis Flags" subtitle="Emergency Triage Feed">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-heading font-bold text-rose-600">{metrics.openCrisisFlags}</span>
            <StatusBadge label="Critical" variant="error" pulse />
          </div>
        </AdminCard>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard title="Platform Serenity Telemetry" subtitle="Last 7 Days Mood Distribution">
          <div className="space-y-4">
            {[
              { mood: "Calm & Serene", pct: "36%", color: "bg-emerald-500" },
              { mood: "Joyful & Energetic", pct: "29%", color: "bg-amber-400" },
              { mood: "Stressed / Overwhelmed", pct: "20%", color: "bg-purple-500" },
              { mood: "Anxious & Low Energy", pct: "15%", color: "bg-rose-400" },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{item.mood}</span>
                  <span className="text-on-surface-variant">{item.pct}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Infrastructure & Socket Telemetry" subtitle="Real-Time Node Health">
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface">VPS Socket Server</p>
                <p className="text-[10px] text-on-surface-variant font-mono">https://tradesagaai.duckdns.org</p>
              </div>
              <StatusBadge label="Connected" variant="success" pulse />
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface">Neon PostgreSQL Cloud DB</p>
                <p className="text-[10px] text-on-surface-variant font-mono">sslmode=require</p>
              </div>
              <StatusBadge label="Synced" variant="success" />
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface">STUN/TURN Voice Traversal Pool</p>
                <p className="text-[10px] text-on-surface-variant font-mono">Google, Mozilla, Twilio</p>
              </div>
              <StatusBadge label="7 Active Nodes" variant="info" />
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
