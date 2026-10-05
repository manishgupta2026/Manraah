"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UnifiedTherapist } from "./types";
import { getRatingColorClasses, formatDoctorRating } from "./ratingUtils";
import { useAuth } from "@/frontend/lib/context/AuthContext";

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

interface TimeSlot {
  time: string;
  isoTime: string;
  available: boolean;
  reason?: "booked" | "past";
}

interface DateOption {
  fullDate: string; // YYYY-MM-DD
  dayName: string;  // Mon, Tue
  dayNum: number;   // 5, 6
  monthName: string; // Oct
  isToday: boolean;
}

interface DoctorProfileModalProps {
  therapist: UnifiedTherapist | null;
  isOpen: boolean;
  initialTab?: "profile" | "book" | "reviews";
  onClose: () => void;
  onRatingSubmitted?: (updatedData: {
    doctorId: string;
    averageRating: number;
    totalRatings: number;
  }) => void;
  onBookingSuccess?: (appointment: any) => void;
}

export default function DoctorProfileModal({
  therapist,
  isOpen,
  initialTab = "profile",
  onClose,
  onRatingSubmitted,
  onBookingSuccess,
}: DoctorProfileModalProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Full Doctor Profile Data from backend
  const [profileData, setProfileData] = useState<any | null>(null);
  const [ratingsData, setRatingsData] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Active section inside the modal
  const [activeTab, setActiveTab] = useState<"profile" | "book" | "reviews">("profile");

  // Booking Flow State
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string>("");
  const [bookingNotes, setBookingNotes] = useState<string>("");

  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<any | null>(null);

  // Rating Form State
  const [showRatingForm, setShowRatingForm] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  // Generate next 14 calendar dates
  useEffect(() => {
    const dates: DateOption[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const fullDate = `${year}-${month}-${day}`;

      dates.push({
        fullDate,
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday: i === 0,
      });
    }
    setDateOptions(dates);
    if (dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0].fullDate);
    }
  }, [selectedDate]);

  // Fetch doctor profile and reviews
  const loadDoctorDetails = useCallback(async (doctorId: string) => {
    try {
      setLoadingProfile(true);
      setProfileError(null);
      const res = await fetch(`/api/doctors/${encodeURIComponent(doctorId)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to load doctor profile.");
      }
      const json = await res.json();
      setProfileData(json.doctor);
      setRatingsData(json.ratings);

      if (json.ratings?.userReview) {
        setSelectedRating(json.ratings.userReview.rating);
        setFeedbackText(json.ratings.userReview.feedback || "");
      }
    } catch (err: any) {
      console.error("Error loading doctor profile:", err);
      setProfileError(err.message || "Could not load doctor details.");
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Fetch available slots for the selected date
  const loadAvailability = useCallback(async (doctorId: string, dateStr: string) => {
    if (!doctorId || !dateStr) return;
    try {
      setLoadingSlots(true);
      setBookingError(null);
      setSelectedSlot(null);
      const res = await fetch(
        `/api/doctors/${encodeURIComponent(doctorId)}/availability?date=${encodeURIComponent(dateStr)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        throw new Error("Failed to load available time slots.");
      }
      const json = await res.json();
      setSlots(Array.isArray(json.slots) ? json.slots : []);
    } catch (err: any) {
      console.error("Error loading availability:", err);
      setBookingError(err.message || "Failed to fetch availability.");
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && therapist) {
      setActiveTab(initialTab);
      setShowRatingForm(false);
      setRatingError(null);
      setRatingSuccessMsg(null);
      setBookingError(null);
      setBookedAppointment(null);
      loadDoctorDetails(therapist.id);
    }
  }, [isOpen, therapist, initialTab, loadDoctorDetails]);

  // When date changes, refresh slots
  useEffect(() => {
    if (isOpen && therapist && selectedDate) {
      loadAvailability(therapist.id, selectedDate);
    }
  }, [isOpen, therapist, selectedDate, loadAvailability]);

  // Handle ESC key
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

  const currentAverage: number = ratingsData?.averageRating ??
    (typeof therapist.rating === "string" ? parseFloat(therapist.rating) || 0 : therapist.rating || 0);

  const currentCount: number = ratingsData?.totalRatings ??
    (typeof therapist.reviewCount === "string" ? parseInt(therapist.reviewCount, 10) || 0 : therapist.reviewCount || 0);

  const formatted = formatDoctorRating(currentAverage, currentCount);
  const ratingColors = getRatingColorClasses(currentAverage, currentCount);

  // Submit Rating
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingError("Please select a rating between 1 and 5 stars.");
      return;
    }

    try {
      setIsSubmittingRating(true);
      setRatingError(null);
      setRatingSuccessMsg(null);

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

      setRatingsData(responseData.ratings || responseData);
      setRatingSuccessMsg("Thank you! Your verified feedback has been recorded.");
      setShowRatingForm(false);

      if (onRatingSubmitted) {
        onRatingSubmitted({
          doctorId: therapist.id,
          averageRating: responseData.ratings?.averageRating || responseData.averageRating,
          totalRatings: responseData.ratings?.totalRatings || responseData.totalRatings,
        });
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("doctor-rating-updated", {
            detail: {
              doctorId: therapist.id,
              averageRating: responseData.ratings?.averageRating || responseData.averageRating,
              totalRatings: responseData.ratings?.totalRatings || responseData.totalRatings,
            },
          })
        );
      }
    } catch (err: any) {
      setRatingError(err.message || "Failed to save your review.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Submit Booking
  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      setBookingError("Please select an available time slot.");
      return;
    }

    try {
      setIsSubmittingBooking(true);
      setBookingError(null);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: therapist.id,
          therapistName: therapist.name,
          therapistRole: therapist.role,
          therapistImage: therapist.profileImage || therapist.image,
          appointmentDate: selectedSlot.isoTime,
          focusArea: selectedFocus || (therapist.tags?.[0]?.text || "General Mental Health"),
          sessionType: "1-on-1 Video Session",
          durationMinutes: 45,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        // Concurrency conflict / slot already booked
        throw new Error(json.error || "This time slot is no longer available. Please select another time.");
      }

      setBookedAppointment(json.appointment);

      // Dispatch real-time global event
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("appointment-updated", {
            detail: { appointment: json.appointment },
          })
        );
      }

      if (onBookingSuccess) {
        onBookingSuccess(json.appointment);
      }
    } catch (err: any) {
      setBookingError(err.message || "Could not schedule session. Please try another slot.");
      // Refresh availability immediately
      loadAvailability(therapist.id, selectedDate);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const distribution = ratingsData?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const specialties = profileData?.specialties?.length
    ? profileData.specialties
    : therapist.tags.map((t) => t.text);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doctor-profile-title"
    >
      <div
        className="bg-white dark:bg-[#0A2923] text-[#19332A] dark:text-[#F4FAF7] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.18)] overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* MODAL HEADER: Clean Doctor Identity & Navigation Tabs             */}
        {/* ================================================================= */}
        <div className="p-5 sm:p-6 border-b border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] bg-[#FAFDFB] dark:bg-[#07211C] shrink-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white dark:border-[#143B33] shadow-xs shrink-0 bg-slate-100 dark:bg-[#0E3931]">
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
                <div className="flex items-center gap-2">
                  <h2
                    id="doctor-profile-title"
                    className="text-lg sm:text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug truncate"
                  >
                    {therapist.name}
                  </h2>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-[#006C56] dark:text-[#73D8C4] shrink-0">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>Verified</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#5A756C] dark:text-[#9DB9B0] font-semibold truncate mt-0.5">
                  {therapist.role}
                </p>

                <div className="flex items-center gap-2 mt-1 text-xs font-medium text-[#789389] dark:text-[#9DB9B0]">
                  <span className="text-amber-500 font-bold">★ {formatted.isUnrated ? "--" : formatted.displayText}</span>
                  <span>·</span>
                  <span>{currentCount} verified review{currentCount === 1 ? "" : "s"}</span>
                  <span>·</span>
                  <span className="text-[#006C56] dark:text-[#73D8C4] font-semibold">{therapist.experience}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-9 h-9 rounded-full bg-[#F0F5F2] dark:bg-[#0E3931] text-[#5A756C] dark:text-[#9DB9B0] hover:text-[#19332A] dark:hover:text-white hover:bg-[#E2ECE6] dark:hover:bg-[#143B33] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg leading-none">close</span>
            </button>
          </div>

          {/* Tab Navigation Pill Group */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-[#006C56] text-white dark:bg-[#00A889] shadow-xs"
                  : "bg-black/5 dark:bg-white/5 text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/10"
              }`}
            >
              Overview &amp; Bio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("book")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "book"
                  ? "bg-[#006C56] text-white dark:bg-[#00A889] shadow-xs"
                  : "bg-black/5 dark:bg-white/5 text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/10"
              }`}
            >
              <span className="material-symbols-outlined text-sm leading-none">calendar_month</span>
              <span>Book a Session</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "reviews"
                  ? "bg-[#006C56] text-white dark:bg-[#00A889] shadow-xs"
                  : "bg-black/5 dark:bg-white/5 text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/10"
              }`}
            >
              <span className="material-symbols-outlined text-sm leading-none">rate_review</span>
              <span>Patient Reviews ({currentCount})</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MODAL BODY: Scrollable Container                                 */}
        {/* ================================================================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {loadingProfile ? (
            /* Skeleton Loading State */
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-1/3 bg-slate-200 dark:bg-[#143B33] rounded" />
              <div className="h-16 bg-slate-200 dark:bg-[#143B33] rounded-2xl" />
              <div className="h-20 bg-slate-200 dark:bg-[#143B33] rounded-2xl" />
            </div>
          ) : profileError ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center gap-3">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              <p className="text-xs">{profileError}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & BIO */}
              {activeTab === "profile" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* About Section */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                      About {therapist.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2A443C] dark:text-[#D5E6E0] leading-relaxed font-medium">
                      {profileData?.bio || therapist.description}
                    </p>
                  </div>

                  {/* Specializations Tags */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                      Specializations &amp; Focus Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((spec: string) => (
                        <span
                          key={spec}
                          className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 dark:bg-[#0E3931] border border-emerald-200/80 dark:border-[rgba(0,168,137,0.25)] text-[#006C56] dark:text-[#73D8C4]"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Session Information Card */}
                  <div className="bg-[#FAFDFB] dark:bg-[#07211C] p-4.5 rounded-2xl border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                      Session Information
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0A2923] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]">
                        <span className="text-[10px] text-[#789389] dark:text-[#9DB9B0] block">Duration</span>
                        <span className="font-bold text-[#19332A] dark:text-[#F4FAF7] mt-0.5 block">45 Minutes</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0A2923] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]">
                        <span className="text-[10px] text-[#789389] dark:text-[#9DB9B0] block">Fee</span>
                        <span className="font-bold text-[#19332A] dark:text-[#F4FAF7] mt-0.5 block">
                          {profileData?.hourlyRate || therapist.hourlyRate || "₹1,800"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0A2923] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]">
                        <span className="text-[10px] text-[#789389] dark:text-[#9DB9B0] block">Format</span>
                        <span className="font-bold text-[#19332A] dark:text-[#F4FAF7] mt-0.5 block">1-on-1 Video</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#0A2923] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)]">
                        <span className="text-[10px] text-[#789389] dark:text-[#9DB9B0] block">Language</span>
                        <span className="font-bold text-[#19332A] dark:text-[#F4FAF7] mt-0.5 block">English, Hindi</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Session Callout CTA */}
                  <div className="pt-2 flex items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-[rgba(0,168,137,0.08)] border border-emerald-200/80 dark:border-[rgba(0,168,137,0.2)]">
                    <div>
                      <h4 className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                        Ready to begin your session?
                      </h4>
                      <p className="text-[11px] text-[#5A756C] dark:text-[#9DB9B0]">
                        Choose from upcoming available consultation slots.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("book")}
                      className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#006C56] hover:bg-[#005745] text-white dark:bg-[#00A889] dark:hover:bg-[#009176] transition-all shadow-xs cursor-pointer shrink-0"
                    >
                      Book a Session
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BOOK A SESSION (REAL AVAILABILITY FLOW) */}
              {activeTab === "book" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {bookedAppointment ? (
                    /* Booking Success Confirmation */
                    <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-4 animate-in zoom-in-95">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          Session Booked Successfully!
                        </h3>
                        <p className="text-xs text-[#5A756C] dark:text-[#9DB9B0]">
                          Your appointment with {therapist.name} has been confirmed in the system.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white dark:bg-[#0A2923] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] text-left space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#789389]">Practitioner:</span>
                          <span className="font-bold">{therapist.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#789389]">Date &amp; Time:</span>
                          <span className="font-bold">
                            {new Date(bookedAppointment.appointmentDate).toLocaleString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#789389]">Duration:</span>
                          <span className="font-bold">45 Minutes (Video Consultation)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push("/appointments");
                          }}
                          className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#006C56] text-white hover:bg-[#005745] dark:bg-[#00A889] transition-all shadow-xs cursor-pointer"
                        >
                          View in Appointments
                        </button>
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Date & Time Slot Selection Flow */
                    <div className="space-y-5">
                      {/* Date Selector Row */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                            1. Select Date
                          </label>
                          <span className="text-[11px] text-[#789389] dark:text-[#9DB9B0]">
                            Next 14 days availability
                          </span>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                          {dateOptions.map((opt) => {
                            const isSelected = selectedDate === opt.fullDate;
                            return (
                              <button
                                key={opt.fullDate}
                                type="button"
                                onClick={() => setSelectedDate(opt.fullDate)}
                                className={`flex flex-col items-center justify-center py-2.5 px-3.5 rounded-2xl border min-w-[64px] transition-all cursor-pointer shrink-0 snap-start ${
                                  isSelected
                                    ? "bg-[#006C56] text-white border-[#006C56] dark:bg-[#00A889] dark:border-[#00A889] shadow-xs"
                                    : "bg-white dark:bg-[#07211C] border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] text-[#19332A] dark:text-[#F4FAF7] hover:border-[#006C56]/50"
                                }`}
                              >
                                <span className={`text-[10px] font-semibold uppercase ${isSelected ? "text-emerald-100" : "text-[#789389]"}`}>
                                  {opt.dayName}
                                </span>
                                <span className="text-base font-heading font-black my-0.5">
                                  {opt.dayNum}
                                </span>
                                <span className={`text-[9px] font-medium ${isSelected ? "text-emerald-100" : "text-[#789389]"}`}>
                                  {opt.monthName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Slots Grid */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                            2. Select Time Slot
                          </label>
                          <span className="text-[11px] text-[#789389] dark:text-[#9DB9B0]">
                            {loadingSlots ? "Checking real-time slots..." : `${slots.filter((s) => s.available).length} slots available`}
                          </span>
                        </div>

                        {loadingSlots ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-pulse">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                              <div key={i} className="h-11 bg-slate-100 dark:bg-[#143B33] rounded-xl" />
                            ))}
                          </div>
                        ) : slots.length === 0 ? (
                          <div className="p-6 text-center bg-[#FAFDFB] dark:bg-[#07211C] rounded-2xl border border-dashed border-[#D5E6E0] dark:border-[rgba(150,210,195,0.15)]">
                            <p className="text-xs font-semibold text-[#5A756C] dark:text-[#9DB9B0]">
                              No slots available on this date.
                            </p>
                            <p className="text-[11px] text-[#789389] mt-1">
                              Please select another date above.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {slots.map((s) => {
                              const isSelected = selectedSlot?.isoTime === s.isoTime;
                              return (
                                <button
                                  key={s.isoTime}
                                  type="button"
                                  disabled={!s.available}
                                  onClick={() => setSelectedSlot(s)}
                                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed ${
                                    isSelected
                                      ? "bg-[#006C56] text-white border-[#006C56] dark:bg-[#00A889] dark:border-[#00A889] shadow-xs scale-102"
                                      : s.available
                                      ? "bg-white dark:bg-[#07211C] border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] text-[#19332A] dark:text-[#F4FAF7] hover:border-[#006C56] hover:bg-emerald-50/40"
                                      : "bg-slate-100 dark:bg-white/5 border-transparent text-slate-400 dark:text-slate-600 line-through opacity-60"
                                  }`}
                                >
                                  <span>{s.time}</span>
                                  {!s.available && (
                                    <span className="text-[9px] font-normal no-underline opacity-80">
                                      {s.reason === "booked" ? "Booked" : "Past"}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Optional Session Focus Area */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#19332A] dark:text-[#F4FAF7] block">
                          Session focus area <span className="text-[11px] font-normal text-[#789389]">(optional)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {specialties.map((spec: string) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => setSelectedFocus(selectedFocus === spec ? "" : spec)}
                              className={`text-[11px] px-3 py-1 rounded-xl border transition-all cursor-pointer font-medium ${
                                selectedFocus === spec
                                  ? "bg-[#006C56] text-white border-[#006C56] dark:bg-[#00A889]"
                                  : "bg-white dark:bg-[#07211C] border-[#D5E6E0] dark:border-[rgba(150,210,195,0.2)] text-[#5A756C] dark:text-[#9DB9B0]"
                              }`}
                            >
                              {spec}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Error Alert Banner */}
                      {bookingError && (
                        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                          <span className="material-symbols-outlined text-lg shrink-0">error</span>
                          <span>{bookingError}</span>
                        </div>
                      )}

                      {/* Booking Summary & Confirmation CTA */}
                      {selectedSlot && (
                        <div className="p-4.5 rounded-2xl bg-[#FAFDFB] dark:bg-[#07211C] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.15)] space-y-3 animate-in slide-in-from-top-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#789389] dark:text-[#9DB9B0]">Selected Slot:</span>
                            <span className="font-bold text-[#006C56] dark:text-[#73D8C4]">
                              {selectedSlot.time} on {new Date(selectedSlot.isoTime).toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#789389] dark:text-[#9DB9B0]">Total Fee:</span>
                            <span className="font-bold text-[#19332A] dark:text-[#F4FAF7]">
                              {profileData?.hourlyRate || therapist.hourlyRate || "₹1,800"} (45 min)
                            </span>
                          </div>

                          <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedSlot(null)}
                              disabled={isSubmittingBooking}
                              className="px-4 py-2 rounded-full text-xs font-semibold text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/5 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmBooking}
                              disabled={isSubmittingBooking}
                              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#006C56] hover:bg-[#005745] text-white dark:bg-[#00A889] dark:hover:bg-[#009176] transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isSubmittingBooking ? (
                                <>
                                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                                  <span>Booking session...</span>
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">lock</span>
                                  <span>Confirm &amp; Schedule</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PATIENT REVIEWS & RATINGS */}
              {activeTab === "reviews" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Rating Success Alert */}
                  {ratingSuccessMsg && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                      <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400 shrink-0">
                        check_circle
                      </span>
                      <span>{ratingSuccessMsg}</span>
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

                      {/* Rate this Doctor Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowRatingForm(!showRatingForm);
                          setRatingError(null);
                        }}
                        className={`h-9 px-4.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0 self-start sm:self-center ${
                          showRatingForm
                            ? "bg-[#E2ECE6] dark:bg-[#143B33] text-[#19332A] dark:text-[#F4FAF7] hover:bg-[#D5E6E0]"
                            : "bg-[#006C56] hover:bg-[#005745] text-white dark:bg-[#00A889] dark:hover:bg-[#009176]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-base leading-none">
                          {ratingsData?.userReview ? "edit" : "star"}
                        </span>
                        <span>{ratingsData?.userReview ? "Edit Your Review" : "Rate this Doctor"}</span>
                      </button>
                    </div>

                    {/* Compact 5-Star Breakdown */}
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

                  {/* 2. Rating Form (Expandable) */}
                  {showRatingForm && (
                    <form
                      onSubmit={handleSubmitRating}
                      className="bg-emerald-50/40 dark:bg-[rgba(0,168,137,0.06)] p-5 rounded-2xl border border-emerald-200/80 dark:border-[rgba(0,168,137,0.25)] space-y-4.5 animate-in slide-in-from-top-3 duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#006C56] dark:text-[#73D8C4]">
                          {ratingsData?.userReview ? "Update your experience" : "Rate your experience"}
                        </h3>
                        {ratingsData?.userReview && (
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

                      {/* Feedback Text Area */}
                      <div className="space-y-1.5">
                        <label htmlFor="feedback-input" className="text-xs font-semibold text-[#19332A] dark:text-[#F4FAF7] block">
                          Share your experience <span className="text-xs font-normal text-[#789389] dark:text-[#9DB9B0]">(optional)</span>
                        </label>
                        <textarea
                          id="feedback-input"
                          rows={3}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Write your feedback regarding communication, empathy, and practical guidance..."
                          maxLength={1000}
                          className="w-full text-xs p-3.5 rounded-xl bg-white dark:bg-[#07211C] border border-[#D5E6E0] dark:border-[rgba(150,210,195,0.2)] text-[#19332A] dark:text-[#F4FAF7] placeholder:text-[#9DB9B0] focus:outline-none focus:ring-2 focus:ring-[#006C56] dark:focus:ring-[#00A889] transition-all resize-y min-h-[84px] leading-relaxed block"
                        />
                        <div className="flex justify-end text-[11px] text-[#789389] dark:text-[#9DB9B0] font-medium pt-0.5 tabular-nums">
                          {feedbackText.length} / 1000
                        </div>
                      </div>

                      {ratingError && (
                        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                          <span className="material-symbols-outlined text-base shrink-0">error</span>
                          <span>{ratingError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowRatingForm(false)}
                          disabled={isSubmittingRating}
                          className="h-9 px-4 rounded-full text-xs font-semibold text-[#5A756C] dark:text-[#9DB9B0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingRating}
                          className="h-9 px-5 rounded-full text-xs font-bold bg-[#006C56] hover:bg-[#005745] text-white dark:bg-[#00A889] dark:hover:bg-[#009176] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingRating ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <span>{ratingsData?.userReview ? "Update Review" : "Submit Review"}</span>
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
                        {ratingsData?.reviews?.length || 0} review{(ratingsData?.reviews?.length || 0) === 1 ? "" : "s"}
                      </span>
                    </div>

                    {!ratingsData?.reviews || ratingsData.reviews.length === 0 ? (
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
                        {ratingsData.reviews.map((rev: any) => (
                          <div
                            key={rev.id}
                            className="p-4 rounded-2xl bg-[#FAFDFB] dark:bg-[#07211C] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] space-y-2.5 transition-colors shadow-2xs"
                          >
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
                </div>
              )}
            </>
          )}
        </div>

        {/* ================================================================= */}
        {/* MODAL FOOTER: Privacy Info & Close Button                        */}
        {/* ================================================================= */}
        <div className="p-5 sm:p-6 border-t border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] bg-[#FAFDFB] dark:bg-[#07211C] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#789389] dark:text-[#9DB9B0] font-medium">
            <span className="material-symbols-outlined text-sm text-[#006C56] dark:text-[#00A889]">lock</span>
            <span>Anonymous &amp; Verified Patient Care</span>
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
