"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function DailyCheckInScreen() {
  const [selectedMood, setSelectedMood] = useState<string>("Calm");
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [notes, setNotes] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const moods = [
    { label: "Serene", icon: "filter_vintage", color: "bg-mint/20 text-secondary" },
    { label: "Calm", icon: "spa", color: "bg-primary-container/20 text-primary" },
    { label: "Reflective", icon: "psychology", color: "bg-pale-yellow/40 text-on-surface" },
    { label: "Anxious", icon: "cloud", color: "bg-pink/30 text-tertiary" },
    { label: "Exhausted", icon: "battery_alert", color: "bg-surface-variant text-on-surface-variant" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-8">
      <div className="text-center space-y-2">
        <span className="px-4 py-1.5 rounded-full bg-pink/30 text-tertiary text-xs font-semibold uppercase tracking-wider">
          Daily Mindful Log
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">How are you feeling today?</h1>
        <p className="text-sm text-on-surface-variant">Check in with your mind and body to track your emotional baseline.</p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-8">
          {/* Mood Selector */}
          <div className="space-y-4">
            <label className="block text-sm font-heading font-bold text-on-surface">Select Primary Feeling:</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {moods.map((m) => (
                <button
                  type="button"
                  key={m.label}
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${
                    selectedMood === m.label
                      ? "bg-surface-container-lowest border-primary shadow-md ring-2 ring-primary/30 scale-105"
                      : "bg-surface-container-low border-surface-variant/30 hover:bg-surface-container"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-2xl">{m.icon}</span>
                  </div>
                  <span className="text-xs font-bold text-on-surface">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-heading font-bold text-on-surface">Energy Level:</label>
              <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary-container/20">{energyLevel} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[11px] text-on-surface-variant/70">
              <span>Low Battery</span>
              <span>Balanced</span>
              <span>High Energy</span>
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-2">
            <label className="block text-sm font-heading font-bold text-on-surface">Reflection Note (Optional):</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What contributed to how you feel today?"
              className="w-full p-4 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-105"
          >
            Save Today's Check-in →
          </button>
        </form>
      ) : (
        <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-mint/20 text-secondary mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-on-surface">Check-in Saved!</h2>
            <p className="text-sm text-on-surface-variant">Your mood streak is now updated to 15 Days 🔥.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3.5 rounded-full bg-primary text-white font-semibold text-xs shadow-md"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
