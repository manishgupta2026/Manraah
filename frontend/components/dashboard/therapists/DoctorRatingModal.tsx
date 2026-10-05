"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UnifiedTherapist } from "./types";
import { getRatingColorClasses, formatDoctorRating } from "./ratingUtils";

function formatReviewDate(dateStr: string | undefined): string {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recently";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

interface ReviewItem {
  id: string | number;
  rating: number;
  feedback: string | null;
  createdAt: string;
  patientDisplayLabel?: string;
  authorLabel?: string;
  isCurrentUser?: boolean;
  isOwnReview?: boolean;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface RatingsApiResponse {
  doctorId: string;
  doctorName: string;
  averageRating: number;
  totalRatings: number;
  distribution: RatingDistribution;
  reviews: ReviewItem[];
  userReview: ReviewItem | null;
  canRate: boolean;
  appointmentCount?: number;
}

interface DoctorRatingModalProps {
  therapist: UnifiedTherapist | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted?: (updatedData: {
    doctorId: string;
    averageRating: number;
    totalRatings: number;
  }) => void;
}

export default function DoctorRatingModal({
  therapist,
  isOpen,
  onClose,
  onRatingSubmitted,
}: DoctorRatingModalProps) {
  const [data, setData] = useState<RatingsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rating Form State
  const [showRatingForm, setShowRatingForm] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Fetch rating details from backend
  const fetchRatingDetails = useCallback(async (doctorId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/doctors/${encodeURIComponent(doctorId)}/ratings`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to load doctor reviews and rating");
      }
      const json: RatingsApiResponse = await res.json();
      setData(json);

      // Pre-fill user review if one exists
      if (json.userReview) {
        setSelectedRating(json.userReview.rating);
        setFeedbackText(json.userReview.feedback || "");
      }
    } catch (err: any) {
      console.error("Error fetching ratings:", err);
      setError(err.message || "Could not fetch ratings at this time.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && therapist) {
      setShowRatingForm(false);
      setSubmitError(null);
      setSubmitSuccessMsg(null);
      fetchRatingDetails(therapist.id);
    } else {
      setData(null);
    }
  }, [isOpen, therapist, fetchRatingDetails]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !therapist) return null;

  const currentAverage: number = data
    ? data.averageRating
    : typeof therapist.rating === "string"
    ? parseFloat(therapist.rating) || 0
    : therapist.rating || 0;

  const currentCount: number = data
    ? data.totalRatings
    : typeof therapist.reviewCount === "string"
    ? parseInt(therapist.reviewCount, 10) || 0
    : therapist.reviewCount || 0;

  const ratingColors = getRatingColorClasses(currentAverage, currentCount);
  const formatted = formatDoctorRating(currentAverage, currentCount);

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setSubmitError("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccessMsg(null);

      const res = await fetch(`/api/doctors/${encodeURIComponent(therapist.id)}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: selectedRating,
          feedback: feedbackText.trim(),
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to submit rating.");
      }

      // Update modal data
      setData(responseData.ratings);
      setSubmitSuccessMsg("Thank you! Your feedback has been recorded.");
      setShowRatingForm(false);

      // Notify parent & global event listeners
      if (onRatingSubmitted) {
        onRatingSubmitted({
          doctorId: therapist.id,
          averageRating: responseData.ratings.averageRating,
          totalRatings: responseData.ratings.totalRatings,
        });
      }

      // Dispatch real-time window event so all cards and carousel components update
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("doctor-rating-updated", {
            detail: {
              doctorId: therapist.id,
              averageRating: responseData.ratings.averageRating,
              totalRatings: responseData.ratings.totalRatings,
              distribution: responseData.ratings.distribution,
            },
          })
        );
      }
    } catch (err: any) {
      console.error("Failed to submit rating:", err);
      setSubmitError(err.message || "Failed to save your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const distribution = data?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxBarCount = Math.max(...Object.values(distribution), 1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-rating-title"
    >
      <div
        className="bg-white dark:bg-[#0A2923] text-[#19332A] dark:text-[#F4FAF7] w-full max-w-lg rounded-3xl shadow-2xl border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.18)] overflow-hidden flex flex-col max-h-[88vh] transition-all transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header: Clear Doctor Identity */}
        <div className="p-5 sm:p-6 border-b border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex items-center justify-between gap-4 shrink-0 bg-[#FAFDFB] dark:bg-[#07211C]">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-white dark:border-[#143B33] shadow-xs shrink-0 bg-slate-100 dark:bg-[#0E3931]">
              <img
                src={therapist.profileImage || therapist.image || "/images/therapists/default-professional.jpg"}
                alt={therapist.name}
                className="w-full h-full object-cover block"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("default-professional.jpg")) {
                    target.src = "/images/therapists/default-professional.jpg";
                  }
                }}
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h2
                id="doctor-rating-title"
                className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug truncate"
              >
                {therapist.name}
              </h2>
              <p className="text-xs text-[#5A756C] dark:text-[#9DB9B0] font-semibold truncate">
                {therapist.role}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs font-medium text-[#789389] dark:text-[#9DB9B0]">
                <span className="text-amber-500 font-bold">★ {formatted.isUnrated ? "--" : formatted.displayText}</span>
                <span>·</span>
                <span>{currentCount} review{currentCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8.5 h-8.5 rounded-full bg-[#F0F5F2] dark:bg-[#0E3931] text-[#5A756C] dark:text-[#9DB9B0] hover:text-[#19332A] dark:hover:text-white hover:bg-[#E2ECE6] dark:hover:bg-[#143B33] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {loading ? (
            /* Skeleton Loading State */
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-24 bg-slate-200 dark:bg-[#143B33] rounded-xl" />
                <div className="h-4 w-32 bg-slate-200 dark:bg-[#143B33] rounded" />
              </div>
              <div className="space-y-2 pt-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-2.5 bg-slate-200 dark:bg-[#143B33] rounded w-full" />
                ))}
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="h-16 bg-slate-200 dark:bg-[#143B33] rounded-2xl" />
                <div className="h-16 bg-slate-200 dark:bg-[#143B33] rounded-2xl" />
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <>
              {/* Success Alert */}
              {submitSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                    check_circle
                  </span>
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              {/* 1. Overall Rating Hero + Rate Trigger + Compact Breakdown */}
              <div className="bg-[#FAFDFB] dark:bg-[#07211C] p-5 rounded-2xl border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Hero Rating Display */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-13.5 h-13.5 rounded-2xl bg-[#EAF6F0] dark:bg-[rgba(0,168,137,0.15)] flex flex-col items-center justify-center border border-[#D2EAE0] dark:border-[rgba(0,168,137,0.25)] shrink-0">
                      <span className="text-amber-500 text-xs leading-none">★</span>
                      <span className="text-xl font-heading font-black text-[#006C56] dark:text-[#73D8C4] leading-tight mt-0.5">
                        {formatted.isUnrated ? "--" : formatted.displayText}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                        {formatted.isUnrated ? "Not Rated Yet" : "Overall Rating"}
                      </div>
                      <p className="text-xs text-[#789389] dark:text-[#9DB9B0] mt-0.5">
                        {formatted.isUnrated
                          ? "Be the first patient to review."
                          : `Based on ${currentCount} verified review${currentCount === 1 ? "" : "s"}`}
                      </p>
                    </div>
                  </div>

                  {/* Rate this Doctor Button (vertically aligned) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRatingForm(!showRatingForm);
                      setSubmitError(null);
                    }}
                    className={`h-9 px-4.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 self-start sm:self-center ${
                      showRatingForm
                        ? "bg-[#E2ECE6] dark:bg-[#143B33] text-[#19332A] dark:text-[#F4FAF7] hover:bg-[#D5E6E0]"
                        : "bg-[#006C56] hover:bg-[#005745] text-white dark:bg-[#00A889] dark:hover:bg-[#009176]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base leading-none">
                      {data?.userReview ? "edit" : "star"}
                    </span>
                    <span>{data?.userReview ? "Edit Your Review" : "Rate this Doctor"}</span>
                  </button>
                </div>

                {/* Compact 5-Star Breakdown (Perfect Grid Alignment) */}
                <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-2">
                  {([5, 4, 3, 2, 1] as const).map((stars) => {
                    const count = distribution[stars] || 0;
                    const percent = currentCount > 0 ? (count / currentCount) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-8 font-bold text-[#19332A] dark:text-[#F4FAF7] shrink-0 text-xs">
                          <span>{stars}</span>
                          <span className="text-amber-400">★</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1 h-2 bg-[#E8F0EC] dark:bg-[#0E3931] rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-[#006C56] dark:bg-[#00A889] transition-all duration-500 ease-out"
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        {/* Count */}
                        <div className="w-6 text-right font-medium text-[#789389] dark:text-[#9DB9B0] text-xs shrink-0 tabular-nums">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Rating Form (Expandable with clear vertical rhythm) */}
              {showRatingForm && (
                <form
                  onSubmit={handleSubmitRating}
                  className="bg-emerald-50/40 dark:bg-[rgba(0,168,137,0.06)] p-5 rounded-2xl border border-emerald-200/80 dark:border-[rgba(0,168,137,0.25)] space-y-4.5 animate-in slide-in-from-top-3 duration-200"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                      {data?.userReview ? "Update your experience" : "Rate your experience"}
                    </h3>
                    {data?.userReview && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                        Editing previous review
                      </span>
                    )}
                  </div>

                  {/* Interactive Star Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#19332A] dark:text-[#F4FAF7] block">
                      Select rating (1–5 stars)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (hoverRating !== null ? hoverRating : selectedRating) >= star;
                          return (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setSelectedRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                              className="p-1 text-2xl transition-transform hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006C56] rounded-md cursor-pointer leading-none"
                            >
                              <span className={isFilled ? "text-amber-400" : "text-slate-300 dark:text-slate-700"}>
                                ★
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-bold text-[#5A756C] dark:text-[#9DB9B0] leading-none">
                        {hoverRating !== null ? hoverRating : selectedRating} of 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Optional Feedback Text Area & Character Counter */}
                  <div className="space-y-1.5">
                    <label htmlFor="feedback-input" className="text-xs font-semibold text-[#19332A] dark:text-[#F4FAF7] block">
                      Share your experience <span className="text-xs font-normal text-[#789389] dark:text-[#9DB9B0]">(optional)</span>
                    </label>
                    <textarea
                      id="feedback-input"
                      rows={3}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Write your feedback regarding the doctor's communication, empathy, and practical guidance..."
                      maxLength={1000}
                      className="w-full text-xs p-3.5 rounded-xl bg-white dark:bg-[#07211C] border border-[#D5E6E0] dark:border-[rgba(150,210,195,0.2)] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#9DB9B0] focus:outline-none focus:ring-2 focus:ring-[#006C56] dark:focus:ring-[#00A889] transition-all resize-y min-h-[84px] leading-relaxed block"
                    />
                    <div className="flex justify-end text-[11px] text-[#789389] dark:text-[#9DB9B0] font-medium pt-0.5 tabular-nums">
                      {feedbackText.length} / 1000
                    </div>
                  </div>

                  {/* Submission Error Banner */}
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-base shrink-0">error</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Action Buttons: Cancel + Submit Review on the exact same baseline */}
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowRatingForm(false)}
                      disabled={isSubmitting}
                      className="h-9 px-4 rounded-full text-xs font-semibold text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-9 px-5 rounded-full text-xs font-bold bg-[#006C56] hover:bg-[#005745] text-white dark:bg-[#00A889] dark:hover:bg-[#009176] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>{data?.userReview ? "Update Review" : "Submit Review"}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* 3. Patient Experiences List */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                    Patient experiences
                  </h3>
                  <span className="text-xs text-[#789389] dark:text-[#9DB9B0] font-medium">
                    {data?.reviews.length || 0} review{(data?.reviews.length || 0) === 1 ? "" : "s"}
                  </span>
                </div>

                {!data?.reviews || data.reviews.length === 0 ? (
                  <div className="p-6 text-center bg-[#FAFDFB] dark:bg-[#07211C] rounded-2xl border border-dashed border-[#D5E6E0] dark:border-[rgba(150,210,195,0.15)]">
                    <p className="text-xs font-semibold text-[#5A756C] dark:text-[#9DB9B0]">
                      No patient reviews yet.
                    </p>
                    <p className="text-xs text-[#789389] dark:text-[#678B81] mt-1">
                      Be the first to share your experience after your session.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-[#FAFDFB] dark:bg-[#07211C] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] space-y-2.5 transition-colors shadow-2xs"
                      >
                        {/* Top Row: Stars (Left) + Verified Patient & Date (Right) */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2.5 py-0.5 rounded-lg flex items-center gap-1 leading-none">
                              <span>★</span>
                              <span>{rev.rating}.0</span>
                            </span>
                            {(rev.isCurrentUser || rev.isOwnReview) && (
                              <span className="text-[10px] bg-[#006C56]/10 text-[#006C56] dark:text-[#73D8C4] px-2 py-0.5 rounded-full font-bold">
                                Your Review
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#789389] dark:text-[#9DB9B0] flex items-center gap-1.5 font-medium">
                            <span className="material-symbols-outlined text-sm text-[#006C56] dark:text-[#00A889]">
                              verified
                            </span>
                            <span>{rev.authorLabel || rev.patientDisplayLabel || "Verified Patient"}</span>
                            <span>·</span>
                            <span>{formatReviewDate(rev.createdAt)}</span>
                          </div>
                        </div>

                        {/* Review Body */}
                        {rev.feedback ? (
                          <p className="text-xs text-[#2A443C] dark:text-[#D5E6E0] leading-relaxed font-medium">
                            &ldquo;{rev.feedback}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs text-[#789389] dark:text-[#678B81] italic">
                            Rated without written feedback.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer: Locked at bottom with Privacy label & Close Button */}
        <div className="p-5 sm:p-6 border-t border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] bg-[#FAFDFB] dark:bg-[#07211C] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#789389] dark:text-[#9DB9B0] font-medium">
            <span className="material-symbols-outlined text-sm text-[#006C56] dark:text-[#00A889]">lock</span>
            <span>Anonymous &amp; Verified Patient Data</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-full text-xs font-bold bg-[#E2ECE6] dark:bg-[#143B33] text-[#19332A] dark:text-[#F4FAF7] hover:bg-[#D5E6E0] dark:hover:bg-[#19473D] transition-colors cursor-pointer flex items-center justify-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
