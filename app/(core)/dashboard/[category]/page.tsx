"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardScreen from "@/frontend/components/screens/DashboardScreen";
import WorkingProfessionalDashboard from "@/frontend/components/screens/working-professional/WorkingProfessionalDashboard";

export default function DynamicCategoryDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const rawCat = (params?.category as string)?.toLowerCase()?.trim() || "";

  useEffect(() => {
    if (rawCat === "parent" || rawCat === "parents") {
      router.replace("/dashboard/parents");
    } else if (rawCat === "couple" || rawCat === "couples") {
      router.replace("/dashboard/couple");
    } else if (rawCat === "student") {
      router.replace("/dashboard/student");
    } else if (rawCat === "working_professional") {
      router.replace("/dashboard/working-professional");
    }
  }, [rawCat, router]);

  if (rawCat === "working-professional" || rawCat === "working_professional" || rawCat.includes("working") || rawCat.includes("prof")) {
    return <WorkingProfessionalDashboard />;
  }

  return <DashboardScreen />;
}
