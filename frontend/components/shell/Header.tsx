"use client";

import React from "react";
import Link from "next/link";
import { useCategory, CATEGORIES } from "@/frontend/lib/context/CategoryContext";
import { UserCategory } from "@/backend/types";

export default function Header() {
  const { category, setCategory } = useCategory();

  return (
    <header className="sticky top-0 z-20 bg-surface-container-lowest/80 backdrop-blur-md border-b border-surface-variant/30 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
      {/* Mobile Brand Title */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-xl">spa</span>
        </div>
        <span className="font-heading font-bold text-lg text-primary">Manraah</span>
      </div>

      {/* Demographic Category Selector */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-xs font-semibold text-on-surface-variant/80">Category:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[280px] sm:max-w-none">
          {(Object.keys(CATEGORIES) as UserCategory[]).map((catKey) => {
            const isSelected = category === catKey;
            const cat = CATEGORIES[catKey];
            return (
              <button
                key={catKey}
                onClick={() => setCategory(catKey)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-primary text-white shadow-sm font-semibold scale-105"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/crisis-support"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-semibold hover:bg-error/20 transition-colors"
        >
          <span className="material-symbols-outlined text-base">emergency</span>
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
