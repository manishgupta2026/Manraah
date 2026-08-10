"use client";

import React, { useState } from "react";
import { MOCK_THERAPISTS } from "@/frontend/lib/mock-data";

interface TherapistRecord {
  id: string;
  name: string;
  title: string;
  licenseNumber: string;
  specialties: string[];
  status: "Verified" | "Pending" | "Rejected";
  rating: number;
}

export default function TherapistVerificationTab() {
  const [therapists, setTherapists] = useState<TherapistRecord[]>([
    ...MOCK_THERAPISTS.map((t, idx) => ({
      id: t.id,
      name: t.name,
      title: t.title,
      licenseNumber: `RCI-CL-2024-${100 + idx * 45}`,
      specialties: t.specialties,
      status: "Verified" as const,
      rating: t.rating,
    })),
  ]);

  const verifiedList = therapists.filter((t) => t.status === "Verified");
  const pendingList = therapists.filter((t) => t.status === "Pending");

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-variant/30 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Clinical Care Provider Verification
          </h2>
          <p className="text-xs text-on-surface-variant">
            Audit clinical credentials, inspect RCI license numbers, and approve therapy providers for 1-on-1 bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
            {verifiedList.length} Verified Clinical Providers
          </span>
        </div>
      </div>

      {/* Verified Providers List */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-variant/30 shadow-soft space-y-4">
        <h3 className="font-heading font-bold text-base text-on-surface">
          Active Clinical Therapists & Specialists
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-variant/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="pb-3 px-3">Therapist Name</th>
                <th className="pb-3 px-3">RCI License Identifier</th>
                <th className="pb-3 px-3">Specialty Areas</th>
                <th className="pb-3 px-3">Rating</th>
                <th className="pb-3 px-3">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/10">
              {verifiedList.map((tp) => (
                <tr key={tp.id} className="hover:bg-surface-container-low/50 transition-all">
                  <td className="py-3.5 px-3 font-bold text-on-surface">
                    {tp.name}
                    <span className="block text-[10px] text-on-surface-variant font-normal">{tp.title}</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-primary">
                    {tp.licenseNumber}
                  </td>
                  <td className="py-3.5 px-3 text-on-surface-variant font-medium">
                    <div className="flex flex-wrap gap-1">
                      {tp.specialties.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-bold text-on-surface">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-amber-500">
                    ⭐ {tp.rating}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold">
                      ✓ VERIFIED & APPROVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
