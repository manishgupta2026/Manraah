"use client";

import React, { useState, useEffect } from "react";
import AdminCard from "@/frontend/components/ui/AdminCard";
import AdminTable, { Column } from "@/frontend/components/ui/AdminTable";
import StatusBadge from "@/frontend/components/ui/StatusBadge";

interface CommunityReportItem {
  id: string;
  postId: string;
  postTitle: string;
  reportedUser: string;
  reason: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isSafetyRelated: boolean;
  timestamp: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
}

export default function CommunityModerationQueue() {
  const [reports, setReports] = useState<CommunityReportItem[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/community");
      if (res.ok) {
        const data = await res.json();
        if (data.reports) setReports(data.reports);
        if (data.posts) setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to load community data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const handleResolve = (id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r)));
    showToast("Community report resolved.");
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to remove this post from the community feed?")) return;

    try {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setReports((prev) => prev.filter((r) => r.postId !== postId));

      const res = await fetch(`/api/admin/community?postId=${postId}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Post removed from database community feed.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      await loadCommunityData();
    }
  };

  const columns: Column<CommunityReportItem>[] = [
    {
      header: "Post / Discussion Title",
      accessor: (row) => (
        <div>
          <p className="font-bold text-on-surface">{row.postTitle}</p>
          <span className="text-[10px] text-on-surface-variant font-mono">ID: {row.postId}</span>
        </div>
      ),
    },
    {
      header: "Reported Member",
      accessor: (row) => <span className="font-semibold text-on-surface text-xs">{row.reportedUser}</span>,
    },
    {
      header: "Reason & Notes",
      accessor: (row) => <span className="text-on-surface-variant text-xs font-medium">{row.reason}</span>,
    },
    {
      header: "Severity & Tag",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge
            label={row.severity}
            variant={row.severity === "CRITICAL" ? "error" : row.severity === "HIGH" ? "warning" : "info"}
          />
          {row.isSafetyRelated && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 text-[9px] font-extrabold border border-rose-500/20">
              SAFETY FLAG
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row) => (
        <StatusBadge
          label={row.status}
          variant={row.status === "OPEN" ? "warning" : "success"}
        />
      ),
    },
    {
      header: "Actions",
      accessor: (row) =>
        row.status === "OPEN" ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleResolve(row.id)}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
            >
              Resolve
            </button>
            <button
              onClick={() => handleDeletePost(row.postId)}
              className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all"
            >
              Remove Post
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-outline font-semibold">Handled</span>
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
        title="Community Content Moderation"
        subtitle="Review community discussions, reports, and safety flags synchronized with community_posts table."
      >
        <AdminTable
          columns={columns}
          data={reports}
          loading={loading}
          emptyMessage="No pending moderation flags in community discussions."
        />
      </AdminCard>

      {/* Live Community Posts in Database */}
      {posts && posts.length > 0 && (
        <AdminCard title="Recent Community Discussions" subtitle="Directly from Neon DB">
          <div className="space-y-3">
            {posts.map((post: any) => (
              <div key={post.id} className="p-3.5 rounded-2xl bg-surface-container-low flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">{post.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-[10px] font-semibold text-on-surface-variant uppercase">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">{post.content}</p>
                  <p className="text-[10px] text-outline mt-1 font-mono">By {post.authorName} • {post.likes || 0} likes</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="px-3 py-1 rounded-xl text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
