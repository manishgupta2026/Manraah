"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/backend/auth/client";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SignupScreen() {
  const router = useRouter();
  const { selectedCategory } = useAssessment();

  const [resolvedCategory, setResolvedCategory] = useState<string>("");
  const [sanctuaryName, setSanctuaryName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromContext = selectedCategory;
    const fromCookie = readCookie("userType");
    const resolved = fromContext || fromCookie || "";
    setResolvedCategory(resolved);
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const session = await signUp(
        sanctuaryName,
        email,
        password,
        resolvedCategory,
        [],
        [],
        0,
        0,
        ""
      );

      document.cookie = "userType=; path=/; max-age=0";

      const categoryRaw = session.user?.selectedCategory || resolvedCategory;
      const targetRoute =
        categoryRaw === "couples" || categoryRaw === "couple"
          ? "/dashboard/couples"
          : categoryRaw === "parents" || categoryRaw === "parent"
          ? "/dashboard/parents"
          : "/dashboard/student";

      router.push(targetRoute);
    } catch (err: any) {
      console.error("Signup server-side error log:", err);
      setError(err.message || "We couldn't create your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8 animate-fadeIn">
      <ScreenHeader title="✨ Join Manraah" showBackButton={true} fallbackRoute="/" />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl gradient-primary mx-auto flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">spa</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-on-surface leading-tight">
            Your Personalized Wellness Journey is Ready
          </h1>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Create your account to unlock your personalized dashboard.
          </p>
        </div>

        {/* Status checklist */}
        <div className="flex flex-col items-start gap-2.5 py-4 px-6 rounded-2xl bg-primary-container/10 border border-primary/10 max-w-xs mx-auto text-left">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-emerald-500 font-bold text-lg">check_circle</span>
            <span className="text-xs font-semibold">✓ Category Selected</span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-emerald-500 font-bold text-lg">check_circle</span>
            <span className="text-xs font-semibold">✓ Wellness Profile Ready</span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-emerald-500 font-bold text-lg">check_circle</span>
            <span className="text-xs font-semibold">✓ AI Companion Ready</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-5">
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
            className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface"
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
            className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-105"
        >
          {loading ? "Unlocking Sanctuary..." : "Unlock My Dashboard →"}
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
