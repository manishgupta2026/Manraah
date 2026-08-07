"use client";

import React from "react";
import { AnonymizedListener } from "@/backend/types";

interface MatchedScreenProps {
  listener: AnonymizedListener;
  onStartChat: () => void;
  onStartCall: () => void;
  onCancel: () => void;
}

export default function MatchedScreen({ listener, onStartChat, onStartCall, onCancel }: MatchedScreenProps) {
  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-8 animate-fadeIn text-center select-none">
      {/* Header Banner */}
      <div className="space-y-2">
        <span className="px-4 py-1.5 rounded-full bg-mint/30 text-secondary text-xs font-bold uppercase tracking-wider">
          ● Connected to Sanctuary Member
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">You're Matched!</h1>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
          You've been connected with a trained peer listener in a 100% confidential 1-on-1 space.
        </p>
      </div>

      {/* Anonymized Listener Card */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6 text-center">
        <div className={`w-24 h-24 mx-auto rounded-full ${listener.avatarBg} flex items-center justify-center border-4 shadow-soft`}>
          <span className="material-symbols-outlined text-5xl">person</span>
        </div>

        <div className="space-y-1">
          <h3 className="font-heading font-bold text-xl text-on-surface">{listener.displayId}</h3>
          <p className="text-xs text-primary font-semibold">{listener.contextTag}</p>
          <div className="flex items-center justify-center gap-3 pt-2 text-xs font-bold text-on-surface-variant">
            <span>⭐ {listener.rating} Rating</span>
            <span>•</span>
            <span>💬 {listener.totalSessions} Sessions</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
          "Here to listen with empathy and warmth. Take all the time you need to share what's on your mind."
        </div>
      </div>

      {/* Mode Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onStartChat}
          className="flex-1 py-4 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">forum</span>
          Start Anonymous Chat
        </button>

        <button
          onClick={onStartCall}
          className="flex-1 py-4 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">call</span>
          Start Voice Call
        </button>
      </div>

      <button
        onClick={onCancel}
        className="text-xs text-on-surface-variant/70 hover:text-on-surface font-semibold underline"
      >
        Leave Match & Return
      </button>
    </div>
  );
}
