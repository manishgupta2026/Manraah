"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientSession } from "@/backend/auth/client";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getClientSession();
    if (session && session.isAuthenticated && session.user) {
      const category = session.user.selectedCategory || "student";
      const target = getCategoryDashboardRoute(category);
      router.replace(target);
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
    </div>
  );
}
