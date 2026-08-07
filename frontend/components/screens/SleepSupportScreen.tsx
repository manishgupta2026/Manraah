"use client";

import React, { useState } from "react";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function SleepSupportScreen() {
  const [activeSound, setActiveSound] = useState<string>("Gentle Rain");

  const soundscapes = [
    { title: "Gentle Rain", desc: "Soothing rain patter against windowpane", icon: "water_drop" },
    { title: "Deep Ocean Waves", desc: "Low-frequency ocean tides for deep sleep", icon: "waves" },
    { title: "Night Forest", desc: "Soft crickets and gentle night breeze", icon: "forest" },
    { title: "Binaural Delta Waves", desc: "Scientific sleep frequency tones", icon: "graphic_eq" },
  ];

  return (
    <div className="space-y-8">
      <ScreenHeader title="🌙 Sleep Support" showBackButton={true} fallbackRoute="/dashboard" />
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-primary-container/20 text-primary text-xs font-semibold uppercase tracking-wider">
          Rest & Recovery
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Night Sleep Support & Soundscapes</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Drift into deep, restorative sleep with continuous ambient audio and wind-down stories.
        </p>
      </div>

      {/* Ambient Soundscape Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {soundscapes.map((sound) => {
          const isPlaying = activeSound === sound.title;
          return (
            <div
              key={sound.title}
              onClick={() => setActiveSound(sound.title)}
              className={`p-6 rounded-3xl cursor-pointer border transition-all flex items-center justify-between ${
                isPlaying
                  ? "bg-surface-container-lowest border-primary shadow-lg ring-2 ring-primary/30"
                  : "bg-surface-container-lowest/80 border-surface-variant/30 hover:bg-surface-container-lowest"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isPlaying ? "bg-primary text-white" : "bg-surface-container-low text-primary"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{sound.icon}</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-on-surface">{sound.title}</h3>
                  <p className="text-xs text-on-surface-variant">{sound.desc}</p>
                </div>
              </div>

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isPlaying ? "bg-secondary text-white" : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{isPlaying ? "pause" : "play_arrow"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
