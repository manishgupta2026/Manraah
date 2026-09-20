"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { getClientSession } from "@/backend/auth/client";
import { useCategory } from "@/frontend/lib/context/CategoryContext";

export type CanonicalCategorySlug =
  | "student"
  | "parent"
  | "couple"
  | "working-professional"
  | "other";

export interface LifeStageWellnessCategory {
  id: CanonicalCategorySlug;
  name: string;
  description: string;
  icon: string;
  colorTheme: string;
  active: boolean;
  score: number | null;
  completedAt: string | null;
  completed: boolean;
  assessmentCount: number;
}

export interface WellnessHistoryItem {
  id: number;
  categoryId: string;
  categoryName?: string;
  rawScore: number;
  score: number;
  completedAt: string;
}

interface WellnessScoreContextType {
  currentCategory: CanonicalCategorySlug;
  currentCategoryName: string;
  currentScore: number | null;
  isCurrentAssessed: boolean;
  levelBadge: string;
  levelDescription: string;
  allCategories: LifeStageWellnessCategory[];
  recentHistory: WellnessHistoryItem[];
  isLoading: boolean;
  error: string | null;
  isAssessmentModalOpen: boolean;
  activeAssessmentCategory: CanonicalCategorySlug;
  isBreakdownModalOpen: boolean;
  isReattemptModalOpen: boolean;
  isLoginPromptOpen: boolean;
  openAssessment: (categorySlug?: string) => void;
  closeAssessment: () => void;
  openReattemptModal: (categorySlug?: string) => void;
  closeReattemptModal: () => void;
  confirmReattempt: () => void;
  openBreakdownModal: () => void;
  closeBreakdownModal: () => void;
  dismissLoginPrompt: () => void;
  refetchScores: () => Promise<void>;
  submitAssessment: (
    categoryId: string,
    answers: { questionId: number; answer: number }[]
  ) => Promise<{ success: boolean; score: number }>;
}

const CATEGORY_DISPLAY_NAMES: Record<CanonicalCategorySlug, string> = {
  "student": "Student",
  "parent": "Parent",
  "couple": "Couple",
  "working-professional": "Working Professional",
  "other": "Others",
};

const DEFAULT_CATEGORIES: LifeStageWellnessCategory[] = [
  {
    id: "student",
    name: "Student",
    description: "Academic balance, exam stress management & peer focus",
    icon: "school",
    colorTheme: "emerald",
    active: true,
    score: null,
    completedAt: null,
    completed: false,
    assessmentCount: 0,
  },
  {
    id: "parent",
    name: "Parent",
    description: "Family balance, mindful patience & parenting support",
    icon: "family_restroom",
    colorTheme: "peach",
    active: true,
    score: null,
    completedAt: null,
    completed: false,
    assessmentCount: 0,
  },
  {
    id: "couple",
    name: "Couple",
    description: "Nurturing mutual communication & relationship harmony",
    icon: "favorite",
    colorTheme: "pink",
    active: true,
    score: null,
    completedAt: null,
    completed: false,
    assessmentCount: 0,
  },
  {
    id: "working-professional",
    name: "Working Professional",
    description: "Work-life harmony, burnout care & career fulfillment",
    icon: "work",
    colorTheme: "purple",
    active: true,
    score: null,
    completedAt: null,
    completed: false,
    assessmentCount: 0,
  },
  {
    id: "other",
    name: "Others",
    description: "Holistic emotional wellbeing & daily balance",
    icon: "self_improvement",
    colorTheme: "teal",
    active: true,
    score: null,
    completedAt: null,
    completed: false,
    assessmentCount: 0,
  },
];

function normalizeSlug(raw?: string | null): CanonicalCategorySlug {
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

const WellnessScoreContext = createContext<WellnessScoreContextType | undefined>(undefined);

export function WellnessScoreProvider({ children }: { children: ReactNode }) {
  const { category: contextCategory } = useCategory();

  // Stable category initialized synchronously from session/context immediately
  const [currentCategory, setCurrentCategory] = useState<CanonicalCategorySlug>(() => {
    if (typeof window !== "undefined") {
      try {
        const session = getClientSession();
        const raw = session?.user?.selectedCategory || contextCategory;
        if (raw) return normalizeSlug(raw);
      } catch {
        // ignore
      }
    }
    return normalizeSlug(contextCategory || "working-professional");
  });

  // currentCategoryName derived stably and synchronously (no blinking or lagging state)
  const currentCategoryName = CATEGORY_DISPLAY_NAMES[currentCategory] || "Working Professional";

  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [isCurrentAssessed, setIsCurrentAssessed] = useState<boolean>(false);
  const [levelBadge, setLevelBadge] = useState<string>("Gentle Care");
  const [levelDescription, setLevelDescription] = useState<string>("Ready to check in");
  const [allCategories, setAllCategories] = useState<LifeStageWellnessCategory[]>(DEFAULT_CATEGORIES);
  const [recentHistory, setRecentHistory] = useState<WellnessHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [activeAssessmentCategory, setActiveAssessmentCategory] = useState<CanonicalCategorySlug>("working-professional");
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [isReattemptModalOpen, setIsReattemptModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // Update currentCategory ONLY when contextCategory actually changes
  useEffect(() => {
    if (!contextCategory) return;
    const nextCanonical = normalizeSlug(contextCategory);
    setCurrentCategory((prev) => (prev !== nextCanonical ? nextCanonical : prev));
  }, [contextCategory]);

  // Fetch wellness scores strictly for current category
  const fetchScores = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/wellness/current?category=${currentCategory}`);
      if (!res.ok) {
        throw new Error("Failed to load wellness metrics.");
      }
      const data = await res.json();

      setCurrentScore(data.score !== undefined ? data.score : null);
      setIsCurrentAssessed(Boolean(data.assessmentCompleted));
      if (data.levelBadge) setLevelBadge(data.levelBadge);
      if (data.levelDescription) setLevelDescription(data.levelDescription);
      if (Array.isArray(data.allCategories) && data.allCategories.length > 0) {
        setAllCategories(data.allCategories);
      }
    } catch (err: any) {
      console.warn("Wellness score fetch warning:", err.message);
      setError(err.message);
    }
  }, [currentCategory]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const openAssessment = (categorySlug?: string) => {
    const targetSlug = normalizeSlug(categorySlug || currentCategory);
    setActiveAssessmentCategory(targetSlug);
    setIsAssessmentModalOpen(true);
    setIsLoginPromptOpen(false);
    setIsReattemptModalOpen(false);
  };

  const closeAssessment = () => {
    setIsAssessmentModalOpen(false);
  };

  const openReattemptModal = (categorySlug?: string) => {
    const targetSlug = normalizeSlug(categorySlug || currentCategory);
    setActiveAssessmentCategory(targetSlug);
    setIsReattemptModalOpen(true);
  };

  const closeReattemptModal = () => {
    setIsReattemptModalOpen(false);
  };

  const confirmReattempt = () => {
    setIsReattemptModalOpen(false);
    setIsAssessmentModalOpen(true);
  };

  const openBreakdownModal = () => {
    setIsBreakdownModalOpen(true);
  };

  const closeBreakdownModal = () => {
    setIsBreakdownModalOpen(false);
  };

  const dismissLoginPrompt = () => {
    setIsLoginPromptOpen(false);
    sessionStorage.setItem(`manraah_wellness_prompt_dismissed_${currentCategory}`, "true");
  };

  const submitAssessment = async (
    categoryId: string,
    answers: { questionId: number; answer: number }[]
  ) => {
    const canonical = normalizeSlug(categoryId);
    const res = await fetch("/api/wellness/assessments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: canonical, answers }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Your responses couldn't be saved. Please try again.");
    }

    const result = await res.json();

    // Immediately update local state
    if (canonical === currentCategory) {
      setCurrentScore(result.score);
      setIsCurrentAssessed(true);
      if (result.levelBadge) setLevelBadge(result.levelBadge);
      if (result.levelDescription) setLevelDescription(result.levelDescription);
    }

    setAllCategories((prev) =>
      prev.map((c) =>
        c.id === canonical
          ? {
              ...c,
              score: result.score,
              completed: true,
              completedAt: result.completedAt,
              assessmentCount: c.assessmentCount + 1,
            }
          : c
      )
    );

    // Background sync
    await fetchScores();

    return {
      success: true,
      score: result.score,
    };
  };

  return (
    <WellnessScoreContext.Provider
      value={{
        currentCategory,
        currentCategoryName,
        currentScore,
        isCurrentAssessed,
        levelBadge,
        levelDescription,
        allCategories,
        recentHistory,
        isLoading,
        error,
        isAssessmentModalOpen,
        activeAssessmentCategory,
        isBreakdownModalOpen,
        isReattemptModalOpen,
        isLoginPromptOpen,
        openAssessment,
        closeAssessment,
        openReattemptModal,
        closeReattemptModal,
        confirmReattempt,
        openBreakdownModal,
        closeBreakdownModal,
        dismissLoginPrompt,
        refetchScores: fetchScores,
        submitAssessment,
      }}
    >
      {children}
    </WellnessScoreContext.Provider>
  );
}

export function useWellnessScore() {
  const context = useContext(WellnessScoreContext);
  if (!context) {
    throw new Error("useWellnessScore must be used within a WellnessScoreProvider");
  }
  return context;
}
