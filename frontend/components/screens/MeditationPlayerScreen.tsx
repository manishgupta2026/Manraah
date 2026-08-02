"use client";

import React, { useState } from "react";

export default function MeditationPlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const tracks = [
    { title: "Mindful Morning Awakening", duration: "10 mins", category: "Focus" },
    { title: "Exam Stress & Anxiety Release", duration: "15 mins", category: "Calm" },
    { title: "Deep Evening Body Scan", duration: "20 mins", category: "Rest" },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft text-center space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-mint/20 text-secondary text-xs font-semibold uppercase tracking-wider">
          Mindfulness Sanctuary
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Guided Meditation Player</h1>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto">
          Immerse yourself in gentle audio journeys, breathing prompts, and restorative focus tracks.
        </p>
      </div>

      {/* Main Player Card */}
      <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container border border-surface-variant/40 shadow-soft text-center space-y-8">
        <div className="relative w-44 h-44 mx-auto rounded-full bg-primary-container/20 border-4 border-primary/30 flex items-center justify-center shadow-inner">
          <span className={`material-symbols-outlined text-6xl text-primary ${isPlaying ? "animate-pulse" : ""}`}>
            self_improvement
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold text-on-surface">Mindful Morning Awakening</h2>
          <p className="text-xs text-primary font-semibold uppercase tracking-widest">10-Minute Guided Session</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto space-y-2">
          <div className="h-3 bg-surface-container-high rounded-full overflow-hidden cursor-pointer" onClick={() => setProgress(50)}>
            <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-on-surface-variant/70 font-mono">
            <span>03:30</span>
            <span>10:00</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-center gap-6">
          <button className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm hover:bg-surface-container">
            <span className="material-symbols-outlined text-2xl">replay_10</span>
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-purple scale-105 transition-all"
          >
            <span className="material-symbols-outlined text-3xl">{isPlaying ? "pause" : "play_arrow"}</span>
          </button>
          <button className="w-12 h-12 rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center shadow-sm hover:bg-surface-container">
            <span className="material-symbols-outlined text-2xl">forward_10</span>
          </button>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-xl text-on-surface">Recommended Audio Sessions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <div
              key={track.title}
              className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex items-center justify-between hover:shadow-md transition-all cursor-pointer"
            >
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-on-surface">{track.title}</h4>
                <p className="text-xs text-on-surface-variant">{track.duration} • {track.category}</p>
              </div>
              <span className="material-symbols-outlined text-primary text-2xl">play_circle</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
