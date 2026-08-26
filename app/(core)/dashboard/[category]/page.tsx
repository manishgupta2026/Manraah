"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardScreen from "@/frontend/components/screens/DashboardScreen";

export default function DynamicCategoryDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const category = params?.category as string;

  useEffect(() => {
    if (category) {
      const c = category.toLowerCase().trim();
      if (c === "parent" || c === "parents") {
        router.replace("/dashboard/parents");
      } else if (c === "couple" || c === "couples") {
        router.replace("/dashboard/couple");
      }
    }
  }, [category, router]);

  return <DashboardScreen />;
}
