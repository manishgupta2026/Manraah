"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";
import { motion, AnimatePresence } from "framer-motion";

import ThemeToggle from "@/frontend/components/ui/ThemeToggle";

interface HeaderProps {
  onOpenMenu?: () => void;
}

export default function Header({ onOpenMenu }: HeaderProps) {
  const [user, setUser] = useState<{ name?: string; sanctuaryName?: string; email: string; avatar?: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: "spa",
      text: "New wellness check-in available! Fill in your daily mood.",
      time: "Just now",
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      id: 2,
      icon: "emoji_events",
      text: "Sanctuary goals updated. 3 active challenges remain.",
      time: "2 hours ago",
      color: "text-[#7C6BC4] bg-[#7C6BC4]/10 dark:bg-purple-950/20"
    },
    {
      id: 3,
      icon: "chat",
      text: "Your AI companion left a message: 'How are you feeling today?'",
      time: "Today",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20"
    }
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
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(prev => !prev)}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#132E3F] border border-surface-variant/40 dark:border-slate-800 flex items-center justify-center text-on-surface-variant dark:text-slate-333 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-[#5F4EA5] dark:hover:text-purple-300 transition-all shadow-2xs relative active:scale-95"
          >
            <span className="material-symbols-outlined text-base">notifications</span>
            {notifications.length > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 flex items-center justify-center text-[6px] font-black text-white border border-white dark:border-slate-800">
                {notifications.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Click Outside Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2.5 w-72 bg-white dark:bg-[#132E3F] border border-slate-100 dark:border-slate-800 rounded-3xl p-4 shadow-xl z-50 space-y-3 text-left font-sans"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                    <h4 className="text-[10px] uppercase font-black tracking-wider text-[#7C6BC4] dark:text-purple-300">Notifications</h4>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[9px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-[10px] font-bold">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="flex items-start gap-2.5 text-[10px] leading-relaxed border-b border-slate-50 dark:border-slate-800/40 pb-2.5 last:border-b-0 last:pb-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                            <span className="material-symbols-outlined text-xs">{n.icon}</span>
                          </div>
                          <div>
                            <p className="text-slate-700 dark:text-slate-200 font-bold">
                              {n.text}
                            </p>
                            <span className="text-[8px] text-slate-450">{n.time}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
