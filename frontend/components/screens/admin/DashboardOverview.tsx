"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeListeners: 0,
    pendingTherapists: 0,
    openCrisisFlags: 0,
    avgSerenity: 78,
    totalAssessments: 0,
    totalCheckins: 0,
    categories: [] as any[],
    moodDistribution: [] as any[],
    recentUsers: [] as any[],
    systemStatus: {
      database: "ONLINE",
      socketServer: "ONLINE",
      webrtcPool: "ONLINE",
    },
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.telemetry) {
          setMetrics(data.telemetry);
        }
      }
    } catch (err) {
      console.error("Failed to load admin overview telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-[#5D7052] to-secondary text-white shadow-card-lift flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
              Executive Operations Hub
            </span>
            <span className="text-xs text-white/70">Connected to Neon PostgreSQL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold">
            Platform Operations & Telemetry Overview
          </h1>
          <p className="text-xs text-white/80 max-w-xl">
            Real-time telemetry for registered members, crisis escalation triage, human companion network load, and therapist credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
            Refresh
          </button>
          <StatusBadge label="All Systems Operational" variant="success" pulse />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/users" className="block group">
          <AdminCard title="Registered Members" subtitle="Neon Cloud PostgreSQL" className="group-hover:border-primary/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-extrabold text-on-surface">
                {loading ? "..." : metrics.totalUsers}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">group</span>
              </div>
            </div>
            <p className="text-[11px] text-primary font-semibold mt-2 flex items-center gap-1">
              View User Directory →
            </p>
          </AdminCard>
        </Link>

        <Link href="/admin/human-companion-network" className="block group">
          <AdminCard title="Peer Listeners" subtitle="Companion Users Network" className="group-hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-extrabold text-emerald-600">
                {loading ? "..." : metrics.activeListeners}
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">sensor_occupied</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              Live Console & Voice Pool →
            </p>
          </AdminCard>
        </Link>

        <Link href="/admin/verification" className="block group">
          <AdminCard title="Therapist Roster" subtitle="RCI Credential Queue" className="group-hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-extrabold text-amber-600">
                {loading ? "..." : metrics.pendingTherapists}
              </span>
              <StatusBadge label={`${metrics.pendingTherapists} Verified/Queued`} variant="warning" />
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
              Review Credentials →
            </p>
          </AdminCard>
        </Link>

        <Link href="/admin/crisis-escalation" className="block group">
          <AdminCard title="Crisis Escalation" subtitle="Emergency Triage Feed" className="group-hover:border-rose-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-heading font-extrabold text-rose-600">
                {loading ? "..." : metrics.openCrisisFlags}
              </span>
              <StatusBadge label="Critical Triage" variant="error" pulse />
            </div>
            <p className="text-[11px] text-rose-600 font-semibold mt-2 flex items-center gap-1">
              Active Escalation Queue →
            </p>
          </AdminCard>
        </Link>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard title="Platform Serenity Telemetry" subtitle="Recent Check-ins Mood Distribution">
          <div className="space-y-4">
            {metrics.moodDistribution && metrics.moodDistribution.length > 0 ? (
              metrics.moodDistribution.map((item, idx) => {
                const colors = [
                  "bg-emerald-500",
                  "bg-amber-400",
                  "bg-primary-purple",
                  "bg-rose-400",
                  "bg-sky-400",
                  "bg-teal-400",
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.mood}</span>
                      <span className="text-on-surface-variant font-mono">{item.pct} ({item.count || 0} check-ins)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: item.pct }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-on-surface-variant py-4 text-center">Loading live mood distribution...</p>
            )}
          </div>
        </AdminCard>

        <AdminCard title="Infrastructure & Node Status" subtitle="Real-Time Cloud Diagnostics">
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">database</span>
                  Neon PostgreSQL Serverless
                </p>
                <p className="text-[10px] text-on-surface-variant font-mono">
                  {metrics.totalUsers} Members • {metrics.totalAssessments} Assessments • {metrics.totalCheckins} Check-ins
                </p>
              </div>
              <StatusBadge label="Connected & Synced" variant="success" pulse />
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-emerald-600">hub</span>
                  WebRTC Audio Traversal Node
                </p>
                <p className="text-[10px] text-on-surface-variant font-mono">Google & Twilio STUN/TURN Pool</p>
              </div>
              <StatusBadge label="Operational" variant="success" />
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">security</span>
                  Admin Safety Gateways
                </p>
                <p className="text-[10px] text-on-surface-variant font-mono">Edge Middleware Cookie Guard Active</p>
              </div>
              <StatusBadge label="Protected" variant="info" />
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Recent Registered Users Quick Table */}
      {metrics.recentUsers && metrics.recentUsers.length > 0 && (
        <AdminCard title="Recently Registered Members" subtitle="Live registrations from Neon DB">
          <div className="divide-y divide-surface-variant/20">
            {metrics.recentUsers.map((u: any) => (
              <div key={u.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                    {(u.name || u.email || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{u.name || "Anonymous Member"}</p>
                    <p className="text-[10px] text-on-surface-variant font-mono">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant uppercase">
                    {u.selected_category || "Student"}
                  </span>
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
