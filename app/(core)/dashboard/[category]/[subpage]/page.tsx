"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClientSession } from "@/backend/auth/client";
import {
  StudentWellnessContent,
  StudentStudyPlannerContent,
  StudentExamsContent,
  StudentJournalContent,
  StudentSleepContent,
  StudentProfessionalCareContent,
  StudentResourcesContent,
  StudentCommunityContent,
  StudentAnalyticsContent,
  StudentAICompanionContent,
  StudentCheckinContent,
  StudentSettingsContent,
  StudentFocusContent,
} from "@/frontend/components/screens/StudentDashboard";

export default function DynamicSubpageRouter() {
  const params = useParams();
  const router = useRouter();
  const category = (params?.category as string)?.toLowerCase();
  const subpage = (params?.subpage as string)?.toLowerCase();

  // Authentication & category protection check
  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.isAuthenticated) {
      router.replace("/login");
      return;
    }
    const userCategory = (session.user?.selectedCategory || "student").toLowerCase().trim();
    
    // Normalize categories to match properly
    const normUrl = category === "working-professional" ? "working_professional" : category;
    const normUser = userCategory === "working-professional" ? "working_professional" : userCategory;
    
    if (normUrl !== normUser) {
      const correctCategory = userCategory === "working_professional" ? "working-professional" : userCategory;
      router.replace(`/dashboard/${correctCategory}/${subpage}`);
    }
  }, [category, subpage, router]);

  // Map subpage to the appropriate content component
  switch (subpage) {
    case "wellness":
      return <StudentWellnessContent />;
    case "study-planner":
    case "tasks":
      return <StudentStudyPlannerContent />;
    case "exams":
    case "calendar":
      return <StudentExamsContent />;
    case "journal":
      return <StudentJournalContent />;
    case "sleep":
      return <StudentSleepContent />;
    case "professional-care":
      return <StudentProfessionalCareContent />;
    case "resources":
      return <StudentResourcesContent />;
    case "community":
      return <StudentCommunityContent />;
    case "analytics":
      return <StudentAnalyticsContent />;
    case "ai-companion":
      return <StudentAICompanionContent />;
    case "checkin":
      return <StudentCheckinContent />;
    case "settings":
      return <StudentSettingsContent />;
    case "focus":
      return <StudentFocusContent />;
    default:
      return (
        <div className="p-8 text-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Page not found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The requested subpage does not exist.</p>
        </div>
      );
  }
}
