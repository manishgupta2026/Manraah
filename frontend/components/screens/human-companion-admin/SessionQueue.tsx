"use client";

import React from "react";
import { AnonymizedUser } from "@/backend/types";

interface SessionQueueProps {
  queue: AnonymizedUser[];
  onSelectUser: (user: AnonymizedUser) => void;
}

export default function SessionQueue({ queue, onSelectUser }: SessionQueueProps) {
  if (!queue || queue.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 select-none">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-on-surface">Waiting List Queue</h3>
        <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
          {queue.length} Waiting
        </span>
      </div>

      <div className="space-y-3">
        {queue.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/20 space-y-2 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-on-surface">{item.userTag}</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  {item.categoryTag}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">{item.topic}</p>
            </div>

            <button
              onClick={() => onSelectUser(item)}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-purple text-white text-xs font-bold transition-all shrink-0"
            >
              Accept Request →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
