"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TherapistCarousel from "./TherapistCarousel";
import { UnifiedTherapist, normalizeTherapist, FALLBACK_THERAPISTS } from "./types";

interface RecommendedProfessionalsProps {
  therapists?: any[];
  onNavigate?: (section: "dashboard" | "appointments" | "journey" | "resources" | "ai-companion") => void;
  onBook?: (therapist: UnifiedTherapist) => void;
}

export default function RecommendedProfessionals({
  therapists: initialTherapists,
  onNavigate,
  onBook,
}: RecommendedProfessionalsProps) {
  const [items, setItems] = useState<UnifiedTherapist[]>(() => {
    if (initialTherapists && initialTherapists.length > 0) {
      return initialTherapists.map((t, i) => normalizeTherapist(t, i));
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(!initialTherapists || initialTherapists.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTherapists && initialTherapists.length > 0) {
      setItems(initialTherapists.map((t, i) => normalizeTherapist(t, i)));
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadTherapists() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/therapists");
        if (!res.ok) {
          throw new Error("Failed to fetch therapists");
        }
        const data = await res.json();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            // If API returns fewer than 3 items (e.g. initial 2 seed records),
            // augment with fallback therapists to ensure a full sanctuary showcase
            const normalized = data.map((t: any, i: number) => normalizeTherapist(t, i));
            if (normalized.length < 3) {
              const existingIds = new Set(normalized.map((t: UnifiedTherapist) => t.id));
              const additions = FALLBACK_THERAPISTS.filter((t) => !existingIds.has(t.id));
              setItems([...normalized, ...additions]);
            } else {
              setItems(normalized);
            }
          } else {
            setItems(FALLBACK_THERAPISTS);
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Using fallback therapists directory:", err.message);
          setItems(FALLBACK_THERAPISTS);
          setLoading(false);
        }
      }
    }

    loadTherapists();

    return () => {
      isMounted = false;
    };
  }, [initialTherapists]);

  return (
    <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col gap-4 sm:gap-5 transition-colors w-full min-w-0 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon and Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8.5 h-8.5 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shrink-0">
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight truncate">
              Recommended for You
            </h2>
            <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5 truncate">
              Curated by our mental health professionals
            </p>
          </div>
        </div>

        {/* Right: View All Link */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {onNavigate ? (
            <button
              onClick={() => onNavigate("appointments")}
              type="button"
              className="text-xs font-bold text-[#004D3D] dark:text-[#00A982] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          ) : (
            <Link
              href="/appointments"
              className="text-xs font-bold text-[#004D3D] dark:text-[#00A982] hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        /* Loading Skeleton (3 equal-height placeholder cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#F8FAF9] dark:bg-[#14382F]/50 border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl p-5 flex flex-col justify-between animate-pulse min-h-[220px]"
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-[52px] h-[52px] rounded-full bg-slate-200 dark:bg-[#1A453B] shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3.5 bg-slate-200 dark:bg-[#1A453B] rounded w-3/4" />
                    <div className="h-2.5 bg-slate-200 dark:bg-[#1A453B] rounded w-1/2" />
                    <div className="h-2 bg-slate-200 dark:bg-[#1A453B] rounded w-2/3" />
                  </div>
                </div>
                <div className="w-14 h-4 bg-slate-200 dark:bg-[#1A453B] rounded-full" />
              </div>
              <div className="space-y-1.5 my-3">
                <div className="h-2.5 bg-slate-200 dark:bg-[#1A453B] rounded w-full" />
                <div className="h-2.5 bg-slate-200 dark:bg-[#1A453B] rounded w-4/5" />
              </div>
              <div className="flex gap-1.5 mb-3.5">
                <div className="h-4 bg-slate-200 dark:bg-[#1A453B] rounded-full w-20" />
                <div className="h-4 bg-slate-200 dark:bg-[#1A453B] rounded-full w-16" />
              </div>
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="h-3 bg-slate-200 dark:bg-[#1A453B] rounded w-24" />
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#1A453B]" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-2.5 bg-[#FAFDFB] dark:bg-[#14382F]/30 rounded-2xl border border-dashed border-[#D6EFE2] dark:border-[#23483E]">
          <div className="w-10 h-10 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
            No professionals available right now.
          </p>
          <p className="text-[11px] text-[#789389] dark:text-[#78958C]">
            Please check back soon or explore our resources.
          </p>
        </div>
      ) : (
        /* Continuous Smooth Auto-Scroll Carousel */
        <TherapistCarousel
          therapists={items}
          onNavigate={onNavigate}
          onBook={onBook}
        />
      )}
    </div>
  );
}
