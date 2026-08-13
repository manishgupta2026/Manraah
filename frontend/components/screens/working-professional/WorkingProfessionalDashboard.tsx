"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";

import WorkingProfessionalHero from "./WorkingProfessionalHero";
import DailyCheckInCard from "./DailyCheckinCard";
import LeaveWorkAtWorkCard from "./LeaveWorkAtWorkCard";
import SanctuaryScoreCard from "./SanctuaryScoreCard";
import WellnessScoreCalculatorModal from "./WellnessScoreCalculatorModal";
import WellnessToolsSection from "./WellnessToolsSection";
import AICompanionPresenceCard from "./AICompanionPresenceCard";
import RecentRhythmCard from "./RecentRhythmCard";
import WorkdayJournalCard from "./WorkdayJournalCard";
import DailyInsightCard from "./DailyInsightCard";
import BreathingModal from "./BreathingModal";
import RainAmbient from "@/frontend/components/ambient/RainAmbient";

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
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isAmbientMode, setIsAmbientMode] = useState<boolean>(false);
  const [wpData, setWpData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    } finally {
      setIsLoading(false);
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

  const handleSaveCheckin = async (checkinData: any) => {
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkinData),
      });
      if (res.ok) {
        await loadWpData();
      }
    } catch (err) {
      console.error("Failed to save checkin:", err);
    }
  };

  const handleScoreCalculated = async () => {
    await loadWpData();
  };

  const user = wpData?.user;
  const sanctuaryName = user?.preferredName || user?.name || user?.sanctuaryName || "Ashutosh";
  const streakDays = wpData?.streak?.currentStreak || user?.streakDays || 1;
  const todayCheckin = wpData?.todayCheckin;
  const score = wpData?.wellnessScore?.score ?? user?.assessmentPercentage ?? 76;
  const level = wpData?.wellnessScore?.level ?? user?.wellnessLevel ?? "STABLE";
  const delta = wpData?.wellnessScore?.delta ?? 0;
  const history = wpData?.history || [];
  const recentReflections = wpData?.recentReflections || [];

  const [justCompletedReset, setJustCompletedReset] = useState<boolean>(false);

  const handleResetSessionCompleted = async () => {
    setJustCompletedReset(true);
    await loadWpData();
  };

  return (
    <div className="relative max-w-7xl mx-auto py-3 md:py-6 px-3 sm:px-6 space-y-6 select-none animate-fadeIn">
      {/* 🌧 Atmospheric Rain Ambience Layer (Behind UI, pointer-events: none, theme untouched) */}
      <RainAmbient isActive={isAmbientMode} />

      {/* 1. HERO EXPERIENCE */}
      <div className="relative z-10">
        <WorkingProfessionalHero
          sanctuaryName={sanctuaryName}
          streakDays={streakDays}
          onOpenReset={() => setIsResetOpen(true)}
          onOpenAI={() => router.push("/ai-chat")}
          isAmbientMode={isAmbientMode}
          onToggleAmbient={() => setIsAmbientMode(!isAmbientMode)}
          todayMood={todayCheckin?.mood || user?.currentMood}
          stress={todayCheckin?.stress}
          energy={todayCheckin?.energy}
          justCompletedReset={justCompletedReset}
        />
      </div>

      {/* 2. MAIN SANCTUARY GRIDS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-6"
      >
        {/* ROW 2: Arriving Check-in (5 cols) + Leave Work at Work (4 cols) + Sanctuary Score (3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <motion.div variants={itemVariants} className="lg:col-span-5">
            <DailyCheckInCard
              todayCheckin={todayCheckin}
              onSaveCheckin={handleSaveCheckin}
              onStartReset={() => setIsResetOpen(true)}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-4">
            <LeaveWorkAtWorkCard
              onStartReset={() => setIsResetOpen(true)}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-3">
            <SanctuaryScoreCard
              score={score}
              level={level}
              delta={delta}
              history={history}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
            />
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

        {/* ROW 4: Workday Journal (6 cols) + Recent Rhythm & Daily Insight (6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <motion.div variants={itemVariants} className="lg:col-span-6">
            <WorkdayJournalCard
              recentReflections={recentReflections}
              onReflectionSaved={loadWpData}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-6 space-y-5">
            <RecentRhythmCard history={history} />
            <DailyInsightCard />
          </motion.div>
        </div>
      </motion.div>

      {/* 2-Minute Calming Breathing Decompression Modal */}
      <BreathingModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onSessionCompleted={handleResetSessionCompleted}
      />

      {/* Interactive Wellness Score Calculator Modal */}
      <WellnessScoreCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onScoreCalculated={handleScoreCalculated}
      />
    </div>
  );
}
