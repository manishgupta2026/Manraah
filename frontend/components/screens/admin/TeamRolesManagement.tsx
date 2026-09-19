"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";
import { UserRole } from "@/backend/types";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: string;
  joinedDate: string;
}

export default function TeamRolesManagement() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("listener");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/team");
      if (res.ok) {
        const data = await res.json();
        if (data.team) {
          setTeam(data.team);
        }
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Optimistic update
      setTeam((prev) => prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)));

      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        showToast(`Updated role to ${newRole.toUpperCase()} in database.`);
      } else {
        await loadTeam(); // revert if failed
      }
    } catch (err) {
      console.error("Error updating role:", err);
      await loadTeam();
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim() || inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          role: inviteRole,
          password: "CompanionPass123!",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          setTeam((prev) => [...prev, data.member]);
        }
        setInviteName("");
        setInviteEmail("");
        showToast(`New ${inviteRole.toUpperCase()} successfully registered in database.`);
      }
    } catch (err) {
      console.error("Error inviting member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from companion users?`)) return;

    try {
      setTeam((prev) => prev.filter((m) => m.id !== userId));
      const res = await fetch(`/api/admin/team?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Team member removed from database.");
      } else {
        await loadTeam();
      }
    } catch (err) {
      console.error("Error deleting member:", err);
      await loadTeam();
    }
  };

  const columns: Column<TeamMember>[] = [
    {
      header: "Team Member",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
            {(row.name || row.email || "T")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-on-surface">{row.name}</p>
            <span className="text-[10px] text-on-surface-variant font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Joined Date",
      accessor: (row) => <span className="font-medium text-on-surface-variant text-xs">{row.joinedDate}</span>,
    },
    {
      header: "Account Status",
      accessor: (row) => <StatusBadge label={row.status} variant={row.status === "ONLINE" || row.status === "Active" ? "success" : "warning"} />,
    },
    {
      header: "Assigned Platform Role",
      accessor: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-surface-container-low border border-surface-variant/30 text-xs font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 capitalize cursor-pointer"
        >
          <option value="admin">Administrator (Full Access)</option>
          <option value="listener">Peer Listener (Companion Portal)</option>
          <option value="supervisor">Clinical Supervisor</option>
        </select>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        row.email === "admin@manraah.com" ? (
          <span className="text-[10px] text-outline italic">Root Admin</span>
        ) : (
          <button
            onClick={() => handleDelete(row.id, row.email)}
            className="px-2.5 py-1 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all"
          >
            Remove
          </button>
        )
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

      {/* Invite Member Card */}
      <AdminCard
        title="Invite / Register Platform Member"
        subtitle="Grant role-based credentials for peer listeners, supervisors, and executive administrators."
      >
        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <input
            type="text"
            placeholder="Full Name"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />

          <input
            type="email"
            placeholder="member@manraah.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="px-3.5 py-2.5 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
          >
            <option value="listener">Peer Listener</option>
            <option value="supervisor">Clinical Supervisor</option>
            <option value="admin">Platform Administrator</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            {isSubmitting ? "Registering..." : "Add to Database"}
          </button>
        </form>
      </AdminCard>

      {/* Team Roster Table */}
      <AdminCard
        title="Companion Users & Team Roster"
        subtitle="Active staff records synchronized directly from companion_users table in Neon PostgreSQL."
      >
        <AdminTable
          columns={columns}
          data={team}
          loading={loading}
          emptyMessage="No team members currently registered."
        />
      </AdminCard>
    </div>
  );
}
