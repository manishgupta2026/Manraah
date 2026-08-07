"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { UserCategory } from "@/backend/types";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

interface CategoryOption {
  id: UserCategory;
  name: string;
  desc: string;
  emoji: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: "student",
    name: "Student",
    desc: "Manage academic stress, focus, exams and emotional wellbeing.",
    emoji: "🎓",
  },
  {
    id: "young_pro",
    name: "Young Professional",
    desc: "Navigate early career stress, work-life balance, and professional growth.",
    emoji: "💼",
  },
  {
    id: "working_professional",
    name: "Working Professional",
    desc: "Manage workplace pressure, burnout prevention, and daily mindfulness.",
    emoji: "👔",
  },
  {
    id: "parent",
    name: "Parents",
    desc: "Balance family responsibilities, parenting stress, and personal wellbeing.",
    emoji: "🍼",
  },
  {
    id: "couple",
    name: "Couples",
    desc: "Nurturing relationship harmony, communication, and emotional connection.",
    emoji: "💖",
  },
  {
    id: "family",
    name: "Family",
    desc: "Fostering collective peace, understanding, and household wellness.",
    emoji: "🏡",
  },
  {
    id: "women",
    name: "Women",
    desc: "Dedicated space for women's wellness, life transitions, and balance.",
    emoji: "🌸",
  },
  {
    id: "men",
    name: "Men",
    desc: "Supporting men's emotional health, stress management, and resilience.",
    emoji: "🌿",
  },
  {
    id: "senior_citizen",
    name: "Senior Citizen",
    desc: "Embracing active aging, gentle reflection, and mindful longevity.",
    emoji: "👵",
  },
];

export default function CategorySelection() {
  const router = useRouter();
  const { setCategory } = useCategory();
  const { selectedCategory, setSelectedCategory } = useAssessment();

  const handleSelect = (id: UserCategory) => {
    setSelectedCategory(id);
    setCategory(id);
    router.push("/assessment");
  };

  return (
    <div className="bg-surface text-on-surface font-sans min-h-screen py-12 px-4 md:px-12 flex flex-col items-center">
      <ScreenHeader title="🌿 Select Sanctuary" showBackButton={true} fallbackRoute="/" />
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 z-[-2] opacity-35 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-primary-container blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-secondary-container blur-[120px] opacity-30" />
      </div>

      {/* Header */}
      <div className="max-w-[1024px] w-full text-center mb-10 space-y-2 z-10">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-on-surface">
          Welcome to your Sanctuary
        </h1>
        <p className="text-base text-on-surface-variant max-w-xl mx-auto">
          Tell us a little about yourself so we can personalize your wellness journey.
        </p>
      </div>

      {/* 9-Card Bento Grid */}
      <div className="max-w-[1024px] w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 z-10">
        {CATEGORY_OPTIONS.map((opt) => {
          const isSelected = selectedCategory === opt.id;
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

              {/* Avatar / Emoji Container */}
              <div
                className={`w-24 h-24 mb-4 rounded-full flex items-center justify-center overflow-hidden transition-transform ${
                  isSelected ? "bg-primary-container/20 scale-105 animate-pulse" : "bg-surface-container/40"
                }`}
              >
                <span className="text-5xl leading-none select-none">
                  {opt.emoji}
                </span>
              </div>

              <h3 className={`font-heading font-bold text-lg mb-2 ${isSelected ? "text-primary" : "text-on-surface"}`}>
                {opt.name}
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed px-2">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>

    </div>
  );
}

