"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_THERAPISTS } from "@/frontend/lib/mock-data";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function TherapistProfileScreen({ therapistId }: { therapistId: string }) {
  const router = useRouter();
  const therapist = MOCK_THERAPISTS.find((t) => t.id === therapistId) || MOCK_THERAPISTS[0];

  const [selectedDate, setSelectedDate] = useState<string>("Today, Aug 2");
  const [selectedSlot, setSelectedSlot] = useState<string>(therapist.availableTimes[0] || "10:00 AM");
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const handleBookSession = () => {
    setIsBooked(true);
    setTimeout(() => {
      router.push("/call");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <ScreenHeader
        title={`🩺 ${therapist.name}`}
        showBackButton={true}
        fallbackRoute="/professional-care"
      />

      {/* Therapist Profile Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col md:flex-row gap-6 items-start">
        <div className="w-24 h-24 rounded-full bg-primary-container/20 border-4 border-primary/20 flex items-center justify-center font-bold text-primary text-3xl">
          {therapist.name.charAt(0)}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-on-surface">{therapist.name}</h1>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              ★ {therapist.rating} ({therapist.reviewCount} reviews)
            </span>
          </div>
          <p className="text-sm text-primary font-medium">{therapist.title}</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{therapist.bio}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {therapist.specialties.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Calendar Widget */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-6">
        <h3 className="font-heading font-bold text-xl text-on-surface">Select Appointment Slot</h3>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {["Today, Aug 2", "Tomorrow, Aug 3", "Monday, Aug 4", "Tuesday, Aug 5"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-5 py-3 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDate === d
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Time Slot Grid */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-on-surface-variant">Available Times:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {therapist.availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedSlot(time)}
                className={`py-3 rounded-xl text-xs font-bold transition-all ${
                  selectedSlot === time
                    ? "bg-secondary text-white shadow-md scale-105"
                    : "bg-surface-container-low border border-surface-variant/30 text-on-surface hover:bg-surface-container"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant">Session Fee</p>
            <p className="text-lg font-bold text-primary">{therapist.hourlyRate}</p>
          </div>
          <button
            onClick={handleBookSession}
            disabled={isBooked}
            className="px-8 py-3.5 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all"
          >
            {isBooked ? "Redirecting to Session..." : `Confirm Booking (${selectedSlot}) →`}
          </button>
        </div>
      </div>
    </div>
  );
}
