"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { getClientSession } from "@/backend/auth/client";

import WelcomeHero from "./WelcomeHero";
import DailyCheckinCard from "./DailyCheckinCard";
import WorkLifeBalanceCard from "./WorkLifeBalanceCard";
import SanctuaryScoreCard from "./SanctuaryScoreCard";
import DecompressCard from "./DecompressCard";
import BreathingResetModal from "./BreathingResetModal";
import AICompanionOrbCard from "./AICompanionOrbCard";
import WorkdayReflectionCard from "./WorkdayReflectionCard";
import WellnessTrendCard from "./WellnessTrendCard";
import DailyInsightCard from "./DailyInsightCard";

// Container stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 95, damping: 15 },
  },
};

export default function WorkingProfessionalDashboard() {
  const router = useRouter();
  const { dashboardData, submitCheckIn, refetchDashboardData, isLoading } = useWellness();
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState<boolean>(false);
  const [wpData, setWpData] = useState<any | null>(null);

  // Progressive parallel fetch for working-professional-specific balance and reflections
  const loadWpData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/working-professional");
      if (res.ok) {
        const json = await res.json();
        setWpData(json);
      }
    } catch (err) {
      console.warn("Could not fetch working professional details:", err);
    }
  }, []);

  useEffect(() => {
    loadWpData();
  }, [loadWpData]);

  // Auth guard
  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.isAuthenticated) {
      router.push("/login");
    }
  }, [router]);

  // Handle saving check-in dynamically
  const handleSaveCheckin = async (payload: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
  }) => {
    try {
      await submitCheckIn(payload);
      await loadWpData();
      return true;
    } catch (err) {
      console.error("Check-in error:", err);
      return false;
    }
  };

  // Handle saving workday reflection dynamically
  const handleSaveReflection = async (content: string) => {
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title: "Workday Decompression",
          category: "Workday Decompression",
          moodTag: dashboardData?.todayMood?.mood || "Calm",
        }),
      });
      if (res.ok) {
        await loadWpData();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Reflection save error:", err);
      return false;
    }
  };

  const user = wpData?.user || dashboardData?.user;
  const sanctuaryName = user?.sanctuaryName || user?.name || "Gentle Willow";
  const streakDays = wpData?.streak?.currentStreak || dashboardData?.streak?.currentStreak || user?.streakDays || 3;
  const todayMood = wpData?.todayMood || dashboardData?.todayMood;
  const score = user?.assessmentPercentage || user?.assessmentScore || 75;
  const level = user?.wellnessLevel || "Stable";
  const history = wpData?.history || dashboardData?.history || dashboardData?.moodHistory || [];
  const balance = wpData?.balance;
  const latestReflection = wpData?.recentReflections?.[0]?.content || "";
  const oneInsight = wpData?.insights?.[0]?.insightText || dashboardData?.insights?.[0]?.insightText;

  return (
    <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4 space-y-6 select-none animate-fadeIn">
      {/* 1. First View / Hero Section (occupies 35-40% of viewport) */}
      <WelcomeHero
        sanctuaryName={sanctuaryName}
        streakDays={streakDays}
        onOpenReset={() => setIsBreathingModalOpen(true)}
        onOpenAI={() => router.push("/ai-chat")}
      />

      {/* Main Bento Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* ROW 1: Today's Check-in (col-span-7) + Decompress Card (col-span-5) */}
        <motion.div variants={cardVariants} className="col-span-12 md:col-span-7">
          <DailyCheckinCard
            todayMood={todayMood}
            onSaveCheckin={handleSaveCheckin}
          />
        </motion.div>

        <motion.div variants={cardVariants} className="col-span-12 md:col-span-5">
          <DecompressCard
            onStartReset={() => setIsBreathingModalOpen(true)}
          />
        </motion.div>

        {/* ROW 2: Work/Life Balance (col-span-6) + Sanctuary Score (col-span-6) */}
        <motion.div variants={cardVariants} className="col-span-12 md:col-span-6">
          <WorkLifeBalanceCard balance={balance} />
        </motion.div>

        <motion.div variants={cardVariants} className="col-span-12 md:col-span-6">
          <SanctuaryScoreCard score={score} level={level} />
        </motion.div>

        {/* ROW 3: AI Companion (col-span-6) + Workday Reflection (col-span-6) */}
        <motion.div variants={cardVariants} className="col-span-12 md:col-span-6">
          <AICompanionOrbCard todayMood={todayMood} />
        </motion.div>

        <motion.div variants={cardVariants} className="col-span-12 md:col-span-6">
          <WorkdayReflectionCard
            initialReflection={latestReflection}
            onSaveReflection={handleSaveReflection}
          />
        </motion.div>

        {/* ROW 4: 7-Day Wellness Trend (col-span-12) */}
        <motion.div variants={cardVariants} className="col-span-12">
          <WellnessTrendCard history={history} />
        </motion.div>

        {/* ROW 5: Single Daily Insight (col-span-12) */}
        <motion.div variants={cardVariants} className="col-span-12">
          <DailyInsightCard customInsight={oneInsight} />
        </motion.div>
      </motion.div>

      {/* Interactive 2-Minute Breathing Reset Modal */}
      <BreathingResetModal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
      />
    </div>
  );
}
