"use client";

import React from "react";

interface SearchingStateProps {
  onFound?: () => void;
  onCancel?: () => void;
  onCancelSearch?: () => void;
}

export default function SearchingState({ onCancel, onCancelSearch }: SearchingStateProps) {
  const handleCancel = onCancelSearch || onCancel || (() => {});

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-8 animate-fadeIn select-none">
      {/* Outer Pulsing Radar Rings */}
      <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-mint/20 animate-ping" />
        <div className="absolute inset-4 rounded-full bg-mint/30 animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-surface-container-lowest border-2 border-mint shadow-soft flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-secondary animate-bounce">
            radar
          </span>
        </div>
      </div>

      {/* Status Messaging */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-mint/20 text-secondary text-xs font-bold uppercase tracking-wider">
          Connecting to Sanctuary Network...
        </span>
        <h2 className="text-2xl font-heading font-bold text-on-surface">
          Finding an Available Peer Listener
        </h2>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
          Matching you with a compassionate, trained peer listener. Your identity remains 100% masked.
        </p>
      </div>

      {/* Cancel Search Button */}
      <button
        onClick={handleCancel}
        className="px-6 py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-bold text-xs transition-all border border-surface-variant/20"
      >
        Cancel Search
      </button>
    </div>
  );
}
