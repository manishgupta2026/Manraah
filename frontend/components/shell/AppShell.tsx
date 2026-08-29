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
import PublicFooter from "./PublicFooter";
import AdminHeader from "../admin/shell/AdminHeader";

import { ThemeProvider } from "@/frontend/lib/context/ThemeContext";

const STANDALONE_ROUTES = [
  "/",
  "/how-it-works",
  "/features",
  "/stories",
  "/faq",
  "/for-you",
  "/privacy-and-trust",
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
    pathname.startsWith("/how-it-works") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/stories") ||
    pathname.startsWith("/faq") ||
    pathname.startsWith("/for-you") ||
    pathname.startsWith("/privacy-and-trust") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/category-selection") ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/wellness-score") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
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
    <ThemeProvider>
      <CategoryProvider>
        <AssessmentProvider>
          <WellnessProvider>
            <HeaderProvider>
            {isStandalone ? (
              /* Standalone Onboarding / Auth / Public Layout with Global Public Header & Footer */
              <div className="min-h-screen bg-background text-on-background font-sans antialiased flex flex-col justify-between overflow-hidden">
                {!["/assessment", "/wellness-score", "/category-selection"].includes(pathname) && <PublicNavbar />}
                <div className="flex-1 h-full w-full overflow-hidden">{children}</div>
                {!["/assessment", "/wellness-score", "/category-selection"].includes(pathname) && <PublicFooter />}
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
              pathname.startsWith("/dashboard/student") ||
              pathname.startsWith("/dashboard/working-professional") ||
              pathname.startsWith("/dashboard/working_professional") ||
              pathname.startsWith("/dashboard/couple")
            ) ? (
              /* Dedicated Student Dashboard Custom Layout (Exact Match with Reference Image) */
              <div className="min-h-screen w-full bg-[#F5FAFB] dark:bg-[#0D1F2D] text-slate-800 dark:text-slate-100 font-sans antialiased flex overflow-hidden">
                {children}
              </div>
            ) : (
              /* Main Regular User Application Shell with Sidebar & Header */
              <div className="flex min-h-screen bg-background dark:bg-[#0D1F2D] text-on-background dark:text-slate-100 font-sans antialiased overflow-hidden">
                {/* Desktop Left Sidebar */}
                <DesktopSidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-[76px] lg:ml-[76px] h-screen overflow-y-auto pb-16 md:pb-6 bg-background dark:bg-[#0D1F2D]">
                  <Header onOpenMenu={() => setIsMobileDrawerOpen(true)} />
                  <main className={`flex-1 w-full ${pathname.startsWith("/dashboard/working-professional") ? "max-w-none px-[28px] lg:px-[36px] py-[24px] lg:py-[32px]" : "px-3 md:px-6 py-4 max-w-7xl mx-auto"}`}>
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
  </ThemeProvider>
  );
}
