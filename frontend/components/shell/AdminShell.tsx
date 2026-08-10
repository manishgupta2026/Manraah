"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/backend/auth/client";

const ADMIN_NAV = [
  { label: "Overview & Analytics", href: "/admin/dashboard", icon: "monitoring" },
  { label: "User Management", href: "/admin/users", icon: "group" },
  { label: "Community Moderation", href: "/admin/community", icon: "forum" },
  { label: "Therapist Verification", href: "/admin/verification", icon: "verified_user" },
  { label: "Crisis Escalation", href: "/admin/crisis-escalation", icon: "emergency", badge: "Critical", badgeColor: "bg-rose-500 text-white animate-pulse" },
  { label: "Resource Library", href: "/admin/resources", icon: "spa" },
  { label: "Companion Network", href: "/admin/human-companion-network", icon: "record_voice_over" },
  { label: "Team & Roles", href: "/admin/team", icon: "manage_accounts" },
  { label: "Admin Settings", href: "/admin/settings", icon: "settings" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans select-none overflow-hidden">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-variant/30 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-sm text-on-surface">Manraah</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
                Executive Operations
              </span>
            </div>
            <p className="text-[10px] text-on-surface-variant/80 font-medium hidden sm:block">
              Sanctuary Operations & Crisis Escalation Center
            </p>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container-low/50 border border-surface-variant/20 rounded-full px-3.5 py-1.5 w-72 shadow-soft-xs">
          <span className="material-symbols-outlined text-sm text-outline">search</span>
          <input
            type="text"
            placeholder="Search operations, members, flags..."
            className="bg-transparent text-xs text-on-surface-variant border-none outline-none focus:ring-0 placeholder:text-outline/75 w-full font-semibold"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Server Active</span>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/50 hover:bg-rose-100 text-xs font-bold transition-all"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:block bg-surface-container-lowest/80 backdrop-blur-md border-r border-surface-variant/30 min-h-[calc(100vh-4rem)] p-4 select-none">
          <div className="space-y-6">
            <div className="px-3 py-1 space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                ADMIN CONSOLE
              </span>
              <h2 className="font-heading font-bold text-xs text-on-surface">
                Platform Control & Oversight
              </h2>
            </div>

            <nav className="space-y-1">
              {ADMIN_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all relative overflow-hidden ${
                      isActive
                        ? "bg-primary text-white shadow-soft"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          item.badgeColor || "bg-surface-container-high text-on-surface-variant"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Viewport Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
