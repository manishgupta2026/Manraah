"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import UserAvatar from "@/frontend/components/ui/UserAvatar";
import { useStudentDashboard } from "@/frontend/components/screens/student/context/StudentDashboardContext";

// --- Initials Avatar Fallback Helper ---
export const renderAvatar = (user: any, sizeClass = "w-9 h-9 text-xs") => {
  return <UserAvatar user={user} sizeClass={sizeClass} />;
};

// --- Left Sidebar Component ---
export function StudentSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isDarkMode, setActiveModal, setIsLeaveModalOpen } = useStudentDashboard();
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryDisplayName = (cat: string) => {
    if (!cat) return "Student";
    return cat
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
  const isWpPath = pathname?.includes("working-professional") || pathname?.includes("working_professional");
  const category = isWpPath 
    ? "working-professional" 
    : (session?.user?.selectedCategory || user?.selectedCategory || "student").toLowerCase().trim();
  const isStudent = !isWpPath && category === "student";
  const categorySlug = isWpPath ? "working-professional" : (category === "working_professional" ? "working-professional" : category);

  const groups = isStudent
    ? [
        {
          title: "MAIN",
          items: [
            { label: "Dashboard", icon: "dashboard", href: "/dashboard/student" },
            { label: "AI Companion", icon: "smart_toy", href: "/dashboard/student/ai-companion" },
            { label: "Daily Check-in", icon: "mood", href: "/dashboard/student/checkin" },
          ]
        },
        {
          title: "STUDY",
          items: [
            { label: "Focus Timer", icon: "timer", href: "/dashboard/student/focus" },
            { label: "Study Planner", icon: "assignment", href: "/dashboard/student/study-planner" },
            { label: "Exams", icon: "school", href: "/dashboard/student/exams" },
            { label: "Analytics", icon: "bar_chart", href: "/dashboard/student/analytics" },
          ]
        },
        {
          title: "WELLNESS",
          items: [
            { label: "Wellness", icon: "spa", href: "/dashboard/student/wellness" },
            { label: "Journal", icon: "auto_stories", href: "/dashboard/student/journal" },
            { label: "Sleep", icon: "bedtime", href: "/dashboard/student/sleep" },
          ]
        },
        {
          title: "SUPPORT",
          items: [
            { label: "Resources", icon: "library_books", href: "/dashboard/student/resources" },
            { label: "Community", icon: "forum", href: "/dashboard/student/community" },
            { label: "Professional Care", icon: "medical_services", href: "/dashboard/student/professional-care" },
          ]
        },
        {
          title: "ACCOUNT",
          items: [
            { label: "Settings", icon: "settings", href: "/dashboard/student/settings" },
          ]
        }
      ]
    : [
        {
          title: "MAIN",
          items: [
            { label: "Dashboard", icon: "dashboard", href: "/dashboard/working-professional" },
            { label: "AI Companion", icon: "smart_toy", href: "/dashboard/working-professional/ai-companion" },
            { label: "Daily Check-in", icon: "mood", href: "/dashboard/working-professional/checkin" },
          ]
        },
        {
          title: "WORK",
          items: [
            { label: "Focus Timer", icon: "timer", href: "/dashboard/working-professional/focus" },
            { label: "Task Manager", icon: "assignment", href: "/dashboard/working-professional/study-planner" },
            { label: "Calendar", icon: "calendar_month", href: "/dashboard/working-professional/calendar" },
            { label: "Meetings", icon: "groups", href: "/dashboard/working-professional/meetings" },
            { label: "Analytics", icon: "bar_chart", href: "/dashboard/working-professional/analytics" },
          ]
        },
        {
          title: "WELLNESS",
          items: [
            { label: "Wellness", icon: "spa", href: "/dashboard/working-professional/wellness" },
            { label: "Journal", icon: "auto_stories", href: "/dashboard/working-professional/journal" },
            { label: "Sleep", icon: "bedtime", href: "/dashboard/working-professional/sleep" },
          ]
        },
        {
          title: "SUPPORT",
          items: [
            { label: "Resources", icon: "library_books", href: "/dashboard/working-professional/resources" },
            { label: "Community", icon: "forum", href: "/dashboard/working-professional/community" },
            { label: "Professional Care", icon: "medical_services", href: "/dashboard/working-professional/professional-care" },
          ]
        },
        {
          title: "ACCOUNT",
          items: [
            { label: "Settings", icon: "settings", href: "/dashboard/working-professional/settings" },
          ]
        }
      ];

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: isHovered ? "230px" : "72px",
        transition: "width 200ms ease-in-out",
      }}
      className={`hidden md:flex fixed top-0 left-0 bottom-0 h-screen z-50 select-none flex-col justify-between shadow-lg shrink-0 border-r overflow-hidden ${
        isDarkMode
          ? "bg-[#100E26] text-slate-350 border-white/5"
          : "bg-white text-slate-700 border-slate-200"
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Logo Brand Header */}
        <div className="px-[18px] py-4 flex items-center shrink-0 mb-4 mt-2 h-16">
          <div className="w-9 h-9 rounded-xl bg-[#5F4EA5] flex items-center justify-center text-white shadow-md shrink-0">
            <span className="material-symbols-outlined text-xl font-black select-none">spa</span>
          </div>
          <div
            className={`text-left flex flex-col justify-center transition-all duration-200 overflow-hidden ${
              isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
            }`}
          >
            <h1 className={`font-heading font-black text-sm leading-none ${isDarkMode ? "text-white" : "text-[#100E26]"}`}>
              Manraah
            </h1>
            <p className="text-[9px] text-[#8E8A9F] font-bold uppercase tracking-wider mt-1 leading-none">
              Sanctuary for Mind
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {groups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <span
                className={`text-[9px] font-black tracking-widest px-4 block uppercase transition-all duration-200 overflow-hidden ${
                  isHovered ? "opacity-75 h-auto mt-2 mb-1" : "opacity-0 h-0"
                } ${isDarkMode ? "text-purple-400/70" : "text-[#5F4EA5]/70"}`}
              >
                {group.title}
              </span>
              <div className="space-y-1">
                {group.items.map((item, idx) => {
                  const isActive = pathname === item.href || (item.href !== `/dashboard/${categorySlug}` && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      prefetch={true}
                      aria-label={item.label}
                      className={`w-full flex items-center h-[38px] px-3 gap-0 rounded-xl transition-all duration-200 group/item relative select-none cursor-pointer ${
                        isHovered ? "justify-start" : "justify-center"
                      } ${
                        isActive
                          ? isDarkMode
                            ? "bg-[#5F4EA5] text-white shadow-[0_4px_12px_rgba(95,78,165,0.25)] font-black"
                            : "bg-[#F5F3FC] text-[#5F4EA5] font-black"
                          : isDarkMode
                            ? "text-[#8E8A9F] hover:bg-white/[0.05] hover:text-white"
                            : "text-slate-555 hover:bg-[#F5F3FC]/60 hover:text-[#5F4EA5]"
                      }`}
                    >
                      <div className="w-5 h-5 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/item:translate-x-0.5 select-none">
                          {item.icon}
                        </span>
                      </div>
                      <span
                        className={`text-[12px] font-bold leading-none tracking-normal whitespace-nowrap transition-all duration-200 ${
                          isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Profile Footer Panel */}
      <div
        className={`p-3 border-t shrink-0 ${
          isDarkMode
            ? "bg-[#0A091A] border-white/5"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div
          onClick={() => setActiveModal("profile")}
          className={`flex items-center p-2 rounded-xl transition-colors cursor-pointer ${
            isHovered ? "justify-between" : "justify-center"
          } ${
            isDarkMode
              ? "hover:bg-white/5"
              : "hover:bg-slate-200/50"
          }`}
        >
          <div className="flex items-center">
            {renderAvatar(user, "w-8 h-8 text-[10px] shrink-0")}
            <div
              className={`text-left flex flex-col justify-center transition-all duration-200 overflow-hidden ${
                isHovered ? "opacity-100 ml-3 max-w-[120px]" : "opacity-0 w-0 pointer-events-none"
              }`}
            >
              <p className={`text-xs font-semibold leading-tight truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                {user?.name || "Member"}
              </p>
              <span className="text-[9px] text-[#8E8A9F] font-bold block mt-0.5 leading-none">
                {getCategoryDisplayName(user?.selectedCategory || "student")}
              </span>
            </div>
          </div>
          {isHovered && (
            <span className="material-symbols-outlined text-[16px] text-[#8E8A9F] select-none">expand_more</span>
          )}
        </div>

        {/* Settings & Logout */}
        <div
          className={`border-t mt-2 pt-2 flex flex-col gap-0.5 ${
            isDarkMode ? "border-white/5" : "border-slate-200"
          }`}
        >
          <button
            onClick={() => router.push(`/dashboard/${categorySlug}/settings`)}
            aria-label="Settings"
            className={`w-full flex items-center h-[36px] px-3 gap-0 rounded-xl transition-all duration-200 group/settings cursor-pointer ${
              isHovered ? "justify-start" : "justify-center"
            } ${
              isDarkMode
                ? "text-[#8E8A9F] hover:bg-white/[0.05] hover:text-white"
                : "text-slate-555 hover:bg-[#F5F3FC]/50 hover:text-slate-800"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/settings:translate-x-0.5 select-none">
                settings
              </span>
            </div>
            <span
              className={`text-[12px] font-bold leading-none tracking-normal transition-all duration-200 ${
                isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
              }`}
            >
              Settings
            </span>
          </button>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            aria-label="Logout"
            className={`w-full flex items-center h-[36px] px-3 gap-0 rounded-xl transition-all duration-200 group/logout cursor-pointer ${
              isHovered ? "justify-start" : "justify-center"
            } ${
              isDarkMode
                ? "text-red-400/85 hover:bg-red-500/10 hover:text-red-300"
                : "text-red-500 hover:bg-red-50/50 hover:text-red-650"
            }`}
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover/logout:translate-x-0.5 select-none">
                logout
              </span>
            </div>
            <span
              className={`text-[12px] font-bold leading-none tracking-normal transition-all duration-200 ${
                isHovered ? "opacity-100 ml-3" : "opacity-0 w-0 pointer-events-none"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
