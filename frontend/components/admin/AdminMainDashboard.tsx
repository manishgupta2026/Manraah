"use client";

import React, { useState } from "react";
import AdminHeader from "./shell/AdminHeader";
import AdminSidebar, { AdminTab } from "./shell/AdminSidebar";
import AdminOverviewTab from "./overview/AdminOverviewTab";
import AdminCompanionController from "./companion/AdminCompanionController";
import UserManagementTab from "./users/UserManagementTab";
import ContentManagementTab from "./content/ContentManagementTab";
import TherapistVerificationTab from "./therapists/TherapistVerificationTab";
import SystemHealthTab from "./system/SystemHealthTab";

interface AdminMainDashboardProps {
  initialTab?: AdminTab;
}

export default function AdminMainDashboard({ initialTab = "COMPANION" }: AdminMainDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col font-sans select-none">
      {/* Top Admin Navigation Header */}
      <AdminHeader />

      {/* Main Layout Area: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Admin Sidebar Navigation */}
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic Tab Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* Mobile Quick Tab Switcher */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface-variant/20">
            {(
              [
                { id: "COMPANION", label: "Human Companion", icon: "record_voice_over" },
                { id: "OVERVIEW", label: "Overview", icon: "monitoring" },
                { id: "USERS", label: "Users", icon: "group" },
                { id: "CONTENT", label: "Content", icon: "spa" },
                { id: "THERAPISTS", label: "Therapists", icon: "verified_user" },
                { id: "SYSTEM", label: "System", icon: "dns" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all border ${
                  activeTab === tab.id
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant border-surface-variant/30"
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Tab View Rendering */}
          {activeTab === "OVERVIEW" && <AdminOverviewTab />}
          {activeTab === "COMPANION" && <AdminCompanionController />}
          {activeTab === "USERS" && <UserManagementTab />}
          {activeTab === "CONTENT" && <ContentManagementTab />}
          {activeTab === "THERAPISTS" && <TherapistVerificationTab />}
          {activeTab === "SYSTEM" && <SystemHealthTab />}
        </main>
      </div>
    </div>
  );
}
