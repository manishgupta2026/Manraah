"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/backend/auth/client";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ADMIN_SECTIONS: NavSection[] = [
  {
    title: "OPERATIONS",
    items: [
      { label: "Overview & Telemetry", href: "/admin/dashboard", icon: "monitoring" },
      { label: "Member Directory", href: "/admin/users", icon: "group" },
      {
        label: "Crisis Escalation",
        href: "/admin/crisis-escalation",
        icon: "emergency",
        badge: "Triage",
        badgeColor: "bg-rose-50 text-rose-700 border border-rose-200/80",
      },
    ],
  },
  {
    title: "CARE & COMPANIONS",
    items: [
      { label: "Companion Network", href: "/admin/human-companion-network", icon: "record_voice_over" },
      { label: "Therapist Credentialing", href: "/admin/verification", icon: "verified_user" },
    ],
  },
  {
    title: "GOVERNANCE & SYSTEM",
    items: [
      { label: "Community Moderation", href: "/admin/community", icon: "forum" },
      { label: "Resource Library", href: "/admin/resources", icon: "spa" },
      { label: "Team & Role Access", href: "/admin/team", icon: "manage_accounts" },
      { label: "Platform Settings", href: "/admin/settings", icon: "settings" },
    ],
  },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    try {
      await signOut();
      document.cookie = "manraah_companion_session=; path=/; max-age=0";
      document.cookie = "manraah_companion_role=; path=/; max-age=0";
    } catch (e) {
      console.error(e);
    }
    router.push("/admin/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FC] text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] shrink-0">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
              <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm tracking-tight text-slate-900">
                  Manraah
                </span>
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold tracking-wide">
                  ADMIN
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 w-80 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
        >
          <span className="material-symbols-outlined text-base text-slate-400 shrink-0">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members, crisis triage, records..."
            className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 border-none outline-none w-full"
          />
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
            ↵
          </kbd>
        </form>

        {/* Right Actions: Database Telemetry & Profile */}
        <div className="flex items-center gap-3">
          {/* DB Health Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Neon Connected</span>
          </div>

          {/* Quick Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-xs font-semibold active:scale-[0.98] transition-all duration-150"
            title="Sign Out of Admin Console"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Horizontal Scroll Navigation Strip */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden bg-white border-b border-slate-200/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)]"
      >
        {ADMIN_SECTIONS.flatMap((sec) => sec.items).map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-150 ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between bg-white border-r border-slate-200/80 min-h-[calc(100vh-3.5rem)] p-4 select-none">
          <div className="space-y-6">
            {ADMIN_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </span>
                </div>

                <nav className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? "bg-primary text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`material-symbols-outlined text-base ${
                              isActive ? "text-white" : "text-slate-400"
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : item.badgeColor || "bg-slate-100 text-slate-600"
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
            ))}
          </div>

          {/* Sidebar Footer: System Status */}
          <div className="pt-4 border-t border-slate-100 px-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Neon Cloud PostgreSQL</span>
              <span className="text-emerald-600 font-semibold">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Branch: staging • aws-ap-se-1
            </p>
          </div>
        </aside>

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
