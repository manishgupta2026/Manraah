"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { getClientSession } from "@/backend/auth/client";

import WorkingProfessionalHero from "./WorkingProfessionalHero";
import ArrivingCheckInCard from "./ArrivingCheckInCard";
import YourBalanceCard from "./YourBalanceCard";
import SanctuaryScoreCard from "./SanctuaryScoreCard";
import LeaveWorkAtWorkCard from "./LeaveWorkAtWorkCard";
import SomethingOnYourMindCard from "./SomethingOnYourMindCard";
import EveningReflectionCard from "./EveningReflectionCard";
import YourWeekGentlyCard from "./YourWeekGentlyCard";
import DailyInsightCard from "./DailyInsightCard";
import BreathingModal from "./BreathingModal";

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 },
  },
};

export default function WorkingProfessionalDashboard() {
  const router = useRouter();
  const { dashboardData, submitCheckIn, isLoading } = useWellness();
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [wpData, setWpData] = useState<any | null>(null);

  // Progressive parallel fetch for working professional details
  const loadWpData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/working-professional");
      if (res.ok) {
        const json = await res.json();
        setWpData(json);
      }
    } catch (err) {
      console.warn("Could not load working professional data:", err);
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

  const handleSaveCheckin = async (payload: {
    mood: string;
    energy: number;
    stress: string;
  }) => {
    try {
      await submitCheckIn(payload);
      await loadWpData();
      return true;
    } catch (err) {
      console.error("Failed to save checkin:", err);
      return false;
    }
  };

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
      console.error("Failed to save reflection:", err);
      return false;
    }
  };

  const user = wpData?.user || dashboardData?.user;
  const sanctuaryName = user?.sanctuaryName || user?.name || "Golden Sparrow 62";
  const streakDays = wpData?.streak?.currentStreak || dashboardData?.streak?.currentStreak || user?.streakDays || 3;
  const todayMood = wpData?.todayMood || dashboardData?.todayMood;
  const score = user?.assessmentPercentage || user?.assessmentScore || 75;
  const level = user?.wellnessLevel || "STABLE";
  const balance = wpData?.balance;
  const history = wpData?.history || dashboardData?.history || dashboardData?.moodHistory || [];
  const latestReflection = wpData?.recentReflections?.[0]?.content || "";

  return (
    <div className="max-w-7xl mx-auto py-3 md:py-6 px-3 sm:px-6 space-y-6 select-none animate-fadeIn">
      {/* ROW 1: Hero Experience */}
      <WorkingProfessionalHero
        sanctuaryName={sanctuaryName}
        streakDays={streakDays}
        onOpenReset={() => setIsResetOpen(true)}
        onOpenAI={() => router.push("/ai-chat")}
      />

      {/* Main Grid Layout */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ROW 2: Arriving Check-in + Your Balance + Sanctuary Score (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <ArrivingCheckInCard
              todayMood={todayMood}
              onSaveCheckin={handleSaveCheckin}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <YourBalanceCard balance={balance} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SanctuaryScoreCard score={score} level={level} />
          </motion.div>
        </div>

        {/* ROW 3: Leave Work at Work + Something on your mind + Evening reflection (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <LeaveWorkAtWorkCard
              onStartReset={() => setIsResetOpen(true)}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SomethingOnYourMindCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <EveningReflectionCard
              initialContent={latestReflection}
              onSaveReflection={handleSaveReflection}
            />
          </motion.div>
        </div>

        {/* ROW 4: Your week, gently (7 cols) + Daily insight (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <YourWeekGentlyCard history={history} />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-5">
            <DailyInsightCard />
          </motion.div>
        </div>
      </motion.div>

      {/* 2-Minute Breathing Reset Modal */}
      <BreathingModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  );
}
