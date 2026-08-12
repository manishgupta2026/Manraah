"use client";

import React, { useState, useEffect } from "react";
import MarketingLandingPage from "@/frontend/components/screens/MarketingLandingPage";
import InitialQuestionsFlow from "@/frontend/components/screens/InitialQuestionsFlow";

export default function Home() {
  const [hasCompletedInitial, setHasCompletedInitial] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const isCompleted = localStorage.getItem("manraah_initial_questions_completed") === "true";
      setHasCompletedInitial(isCompleted);
    } catch {
      setHasCompletedInitial(true);
    }
  }, []);

  // Avoid layout flash before local storage is read
  if (hasCompletedInitial === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFDF4] via-[#F2EEFC] to-[#ECE5F5]">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!hasCompletedInitial) {
    return <InitialQuestionsFlow onComplete={() => setHasCompletedInitial(true)} />;
  }

  return <MarketingLandingPage />;
}

