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
  size?: "sm" | "md";
}

export default function StatusBadge({
  label,
  variant = "neutral",
  pulse = false,
  size = "md",
}: StatusBadgeProps) {
  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    success: {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      dot: "bg-emerald-500",
    },
    warning: {
      badge: "bg-amber-50 text-amber-800 border-amber-200/70",
      dot: "bg-amber-500",
    },
    error: {
      badge: "bg-rose-50 text-rose-700 border-rose-200/70",
      dot: "bg-rose-500",
    },
    info: {
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      dot: "bg-indigo-500",
    },
    neutral: {
      badge: "bg-slate-100 text-slate-700 border-slate-200/80",
      dot: "bg-slate-400",
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${style.badge} ${sizeClasses} whitespace-nowrap tracking-wide select-none`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot} ${
          pulse ? "animate-pulse ring-2 ring-current/20" : ""
        }`}
      />
      <span>{label}</span>
    </span>
  );
}
