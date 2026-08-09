"use client";

import React, { useState } from "react";

interface TherapistRecord {
  id: string;
  name: string;
  title: string;
  licenseNumber: string;
  specialty: string;
  status: "Pending" | "Verified" | "Rejected";
  appliedDate: string;
  rating: number;
}

export default function TherapistVerificationTab() {
  const [therapists, setTherapists] = useState<TherapistRecord[]>([
    {
      id: "tp_1",
      name: "Dr. Ananya Sharma",
      title: "Clinical Psychologist (Ph.D.)",
      licenseNumber: "RCI-CL-2024-884",
      specialty: "Anxiety & Academic Stress",
      status: "Pending",
      appliedDate: "Aug 6, 2026",
      rating: 4.9,
    },
    {
      id: "tp_2",
      name: "Dr. Rajesh Verma",
      title: "Licensed Family Therapist",
      licenseNumber: "RCI-FT-2023-112",
      specialty: "Parenting & Relationship Counseling",
      status: "Pending",
      appliedDate: "Aug 7, 2026",
      rating: 4.8,
    },
    {
      id: "tp_3",
      name: "Dr. Meera Iyer",
      title: "Cognitive Behavioral Therapist",
      licenseNumber: "RCI-CBT-2022-409",
      specialty: "Workplace Burnout & Mindfulness",
      status: "Verified",
      appliedDate: "Jul 10, 2026",
      rating: 4.9,
    },
  ]);

  const handleApprove = (id: string) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Verified" } : t))
    );
  };

  const handleReject = (id: string) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Rejected" } : t))
    );
  };

  const pendingList = therapists.filter((t) => t.status === "Pending");
  const verifiedList = therapists.filter((t) => t.status === "Verified");

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Professional Care Provider Verification
          </h2>
          <p className="text-xs text-on-surface-variant">
            Audit clinical credentials, check RCI licenses, and approve therapy providers for clinical 1-on-1 bookings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
            {pendingList.length} Pending Approvals
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
            {verifiedList.length} Verified Providers
          </span>
        </div>
      </div>

      {/* Pending Applications Section */}
      {pendingList.length > 0 && (
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-amber-500/30 shadow-soft space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-xl">
              pending_actions
            </span>
            <h3 className="font-heading font-bold text-base text-on-surface">
              Pending Provider Applications
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((tp) => (
              <div
                key={tp.id}
                className="p-5 rounded-2xl bg-surface-container-low border border-surface-variant/20 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-on-surface">{tp.name}</h4>
                    <p className="text-xs text-primary font-semibold">{tp.title}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      <strong>License:</strong> {tp.licenseNumber}
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-[10px] font-bold">
                    PENDING AUDIT
                  </span>
                </div>

                <div className="pt-2 border-t border-surface-variant/20 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Specialty: {tp.specialty}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(tp.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 font-bold text-xs transition-all"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(tp.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all"
                    >
                      Approve License ✓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Providers List */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <h3 className="font-heading font-bold text-base text-on-surface">
          Approved & Active Clinical Therapists
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-variant/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="pb-3 px-3">Therapist Name</th>
                <th className="pb-3 px-3">RCI License</th>
                <th className="pb-3 px-3">Specialty Area</th>
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
                    {tp.specialty}
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
