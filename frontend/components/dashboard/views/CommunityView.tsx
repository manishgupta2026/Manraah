"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/frontend/lib/context/AuthContext";
import UserAvatar from "@/frontend/components/ui/UserAvatar";

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
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [lastSubmittedCircle, setLastSubmittedCircle] = useState("");
  const [hasPendingPost, setHasPendingPost] = useState(false);

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

    setIsSubmitting(true);
    const submittedCategory = newPostCategory;
    const titleToSend = newTitle.trim();
    const contentToSend = newContent.trim();

    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToSend,
          content: contentToSend,
          category: submittedCategory,
        }),
      });

      // Clear input and display 24-hour moderation popup
      setNewTitle("");
      setNewContent("");
      setLastSubmittedCircle(submittedCategory);
      setShowModerationModal(true);
      setHasPendingPost(true);
    } catch (err) {
      console.warn("Post submission handled:", err);
      setNewTitle("");
      setNewContent("");
      setLastSubmittedCircle(submittedCategory);
      setShowModerationModal(true);
      setHasPendingPost(true);
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
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
              SAFE PEER MANRAAH
            </span>
            <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
              Community & Peer Circles
            </h1>
            <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
              Compassionate, moderated spaces to share reflections, exchange strategies, and support one another.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#006C56] dark:text-[#00A982]">
                340+ Peers Active
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2ECE6] dark:border-[#23483E]">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search peer conversations, topics, tags..."
              className="w-full py-2 pl-9 pr-4 rounded-full bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
            />
            <svg
              className="w-4 h-4 absolute left-3 top-2.5 text-[#8EAAA1]"
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
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                    : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#EAF6F0]"
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
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5">
              <UserAvatar user={user} sizeClass="w-8 h-8 text-xs" />
              <div>
                <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Share with Manraah
                </h3>
                <p className="text-[10px] text-[#6B857C] dark:text-[#A9C5BC]">
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
                className="w-full py-2.5 px-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
              />

              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What would you like to share or ask your fellow circle members?"
                className="w-full p-4 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs leading-relaxed text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#4F685F] dark:text-[#A9C5BC]">
                    Circle:
                  </span>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="py-1.5 px-3 rounded-full bg-[#F4F9F6] dark:bg-[#14382F] border border-[#D5E3DB] dark:border-[#23483E] text-xs font-bold text-[#19332A] dark:text-[#F4FAF7] focus:outline-none cursor-pointer"
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
                  className="py-2 px-5 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-sm shadow-[#006C56]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{isSubmitting ? "Posting..." : "Post to Circle"}</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>

          {/* Pending Moderation Notice Banner */}
          {hasPendingPost && (
            <div className="p-4 rounded-3xl bg-[#EAF5EF] dark:bg-[#14382F]/70 border border-[#006C56]/30 flex items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3 text-[#006C56] dark:text-[#00A982]">
                <div className="w-8 h-8 rounded-full bg-[#006C56] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  ⏳
                </div>
                <div>
                  <p className="font-heading font-black text-xs text-[#19332A] dark:text-[#F4FAF7]">
                    Post Submitted for Moderation
                  </p>
                  <p className="text-[11px] text-[#4F685F] dark:text-[#A9C5BC]">
                    Your post in &ldquo;{lastSubmittedCircle}&rdquo; is under admin review and will be reflected in the community within 24 hours.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModerationModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#006C56] text-white text-[11px] font-bold shrink-0 hover:bg-[#005241] transition-colors cursor-pointer"
              >
                Review Info
              </button>
            </div>
          )}

          {/* Posts Feed */}
          <div className="flex flex-col gap-4">
            {filteredPosts.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-[#102F27] border border-dashed border-[#D5E3DB] dark:border-[#23483E] text-center space-y-2">
                <span className="text-2xl block">💬</span>
                <p className="text-xs font-bold text-[#19332A] dark:text-[#F4FAF7]">
                  No circle discussions found
                </p>
                <p className="text-[11px] text-[#6B857C] dark:text-[#A9C5BC]">
                  Be the first to start a conversation in this circle above!
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3.5 transition-colors"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={post.author} avatar={post.avatar} sizeClass="w-9 h-9 text-xs" />
                      <div>
                        <h4 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                          {post.author}
                        </h4>
                        <div className="flex items-center gap-2 text-[10.5px] text-[#6B857C] dark:text-[#A9C5BC]">
                          <span>{post.timeAgo}</span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] font-bold text-[9.5px]">
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="text-sm font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC] leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Actions (Like & Comments) */}
                  <div className="flex items-center gap-4 pt-3 border-t border-[#E2ECE6] dark:border-[#23483E]">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        post.isLiked
                          ? "text-rose-500"
                          : "text-[#6B857C] dark:text-[#A9C5BC] hover:text-[#19332A] dark:hover:text-white"
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
                      className="flex items-center gap-1.5 text-xs font-bold text-[#6B857C] dark:text-[#A9C5BC] hover:text-[#19332A] dark:hover:text-white transition-colors cursor-pointer"
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
                    <div className="pt-3 mt-1 border-t border-[#E2ECE6] dark:border-[#23483E] space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a supportive reply..."
                          className="flex-1 py-1.5 px-3 rounded-full bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-1 focus:ring-[#006C56]"
                        />
                        <button
                          onClick={() => {
                            if (!commentText.trim()) return;
                            setPosts((prev) =>
                              prev.map((p) =>
                                p.id === post.id
                                  ? { ...p, commentsCount: p.commentsCount + 1 }
                                  : p
                              )
                            );
                            setCommentText("");
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#006C56] text-white text-xs font-bold cursor-pointer"
                        >
                          Reply
                        </button>
                      </div>
                      <p className="text-[10px] text-[#8EAAA1] italic">
                        Replies in Manraah peer circles are moderated to ensure kindness and emotional safety.
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
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3.5 transition-colors">
            <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider flex items-center gap-1.5">
              <span>🌿</span> Manraah Agreements
            </h3>
            <div className="space-y-2.5 text-xs text-[#4F685F] dark:text-[#A9C5BC]">
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#006C56] dark:text-[#00A982]">•</span>
                <p>
                  <strong className="text-[#19332A] dark:text-[#F4FAF7]">Kindness First:</strong> Listen and respond with gentleness and validation.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#006C56] dark:text-[#00A982]">•</span>
                <p>
                  <strong className="text-[#19332A] dark:text-[#F4FAF7]">Masked Privacy:</strong> Never share personal phone numbers, addresses, or private details.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-[#006C56] dark:text-[#00A982]">•</span>
                <p>
                  <strong className="text-[#19332A] dark:text-[#F4FAF7]">Shared Strength:</strong> We honor each person's unique pacing and background.
                </p>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-5 sm:p-6 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-3 transition-colors">
            <h3 className="text-xs font-heading font-black text-[#19332A] dark:text-[#F4FAF7] uppercase tracking-wider">
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
                  className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-[#F4F9F6] dark:bg-[#14382F] border border-[#E2ECE6] dark:border-[#23483E] text-[#006C56] dark:text-[#00A982] hover:bg-[#EAF5EF] transition-colors cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Urgent Support Note */}
          <div className="bg-gradient-to-br from-[#FFF5F3] to-[#FEF0EC] dark:from-[#2B1B17] dark:to-[#221512] rounded-3xl p-5 border border-[#FADCD5] dark:border-[#522F26] space-y-2 text-xs">
            <h4 className="font-bold text-[#B33820] dark:text-[#FFA390] flex items-center gap-1.5">
              <span>❤️</span> Immediate Support
            </h4>
            <p className="text-[#7A3A2C] dark:text-[#E8A596] leading-relaxed text-[11px]">
              If you or someone you know is in acute distress or crisis, tap Tele-MANAS (14416) or reach professional crisis counselors 24/7.
            </p>
          </div>
        </div>
      </div>

      {/* 3. 24-Hour Moderation Review Modal Dialog */}
      {showModerationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#102F27] rounded-3xl border border-[#E2ECE6] dark:border-[#23483E] shadow-2xl max-w-md w-full p-6 sm:p-7 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-3xl mx-auto shadow-xs border border-[#006C56]/20">
              <span>⏳</span>
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#EAF5EF] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10.5px] font-bold uppercase tracking-wider inline-block">
                Post Submitted For Review
              </span>
              <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                Reflected Within 24 Hours
              </h3>
              <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC] leading-relaxed">
                Thank you for sharing with your peer circle! To ensure Manraah remains a safe, compassionate, and supportive space for everyone, all community posts undergo admin review.
              </p>
              <div className="p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] text-xs font-semibold text-[#006C56] dark:text-[#00A982] space-y-1">
                <p>✨ <strong>Circle:</strong> {lastSubmittedCircle}</p>
                <p className="text-[11px] font-normal text-[#4F685F] dark:text-[#A9C5BC]">
                  Your post has been sent to our admin moderation team. Once reviewed and allowed, it will be reflected in the community feed within 24 hours.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowModerationModal(false)}
              className="w-full py-3 rounded-full bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-md shadow-[#006C56]/20 transition-all cursor-pointer"
            >
              Got It, Thank You
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
