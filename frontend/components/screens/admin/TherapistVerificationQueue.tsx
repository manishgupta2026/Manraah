"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

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
  const [therapists, setTherapists] = useState<TherapistVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadTherapists = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/therapists");
      if (res.ok) {
        const data = await res.json();
        if (data.therapists) {
          setTherapists(data.therapists);
        }
      }
    } catch (err) {
      console.error("Error loading therapists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Verified" } : t))
    );
    await fetch("/api/admin/therapists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Verified" }),
    });
    showToast(`Approved ${name} to accept clinical appointments.`);
  };

  const handleReject = async (id: string, name: string) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Rejected" } : t))
    );
    await fetch("/api/admin/therapists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Rejected" }),
    });
    showToast(`Rejected credential submission for ${name}.`);
  };

  const columns: Column<TherapistVerificationItem>[] = [
    {
      header: "Therapist / Practitioner",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700 text-xs">
            {row.name[0]}
          </div>
          <div>
            <p className="font-bold text-on-surface">{row.name}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">{row.title}</p>
          </div>
        </div>
      ),
    },
    {
      header: "License / Registration",
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-primary">{row.licenseNumber}</span>
      ),
    },
    {
      header: "Specialties",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.specialties.map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Credential Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "Verified" ? "success" : row.status === "Pending" ? "warning" : "error"}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (row) =>
        row.status === "Pending" ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleApprove(row.id, row.name)}
              className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(row.id, row.name)}
              className="px-3 py-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-outline font-semibold">Processed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold text-center animate-fadeIn">
          ✓ {toastMessage}
        </div>
      )}

      <AdminCard
        title="Therapist Credential Verification"
        subtitle="Review clinical licenses and accredited practitioners registered in Neon PostgreSQL."
      >
        <AdminTable
          columns={columns}
          data={therapists}
          loading={loading}
          emptyMessage="No therapists currently in verification queue."
        />
      </AdminCard>
    </div>
  );
}
