"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useStudentDashboard, StudentSidebar, StudentHeader, StudentModals, LeaveConfirmationModal } from "./StudentDashboard";
import { ErrorBoundary } from "@/frontend/components/ui/ErrorBoundary";

export default function StudentDashboardLayoutShell({ children }: { children: React.ReactNode }) {
  const { isPrivacyPopupOpen, isLeaveModalOpen, setIsLeaveModalOpen, isLoading, error, fetchAllData, user } = useStudentDashboard();
  const pathname = usePathname();

  useEffect(() => {
    // Intercept back button popstate
    const handlePopState = (event: PopStateEvent) => {
      const targetPath = window.location.pathname;
      const session = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("manraah_auth_session") || "null") : null;
      const category = session?.user?.selectedCategory || user?.selectedCategory || "student";
      const expectedPrefix = `/dashboard/${category === "working_professional" ? "working-professional" : category}`;

      if (!targetPath.startsWith(expectedPrefix)) {
        // Force the URL back to what it was
        window.history.pushState({ studentDashboard: true }, "", expectedPrefix);
        setIsLeaveModalOpen(true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [setIsLeaveModalOpen, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#F5FAFB] dark:bg-[#0D1F2D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#5F4EA5]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden">
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
        }
        @keyframes glowSlow {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.15); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        }
        @keyframes orbitSlow {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(1px, -2px); }
          50% { transform: translate(-2px, 1px); }
          75% { transform: translate(-1px, -1px); }
        }
        .animate-float-slow {
          animation: floatSlow 4s infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite ease-in-out;
        }
        .animate-glow-slow {
          animation: glowSlow 4s infinite ease-in-out;
        }
        .animate-orbit-slow {
          animation: orbitSlow 6s infinite ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

      <div className={`min-h-screen w-full bg-[#F5FAFB] dark:bg-[#0D1F2D] text-slate-800 dark:text-slate-100 flex overflow-hidden transition-all duration-500 ${isPrivacyPopupOpen ? "filter blur-[4px] pointer-events-none select-none" : ""}`}>
        {/* Sidebar */}
        <StudentSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto md:pl-[72px]">
          {/* Header */}
          <StudentHeader />
          
          {/* Content */}
          <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
            {error ? (
              <div className="p-8 rounded-[32px] bg-red-50/50 dark:bg-red-950/10 border border-red-200/40 dark:border-red-900/40 text-center space-y-4 max-w-lg mx-auto my-12 shadow-md">
                <span className="text-4xl block font-emoji">⚠️</span>
                <h3 className="text-lg font-heading font-black text-red-650 dark:text-red-400">Unable to load your wellness data</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                  {error}
                </p>
                <button
                  onClick={fetchAllData}
                  className="px-6 py-3 rounded-full bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            )}
          </main>
        </div>
      </div>

      {/* Modals & Overlays */}
      <StudentModals />
      
      {/* Leave Confirmation Overlay */}
      <LeaveConfirmationModal />
    </div>
  );
}
