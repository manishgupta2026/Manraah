"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/frontend/lib/constants";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const [userName, setUserName] = useState("Ashutosh Sahu");
  const [avatar, setAvatar] = useState("");
  const [category, setCategory] = useState("student");
  const [streakDays, setStreakDays] = useState(12);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUserName(session.user.sanctuaryName || session.user.name || "Ashutosh Sahu");
      setAvatar(session.user.avatar || "");
      setCategory(session.user.selectedCategory || "student");
      setStreakDays(session.user.streakDays || 12);
    }
  }, []);

  const getCategoryJourney = (cat: string) => {
    const map: Record<string, string> = {
      student: "Student Journey",
      young_pro: "Young Professional",
      youngprofessional: "Young Professional",
      working_professional: "Working Professional",
      workingprofessional: "Working Professional",
      parent: "Parent Journey",
      parents: "Parent Journey",
      couple: "Harmony Journey",
      couples: "Harmony Journey",
      family: "Family Journey",
      women: "Women's Journey",
      men: "Men's Journey",
      senior_citizen: "Golden Journey",
      seniorcitizen: "Golden Journey",
    };
    return map[cat] || "Wellness Journey";
  };

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[80px] lg:w-[260px] bg-white border-r border-surface-variant/40 z-30 shadow-soft transition-all duration-300">
      {/* Brand Header */}
      <div className="p-3 lg:px-5 lg:py-4 flex items-center justify-center lg:justify-start gap-3 border-b border-surface-variant/30 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs shrink-0">
          <span className="material-symbols-outlined text-xl">spa</span>
        </div>
        <div className="hidden lg:block">
          <h1 className="font-heading font-black text-base text-primary leading-tight">Manraah</h1>
          <p className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-wider">Sanctuary for Mind</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 lg:px-3 py-3 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center lg:justify-start gap-3 p-2.5 lg:px-3.5 lg:py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-primary-container/20 text-primary"
                  : "text-on-surface-variant/80 hover:bg-surface-container-low hover:text-primary"
              }`}
              title={item.label}
            >
              <span className={`material-symbols-outlined text-lg shrink-0 ${isActive ? "text-primary" : "text-primary/70"}`}>
                {item.icon}
              </span>
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card (Mockup Design) */}
      <div className="p-3 border-t border-surface-variant/30 bg-surface-container-lowest/60 shrink-0 hidden lg:block">
        <div className="p-3.5 rounded-[20px] bg-white/60 backdrop-blur-xl border border-white/40 shadow-soft-sm space-y-3">
          <div className="flex items-center gap-2.5">
            {avatar && avatar.startsWith("data:image/") ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-primary/25 shadow-xs shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-primary/20"
                style={{ backgroundColor: getPastelBgColor(userName), color: getPastelTextColor(userName) }}
              >
                {getInitials(userName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-on-surface truncate leading-tight">{userName}</p>
              <p className="text-[10px] font-bold text-primary truncate leading-tight mt-0.5">{getCategoryJourney(category)}</p>
            </div>
          </div>
          
          <p className="text-[10px] text-on-surface-variant/80 font-bold leading-normal">
            Day {streakDays} of your wellness journey 🌿
          </p>

          <Link
            href="/profile"
            className="w-full flex items-center justify-between p-2 rounded-xl text-[10px] font-bold text-on-surface-variant hover:bg-primary-container/20 hover:text-primary transition-all bg-white border border-surface-variant/20 shadow-soft-xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">settings</span>
              <span>Settings</span>
            </div>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile Icon profile footer for small screens */}
      <div className="p-2.5 flex items-center justify-center border-t border-surface-variant/30 shrink-0 lg:hidden">
        <Link href="/profile" title={userName}>
          {avatar && avatar.startsWith("data:image/") ? (
            <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-primary/20 shadow-xs" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs"
              style={{ backgroundColor: getPastelBgColor(userName), color: getPastelTextColor(userName) }}
            >
              {getInitials(userName)}
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
