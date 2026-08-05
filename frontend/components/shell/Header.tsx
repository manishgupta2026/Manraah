"use client";

import React from "react";
import Link from "next/link";

interface HeaderProps {
  onOpenMenu?: () => void;
}

export default function Header({ onOpenMenu }: HeaderProps) {
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
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-primary-container/30 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs hover:bg-primary-container/50 transition-colors"
        >
          AS
        </Link>
      </div>
    </header>
  );
}
