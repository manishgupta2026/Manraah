"use client";

import React, { useState } from "react";
import AdminSidebar, { AdminTab } from "./shell/AdminSidebar";
import DashboardOverview from "../screens/admin/DashboardOverview";
import HumanCompanionNetworkOps from "../screens/admin/HumanCompanionNetworkOps";
import UserManagementTable from "../screens/admin/UserManagementTable";
import ResourceLibraryManagement from "../screens/admin/ResourceLibraryManagement";
import TherapistVerificationQueue from "../screens/admin/TherapistVerificationQueue";
import AdminSettings from "../screens/admin/AdminSettings";

interface AdminMainDashboardProps {
  initialTab?: AdminTab;
}

export default function AdminMainDashboard({ initialTab = "COMPANION" }: AdminMainDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background text-on-background font-sans select-none">
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {activeTab === "OVERVIEW" && <DashboardOverview />}
          {activeTab === "COMPANION" && <HumanCompanionNetworkOps />}
          {activeTab === "USERS" && <UserManagementTable />}
          {activeTab === "CONTENT" && <ResourceLibraryManagement />}
          {activeTab === "THERAPISTS" && <TherapistVerificationQueue />}
          {activeTab === "SYSTEM" && <AdminSettings />}
        </main>
      </div>
    </div>
  );
}
