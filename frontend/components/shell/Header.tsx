"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

import ThemeToggle from "@/frontend/components/ui/ThemeToggle";

interface HeaderProps {
  onOpenMenu?: () => void;
}

export default function Header({ onOpenMenu }: HeaderProps) {
  const [user, setUser] = useState<{ name?: string; sanctuaryName?: string; email: string; avatar?: string } | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUser(session.user);
    }
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-surface-container-lowest/90 backdrop-blur-md border-b border-surface-variant/30 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs shrink-0">
      {/* Mobile Brand Title with Menu Trigger */}
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={onOpenMenu}
          className="material-symbols-outlined text-primary text-2xl mr-1 cursor-pointer focus:outline-none hover:opacity-80"
          aria-label="Open navigation menu"
        >
          menu
        </button>
        <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-lg">spa</span>
        </div>
        <span className="font-heading font-bold text-base text-primary">Manraah</span>
      </div>

      <div className="hidden md:flex items-center gap-2 relative bg-surface-container-low/40 border border-surface-variant/20 rounded-full px-3.5 py-1.5 w-72 shadow-soft-xs">
        <span className="material-symbols-outlined text-sm text-outline">search</span>
        <input 
          type="text" 
          placeholder="Search Manraah..." 
          className="bg-transparent text-xs text-on-surface-variant border-none outline-none focus:ring-0 placeholder:text-outline/75 w-full font-bold"
        />
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative w-8 h-8 rounded-full bg-white border border-surface-variant/40 flex items-center justify-center text-on-surface-variant cursor-pointer hover:bg-purple-50 hover:text-[#5F4EA5] transition-all shadow-2xs">
          <span className="material-symbols-outlined text-base">notifications</span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center text-[6px] font-black text-white border border-white">3</span>
        </div>

        {/* Day / Night Toggle Pill */}
        <ThemeToggle />

        {/* Crisis Help rounded pill */}
        <Link
          href="/crisis-support"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-red-600 text-xs font-heading font-bold hover:bg-red-50 transition-colors shadow-2xs border border-red-200/80"
        >
          <span className="material-symbols-outlined text-sm text-red-500">emergency</span>
          <span>Crisis Help</span>
        </Link>

        {/* Profile only visible on mobile headers */}
        {(() => {
          const displayName = user?.sanctuaryName || user?.name || "Sanctuary Member";
          return (
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-85 transition-colors overflow-hidden shrink-0 border border-primary/20 md:hidden"
              title={displayName}
            >
              {user?.avatar && user.avatar.startsWith("data:image/") ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center font-bold text-[10px]"
                  style={{ backgroundColor: getPastelBgColor(displayName), color: getPastelTextColor(displayName) }}
                >
                  {getInitials(displayName)}
                </div>
              )}
            </Link>
          );
        })()}
      </div>
    </header>
  );
}
