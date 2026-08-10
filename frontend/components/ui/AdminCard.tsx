"use client";

import React, { ReactNode } from "react";

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function AdminCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: AdminCardProps) {
  return (
    <div className={`p-6 rounded-3xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-variant/30 shadow-card-lift space-y-4 ${className}`}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-variant/20 pb-3.5">
          <div>
            {title && <h3 className="font-heading font-bold text-base text-on-surface">{title}</h3>}
            {subtitle && <p className="text-xs text-on-surface-variant/80 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
