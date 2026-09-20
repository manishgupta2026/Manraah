"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  isLoginPromptOpen: boolean;
  openAssessment: (categorySlug?: string) => void;
  closeAssessment: () => void;
  openBreakdownModal: () => void;
  closeBreakdownModal: () => void;
  dismissLoginPrompt: () => void;
  refetchScores: () => Promise<void>;
  submitAssessment: (
    categoryId: string,
    answers: { questionId: number; answer: number }[]
  ) => Promise<{ success: boolean; score: number }>;
  submitFullCheckIn: (
    mood: string,
    note: string,
    categoryId: string,
    answers: { questionId: number; answer: number }[]
  ) => Promise<{ success: boolean; score: number; currentStreak: number }>;
}

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
    name: "Other",
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
  if (!raw) return "student";
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
  const [currentCategory, setCurrentCategory] = useState<CanonicalCategorySlug>("student");
  const [currentCategoryName, setCurrentCategoryName] = useState<string>("Student");
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [isCurrentAssessed, setIsCurrentAssessed] = useState<boolean>(false);
  const [levelBadge, setLevelBadge] = useState<string>("Gentle Care");
  const [levelDescription, setLevelDescription] = useState<string>("Ready to check in");
  const [allCategories, setAllCategories] = useState<LifeStageWellnessCategory[]>(DEFAULT_CATEGORIES);
  const [recentHistory, setRecentHistory] = useState<WellnessHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [activeAssessmentCategory, setActiveAssessmentCategory] = useState<CanonicalCategorySlug>("student");
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const prevCategoryRef = useRef<CanonicalCategorySlug | null>(null);
  const hasInitializedCategoryRef = useRef<boolean>(false);

  // Sync category with CategoryContext / user session
  useEffect(() => {
    const session = getClientSession();
    const rawCat = session?.user?.selectedCategory || contextCategory || "student";
    const canonical = normalizeSlug(rawCat);
    setCurrentCategory(canonical);

    const match = DEFAULT_CATEGORIES.find((c) => c.id === canonical);
    if (match) {
      setCurrentCategoryName(match.name);
    }
  }, [contextCategory]);

  // Fetch wellness scores for current category & all 5 categories
  const fetchScores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/wellness/current?category=${currentCategory}`);
      if (!res.ok) {
        throw new Error("Failed to load wellness metrics.");
      }
      const data = await res.json();

      if (data.category) {
        setCurrentCategory(data.category.slug);
        setCurrentCategoryName(data.category.name);
      }
      setCurrentScore(data.score !== undefined ? data.score : null);
      setIsCurrentAssessed(Boolean(data.assessmentCompleted));
      if (data.levelBadge) setLevelBadge(data.levelBadge);
      if (data.levelDescription) setLevelDescription(data.levelDescription);
      if (Array.isArray(data.allCategories) && data.allCategories.length > 0) {
        setAllCategories(data.allCategories);
      }

      // Check if user just switched category and it has not been assessed yet
      if (
        hasInitializedCategoryRef.current &&
        prevCategoryRef.current &&
        prevCategoryRef.current !== currentCategory &&
        !data.assessmentCompleted
      ) {
        // Automatically open the assessment for the unassessed new category
        setActiveAssessmentCategory(currentCategory);
        setIsAssessmentModalOpen(true);
      }

      prevCategoryRef.current = currentCategory;
      hasInitializedCategoryRef.current = true;
    } catch (err: any) {
      console.warn("Wellness score fetch warning:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentCategory]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  // 60-Second Login Prompt: Check if user's CURRENT category has never been assessed
  useEffect(() => {
    const session = getClientSession();
    if (!session?.user) return;

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem(`manraah_wellness_prompt_dismissed_${currentCategory}`);
    if (isDismissed) return;

    const timer = setTimeout(() => {
      // Re-verify if current category has no score
      if (!isCurrentAssessed && currentScore === null) {
        setIsLoginPromptOpen(true);
      }
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, [currentCategory, isCurrentAssessed, currentScore]);

  const openAssessment = (categorySlug?: string) => {
    const targetSlug = normalizeSlug(categorySlug || currentCategory);
    setActiveAssessmentCategory(targetSlug);
    setIsAssessmentModalOpen(true);
    setIsLoginPromptOpen(false);
  };

  const closeAssessment = () => {
    setIsAssessmentModalOpen(false);
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

    // Full background sync
    await fetchScores();

    return {
      success: true,
      score: result.score,
    };
  };

  const submitFullCheckIn = async (
    mood: string,
    note: string,
    categoryId: string,
    answers: { questionId: number; answer: number }[]
  ) => {
    const canonical = normalizeSlug(categoryId);
    const res = await fetch("/api/checkins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mood,
        note,
        reflection: note,
        categoryId: canonical,
        answers,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Your check-in couldn't be saved. Please try again.");
    }

    const result = await res.json();
    const finalScore = typeof result.wellnessScore === "number" ? result.wellnessScore : 75;

    // Immediately update local state
    if (canonical === currentCategory) {
      setCurrentScore(finalScore);
      setIsCurrentAssessed(true);
      if (result.levelBadge) setLevelBadge(result.levelBadge);
      if (result.levelDescription) setLevelDescription(result.levelDescription);
    }

    setAllCategories((prev) =>
      prev.map((c) =>
        c.id === canonical
          ? {
              ...c,
              score: finalScore,
              completed: true,
              completedAt: new Date().toISOString(),
              assessmentCount: c.assessmentCount + 1,
            }
          : c
      )
    );

    // Full background sync
    await fetchScores();

    return {
      success: true,
      score: finalScore,
      currentStreak: result.currentStreak || 1,
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
        isLoginPromptOpen,
        openAssessment,
        closeAssessment,
        openBreakdownModal,
        closeBreakdownModal,
        dismissLoginPrompt,
        refetchScores: fetchScores,
        submitAssessment,
        submitFullCheckIn,
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
