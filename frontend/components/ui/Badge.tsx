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
    peach: "bg-[#EDF6F2] dark:bg-[#20372F] text-[#006B56] dark:text-[#88F7D6] border border-[#BCE2D2] dark:border-[#325246]",
    pink: "bg-mint/15 dark:bg-[#1B332B] text-[#006B56] dark:text-[#88F7D6] border border-mint/30 dark:border-[#2E4E44]",
    yellow: "bg-[#E6F4F0] dark:bg-[#1B322A] text-[#005B48] dark:text-[#88F7D6] border border-[#CBECE2] dark:border-[#2E4E44]",
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
