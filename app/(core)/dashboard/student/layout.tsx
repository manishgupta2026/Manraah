"use client";

import React from "react";
import { StudentDashboardProvider } from "@/frontend/components/screens/StudentDashboard";
import StudentDashboardLayoutShell from "@/frontend/components/screens/StudentDashboardLayoutShell";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudentDashboardProvider>
      <StudentDashboardLayoutShell>
        {children}
      </StudentDashboardLayoutShell>
    </StudentDashboardProvider>
  );
}
