"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { getClientSession } from "@/backend/auth/client";

export interface DashboardState {
  user: {
    id: string;
    name: string;
    sanctuaryName?: string;
    email: string;
    selectedCategory: string;
    streakDays: number;
    mindfulnessMinutes: number;
    currentMood: string;
    avatar?: string;
  } | null;
  todayMood: any | null;
  latestCheckIn?: any | null;
  moodHistory?: any[];
  wellnessMetrics?: any[];
  journalEntries?: any[];
  insights: any[];
  streak: {
    currentStreak: number;
    longestStreak: number;
  };
  recommendation: string;
  recommendations?: string[];
}

interface WellnessContextType {
  dashboardData: DashboardState | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  fetchDashboard: (force?: boolean) => Promise<void>;
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

const STALE_TIME_MS = 30000; // 30 seconds client cache

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const fetchDashboard = useCallback(async (force = false) => {
    // Prevent duplicate parallel in-flight fetches
    if (isFetchingRef.current) return;

    // Use cached data if within stale time and not forced
    const now = Date.now();
    if (!force && lastFetchedRef.current > 0 && now - lastFetchedRef.current < STALE_TIME_MS && dashboardData) {
      setIsLoading(false);
      return;
    }

    isFetchingRef.current = true;
    setIsFetching(true);
    setError(null);

    // Only show full skeleton loader if we don't have existing cached data
    if (!dashboardData) {
      setIsLoading(true);
    }

    try {
      const res = await fetch("/api/dashboard", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) {
        throw new Error(`Failed to load dashboard (status: ${res.status})`);
      }

      const data = await res.json();
      setDashboardData(data);
      lastFetchedRef.current = Date.now();
      setError(null);
    } catch (err: any) {
      console.error("[WellnessContext] Dashboard fetch error:", err);
      setError(err?.message || "We couldn't load your sanctuary right now.");
    } finally {
      setIsLoading(false);
      setIsFetching(false);
      isFetchingRef.current = false;
    }
  }, [dashboardData]);

  // Initial fetch on mount if authenticated
  useEffect(() => {
    const session = getClientSession();
    if (session.isAuthenticated) {
      fetchDashboard();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refetchDashboardData = useCallback(async () => {
    await fetchDashboard(true);
  }, [fetchDashboard]);

  const submitCheckIn = async (checkInData: {
    mood: string;
    energy: number;
    stress: string;
    sleep?: number;
    reflection?: string;
    factors?: string;
  }) => {
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

      // Immediately invalidate cache and fetch updated real dashboard state
      await fetchDashboard(true);

      return updatedRecord;
    } catch (err) {
      console.error("[WellnessContext] Error submitting check-in:", err);
      throw err;
    }
  };

  return (
    <WellnessContext.Provider
      value={{
        dashboardData,
        isLoading,
        isFetching,
        error,
        fetchDashboard,
        refetchDashboardData,
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

export function useDashboard() {
  const { dashboardData, isLoading, isFetching, error, fetchDashboard, refetchDashboardData } = useWellness();

  useEffect(() => {
    // Ensure dashboard data is fetched upon landing on dashboard
    fetchDashboard(false);
  }, [fetchDashboard]);

  return {
    data: dashboardData,
    dashboardData,
    isLoading,
    isFetching,
    error,
    refetch: refetchDashboardData,
    refetchDashboardData,
  };
}

