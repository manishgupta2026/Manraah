"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { Skeleton } from "@/frontend/components/ui/AdminSkeleton";

interface UserDetailViewProps {
  userId: string;
}

export default function UserDetailView({ userId }: UserDetailViewProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          } else {
            setError("User record not found in database.");
          }
        } else {
          setError("Failed to fetch user details.");
        }
      } catch (err) {
        console.error("Error loading user:", err);
        setError("Network error retrieving user record.");
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-slate-200/70 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4">
            <Skeleton className="w-16 h-16 rounded-full mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-4 w-44 mx-auto" />
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="py-16 px-6 text-center space-y-4 bg-white rounded-2xl border border-slate-200/80 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-2xl">error</span>
        </div>
        <p className="text-slate-800 font-semibold text-sm">{error || "Member record not found"}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          <span>Return to Member Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin/users" className="hover:text-primary transition-colors">
            Member Directory
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{user.userTag}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            label={user.status}
            variant={user.status === "Active" ? "success" : "warning"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Member Overview Card */}
        <AdminCard className="lg:col-span-1 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xl font-bold mx-auto">
              {(user.userTag || user.email || "U")[0].toUpperCase()}
            </div>
            <h2 className="font-heading font-bold text-lg text-slate-900 tracking-tight">
              {user.userTag}
            </h2>
            <p className="text-xs text-slate-500 font-mono truncate">{user.email}</p>
            <div className="pt-1">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold capitalize inline-block">
                {(user.category || "General").replace("_", " ")} Cohort
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Member ID</span>
              <button
                onClick={copyUserId}
                className="font-mono text-slate-700 text-[11px] hover:text-primary transition-colors flex items-center gap-1"
                title="Click to copy full ID"
              >
                <span>{user.id.slice(0, 12)}...</span>
                <span className="material-symbols-outlined text-xs">
                  {copied ? "check" : "content_copy"}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Role</span>
              <span className="font-semibold text-slate-800 uppercase tracking-wide">
                {user.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Joined</span>
              <span className="font-medium text-slate-700">{user.joinedDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Check-in Streak</span>
              <span className="font-semibold text-amber-600 flex items-center gap-1">
                🔥 {user.checkInStreak} Days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Mindfulness Practice</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                🌿 {user.mindfulnessMinutes} mins
              </span>
            </div>
          </div>
        </AdminCard>

        {/* Right Column: Telemetry & Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wellness Telemetry */}
          <AdminCard
            title="Serenity & Mood Telemetry"
            subtitle="Real-time calculated wellness scoring from daily check-ins"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Calculated Serenity Score
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-heading font-extrabold text-slate-900 tracking-tight font-mono">
                    {user.serenityScore}%
                  </span>
                  <StatusBadge
                    label={
                      user.serenityScore >= 70
                        ? "Optimal"
                        : user.serenityScore >= 50
                        ? "Moderate"
                        : "Elevated"
                    }
                    variant={
                      user.serenityScore >= 70
                        ? "success"
                        : user.serenityScore >= 50
                        ? "warning"
                        : "error"
                    }
                    size="sm"
                  />
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/70 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      user.serenityScore >= 70
                        ? "bg-emerald-500"
                        : user.serenityScore >= 50
                        ? "bg-amber-400"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${user.serenityScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-semibold text-slate-500">
                  Recent Mood Indicators
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {user.recentMoods && user.recentMoods.length > 0 ? (
                    user.recentMoods.map((mood: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 capitalize shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
                      >
                        {mood}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      No check-in moods recorded yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Historical Logs */}
          <AdminCard
            title="Daily Check-Ins & Telemetry Logs"
            subtitle="Synchronized records from daily_checkins table"
          >
            <div className="space-y-3">
              {user.checkins && user.checkins.length > 0 ? (
                user.checkins.slice(0, 6).map((chk: any) => (
                  <div
                    key={chk.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 capitalize">
                          Mood: {chk.mood}
                        </span>
                        {chk.stress && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200/60">
                            Stress: {chk.stress}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Energy Level: {chk.energy_level || 3}/5 • Sleep Quality: {chk.sleep_quality || 3}/5
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {chk.created_at ? new Date(chk.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No check-in logs available for this member.
                </p>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
