"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import TherapistCard from "@/frontend/components/dashboard/therapists/TherapistCard";
import DoctorProfileModal from "@/frontend/components/dashboard/therapists/DoctorProfileModal";
import { UnifiedTherapist, FALLBACK_THERAPISTS, normalizeTherapist } from "@/frontend/components/dashboard/therapists/types";
import { useAuth } from "@/frontend/lib/context/AuthContext";

const SPECIALTY_FILTERS = [
  "All",
  "Anxiety & Stress",
  "Work-Life Balance",
  "Relationships",
  "Career Growth",
  "Mindfulness",
];

function formatAppointmentDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatAppointmentTime(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export default function AppointmentsView() {
  const { user, isAuthenticated } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [therapistsList, setTherapistsList] = useState<UnifiedTherapist[]>(FALLBACK_THERAPISTS);

  // Doctor Detail Profile & Booking Modal
  const [selectedDoctorForProfile, setSelectedDoctorForProfile] = useState<UnifiedTherapist | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<"profile" | "book" | "reviews">("profile");

  // Tab state: "upcoming" | "past" | null
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | null>("upcoming");

  const bookingSectionRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [upcomingList, setUpcomingList] = useState<any[]>([]);
  const [pastList, setPastList] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const hasLoadedOnceRef = useRef(false);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataHashRef = useRef<{ upcoming: string; past: string }>({ upcoming: "", past: "" });

  const handleScrollToBooking = () => {
    if (bookingSectionRef.current) {
      bookingSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 350);
    }
  };

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

  // Handle direct navigation to a specific doctor via query param
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const doctorParam = params.get("doctor") || params.get("practitioner") || params.get("id");
      if (doctorParam && therapistsList.length > 0) {
        const found = therapistsList.find(
          (t) =>
            t.id.toLowerCase() === doctorParam.toLowerCase() ||
            t.name.toLowerCase().includes(doctorParam.toLowerCase().replace(/[-_]/g, " "))
        );
        if (found) {
          setSelectedDoctorForProfile(found);
          setModalInitialTab("profile");
          setIsProfileModalOpen(true);
          handleScrollToBooking();
        }
      }
    } catch {
      // ignore
    }
  }, [therapistsList]);

  const fetchAppointments = useCallback(async (isInitial = false) => {
    if (isFetchingRef.current) return;
    try {
      isFetchingRef.current = true;
      // Only show full loading indicator if we haven't loaded any data yet
      if (isInitial && !hasLoadedOnceRef.current) {
        setIsInitialLoading(true);
      }
      const res = await fetch("/api/appointments", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current) {
          const newUpcoming = Array.isArray(data.upcoming) ? data.upcoming : [];
          const newPast = Array.isArray(data.past) ? data.past : [];
          const upcomingHash = JSON.stringify(newUpcoming);
          const pastHash = JSON.stringify(newPast);

          if (upcomingHash !== lastDataHashRef.current.upcoming) {
            setUpcomingList(newUpcoming);
            lastDataHashRef.current.upcoming = upcomingHash;
          }
          if (pastHash !== lastDataHashRef.current.past) {
            setPastList(newPast);
            lastDataHashRef.current.past = pastHash;
          }
          hasLoadedOnceRef.current = true;
        }
      } else if (res.status === 401) {
        if (isMountedRef.current) {
          setUpcomingList([]);
          setPastList([]);
          hasLoadedOnceRef.current = true;
        }
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      isFetchingRef.current = false;
      if (isMountedRef.current) {
        setIsInitialLoading(false);
      }
    }
  }, []);

  const debouncedFetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchAppointments(false);
      }
    }, 250);
  }, [fetchAppointments]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchAppointments(true);

    const handleAuthChange = () => {
      debouncedFetch();
    };

    const handleAppointmentsUpdated = () => {
      debouncedFetch();
    };

    window.addEventListener("manraah_auth_changed", handleAuthChange);
    window.addEventListener("appointments-updated", handleAppointmentsUpdated);
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      window.removeEventListener("manraah_auth_changed", handleAuthChange);
      window.removeEventListener("appointments-updated", handleAppointmentsUpdated);
    };
  }, [fetchAppointments, debouncedFetch]);

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

      // Direct substring match
      if (
        fullContent.includes(query) ||
        fullContentNormalized.includes(queryNormalized)
      ) {
        return true;
      }

      // Check multi-word query
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

  const handleBookSession = (therapist: UnifiedTherapist, tab: "profile" | "book" | "reviews" = "profile") => {
    setSelectedDoctorForProfile(therapist);
    setModalInitialTab(tab);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedDoctorForProfile(null);
  };

  const handleBookAgain = (session: any) => {
    const found = therapistsList.find(
      (t) =>
        t.id === session.therapistId ||
        t.name.toLowerCase() === (session.therapistName || "").toLowerCase()
    );
    if (found) {
      handleBookSession(found, "book");
    } else {
      handleBookSession(
        normalizeTherapist({
          id: session.therapistId || "doc-rebook",
          name: session.therapistName || "Mental Health Specialist",
          role: session.therapistRole || "Clinical Psychologist",
          profileImage: session.therapistImage || "/images/therapist_sarah.jpg",
          image: session.therapistImage || "/images/therapist_sarah.jpg",
          specialties: session.focusArea ? [session.focusArea] : ["Therapy"],
          rating: "4.9",
          reviewCount: "48+",
          experience: "8+ yrs exp",
          availability: "Available tomorrow",
          hourlyRate: "₹1,800 / session",
        }),
        "book"
      );
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled session?")) return;

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "POST",
      });

      if (res.ok) {
        await fetchAppointments(false);
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
      {/* 1. Header Banner & Filter Tabs */}
      <div className="bg-white dark:bg-[#0B3029] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#006C56] dark:text-[#00A889]">
              Confidential sessions
            </span>
            <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
              Appointments
            </h1>
            <p className="text-xs text-[#6B857C] dark:text-[#9DB9B0] font-medium mt-1">
              Manage your upcoming and past wellness sessions.
            </p>
          </div>

          {/* Quick Action Button & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Primary Action Button: Book New Session */}
            <button
              type="button"
              onClick={handleScrollToBooking}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white text-xs font-heading font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Book New Session</span>
            </button>

            {/* Appointment Filter Controls: Upcoming | Past */}
            <div className="flex items-center gap-1 bg-[#F4F9F6] dark:bg-[#082821] p-1 rounded-2xl border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab((prev) => (prev === "upcoming" ? null : "upcoming"))}
                aria-pressed={activeTab === "upcoming"}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upcoming"
                    ? "bg-white dark:bg-[#008F78] text-[#004D3D] dark:text-white shadow-xs"
                    : "text-[#6B857C] dark:text-[#9DB9B0] hover:text-[#19332A] dark:hover:text-[#F4FAF7]"
                }`}
              >
                Upcoming{upcomingList.length > 0 ? ` (${upcomingList.length})` : ""}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab((prev) => (prev === "past" ? null : "past"))}
                aria-pressed={activeTab === "past"}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "past"
                    ? "bg-white dark:bg-[#008F78] text-[#004D3D] dark:text-white shadow-xs"
                    : "text-[#6B857C] dark:text-[#9DB9B0] hover:text-[#19332A] dark:hover:text-[#F4FAF7]"
                }`}
              >
                Past{pastList.length > 0 ? ` (${pastList.length})` : ""}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Upcoming Sessions Summary Card */}
          <button
            type="button"
            onClick={() => setActiveTab((prev) => (prev === "upcoming" ? null : "upcoming"))}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === "upcoming"
                ? "bg-[#E6F4ED] dark:bg-[#0F4239] border-[#006C56] dark:border-[#00A889] ring-2 ring-[#006C56]/20 dark:ring-[#00A889]/30"
                : "bg-[#F2FAF6] dark:bg-[#0E3931] border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] hover:border-[#006C56]/40 dark:hover:border-[#00A889]/40 hover:shadow-xs"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#006C56] dark:bg-[#008F78] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {upcomingList.length}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-semibold">Upcoming Sessions</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7] truncate">
                {upcomingList.length > 0
                  ? `${upcomingList.length} ${upcomingList.length === 1 ? "Session" : "Sessions"}`
                  : "None Scheduled"}
              </p>
            </div>
          </button>

          {/* Past Sessions Summary Card */}
          <button
            type="button"
            onClick={() => setActiveTab((prev) => (prev === "past" ? null : "past"))}
            className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-3 ${
              activeTab === "past"
                ? "bg-[#E7F3FA] dark:bg-[#0F4239] border-[#1C92D2] ring-2 ring-[#1C92D2]/20"
                : "bg-[#F1F7FB] dark:bg-[#0E3931] border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] hover:border-[#1C92D2]/40 hover:shadow-xs"
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-[#1C92D2] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {pastList.length}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-semibold">Past Sessions</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7] truncate">
                {pastList.length > 0
                  ? `${pastList.length} ${pastList.length === 1 ? "Session" : "Sessions"}`
                  : "0 Sessions"}
              </p>
            </div>
          </button>

          {/* Practitioner Summary Card */}
          <div className="p-3.5 rounded-2xl bg-[#FAF3F8] dark:bg-[#0E3931] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8430CE] text-white flex items-center justify-center font-bold text-xs shrink-0">
              ✦
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-semibold">Your Practitioner</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7] truncate max-w-[140px]">
                {upcomingList[0]?.therapistName || pastList[0]?.therapistName || "Verified Practitioner"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Appointment Highlight Card (Shown ONLY on Upcoming tab) */}
      {activeTab === "upcoming" && (
        <div className="bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  Upcoming {upcomingList.length === 1 ? "Appointment" : "Appointments"}
                </h2>
                <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-medium leading-tight mt-0.5">
                  Your scheduled confidential video sessions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E6F4EA] dark:bg-[rgba(0,168,137,0.15)] text-[#137333] dark:text-[#73D8C4] text-[10px] font-extrabold tracking-wide border border-[#CEEAD6] dark:border-[rgba(0,168,137,0.30)]">
                {upcomingList.length > 0 ? `${upcomingList.length} Scheduled` : "No Appointments"}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                aria-label="Close upcoming view"
                className="w-7 h-7 rounded-xl bg-[#F4FAF7] dark:bg-[#082821] text-[#789389] hover:text-[#19332A] dark:hover:text-[#F4FAF7] flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          {isInitialLoading && !hasLoadedOnceRef.current ? (
            <div className="p-8 text-center text-xs text-[#789389] dark:text-[#76968D]">
              <div className="w-6 h-6 border-2 border-[#006C56] dark:border-[#00A889] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading upcoming appointments...
            </div>
          ) : upcomingList.length > 0 ? (
            <div className="space-y-3">
              {upcomingList.map((apt, index) => {
                const stableKey = apt.id || `upcoming-apt-${apt.therapistId || "doc"}-${apt.appointmentDate || index}`;
                return (
                  <div
                    key={stableKey}
                    id={`upcoming-appointment-card-${apt.id || index}`}
                    className="p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E3931] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white dark:border-[rgba(150,210,195,0.20)] shadow-xs shrink-0 bg-slate-100 dark:bg-[#082821]">
                        <img
                          src={apt.therapistImage || "/images/therapist_sarah.jpg"}
                          alt={apt.therapistName || "Therapist"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("therapist_sarah.jpg")) {
                              target.src = "/images/therapist_sarah.jpg";
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                            {apt.therapistName}
                          </h3>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#E6F4EA] dark:bg-[rgba(0,168,137,0.15)] text-[#137333] dark:text-[#73D8C4] font-bold capitalize">
                            {apt.status || "Confirmed"}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B857C] dark:text-[#9DB9B0] font-medium mt-0.5">
                          {apt.therapistRole || "Clinical Psychologist"} • {apt.durationMinutes || 45} min {apt.sessionType || "1-on-1 Video Session"}
                        </p>
                        {apt.focusArea && (
                          <p className="text-[11px] text-[#4F685F] dark:text-[#76968D] font-medium mt-0.5">
                            Focus: {apt.focusArea}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#19332A] dark:text-[#F4FAF7] font-bold">
                          <span className="flex items-center gap-1 text-[#006C56] dark:text-[#00A889]">
                            📅 {formatAppointmentDate(apt.appointmentDate)}
                          </span>
                          <span className="flex items-center gap-1 text-[#006C56] dark:text-[#00A889]">
                            ⏰ {formatAppointmentTime(apt.appointmentDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 shrink-0">
                      <a
                        href={apt.meetingLink || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📹</span>
                        <span>Join Session</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => alert("Reschedule requested. Our care coordinator will contact you shortly.")}
                        className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#082821] hover:bg-[#F2FAF6] dark:hover:bg-[#12463C] text-[#19332A] dark:text-[#F4FAF7] text-xs font-bold border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] transition-all cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#082821] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E3931] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] text-center space-y-2">
              <p className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                No upcoming appointments
              </p>
              <p className="text-xs text-[#789389] dark:text-[#9DB9B0] max-w-sm mx-auto">
                Explore our recommended therapists below and book a 1-on-1 confidential session whenever you are ready.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Past Appointments (Shown ONLY on Past tab) */}
      {activeTab === "past" && (
        <div className="bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                  Past Appointments
                </h2>
                <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-medium leading-tight mt-0.5">
                  History of completed and previous wellness consultations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#EAF2F8] dark:bg-[rgba(28,146,210,0.15)] text-[#1C92D2] text-[10px] font-extrabold tracking-wide border border-[#D0E4F3] dark:border-[rgba(28,146,210,0.30)]">
                {pastList.length > 0 ? `${pastList.length} Sessions` : "0 Sessions"}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                aria-label="Close past view"
                className="w-7 h-7 rounded-xl bg-[#F4FAF7] dark:bg-[#082821] text-[#789389] hover:text-[#19332A] dark:hover:text-[#F4FAF7] flex items-center justify-center transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          {isInitialLoading && !hasLoadedOnceRef.current ? (
            <div className="p-8 text-center text-xs text-[#789389] dark:text-[#76968D]">
              <div className="w-6 h-6 border-2 border-[#006C56] dark:border-[#00A889] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading past appointments...
            </div>
          ) : pastList.length > 0 ? (
            <div className="space-y-3">
              {pastList.map((session, index) => {
                const stableKey = session.id || `past-apt-${session.therapistId || "doc"}-${session.appointmentDate || index}`;
                return (
                  <div
                    key={stableKey}
                    id={`past-appointment-card-${session.id || index}`}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E3931] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.20)] shrink-0 bg-slate-100 dark:bg-[#082821]">
                        <img
                          src={session.therapistImage || "/images/therapist_sarah.jpg"}
                          alt={session.therapistName || "Therapist"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("therapist_sarah.jpg")) {
                              target.src = "/images/therapist_sarah.jpg";
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-[#19332A] dark:text-[#F4FAF7]">
                            {session.therapistName}
                          </h3>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${
                              session.status === "cancelled"
                                ? "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400"
                                : "bg-[#E6F4EA] dark:bg-[rgba(0,168,137,0.15)] text-[#137333] dark:text-[#73D8C4]"
                            }`}
                          >
                            {session.status || "Completed"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#4F685F] dark:text-[#9DB9B0] font-medium">
                          {session.therapistRole || "Clinical Psychologist"} {session.focusArea ? `• ${session.focusArea}` : ""}
                        </p>
                        <p className="text-[9.5px] text-[#789389] dark:text-[#76968D]">
                          📅 {formatAppointmentDate(session.appointmentDate)} • ⏰ {formatAppointmentTime(session.appointmentDate)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookAgain(session)}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-[#082821] text-[#006C56] dark:text-[#00A889] hover:bg-[#EAF6F0] dark:hover:bg-[#12463C] text-xs font-bold border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] transition-all cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs hover:shadow-xs"
                    >
                      Book Again
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E3931] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] text-center space-y-2">
              <p className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                No past appointments
              </p>
              <p className="text-xs text-[#789389] dark:text-[#9DB9B0] max-w-sm mx-auto">
                You haven&apos;t completed any sessions yet. Once you complete a consultation, it will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. Book a New Session Section */}
      <div
        ref={bookingSectionRef}
        id="book-new-session"
        className="bg-white dark:bg-[#0B3029] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] shadow-2xs space-y-4 transition-colors scroll-mt-6"
      >
        {/* Header & Inline Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-2xl bg-[#EAF6F0] dark:bg-[#0E3931] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shrink-0">
              <span className="font-bold text-sm">+</span>
            </div>
            <div>
              <h2 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                Book New Session
              </h2>
              <p className="text-[10px] text-[#789389] dark:text-[#76968D] font-medium leading-tight mt-0.5">
                Browse verified practitioners and select a convenient time slot
              </p>
            </div>
          </div>

          {/* Search Input Bar (Inline on the Right) */}
          <div className="relative w-full sm:w-[380px] md:w-[420px] shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B857C] dark:text-[#789990]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search practitioners..."
              className="w-full h-10 sm:h-11 pl-10 pr-10 bg-[#F8FCFA] dark:bg-[#082821] hover:bg-white dark:hover:bg-[#0E3931] focus:bg-white dark:focus:bg-[#082821] border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.16)] rounded-2xl text-xs text-[#19332A] dark:text-[#F4FAF7] placeholder-[#789389] dark:placeholder-[#789990] focus:outline-none focus:ring-2 focus:ring-[#006C56]/20 dark:focus:ring-[#00A889]/30 focus:border-[#006C56] dark:focus:border-[#00A889] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#789389] hover:text-[#19332A] dark:text-[#789990] dark:hover:text-[#F4FAF7] cursor-pointer transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Privacy & Confidentiality Reassurance Banner */}
        <div className="p-3.5 sm:px-4.5 sm:py-3.5 rounded-2xl bg-[#EDF8F3] dark:bg-[#0E3931] border border-[#BBE5D4] dark:border-[rgba(150,210,195,0.15)] shadow-[0_4px_14px_rgba(0,80,65,0.06)] dark:shadow-none flex items-start sm:items-center gap-3 sm:gap-3.5 transition-all">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D6EFE3] dark:bg-[#12463C] border border-[#A4DEC7] dark:border-[rgba(150,210,195,0.20)] flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
            <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#006C56] dark:text-[#00A889]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-xs sm:text-sm font-heading font-black text-[#004D3D] dark:text-[#F4FAF7] tracking-tight">
                100% Confidential
              </span>
              <span className="inline-flex items-center gap-0.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#D4EFE4] dark:bg-[rgba(0,168,137,0.15)] text-[#006C56] dark:text-[#73D8C4] border border-[#B3E2CF] dark:border-[rgba(0,168,137,0.30)]">
                ✓ Private &amp; Secure
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#265345] dark:text-[#9DB9B0] font-medium leading-snug mt-0.5">
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
                    ? "bg-[#006C56] dark:bg-[#008F78] text-white shadow-xs"
                    : "bg-[#F4F9F6] dark:bg-[#082821] text-[#4F685F] dark:text-[#9DB9B0] hover:bg-[#EAF6F0] dark:hover:bg-[#0E3931]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Active search count */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-xs text-[#6B857C] dark:text-[#9DB9B0] pt-1">
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
          <div className="py-12 px-6 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E3931] border border-dashed border-[#CEE4DB] dark:border-[rgba(150,210,195,0.15)] text-center flex flex-col items-center justify-center space-y-3.5 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF6F0] dark:bg-[#12463C] text-[#006C56] dark:text-[#00A889] flex items-center justify-center shadow-xs">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                No practitioners found
              </h3>
              <p className="text-xs text-[#6B857C] dark:text-[#9DB9B0] font-medium leading-relaxed">
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
                  className="px-4 py-2 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#008F78] dark:hover:bg-[#00A889] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              {selectedSpecialty !== "All" && (
                <button
                  type="button"
                  onClick={() => setSelectedSpecialty("All")}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#082821] hover:bg-[#F2FAF6] dark:hover:bg-[#12463C] text-[#19332A] dark:text-[#F4FAF7] text-xs font-bold border border-[#E2ECE6] dark:border-[rgba(150,210,195,0.12)] transition-all cursor-pointer"
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

      {/* Comprehensive Doctor Profile, Reviews & Real-Time Booking Modal */}
      <DoctorProfileModal
        therapist={selectedDoctorForProfile}
        isOpen={isProfileModalOpen}
        initialTab={modalInitialTab}
        onClose={handleCloseProfileModal}
        onBookingSuccess={() => {
          fetchAppointments(false);
          setActiveTab("upcoming");
        }}
        onRatingSubmitted={() => {
          fetchAppointments(false);
        }}
      />
    </div>
  );
}
