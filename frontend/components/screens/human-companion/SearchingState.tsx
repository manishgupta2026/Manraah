"use client";

import React, { useEffect } from "react";

interface SearchingStateProps {
  onFound: () => void;
  onCancel: () => void;
}

export default function SearchingState({ onFound, onCancel }: SearchingStateProps) {
  useEffect(() => {
    // Simulate matching latency before transitioning to MatchedScreen
    const timer = setTimeout(() => {
      onFound();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFound]);

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-8 animate-fadeIn select-none">
      {/* Animated Pulsing Ring Container */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-mint/30 animate-ping" />
        <div className="absolute inset-4 rounded-full bg-primary/20 animate-pulse" />
        <div className="relative w-32 h-32 rounded-full bg-surface-container-lowest border-4 border-mint shadow-soft flex flex-col items-center justify-center text-primary space-y-1">
          <span className="material-symbols-outlined text-4xl animate-bounce">
            graphic_eq
          </span>
          <span className="text-[10px] font-mono font-bold text-secondary">Matching...</span>
        </div>
      </div>

      {/* Status Text */}
      <div className="space-y-2">
        <h2 className="text-2xl font-heading font-bold text-on-surface">
          Finding an Available Peer Listener...
        </h2>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          Searching active sanctuary members for a compassionate, non-judgmental 1-on-1 match.
        </p>
      </div>

      {/* Cancel Search Button */}
      <button
        onClick={onCancel}
        className="px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-all"
      >
        Cancel Search
      </button>
    </div>
  );
}
