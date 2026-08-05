"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/frontend/lib/constants";

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[80px] lg:w-[260px] bg-surface-container-lowest border-r border-surface-variant/40 z-30 shadow-soft transition-all duration-300">
      {/* Brand Header */}
      <div className="p-3 lg:px-5 lg:py-4 flex items-center justify-center lg:justify-start gap-3 border-b border-surface-variant/30 shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shrink-0">
          <span className="material-symbols-outlined text-xl">spa</span>
        </div>
        <div className="hidden lg:block">
          <h1 className="font-heading font-bold text-lg text-primary leading-tight">Manraah</h1>
          <p className="text-[11px] text-on-surface-variant/70 font-sans">Sanctuary for Mind</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 lg:px-3 py-3 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center lg:justify-start gap-3 p-2.5 lg:px-3.5 lg:py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
              }`}
              title={item.label}
            >
              <span className={`material-symbols-outlined text-lg shrink-0 ${isActive ? "text-white" : "text-primary/70"}`}>
                {item.icon}
              </span>
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Emergency Crisis Button & Profile Footer */}
      <div className="p-2.5 lg:p-3 space-y-2 border-t border-surface-variant/30 bg-surface-container-low/40 shrink-0">
        <Link
          href="/crisis-support"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-error-container text-on-error-container hover:bg-error/15 font-semibold text-xs transition-colors shadow-xs"
          title="Immediate Support 24/7"
        >
          <span className="material-symbols-outlined text-sm shrink-0">emergency</span>
          <span className="hidden lg:inline">Support 24/7</span>
        </Link>

        <Link
          href="/profile"
          className="flex items-center justify-center lg:justify-start gap-2.5 p-2 rounded-xl hover:bg-surface-container transition-colors"
          title="Aanya Sharma"
        >
          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/20 shrink-0">
            AS
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">Aanya Sharma</p>
            <p className="text-[10px] text-on-surface-variant/70 truncate">Settings & Profile</p>
          </div>
          <span className="hidden lg:block material-symbols-outlined text-base text-outline">settings</span>
        </Link>
      </div>
    </aside>
  );
}
