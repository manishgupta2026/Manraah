"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, signOut } from "@/backend/auth/client";

export default function AdminHeader() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin Operations");

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setAdminName(session.user.sanctuaryName || session.user.name || "Admin Operations");
    }
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/companion/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-variant/30 px-4 md:px-6 py-3 flex items-center justify-between shadow-xs shrink-0 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
          <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-sm text-on-surface">Manraah</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wider">
              Admin Portal
            </span>
          </div>
          <p className="text-[10px] text-on-surface-variant/80 font-medium hidden sm:block">
            Executive Operations & Peer Support Console
          </p>
        </div>
      </div>

      {/* Center Search Pill - Matches User Header */}
      <div className="hidden md:flex items-center gap-2 bg-surface-container-low/50 border border-surface-variant/20 rounded-full px-3.5 py-1.5 w-72 shadow-soft-xs">
        <span className="material-symbols-outlined text-sm text-outline">search</span>
        <input
          type="text"
          placeholder="Search members, queues, audits..."
          className="bg-transparent text-xs text-on-surface-variant border-none outline-none focus:ring-0 placeholder:text-outline/75 w-full font-semibold"
        />
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Real-time Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Server Active</span>
        </div>

        {/* Notifications Icon */}
        <div className="relative w-8 h-8 rounded-full bg-surface-container-low border border-surface-variant/30 flex items-center justify-center text-on-surface-variant cursor-pointer hover:bg-primary/10 hover:text-primary transition-all">
          <span className="material-symbols-outlined text-base">notifications</span>
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-primary flex items-center justify-center text-[6px] font-black text-white border border-white">
            1
          </span>
        </div>

        {/* Sign Out Action Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/50 hover:bg-rose-100 text-xs font-bold transition-all"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
