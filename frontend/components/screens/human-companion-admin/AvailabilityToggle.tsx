"use client";

import React from "react";

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: (val: boolean) => void;
  stats?: {
    todaySessions: number;
    activeMinutes: number;
    rating: number;
  };
}

export default function AvailabilityToggle({
  isAvailable,
  onToggle,
  stats = { todaySessions: 4, activeMinutes: 85, rating: 4.9 },
}: AvailabilityToggleProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 select-none">
      {/* Status & Toggle Control */}
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all ${
          isAvailable ? "bg-mint/30 text-secondary border-2 border-mint" : "bg-surface-container-high text-on-surface-variant"
        }`}>
          <span className="material-symbols-outlined text-3xl">
            {isAvailable ? "sensor_occupied" : "do_not_disturb_on"}
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-lg text-on-surface">Listener Status</h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isAvailable ? "bg-mint/20 text-secondary" : "bg-surface-container-high text-on-surface-variant"
            }`}>
              {isAvailable ? "ONLINE & READY" : "OFFLINE"}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            {isAvailable ? "Receiving incoming 1-on-1 support requests" : "Toggle switch on to enter active listener queue"}
          </p>
        </div>
      </div>

      {/* Switch & Stats */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-4 text-center border-r border-surface-variant/20 pr-6">
          <div>
            <p className="text-lg font-heading font-bold text-primary">{stats.todaySessions}</p>
            <p className="text-[10px] text-on-surface-variant font-semibold">Today's Sessions</p>
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-secondary">{stats.activeMinutes}m</p>
            <p className="text-[10px] text-on-surface-variant font-semibold">Active Time</p>
          </div>
          <div>
            <p className="text-lg font-heading font-bold text-tertiary">⭐ {stats.rating}</p>
            <p className="text-[10px] text-on-surface-variant font-semibold">Rating</p>
          </div>
        </div>

        <button
          onClick={() => onToggle(!isAvailable)}
          className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
            isAvailable
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-surface-container-high text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? "bg-white animate-ping" : "bg-gray-400"}`} />
          {isAvailable ? "Available to Listen" : "Go Online"}
        </button>
      </div>
    </div>
  );
}
