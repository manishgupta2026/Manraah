"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getClientSession } from "@/backend/auth/client";
import { useCategory } from "@/frontend/lib/context/CategoryContext";

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
  refetchWellnessData: (categorySlug?: string) => Promise<void>;
  refetchDashboardData: (categorySlug?: string) => Promise<void>;
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
    category?: string;
    categoryId?: string;
  }) => Promise<any>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

function normalizeCategorySlug(raw?: string | null): string {
  if (!raw) return "working-professional";
  const s = raw.trim().toLowerCase().replace(/_/g, "-");
  if (s === "student" || s === "academic") return "student";
  if (s === "parent" || s === "parents") return "parent";
  if (s === "couple" || s === "couples") return "couple";
  if (
    s === "working-professional" ||
    s === "workingprofessional" ||
    s === "young-pro" ||
    s === "youngpro" ||
    s === "work" ||
    s === "career"
  ) {
    return "working-professional";
  }
  return "other";
}

export function WellnessProvider({ children }: { children: ReactNode }) {
  const { category: activeContextCategory } = useCategory();
  const [wellnessData, setWellnessData] = useState<WellnessState | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [journeyInsights, setJourneyInsights] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);

  const openCheckInModal = () => setIsCheckInModalOpen(true);
  const closeCheckInModal = () => setIsCheckInModalOpen(false);

  const fetchWellness = useCallback(async (overrideCategory?: string) => {
    const session = getClientSession();
    if (!session?.isAuthenticated || !session?.user?.id) {
      setWellnessData(null);
      setHistoryList([]);
      setJourneyInsights(null);
      setIsLoading(false);
      return;
    }

    const currentCat = normalizeCategorySlug(
      overrideCategory || session?.user?.selectedCategory || activeContextCategory || "student"
    );

    try {
      const res = await fetch(`/api/checkins?category=${currentCat}`);
      if (res.ok) {
        const data = await res.json();
        const currentSession = getClientSession();
        const u = currentSession?.user;
        if (!currentSession?.isAuthenticated || !u?.id) {
          setWellnessData(null);
          setHistoryList([]);
          setJourneyInsights(null);
          return;
        }

        const currentStreak = typeof data.currentStreak === "number" ? data.currentStreak : 0;
        const longestStreak = typeof data.longestStreak === "number" ? data.longestStreak : currentStreak;
        const hasCheckedInToday = Boolean(data.hasCheckedInToday || data.todayCheckin);

        setHistoryList(data.history || []);
        setJourneyInsights(data.insights || null);

        setWellnessData({
          user: {
            id: u.id || "",
            name: u.name || u.sanctuaryName || "",
            sanctuaryName: u.sanctuaryName || u.name || "",
            email: u.email || "",
            selectedCategory: currentCat,
            streakDays: currentStreak,
            mindfulnessMinutes: u.mindfulnessMinutes || 0,
            currentMood: data.todayCheckin?.mood || u.currentMood || "Calm",
          },
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
        });
      } else if (res.status === 401) {
        setWellnessData(null);
        setHistoryList([]);
        setJourneyInsights(null);
      }
    } catch (err) {
      console.error("Failed to fetch checkin data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeContextCategory]);

  useEffect(() => {
    fetchWellness();

    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ session: any | null }>;
      const s = customEvent.detail?.session;
      if (!s?.isAuthenticated || !s?.user?.id) {
        // Complete state clear on logout
        setWellnessData(null);
        setHistoryList([]);
        setJourneyInsights(null);
        setIsCheckingIn(false);
        setIsCheckInModalOpen(false);
      } else {
        fetchWellness();
      }
    };

    const handleProfileChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ category?: string }>;
      const cat = customEvent.detail?.category;
      fetchWellness(cat);
    };

    window.addEventListener("manraah_auth_changed", handleAuthChange);
    window.addEventListener("manraah_profile_changed", handleProfileChange);
    window.addEventListener("storage", () => fetchWellness());

    return () => {
      window.removeEventListener("manraah_auth_changed", handleAuthChange);
      window.removeEventListener("manraah_profile_changed", handleProfileChange);
      window.removeEventListener("storage", () => fetchWellness());
    };
  }, [fetchWellness]);

  const refetchWellnessData = async (categorySlug?: string) => {
    setIsLoading(true);
    await fetchWellness(categorySlug);
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
    category?: string;
    categoryId?: string;
    answers?: { questionId: number; answer: number }[];
  }) => {
    setIsCheckingIn(true);
    try {
      const session = getClientSession();
      const currentCategory = normalizeCategorySlug(
        checkInData.category ||
        checkInData.categoryId ||
        session?.user?.selectedCategory ||
        activeContextCategory ||
        "working-professional"
      );

      const payload = {
        ...checkInData,
        category: currentCategory,
      };

      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        category: currentCategory,
        checkinDate: new Date().toISOString().split("T")[0],
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
      fetchWellness(currentCategory);

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
