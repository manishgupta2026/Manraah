"use client";

import React, { useState } from "react";

interface UserRecord {
  id: string;
  userTag: string;
  category: "Student" | "Working Professional" | "Parent" | "Senior Citizen";
  serenityScore: number;
  status: "Active" | "Warning" | "Flagged";
  joinedDate: string;
  lastActive: string;
}

export default function UserManagementTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const users: UserRecord[] = [
    {
      id: "usr_101",
      userTag: "Anonymous Member #582",
      category: "Student",
      serenityScore: 82,
      status: "Active",
      joinedDate: "Aug 1, 2026",
      lastActive: "2 mins ago",
    },
    {
      id: "usr_102",
      userTag: "Anonymous Member #914",
      category: "Working Professional",
      serenityScore: 64,
      status: "Active",
      joinedDate: "Jul 28, 2026",
      lastActive: "15 mins ago",
    },
    {
      id: "usr_103",
      userTag: "Anonymous Member #204",
      category: "Parent",
      serenityScore: 48,
      status: "Warning",
      joinedDate: "Jul 20, 2026",
      lastActive: "1 hour ago",
    },
    {
      id: "usr_104",
      userTag: "Anonymous Member #881",
      category: "Senior Citizen",
      serenityScore: 90,
      status: "Active",
      joinedDate: "Aug 4, 2026",
      lastActive: "3 hours ago",
    },
    {
      id: "usr_105",
      userTag: "Anonymous Member #312",
      category: "Student",
      serenityScore: 35,
      status: "Flagged",
      joinedDate: "Jul 15, 2026",
      lastActive: "Just now",
    },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.userTag.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || u.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Header & Controls */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">
              Member Directory & Moderation
            </h2>
            <p className="text-xs text-on-surface-variant">
              Manage member accounts, inspect privacy-preserved serenity scores, and monitor flags.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {filteredUsers.length} Members Listed
          </span>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-on-surface-variant/60">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by User Tag or ID..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "Student", "Working Professional", "Parent", "Senior Citizen"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    categoryFilter === cat
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant border-surface-variant/30 hover:border-primary/40"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-variant/20 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <th className="pb-3 px-3">User Identifier</th>
              <th className="pb-3 px-3">Demographic Cohort</th>
              <th className="pb-3 px-3">Serenity Score</th>
              <th className="pb-3 px-3">Account Status</th>
              <th className="pb-3 px-3">Last Active</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant/10 text-xs">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-surface-container-low/50 transition-all">
                <td className="py-3.5 px-3 font-bold text-on-surface">
                  {u.userTag}
                  <span className="block text-[10px] font-medium text-on-surface-variant">{u.id}</span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant font-medium">
                  {u.category}
                </td>
                <td className="py-3.5 px-3 font-bold">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] ${
                      u.serenityScore >= 75
                        ? "bg-emerald-500/10 text-emerald-600"
                        : u.serenityScore >= 50
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-rose-500/10 text-rose-600"
                    }`}
                  >
                    {u.serenityScore} / 100
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      u.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : u.status === "Warning"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-rose-500/10 text-rose-600 animate-pulse"
                    }`}
                  >
                    ● {u.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-on-surface-variant font-medium">
                  {u.lastActive}
                </td>
                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-primary hover:text-white text-on-surface font-bold transition-all text-xs"
                  >
                    Inspect Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft-xl max-w-md w-full space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-surface-variant/20 pb-3">
              <h3 className="font-heading font-bold text-base text-on-surface">
                Member Inspection: {selectedUser.userTag}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-on-surface-variant">
              <p><strong className="text-on-surface">Category:</strong> {selectedUser.category}</p>
              <p><strong className="text-on-surface">Serenity Score:</strong> {selectedUser.serenityScore} / 100</p>
              <p><strong className="text-on-surface">Account Status:</strong> {selectedUser.status}</p>
              <p><strong className="text-on-surface">Joined Date:</strong> {selectedUser.joinedDate}</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Sent wellness check-in reminder to ${selectedUser.userTag}`);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs"
              >
                Send Wellness Check-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
