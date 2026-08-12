"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useWellness } from "@/frontend/lib/context/WellnessContext";
import { getClientSession } from "@/backend/auth/client";

import WorkingProfessionalHero from "./WorkingProfessionalHero";
import DailyCheckInCard from "./DailyCheckInCard";
import LeaveWorkAtWorkCard from "./LeaveWorkAtWorkCard";
import SanctuaryScoreCard from "./SanctuaryScoreCard";
import WellnessToolsSection from "./WellnessToolsSection";
import AICompanionPresenceCard from "./AICompanionPresenceCard";
import RecentRhythmCard from "./RecentRhythmCard";
import DailyInsightCard from "./DailyInsightCard";
import BreathingModal from "./BreathingModal";

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 95, damping: 14 },
  },
};

export default function WorkingProfessionalDashboard() {
  const router = useRouter();
  const { dashboardData, submitCheckIn, isLoading } = useWellness();
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isAmbientMode, setIsAmbientMode] = useState<boolean>(false);
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

  const handleSaveMood = async (mood: string) => {
    try {
      await submitCheckIn({
        mood,
        energy: 3,
        stress: mood === "Stressed" || mood === "Overwhelmed" ? "High" : "Manageable",
      });
      await loadWpData();
    } catch (err) {
      console.error("Failed to save mood:", err);
    }
  };

  const user = wpData?.user || dashboardData?.user;
  const sanctuaryName = user?.sanctuaryName || user?.name || "Golden Sparrow 62";
  const streakDays = wpData?.streak?.currentStreak || dashboardData?.streak?.currentStreak || user?.streakDays || 1;
  const todayMood = wpData?.todayMood || dashboardData?.todayMood;
  const score = user?.assessmentPercentage || user?.assessmentScore || 76;
  const level = user?.wellnessLevel || "STABLE";
  const history = wpData?.history || dashboardData?.history || dashboardData?.moodHistory || [];

  return (
    <div className={`max-w-7xl mx-auto py-3 md:py-6 px-3 sm:px-6 space-y-6 select-none animate-fadeIn transition-colors duration-500 ${isAmbientMode ? "dark" : ""}`}>
      {/* 1. HERO EXPERIENCE */}
      <WorkingProfessionalHero
        sanctuaryName={sanctuaryName}
        streakDays={streakDays}
        onOpenReset={() => setIsResetOpen(true)}
        onOpenAI={() => router.push("/ai-chat")}
        isAmbientMode={isAmbientMode}
        onToggleAmbient={() => setIsAmbientMode(!isAmbientMode)}
      />

      {/* 2. MAIN SANCTUARY GRIDS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* ROW 2: Arriving Check-in (5 cols) + Leave Work at Work (4 cols) + Sanctuary Score (3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <DailyCheckInCard
              todayMood={todayMood}
              onSaveMood={handleSaveMood}
              onStartReset={() => setIsResetOpen(true)}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4">
            <LeaveWorkAtWorkCard
              onStartReset={() => setIsResetOpen(true)}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
            <SanctuaryScoreCard score={score} level={level} />
          </motion.div>
        </div>

        {/* ROW 3: Wellness Tools (8 cols / ~65%) + AI Companion (4 cols / ~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <WellnessToolsSection />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4">
            <AICompanionPresenceCard />
          </motion.div>
        </div>

        {/* ROW 4: Recent Rhythm (8 cols / ~65%) + Daily Insight (4 cols / ~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <RecentRhythmCard history={history} />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4">
            <DailyInsightCard />
          </motion.div>
        </div>
      </motion.div>

      {/* 2-Minute Calming Breathing Decompression Experience */}
      <BreathingModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
      />
    </div>
  );
}
