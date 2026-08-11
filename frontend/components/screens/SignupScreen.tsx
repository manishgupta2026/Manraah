"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/backend/auth/client";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { getCategoryJourneyBadge } from "@/frontend/lib/constants";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function SignupScreen() {
  const router = useRouter();
  const { selectedCategory } = useAssessment();
  const { category: contextCategory } = useCategory();

  const activeCategory = selectedCategory || contextCategory || "student";

  // Guard: if no category is selected, prompt user to choose a category first
  useEffect(() => {
    if (!selectedCategory && !contextCategory) {
      router.push("/category-selection");
    }
  }, [selectedCategory, contextCategory, router]);

  const [sanctuaryName, setSanctuaryName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    let initialAnswers = null;
    try {
      const stored = localStorage.getItem("manraah_initial_answers");
      if (stored) {
        initialAnswers = JSON.parse(stored);
      }
    } catch {
      initialAnswers = null;
    }

    try {
      // Create user account with permanent category and initial answers
      await signUp(
        sanctuaryName,
        email.trim(),
        password,
        activeCategory,
        initialAnswers
      );

      // Navigate directly to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "We couldn't create your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8 animate-fadeIn">
      <ScreenHeader
        title="✨ Create Sanctuary Account"
        showBackButton={true}
        fallbackRoute="/category-selection"
        onBack={() => router.push("/category-selection")}
      />

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center text-primary shadow-xs">
          <span className="material-symbols-outlined text-2xl font-bold">spa</span>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-heading font-bold text-on-surface leading-tight">
            Welcome to Your Sanctuary
          </h1>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Create your anonymous sanctuary account to begin your journey.
          </p>
        </div>

        {/* Selected Category Read-Only Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-heading font-bold text-primary shadow-xs">
          <span>{getCategoryJourneyBadge(activeCategory)}</span>
          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-semibold">
            (Permanent)
          </span>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-5"
      >
        {error && (
          <div className="p-4 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-heading font-bold text-on-surface">
            Sanctuary Name <span className="text-on-surface-variant/60 font-medium">(Optional)</span>
          </label>
          <input
            type="text"
            value={sanctuaryName}
            onChange={(e) => setSanctuaryName(e.target.value)}
            placeholder="e.g. Gentle Bloom"
            className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold text-on-surface"
          />
          <p className="text-[10px] text-on-surface-variant/70 leading-normal mt-1">
            Leave blank to automatically receive a peaceful name. We never ask for your real name.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-heading font-bold text-on-surface">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aanya@example.com"
            className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-heading font-bold text-on-surface">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-primary hover:bg-[#7C6BC4] text-white font-heading font-bold text-sm shadow-[0_10px_25px_rgba(95,78,165,0.25)] hover:shadow-[0_12px_30px_rgba(95,78,165,0.35)] transition-all hover:-translate-y-0.5 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {loading ? "Creating Sanctuary..." : "Enter My Sanctuary →"}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
