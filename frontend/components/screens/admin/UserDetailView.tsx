"use client";

import React from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

interface UserDetailViewProps {
  userId: string;
}

export default function UserDetailView({ userId }: UserDetailViewProps) {
  const user = {
    id: userId || "usr-101",
    userTag: "Anonymous Member #582",
    email: "aanya@manraah.org",
    category: "Student",
    role: "user",
    serenityScore: 82,
    status: "Active",
    joinedDate: "August 1, 2026",
    mindfulnessMinutes: 180,
    checkInStreak: 14,
    recentMoods: ["Calm", "Reflective", "Joyful", "Anxious", "Calm"],
  };

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
        <StatusBadge label={user.status} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Profile Overview */}
        <AdminCard className="lg:col-span-1 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-bold mx-auto">
              👤
            </div>
            <h2 className="font-heading font-bold text-lg text-on-surface">{user.userTag}</h2>
            <p className="text-xs text-on-surface-variant font-mono">{user.id}</p>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase">
              {user.category} Cohort
            </span>
          </div>

          <div className="pt-4 border-t border-surface-variant/20 space-y-2 text-xs text-on-surface-variant">
            <div className="flex justify-between">
              <span className="font-semibold">Platform Role:</span>
              <span className="font-bold text-on-surface uppercase">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Joined Date:</span>
              <span className="font-bold text-on-surface">{user.joinedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Check-in Streak:</span>
              <span className="font-bold text-emerald-600">{user.checkInStreak} Days 🔥</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Mindfulness Rest:</span>
              <span className="font-bold text-primary">{user.mindfulnessMinutes} Mins</span>
            </div>
          </div>
        </AdminCard>

        {/* Right Details & Activity Audit */}
        <div className="lg:col-span-2 space-y-6">
          <AdminCard title="Privacy-Preserved Serenity Audit" subtitle="Computed Serenity Score Engine">
            <div className="p-4 rounded-2xl bg-surface-container-low flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface">Current Serenity Score</p>
                <p className="text-[11px] text-on-surface-variant">Derived from stress, sleep & support metrics</p>
              </div>
              <span className="text-2xl font-heading font-extrabold text-primary">
                {user.serenityScore} / 100
              </span>
            </div>
          </AdminCard>

          <AdminCard title="Recent Mood Logs" subtitle="Last 5 Reflections">
            <div className="flex items-center gap-2 overflow-x-auto">
              {user.recentMoods.map((mood, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-surface-container-low border border-surface-variant/20 text-center min-w-24">
                  <span className="text-xs font-bold text-on-surface block">{mood}</span>
                  <span className="text-[10px] text-on-surface-variant">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
