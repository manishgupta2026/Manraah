"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

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

      <div className="hidden md:block">
        {/* Subtle Breadcrumb / Category Context */}
        <span className="text-xs font-semibold text-on-surface-variant/60 tracking-wide uppercase">
          Sanctuary Workspace
        </span>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/crisis-support"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold hover:bg-error/20 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-sm">emergency</span>
          <span className="hidden sm:inline">Crisis Helpline</span>
        </Link>
        {(() => {
          const displayName = user?.sanctuaryName || user?.name || "Sanctuary Member";
          return (
            <Link
              href="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-85 transition-colors overflow-hidden shrink-0 border border-primary/20"
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
