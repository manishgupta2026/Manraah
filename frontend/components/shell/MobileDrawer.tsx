"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MAIN_NAV_ITEMS } from "@/frontend/lib/constants";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string; sanctuaryName?: string; avatar?: string } | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUser(session.user);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40"
      />

      {/* Drawer content */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 35 }}
        className="relative z-50 flex flex-col w-[280px] h-full bg-surface-container-lowest border-r border-surface-variant/40 shadow-2xl p-6 justify-between"
      >
        <div className="space-y-6">
          {/* Header & Brand with Close */}
          <div className="flex items-center justify-between pb-4 border-b border-surface-variant/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-xl">spa</span>
              </div>
              <div>
                <h1 className="font-heading font-black text-lg text-primary leading-tight">Manraah</h1>
                <p className="text-[10px] text-on-surface-variant/70 font-sans">Sanctuary for Mind</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface text-lg">close</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                  }`}
                >
                  <span className={`material-symbols-outlined text-xl shrink-0 ${isActive ? "text-white" : "text-primary/70"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Emergency Crisis Helpline & User Profile Foot */}
        <div className="space-y-3 pt-4 border-t border-surface-variant/30">
          <Link
            href="/crisis-support"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-error-container text-on-error-container hover:bg-error/15 font-semibold text-xs transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-base">emergency</span>
            <span>Support Helpline 24/7</span>
          </Link>

          {(() => {
            const displayName = user?.sanctuaryName || user?.name || "Sanctuary Member";
            const avatarVal = user?.avatar || "";
            const isCustomAvatar = avatarVal.startsWith("data:image/");
            return (
              <Link
                href="/profile"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container transition-colors"
              >
                {isCustomAvatar ? (
                  <img
                    src={avatarVal}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full object-cover border border-primary/20 shrink-0 shadow-xs"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20 shadow-xs transition-all duration-300"
                    style={{ backgroundColor: getPastelBgColor(displayName), color: getPastelTextColor(displayName) }}
                  >
                    {getInitials(displayName)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-on-surface truncate">{displayName}</p>
                  <p className="text-[10px] text-on-surface-variant/70 truncate">Settings & Profile</p>
                </div>
                <span className="material-symbols-outlined text-lg text-outline">settings</span>
              </Link>
            );
          })()}
        </div>
      </motion.aside>
    </div>
  );
}
