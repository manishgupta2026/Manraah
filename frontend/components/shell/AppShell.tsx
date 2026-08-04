"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CategoryProvider } from "@/frontend/lib/context/CategoryContext";
import { AssessmentProvider } from "@/frontend/lib/context/AssessmentContext";
import DesktopSidebar from "./DesktopSidebar";
import MobileTabBar from "./MobileTabBar";
import Header from "./Header";

const STANDALONE_ROUTES = [
  "/",
  "/category-selection",
  "/assessment",
  "/wellness-score",
  "/login",
  "/signup",
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  return (
    <CategoryProvider>
      <AssessmentProvider>
        {isStandalone ? (
          /* Standalone Onboarding / Auth Layout (No Navigation Shell) */
          <div className="min-h-screen bg-background text-on-background font-sans antialiased">
            {children}
          </div>
        ) : (
          /* Main Application Shell with Sidebar & Header */
          <div className="flex min-h-screen bg-background text-on-background font-sans antialiased overflow-hidden">
            {/* Desktop Left Sidebar */}
            <DesktopSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-[80px] lg:ml-[280px] h-screen overflow-y-auto pb-20 md:pb-8">
              <Header />
              <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileTabBar />
          </div>
        )}
      </AssessmentProvider>
    </CategoryProvider>
  );
}
