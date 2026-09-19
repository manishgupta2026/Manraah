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

const CATEGORY_TABS = [
  { key: "ALL", label: "All Members" },
  { key: "student", label: "Students" },
  { key: "working_professional", label: "Professionals" },
  { key: "parent", label: "Parents" },
  { key: "couple", label: "Couples" },
];

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
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, categoryFilter]);

  const columns: Column<UserItem>[] = [
    {
      header: "Member Tag & Account",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {(row.userTag || row.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <Link
              href={`/admin/users/${row.id}`}
              className="font-semibold text-slate-900 hover:text-primary transition-colors"
            >
              {row.userTag}
            </Link>
            <p className="text-[10px] text-slate-400 font-mono">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Cohort",
      accessor: (row) => (
        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 capitalize">
          {(row.category || "General").replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Wellness Score",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-xs text-slate-800 tabular-nums">
            {row.serenityScore}%
          </span>
          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                row.serenityScore >= 70
                  ? "bg-emerald-500"
                  : row.serenityScore >= 50
                  ? "bg-amber-400"
                  : "bg-rose-500"
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
        <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
          <span>🔥</span>
          <span className="font-mono tabular-nums">{row.streakDays || 1}d</span>
        </span>
      ),
    },
    {
      header: "Account Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={
            row.status === "Active"
              ? "success"
              : row.status === "Warning"
              ? "warning"
              : "error"
          }
          size="sm"
        />
      ),
    },
    {
      header: "Joined Date",
      accessor: (row) => (
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {row.joinedDate}
        </span>
      ),
    },
    {
      header: "Action",
      className: "text-right",
      accessor: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary hover:text-white text-slate-700 text-xs font-semibold active:scale-[0.98] transition-all duration-150 inline-block"
        >
          Inspect
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Top Header & Search / Filter Controls */}
      <AdminCard
        title="Registered Members Directory"
        subtitle="Manage, audit, and inspect user accounts synchronized directly from Neon Cloud PostgreSQL."
        action={
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <strong className="text-slate-900 font-mono">{users.length}</strong> members listed
            </span>
          </div>
        }
      >
        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-slate-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search by tag, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategoryFilter(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                  categoryFilter === cat.key
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Members Table */}
        <AdminTable
          columns={columns}
          data={users}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No members match your search criteria."
          emptySubtitle="Try adjusting the search query or selecting 'All Members' above."
          emptyIcon="person_search"
        />
      </AdminCard>
    </div>
  );
}
