"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import UserAvatar from "@/frontend/components/ui/UserAvatar";
import { validateCommunityPost, checkInappropriateContent } from "@/frontend/lib/moderation";

interface CommunityPostItem {
  id: string;
  author: string;
  avatar?: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  isLiked?: boolean;
}

const INITIAL_POSTS: CommunityPostItem[] = [
  {
    id: "post-1",
    author: "Kavita M.",
    category: "Mindful Living",
    title: "How a 4-7-8 breathing pause changed my afternoon anxiety spikes",
    content:
      "Whenever the 3 PM fatigue and racing thoughts hit, I used to reach for coffee. This week I started stepping away from my desk to do four cycles of 4-7-8 breathwork. The shift in my nervous system was noticeable within two days.",
    likes: 24,
    commentsCount: 6,
    timeAgo: "2 hours ago",
    isLiked: false,
  },
  {
    id: "post-2",
    author: "Arjun D.",
    category: "Career & Study",
    title: "Setting boundaries without feeling crushing guilt",
    content:
      "A reminder for anyone struggling with saying 'no' to extra tasks when your plate is already full: protecting your energy is not selfish, it is preventative self-care. We can't pour from an empty cup.",
    likes: 42,
    commentsCount: 11,
    timeAgo: "5 hours ago",
    isLiked: true,
  },
  {
    id: "post-3",
    author: "Sneha R.",
    category: "Gratitude & Wins",
    title: "Small celebration: 7 days streak of morning journaling!",
    content:
      "I have never been able to stick to a daily routine before. Writing just 3 bullet points every morning has grounded me before looking at emails. Celebrating this small milestone here with everyone!",
    likes: 38,
    commentsCount: 8,
    timeAgo: "1 day ago",
    isLiked: false,
  },
  {
    id: "post-4",
    author: "Rohan V.",
    category: "Stress & Anxiety",
    title: "Grounding technique when overwhelmed: 5-4-3-2-1",
    content:
      "5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. Saved me during a panic spike today on the commute. Hope this gentle reminder helps whoever needs it today.",
    likes: 56,
    commentsCount: 14,
    timeAgo: "2 days ago",
    isLiked: false,
  },
];

const COMMUNITY_CATEGORIES = [
  "All Circles",
  "Mindful Living",
  "Stress & Anxiety",
  "Career & Study",
  "Gratitude & Wins",
  "Relationships",
];

export default function CommunityView() {
  const { user } = useAuth();
  const userName = user?.name || user?.sanctuaryName || "";

  const [posts, setPosts] = useState<CommunityPostItem[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState("All Circles");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Mindful Living");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showInappropriateModal, setShowInappropriateModal] = useState(false);
  const [inappropriateReason, setInappropriateReason] = useState("");
  const [postToDelete, setPostToDelete] = useState<CommunityPostItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    const targetId = postToDelete.id;
    setIsDeleting(true);

    try {
      await fetch(`/api/community?id=${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });

      // Optimistically remove from state
      setPosts((prev) => prev.filter((p) => p.id !== targetId));
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
      // Still remove locally
      setPosts((prev) => prev.filter((p) => p.id !== targetId));
      setPostToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function loadCommunityPosts() {
      try {
        const res = await fetch("/api/community");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((p: any) => ({
              id: p.id,
              author: p.author || "Manraah Member",
              avatar: p.avatar,
              category: p.category || "Mindful Living",
              title: p.title,
              content: p.content,
              likes: p.likes || 1,
              commentsCount: p.commentsCount || 0,
              timeAgo: p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "Recently",
              isLiked: false,
            }));
            // Merge or prepend
            setPosts((prev) => {
              const ids = new Set(prev.map((i) => i.id));
              const newItems = formatted.filter((item: CommunityPostItem) => !ids.has(item.id));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote community posts, using default circles:", err);
      }
    }
    loadCommunityPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const titleToSend = newTitle.trim();
    const contentToSend = newContent.trim();
    const submittedCategory = newPostCategory;

    // 1. Client-side Inappropriate Content Validation
    const moderation = validateCommunityPost(titleToSend, contentToSend);
    if (moderation.isInappropriate) {
      setInappropriateReason(
        moderation.reason ||
          "Your message contains inappropriate language or content that violates our community safety standards."
      );
      setShowInappropriateModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToSend,
          content: contentToSend,
          category: submittedCategory,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // Inappropriate content detected on backend
      if (!res.ok || data.error === "inappropriate_content") {
        if (res.status === 422 || data.error === "inappropriate_content") {
          setInappropriateReason(
            data.message ||
              "You cannot post this. Your message contains inappropriate content that violates our community safety standards."
          );
          setShowInappropriateModal(true);
          return;
        }
        throw new Error(data.error || "Failed to create post");
      }

      // 2. Direct Post Publishing: instantly added to feed (no admin review)
      const createdItem: CommunityPostItem = {
        id: data.post?.id || `post-${Date.now()}`,
        author: data.post?.author || userName || "Manraah Member",
        avatar: data.post?.avatar || user?.avatar,
        category: submittedCategory,
        title: titleToSend,
        content: contentToSend,
        likes: 1,
        commentsCount: 0,
        timeAgo: "Just now",
        isLiked: false,
      };

      setPosts((prev) => [createdItem, ...prev]);
      setNewTitle("");
      setNewContent("");
    } catch (err: any) {
      console.warn("Post submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextIsLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextIsLiked,
            likes: nextIsLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const filteredPosts = posts.filter((post) => {
    const matchesCat =
      selectedCategory === "All Circles" ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#121214] rounded-3xl p-6 sm:p-7 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#006B56] dark:text-zinc-200">
              Safe Peer Manraah
            </span>
            <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-white leading-tight mt-0.5">
              Community &amp; Peer Circles
            </h1>
            <p className="text-xs text-[#6B857C] dark:text-[#A1A1AA] font-medium mt-1">
              Compassionate, moderated spaces to share reflections, exchange strategies, and support one another.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4F0] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#006B56] dark:bg-white dark:text-black animate-pulse" />
              <span className="font-bold text-[#006B56] dark:text-zinc-200">
                340+ Peers Active
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#CBECE2] dark:border-[#27272a]">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search peer conversations, topics, tags..."
              className="w-full py-2 pl-9 pr-4 rounded-full bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs text-[#19332A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006B56]/40 dark:focus:ring-zinc-400/30 placeholder:text-[#8EAAA1] dark:placeholder:text-[#789990]"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-[#8EAAA1] dark:text-[#789990]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {COMMUNITY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-[#006B56] text-white border-[#006B56] dark:bg-white dark:text-black dark:border-white/20 shadow-xs"
                    : "bg-[#F4F9F6] dark:bg-[#18181b] text-[#4F685F] dark:text-[#A1A1AA] border-[#CBECE2] dark:border-[#27272a] hover:bg-[#E6F4F0] dark:hover:bg-[#27272a]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Feed Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Create Post Widget */}
          <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-6 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5">
              <UserAvatar user={user} sizeClass="w-8 h-8 text-xs" />
              <div>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-white">
                  Share with Manraah
                </h3>
                <p className="text-[10px] text-[#6B857C] dark:text-[#A1A1AA]" suppressHydrationWarning>
                  Post as {userName} • Your thoughts are held safely
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Topic or heading (e.g. A small habit that helped me this week...)"
                className="w-full py-2.5 px-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold text-[#19332A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006B56]/40 dark:focus:ring-zinc-400/30 placeholder:text-[#8EAAA1] dark:placeholder:text-[#789990]"
              />

              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What would you like to share or ask your fellow circle members?"
                className="w-full p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs leading-relaxed text-[#19332A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006B56]/40 dark:focus:ring-zinc-400/30 placeholder:text-[#8EAAA1] dark:placeholder:text-[#789990]"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#4F685F] dark:text-[#A1A1AA]">
                    Circle:
                  </span>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="py-1.5 px-3 rounded-full bg-[#F4F9F6] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs font-bold text-[#19332A] dark:text-white focus:outline-none cursor-pointer"
                  >
                    {COMMUNITY_CATEGORIES.filter((c) => c !== "All Circles").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                  className="py-2.5 px-6 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black dark:hover:text-black text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{isSubmitting ? "Posting..." : "Post to Circle"}</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed */}
          <div className="flex flex-col gap-4">
            {filteredPosts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#121214] border border-dashed border-[#CBECE2] dark:border-[#27272a] text-center space-y-2">
                <span className="text-2xl block">💬</span>
                <p className="text-xs font-bold text-[#19332A] dark:text-white">
                  No circle discussions found
                </p>
                <p className="text-[11px] text-[#6B857C] dark:text-[#A1A1AA]">
                  Be the first to start a conversation in this circle above!
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-6 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs space-y-3.5 transition-colors"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={post.author} avatar={post.avatar} sizeClass="w-9 h-9 text-xs" />
                      <div>
                        <h4 className="text-xs font-heading font-black text-[#19332A] dark:text-white">
                          {post.author}
                        </h4>
                        <div className="flex items-center gap-2 text-[10.5px] text-[#6B857C] dark:text-[#A1A1AA]">
                          <span>{post.timeAgo}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#E6F4F0] dark:bg-[#18181b] text-[#006B56] dark:text-zinc-200 border border-transparent dark:border-[#27272a] font-bold text-[9.5px]">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Post Button */}
                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      title="Delete post"
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#8EAAA1] dark:text-[#71717A] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer flex items-center gap-1 group"
                    >
                      <svg
                        className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-white mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#4F685F] dark:text-[#E4E4E7] leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Actions (Like & Comments) */}
                  <div className="flex items-center gap-4 pt-3 border-t border-[#CBECE2] dark:border-[#27272a]">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        post.isLiked
                          ? "text-rose-500"
                          : "text-[#6B857C] dark:text-[#A1A1AA] hover:text-[#19332A] dark:hover:text-[#F4FAF7]"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={post.isLiked ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{post.likes}</span>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedCommentsId(
                          expandedCommentsId === post.id ? null : post.id
                        )
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-[#6B857C] dark:text-[#A1A1AA] hover:text-[#19332A] dark:hover:text-[#F4FAF7] transition-colors cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{post.commentsCount} Comments</span>
                    </button>
                  </div>

                  {/* Expandable Comments Drawer */}
                  {expandedCommentsId === post.id && (
                    <div className="pt-3 mt-1 border-t border-[#CBECE2] dark:border-[#27272a] space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a supportive reply..."
                          className="flex-1 py-1.5 px-3 rounded-full bg-[#F8FCFA] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-xs text-[#19332A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#006B56] dark:focus:ring-zinc-400 placeholder:text-[#8EAAA1] dark:placeholder:text-[#789990]"
                        />
                        <button
                          onClick={() => {
                            if (!commentText.trim()) return;
                            const modCheck = checkInappropriateContent(
                              commentText.trim(),
                              "comment reply"
                            );
                            if (modCheck.isInappropriate) {
                              setInappropriateReason(
                                modCheck.reason ||
                                  "Your comment contains inappropriate language or content."
                              );
                              setShowInappropriateModal(true);
                              return;
                            }
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id
                                  ? { ...p, commentsCount: p.commentsCount + 1 }
                                  : p
                              )
                            );
                            setCommentText("");
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-bold cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8EAAA1] dark:text-[#71717A] italic">
                        Replies in Manraah peer circles are guided to ensure kindness, empathy, and emotional safety.
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right / Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Community Guidelines */}
          <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-6 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs space-y-3.5 transition-colors">
            <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-white tracking-wider flex items-center gap-1.5">
              <span>🌿</span> Manraah Agreements
            </h3>
            <div className="space-y-2.5 text-xs text-[#4F685F] dark:text-[#A1A1AA]">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#006B56] dark:text-zinc-200">•</span>
                <p>
                  <strong className="text-[#19332A] dark:text-white">Kindness First:</strong> Listen and respond with gentleness and validation.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#006B56] dark:text-zinc-200">•</span>
                <p>
                  <strong className="text-[#19332A] dark:text-white">Masked Privacy:</strong> Never share personal phone numbers, addresses, or private details.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#006B56] dark:text-zinc-200">•</span>
                <p>
                  <strong className="text-[#19332A] dark:text-white">Shared Strength:</strong> We honor each person&apos;s unique pacing and background.
                </p>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white dark:bg-[#121214] rounded-3xl p-5 sm:p-6 border border-[#CBECE2] dark:border-[#27272a] shadow-2xs space-y-3 transition-colors">
            <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-white tracking-wider">
              Trending Circle Topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                "#MindfulBreathing",
                "#ExamCalm",
                "#WorkLifeBalance",
                "#EveningGratitude",
                "#GroundingTechniques",
                "#SleepHygiene",
                "#SelfCompassion",
              ].map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSearchTerm(topic.replace("#", ""))}
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#E6F4F0] dark:bg-[#18181b] border border-[#CBECE2] dark:border-[#27272a] text-[#006B56] dark:text-zinc-200 hover:bg-[#EAF6F2] dark:hover:bg-[#27272a] transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Urgent Support Note */}
          <div className="bg-gradient-to-br from-[#FFF5F3] to-[#FEF0EC] dark:from-[#2B1B17] dark:to-[#1F1512] rounded-3xl p-5 border border-[#FADCD5] dark:border-[#522F26] space-y-2 text-xs">
            <h4 className="font-bold text-[#B33820] dark:text-[#FFA390] flex items-center gap-1.5">
              <span>❤️</span> Immediate Support
            </h4>
            <p className="text-[#7A3A2C] dark:text-[#E8A596] leading-relaxed text-[11px]">
              If you or someone you know is in acute distress or crisis, reach professional crisis counselors 24/7.
            </p>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-crisis-modal"));
                }
              }}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">emergency</span>
              <span>Open Crisis Support (14416 / 112)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Inappropriate Content Modal Dialog */}
      {showInappropriateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] rounded-3xl border border-red-200 dark:border-red-900/50 shadow-2xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl mx-auto shadow-xs border border-red-200 dark:border-red-900/40">
              <span>🚫</span>
            </div>

            <div className="space-y-2.5">
              <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-[10.5px] font-bold tracking-wider inline-block">
                Community Safety Warning
              </span>
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-white">
                You cannot post this
              </h3>
              <p className="text-xs text-[#4F685F] dark:text-[#E4E4E7] leading-relaxed">
                Manraah peer circles are dedicated safe spaces built on kindness, respect, and mutual support. Inappropriate, offensive, or harmful messages are not allowed.
              </p>
              {inappropriateReason && (
                <div className="p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 text-left">
                  <p className="font-semibold flex items-center gap-1.5 mb-1">
                    <span>⚠️</span> Content Policy Notice:
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {inappropriateReason}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowInappropriateModal(false)}
              className="w-full py-3 rounded-full bg-[#006B56] hover:bg-[#005B48] text-white text-xs font-bold shadow-md shadow-[#006B56]/20 transition-all cursor-pointer"
            >
              I Understand, Edit Message
            </button>
          </div>
        </div>
      )}

      {/* 4. Delete Post Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121214] rounded-3xl border border-[#CBECE2] dark:border-[#27272a] shadow-2xl max-w-md w-full p-6 sm:p-7 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto shadow-xs border border-rose-200 dark:border-rose-900/40">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-heading font-black text-[#19332A] dark:text-white">
                Delete this post?
              </h3>
              <p className="text-xs text-[#4F685F] dark:text-[#A1A1AA] leading-relaxed">
                Are you sure you want to remove &ldquo;{postToDelete.title}&rdquo;? This will permanently delete this post from the community feed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-[#E6F4F0] dark:bg-[#18181b] hover:bg-[#CBECE2] dark:hover:bg-[#27272a] text-[#004D3D] dark:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
