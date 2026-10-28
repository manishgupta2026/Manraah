"use client";

import React from "react";
import Link from "next/link";

interface SolutionSelectorTabsProps {
  activeTab: "students" | "corporates";
  className?: string;
}

export default function SolutionSelectorTabs({
  activeTab,
  className = "",
}: SolutionSelectorTabsProps) {
  return (
    <div className={`max-w-xl mx-auto w-full ${className}`}>
      <div
        role="tablist"
        aria-label="Solution Categories"
        className="p-1.5 rounded-2xl bg-surface-container dark:bg-[#201811] border border-surface-variant/30 dark:border-[#51402E] grid grid-cols-2 gap-1.5 shadow-inner"
      >
        <Link
          href="/our-solution/students"
          role="tab"
          aria-selected={activeTab === "students"}
          prefetch={true}
          className={`py-3 px-3 sm:px-5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "students"
              ? "bg-surface-container-lowest dark:bg-[#30241A] text-[#006B56] dark:text-[#88F7D6] shadow-xs"
              : "text-on-surface-variant dark:text-[#C5B7A4] hover:text-on-surface dark:hover:text-[#F3E9D8] hover:bg-surface-container-lowest/40"
          }`}
        >
          <span className="material-symbols-outlined text-base sm:text-lg">school</span>
          <span>For Students &amp; Colleges</span>
        </Link>
        <Link
          href="/our-solution/corporates"
          role="tab"
          aria-selected={activeTab === "corporates"}
          prefetch={true}
          className={`py-3 px-3 sm:px-5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "corporates"
              ? "bg-surface-container-lowest dark:bg-[#30241A] text-[#006B56] dark:text-[#88F7D6] shadow-xs"
              : "text-on-surface-variant dark:text-[#C5B7A4] hover:text-on-surface dark:hover:text-[#F3E9D8] hover:bg-surface-container-lowest/40"
          }`}
        >
          <span className="material-symbols-outlined text-base sm:text-lg">corporate_fare</span>
          <span>For Employees &amp; Corporates</span>
        </Link>
      </div>
    </div>
  );
}
