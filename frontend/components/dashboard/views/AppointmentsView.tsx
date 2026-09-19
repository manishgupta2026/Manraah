"use client";

import React, { useState, useEffect } from "react";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

interface Therapist {
  id: string;
  name: string;
  role: string;
  rating: string;
  reviewCount: string;
  image: string;
  price: string;
  experience: string;
  tags: string[];
}

const ALL_THERAPISTS: Therapist[] = [
  {
    id: "dr-sarah-jenkins",
    name: "Dr. Sarah Jenkins",
    role: "Clinical Psychologist (Ph.D.)",
    rating: "4.9",
    reviewCount: "120+",
    image: "/images/therapist_sarah.jpg",
    price: "₹1,500 / session",
    experience: "12+ yrs experience",
    tags: ["Anxiety & Stress", "Self-Esteem", "Emotional Well-being", "CBT"],
  },
  {
    id: "dr-arjun-mehta",
    name: "Dr. Arjun Mehta",
    role: "Career & Executive Counselor",
    rating: "4.8",
    reviewCount: "98+",
    image: "/images/therapist_arjun.jpg",
    price: "₹1,400 / session",
    experience: "9+ yrs experience",
    tags: ["Work-Life Balance", "Career Growth", "Burnout Prevention", "Goal Setting"],
  },
  {
    id: "dr-neha-kapoor",
    name: "Dr. Neha Kapoor",
    role: "Relationship & Family Therapist",
    rating: "4.9",
    reviewCount: "140+",
    image: "/images/user_avatar.jpg",
    price: "₹1,600 / session",
    experience: "14+ yrs experience",
    tags: ["Relationships", "Communication", "Family Well-being", "Couples Therapy"],
  },
  {
    id: "dr-ananya-sen",
    name: "Dr. Ananya Sen",
    role: "Mindfulness & Youth Specialist",
    rating: "4.9",
    reviewCount: "85+",
    image: "/images/therapist_sarah.jpg",
    price: "₹1,350 / session",
    experience: "8+ yrs experience",
    tags: ["Student Wellness", "Exam Anxiety", "Mindfulness", "Sleep Health"],
  },
];

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
  const [showBookingModal, setShowBookingModal] = useState<Therapist | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentStatus, setAppointmentStatus] = useState("Confirmed");
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");

  const filteredTherapists = selectedSpecialty === "All"
    ? ALL_THERAPISTS
    : ALL_THERAPISTS.filter((t) => t.tags.some((tag) => tag.toLowerCase().includes(selectedSpecialty.toLowerCase())));

  const handleBookSession = (therapist: Therapist) => {
    setShowBookingModal(therapist);
    setBookingSuccess(false);
  };

  const handleConfirmBooking = () => {
    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(null);
      setBookingSuccess(false);
    }, 1800);
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
              1
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Upcoming Session</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">Oct 6, 09:00 PM</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#F1F7FB] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1C92D2] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Completed Sessions</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">100% Attended</p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FAF3F8] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8430CE] text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <div>
              <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">Assigned Care</p>
              <p className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">Dr. Sarah Jenkins</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Upcoming Appointment Highlight Card */}
      {(activeTab === "all" || activeTab === "upcoming") && (
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
              {appointmentStatus}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-[#23483E] shadow-xs shrink-0">
                <img
                  src="/images/therapist_sarah.jpg"
                  alt="Dr. Sarah Jenkins"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Dr. Sarah Jenkins
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium">
                  Clinical Psychologist • 45 min 1-on-1 Video Session
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#19332A] dark:text-[#F4FAF7] font-bold">
                  <span className="flex items-center gap-1 text-[#006C56] dark:text-[#00A982]">
                    📅 Tuesday, 6 Oct 2026
                  </span>
                  <span className="flex items-center gap-1 text-[#006C56] dark:text-[#00A982]">
                    ⏰ 09:00 PM IST
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
              <button
                type="button"
                className="py-2.5 px-4 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📹</span>
                <span>Join Session</span>
              </button>
              <button
                type="button"
                onClick={() => alert("Reschedule requested. Our care coordinator will contact you.")}
                className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#14382F] hover:bg-[#F2FAF6] dark:hover:bg-[#19463B] text-[#19332A] dark:text-[#F4FAF7] text-xs font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-all cursor-pointer"
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this session?")) {
                    setAppointmentStatus("Cancelled");
                  }
                }}
                className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-[#14382F] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-[#E2ECE6] dark:border-[#23483E] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Book a New Session Section */}
      {(activeTab === "all" || activeTab === "upcoming") && (
        <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

            {/* Specialty Filter Chips */}
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
          </div>

          {/* Therapists Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {filteredTherapists.map((therapist) => (
              <div
                key={therapist.id}
                className="p-4.5 rounded-2xl bg-[#FAFDFB] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-[#23483E] shadow-xs">
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] truncate">
                        {therapist.name}
                      </h3>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full shrink-0">
                        ⭐ {therapist.rating}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B857C] dark:text-[#A9C5BC] font-medium leading-tight mt-0.5">
                      {therapist.role}
                    </p>
                    <p className="text-[10px] text-[#006C56] dark:text-[#00A982] font-bold mt-1">
                      {therapist.experience} • {therapist.price}
                    </p>
                  </div>
                </div>

                {/* Tags & Action */}
                <div className="space-y-3 pt-1 border-t border-[#E2ECE6] dark:border-[#23483E]/50">
                  <div className="flex flex-wrap gap-1">
                    {therapist.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#88F7D6]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookSession(therapist)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Session</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Past Appointments */}
      {(activeTab === "all" || activeTab === "past") && (
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
                    src={showBookingModal.image}
                    alt={showBookingModal.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-black text-[#19332A] dark:text-[#F4FAF7]">
                      {showBookingModal.name}
                    </h4>
                    <p className="text-[10px] text-[#6B857C] dark:text-[#A9C5BC]">
                      {showBookingModal.role}
                    </p>
                    <p className="text-[10px] font-bold text-[#006C56] dark:text-[#00A982] mt-0.5">
                      {showBookingModal.price}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold text-[#19332A] dark:text-[#F4FAF7]">Select Date &amp; Time:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 rounded-xl bg-[#EAF6F0] dark:bg-[#00A982] text-[#006C56] dark:text-[#071C17] font-bold text-center border border-[#006C56]/20">
                      Tomorrow, 06:00 PM
                    </button>
                    <button className="p-2 rounded-xl bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] font-medium text-center border border-[#E2ECE6] dark:border-[#23483E]">
                      Friday, 08:30 PM
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowBookingModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14382F]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    className="px-5 py-2.5 rounded-xl bg-[#004D3D] dark:bg-[#00A982] text-white dark:text-[#071C17] text-xs font-bold shadow-sm"
                  >
                    Confirm &amp; Schedule
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
