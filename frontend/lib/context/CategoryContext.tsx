"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserCategory } from "@/backend/types";
import { getClientSession } from "@/backend/auth/client";

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
    badgeColor: "bg-primary-container/20 text-primary font-medium",
    accentColor: "#7C6BC4",
  },
  working_professional: {
    id: "working_professional",
    name: "Working Professional",
    description: "Work-life harmony, burnout prevention & focus soundscapes",
    badgeColor: "bg-primary-container/20 text-primary font-medium",
    accentColor: "#7C6BC4",
  },
  parent: {
    id: "parents",
    name: "Parent",
    description: "Family balance, mindful patience & parent support circles",
    badgeColor: "bg-peach/30 text-tertiary font-medium",
    accentColor: "#F5C99B",
  },
  parents: {
    id: "parents",
    name: "Parent",
    description: "Family balance, mindful patience & parent support circles",
    badgeColor: "bg-peach/30 text-tertiary font-medium",
    accentColor: "#F5C99B",
  },
  couple: {
    id: "couples",
    name: "Couple",
    description: "Nurturing a shared life and relationship",
    badgeColor: "bg-pink/30 text-tertiary font-medium",
    accentColor: "#F4A6B8",
  },
  couples: {
    id: "couples",
    name: "Couple",
    description: "Nurturing a shared life and relationship",
    badgeColor: "bg-pink/30 text-tertiary font-medium",
    accentColor: "#F4A6B8",
  },
  family: {
    id: "family",
    name: "Family",
    description: "Fostering harmony and household well-being",
    badgeColor: "bg-peach/30 text-tertiary font-medium",
    accentColor: "#F5C99B",
  },
  women: {
    id: "women",
    name: "Women",
    description: "Focused on women's unique wellness needs",
    badgeColor: "bg-pink/30 text-tertiary font-medium",
    accentColor: "#F4A6B8",
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

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<UserCategory>("student");

  // Sync category with user session on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = getClientSession();
      if (session?.user?.selectedCategory) {
        setCategory(session.user.selectedCategory as UserCategory);
      }
    }
  }, []);

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
