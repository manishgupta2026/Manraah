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
  hasCheckedInToday: boolean;
  currentStreak: number;
  refetchWellnessData: () => Promise<void>;
  refetchDashboardData: () => Promise<void>;
  performDailyCheckIn: () => Promise<any>;
  submitCheckIn: (data: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
    factors?: string;
    gratitude?: string;
  }) => Promise<any>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [wellnessData, setWellnessData] = useState<WellnessState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);

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

        setWellnessData((prev) => ({
          user: u ? {
            id: u.id || "demo-user",
            name: u.sanctuaryName || u.name || "Sanctuary Member",
            sanctuaryName: u.sanctuaryName || u.name || "Sanctuary Member",
            email: u.email || "",
            selectedCategory: u.selectedCategory || "student",
            streakDays: currentStreak,
            mindfulnessMinutes: u.mindfulnessMinutes || 0,
            currentMood: data.todayCheckin?.mood || u.currentMood || "Good",
          } : (prev?.user || null),
          todayMood: data.todayCheckin || null,
          hasCheckedInToday,
          history: data.history || [],
          moodHistory: data.history || [],
          wellnessMetrics: [],
          journalEntries: [],
          weeklySummary: null,
          monthlySummary: null,
          insights: [],
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

  const performDailyCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: "Good",
          energy: 4,
          stress: "Manageable",
          sleep: 4,
          reflection: "Daily wellness check-in completed from companion panel.",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to complete check-in");
      }

      const result = await res.json();
      const nextStreak = typeof result.currentStreak === "number" ? result.currentStreak : 1;
      const longest = typeof result.longestStreak === "number" ? result.longestStreak : nextStreak;

      // Immediately update local context state
      setWellnessData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayMood: result.checkIn || prev.todayMood,
          hasCheckedInToday: true,
          streak: {
            currentStreak: nextStreak,
            longestStreak: longest,
          },
          user: prev.user ? {
            ...prev.user,
            streakDays: nextStreak,
          } : null,
        };
      });

      return result;
    } catch (err) {
      console.error("Error performing daily check-in:", err);
      throw err;
    } finally {
      setIsCheckingIn(false);
    }
  };

  const submitCheckIn = async (checkInData: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
    factors?: string;
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

      setWellnessData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          todayMood: updatedRecord.checkIn || prev.todayMood,
          hasCheckedInToday: true,
          streak: {
            currentStreak: nextStreak,
            longestStreak: longest,
          },
          user: prev.user ? {
            ...prev.user,
            streakDays: nextStreak,
          } : null,
        };
      });

      return updatedRecord;
    } catch (err) {
      console.error("Error submitting check-in:", err);
      throw err;
    } finally {
      setIsCheckingIn(false);
    }
  };

  const hasCheckedInToday = Boolean(wellnessData?.hasCheckedInToday || wellnessData?.todayMood);
  const currentStreak = wellnessData?.streak?.currentStreak ?? 0;

  return (
    <WellnessContext.Provider
      value={{
        wellnessData,
        dashboardData: wellnessData,
        isLoading,
        isCheckingIn,
        hasCheckedInToday,
        currentStreak,
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
