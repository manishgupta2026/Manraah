"use client";

import React from "react";

export default function AdminOverviewTab() {
  const kpis = [
    {
      title: "Total Members",
      value: "1,428",
      change: "+12% this week",
      icon: "group",
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Active Companion Sessions",
      value: "18",
      change: "Live 1-on-1 now",
      icon: "record_voice_over",
      color: "bg-mint/30 text-secondary border-mint/40",
    },
    {
      title: "Avg Serenity Score",
      value: "78 / 100",
      change: "Good platform health",
      icon: "auto_awesome",
      color: "bg-peach/30 text-tertiary border-peach/40",
    },
    {
      title: "Online Listeners",
      value: "14",
      change: "Available to listen",
      icon: "sensor_occupied",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
  ];

  const moodBreakdown = [
    { mood: "Calm & Serene", count: 520, pct: "36%", color: "bg-emerald-500" },
    { mood: "Joyful & Energetic", count: 410, pct: "29%", color: "bg-amber-400" },
    { mood: "Stressed / Overwhelmed", count: 280, pct: "20%", color: "bg-purple-500" },
    { mood: "Anxious & Low Energy", count: 218, pct: "15%", color: "bg-rose-400" },
  ];

  const demographics = [
    { category: "Students", count: 580, badge: "Highest Activity" },
    { category: "Working Professionals", count: 490, badge: "Peak 8 PM - 11 PM" },
    { category: "Parents & Caregivers", count: 210, badge: "High Journal Use" },
    { category: "Senior Citizens", count: 148, badge: "Daily Check-Ins" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-primary via-primary-purple to-secondary text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            Live Platform Operations
          </span>
          <h1 className="text-xl font-heading font-bold">
            Manraah Executive Operations Dashboard
          </h1>
          <p className="text-xs text-white/80">
            Real-time analytics for user serenity trends, peer companion matching, and platform stability.
          </p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold shrink-0">
          ● Neon DB & Socket Engine Synced
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">{kpi.title}</span>
              <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${kpi.color}`}>
                <span className="material-symbols-outlined text-xl">{kpi.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-on-surface">{kpi.value}</p>
              <p className="text-[11px] font-medium text-on-surface-variant/80 mt-0.5">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics & Demographic Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Distribution */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-on-surface">
              Platform Mood Distribution
            </h3>
            <span className="text-xs font-bold text-primary">Last 7 Days</span>
          </div>

          <div className="space-y-4">
            {moodBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-on-surface">
                  <span>{item.mood}</span>
                  <span className="text-on-surface-variant">{item.count} users ({item.pct})</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: item.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographic Breakdown */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-on-surface">
              Demographic Active Cohorts
            </h3>
            <span className="text-xs font-bold text-secondary">4 Categories</span>
          </div>

          <div className="space-y-3">
            {demographics.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/20 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">{item.category}</p>
                  <p className="text-[11px] text-on-surface-variant">{item.count} registered members</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
