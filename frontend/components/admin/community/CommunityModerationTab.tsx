"use client";

import React, { useState, useEffect } from "react";

interface ModerationPost {
  id: string;
  author: string;
  avatar?: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ModerationStats {
  total: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export default function CommunityModerationTab() {
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    total: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [activeFilter, setActiveFilter] = useState<"pending" | "approved" | "all" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/community");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load moderation posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleModerate = async (postId: string, newStatus: "approved" | "rejected") => {
    try {
      setActionInProgress(postId);
      const res = await fetch("/api/admin/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, status: newStatus }),
      });

      if (res.ok) {
        // Optimistically update local posts state
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          approvedCount: newStatus === "approved" ? prev.approvedCount + 1 : prev.approvedCount,
          rejectedCount: newStatus === "rejected" ? prev.rejectedCount + 1 : prev.rejectedCount,
        }));

        setFeedbackMessage({
          text:
            newStatus === "approved"
              ? "✓ Post allowed! It is now immediately visible in the community feed."
              : "✕ Post rejected and excluded from the community feed.",
          type: "success",
        });

        setTimeout(() => setFeedbackMessage(null), 4000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setFeedbackMessage({
          text: errData.error || "Failed to update post status.",
          type: "error",
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        text: err.message || "Failed to connect to moderation server.",
        type: "error",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (activeFilter === "all") return true;
    return post.status === activeFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn select-none font-sans">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Safe Community Moderation
          </span>
          <h2 className="font-heading font-bold text-lg text-on-surface">
            Community Posts & 24-Hour Review Queue
          </h2>
          <p className="text-xs text-on-surface-variant">
            Review user submissions before they reflect in peer circles. Allowed posts appear in the community feed immediately.
          </p>
        </div>

        <button
          onClick={fetchPosts}
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface font-bold text-xs border border-surface-variant/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
            refresh
          </span>
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-soft animate-fadeIn ${
            feedbackMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30"
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Stat Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveFilter("pending")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === "pending"
              ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
              : "bg-surface-container-lowest border-surface-variant/30 hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Pending 24h Review
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-3xl font-heading font-black text-amber-600 dark:text-amber-400 mt-2">
            {stats.pendingCount}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            Posts awaiting administrator approval
          </p>
        </div>

        <div
          onClick={() => setActiveFilter("approved")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === "approved"
              ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
              : "bg-surface-container-lowest border-surface-variant/30 hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Live in Community
            </span>
            <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
          </div>
          <div className="text-3xl font-heading font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.approvedCount}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            Posts currently visible to all members
          </p>
        </div>

        <div
          onClick={() => setActiveFilter("rejected")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${
            activeFilter === "rejected"
              ? "bg-rose-500/10 border-rose-500/40 shadow-xs"
              : "bg-surface-container-lowest border-surface-variant/30 hover:border-rose-500/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Rejected / Excluded
            </span>
            <span className="material-symbols-outlined text-rose-500 text-lg">cancel</span>
          </div>
          <div className="text-3xl font-heading font-black text-rose-600 dark:text-rose-400 mt-2">
            {stats.rejectedCount}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">
            Posts declined by moderation
          </p>
        </div>
      </div>

      {/* 3. Filter Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "pending", label: `Pending Review (${stats.pendingCount})` },
          { id: "approved", label: `Live Approved (${stats.approvedCount})` },
          { id: "all", label: `All Posts (${stats.total})` },
          { id: "rejected", label: `Rejected (${stats.rejectedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
              activeFilter === tab.id
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-surface-container-lowest text-on-surface-variant border-surface-variant/30 hover:border-primary/40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Posts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-on-surface-variant animate-pulse rounded-3xl bg-surface-container-lowest border border-surface-variant/30">
            Loading community moderation queue...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-surface-container-lowest border border-dashed border-surface-variant/40 text-center space-y-3">
            <span className="text-4xl block">✨</span>
            <h3 className="font-heading font-bold text-base text-on-surface">
              {activeFilter === "pending"
                ? "Moderation Queue Is Clear!"
                : `No ${activeFilter} posts found`}
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {activeFilter === "pending"
                ? "All user-submitted posts have been reviewed. New posts will appear here for 24-hour review before reflecting publicly."
                : "There are currently no community posts in this filter category."}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={`p-6 rounded-3xl bg-surface-container-lowest border shadow-soft space-y-4 transition-all ${
                post.status === "pending"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-surface-variant/30"
              }`}
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {post.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-on-surface">
                      {post.author}
                    </h4>
                    <div className="flex items-center gap-2 text-[10.5px] text-on-surface-variant">
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold">
                        {post.category}
                      </span>
                      <span>•</span>
                      <span>
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide ${
                      post.status === "pending"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : post.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    ● {post.status}
                  </span>
                </div>
              </div>

              {/* Title & Body Content */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-surface-container-low border border-surface-variant/20">
                <h3 className="font-heading font-black text-base text-on-surface">
                  {post.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-variant/20">
                <div className="text-[11px] text-on-surface-variant font-medium">
                  Post ID: <span className="font-mono text-[10px]">{post.id}</span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {post.status !== "approved" && (
                    <button
                      onClick={() => handleModerate(post.id, "approved")}
                      disabled={actionInProgress === post.id}
                      className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      <span>Allow / Approve Post</span>
                    </button>
                  )}

                  {post.status !== "rejected" && (
                    <button
                      onClick={() => handleModerate(post.id, "rejected")}
                      disabled={actionInProgress === post.id}
                      className="px-4 py-2 rounded-2xl bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-xs border border-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      <span>Reject</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
