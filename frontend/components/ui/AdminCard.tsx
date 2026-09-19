"use client";

import React, { ReactNode } from "react";

interface AdminCardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  noPadding?: boolean;
}

export default function AdminCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  headerClassName = "",
  noPadding = false,
}: AdminCardProps) {
  return (
    <section
      className={`rounded-2xl bg-white border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] transition-all ${
        noPadding ? "" : "p-5 sm:p-6"
      } ${className}`}
    >
      {(title || action) && (
        <header
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
