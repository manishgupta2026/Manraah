"use client";

import React from "react";
import { useParams } from "next/navigation";
import { StudentDashboardProvider } from "@/frontend/components/screens/StudentDashboard";
import StudentDashboardLayoutShell from "@/frontend/components/screens/StudentDashboardLayoutShell";

export default function DynamicCategoryDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const category = (params?.category as string)?.toLowerCase();

  // Wrap specified custom dashboard categories in the new shell
  const isCustomShell = category === "student" || 
                        category === "working-professional" || 
                        category === "working_professional";

  if (isCustomShell) {
    return (
      <StudentDashboardProvider>
        <StudentDashboardLayoutShell>
          {children}
        </StudentDashboardLayoutShell>
      </StudentDashboardProvider>
    );
  }

  return <>{children}</>;
}
