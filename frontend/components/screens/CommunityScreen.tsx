"use client";

import React, { useState, useEffect } from "react";
import { MOCK_COMMUNITY_POSTS } from "@/frontend/lib/mock-data";
import { CommunityPost } from "@/backend/types";
import { getClientSession } from "@/backend/auth/client";
import { getInitials, getPastelBgColor, getPastelTextColor } from "@/frontend/lib/avatar-helper";
import { useRouter } from "next/navigation";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const session = getClientSession();
    if (session.user) {
      setUser(session.user);
    }
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const authorName = user?.sanctuaryName || user?.name || "Sanctuary Member";
    const authorAvatar = user?.avatar || "/images/user_avatar.jpg";

    const post: CommunityPost = {
      id: Date.now().toString(),
      author: authorName,
      avatar: authorAvatar,
      category: "Peer Discussion",
      timeAgo: "Just now",
      title: newTitle,
      content: newContent,
      likes: 1,
      commentsCount: 0,
    };

    setPosts([post, ...posts]);
    setNewTitle("");
    setNewContent("");
  };

  const handleLike = (id: string) => {
    setPosts(
      posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <div className="space-y-8">
      <ScreenHeader title="🌱 Community" showBackButton={true} fallbackRoute="/dashboard" />
      {/* Header */}
      <div className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-3">
        <span className="px-4 py-1.5 rounded-full bg-peach/30 text-tertiary text-xs font-semibold uppercase tracking-wider">
          Safe Peer Sanctuary
        </span>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Community Support & Peer Circles</h1>
        <p className="text-sm text-on-surface-variant max-w-xl">
          Connect, share experiences, and exchange mindful advice in moderated, compassionate spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post Widget */}
          <form onSubmit={handleCreatePost} className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 font-sans">
            <h3 className="font-heading font-bold text-base text-on-surface">Share a Thought or Question</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Post Title..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-heading font-semibold text-on-surface"
            />
            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your post..."
              className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-purple transition-all"
              >
                Post to Community →
              </button>
            </div>
          </form>

          {/* Posts Stream */}
          <div className="space-y-4">
            {posts.map((post) => {
              const isCustomAvatar = post.avatar && post.avatar.startsWith("data:image/");
              const initials = getInitials(post.author);
              const pastelBg = getPastelBgColor(post.author);
              const pastelText = getPastelTextColor(post.author);

              return (
                <div key={post.id} className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCustomAvatar ? (
                        <img
                          src={post.avatar}
                          alt={post.author}
                          className="w-10 h-10 rounded-full object-cover border border-primary/10 shadow-xs"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-xs transition-all duration-300"
                          style={{ backgroundColor: pastelBg, color: pastelText }}
                        >
                          {initials}
                        </div>
                      )}
                      <div>
                        <h4 className="font-heading font-bold text-sm text-on-surface">{post.author}</h4>
                        <p className="text-[11px] text-on-surface-variant/70">{post.timeAgo} • {post.category}</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-on-surface">{post.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-6 pt-3 border-t border-surface-variant/30 text-xs font-semibold text-on-surface-variant">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-base">favorite</span>
                      <span>{post.likes} Likes</span>
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">chat_bubble</span>
                      <span>{post.commentsCount} Comments</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Topics */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-4 h-fit">
          <h3 className="font-heading font-bold text-lg text-on-surface">Trending Topics</h3>
          <div className="space-y-2 text-xs">
            {["#StudentExamCalm", "#MindfulParenting", "#WorkplaceBurnout", "#DailyGratitude"].map((topic) => (
              <div key={topic} className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer font-semibold text-primary">
                {topic}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
