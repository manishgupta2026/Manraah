"use client";

import React, { useState, useEffect } from "react";

interface UserRecord {
  id: string;
  userTag: string;
  category: string;
  serenityScore: number;
  status: "Active" | "Warning" | "Flagged";
  joinedDate: string;
  lastActive: string;
}

export default function UserManagementTab() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRealUsers() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const realUser: UserRecord = {
              id: data.user.id || "usr_active",
              userTag: data.user.email ? `Member (${data.user.email})` : `Anonymous Member #${data.user.id?.slice(0, 4)}`,
              category: data.userCategory || "Working Professional",
              serenityScore: data.assessmentResult?.score || data.wellnessScore || 75,
              status: "Active",
              joinedDate: "Live Session",
              lastActive: "Active Now",
            };
            setUsers([realUser]);
          } else {
            setUsers([]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user directory:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRealUsers();
  }, []);

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
      <div className="p-6 rounded-3xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-variant/30 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-on-surface">
              Member Directory & Moderation
            </h2>
            <p className="text-xs text-on-surface-variant">
              Inspect active member sessions, privacy-preserved serenity scores, and moderation logs.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            {filteredUsers.length} Active Member Session(s)
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
      <div className="p-6 rounded-3xl bg-surface-container-lowest/80 backdrop-blur-md border border-surface-variant/30 shadow-soft overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-on-surface-variant">
            Loading active member directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-container-low/50 text-center space-y-2">
            <span className="material-symbols-outlined text-3xl text-primary opacity-50">person_off</span>
            <p className="text-xs font-bold text-on-surface">No Members Matching Search Criteria</p>
            <p className="text-[11px] text-on-surface-variant">
              When members authenticate or join the platform, their privacy-preserved profiles will be listed here.
            </p>
          </div>
        ) : (
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
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift max-w-md w-full space-y-4 animate-fadeIn">
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
              <p><strong className="text-on-surface">Joined Session:</strong> {selectedUser.joinedDate}</p>
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
