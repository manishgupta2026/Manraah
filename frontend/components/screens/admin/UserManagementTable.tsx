"use client";

import React, { useState } from "react";
import Link from "next/link";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

interface UserItem {
  id: string;
  userTag: string;
  category: string;
  serenityScore: number;
  status: "Active" | "Warning" | "Flagged";
  joinedDate: string;
  role: "user" | "listener" | "admin";
}

export default function UserManagementTable() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [users] = useState<UserItem[]>([
    {
      id: "usr-101",
      userTag: "Anonymous Member #582",
      category: "Student",
      serenityScore: 82,
      status: "Active",
      joinedDate: "Aug 1, 2026",
      role: "user",
    },
    {
      id: "usr-102",
      userTag: "Anonymous Member #914",
      category: "Working Professional",
      serenityScore: 64,
      status: "Active",
      joinedDate: "Jul 28, 2026",
      role: "user",
    },
    {
      id: "usr-103",
      userTag: "Anonymous Member #204",
      category: "Parent",
      serenityScore: 48,
      status: "Warning",
      joinedDate: "Jul 20, 2026",
      role: "user",
    },
    {
      id: "usr-104",
      userTag: "Dr. Sarah Jenkins",
      category: "Working Professional",
      serenityScore: 92,
      status: "Active",
      joinedDate: "Jul 15, 2026",
      role: "listener",
    },
    {
      id: "usr-105",
      userTag: "Ashutosh Sahu",
      category: "Working Professional",
      serenityScore: 88,
      status: "Active",
      joinedDate: "Aug 1, 2026",
      role: "admin",
    },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.userTag.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || u.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns: Column<UserItem>[] = [
    {
      header: "User Tag & Identifier",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.userTag}</p>
          <span className="text-[10px] text-on-surface-variant/80 font-mono">{row.id}</span>
        </div>
      ),
    },
    {
      header: "Cohort",
      accessor: (row) => <span className="font-semibold text-on-surface-variant">{row.category}</span>,
    },
    {
      header: "Platform Role",
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
          row.role === "admin"
            ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
            : row.role === "listener"
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : "bg-surface-container-high text-on-surface-variant"
        }`}>
          {row.role}
        </span>
      ),
    },
    {
      header: "Serenity Score",
      accessor: (row) => (
        <span className="font-bold text-primary">{row.serenityScore} / 100</span>
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
      header: "Actions",
      className: "text-right",
      accessor: (row) => (
        <Link
          href={`/admin/users/${row.id}`}
          className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-bold transition-all inline-block"
        >
          View Profile →
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <AdminCard
        title="Member Directory & Privacy Inspection"
        subtitle="Manage registered members, inspect privacy-preserved serenity scores, and monitor flags."
        action={
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member tag or ID..."
              className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 w-48"
            />
            {["ALL", "Student", "Working Professional", "Parent"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  categoryFilter === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-surface-container-low text-on-surface-variant border-surface-variant/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        }
      >
        <AdminTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(row) => row.id}
          emptyMessage="No members match search criteria."
        />
      </AdminCard>
    </div>
  );
}
