"use client";

import React, { useRef, useEffect, useCallback, useMemo } from "react";
import TherapistCard from "./TherapistCard";
import { UnifiedTherapist } from "./types";

const AUTO_SCROLL_INTERVAL = 5500; // 5.5 seconds calm reading pause between advances
const RESUME_DELAY = 5000;         // 5.0 seconds pause after user interaction before auto-scroll resumes
const SCROLL_DURATION = 1400;      // 1.4 seconds smooth ease-in-out transition duration

// Smooth ease-in-out cubic curve
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

interface TherapistCarouselProps {
  therapists: UnifiedTherapist[];
  onNavigate?: (section: "dashboard" | "appointments" | "journey" | "resources" | "ai-companion") => void;
  onBook?: (therapist: UnifiedTherapist) => void;
  onOpenRatingModal?: (therapist: UnifiedTherapist) => void;
}

export default function TherapistCarousel({
  therapists,
  onNavigate,
  onBook,
  onOpenRatingModal,
}: TherapistCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const therapistsRef = useRef<UnifiedTherapist[]>(therapists);
  therapistsRef.current = therapists;

  const numItems = therapists?.length || 0;

  // Render 3 identical sets to provide seamless infinite scrolling in both directions
  const loopedList = useMemo(() => {
    if (!therapists || therapists.length <= 1) {
      return (therapists || []).map((t, idx) => ({ ...t, loopKey: `single-${t.id}-${idx}` }));
    }
    return [
      ...therapists.map((t) => ({ ...t, loopKey: `set0-${t.id}` })),
      ...therapists.map((t) => ({ ...t, loopKey: `set1-${t.id}` })),
      ...therapists.map((t) => ({ ...t, loopKey: `set2-${t.id}` })),
    ];
  }, [therapists]);

  // State refs for animation, interaction, and timers
  const isHoveredRef = useRef(false);
  const isInteractingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const isReducedMotionRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedScrollRef = useRef(false);

  // Helper: calculate single set width in pixels
  const getSingleSetWidth = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || therapistsRef.current.length === 0) return 0;
    return el.scrollWidth / 3;
  }, []);

  // Helper: calculate one card's step width (card width + gap)
  const getStepWidth = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return 356;
    const firstCard = el.querySelector<HTMLElement>(".therapist-carousel-item");
    if (!firstCard) return 356;
    const gap = window.innerWidth < 640 ? 16 : 20;
    return firstCard.offsetWidth + gap;
  }, []);

  // Helper: silent boundary wrapping to create seamless infinite loop
  const checkBoundaryWrap = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || therapistsRef.current.length <= 1) return;

    const singleSetWidth = getSingleSetWidth();
    if (singleSetWidth <= 0) return;

    // Past the end of Set 1 -> silently wrap back to Set 1
    if (el.scrollLeft >= singleSetWidth * 2 - 20) {
      el.scrollLeft -= singleSetWidth;
    }
    // Before the start of Set 1 -> silently wrap forward to Set 1
    else if (el.scrollLeft <= 20) {
      el.scrollLeft += singleSetWidth;
    }
  }, [getSingleSetWidth]);

  // Initialize scroll position to the start of the middle set (Set 1)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || numItems <= 1) return;

    const initializePosition = () => {
      const singleSetWidth = getSingleSetWidth();
      if (singleSetWidth > 0 && (!hasInitializedScrollRef.current || el.scrollLeft === 0)) {
        el.scrollLeft = singleSetWidth;
        hasInitializedScrollRef.current = true;
      }
    };

    const timer = setTimeout(initializePosition, 50);
    return () => clearTimeout(timer);
  }, [getSingleSetWidth, numItems]);

  // Custom high-performance smooth scroll animator
  const animateScrollTo = useCallback(
    (targetLeft: number, duration: number = SCROLL_DURATION, onComplete?: () => void) => {
      const el = scrollContainerRef.current;
      if (!el) return;

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      isAnimatingRef.current = true;
      const startLeft = el.scrollLeft;
      const change = targetLeft - startLeft;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);

        el.scrollLeft = startLeft + change * easeProgress;

        if (progress < 1) {
          rafIdRef.current = requestAnimationFrame(animate);
        } else {
          isAnimatingRef.current = false;
          rafIdRef.current = null;
          checkBoundaryWrap();
          if (onComplete) onComplete();
        }
      };

      rafIdRef.current = requestAnimationFrame(animate);
    },
    [checkBoundaryWrap]
  );

  // Step Forward (Right)
  const stepForward = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || therapistsRef.current.length <= 1) return;

    checkBoundaryWrap();
    const step = getStepWidth();
    animateScrollTo(el.scrollLeft + step);
  }, [animateScrollTo, checkBoundaryWrap, getStepWidth]);

  // Step Backward (Left)
  const stepBackward = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el || therapistsRef.current.length <= 1) return;

    checkBoundaryWrap();
    const step = getStepWidth();
    animateScrollTo(el.scrollLeft - step);
  }, [animateScrollTo, checkBoundaryWrap, getStepWidth]);

  // Pause on manual user interaction and resume after RESUME_DELAY
  const handleUserInteraction = useCallback(() => {
    isInteractingRef.current = true;

    // If an automatic RAF animation is currently running, cancel it so user has immediate control
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      isAnimatingRef.current = false;
    }

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }

    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, RESUME_DELAY);
  }, []);

  // Continuous Auto-Scroll Engine
  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      isReducedMotionRef.current = mediaQuery.matches;
      const listener = (e: MediaQueryListEvent) => {
        isReducedMotionRef.current = e.matches;
      };
      mediaQuery.addEventListener("change", listener);
    }

    // Set up continuous recurring tick
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (
        !isHoveredRef.current &&
        !isInteractingRef.current &&
        !isAnimatingRef.current &&
        !isReducedMotionRef.current &&
        scrollContainerRef.current &&
        therapistsRef.current.length > 1
      ) {
        stepForward();
      }
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [stepForward]);

  // Hover handlers: freeze carousel completely when mouse is hovering
  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    handleUserInteraction();
  };

  // Boundary check on scroll
  const handleNativeScroll = () => {
    checkBoundaryWrap();
  };

  if (!therapists || therapists.length === 0) {
    return null;
  }

  // Single therapist fallback without carousel
  if (therapists.length === 1) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <TherapistCard
          therapist={therapists[0]}
          onNavigate={onNavigate}
          onBook={onBook}
          onOpenRatingModal={onOpenRatingModal}
        />
      </div>
    );
  }

  return (
    <div
      className="w-full relative group/carousel flex flex-col gap-2.5 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleUserInteraction}
      onTouchMove={handleUserInteraction}
      onTouchEnd={handleUserInteraction}
      onWheel={handleUserInteraction}
    >
      {/* Subtitle / Counter */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <span className="text-[11px] font-semibold text-[#5A756C] dark:text-[#9DB9B0]">
          Showing {numItems} mental health specialists
        </span>
      </div>

      {/* Carousel Viewport Wrapper with Left and Right Controls */}
      <div className="w-full relative">
        {/* Left Navigation Button */}
        <button
          type="button"
          onClick={() => {
            handleUserInteraction();
            stepBackward();
          }}
          aria-label="Previous doctors"
          className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-full bg-white/95 dark:bg-[#0E3931]/95 text-[#19332A] dark:text-[#F4FAF7] hover:bg-white dark:hover:bg-[#12463C] flex items-center justify-center transition-all cursor-pointer border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.2)] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 select-none backdrop-blur-xs"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl leading-none">chevron_left</span>
        </button>

        {/* Horizontally Scrollable Cards Row */}
        <div
          ref={scrollContainerRef}
          onScroll={handleNativeScroll}
          tabIndex={0}
          aria-label="Recommended doctors carousel"
          className="flex gap-4 sm:gap-5 items-stretch overflow-x-auto py-2 px-4 sm:px-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006C56] rounded-2xl select-none"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {loopedList.map((therapist) => (
            <div
              key={therapist.loopKey}
              className="therapist-carousel-item w-[280px] sm:w-[325px] lg:w-[340px] shrink-0 flex flex-col h-[240px] relative"
            >
              <TherapistCard
                therapist={therapist}
                onNavigate={onNavigate}
                onBook={onBook}
                onOpenRatingModal={onOpenRatingModal}
              />
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button
          type="button"
          onClick={() => {
            handleUserInteraction();
            stepForward();
          }}
          aria-label="Next doctors"
          className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] rounded-full bg-white/95 dark:bg-[#0E3931]/95 text-[#19332A] dark:text-[#F4FAF7] hover:bg-white dark:hover:bg-[#12463C] flex items-center justify-center transition-all cursor-pointer border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.2)] shadow-md hover:shadow-lg hover:scale-105 active:scale-95 select-none backdrop-blur-xs"
        >
          <span className="material-symbols-outlined text-lg sm:text-xl leading-none">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
