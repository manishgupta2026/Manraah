"use client";

import React from "react";

export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  pulse?: boolean;
}

export default function StatusBadge({
  label,
  variant = "neutral",
  pulse = false,
}: StatusBadgeProps) {
  const variantStyles: Record<StatusVariant, string> = {
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    error: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    info: "bg-primary/10 text-primary border-primary/20",
    neutral: "bg-surface-container-high text-on-surface-variant border-surface-variant/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${variantStyles[variant]}`}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      )}
      <span>{label.toUpperCase()}</span>
    </span>
  );
}
