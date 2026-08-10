"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClientSession } from "@/backend/auth/client";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getClientSession();
    if (session && session.isAuthenticated && session.user) {
      const category = session.user.selectedCategory;
      const targetUserType = category === "couples" || category === "couple" ? "couples" : (category === "parents" || category === "parent" ? "parents" : "student");
      router.replace(`/dashboard/${targetUserType}`);
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
