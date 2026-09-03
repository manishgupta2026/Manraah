"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkingProfessionalDashboard from "@/frontend/components/screens/working-professional/WorkingProfessionalDashboard";

export default function WorkingProfessionalUnderscoreDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/working-professional");
  }, [router]);
  return <WorkingProfessionalDashboard />;
}
