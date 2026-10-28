"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserCategory } from "@/backend/types";
import { getClientSession } from "@/backend/auth/client";
import { usePathname } from "next/navigation";

export interface CategoryInfo {
  id: UserCategory;
  name: string;
  description: string;
  badgeColor: string;
  accentColor: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  student: {
    id: "student",
    name: "Student",
    description: "Academic balance, exam stress reduction & peer focus",
    badgeColor: "bg-mint/20 text-secondary font-medium",
    accentColor: "#5FCFB0",
  },
  young_pro: {
    id: "young_pro",
    name: "Young Pro",
    description: "Starting out and building a career path",
    badgeColor: "bg-primary/10 text-primary font-medium",
    accentColor: "#006B56",
  },
  working_professional: {
    id: "working_professional",
    name: "Working Professional",
    description: "Work-life harmony, burnout prevention & focus soundscapes",
    badgeColor: "bg-primary/10 text-primary font-medium",
    accentColor: "#006B56",
  },
  parent: {
    id: "parents",
    name: "Parent",
    description: "Family balance, mindful patience & parent support circles",
    badgeColor: "bg-[#EDF6F2] dark:bg-[#20372F] text-[#006B56] dark:text-[#88F7D6] font-medium border border-[#BCE2D2] dark:border-[#325246]",
    accentColor: "#006B56",
  },
  parents: {
    id: "parents",
    name: "Parent",
    description: "Family balance, mindful patience & parent support circles",
    badgeColor: "bg-[#EDF6F2] dark:bg-[#20372F] text-[#006B56] dark:text-[#88F7D6] font-medium border border-[#BCE2D2] dark:border-[#325246]",
    accentColor: "#006B56",
  },
  couple: {
    id: "couples",
    name: "Couple",
    description: "Nurturing a shared life and relationship",
    badgeColor: "bg-mint/15 dark:bg-[#1B332B] text-[#006B56] dark:text-[#88F7D6] font-medium border border-mint/30 dark:border-[#2E4E44]",
    accentColor: "#006B56",
  },
  couples: {
    id: "couples",
    name: "Couple",
    description: "Nurturing a shared life and relationship",
    badgeColor: "bg-mint/15 dark:bg-[#1B332B] text-[#006B56] dark:text-[#88F7D6] font-medium border border-mint/30 dark:border-[#2E4E44]",
    accentColor: "#006B56",
  },
  family: {
    id: "family",
    name: "Family",
    description: "Fostering harmony and household well-being",
    badgeColor: "bg-[#EDF6F2] dark:bg-[#20372F] text-[#006B56] dark:text-[#88F7D6] font-medium border border-[#BCE2D2] dark:border-[#325246]",
    accentColor: "#006B56",
  },
  women: {
    id: "women",
    name: "Women",
    description: "Focused on women's unique wellness needs",
    badgeColor: "bg-mint/15 dark:bg-[#1B332B] text-[#006B56] dark:text-[#88F7D6] font-medium border border-mint/30 dark:border-[#2E4E44]",
    accentColor: "#006B56",
  },
  men: {
    id: "men",
    name: "Men",
    description: "Tailored support for men's mental health",
    badgeColor: "bg-mint/20 text-secondary font-medium",
    accentColor: "#5FCFB0",
  },
  senior_citizen: {
    id: "senior_citizen",
    name: "Senior Citizen",
    description: "Gentle vitality, daily calm & voice-guided reflection",
    badgeColor: "bg-pale-yellow/40 text-on-surface font-medium",
    accentColor: "#F5E6A8",
  },
};

const DEFAULT_CATEGORY: CategoryInfo = CATEGORIES.student;

interface CategoryContextType {
  category: UserCategory;
  setCategory: (category: UserCategory) => void;
  categoryDetails: CategoryInfo;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

import { useAuth } from "@/frontend/lib/context/AuthContext";

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState<UserCategory>("student");

  // Authoritatively sync category whenever authenticated user changes
  useEffect(() => {
    if (user?.selectedCategory) {
      setCategory(user.selectedCategory as UserCategory);
    }
  }, [user?.selectedCategory]);

  // Sync category with user session events
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleAuthChange = (event: Event) => {
        const customEvent = event as CustomEvent<{ session: any | null }>;
        const s = customEvent.detail?.session;
        if (s?.user?.selectedCategory) {
          setCategory(s.user.selectedCategory as UserCategory);
        }
      };

      const session = getClientSession();
      if (session?.user?.selectedCategory && session.user.selectedCategory !== category) {
        setCategory(session.user.selectedCategory as UserCategory);
      }

      window.addEventListener("manraah_auth_changed", handleAuthChange);
      return () => {
        window.removeEventListener("manraah_auth_changed", handleAuthChange);
      };
    }
  }, [category]);

  const categoryDetails = CATEGORIES[category] || DEFAULT_CATEGORY;

  const value = {
    category,
    setCategory,
    categoryDetails,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  return context;
}
