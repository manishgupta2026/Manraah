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
  const [showInviteModal, setShowInviteModal] = useState(false);
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
      setTeam((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
      );

      const res = await fetch("/api/admin/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        showToast(`Role updated to ${newRole.toUpperCase()} in database.`);
      } else {
        await loadTeam();
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
        setShowInviteModal(false);
        showToast(`New ${inviteRole.toUpperCase()} registered in database.`);
      }
    } catch (err) {
      console.error("Error inviting member:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from companion users?`))
      return;

    try {
      setTeam((prev) => prev.filter((m) => m.id !== userId));
      const res = await fetch(`/api/admin/team?userId=${userId}`, {
        method: "DELETE",
      });
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
      header: "Member & Email",
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {(row.name || row.email || "T")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.name}</p>
            <span className="text-[10px] text-slate-400 font-mono">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Assigned Platform Role",
      accessor: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
        >
          <option value="admin">Administrator</option>
          <option value="therapist">Clinician / Therapist</option>
          <option value="listener">Peer Listener</option>
          <option value="staff">Operations Staff</option>
          <option value="user">Standard Member</option>
        </select>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status || "Active"}
          variant={row.status === "OFFLINE" ? "neutral" : "success"}
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
        <button
          onClick={() => handleDelete(row.id, row.email)}
          className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
          title="Remove from platform team"
        >
          Remove
        </button>
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

      {/* Main Team Table Card */}
      <AdminCard
        title="Administrative Team & Role Permissions"
        subtitle="Manage executive administrators, peer listeners, and staff stored in companion_users table."
        action={
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>Add Companion / Staff</span>
          </button>
        }
      >
        <AdminTable
          columns={columns}
          data={team}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No team members registered."
          emptySubtitle="Click 'Add Companion / Staff' above to register a new administrator or listener."
          emptyIcon="group_add"
        />
      </AdminCard>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Register New Companion / Staff
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creates an account in Neon companion_users table.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@manraah.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Role Assignment</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  <option value="listener">Peer Listener</option>
                  <option value="admin">Platform Administrator</option>
                  <option value="therapist">Clinician / Therapist</option>
                  <option value="staff">Support Staff</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <p>Default credential password will be initialized as <code className="font-mono text-slate-700 font-bold">CompanionPass123!</code>.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
