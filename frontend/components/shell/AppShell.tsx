"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CategoryProvider } from "@/frontend/lib/context/CategoryContext";
import { AssessmentProvider } from "@/frontend/lib/context/AssessmentContext";
import { WellnessProvider } from "@/frontend/lib/context/WellnessContext";
import { HeaderProvider } from "@/frontend/lib/context/HeaderContext";
import DesktopSidebar from "./DesktopSidebar";
import MobileTabBar from "./MobileTabBar";
import MobileDrawer from "./MobileDrawer";
import Header from "./Header";
import PublicNavbar from "./PublicNavbar";
import AdminHeader from "../admin/shell/AdminHeader";

const STANDALONE_ROUTES = [
  "/",
  "/about",
  "/category-selection",
  "/assessment",
  "/wellness-score",
  "/login",
  "/signup",
  "/forgot-password",
  "/terms",
  "/privacy",
  "/security",
  "/contact",
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isStandalone =
    STANDALONE_ROUTES.includes(pathname) ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/security") ||
    pathname.startsWith("/contact");

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/companion");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Listen for custom menu drawer trigger
  useEffect(() => {
    const handleOpen = () => setIsMobileDrawerOpen(true);
    window.addEventListener("open-mobile-drawer", handleOpen);
    return () => window.removeEventListener("open-mobile-drawer", handleOpen);
  }, []);

  return (
    <CategoryProvider>
      <AssessmentProvider>
        <WellnessProvider>
          <HeaderProvider>
            {isStandalone ? (
              /* Standalone Onboarding / Auth / Public Layout with Global Public Header */
              <div className="min-h-screen bg-background text-on-background font-sans antialiased flex flex-col">
                <PublicNavbar />
                <div className="flex-1">{children}</div>
              </div>
            ) : isAdminRoute ? (
              /* Dedicated Admin Listener Portal Shell - Isolated from Regular User Navigation */
              <div className="min-h-screen bg-background text-on-background font-sans antialiased flex flex-col">
                <AdminHeader />
                <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
                  {children}
                </main>
              </div>
            ) : (
              /* Main Regular User Application Shell with Sidebar & Header */
              <div className="flex min-h-screen bg-background text-on-background font-sans antialiased overflow-hidden">
                {/* Desktop Left Sidebar */}
                <DesktopSidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-[80px] lg:ml-[260px] h-screen overflow-y-auto pb-16 md:pb-6">
                  <Header onOpenMenu={() => setIsMobileDrawerOpen(true)} />
                  <main className="flex-1 px-3 md:px-6 py-4 max-w-7xl mx-auto w-full">
                    {children}
                  </main>
                </div>

                {/* Mobile Animated Drawer navigation overlay */}
                <AnimatePresence>
                  {isMobileDrawerOpen && (
                    <MobileDrawer
                      isOpen={isMobileDrawerOpen}
                      onClose={() => setIsMobileDrawerOpen(false)}
                    />
                  )}
                </AnimatePresence>

                {/* Mobile Bottom Navigation Bar */}
                <MobileTabBar />
              </div>
            )}
          </HeaderProvider>
        </WellnessProvider>
      </AssessmentProvider>
    </CategoryProvider>
  );
}
