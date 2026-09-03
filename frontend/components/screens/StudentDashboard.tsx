"use client";

import React from "react";
import StudentDashboardLayoutShell from "./StudentDashboardLayoutShell";
import { formatDisplayDate } from "@/frontend/lib/date-utils";
import { StudentDashboardProvider } from "./student/context/StudentDashboardContext";
import { StudentDashboardContent } from "./student/views/StudentDashboardHome";

// --- Types & Static Question Data ---
export type { StudyTask, Exam, OnboardingOption, OnboardingQuestion } from "./student/types";
export { ONBOARDING_QUESTIONS } from "./student/types";

// --- Helper Functions ---
export function displayExamDate(dateVal: string | null | undefined): string {
  return formatDisplayDate(dateVal, "Date not scheduled");
}

export function displayTaskDate(dateVal: string | null | undefined): string {
  return formatDisplayDate(dateVal, "No due date");
}

// --- Context & Provider ---
export {
  StudentDashboardContext,
  useStudentDashboard,
  StudentDashboardProvider
} from "./student/context/StudentDashboardContext";

// --- Navigation & Shell Components ---
export { StudentHeader } from "./student/components/StudentHeader";
export { StudentSidebar, renderAvatar } from "./student/components/StudentSidebar";
export { LeaveConfirmationModal } from "./student/components/LeaveConfirmationModal";

// --- Modals Container ---
export { StudentModals } from "./student/components/StudentModals";

// --- Dashboard Views ---
export { StudentDashboardContent } from "./student/views/StudentDashboardHome";
export { StudentWellnessContent } from "./student/views/StudentWellnessView";
export { StudentStudyPlannerContent } from "./student/views/StudentStudyPlannerView";
export { StudentExamsContent } from "./student/views/StudentExamsView";
export { StudentJournalContent } from "./student/views/StudentJournalView";
export { StudentSleepContent } from "./student/views/StudentSleepView";
export { StudentProfessionalCareContent } from "./student/views/StudentProfessionalCareView";
export { StudentResourcesContent } from "./student/views/StudentResourcesView";
export { StudentCommunityContent } from "./student/views/StudentCommunityView";
export { StudentAnalyticsContent } from "./student/views/StudentAnalyticsView";
export { StudentAICompanionContent } from "./student/views/StudentAICompanionView";
export { StudentCheckinContent } from "./student/views/StudentCheckinView";
export { StudentSettingsContent } from "./student/views/StudentSettingsView";
export { StudentFocusContent } from "./student/views/StudentFocusView";

// --- Coordinator Component ---
export default function StudentDashboard() {
  return (
    <StudentDashboardProvider>
      <StudentDashboardLayoutShell>
        <StudentDashboardContent />
      </StudentDashboardLayoutShell>
    </StudentDashboardProvider>
  );
}
