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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([
    { id: 1, text: "🌱 Time for reflection: log your mood logs to maintain your streak!", read: false, time: "Just now", icon: "🌱" },
    { id: 2, text: "🧘 New sync breathing pause unlocked in Meditation tab.", read: false, time: "2h ago", icon: "🧘" },
    { id: 3, text: "📅 Upcoming date night or synclist appointment is scheduled today.", read: false, time: "5h ago", icon: "📅" }
  ]);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUser(session.user);
    }
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-surface-container-lowest/90 dark:bg-[#0D1F2D]/90 backdrop-blur-md border-b border-surface-variant/30 dark:border-slate-800/80 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs shrink-0">
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

      <div className="hidden md:flex items-center gap-2 relative bg-surface-container-low/40 dark:bg-[#132E3F]/40 border border-surface-variant/20 dark:border-slate-800 rounded-full px-3.5 py-1.5 w-72 shadow-soft-xs">
        <span className="material-symbols-outlined text-sm text-outline dark:text-slate-400">search</span>
        <input 
          type="text" 
          placeholder="Search Manraah..." 
          className="bg-transparent text-xs text-on-surface-variant dark:text-slate-200 border-none outline-none focus:ring-0 placeholder:text-outline/75 dark:placeholder:text-slate-500 w-full font-bold"
        />
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3 relative">
        {/* Click outside guard overlay */}
        {isNotifOpen && (
          <div 
            className="fixed inset-0 z-40 bg-transparent cursor-default" 
            onClick={() => setIsNotifOpen(false)} 
          />
        )}

        {/* Notification bell */}
        <div 
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          className="relative w-8 h-8 rounded-full bg-white dark:bg-[#132E3F] border border-surface-variant/40 dark:border-slate-800 flex items-center justify-center text-on-surface-variant dark:text-slate-300 cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-[#5F4EA5] dark:hover:text-purple-300 transition-all shadow-2xs z-50"
        >
          <span className="material-symbols-outlined text-base">notifications</span>
          {notifs.filter(n => !n.read).length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center text-[6px] font-black text-white border border-white dark:border-slate-800">
              {notifs.filter(n => !n.read).length}
            </span>
          )}
        </div>

        {/* Notification Dropdown Panel */}
        {isNotifOpen && (
          <div className="absolute right-0 top-10 w-80 bg-white dark:bg-[#132E3F] border border-[#EAEAFF] dark:border-slate-800 rounded-3xl p-4 shadow-xl z-50 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-heading font-black text-xs text-slate-800 dark:text-slate-100">Notifications</h4>
              {notifs.filter(n => !n.read).length > 0 && (
                <button 
                  onClick={() => {
                    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className="text-[9px] font-black text-purple-650 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {notifs.length > 0 ? (
                notifs.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => {
                      setNotifs(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                    }}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex items-start gap-2.5 cursor-pointer relative ${
                      n.read 
                        ? "bg-slate-50 dark:bg-slate-800/35 border-slate-100 dark:border-slate-800/40 opacity-75" 
                        : "bg-[#F5FBF9] dark:bg-emerald-950/10 border-[#E4EFE9]/40 dark:border-emerald-900/20"
                    }`}
                  >
                    <span className="text-sm select-none">{n.icon}</span>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-[10px] text-slate-650 dark:text-slate-350 font-bold leading-normal">{n.text}</p>
                      <span className="text-[8px] text-slate-400 font-bold">{n.time}</span>
                    </div>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-bold text-center py-6">No new notifications. 🌿</p>
              )}
            </div>
          </div>
        )}

        {/* Day / Night Toggle Pill */}
        <ThemeToggle />

        {/* Crisis Help rounded pill */}
        <Link
          href="/crisis-support"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#132E3F] text-red-600 dark:text-red-400 text-xs font-heading font-bold hover:bg-red-50 dark:hover:bg-slate-800 transition-colors shadow-2xs border border-red-200/80 dark:border-red-950/40"
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
