"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import WellnessCompanionPanel from "./WellnessCompanionPanel";
import DashboardHome from "./views/DashboardHome";
import AppointmentsView from "./views/AppointmentsView";
import JourneyView from "./views/JourneyView";
import ResourcesView from "./views/ResourcesView";
import AICompanionView from "./views/AICompanionView";
import HumanCompanionView from "./views/HumanCompanionView";
import JournalView from "./views/JournalView";
import CommunityView from "./views/CommunityView";
import ProfileView from "./views/ProfileView";

export type DashboardSection =
  | "dashboard"
  | "appointments"
  | "journey"
  | "resources"
  | "ai-companion"
  | "human-companion"
  | "journal"
  | "community"
  | "profile";

interface UnifiedDashboardProps {
  initialSection?: DashboardSection;
}

function DashboardContent({ initialSection }: UnifiedDashboardProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Resolve initial section from props, query param, or pathname
  const resolveSection = (): DashboardSection => {
    if (initialSection) return initialSection;

    const tabParam = searchParams?.get("tab");
    if (
      tabParam === "appointments" ||
      tabParam === "journey" ||
      tabParam === "my-journey" ||
      tabParam === "resources" ||
      tabParam === "ai-companion" ||
      tabParam === "human-companion" ||
      tabParam === "journal" ||
      tabParam === "community" ||
      tabParam === "profile"
    ) {
      return tabParam === "my-journey" ? "journey" : tabParam;
    }

    if (pathname.includes("/appointments")) return "appointments";
    if (pathname.includes("/journey") || pathname.includes("/my-journey")) return "journey";
    if (pathname.includes("/resources")) return "resources";
    if (pathname.includes("/ai-companion") || pathname.includes("/messages")) return "ai-companion";
    if (pathname.includes("/human-companion")) return "human-companion";
    if (pathname.includes("/journal")) return "journal";
    if (pathname.includes("/community")) return "community";
    if (pathname.includes("/profile")) return "profile";

    return "dashboard";
  };

  const [activeSection, setActiveSection] = useState<DashboardSection>(resolveSection);

  useEffect(() => {
    const nextSec = resolveSection();
    setActiveSection(nextSec);
  }, [pathname, searchParams, initialSection]);

  const handleNavigate = (section: DashboardSection) => {
    setActiveSection(section);
    if (section === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/${section}`);
    }
  };

  return (
    <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 max-w-[1440px] mx-auto space-y-6">
      {/* ===================================================================== */}
      {/* TWO-COLUMN GRID: FIXED LEFT COLUMN (320px) + MAIN CONTENT COLUMN      */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
        {/* =================================================================== */}
        {/* PERSISTENT STICKY LEFT COMPANION PANEL (Constant across all sections)*/}
        {/* =================================================================== */}
        <aside className="w-full lg:w-[320px] lg:min-w-[320px] lg:max-w-[320px] shrink-0 select-none pointer-events-auto lg:sticky lg:top-[88px] self-start z-10">
          <WellnessCompanionPanel
            onCheckCondition={() => handleNavigate("journey")}
          />
        </aside>

        {/* =================================================================== */}
        {/* DYNAMIC RIGHT MAIN CONTENT AREA                                     */}
        {/* 1. DashboardHome                                                    */}
        {/* 2. AppointmentsView                                                 */}
        {/* 3. JourneyView                                                      */}
        {/* 4. ResourcesView                                                    */}
        {/* 5. AICompanionView                                                  */}
        {/* 6. ProfileView                                                      */}
        {/* =================================================================== */}
        <div className="w-full min-w-0">
          {activeSection === "dashboard" && (
            <DashboardHome onNavigate={handleNavigate} />
          )}
          {activeSection === "appointments" && <AppointmentsView />}
          {activeSection === "journey" && <JourneyView />}
          {activeSection === "resources" && <ResourcesView />}
          {activeSection === "ai-companion" && <AICompanionView />}
          {activeSection === "human-companion" && <HumanCompanionView />}
          {activeSection === "journal" && <JournalView />}
          {activeSection === "community" && <CommunityView />}
          {activeSection === "profile" && <ProfileView />}
        </div>
      </div>
    </main>
  );
}

export default function UnifiedDashboard(props: UnifiedDashboardProps) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-8 text-center text-slate-400 dark:text-[#78958C]">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent {...props} />
    </Suspense>
  );
}
