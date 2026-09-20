"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userName = user?.sanctuaryName || user?.name || "Sanctuary Member";

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      isActive: pathname === "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "appointments",
      label: "Appointments",
      href: "/appointments",
      isActive: pathname === "/appointments" || pathname.startsWith("/appointments/"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "journey",
      label: "My Journey",
      href: "/journey",
      isActive: pathname === "/journey" || pathname.startsWith("/journey/"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "resources",
      label: "Resources",
      href: "/resources",
      isActive: pathname === "/resources" || pathname.startsWith("/resources/"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "ai-companion",
      label: "AI Companion",
      href: "/ai-companion",
      isActive: pathname === "/ai-companion" || pathname.startsWith("/ai-companion/") || pathname === "/messages",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      id: "human-companion",
      label: "Human Companion",
      href: "/human-companion",
      isActive: pathname === "/human-companion" || pathname.startsWith("/human-companion/") || pathname === "/dashboard/human-companion",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "journal",
      label: "Journal",
      href: "/journal",
      isActive: pathname === "/journal" || pathname.startsWith("/journal/") || pathname === "/dashboard/journal",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: "community",
      label: "Community",
      href: "/community",
      isActive: pathname === "/community" || pathname.startsWith("/community/") || pathname === "/dashboard/community",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-[88px] shrink-0 bg-[#052820] dark:bg-[#0A221C] border-r border-[#0d3b30] dark:border-[#1d3f35] text-white flex flex-col justify-between items-center py-3.5 sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] z-40 select-none transition-colors duration-200 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Navigation Icons Stack */}
      <nav className="flex flex-col items-center gap-1.5 w-full px-1">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-[74px] flex flex-col items-center py-2 px-1 rounded-2xl transition-all ${
              item.isActive
                ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-sm border border-[#008968]/40 dark:border-[#00A982] font-bold"
                : "text-[#8EAAA1] dark:text-[#78958C] hover:text-white dark:hover:text-[#F4FAF7] hover:bg-white/5 font-medium"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1 tracking-tight leading-tight text-center">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Avatar + Profile Name + View Profile */}
      <div className="flex flex-col items-center text-center space-y-1">
        <Link href="/profile" className="hover:opacity-90 transition-opacity">
          <UserAvatar user={user} sizeClass="w-9 h-9 text-xs" />
        </Link>
        <p className="text-[11px] font-bold text-white leading-tight mt-1 truncate max-w-[76px] px-0.5">{userName.split(" ")[0]}</p>
        <Link
          href="/profile"
          className="text-[9px] text-[#8EAAA1] dark:text-[#78958C] hover:text-white transition-colors"
        >
          View Profile
        </Link>
      </div>
    </aside>
  );
}
