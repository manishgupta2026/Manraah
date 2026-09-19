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
    try {
      await fetch("/api/admin/therapists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Verified" }),
      });
      showToast(`Approved ${name} for clinical appointments.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setTherapists((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Rejected" } : t))
    );
    try {
      await fetch("/api/admin/therapists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Rejected" }),
      });
      showToast(`Rejected credential submission for ${name}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<TherapistVerificationItem>[] = [
    {
      header: "Practitioner & Credentials",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {row.name[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <p className="text-[11px] text-slate-500 font-medium">{row.title}</p>
          </div>
        </div>
      ),
    },
    {
      header: "License / Registration",
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {row.licenseNumber}
        </span>
      ),
    },
    {
      header: "Clinical Specialties",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.specialties.map((s, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Verification Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={
            row.status === "Verified"
              ? "success"
              : row.status === "Pending"
              ? "warning"
              : "error"
          }
          size="sm"
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) =>
        row.status === "Pending" ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleApprove(row.id, row.name)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => handleReject(row.id, row.name)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Processed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600">✕</button>
        </div>
      )}

      <AdminCard
        title="Clinical Therapist Credentialing Queue"
        subtitle="Verify RCI registration numbers and license details for mental health practitioners."
        action={
          <button
            onClick={loadTherapists}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>Refresh Roster</span>
          </button>
        }
      >
        <AdminTable
          columns={columns}
          data={therapists}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No therapist credentials currently queued."
          emptySubtitle="All clinical registrations have been processed and verified."
          emptyIcon="verified_user"
        />
      </AdminCard>
    </div>
  );
}
