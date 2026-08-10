"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { UserRole } from "@/backend/types";
import { listTeamMembers, updateUserRole, inviteTeamMember, TeamMember } from "@/backend/queries/team";

export default function TeamRolesManagement() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("listener");

  useEffect(() => {
    async function loadTeam() {
      const data = await listTeamMembers();
      setTeam(data);
      setLoading(false);
    }
    loadTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const updated = await updateUserRole(userId, newRole);
    setTeam((prev) => prev.map((m) => (m.id === userId ? updated : m)));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const newMember = await inviteTeamMember(inviteEmail, inviteRole);
    setTeam((prev) => [...prev, newMember]);
    setInviteEmail("");
  };

  const columns: Column<TeamMember>[] = [
    {
      header: "Team Member",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.name}</p>
          <span className="text-[10px] text-on-surface-variant font-mono">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Joined Date",
      accessor: (row) => <span className="font-medium text-on-surface-variant">{row.joinedDate}</span>,
    },
    {
      header: "Account Status",
      accessor: (row) => <StatusBadge label={row.status} variant={row.status === "Active" ? "success" : "warning"} />,
    },
    {
      header: "Assigned Platform Role",
      accessor: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value as UserRole)}
          className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
        >
          <option value="user">USER (Regular App User)</option>
          <option value="listener">LISTENER (Peer Volunteer)</option>
          <option value="admin">ADMIN (Executive Control)</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn select-none">
      {/* Invite Team Member Form */}
      <AdminCard
        title="Invite New Team Member & Assign Role"
        subtitle="Invite team members to join as Peer Listeners or Administrators."
      >
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter member email (e.g. colleague@manraah.com)..."
            className="w-full sm:flex-1 px-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="w-full sm:w-48 px-4 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="listener">LISTENER (Volunteer)</option>
            <option value="admin">ADMIN (Executive)</option>
            <option value="user">USER (Member)</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-purple text-white font-bold text-xs shadow-soft transition-all"
          >
            Send Role Invite →
          </button>
        </form>
      </AdminCard>

      {/* Team Member Role Directory */}
      <AdminCard
        title="Team Directory & Role Assignment Controls"
        subtitle="List of users with active platform roles. Changing a role updates user permissions instantly."
      >
        <AdminTable
          columns={columns}
          data={team}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No team members found."
        />
      </AdminCard>
    </div>
  );
}
