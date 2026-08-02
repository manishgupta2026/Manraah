"use client";

import React from "react";
import { MOCK_USER, MOCK_MOOD_HISTORY } from "@/frontend/lib/mock-data";

export default function MyJourneyScreen() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-mint/20 text-secondary text-xs font-semibold uppercase tracking-wider">
          Personal Growth Analytics
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">My Journey & Wellness Milestones</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Track your emotional consistency, mindfulness streaks, and completed sanctuary goals.
        </p>
      </div>

      {/* Progress Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 text-center">
          <span className="material-symbols-outlined text-4xl text-primary">local_fire_department</span>
          <h3 className="text-2xl font-bold text-on-surface">{MOCK_USER.streakDays} Days</h3>
          <p className="text-xs text-on-surface-variant">Active Check-in Streak</p>
        </div>
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary">self_improvement</span>
          <h3 className="text-2xl font-bold text-on-surface">{MOCK_USER.mindfulnessMinutes} mins</h3>
          <p className="text-xs text-on-surface-variant">Total Meditation Time</p>
        </div>
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-2 text-center">
          <span className="material-symbols-outlined text-4xl text-tertiary">mood</span>
          <h3 className="text-2xl font-bold text-on-surface">78 / 100</h3>
          <p className="text-xs text-on-surface-variant">Current Serenity Score</p>
        </div>
      </div>

      {/* Mood History Chart Simulation */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
        <h3 className="font-heading font-bold text-xl text-on-surface">7-Day Emotional Baseline</h3>

        <div className="flex items-end justify-between gap-4 h-48 pt-8 px-4 border-b border-surface-variant/30">
          {MOCK_MOOD_HISTORY.map((item) => {
            const heightPercent = item.score * 10;
            return (
              <div key={item.id} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-on-surface text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap">
                  {item.mood} ({item.score}/10)
                </div>
                <div
                  className="w-full max-w-[40px] rounded-t-xl bg-gradient-to-t from-primary to-primary-purple transition-all duration-500 hover:opacity-80"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-semibold text-on-surface-variant">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
