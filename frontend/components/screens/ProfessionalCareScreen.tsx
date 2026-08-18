"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_THERAPISTS, getCategoryPersonalization } from "@/frontend/lib/mock-data";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

export default function ProfessionalCareScreen() {
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    p.pinnedSpecialty
  );

  const specialties = p.specialtyList;

  const [therapistsList, setTherapistsList] = useState<any[]>(MOCK_THERAPISTS);

  React.useEffect(() => {
    async function loadTherapists() {
      try {
        const res = await fetch("/api/therapists");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTherapistsList(data);
          }
        }
      } catch (e) {
        console.error("Failed to load therapists:", e);
      }
    }
    loadTherapists();
  }, []);

  const filteredTherapists = selectedSpecialty === "All"
    ? therapistsList
    : therapistsList.filter((t) => t.specialties && t.specialties.includes(selectedSpecialty));

  return (
    <div className="space-y-8">
      <ScreenHeader title="🩺 Professional Care" showBackButton={true} fallbackRoute="/dashboard" />
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <span className="px-4 py-1.5 rounded-full bg-peach/30 text-tertiary text-xs font-semibold uppercase tracking-wider">
          Verified Professional Care
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Book Confidential Therapy Sessions</h1>
        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Connect with licensed clinical psychologists, counselors, and mindfulness specialists trained to provide compassionate support.
        </p>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedSpecialty === spec
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Therapist List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTherapists.map((therapist) => (
          <div
            key={therapist.id}
            className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col justify-between space-y-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-xl">
                {therapist.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-on-surface truncate">{therapist.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                    <span>★</span>
                    <span>{therapist.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant mb-2">{therapist.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  {therapist.specialties && therapist.specialties.map((s: string) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] font-medium text-on-surface-variant">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{therapist.bio}</p>

            <div className="flex items-center justify-between pt-4 border-t border-surface-variant/30">
              <div>
                <p className="text-[11px] text-on-surface-variant/70">Fee per session</p>
                <p className="text-sm font-bold text-primary">{therapist.hourlyRate}</p>
              </div>
              <Link
                href={`/professional-care/${therapist.id}`}
                className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-semibold shadow-md hover:bg-primary-purple transition-all"
              >
                View Profile & Book →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
