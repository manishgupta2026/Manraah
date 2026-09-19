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
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "RESOLVED" } : r))
    );
    showToast("Community flag marked as resolved.");
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to remove this post from the community feed?"))
      return;

    try {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setReports((prev) => prev.filter((r) => r.postId !== postId));

      const res = await fetch(`/api/admin/community?postId=${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Post removed from community database.");
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      await loadCommunityData();
    }
  };

  const columns: Column<CommunityReportItem>[] = [
    {
      header: "Flagged Post & ID",
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{row.postTitle}</p>
          <span className="text-[10px] text-slate-400 font-mono">ID: {row.postId}</span>
        </div>
      ),
    },
    {
      header: "Author",
      accessor: (row) => (
        <span className="font-semibold text-slate-800 text-xs">{row.reportedUser}</span>
      ),
    },
    {
      header: "Flag Reason",
      accessor: (row) => (
        <span className="text-slate-600 text-xs font-normal max-w-xs line-clamp-1">
          {row.reason}
        </span>
      ),
    },
    {
      header: "Severity",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge
            label={row.severity}
            variant={
              row.severity === "CRITICAL"
                ? "error"
                : row.severity === "HIGH"
                ? "warning"
                : "info"
            }
            size="sm"
          />
          {row.isSafetyRelated && (
            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-200/60">
              SAFETY
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
          size="sm"
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      accessor: (row) =>
        row.status === "OPEN" ? (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleResolve(row.id)}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Resolve
            </button>
            <button
              onClick={() => handleDeletePost(row.postId)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold active:scale-[0.98] transition-all"
            >
              Remove Post
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Handled</span>
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

      {/* Moderation Queue */}
      <AdminCard
        title="Community Safety & Moderation Queue"
        subtitle="Review reported discussions, safety flags, and policy violations across community posts."
      >
        <AdminTable
          columns={columns}
          data={reports}
          keyExtractor={(row) => row.id}
          loading={loading}
          emptyMessage="No reports in moderation queue."
          emptySubtitle="Community feeds are compliant with sanctuary safety standards."
          emptyIcon="verified"
        />
      </AdminCard>

      {/* Live Community Posts in Database */}
      <AdminCard
        title="Active Community Discussions"
        subtitle="Recent posts synchronized from community_posts table"
      >
        {posts && posts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div key={post.id} className="py-4 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {post.category || "General"}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{post.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-2xl line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    By {post.author_name || "Community Member"} • {post.likes_count || 0} likes • {post.comments_count || 0} comments
                  </p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            No community posts currently found in database.
          </p>
        )}
      </AdminCard>
    </div>
  );
}
