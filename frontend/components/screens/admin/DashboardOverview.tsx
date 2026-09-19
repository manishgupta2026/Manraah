"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { Skeleton, CardSkeleton } from "@/frontend/components/ui/AdminSkeleton";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
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

  const fetchOverview = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.telemetry) {
          setMetrics(data.telemetry);
          setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }
      }
    } catch (err) {
      console.error("Failed to load admin overview telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6 select-none">
      {/* Executive Hero Banner */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">
              Operations Hub
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Neon PostgreSQL Synchronized</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Platform Operations & Telemetry
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Real-time telemetry across registered members, crisis triage escalation, human companion capacity, and clinician credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-400 hidden sm:inline-block">
              Updated {lastRefreshed}
            </span>
          )}
          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all duration-150"
          >
            <span
              className={`material-symbols-outlined text-sm ${
                refreshing ? "animate-spin text-primary" : "text-slate-500"
              }`}
            >
              sync
            </span>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <StatusBadge label="Operational" variant="success" pulse />
        </div>
      </section>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Registered Members */}
            <Link href="/admin/users" className="block group">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] group-hover:border-primary/50 group-hover:shadow-sm transition-all duration-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Registered Members
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">group</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                    {metrics.totalUsers}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                    Live Neon DB
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-primary font-semibold group-hover:translate-x-0.5 transition-transform duration-150">
                  <span>View Member Directory</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Card 2: Peer Listeners */}
            <Link href="/admin/human-companion-network" className="block group">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] group-hover:border-emerald-500/50 group-hover:shadow-sm transition-all duration-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Peer Listeners Pool
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">record_voice_over</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                    {metrics.activeListeners}
                  </span>
                  <StatusBadge
                    label={`${metrics.activeListeners} Active`}
                    variant="success"
                    size="sm"
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform duration-150">
                  <span>Companion Network Ops</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Card 3: Therapist Roster */}
            <Link href="/admin/verification" className="block group">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] group-hover:border-amber-500/50 group-hover:shadow-sm transition-all duration-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Therapist Roster
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                    {metrics.pendingTherapists}
                  </span>
                  <StatusBadge
                    label="Credentialed"
                    variant="warning"
                    size="sm"
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform duration-150">
                  <span>Verify Credentials</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>

            {/* Card 4: Crisis Escalation */}
            <Link href="/admin/crisis-escalation" className="block group">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] group-hover:border-rose-500/50 group-hover:shadow-sm transition-all duration-150 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Crisis Escalation
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">emergency</span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
                    {metrics.openCrisisFlags}
                  </span>
                  <StatusBadge
                    label={metrics.openCrisisFlags > 0 ? "Action Required" : "Zero Critical"}
                    variant={metrics.openCrisisFlags > 0 ? "error" : "success"}
                    pulse={metrics.openCrisisFlags > 0}
                    size="sm"
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-semibold group-hover:translate-x-0.5 transition-transform duration-150">
                  <span>Emergency Triage Feed</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Analytics & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Telemetry */}
        <AdminCard
          title="Serenity & Mood Telemetry"
          subtitle="Real-time distribution from daily check-in telemetry"
        >
          {loading ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : metrics.moodDistribution && metrics.moodDistribution.length > 0 ? (
            <div className="space-y-4">
              {metrics.moodDistribution.map((item) => (
                <div key={item.mood} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 capitalize">
                      {item.mood}
                    </span>
                    <span className="font-mono text-slate-500 font-medium">
                      {item.count} check-ins ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No mood check-ins recorded yet.
            </p>
          )}
        </AdminCard>

        {/* Member Cohort Categories */}
        <AdminCard
          title="Registered Member Cohorts"
          subtitle="User distribution across demographic segments"
        >
          {loading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : metrics.categories && metrics.categories.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {metrics.categories.map((cat) => (
                <div
                  key={cat.category}
                  className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-slate-800 capitalize">
                      {cat.category.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {cat.count}
                    </span>
                    <span className="text-[11px] text-slate-400">members</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No cohort data available.
            </p>
          )}
        </AdminCard>
      </div>

      {/* Recent User Registrations */}
      <AdminCard
        title="Recently Registered Members"
        subtitle="Latest additions synchronized from Neon PostgreSQL"
        action={
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <span>View All {metrics.totalUsers} Members</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        }
      >
        {loading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : metrics.recentUsers && metrics.recentUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Member</th>
                  <th className="pb-3 px-3">Cohort</th>
                  <th className="pb-3 px-3">Joined</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                          {(u.userTag || u.email || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.userTag}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 capitalize">
                        {u.category || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {u.joinedDate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="px-2.5 py-1 rounded-lg text-primary hover:bg-primary/10 font-semibold text-xs transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            No recent members found.
          </p>
        )}
      </AdminCard>
    </div>
  );
}
