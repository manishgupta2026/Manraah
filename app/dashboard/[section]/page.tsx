import UnifiedDashboard, { DashboardSection } from "@/frontend/components/dashboard/UnifiedDashboard";
import { notFound } from "next/navigation";

interface DashboardSectionPageProps {
  params: {
    section: string;
  };
}

const VALID_SECTIONS: DashboardSection[] = [
  "dashboard",
  "appointments",
  "journey",
  "resources",
  "ai-companion",
  "human-companion",
  "journal",
  "community",
  "sleep-meditation",
];

export default function DashboardSectionPage({ params }: DashboardSectionPageProps) {
  const section = params.section as DashboardSection;
  if (!VALID_SECTIONS.includes(section)) {
    notFound();
  }

  return <UnifiedDashboard initialSection={section} />;
}
