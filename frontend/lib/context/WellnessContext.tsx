"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getClientSession } from "@/backend/auth/client";

export interface WellnessState {
  user: {
    id: string;
    name: string;
    sanctuaryName?: string;
    email: string;
    selectedCategory: string;
    streakDays: number;
    mindfulnessMinutes: number;
    currentMood: string;
  } | null;
  todayMood: any | null;
  hasCheckedInToday?: boolean;
  latestCheckIn?: any | null;
  history?: any[];
  moodHistory?: any[];
  wellnessMetrics?: any[];
  journalEntries?: any[];
  weeklySummary?: {
    avgMood: string;
    frequentMood: string;
    bestDay: string;
    hardestDay: string;
    topTrigger: string;
    avgEnergy: number;
    avgStress: string;
    reflectionSummary: string;
    aiRecommendation: string;
  } | null;
  monthlySummary?: {
    heatmap: any[];
    moodDistribution: Record<string, number>;
    mostCommonEmotion: string;
    mostStressfulWeek: string;
    bestWeek: string;
    topPositiveHabit: string;
    biggestImprovement: string;
  } | null;
  insights: any[];
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  assessmentCompleted?: boolean;
  latestAssessment?: any | null;
  recommendation: string;
  recommendations?: string[];
}

export type DashboardState = WellnessState;

interface WellnessContextType {
  wellnessData: WellnessState | null;
  dashboardData: WellnessState | null;
  isLoading: boolean;
  isCheckingIn: boolean;
  isCheckInModalOpen: boolean;
  hasCheckedInToday: boolean;
  currentStreak: number;
  todayMood: any | null;
  history: any[];
  insights: any | null;
  openCheckInModal: () => void;
  closeCheckInModal: () => void;
  refetchWellnessData: () => Promise<void>;
  refetchDashboardData: () => Promise<void>;
  performDailyCheckIn: () => Promise<any>;
  submitCheckIn: (data: {
    mood: string;
    energy?: number;
    stress?: string;
    sleep?: number;
    reflection?: string;
    note?: string;
    factors?: string;
    gratitude?: string;
    categoryId?: string;
  }) => Promise<any>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [wellnessData, setWellnessData] = useState<WellnessState | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [journeyInsights, setJourneyInsights] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);

  const openCheckInModal = () => setIsCheckInModalOpen(true);
  const closeCheckInModal = () => setIsCheckInModalOpen(false);

  const fetchWellness = async () => {
    try {
      const res = await fetch("/api/checkins");
      if (res.ok) {
        const data = await res.json();
        const session = getClientSession();
        const u = session?.user;
        const currentStreak = typeof data.currentStreak === "number" ? data.currentStreak : (u?.streakDays ?? 0);
        const longestStreak = typeof data.longestStreak === "number" ? data.longestStreak : currentStreak;
        const hasCheckedInToday = Boolean(data.hasCheckedInToday || data.todayCheckin);

        setHistoryList(data.history || []);
        setJourneyInsights(data.insights || null);

        setWellnessData((prev) => ({
          user: u ? {
            id: u.id || "demo-user",
            name: u.sanctuaryName || u.name || "Sanctuary Member",
            sanctuaryName: u.sanctuaryName || u.name || "Sanctuary Member",
            email: u.email || "",
            selectedCategory: u.selectedCategory || "student",
            streakDays: currentStreak,
            mindfulnessMinutes: u.mindfulnessMinutes || 0,
            currentMood: data.todayCheckin?.mood || u.currentMood || "Calm",
          } : (prev?.user || null),
          todayMood: data.todayCheckin || null,
          hasCheckedInToday,
          history: data.history || [],
          moodHistory: data.history || [],
          wellnessMetrics: [],
          journalEntries: [],
          weeklySummary: null,
          monthlySummary: null,
          insights: data.insights ? [data.insights] : [],
          streak: { currentStreak, longestStreak },
          recommendation: "Focus on matching your pace with slow cycles to restore internal alignment.",
        }));
      }
    } catch (err) {
      console.error("Failed to fetch checkin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWellness();
  }, []);

  const refetchWellnessData = async () => {
    setIsLoading(true);
    await fetchWellness();
  };

  const submitCheckIn = async (checkInData: {
    mood: string;
    energy?: number;
    stress?: string;
    sleep?: number;
    reflection?: string;
    note?: string;
    factors?: string;
    gratitude?: string;
    categoryId?: string;
    answers?: { questionId: number; answer: number }[];
  }) => {
    setIsCheckingIn(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkInData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit check-in");
      }

      const updatedRecord = await res.json();
      const nextStreak = typeof updatedRecord.currentStreak === "number" ? updatedRecord.currentStreak : 1;
      const longest = typeof updatedRecord.longestStreak === "number" ? updatedRecord.longestStreak : nextStreak;
      const checkInObj = updatedRecord.checkIn || updatedRecord.todayCheckin || {
        mood: checkInData.mood,
        note: checkInData.note || checkInData.reflection || "",
        category: checkInData.categoryId || "student",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setWellnessData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayMood: checkInObj,
          hasCheckedInToday: true,
          streak: {
            currentStreak: nextStreak,
            longestStreak: longest,
          },
          user: prev.user ? {
            ...prev.user,
            streakDays: nextStreak,
            currentMood: checkInData.mood,
          } : null,
        };
      });

      // Update history list locally immediately
      setHistoryList((prev) => {
        const filtered = prev.filter((h) => h.checkinDate !== checkInObj.checkinDate);
        return [checkInObj, ...filtered];
      });

      // Background refetch to sync all metrics
      fetchWellness();

      return updatedRecord;
    } catch (err) {
      console.error("Error submitting check-in:", err);
      throw err;
    } finally {
      setIsCheckingIn(false);
    }
  };

  const performDailyCheckIn = async () => {
    return submitCheckIn({
      mood: "Calm",
      energy: 4,
      stress: "Manageable",
      sleep: 4,
      reflection: "Daily wellness check-in completed from companion panel.",
    });
  };

  const hasCheckedInToday = Boolean(wellnessData?.hasCheckedInToday || wellnessData?.todayMood);
  const currentStreak = wellnessData?.streak?.currentStreak ?? 0;
  const todayMood = wellnessData?.todayMood || null;

  return (
    <WellnessContext.Provider
      value={{
        wellnessData,
        dashboardData: wellnessData,
        isLoading,
        isCheckingIn,
        isCheckInModalOpen,
        hasCheckedInToday,
        currentStreak,
        todayMood,
        history: historyList,
        insights: journeyInsights,
        openCheckInModal,
        closeCheckInModal,
        refetchWellnessData,
        refetchDashboardData: refetchWellnessData,
        performDailyCheckIn,
        submitCheckIn,
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error("useWellness must be used within a WellnessProvider");
  }
  return context;
}
