"use client";

import React, { useState, useMemo } from "react";
import TherapistCard from "./TherapistCard";
import { UnifiedTherapist } from "./types";

interface TherapistCarouselProps {
  therapists: UnifiedTherapist[];
  onNavigate?: (section: "dashboard" | "appointments" | "journey" | "resources" | "ai-companion") => void;
  onBook?: (therapist: UnifiedTherapist) => void;
}

export default function TherapistCarousel({
  therapists,
  onNavigate,
  onBook,
}: TherapistCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);

  // If there are very few therapists, expand to ensure the loop track is wide enough
  const baseList = useMemo(() => {
    if (!therapists || therapists.length === 0) return [];
    if (therapists.length === 1) return therapists;
    if (therapists.length < 4) {
      // Repeat to reach at least 4-6 items for a seamless visual track
      const repeated: UnifiedTherapist[] = [];
      while (repeated.length < 6) {
        repeated.push(...therapists);
      }
      return repeated;
    }
    return therapists;
  }, [therapists]);

  // Infinite duplicate set: exactly two identical halves
  const displayList = useMemo(() => {
    if (baseList.length <= 1) return baseList;
    return [...baseList, ...baseList];
  }, [baseList]);

  // Calculate duration so the speed remains calm, slow, and constant (~8s per card)
  const animationDuration = useMemo(() => {
    return Math.max(30, baseList.length * 8.5);
  }, [baseList.length]);

  if (!therapists || therapists.length === 0) {
    return null;
  }

  // Handle single therapist case without awkward marquee
  if (therapists.length === 1) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <TherapistCard
          therapist={therapists[0]}
          onNavigate={onNavigate}
          onBook={onBook}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden relative select-none group/carousel py-9 -my-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      tabIndex={0}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Continuously scrolling recommended therapists"
    >
      {/* Subtle edge fade gradient masks for smooth entering and exiting */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white dark:from-[#102F27] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white dark:from-[#102F27] to-transparent z-10" />

      {/* Infinite Seamless Moving Track */}
      <div
        className="flex gap-4 items-stretch will-change-transform py-4 pl-6 sm:pl-8 pr-6"
        style={{
          width: "max-content",
          animation: `therapistContinuousScroll ${animationDuration}s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {displayList.map((therapist, idx) => (
          <div
            key={`${therapist.id}-${idx}`}
            className="w-[290px] sm:w-[330px] lg:w-[348px] shrink-0 flex flex-col h-[238px] relative hover:z-50"
          >
            <TherapistCard
              therapist={therapist}
              onNavigate={onNavigate}
              onBook={onBook}
              isFirstCard={idx === 0 || idx === baseList.length}
              isLastCard={idx === baseList.length - 1 || idx === displayList.length - 1}
            />
          </div>
        ))}
      </div>

      {/* Keyframe animation injected inline */}
      <style jsx>{`
        @keyframes therapistContinuousScroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
