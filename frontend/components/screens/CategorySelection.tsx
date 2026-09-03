"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { UserCategory } from "@/backend/types";
import { USER_CATEGORIES } from "@/frontend/lib/constants";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { getClientSession } from "@/backend/auth/client";

export default function CategorySelection() {
  const router = useRouter();
  const { setCategory } = useCategory();
  const { selectedCategory, setSelectedCategory } = useAssessment();

  React.useEffect(() => {
    try {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const paramCat = params?.get("selected") || params?.get("category");
      const match = document.cookie.match(/(?:^|;\s*)userType=([^;]*)/);
      const cat = paramCat || (match && match[1]);
      if (cat) {
        setSelectedCategory(cat as UserCategory);
        setCategory(cat);
      }
    } catch {
      // ignore
    }
  }, [setCategory, setSelectedCategory]);

  const handleSelect = async (id: string) => {
    const targetType = id;
    setSelectedCategory(targetType as UserCategory);
    setCategory(targetType);

    // Save full category id to cookie so login/signup can read it after navigation
    document.cookie = `userType=${targetType}; path=/; max-age=86400`;
    console.log("[CategorySelection] [POINT 1 — after category selection] userType selected:", targetType);

    // Check if user is already authenticated
    const session = getClientSession();
    if (session && session.isAuthenticated && session.user) {
      try {
        // Persist category to DB immediately
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            category: targetType,
          }),
        });

        if (res.ok) {
          const resJson = await res.json();
          // Update cookie session details in client
          if (resJson.user) {
            const updatedSession = { ...session, user: resJson.user };
            document.cookie = `manraah_session=${JSON.stringify(updatedSession)}; path=/; max-age=86400`;
          }
        }
      } catch (err) {
        console.error("Failed to update profile category on selection click:", err);
      }

      // If student, go to student dashboard. Otherwise keep their existing routing.
      if (targetType === "student") {
        router.push("/dashboard/student");
        return;
      } else if (targetType === "working_professional" || targetType === "working-professional") {
        router.push("/dashboard/working-professional");
        return;
      } else {
        // Redirection based on normalizeCategory mapping
        const normalized = targetType.replace(/-/g, "_");
        if (normalized === "couple" || normalized === "couples") {
          router.push("/dashboard/couples");
        } else if (normalized === "parent" || normalized === "parents") {
          router.push("/dashboard/parents");
        } else {
          router.push(`/dashboard/${targetType.replace(/_/g, "-")}`);
        }
        return;
      }
    }

    // Unauthenticated visitors always proceed to signup
    router.push("/signup");
  };

  return (
    <div className="bg-surface text-on-surface font-sans h-[calc(100vh-70px)] max-h-[calc(100vh-70px)] py-2 md:py-4 px-4 md:px-12 flex flex-col justify-between items-center overflow-hidden">
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 z-[-2] opacity-35 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-primary-container blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-secondary-container blur-[120px] opacity-30" />
      </div>

      {/* Header */}
      <div className="max-w-[1024px] w-full text-center space-y-1 z-10 my-auto py-1">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black text-on-surface tracking-tight">
          Welcome to your Sanctuary
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-on-surface-variant max-w-xl mx-auto font-normal">
          Select your life category to unlock your personalized sanctuary.
        </p>
      </div>

      {/* 5-Card Zero-Scroll Bento Grid */}
      <div className="max-w-[1024px] w-full grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 z-10 my-auto pb-2 md:pb-4">
        {USER_CATEGORIES.map((opt, idx) => {
          const isSelected = selectedCategory === opt.id;
          const isFifthOnMobile = idx === 4;

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`relative flex flex-col justify-between text-left h-[100px] sm:h-[165px] md:h-[185px] p-3 sm:p-5 rounded-[22px] sm:rounded-[32px] overflow-hidden transition-all duration-300 hover:-translate-y-1 group cursor-pointer border ${
                isFifthOnMobile ? "col-span-2 lg:col-span-1" : "col-span-1"
              } ${
                isSelected
                  ? "border-primary shadow-[0_12px_36px_rgba(124,107,196,0.3)] ring-4 ring-primary/30 scale-[1.02]"
                  : "border-white/20 shadow-md hover:shadow-xl"
              }`}
            >
              {/* Full-Bleed Image Background */}
              <img
                src={opt.image}
                alt={opt.name}
                className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-700 pointer-events-none z-0"
              />

              {/* Dark Gradient Legibility Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none z-10" />

              {/* Top Bar: Emoji Badge + Checkmark */}
              <div className="flex items-center justify-between relative z-20 w-full">
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-xs sm:text-xl shadow-md">
                  {opt.emoji}
                </div>
                {isSelected ? (
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-[12px] sm:text-[16px] font-bold">
                      check
                    </span>
                  </div>
                ) : (
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white/80 text-[11px] sm:text-[14px]">
                      add
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Content */}
              <div className="relative z-20 space-y-0.5">
                <h3 className="font-heading font-black text-xs sm:text-base md:text-xl text-white tracking-tight flex items-center justify-between">
                  <span>{opt.name}</span>
                  <span className="material-symbols-outlined text-xs sm:text-lg text-white/80 group-hover:translate-x-1 transition-transform hidden xs:inline">
                    arrow_forward
                  </span>
                </h3>
                <p className="text-[10px] sm:text-xs text-white/90 leading-tight sm:leading-relaxed font-normal line-clamp-1 sm:line-clamp-2">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

