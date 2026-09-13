"use client";

import React, { useState, useEffect } from "react";
import { MOCK_RESOURCES, getCategoryPersonalization } from "@/frontend/lib/mock-data";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getClientSession } from "@/backend/auth/client";

const RESOURCE_CATEGORIES = [
  "All",
  "Articles",
  "Meditation",
  "Sleep",
  "Stress",
  "Relationships",
  "Self-esteem",
  "Saved",
];

const CURATED_RESOURCES = [
  {
    id: "res-1",
    title: "The Art of Slowing Down: Mindful Reset for Busy Minds",
    category: "Stress",
    readTime: "6 min read",
    author: "Dr. Sarah Jenkins",
    summary: "Discover cognitive reframing and tactile somatic resets designed to calm acute work overload and emotional exhaustion.",
    isFeatured: true,
  },
  {
    id: "res-2",
    title: "Neurobiology of Restful Sleep: Non-Sleep Deep Rest (NSDR)",
    category: "Sleep",
    readTime: "8 min read",
    author: "Dr. Ananya Sen",
    summary: "Scientific protocols to switch off rumination before bed and achieve deeper restorative REM sleep cycles.",
    isFeatured: false,
  },
  {
    id: "res-3",
    title: "Navigating Difficult Conversations Without Defensiveness",
    category: "Relationships",
    readTime: "7 min read",
    author: "Dr. Neha Kapoor",
    summary: "Frameworks from non-violent communication to express emotional needs with empathy and clarity.",
    isFeatured: false,
  },
  {
    id: "res-4",
    title: "Uncoupling Perfectionism from Self-Worth in High Performers",
    category: "Self-esteem",
    readTime: "5 min read",
    author: "Dr. Arjun Mehta",
    summary: "Learn how to establish intrinsic motivation and dismantle the harsh inner critic in high-stakes environments.",
    isFeatured: false,
  },
  {
    id: "res-5",
    title: "Daily 5-Minute Micro-Meditation & Breath Anchoring",
    category: "Meditation",
    readTime: "4 min read",
    author: "Dr. Sarah Jenkins",
    summary: "Simple boxed breathing and tactile 5-4-3-2-1 grounding exercises to restore equilibrium anywhere.",
    isFeatured: false,
  },
  {
    id: "res-6",
    title: "Understanding Cognitive Distortions: CBT Starter Toolkit",
    category: "Articles",
    readTime: "9 min read",
    author: "Dr. Ananya Sen",
    summary: "Identify catastrophic thinking, all-or-nothing mindsets, and learn step-by-step cognitive restructuring techniques.",
    isFeatured: false,
  },
];

export default function ResourcesView() {
  const { category } = useCategory();
  const session = getClientSession();
  const resolvedCategory = session?.user?.selectedCategory || category;
  const p = getCategoryPersonalization(resolvedCategory);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>(["res-1", "res-4"]);
  const [readingResource, setReadingResource] = useState<any | null>(null);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredResources = CURATED_RESOURCES.filter((res) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Saved" ? savedIds.includes(res.id) : res.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.author.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredResource = CURATED_RESOURCES.find((r) => r.isFeatured) || CURATED_RESOURCES[0];

  return (
    <div className="w-full min-w-0 flex flex-col gap-5">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-7 border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs space-y-4 transition-colors">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#006C56] dark:text-[#00A982]">
            EVIDENCE-BASED GUIDES
          </span>
          <h1 className="text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight mt-0.5">
            Resources
          </h1>
          <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
            Explore tools and guidance curated for your well-being.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles, CBT guides, sleep science..."
            className="w-full py-2.5 pl-10 pr-4 rounded-full bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#D5E3DB] dark:border-[#23483E] text-xs text-[#19332A] dark:text-[#F4FAF7] focus:outline-none focus:ring-2 focus:ring-[#006C56]/40 placeholder:text-[#8EAAA1]"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#8EAAA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#006C56] dark:bg-[#00A982] text-white dark:text-[#071C17] shadow-xs"
                  : "bg-[#F4F9F6] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#EAF6F0]"
              }`}
            >
              {cat === "Saved" ? `🔖 Saved (${savedIds.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Featured Resource Banner (when on "All" or "Stress" and no search active) */}
      {selectedCategory === "All" && !searchTerm && (
        <div className="bg-gradient-to-br from-[#EAF5EF] to-[#F4F9F6] dark:from-[#102F27] dark:to-[#0A221C] rounded-3xl p-6 sm:p-7 border border-[#D2E8DC] dark:border-[#23483E] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#006C56] text-white text-[9.5px] font-extrabold uppercase tracking-wide">
                Featured Guide
              </span>
              <span className="text-[10.5px] text-[#6B857C] dark:text-[#A9C5BC] font-semibold">
                {featuredResource.readTime}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug">
              {featuredResource.title}
            </h2>
            <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC] leading-relaxed">
              {featuredResource.summary}
            </p>
            <p className="text-[10px] text-[#789389] dark:text-[#78958C] font-bold pt-1">
              By {featuredResource.author}
            </p>
          </div>

          <button
            onClick={() => setReadingResource(featuredResource)}
            className="py-3 px-6 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-md shadow-[#004D3D]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer shrink-0 self-start md:self-auto"
          >
            <span>Read Guide</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      )}

      {/* 3. Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => {
          const isSaved = savedIds.includes(res.id);
          return (
            <div
              key={res.id}
              onClick={() => setReadingResource(res)}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#006C56]/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10px] font-bold">
                    {res.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#789389] dark:text-[#78958C] font-semibold">
                      {res.readTime}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(res.id, e)}
                      className={`p-1 rounded-full text-xs transition-transform hover:scale-120 cursor-pointer ${
                        isSaved ? "text-amber-500" : "text-slate-300 dark:text-slate-600 hover:text-amber-500"
                      }`}
                      title={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
                    >
                      {isSaved ? "★" : "☆"}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug group-hover:text-[#006C56] dark:group-hover:text-[#00A982] transition-colors">
                  {res.title}
                </h3>
                <p className="text-xs text-[#4F685F] dark:text-[#A9C5BC] leading-relaxed line-clamp-3">
                  {res.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2ECE6] dark:border-[#23483E] text-xs">
                <span className="text-[10px] text-[#789389] dark:text-[#78958C] font-medium">
                  By {res.author}
                </span>
                <span className="text-xs font-bold text-[#006C56] dark:text-[#00A982] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Read Guide</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] space-y-2">
          <span className="text-3xl">🔍</span>
          <h3 className="text-sm font-bold text-[#19332A] dark:text-[#F4FAF7]">No guides found</h3>
          <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC]">
            Try adjusting your search terms or selecting a different category.
          </p>
        </div>
      )}

      {/* Reading Modal */}
      {readingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#102F27] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-[#E2ECE6] dark:border-[#23483E] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2ECE6] dark:border-[#23483E]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-[10px] font-bold">
                {readingResource.category} • {readingResource.readTime}
              </span>
              <button
                onClick={() => setReadingResource(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                {readingResource.title}
              </h2>
              <p className="text-xs text-[#789389] dark:text-[#78958C]">
                Authored by {readingResource.author} • Licensed Mental Health Practitioner
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#3E554D] dark:text-[#C5DED5] leading-relaxed">
              <p>
                {readingResource.summary}
              </p>
              <p className="font-semibold text-[#19332A] dark:text-[#F4FAF7]">
                Key Psychoeducation Takeaways:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Recognize automatic catastrophic stress thoughts before they spiral into physical tension.</li>
                <li>Implement 4-second box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s) to reset your vagus nerve.</li>
                <li>Schedule 15 minutes of dedicated "worry time" daily rather than letting concerns disrupt work and sleep.</li>
              </ul>
              <p>
                When practiced consistently, these evidence-based cognitive and somatic techniques help anchor resilience and calm over time.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-between">
              <button
                onClick={(e) => toggleBookmark(readingResource.id, e)}
                className="text-xs font-bold text-[#006C56] dark:text-[#00A982] flex items-center gap-1.5"
              >
                <span>{savedIds.includes(readingResource.id) ? "★ Saved in Bookmarks" : "☆ Save to Bookmarks"}</span>
              </button>
              <button
                onClick={() => setReadingResource(null)}
                className="px-5 py-2.5 rounded-xl bg-[#004D3D] dark:bg-[#00A982] text-white dark:text-[#071C17] text-xs font-bold shadow-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
