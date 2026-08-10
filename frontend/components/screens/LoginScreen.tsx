"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/backend/auth/client";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function LoginScreen() {
  const router = useRouter();
  const { selectedCategory, detailedAnswers, totalScore, percentage, wellnessLevel } = useAssessment();

  // Resolve userType: React Context (same session) OR cookie (cross-navigation fallback)
  const [resolvedCategory, setResolvedCategory] = useState<string>("student");

  useEffect(() => {
    const fromContext = selectedCategory;
    const fromCookie = readCookie("userType");
    const resolved = fromContext || fromCookie || "student";
    setResolvedCategory(resolved);
    console.log("[Trace Point 2] Before login: userType =", resolved);
  }, [selectedCategory]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);
    try {
      console.log("[Login] [POINT 3 — after login] Sending category to API:", resolvedCategory);

      const session = await signIn(email, password, resolvedCategory, detailedAnswers, totalScore, percentage, wellnessLevel);

      // Clear userType cookie
      document.cookie = "userType=; path=/; max-age=0";
      document.cookie = "manraah_userType=; path=/; max-age=0";

      const categoryRaw = session.user?.selectedCategory || resolvedCategory;
      const targetUserType = categoryRaw === "couples" || categoryRaw === "couple" ? "couples" : (categoryRaw === "parents" || categoryRaw === "parent" ? "parents" : "");

      if (targetUserType) {
        console.log("[Trace Point 3] After login: userType =", targetUserType);
        router.push(`/dashboard/${targetUserType}`);
      } else {
        console.log("[Trace Point 3] After login: no category, redirecting to /category-selection");
        router.push("/category-selection");
      }
    } catch (err: any) {
      console.error("Login server-side error log:", err);
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8 animate-fadeIn">
      <ScreenHeader title="🔑 Sign In" showBackButton={true} fallbackRoute="/" />
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl gradient-primary mx-auto flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">spa</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Welcome Back to Manraah</h1>
        <p className="text-xs text-on-surface-variant">Sign in to access your sanctuary dashboard and AI companion.</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-5">
        {error && (
          <div className="p-4 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
            {error}
          </div>
        )}
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
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-105"
        >
          {loading ? "Signing In..." : "Log In to Sanctuary →"}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs text-on-surface-variant">
            Don't have an account yet?{" "}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
