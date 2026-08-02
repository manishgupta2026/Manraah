import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft ${
        onClick ? "cursor-pointer hover:shadow-md transition-all" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
