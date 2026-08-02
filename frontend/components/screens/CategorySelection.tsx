"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { UserCategory } from "@/backend/types";

interface CategoryOption {
  id: UserCategory | string;
  name: string;
  desc: string;
  icon: string;
  img: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "student",
    name: "Student",
    desc: "Navigating academics and personal growth.",
    icon: "school",
    img: "/images/your_dashboard_student_1_screen.png",
  },
  {
    id: "young_pro",
    name: "Young Pro",
    desc: "Starting out and building a career path.",
    icon: "work_history",
    img: "/images/your_dashboard_working_professional_screen.png",
  },
  {
    id: "working_professional",
    name: "Professional",
    desc: "Managing career growth and life balance.",
    icon: "business_center",
    img: "/images/your_dashboard_working_professional_screen.png",
  },
  {
    id: "parent",
    name: "Parent",
    desc: "Raising a family with care and patience.",
    icon: "family_restroom",
    img: "/images/your_dashboard_parent_screen.png",
  },
  {
    id: "couple",
    name: "Couple",
    desc: "Nurturing a shared life and relationship.",
    icon: "favorite",
    img: "/images/community_screen.png",
  },
  {
    id: "family",
    name: "Family",
    desc: "Fostering harmony and household well-being.",
    icon: "home_health",
    img: "/images/your_dashboard_parent_screen.png",
  },
  {
    id: "women",
    name: "Women",
    desc: "Focused on women's unique wellness needs.",
    icon: "female",
    img: "/images/journal_screen.png",
  },
  {
    id: "men",
    name: "Men",
    desc: "Tailored support for men's mental health.",
    icon: "male",
    img: "/images/my_journey_screen.png",
  },
  {
    id: "senior_citizen",
    name: "Senior",
    desc: "Embracing the later chapters of life.",
    icon: "elderly",
    img: "/images/your_dashboard_senior_citizen_screen.png",
  },
];

export default function CategorySelection() {
  const router = useRouter();
  const { category, setCategory } = useCategory();

  const handleSelect = (id: string) => {
    setCategory(id as UserCategory);
  };

  const handleContinue = () => {
    router.push("/assessment");
  };

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen py-12 px-4 md:px-12 flex flex-col items-center">
      {/* Header */}
      <div className="max-w-[1024px] w-full text-center mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
          Welcome to your Sanctuary
        </h1>
        <p className="text-base text-on-surface-variant max-w-xl mx-auto">
          Tell us a little about yourself so we can personalize your wellness journey.
        </p>
      </div>

      {/* 9-Card Bento Grid */}
      <div className="max-w-[1024px] w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORY_OPTIONS.map((opt) => {
          const isSelected = category === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`relative flex flex-col items-center text-center p-6 rounded-[24px] transition-all duration-300 hover:-translate-y-1 ${
                isSelected
                  ? "bg-surface-container-lowest border-2 border-primary shadow-[0_8px_30px_rgba(124,107,196,0.15)] ring-2 ring-primary/20"
                  : "bg-surface-container-lowest border border-surface-variant/30 shadow-[0_8px_30px_rgba(124,107,196,0.05)] hover:shadow-md"
              }`}
            >
              {/* Checkmark Badge for Selected Item */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-white text-[16px] font-bold">
                    check
                  </span>
                </div>
              )}

              {/* Avatar / Icon Container */}
              <div
                className={`w-28 h-28 mb-4 rounded-full flex items-center justify-center overflow-hidden transition-transform ${
                  isSelected ? "bg-primary-container/20 scale-105" : "bg-surface-container"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-5xl ${
                    isSelected ? "text-primary" : "text-on-surface-variant/70"
                  }`}
                >
                  {opt.icon}
                </span>
              </div>

              <h3 className={`font-heading font-bold text-xl mb-1 ${isSelected ? "text-primary" : "text-on-surface"}`}>
                {opt.name}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Floating Action Button / Sticky Continue Bar */}
      <div className="mt-12 w-full max-w-[1024px] flex justify-end">
        <button
          onClick={handleContinue}
          className="bg-primary hover:bg-primary-purple text-white font-bold text-sm px-10 py-4 rounded-full shadow-[0_8px_20px_rgba(95,78,165,0.25)] transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
        >
          Continue Journey
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
