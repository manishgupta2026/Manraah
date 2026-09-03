"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/frontend/lib/constants";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";

const WP_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "grid_view" },
  { label: "AI Companion", href: "/ai-chat", icon: "smart_toy" },
  { label: "Daily Check-in", href: "/checkin", icon: "mood" },
  { label: "Focus & Reset", href: "/meditation", icon: "schedule" },
  { label: "Work Wellness", href: "/dashboard/working-professional#work-wellness", icon: "assignment" },
  { label: "Analytics", href: "/reports", icon: "analytics" },
  { label: "Sleep Support", href: "/sleep", icon: "bedtime" },
  { label: "Journal", href: "/journal", icon: "auto_stories" },
  { label: "Community", href: "/community", icon: "groups" },
  { label: "Professional Care", href: "/professional-care", icon: "medical_services" },
  { label: "Resources", href: "/resources", icon: "menu_book" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { category } = useCategory();
  const [userName, setUserName] = useState(() => {
    const session = getClientSession();
    return session?.user?.sanctuaryName || session?.user?.name || "Member";
  });
  const [avatar, setAvatar] = useState(() => {
    const session = getClientSession();
    return session?.user?.avatar || "";
  });
  const [streakDays, setStreakDays] = useState<number>(() => {
    const session = getClientSession();
    return session?.user?.streakDays || 1;
  });

  useEffect(() => {
    const session = getClientSession();
    if (session?.user) {
      setUserName(session.user.sanctuaryName || session.user.name || "Member");
      setAvatar(session.user.avatar || "");
      setStreakDays(session.user.streakDays || 1);
    }
  }, []);

  const isWP = category === "working_professional" || category === "working professional";
  const navList = isWP ? WP_NAV_ITEMS : MAIN_NAV_ITEMS;
  const brandBg = isWP ? "bg-[#0B4F3C]" : "bg-[#E37A47]";

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[76px] hover:w-[240px] bg-[#0D1512] border-r border-[#2C2A30]/40 z-40 shadow-xl transition-all duration-300 ease-in-out group select-none text-slate-300">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-white/5 shrink-0 h-16">
        <div className={`w-10 h-10 rounded-2xl ${brandBg} flex items-center justify-center text-white shadow-md shrink-0 transition-colors duration-300`}>
          <span className="material-symbols-outlined text-2xl font-black">spa</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
          <h1 className="font-heading font-black text-sm text-white uppercase tracking-widest leading-none">Manraah</h1>
          <p className="text-[9px] text-[#A6A4AD] font-bold uppercase tracking-wider mt-1">Sanctuary for Mind</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navList.map((item) => {
          const targetHref = item.href === "/dashboard" ? getCategoryDashboardRoute(category) : item.href;
          const isActive = pathname === targetHref || (targetHref !== "/" && pathname.startsWith(targetHref));
          return (
            <Link
              key={item.href}
              href={targetHref}
              className={`flex flex-col group-hover:flex-row items-center justify-center group-hover:justify-start gap-1 group-hover:gap-3 p-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#0B4F3C]/20 text-[#62B596] border border-[#0B4F3C]/40"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              title={item.label}
            >
              <span className={`material-symbols-outlined text-xl shrink-0 ${isActive ? "text-[#62B596]" : "text-slate-400"}`}>
                {item.icon}
              </span>
              
              {isActive && (
                <span className="text-[8px] font-black uppercase tracking-wider text-[#62B596] block group-hover:hidden transition-all mt-0.5 leading-none">
                  {item.label === "Dashboard" ? "Dash" : item.label.split(" ")[0]}
                </span>
              )}

              <span className="hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 border-t border-white/5 bg-[#080E0C] shrink-0 space-y-3">
        <div className="flex items-center justify-center group-hover:justify-start gap-3 p-2 rounded-[20px] hover:bg-white/5 transition-colors">
          {avatar && avatar.startsWith("data:image/") ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-[#2C2A30] shadow-sm shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-white/10 shadow-sm"
              style={{ backgroundColor: getPastelBgColor(userName), color: getPastelTextColor(userName) }}
            >
              {getInitials(userName)}
            </div>
          )}
          <div className="hidden group-hover:block flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap text-left">
            <p className="text-xs font-extrabold text-white truncate leading-tight">{userName.split(" ")[0]}</p>
            <p className="text-[9px] leading-none truncate mt-0.5 font-bold uppercase text-slate-400">
              {(() => {
                if (!category) return "Student";
                const cat = category.toLowerCase().replace(/[^a-z0-9_]/g, "");
                if (cat === "student") return "Student";
                if (cat === "working_professional" || cat === "workingprofessional" || cat === "young_pro" || cat === "youngprofessional") return "Working Professional";
                if (cat === "parent" || cat === "parents") return "Parent";
                if (cat === "couple" || cat === "couples") return "Couple";
                if (cat === "senior_citizen" || cat === "seniorcitizen") return "Senior Citizen";
                return category;
              })()}
            </p>
          </div>
        </div>

        {/* Streak card (only when sidebar expanded) */}
        <div className="hidden group-hover:block p-3 rounded-2xl bg-[#0B4F3C]/10 border border-[#0B4F3C]/30 text-left">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">🔥</span>
            <div>
              <p className="text-[10px] font-black text-white leading-tight">{streakDays} Day Streak</p>
              <p className="text-[8px] font-bold text-[#62B596] leading-none mt-0.5">Keep going strong!</p>
            </div>
          </div>
        </div>

        {/* Settings & Logout (only when sidebar expanded) */}
        <div className="hidden group-hover:flex items-center justify-between gap-3 text-[10px] pt-2 border-t border-white/5">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white cursor-pointer font-bold transition-colors select-none"
            title="Settings"
          >
            <span className="material-symbols-outlined text-sm shrink-0">settings</span>
            <span>Settings</span>
          </Link>

          <button
            onClick={async () => {
              const { signOut } = await import("@/backend/auth/client");
              await signOut();
              window.location.href = "/login";
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 cursor-pointer font-bold transition-colors select-none"
            title="Logout"
          >
            <span className="material-symbols-outlined text-sm shrink-0">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
