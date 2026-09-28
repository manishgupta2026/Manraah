"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UnifiedTherapist } from "./types";

interface TherapistCardProps {
  therapist: UnifiedTherapist;
  onNavigate?: (section: "dashboard" | "appointments" | "journey" | "resources" | "ai-companion") => void;
  onBook?: (therapist: UnifiedTherapist) => void;
  isFirstCard?: boolean;
  isLastCard?: boolean;
}

export default function TherapistCard({
  therapist,
  onNavigate,
  onBook,
}: TherapistCardProps) {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (onBook) {
      e.preventDefault();
      onBook(therapist);
      return;
    }

    if (onNavigate) {
      e.preventDefault();
      onNavigate("appointments");
      router.push(`/appointments?doctor=${encodeURIComponent(therapist.id)}`);
      return;
    }

    router.push(`/appointments?doctor=${encodeURIComponent(therapist.id)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`View profile and book session with ${therapist.name}, ${therapist.role}`}
      className={`${therapist.bgTint} ${therapist.borderClass} rounded-3xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-md dark:hover:shadow-[0_14px_35px_rgba(0,0,0,0.4)] hover:border-[#008968]/50 dark:hover:border-[#00A889]/50 hover:-translate-y-1 transition-all duration-200 ease-out group h-full min-w-0 overflow-hidden select-none relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#006C56] dark:focus-visible:ring-[#00A889]`}
    >
      {/* Top Row: Avatar + Info Header + Status Badge */}
      <div className="flex items-start justify-between gap-2.5 h-[52px] shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Contained Avatar (52px × 52px, Circular, Cover) */}
          <div className="relative shrink-0 w-[52px] h-[52px] min-w-[52px] max-w-[52px] min-h-[52px] max-h-[52px]">
            <div className="w-[52px] h-[52px] min-w-[52px] min-h-[52px] rounded-full overflow-hidden border-2 border-white dark:border-[rgba(150,210,195,0.20)] shadow-xs bg-slate-100 dark:bg-[#082821]">
              <img
                src={therapist.profileImage || therapist.image || "/images/therapists/default-professional.jpg"}
                alt={therapist.name}
                className="w-full h-full object-cover block rounded-full"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("default-professional.jpg")) {
                    target.src = "/images/therapists/default-professional.jpg";
                  }
                }}
              />
            </div>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00A889] border-2 border-white dark:border-[#082821] shadow-xs"
              title="Available"
            />
          </div>

          {/* Professional Info (Aligned Name / Role / Rating) */}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] truncate leading-tight group-hover:text-[#006C56] dark:group-hover:text-[#73D8C4] transition-colors">
              {therapist.name}
            </h3>
            <p className="text-[11px] text-[#5A756C] dark:text-[#D5E6E0] font-semibold truncate mt-0.5 leading-tight">
              {therapist.role}
            </p>
            <div className="text-[10px] font-medium text-[#789389] dark:text-[#9DB9B0] mt-1 leading-tight flex items-center gap-1 truncate">
              <span className="text-amber-500 font-bold shrink-0">⭐ {therapist.rating}</span>
              <span className="shrink-0">({therapist.reviewCount})</span>
              <span className="text-slate-300 dark:text-slate-600 shrink-0">|</span>
              <span className="truncate">{therapist.experience}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {therapist.badge ? (
          <span
            className={`text-[9.5px] font-bold px-2.5 py-0.5 rounded-full ${therapist.badgeClass} shrink-0 whitespace-nowrap leading-tight self-start`}
          >
            {therapist.badge}
          </span>
        ) : null}
      </div>

      {/* Description (Fixed uniform 2-line height) */}
      <div className="my-2.5 h-[34px] flex items-center overflow-hidden shrink-0">
        <p className="text-[11px] text-[#4E685F] dark:text-[#D5E6E0] font-medium leading-relaxed line-clamp-2">
          {therapist.description}
        </p>
      </div>

      {/* Expertise Tags (Fixed height, 2 rows max, content-start) */}
      <div className="flex flex-wrap gap-1.5 mb-3 h-[46px] overflow-hidden content-start shrink-0">
        {therapist.tags.map((tag) => (
          <span
            key={tag.text}
            className={`text-[9.5px] font-semibold px-2.5 py-0.5 rounded-full ${tag.lightBg} ${tag.darkBg} leading-tight transition-colors whitespace-nowrap`}
          >
            {tag.text}
          </span>
        ))}
      </div>

      {/* Bottom Action Row */}
      <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 h-11 shrink-0">
        <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-[#4E685F] dark:text-[#9DB9B0] min-w-0">
          <svg
            className="w-3.5 h-3.5 text-[#006C56] dark:text-[#00A889] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="truncate">{therapist.availability}</span>
        </div>

        {therapist.hourlyRate && (
          <span className="text-[10px] font-bold text-[#006C56] dark:text-[#73D8C4] truncate shrink-0">
            {therapist.hourlyRate}
          </span>
        )}
      </div>
    </div>
  );
}
