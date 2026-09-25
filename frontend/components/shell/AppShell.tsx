"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { CategoryProvider } from "@/frontend/lib/context/CategoryContext";
import { AssessmentProvider } from "@/frontend/lib/context/AssessmentContext";
import { WellnessProvider } from "@/frontend/lib/context/WellnessContext";
import { WellnessScoreProvider } from "@/frontend/lib/context/WellnessScoreContext";
import { HeaderProvider } from "@/frontend/lib/context/HeaderContext";
import DesktopSidebar from "./DesktopSidebar";
import MobileTabBar from "./MobileTabBar";
import MobileDrawer from "./MobileDrawer";
import Header from "./Header";
import PublicNavbar from "./PublicNavbar";
import PublicFooter from "./PublicFooter";
import AdminHeader from "../admin/shell/AdminHeader";
import { AuthProvider } from "@/frontend/lib/context/AuthContext";
import { ThemeProvider } from "@/frontend/lib/context/ThemeContext";
import WellnessAssessmentModal from "../wellness/WellnessAssessmentModal";
import WellnessBreakdownModal from "../wellness/WellnessBreakdownModal";
import WellnessReattemptModal from "../wellness/WellnessReattemptModal";
import DailyCheckInModal from "../wellness/DailyCheckInModal";
import LoginWellnessPrompt from "../wellness/LoginWellnessPrompt";
import ProfileChangeAssessmentPrompt from "../wellness/ProfileChangeAssessmentPrompt";

const STANDALONE_ROUTES = [
  "/",
  "/how-it-works",
  "/our-solution",
  "/features",
  "/stories",
  "/blog",
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
    pathname.startsWith("/our-solution") ||
    pathname.startsWith("/features") ||
    pathname.startsWith("/stories") ||
    pathname.startsWith("/blog") ||
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
      <AuthProvider>
        <CategoryProvider>
          <AssessmentProvider>
            <WellnessProvider>
              <WellnessScoreProvider>
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
                    /* ONE UNIFIED AUTHENTICATED APPLICATION SHELL FOR ALL USER FEATURES */
                    <div className="min-h-screen bg-[#F4F9F6] dark:bg-[#071C17] text-[#211D26] dark:text-[#F4FAF7] font-sans antialiased flex flex-col transition-colors duration-200">
                      {/* Top Unified Header / Navbar (Compact 62px Height) */}
                      <Header onOpenMenu={() => setIsMobileDrawerOpen(true)} />

                      {/* Body Container: Fixed 88px Sidebar + Scrollable Feature Content */}
                      <div className="flex-1 flex w-full">
                        {/* Fixed 88px Sidebar */}
                        <div className="hidden md:block">
                          <DesktopSidebar />
                        </div>

                        {/* Main Feature Content Area */}
                        <div className="flex-1 min-w-0 pb-16 md:pb-0">
                          {children}
                        </div>
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

                  {/* Global Daily Check-In & Wellness Score Assessment Modals */}
                  <DailyCheckInModal />
                  <WellnessAssessmentModal />
                  <WellnessBreakdownModal />
                  <WellnessReattemptModal />
                  <LoginWellnessPrompt />
                  <ProfileChangeAssessmentPrompt />
                </HeaderProvider>
              </WellnessScoreProvider>
            </WellnessProvider>
          </AssessmentProvider>
        </CategoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
