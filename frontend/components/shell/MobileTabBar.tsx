"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_TAB_ITEMS } from "@/frontend/lib/constants";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";

export default function MobileTabBar() {
  const pathname = usePathname();
  const { category } = useCategory();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-t border-surface-variant/40 px-3 py-2 shadow-lg">
      <nav className="flex items-center justify-around">
        {MOBILE_TAB_ITEMS.map((tab) => {
          const targetHref = tab.href === "/dashboard" ? getCategoryDashboardRoute(category) : tab.href;
          const isActive = pathname === targetHref || (tab.href !== "/" && pathname.startsWith(targetHref));
          return (
            <Link
              key={tab.href}
              href={targetHref}
              className={`flex flex-col items-center py-1 px-3 rounded-full transition-all ${
                isActive ? "text-primary font-semibold scale-105" : "text-on-surface-variant/70 hover:text-primary"
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? "bg-primary-container/30" : ""
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${isActive ? "text-primary font-bold" : ""}`}>
                  {tab.icon}
                </span>
              </div>
              <span className="text-[11px] mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
