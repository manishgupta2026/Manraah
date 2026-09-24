"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";
import TherapistCard from "@/frontend/components/dashboard/therapists/TherapistCard";
import { UnifiedTherapist, FALLBACK_THERAPISTS, normalizeTherapist } from "@/frontend/components/dashboard/therapists/types";

const PAST_SESSIONS = [
  {
    id: "past-1",
    therapistName: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist",
    date: "22 Sep 2026",
    time: "08:00 PM",
    focus: "Managing Overthinking & Cognitive Restructuring",
    status: "Completed",
  },
  {
    id: "past-2",
    therapistName: "Dr. Arjun Mehta",
    role: "Career Counselor",
    date: "10 Sep 2026",
    time: "07:30 PM",
    focus: "Workplace Boundary Setting & Burnout Recovery",
    status: "Completed",
  },
  {
    id: "past-3",
    therapistName: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist",
    date: "28 Aug 2026",
    time: "08:00 PM",
    focus: "Initial Assessment & Emotional Baseline Check",
    status: "Completed",
  },
];

const SPECIALTY_FILTERS = [
  "All",
  "Anxiety & Stress",
  "Work-Life Balance",
  "Relationships",
  "Career Growth",
  "Mindfulness",
];

export default function AppointmentsView() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [therapistsList, setTherapistsList] = useState<UnifiedTherapist[]>(FALLBACK_THERAPISTS);
  const [showBookingModal, setShowBookingModal] = useState<UnifiedTherapist | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("tomorrow");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  const [pastList, setPastList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTherapists() {
      try {
        const res = await fetch("/api/therapists");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const normalized = data.map((t: any, i: number) => normalizeTherapist(t, i));
            if (normalized.length < 3) {
              const existingIds = new Set(normalized.map((t: UnifiedTherapist) => t.id));
              const additions = FALLBACK_THERAPISTS.filter((t) => !existingIds.has(t.id));
              setTherapistsList([...normalized, ...additions]);
            } else {
              setTherapistsList(normalized);
            }
          }
        }
      } catch (err) {
        // Use fallback therapists
      }
    }
    loadTherapists();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setUpcomingList(data.upcoming || []);
        setPastList(data.past || []);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();

    const handleAuthChange = () => {
      fetchAppointments();
    };

    window.addEventListener("manraah_auth_changed", handleAuthChange);
    return () => {
      window.removeEventListener("manraah_auth_changed", handleAuthChange);
    };
  }, []);

  const filteredTherapists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const queryNormalized = query.replace(/[-_]/g, " ");
    const queryWords = query.split(/\s+/).filter(Boolean);

    return therapistsList.filter((doctor) => {
      // 1. Specialty / Category filter
      const matchesCategory =
        selectedSpecialty === "All" ||
        doctor.tags.some((tag) => {
          const tagText = (typeof tag === "string" ? tag : tag.text).toLowerCase();
          const spec = selectedSpecialty.toLowerCase();
          return tagText.includes(spec) || spec.includes(tagText);
        });

      if (!matchesCategory) return false;

      // 2. Search query filter
      if (!query) return true;

      const name = doctor.name.toLowerCase();
      const role = doctor.role.toLowerCase();
      const description = (doctor.description || "").toLowerCase();
      const tagsText = doctor.tags
        .map((tag) => (typeof tag === "string" ? tag : tag.text).toLowerCase())
        .join(" ");

      const fullContent = `${name} ${role} ${description} ${tagsText}`;
      const fullContentNormalized = fullContent.replace(/[-_]/g, " ");

      // Direct substring match on original or normalized text
      if (
        fullContent.includes(query) ||
        fullContentNormalized.includes(queryNormalized)
      ) {
        return true;
      }

      // Check multi-word query: all words in search query must appear in doctor content
      if (
        queryWords.length > 1 &&
        queryWords.every(
          (word) =>
            fullContent.includes(word) || fullContentNormalized.includes(word)
        )
      ) {
        return true;
      }

      return false;
    });
  }, [therapistsList, searchQuery, selectedSpecialty]);

  const handleBookSession = (therapist: UnifiedTherapist) => {
    setShowBookingModal(therapist);
    setSelectedSlot("tomorrow");
    setBookingSuccess(false);
  };

  const handleConfirmBooking = async () => {
    if (!showBookingModal) return;

    try {
      setIsSubmittingBooking(true);
      
      const aptDate = new Date();
      if (selectedSlot === "tomorrow") {
        aptDate.setDate(aptDate.getDate() + 1);
        aptDate.setHours(18, 0, 0, 0);
      } else {
        aptDate.setDate(aptDate.getDate() + 3);
        aptDate.setHours(20, 30, 0, 0);
      }

      const focusTag = typeof showBookingModal.tags[0] === "string"
        ? showBookingModal.tags[0]
        : showBookingModal.tags[0]?.text || "General Mental Health";

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: showBookingModal.id,
          therapistName: showBookingModal.name,
          therapistRole: showBookingModal.role,
          therapistImage: showBookingModal.profileImage || showBookingModal.image,
          appointmentDate: aptDate.toISOString(),
          focusArea: focusTag,
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        await fetchAppointments();
        window.dispatchEvent(new Event("appointments-updated"));
        setTimeout(() => {
          setShowBookingModal(null);
          setBookingSuccess(false);
        }, 1500);
      } else {
        alert("Failed to book session. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      alert("Error booking appointment.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled session?")) return;

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchAppointments();
        window.dispatchEvent(new Event("appointments-updated"));
      } else {
        alert("Unable to cancel appointment.");
      }
    } catch (err) {
      console.error("Cancel appointment error:", err);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
              CONFIDENTIAL SESSIONS
            </span>
            <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
              Appointments
            </h1>
            <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
              Manage your upcoming and past wellness sessions.
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-[#F4F9F6] dark:bg-[#14382F] p-1 rounded-2xl border border-[#E2ECE6] dark:border-[#23483E] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white dark:bg-[#00A982] text-[#004D3D] dark:text-[#071C17] shadow-xs"
                  : "text-[#6B857C] dark:text-[#A9C5BC] hover:text-[#19332A]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "upcoming"
                  ? "bg-white dark:bg-[#00A982] text-[#004D3D] dark:text-[#071C17] shadow-xs"
                  : "text-[#6B857C] dark:text-[#A9C5BC] hover:text-[#19332A]"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "past"
                  ? "bg-white dark:bg-[#00A982] text-[#004D3D] dark:text-[#071C17] shadow-xs"
                  : "text-[#6B857C] dark:text-[#A9C5BC] hover:text-[#19332A]"
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#F2FAF6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#006C56] text-white flex items-center justify-center font-bold text-xs">
              {upcomingList.length}
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Upcoming Sessions</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">
                {upcomingList.length > 0
                  ? new Date(upcomingList[0].appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "None Scheduled"}
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F1F7FB] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1C92D2] text-white flex items-center justify-center font-bold text-xs">
              {pastList.length || 0}
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Past Sessions</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">
                {pastList.length > 0 ? `${pastList.length} Attended` : "0 Sessions"}
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF3F8] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8430CE] text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Assigned Care</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7] truncate max-w-[120px]">
                {upcomingList[0]?.therapistName || "Verified Practitioner"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Appointment Highlight Card (Shown ONLY on Upcoming tab) */}
      {activeTab === "upcoming" && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  Upcoming Appointment
                </h2>
                <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                  Your next scheduled confidential video session
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-[#E6F4EA] dark:bg-[#14382F] text-[#137333] dark:text-[#88F7D6] text-[10px] font-extrabold tracking-wide uppercase border border-[#CEEAD6] dark:border-[#23483E]">
              {upcomingList.length > 0 ? "Confirmed" : "No Appointments"}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#789389] dark:text-[#78958C]">
              <div className="w-6 h-6 border-2 border-[#006C56] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading appointments...
            </div>
          ) : upcomingList.length > 0 ? (
            <div className="p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-[#23483E] shadow-xs shrink-0">
                  <img
                    src={upcomingList[0].therapistImage || "/images/therapist_sarah.jpg"}
                    alt={upcomingList[0].therapistName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                    {upcomingList[0].therapistName}
                  </h3>
                  <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium">
                    {upcomingList[0].therapistRole || "Clinical Psychologist"} • {upcomingList[0].durationMinutes || 45} min {upcomingList[0].sessionType || "1-on-1 Video Session"}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#19332A] dark:text-[#F4FAF7] font-bold">
                    <span className="flex items-center gap-1 text-[#006C56] dark:text-[#00A982]">
                      📅 {new Date(upcomingList[0].appointmentDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1 text-[#006C56] dark:text-[#00A982]">
                      ⏰ {new Date(upcomingList[0].appointmentDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                <a
                  href={upcomingList[0].meetingLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📹</span>
                  <span>Join Session</span>
                </a>
                <button
                  type="button"
                  onClick={() => alert("Reschedule requested. Our care coordinator will contact you.")}
                  className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#14382F] hover:bg-[#F2FAF6] dark:hover:bg-[#19463B] text-[#19332A] dark:text-[#F4FAF7] text-xs font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-all cursor-pointer"
                >
                  Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelAppointment(upcomingList[0].id)}
                  className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#14382F] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] text-center space-y-2">
              <p className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                No upcoming appointment scheduled
              </p>
              <p className="text-xs text-[#789389] dark:text-[#78958C] max-w-sm mx-auto">
                Explore our recommended therapists below and book a 1-on-1 confidential session whenever you are ready.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Book a New Session Section (Shown ONLY on All tab) */}
      {activeTab === "all" && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
                <span className="font-bold text-sm">+</span>
              </div>
              <div>
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  Book New Session
                </h2>
                <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                  Browse verified practitioners and select a convenient time slot
                </p>
              </div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B857C] dark:text-[#78958C]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practitioners by name, specialty, or focus area..."
              className="w-full pl-10 pr-10 py-2.5 bg-[#F8FCFA] dark:bg-[#14382F] hover:bg-white dark:hover:bg-[#163F35] focus:bg-white dark:focus:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-2xl text-xs text-[#19332A] dark:text-[#F4FAF7] placeholder-[#789389] dark:placeholder-[#78958C] focus:outline-none focus:ring-2 focus:ring-[#006C56]/20 focus:border-[#006C56] dark:focus:border-[#00A982] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#789389] hover:text-[#19332A] dark:text-[#78958C] dark:hover:text-[#F4FAF7] cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Privacy & Confidentiality Reassurance Banner */}
          <div className="p-3.5 sm:px-4.5 sm:py-3.5 rounded-2xl bg-[#EDF8F3] dark:bg-[#0C2B22] border border-[#BBE5D4] dark:border-[#1E5244] shadow-[0_4px_14px_rgba(0,80,65,0.06)] dark:shadow-none flex items-start sm:items-center gap-3 sm:gap-3.5 transition-all">
            {/* Prominent Lock Icon Container */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D6EFE3] dark:bg-[#16473A] border border-[#A4DEC7] dark:border-[#225F4E] flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
              <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#006C56] dark:text-[#88F7D6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-xs sm:text-sm font-heading font-black text-[#004D3D] dark:text-[#88F7D6] tracking-tight">
                  100% Confidential
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4EFE4] dark:bg-[#18483B] text-[#006C56] dark:text-[#88F7D6] border border-[#B3E2CF] dark:border-[#245C4B]">
                  ✓ Private &amp; Secure
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#265345] dark:text-[#A8C7BD] font-medium leading-snug mt-0.5">
                Your sessions, wellness information, and personal details remain private and secure.
              </p>
            </div>
          </div>

          {/* Specialty Filter Chips & Active Search Count */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {SPECIALTY_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedSpecialty(filter)}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedSpecialty === filter
                      ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                      : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#EAF6F0]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Active search count */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between text-xs text-[#6B857C] dark:text-[#A9C5BC] pt-1">
                <span>
                  <strong className="font-bold text-[#19332A] dark:text-[#F4FAF7]">
                    {filteredTherapists.length}
                  </strong>{" "}
                  {filteredTherapists.length === 1 ? "practitioner" : "practitioners"} found
                  {selectedSpecialty !== "All" && (
                    <span> in &ldquo;{selectedSpecialty}&rdquo;</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Therapists Cards Grid or Empty State */}
          {filteredTherapists.length === 0 ? (
            <div className="py-12 px-6 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-dashed border-[#CEE4DB] dark:border-[#23483E] text-center flex flex-col items-center justify-center space-y-3.5 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  No practitioners found
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium leading-relaxed">
                  {searchQuery.trim() ? (
                    <>
                      We couldn&apos;t find anyone matching &ldquo;<span className="font-semibold text-[#19332A] dark:text-[#F4FAF7]">{searchQuery.trim()}</span>&rdquo;.
                      <br />
                      Try searching by name, specialty, or focus area.
                    </>
                  ) : (
                    `No practitioners found matching the "${selectedSpecialty}" category.`
                  )}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
                {selectedSpecialty !== "All" && (
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialty("All")}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#14382F] hover:bg-[#F2FAF6] dark:hover:bg-[#19463B] text-[#19332A] dark:text-[#F4FAF7] text-xs font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-all cursor-pointer"
                  >
                    Show All Specialties
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {filteredTherapists.map((therapist) => (
                <div key={therapist.id} className="w-full flex flex-col h-full min-w-0 relative hover:z-50">
                  <TherapistCard
                    therapist={therapist}
                    onBook={handleBookSession}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Past Appointments (Shown ONLY on Past tab) */}
      {activeTab === "past" && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Past Appointments
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium leading-tight mt-0.5">
                History of completed wellness consultations
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {PAST_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">
                      {session.therapistName}
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[#14382F] text-[#137333] dark:text-[#88F7D6] font-bold">
                      {session.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4F685F] dark:text-[#A9C5BC] font-medium">
                    {session.focus}
                  </p>
                  <p className="text-[9.5px] text-[#789389] dark:text-[#78958C]">
                    📅 {session.date} • {session.time}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Rebooking request sent for ${session.therapistName}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] hover:bg-[#EAF6F0] dark:hover:bg-[#19463B] text-xs font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-all cursor-pointer self-start sm:self-auto"
                >
                  Book Again
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 max-w-md w-full border border-[#E2ECE6] dark:border-[#23483E] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE6] dark:border-[#23483E]">
              <h3 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Confirm Session Booking
              </h3>
              <button
                onClick={() => setShowBookingModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-6 text-center space-y-2">
                <span className="text-4xl">🎉</span>
                <h4 className="text-base font-black text-[#006C56] dark:text-[#00A982]">
                  Session Successfully Booked!
                </h4>
                <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC]">
                  Confirmation details sent to your registered email.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E]">
                  <img
                    src={showBookingModal.profileImage || showBookingModal.image}
                    alt={showBookingModal.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">
                      {showBookingModal.name}
                    </h4>
                    <p className="text-[10px] text-[#6B857C] dark:text-[#A9C5BC]">
                      {showBookingModal.role}
                    </p>
                    <p className="text-[10px] font-bold text-[#006C56] dark:text-[#00A982] mt-0.5">
                      {showBookingModal.hourlyRate || "₹1,800 / session"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-[#19332A] dark:text-[#F4FAF7]">Select Date &amp; Time:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSlot("tomorrow")}
                      className={`p-2 rounded-xl text-center cursor-pointer transition-all ${
                        selectedSlot === "tomorrow"
                          ? "bg-[#EAF6F0] dark:bg-[#00A982] text-[#006C56] dark:text-[#071C17] font-bold border border-[#006C56]/20"
                          : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] font-medium border border-[#E2ECE6] dark:border-[#23483E]"
                      }`}
                    >
                      Tomorrow, 06:00 PM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSlot("friday")}
                      className={`p-2 rounded-xl text-center cursor-pointer transition-all ${
                        selectedSlot === "friday"
                          ? "bg-[#EAF6F0] dark:bg-[#00A982] text-[#006C56] dark:text-[#071C17] font-bold border border-[#006C56]/20"
                          : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] font-medium border border-[#E2ECE6] dark:border-[#23483E]"
                      }`}
                    >
                      Friday, 08:30 PM
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(null)}
                    disabled={isSubmittingBooking}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14382F] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={isSubmittingBooking}
                    className="px-5 py-2.5 rounded-xl bg-[#004D3D] dark:bg-[#00A982] text-white dark:text-[#071C17] text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingBooking ? "Scheduling..." : "Confirm & Schedule"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
