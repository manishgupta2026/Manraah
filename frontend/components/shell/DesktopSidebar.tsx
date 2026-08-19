"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/frontend/lib/constants";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";
import { useCategory } from "@/frontend/lib/context/CategoryContext";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { category } = useCategory();
  const [userName, setUserName] = useState("Ashutosh Sahu");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUserName(session.user.sanctuaryName || session.user.name || "Ashutosh Sahu");
      setAvatar(session.user.avatar || "");
    }
  }, []);

  return (
    <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-[76px] hover:w-[240px] bg-[#121212] border-r border-[#2C2A30] z-40 shadow-xl transition-all duration-300 ease-in-out group select-none text-slate-300">
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-[#2C2A30] shrink-0 h-16">
        <div className="w-10 h-10 rounded-2xl bg-[#E37A47] flex items-center justify-center text-white shadow-md shrink-0">
          <span className="material-symbols-outlined text-2xl font-black">spa</span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
          <h1 className="font-heading font-black text-sm text-white leading-tight">Manraah</h1>
          <p className="text-[9px] text-[#A6A4AD] font-bold uppercase tracking-wider">Sanctuary for Mind</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-2.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {MAIN_NAV_ITEMS.map((item) => {
          const targetHref = item.href === "/dashboard" ? `/dashboard/${category}` : item.href;
          const isActive = pathname === targetHref || (targetHref !== "/" && pathname.startsWith(targetHref));
          return (
            <Link
              key={item.href}
              href={targetHref}
              className={`flex flex-col group-hover:flex-row items-center justify-center group-hover:justify-start gap-1 group-hover:gap-3 p-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#E37A47]/15 text-[#E37A47] border border-[#E37A47]/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              title={item.label}
            >
              <span className={`material-symbols-outlined text-xl shrink-0 ${isActive ? "text-[#E37A47]" : "text-slate-400"}`}>
                {item.icon}
              </span>
              
              {/* Text for collapsed active item label (mockup style) */}
              {isActive && (
                <span className="text-[8px] font-black uppercase tracking-wider text-[#E37A47]/90 block group-hover:hidden transition-all mt-0.5 leading-none">
                  {item.label === "Dashboard" ? "Dash" : item.label.split(" ")[0]}
                </span>
              )}

              {/* Expanded text label */}
              <span className="hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 border-t border-[#2C2A30] bg-[#1A1A1A] shrink-0">
        <Link
          href="/profile"
          className="flex items-center justify-center group-hover:justify-start gap-3 p-2 rounded-[20px] hover:bg-white/5 transition-colors cursor-pointer"
        >
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
            <p className="text-xs font-extrabold text-white truncate leading-tight">{userName}</p>
            <p className="text-[9px] text-slate-400 truncate leading-tight mt-0.5">Settings & Profile</p>
          </div>
          <span className="material-symbols-outlined text-lg text-slate-400 hidden group-hover:block shrink-0">settings</span>
        </Link>
      </div>
    </aside>
  );
}
