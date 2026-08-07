"use client";

import React, { useState } from "react";

interface ModeConfig {
  id: "listener" | "peer_support";
  label: string;
  description: string;
  comingSoon?: boolean;
}

interface EntryModeSelectProps {
  onStartSearch: (mode: "listener" | "peer_support", topic: string) => void;
}

export default function EntryModeSelect({ onStartSearch }: EntryModeSelectProps) {
  const modes: ModeConfig[] = [
    {
      id: "listener",
      label: "Find a Listener",
      description: "1-on-1 confidential venting with a trained peer listener",
      comingSoon: false,
    },
    {
      id: "peer_support",
      label: "Peer Support Circle",
      description: "Small group support circle with members sharing similar experiences",
      comingSoon: true,
    },
  ];

  const [activeMode, setActiveMode] = useState<"listener" | "peer_support">("listener");
  const [topic, setTopic] = useState("Emotional Venting & Guidance");
  const [customTopic, setCustomTopic] = useState("");

  const presetTopics = [
    "Emotional Venting & Guidance",
    "Exam & Academic Stress",
    "Relationship & Family Concerns",
    "Career & Work Anxiety",
    "Feeling Overwhelmed or Lonely",
  ];

  const selectedConfig = modes.find((m) => m.id === activeMode) || modes[0];

  const handleStart = () => {
    const finalTopic = customTopic.trim() || topic;
    onStartSearch(activeMode, finalTopic);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8 animate-fadeIn text-center select-none">
      {/* Header Badge */}
      <div className="space-y-2">
        <span className="px-4 py-1.5 rounded-full bg-peach/30 text-tertiary text-xs font-bold uppercase tracking-wider">
          Human Companion Sanctuary
        </span>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
          You Don't Have to Carry It Alone
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Connect 1-on-1 with compassionate peer listeners trained in active listening and empathetic dialogue.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex p-1.5 rounded-3xl bg-surface-container-low border border-surface-variant/30 max-w-md mx-auto shadow-inner">
        {modes.map((mode) => {
          const isSelected = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all relative ${
                isSelected
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {mode.label}
              {mode.comingSoon && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-peach/30 text-tertiary text-[9px] font-extrabold uppercase">
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Topic Selection Area */}
      {!selectedConfig.comingSoon && (
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft max-w-lg mx-auto text-left space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">edit_note</span>
            <span>What would you like to talk about today?</span>
          </div>

          {/* Quick Preset Topic Chips */}
          <div className="flex flex-wrap gap-2">
            {presetTopics.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setTopic(item);
                  setCustomTopic("");
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  topic === item && !customTopic
                    ? "bg-primary text-white border-primary shadow-xs font-bold"
                    : "bg-surface-container-low text-on-surface-variant border-surface-variant/30 hover:border-primary/40"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Custom Topic Input */}
          <div className="pt-2 border-t border-surface-variant/20">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Or type a custom topic... (e.g. Navigating family pressure)"
              className="w-full px-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
      )}

      {/* Big Circular CTA Button */}
      <div className="py-4">
        {selectedConfig.comingSoon ? (
          <div className="p-6 rounded-3xl bg-surface-container-low border border-surface-variant/30 max-w-sm mx-auto space-y-2">
            <span className="material-symbols-outlined text-4xl text-tertiary opacity-60 block">
              auto_awesome
            </span>
            <p className="text-xs font-bold text-on-surface">Peer Circles Arriving Soon</p>
            <p className="text-[11px] text-on-surface-variant">
              Group peer circles are in active pilot testing. Try 1-on-1 Active Listener mode above!
            </p>
          </div>
        ) : (
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-mint/40 via-primary/30 to-peach/40 blur-xl animate-pulse" />
            
            <button
              onClick={handleStart}
              className="relative w-44 h-44 rounded-full bg-gradient-to-br from-primary via-primary-purple to-secondary text-white font-heading font-bold text-base shadow-soft-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-2 group border-4 border-white/30"
            >
              <span className="material-symbols-outlined text-4xl group-hover:animate-bounce">
                record_voice_over
              </span>
              <span>Find a Listener</span>
            </button>
          </div>
        )}
      </div>

      {/* Privacy Guarantee Note */}
      <p className="text-[11px] text-on-surface-variant/70 max-w-xs mx-auto">
        🛡️ 100% Anonymous • No personal contact info or real names shared.
      </p>
    </div>
  );
}
