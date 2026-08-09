"use client";

import React from "react";

export type AdminTab =
  | "OVERVIEW"
  | "COMPANION"
  | "USERS"
  | "CONTENT"
  | "THERAPISTS"
  | "SYSTEM";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  queueCount?: number;
  pendingTherapistsCount?: number;
}

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  queueCount = 0,
  pendingTherapistsCount = 2,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: "OVERVIEW" as AdminTab,
      label: "Overview & Analytics",
      icon: "monitoring",
      badge: null,
    },
    {
      id: "COMPANION" as AdminTab,
      label: "Human Companion",
      icon: "record_voice_over",
      badge: queueCount > 0 ? `${queueCount} Live` : null,
      badgeColor: "bg-emerald-500 text-white animate-pulse",
    },
    {
      id: "USERS" as AdminTab,
      label: "User Management",
      icon: "group",
      badge: "1.4k",
    },
    {
      id: "CONTENT" as AdminTab,
      label: "Content & Meditations",
      icon: "spa",
      badge: null,
    },
    {
      id: "THERAPISTS" as AdminTab,
      label: "Therapist Verification",
      icon: "verified_user",
      badge: pendingTherapistsCount > 0 ? `${pendingTherapistsCount} Pending` : null,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      id: "SYSTEM" as AdminTab,
      label: "System & Infrastructure",
      icon: "dns",
      badge: "Online",
      badgeColor: "bg-mint/30 text-secondary border border-mint",
    },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block bg-surface-container-lowest border-r border-surface-variant/30 min-h-[calc(100vh-4rem)] p-4 select-none">
      <div className="space-y-6">
        {/* Sidebar Header Section */}
        <div className="px-3 py-2 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Admin Workspace
          </span>
          <h2 className="font-heading font-bold text-sm text-on-surface">
            Operations & Control
          </h2>
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-soft"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? "bg-white/20 text-white"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick System Badge */}
        <div className="pt-6 border-t border-surface-variant/20 px-3">
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface text-[11px]">Real-Time Server</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Active
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant/80 font-medium">
              VPS Socket & Neon PostgreSQL synced over SSL.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
