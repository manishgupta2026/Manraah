"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/frontend/lib/constants";

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-container-lowest border-r border-surface-variant/40 min-h-screen sticky top-0 z-30 shadow-soft">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-surface-variant/30">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">spa</span>
        </div>
        <div>
          <h1 className="font-heading font-bold text-xl text-primary leading-tight">Manraah</h1>
          <p className="text-xs text-on-surface-variant/70 font-sans">Sanctuary for Mind</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? "text-white" : "text-primary/70"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Emergency Crisis Button & Profile Footer */}
      <div className="p-4 space-y-3 border-t border-surface-variant/30 bg-surface-container-low/40">
        <Link
          href="/crisis-support"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-error-container text-on-error-container hover:bg-error/15 font-semibold text-xs transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-base">emergency</span>
          <span>Immediate Support 24/7</span>
        </Link>

        <Link href="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
            AS
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">Aanya Sharma</p>
            <p className="text-[11px] text-on-surface-variant/70 truncate">Settings & Profile</p>
          </div>
          <span className="material-symbols-outlined text-lg text-outline">settings</span>
        </Link>
      </div>
    </aside>
  );
}
