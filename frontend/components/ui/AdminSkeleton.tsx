"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-slate-800/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function TableSkeletonRows({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex items-center gap-4 px-4 py-3 bg-white/50 rounded-xl border border-slate-100"
        >
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-4 rounded bg-slate-200/60 animate-pulse ${
                cIdx === 0
                  ? "w-36"
                  : cIdx === 1
                  ? "w-24"
                  : cIdx === cols - 1
                  ? "w-20 ml-auto"
                  : "w-28"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-slate-200/70 rounded" />
      <div className="h-8 w-20 bg-slate-200/80 rounded" />
      <div className="h-3 w-40 bg-slate-100 rounded" />
    </div>
  );
}

export default Skeleton;
