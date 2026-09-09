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
  refetchWellnessData: () => Promise<void>;
  refetchDashboardData: () => Promise<void>;
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

  const fetchWellness = async () => {
    try {
      const res = await fetch("/api/checkins");
      if (res.ok) {
        const data = await res.json();
        const session = getClientSession();
        const u = session?.user;
        const currentStreak = u?.streakDays || 1;
        setWellnessData((prev) => ({
          user: u ? {
            id: u.id || "demo-user",
            name: u.sanctuaryName || u.name || "Sanctuary Member",
            sanctuaryName: u.sanctuaryName || u.name || "Sanctuary Member",
            email: u.email || "",
            selectedCategory: u.selectedCategory || "student",
            streakDays: currentStreak,
            mindfulnessMinutes: u.mindfulnessMinutes || 0,
            currentMood: data.todayCheckin?.mood || u.currentMood || "Sanctuary Member",
          } : (prev?.user || null),
          todayMood: data.todayCheckin || null,
          history: data.history || [],
          moodHistory: data.history || [],
          wellnessMetrics: [],
          journalEntries: [],
          weeklySummary: null,
          monthlySummary: null,
          insights: [],
          streak: { currentStreak: currentStreak, longestStreak: currentStreak },
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
    // Safely hydrate client-side cache after initial SSR hydration pass
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("manraah_wellness_cache") || localStorage.getItem("manraah_dashboard_cache");
        if (cached) {
          setWellnessData(JSON.parse(cached));
          setIsLoading(false);
        }
      } catch {}

      const session = getClientSession();
      if (session?.user) {
        const u = session.user;
        setWellnessData((prev) => prev || {
          user: {
            id: u.id || "demo-user",
            name: u.sanctuaryName || u.name || "Sanctuary Member",
            sanctuaryName: u.sanctuaryName || u.name || "Sanctuary Member",
            email: u.email || "",
            selectedCategory: u.selectedCategory || "student",
            streakDays: u.streakDays || 1,
            mindfulnessMinutes: u.mindfulnessMinutes || 0,
            currentMood: u.currentMood || "Sanctuary Member",
          },
          todayMood: null,
          history: [],
          weeklySummary: null,
          monthlySummary: null,
          insights: [],
          streak: { currentStreak: u.streakDays || 1, longestStreak: 1 },
          recommendation: "Focus on matching your pace with slow cycles to restore internal alignment.",
        });
        setIsLoading(false);
      }
    }

    fetchWellness();
  }, []);

  const refetchWellnessData = async () => {
    setIsLoading(true);
    await fetchWellness();
  };

  const submitCheckIn = async (checkInData: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
    factors?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkInData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit check-in");
      }

      const updatedRecord = await res.json();

      // Automatically refetch latest wellness state from server
      await fetchWellness();

      return updatedRecord;
    } catch (err) {
      setIsLoading(false);
      console.error("Error submitting check-in:", err);
      throw err;
    }
  };

  return (
    <WellnessContext.Provider
      value={{
        wellnessData,
        dashboardData: wellnessData,
        isLoading,
        refetchWellnessData,
        refetchDashboardData: refetchWellnessData,
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
