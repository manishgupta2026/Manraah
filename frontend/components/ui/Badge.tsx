import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "peach" | "pink" | "yellow" | "error";
  className?: string;
}

export function Badge({ children, variant = "primary", className = "" }: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary-container/20 text-primary",
    secondary: "bg-mint/20 text-secondary",
    peach: "bg-peach/30 text-tertiary",
    pink: "bg-pink/30 text-tertiary",
    yellow: "bg-pale-yellow/40 text-on-surface",
    error: "bg-error-container text-on-error-container",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
