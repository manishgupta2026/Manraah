"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { UserCategory } from "@/backend/types";

export interface CategoryInfo {
  id: UserCategory;
  name: string;
  description: string;
  badgeColor: string;
  accentColor: string;
}

export const CATEGORIES: Record<UserCategory, CategoryInfo> = {
  student: {
    id: "student",
    name: "Student",
    description: "Academic balance, exam stress reduction & peer focus",
    badgeColor: "bg-mint/20 text-secondary font-medium",
    accentColor: "#5FCFB0",
  },
  working_professional: {
    id: "working_professional",
    name: "Working Professional",
    description: "Work-life harmony, burnout prevention & focus soundscapes",
    badgeColor: "bg-primary-container/20 text-primary font-medium",
    accentColor: "#7C6BC4",
  },
  parent: {
    id: "parent",
    name: "Parent",
    description: "Family balance, mindful patience & parent support circles",
    badgeColor: "bg-peach/30 text-tertiary font-medium",
    accentColor: "#F5C99B",
  },
  senior_citizen: {
    id: "senior_citizen",
    name: "Senior Citizen",
    description: "Gentle vitality, daily calm & voice-guided reflection",
    badgeColor: "bg-pale-yellow/40 text-on-surface font-medium",
    accentColor: "#F5E6A8",
  },
};

interface CategoryContextType {
  category: UserCategory;
  setCategory: (category: UserCategory) => void;
  categoryDetails: CategoryInfo;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [category, setCategory] = useState<UserCategory>("student");

  const value = {
    category,
    setCategory,
    categoryDetails: CATEGORIES[category],
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
