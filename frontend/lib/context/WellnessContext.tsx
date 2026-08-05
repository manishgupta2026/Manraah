"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getClientSession } from "@/backend/auth/client";

export interface DashboardState {
  user: {
    id: string;
    name: string;
    email: string;
    selectedCategory: string;
    streakDays: number;
    mindfulnessMinutes: number;
    currentMood: string;
  } | null;
  todayMood: any | null;
  history: any[];
  weeklySummary: {
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
  monthlySummary: {
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
  recommendation: string;
}

interface WellnessContextType {
  dashboardData: DashboardState | null;
  isLoading: boolean;
  refetchDashboardData: () => Promise<void>;
  submitCheckIn: (data: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
    factors?: string;
  }) => Promise<any>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only load initial data if the client is authenticated
    const session = getClientSession();
    if (session.isAuthenticated) {
      fetchDashboard();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refetchDashboardData = async () => {
    setIsLoading(true);
    await fetchDashboard();
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
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkInData),
      });

      if (!res.ok) {
        throw new Error("Failed to submit check-in");
      }

      const updatedRecord = await res.json();

      // Automatically refetch latest dashboard state from server
      await fetchDashboard();

      return updatedRecord;
    } catch (err) {
      setIsLoading(false);
      console.error("Error submitting check-in:", err);
      throw err;
    }
  };

  return (
    <WellnessContext.Provider value={{ dashboardData, isLoading, refetchDashboardData, submitCheckIn }}>
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
