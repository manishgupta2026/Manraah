"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

interface UserItem {
  id: string;
  userTag: string;
  email: string;
  category: string;
  serenityScore: number;
  streakDays: number;
  status: "Active" | "Warning" | "Flagged";
  joinedDate: string;
  role: "user" | "listener" | "admin";
}

export default function UserManagementTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, categoryFilter]);

  const columns: Column<UserItem>[] = [
    {
      header: "Member Tag / Name",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
            {(row.userTag || row.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-on-surface hover:text-primary transition-colors">
              <Link href={`/admin/users/${row.id}`}>{row.userTag}</Link>
            </p>
            <p className="text-[10px] text-on-surface-variant font-mono">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Cohort Category",
      accessor: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant uppercase">
          {row.category}
        </span>
      ),
    },
    {
      header: "Wellness Score",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs font-mono">{row.serenityScore}%</span>
          <div className="w-16 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.serenityScore >= 70 ? "bg-emerald-500" : row.serenityScore >= 50 ? "bg-amber-400" : "bg-rose-500"
              }`}
              style={{ width: `${row.serenityScore}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: "Streak",
      accessor: (row) => (
        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
          🔥 {row.streakDays || 1}d
        </span>
      ),
    },
    {
      header: "Account Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "Active" ? "success" : row.status === "Warning" ? "warning" : "error"}
        />
      ),
    },
    {
      header: "Joined Date",
      accessor: (row) => <span className="text-xs text-on-surface-variant font-medium">{row.joinedDate}</span>,
    },
    {
      header: "Action",
      accessor: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="px-3 py-1 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all inline-block"
        >
          Inspect User
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      <AdminCard
        title="Registered Members Directory"
        subtitle="Manage and audit users synchronized directly from Neon PostgreSQL."
      >
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pt-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {["ALL", "student", "working_professional", "parent", "couple"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {cat === "ALL" ? "All Cohorts" : cat.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <AdminTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No members match the selected search criteria in the database."
        />
      </AdminCard>
    </div>
  );
}
