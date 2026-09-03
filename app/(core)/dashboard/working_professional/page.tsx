"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkingProfessionalUnderscoreDashboardPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/working-professional");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B091E]">
      <div className="animate-pulse text-sm text-slate-400">Redirecting to dashboard...</div>
    </div>
  );
}
