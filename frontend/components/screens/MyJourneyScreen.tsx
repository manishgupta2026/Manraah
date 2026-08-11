"use client";

import React, { useState, useEffect } from "react";
import { getCategoryPersonalization } from "@/frontend/lib/mock-data";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

export default function MyJourneyScreen() {
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const [userProfile, setUserProfile] = useState<any>(session?.user || null);
  const [moodHistory, setMoodHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const s = getClientSession();
    if (s.user) {
      setUserProfile(s.user);
    }
  }, []);

  useEffect(() => {
    async function loadMoodHistory() {
      try {
        const res = await fetch("/api/mood/weekly");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMoodHistory(data);
          }
        }
      } catch (err) {
        console.error("Failed to load mood history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadMoodHistory();
  }, []);

  const streakDays = userProfile?.streakDays || 1;
  const mindfulnessMinutes = userProfile?.mindfulnessMinutes || 0;

  return (
    <div className="space-y-8 select-none animate-fadeIn">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-mint/20 text-secondary text-xs font-semibold uppercase tracking-wider">
          {p.badgeLabel}
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">
          {p.journeyTitle}
        </h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          {p.journeySubtitle}
        </p>
      </div>

      {/* Progress Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 text-center">
          <span className="material-symbols-outlined text-4xl text-primary">local_fire_department</span>
          <h3 className="text-2xl font-bold text-on-surface">{streakDays} {streakDays === 1 ? "Day" : "Days"}</h3>
          <p className="text-xs text-on-surface-variant">{p.streakLabel}</p>
        </div>
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary">self_improvement</span>
          <h3 className="text-2xl font-bold text-on-surface">{mindfulnessMinutes} mins</h3>
          <p className="text-xs text-on-surface-variant">{p.activityLabel}</p>
        </div>
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 text-center">
          <span className="material-symbols-outlined text-4xl text-tertiary">mood</span>
          <h3 className="text-2xl font-bold text-on-surface">Active</h3>
          <p className="text-xs text-on-surface-variant">{p.scoreLabel}</p>
        </div>
      </div>

      {/* Mood History Chart */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
        <h3 className="font-heading font-bold text-xl text-on-surface">
          {p.chartHeading}
        </h3>

        {loadingHistory ? (
          <div className="p-8 text-center text-xs text-on-surface-variant/60 animate-pulse">
            Loading your emotional baseline...
          </div>
        ) : moodHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low border border-dashed border-surface-variant/40 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-primary/60">show_chart</span>
            <p className="text-xs font-bold text-on-surface">No Check-in History Yet</p>
            <p className="text-[10px] text-on-surface-variant">Log your first daily check-in to start tracking your emotional baseline.</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-4 h-48 pt-8 px-4 border-b border-surface-variant/30">
            {moodHistory.map((item, idx) => {
              const score = item.score || item.energy || 5;
              const heightPercent = Math.min(100, Math.max(10, score * 10));
              const label = item.day || item.date || `Day ${idx + 1}`;
              const moodName = item.mood || "Calm";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-on-surface text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap">
                    {moodName} ({score}/10)
                  </div>
                  <div
                    className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-primary to-primary-purple transition-all duration-500 hover:opacity-80"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
