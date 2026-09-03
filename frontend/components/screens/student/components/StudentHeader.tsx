"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

export function StudentHeader() {
  const { user, isDarkMode, toggleTheme, setIsMobileDrawerOpen } = useStudentDashboard();
  const router = useRouter();

  return (
    <header className="px-[28px] lg:px-[32px] py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-[#F5FAFB] dark:bg-[#0D1F2D] shrink-0 z-20">
      {/* Search box with mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Open menu"
          className="md:hidden w-10 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all shadow-2xs shrink-0"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">menu</span>
        </button>

        <div className="relative w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Search Manraah..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-[#5F4EA5] text-slate-800 dark:text-slate-200 font-semibold shadow-2xs"
          />
        </div>
      </div>

      {/* Right Header items */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 transition-all shadow-2xs">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg">notifications</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border border-white">
            3
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-16 h-10 rounded-2xl bg-white dark:bg-[#132E3F] border border-slate-200/50 dark:border-slate-700 flex items-center justify-between px-2.5 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
        >
          <span className={`material-symbols-outlined text-base ${!isDarkMode ? "text-amber-500 font-bold" : "text-slate-400"}`}>
            light_mode
          </span>
          <span className={`material-symbols-outlined text-base ${isDarkMode ? "text-indigo-400 font-bold" : "text-slate-400"}`}>
            dark_mode
          </span>
        </button>

        {/* Crisis Help */}
        <button
          onClick={() => router.push("/crisis-support")}
          className="px-5 py-3 rounded-2xl bg-[#FEEAEA] border border-[#FEEAEA] hover:border-red-300 text-[#D96C6C] font-heading font-black text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm font-bold animate-spin-slow">local_hospital</span>
          Crisis Help
        </button>
      </div>
    </header>
  );
}
