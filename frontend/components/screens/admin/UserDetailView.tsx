"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

interface UserDetailViewProps {
  userId: string;
}

export default function UserDetailView({ userId }: UserDetailViewProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-on-surface-variant animate-pulse space-y-2">
        <span className="material-symbols-outlined text-3xl text-primary animate-spin">sync</span>
        <p>Loading member profile and historical logs from database...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-600 font-bold text-sm">{error || "Member not found"}</p>
        <Link href="/admin/users" className="text-xs text-primary font-bold hover:underline">
          ← Back to Users Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Top Header Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          ← Back to User Directory
        </Link>
        <StatusBadge label={user.status} variant={user.status === "Active" ? "success" : "warning"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Overview */}
        <AdminCard className="lg:col-span-1 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold mx-auto">
              👤
            </div>
            <h2 className="font-heading font-bold text-lg text-on-surface">{user.userTag}</h2>
            <p className="text-xs text-on-surface-variant font-mono">{user.email}</p>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase inline-block">
              {user.category} Cohort
            </span>
          </div>

          <div className="pt-4 border-t border-surface-variant/20 space-y-2 text-xs text-on-surface-variant">
            <div className="flex justify-between">
              <span className="font-semibold">User ID:</span>
              <span className="font-mono text-on-surface text-[10px] truncate max-w-[160px]">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Platform Role:</span>
              <span className="font-bold text-on-surface uppercase">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Joined Date:</span>
              <span className="font-medium text-on-surface">{user.joinedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Check-in Streak:</span>
              <span className="font-bold text-amber-600">🔥 {user.checkInStreak} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Mindfulness Time:</span>
              <span className="font-bold text-emerald-600">🌿 {user.mindfulnessMinutes} Mins</span>
            </div>
          </div>
        </AdminCard>

        {/* Right Details Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wellness Telemetry */}
          <AdminCard title="Wellness & Assessment Status" subtitle="Calculated Serenity Scoring">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low space-y-1">
                <span className="text-xs text-on-surface-variant font-semibold">Latest Wellness Score</span>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-heading font-extrabold text-primary">
                    {user.serenityScore}%
                  </span>
                  <StatusBadge
                    label={user.serenityScore >= 70 ? "Optimal" : user.serenityScore >= 50 ? "Moderate" : "Elevated Stress"}
                    variant={user.serenityScore >= 70 ? "success" : user.serenityScore >= 50 ? "warning" : "error"}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low space-y-2">
                <span className="text-xs text-on-surface-variant font-semibold">Recent Mood Indicators</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {user.recentMoods && user.recentMoods.length > 0 ? (
                    user.recentMoods.map((mood: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-xs font-bold text-on-surface">
                        {mood}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-on-surface-variant">No check-in moods recorded yet</span>
                  )}
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Historical Activity Logs from Database */}
          <AdminCard title="Daily Check-Ins & Assessment Records" subtitle="Synchronized from Neon DB tables">
            <div className="space-y-3">
              {user.checkins && user.checkins.length > 0 ? (
                user.checkins.slice(0, 5).map((chk: any) => (
                  <div key={chk.id} className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-on-surface">Mood: {chk.mood}</p>
                      <p className="text-[11px] text-on-surface-variant">
                        Energy: {chk.energy_level}/5 • Sleep: {chk.sleep_quality}/5 • Stress: {chk.stress || 'Normal'}
                      </p>
                      {chk.note && <p className="text-[11px] text-primary mt-0.5 italic">"{chk.note}"</p>}
                    </div>
                    <span className="text-[10px] text-outline font-mono">
                      {chk.created_at ? new Date(chk.created_at).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant">
                  No previous check-in records found. User is currently active in onboarding.
                </div>
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
