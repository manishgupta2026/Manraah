"use client";

import React from "react";
import { AnonymizedUser } from "@/backend/types";

interface IncomingMatchProps {
  user: AnonymizedUser;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingMatch({ user, onAccept, onDecline }: IncomingMatchProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container-lowest border-2 border-mint shadow-soft space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 rounded-full bg-mint/30 text-secondary text-xs font-bold uppercase tracking-wider">
          🔔 Incoming Match Request
        </span>
        <span className="text-[11px] text-on-surface-variant/70 font-mono">{user.waitTime}</span>
      </div>

      <div className="space-y-1">
        <h3 className="font-heading font-bold text-lg text-on-surface">{user.userTag}</h3>
        <p className="text-xs text-primary font-semibold">Category: {user.categoryTag}</p>
        <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-2xl border border-surface-variant/20 mt-2">
          Topic: "{user.topic}"
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onDecline}
          className="flex-1 py-3 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-xs hover:bg-surface-container-high transition-all"
        >
          Decline
        </button>
        <button
          onClick={onAccept}
          className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all scale-105 active:scale-95"
        >
          Accept Match →
        </button>
      </div>
    </div>
  );
}
