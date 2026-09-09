"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BottomCtaBand from "@/frontend/components/ui/BottomCtaBand";

interface BlogPost {
  id: string;
  title: string;
  category: string;
  categoryStyle: string;
  readTime: string;
  date: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  excerpt: string;
  featured?: boolean;
  content: string[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: "neuroscience-of-calm",
    title: "The Neuroscience of Calm: Why 3-Minute Breathing Resets Break the Cortisol Loop",
    category: "Mindfulness & Science",
    categoryStyle: "bg-mint/20 text-[#006B56] border-mint/30",
    readTime: "6 min read",
    date: "Sep 8, 2026",
    featured: true,
    author: {
      name: "Dr. Ananya Sharma",
      role: "Lead Clinical Neuropsychologist",
      avatar: "🧠",
    },
    excerpt:
      "When anxiety spikes, your sympathetic nervous system initiates a cascade of adrenaline and cortisol. Discover how physiological sighs and vagus nerve stimulation can physically halt acute panic in under 180 seconds.",
    content: [
      "In moments of high cognitive friction or acute overwhelm, our brains default to ancient survival mechanisms. The amygdala sounds an alarm, directing the pituitary gland and adrenal cortex to flood the bloodstream with stress hormones.",
      "Most mindfulness advice suggests 'taking a deep breath' — but clinical neurobiology reveals that the *ratio* of inhalation to exhalation is what actually matters. An extended exhale stimulates the vagus nerve, slowing down sinoatrial node firing in the heart and signaling physiological safety to the brainstem.",
      "At Manraah, our 3-minute guided audio resets are specifically engineered around the physiological sigh: a double inhalation followed by a prolonged, unforced exhale through the mouth. Clinical trials indicate that just two repetitions can decrease autonomic arousal by up to 34%.",
      "Next time your heart races before an academic exam or executive presentation, take two quick breaths through the nose, then let out a slow, long sigh. Notice the rapid drop in muscular tension.",
    ],
  },
  {
    id: "breaking-perfectionism-loop",
    title: "Breaking the Perfectionism Loop: A CBT Reframing Guide for University Students",
    category: "Academic & Career",
    categoryStyle: "bg-primary/10 text-primary border-primary/20",
    readTime: "5 min read",
    date: "Sep 5, 2026",
    author: {
      name: "Rohan Varma, M.Sc.",
      role: "Student Behavioral Counselor",
      avatar: "🎓",
    },
    excerpt:
      "Perfectionism isn't striving for excellence — it's fear of inadequacy masquerading as high standards. Learn structured cognitive behavioral therapy prompts to decouple your self-worth from academic metrics.",
    content: [
      "Students often fall into the trap of 'all-or-nothing' cognitive distortion: if an assignment isn't flawless, it feels like an outright failure. This mindset breeds chronic procrastination, because delaying the task delays confronting potential imperfection.",
      "Cognitive reframing begins with identifying automatic thoughts. When you notice yourself thinking 'I must get the top grade or I'm incompetent,' actively pause and formulate a balanced reframe: 'My performance on this assignment reflects current effort, not my inherent worth.'",
      "Using the Manraah Academic Journal, students practice the 'Good Enough Metric' — deliberately submitting projects at 85% perfection to desensitize themselves to catastrophic thinking. Over time, anxiety drops and overall output quality actually rises.",
    ],
  },
  {
    id: "post-work-decompression",
    title: "The Post-Work Decompression Ritual: How to Mentally Disconnect After 6 PM",
    category: "Academic & Career",
    categoryStyle: "bg-primary/10 text-primary border-primary/20",
    readTime: "4 min read",
    date: "Sep 2, 2026",
    author: {
      name: "Priya Nair",
      role: "Workplace Wellness Specialist",
      avatar: "💼",
    },
    excerpt:
      "Working remotely or in high-pressure offices blurs the boundary between career and personal sanctuary. Here is a 5-step psychological threshold ritual to leave work at work.",
    content: [
      "Without a physical commute or a clear psychological delimiter, professional stressors seep into dinner, family time, and evening rest. The human brain needs a definitive signal that the workday has concluded.",
      "Start by closing all open browser tabs and writing tomorrow's top three priorities on paper. This externalizes unfinished business and eliminates the Zeigarnik effect (the brain's tendency to obsess over incomplete tasks).",
      "Next, change your clothes and wash your face with cool water. Physical transition cues the autonomic nervous system to shift from high-vigilance sympathetic mode into restorative parasympathetic relaxation.",
    ],
  },
  {
    id: "gentle-parenting-guilt",
    title: "Why Compassionate Parenting Starts with De-escalating Parental Guilt",
    category: "Parenting",
    categoryStyle: "bg-peach/30 text-[#9E5D28] border-peach/40",
    readTime: "7 min read",
    date: "Aug 29, 2026",
    author: {
      name: "Meera Sen, Ph.D.",
      role: "Family Systems Therapist",
      avatar: "🍼",
    },
    excerpt:
      "Caregiver burnout is heavily fueled by unrealistic social media parenting standards. Explore why emotional repair matters far more than never losing your patience.",
    content: [
      "No parent is calm 100% of the time. Chronic feelings of parental guilt deplete the emotional reserves you need to respond gently during moments of household friction.",
      "Child development research shows that secure attachment does not require perfection; it requires predictable 'rupture and repair.' When you react with impatience, returning later with an honest apology teaches children that emotional ruptures can be healed safely.",
      "Give yourself permission to take a 2-minute timeout before responding. A regulated parent is the most powerful soothing tool a distressed child can experience.",
    ],
  },
  {
    id: "active-listening-couples",
    title: "Active Listening in Relationships: 4 Micro-Habits That Defuse Everyday Arguments",
    category: "Relationships",
    categoryStyle: "bg-pink/30 text-[#874959] border-pink/40",
    readTime: "5 min read",
    date: "Aug 24, 2026",
    author: {
      name: "Kabir & Tara Joshi",
      role: "Couples Communication Facilitators",
      avatar: "💖",
    },
    excerpt:
      "Most couples don't listen to understand — they listen to defend. Practice the mirror reflection technique to convert defensiveness into mutual emotional intimacy.",
    content: [
      "During heated discussions, physiological pulse rates often surpass 100 BPM, entering a state known as 'diffuse physiological arousal.' At this threshold, cognitive flexibility collapses and we perceive our partner as an adversary.",
      "The simplest antidote is reflective validation: repeating what you heard your partner say before stating your own counterpoint. Phrases like 'What I'm hearing is that you felt unsupported when I arrived late — is that right?' instantly disarm defensiveness.",
      "Schedule a 10-minute weekly harmony check-in with our guided Couples Check-in prompt to celebrate small mutual appreciations before minor irritations snowball.",
    ],
  },
  {
    id: "binaural-soundscapes-focus",
    title: "Binaural Audio & Alpha Brainwaves: The Science Behind Soundscape Focus",
    category: "Mindfulness & Science",
    categoryStyle: "bg-mint/20 text-[#006B56] border-mint/30",
    readTime: "6 min read",
    date: "Aug 18, 2026",
    author: {
      name: "Arjun Mehta",
      role: "Psychoacoustics Audio Engineer",
      avatar: "🎧",
    },
    excerpt:
      "How delivering slightly different frequencies to each ear synchronizes neural oscillations, deepening meditative calm and sustained study concentration.",
    content: [
      "When a tone of 200 Hz is played in the left ear and 210 Hz in the right ear, the brain's superior olivary complex reconciles the difference, creating an internal 10 Hz frequency illusion known as a binaural beat.",
      "10 Hz sits directly within the alpha brainwave band (8–12 Hz), which corresponds to relaxed, alert focus — the ideal state for deep work, study, and anxious de-escalation.",
      "Manraah's soundscape library pairs scientific binaural carrier waves with natural ambient textures like forest rain and Himalayan singing bowls to minimize cognitive fatigue during prolonged sessions.",
    ],
  },
  {
    id: "imposter-syndrome-first-job",
    title: "Navigating Imposter Syndrome at Your First Corporate Job",
    category: "Anxiety & Stress",
    categoryStyle: "bg-[#7C6BC4]/20 text-[#5F4EA5] border-[#7C6BC4]/30",
    readTime: "4 min read",
    date: "Aug 12, 2026",
    author: {
      name: "Sunita Roy",
      role: "Career Mental Health Advisor",
      avatar: "✨",
    },
    excerpt:
      "Feeling like you don't belong is a common consequence of entering a new environment, not evidence of incompetence. Here is how to build evidence-based self-efficacy.",
    content: [
      "Imposter syndrome thrives in ambiguous environments where feedback is sporadic. Beginners mistakenly assume everyone else has everything figured out, comparing their messy internal thoughts to others' curated exteriors.",
      "Keep a weekly 'Wins & Learnings' log. Recording concrete milestones counteracts the brain's negativity bias and provides empirical proof of your growing competency.",
      "Remember: you were hired for your potential to solve future problems, not because you already knew every answer on day one.",
    ],
  },
];

const CATEGORIES = [
  "All",
  "Mindfulness & Science",
  "Academic & Career",
  "Parenting",
  "Relationships",
  "Anxiety & Stress",
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* ═══ 1. HERO HEADER ═══ */}
      <section className="relative pt-14 pb-12 md:pt-20 md:pb-16 px-6 max-w-5xl mx-auto text-center space-y-6">
        {/* Glows */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-peach/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-heading font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>RESEARCH &bull; INSIGHTS &bull; DAILY MINDFULNESS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black text-on-surface tracking-tight leading-[1.12]">
          The Manraah{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#5F4EA5] to-mint">
            Wellness Journal
          </span>
        </h1>

        <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          Evidence-backed psychology, clinical insights, guided reflection practices, and life-stage perspectives to nurture your mental clarity.
        </p>

        {/* Search Input */}
        <div className="max-w-md mx-auto pt-2">
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-variant/40 rounded-full px-4 py-2.5 shadow-sm focus-within:border-primary/40 transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, prompts, topics..."
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-on-surface-variant hover:text-on-surface text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 2. CATEGORY FILTER CHIPS ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-heading font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-sm scale-105"
                    : "bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant border border-surface-variant/40"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* ═══ 3. FEATURED SPOTLIGHT ARTICLE (When 'All' selected and no search) ═══ */}
      {selectedCategory === "All" && !searchQuery && (
        <section className="px-6 max-w-6xl mx-auto pb-12">
          <div
            onClick={() => setActiveArticle(featuredPost)}
            className="group rounded-[32px] bg-surface-container-lowest border border-surface-variant/40 shadow-card-lift p-8 sm:p-12 hover:border-primary/40 transition-all duration-300 cursor-pointer text-left space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-primary text-white shadow-xs">
                  ⭐ FEATURED STORY
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-heading font-bold ${featuredPost.categoryStyle}`}>
                  {featuredPost.category}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                {featuredPost.readTime} &bull; {featuredPost.date}
              </span>
            </div>

            <div className="space-y-3 max-w-4xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center text-lg">
                  {featuredPost.author.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold text-on-surface">
                    {featuredPost.author.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    {featuredPost.author.role}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-primary group-hover:translate-x-1 transition-transform">
                <span>Read Full Article</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ 4. ARTICLES DEMO STACK GRID ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-16">
        {filteredPosts.length === 0 ? (
          <div className="p-12 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">search_off</span>
            <h3 className="font-heading font-bold text-lg text-on-surface">No articles found</h3>
            <p className="text-xs text-on-surface-variant">Try selecting a different category or clearing your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setActiveArticle(post)}
                className="group p-6 sm:p-7 rounded-[28px] bg-surface-container-lowest border border-surface-variant/40 shadow-xs hover:shadow-card-lift hover:border-primary/40 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-heading font-extrabold ${post.categoryStyle}`}>
                      {post.category}
                    </span>
                    <span className="text-[11px] text-on-surface-variant/80 font-medium">
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 font-normal">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-surface-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-sm">
                      {post.author.avatar}
                    </div>
                    <div>
                      <p className="text-[11px] font-heading font-bold text-on-surface leading-tight">
                        {post.author.name}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/70">
                        {post.date}
                      </p>
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-base text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ═══ 5. NEWSLETTER SUBSCRIPTION ═══ */}
      <section className="px-6 max-w-6xl mx-auto pb-16">
        <div className="p-8 sm:p-12 rounded-[32px] bg-[#F2EBFF]/50 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-primary/10 text-primary uppercase tracking-wider">
              Sunday Stillness Dispatch
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
              Weekly Neuroscience &amp; Reflection Prompts
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Join 12,000+ individuals receiving one clinical insight, one guided CBT prompt, and one curated soundscape every Sunday morning.
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0">
            {subscribed ? (
              <div className="px-6 py-3 rounded-full bg-mint/20 border border-mint/40 text-[#006B56] text-xs font-heading font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Subscribed! Check your inbox this Sunday.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your personal email..."
                  required
                  className="w-full sm:w-64 px-4 py-3 rounded-full bg-surface-container-lowest border border-surface-variant/40 text-xs text-on-surface outline-none focus:border-primary/40 shadow-xs"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Join Free
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══ 6. INTERACTIVE DEMO ARTICLE MODAL ═══ */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-[32px] border border-surface-variant/40 shadow-2xl p-6 sm:p-10 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-surface-variant/20 pb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-heading font-extrabold ${activeArticle.categoryStyle}`}>
                  {activeArticle.category}
                </span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant/60 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-on-surface-variant font-medium">
                  {activeArticle.readTime} &bull; Published {activeArticle.date}
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-on-surface leading-snug">
                  {activeArticle.title}
                </h2>
              </div>

              {/* Author badge */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-container-low/60 border border-surface-variant/30">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-xs">
                  {activeArticle.author.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold text-on-surface">
                    {activeArticle.author.name}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant">
                    {activeArticle.author.role}
                  </p>
                </div>
              </div>

              {/* Article Content */}
              <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-normal">
                {activeArticle.content.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="pt-4 border-t border-surface-variant/20 flex items-center justify-between">
                <p className="text-[11px] text-on-surface-variant/70">
                  Demo article from the Manraah Editorial Team.
                </p>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 rounded-full bg-primary text-white text-xs font-heading font-bold shadow-xs hover:bg-primary-purple transition-all"
                >
                  Done Reading
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ 7. BOTTOM CTA BANNER ═══ */}
      <BottomCtaBand
        title="Turn Knowledge Into Daily Practice"
        description="Experience guided check-ins, tailored reflection prompts, and soundscapes based on the latest mental wellness research."
        buttonText="Explore How It Works"
        buttonHref="/how-it-works"
      />
    </div>
  );
}
