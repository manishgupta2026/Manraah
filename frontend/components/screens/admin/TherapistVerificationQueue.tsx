"use client";

import React, { useState } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { MOCK_THERAPISTS } from "@/frontend/lib/mock-data";

interface TherapistVerificationItem {
  id: string;
  name: string;
  title: string;
  licenseNumber: string;
  specialties: string[];
  status: "Verified" | "Pending" | "Rejected";
  rating: number;
}

export default function TherapistVerificationQueue() {
  const [therapists, setTherapists] = useState<TherapistVerificationItem[]>([
    {
      id: "tp-pending-1",
      name: "Dr. Ananya Sharma",
      title: "Clinical Psychologist (Ph.D.)",
      licenseNumber: "RCI-CL-2024-884",
      specialties: ["Anxiety & Stress", "Academic Stress"],
      status: "Pending",
      rating: 4.9,
    },
    {
      id: "tp-pending-2",
      name: "Dr. Rajesh Verma",
      title: "Licensed Family Therapist",
      licenseNumber: "RCI-FT-2023-112",
      specialties: ["Parenting", "Couples Therapy"],
      status: "Pending",
      rating: 4.8,
    },
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

  const columns: Column<TherapistVerificationItem>[] = [
    {
      header: "Practitioner Name & Title",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.name}</p>
          <span className="text-[10px] text-primary font-semibold">{row.title}</span>
        </div>
      ),
    },
    {
      header: "RCI License Number",
      accessor: (row) => (
        <span className="font-mono font-bold text-primary">{row.licenseNumber}</span>
      ),
    },
    {
      header: "Specialty Areas",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.specialties.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-surface-container-high text-[10px] font-bold text-on-surface">
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "Verified" ? "success" : row.status === "Pending" ? "warning" : "error"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        row.status === "Pending" ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleReject(row.id)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 font-bold transition-all text-xs"
            >
              Reject
            </button>
            <button
              onClick={() => handleApprove(row.id)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all text-xs"
            >
              Approve License ✓
            </button>
          </div>
        ) : (
          <span className="text-[11px] font-bold text-emerald-600">✓ License Verified</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminCard
        title="Clinical Care Provider License Verification Queue"
        subtitle="Audit RCI license numbers, inspect practitioner credentials, and approve therapists for 1-on-1 bookings."
      >
        <AdminTable
          columns={columns}
          data={therapists}
          keyExtractor={(row) => row.id}
          emptyMessage="No therapist applications found."
        />
      </AdminCard>
    </div>
  );
}
