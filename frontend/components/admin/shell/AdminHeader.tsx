"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await fetch("/api/companion/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout error:", e);
    }
    // Delete cookie on client side as fallback
    document.cookie = "manraah_companion_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/companion/login");
  };

  return (
    <header className="w-full bg-surface-container-lowest border-b border-surface-variant/30 sticky top-0 z-40 shadow-xs px-4 md:px-8 py-3.5 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Admin Brand Badge */}
        <div className="flex items-center gap-3">
          <Link href="/admin/human-companion" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-all">
              🛡️
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm text-on-surface leading-none">
                Manraah Listener Operations
              </h2>
              <span className="text-[10px] text-secondary font-semibold">
                Dedicated Admin & Companion Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Admin Console Nav Links */}
        <div className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-surface-container-low border border-surface-variant/20">
          <Link
            href="/admin/human-companion"
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              pathname === "/admin/human-companion" || pathname === "/companion/dashboard"
                ? "bg-surface-container-lowest text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            🎧 Operations Console
          </Link>
        </div>

        {/* Right: Role Badge & Sign Out Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-peach/30 text-tertiary text-xs font-bold border border-peach/40">
            Role: Admin Listener
          </span>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container-low hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold transition-all border border-surface-variant/30 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
