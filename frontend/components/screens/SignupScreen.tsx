"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/backend/auth/client";
import { saveUserAssessment } from "@/backend/queries/assessment";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";

export default function SignupScreen() {
  const router = useRouter();
  const { selectedCategory, detailedAnswers, totalScore, percentage, wellnessLevel } = useAssessment();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // 1. Create account via Neon Auth helper
      const session = await signUp(name, email, password);

      // 2. Persist onboarding category, detailed answers, and score details to Neon DB
      if (session.user) {
        await saveUserAssessment(
          session.user.id,
          selectedCategory || "student",
          detailedAnswers,
          totalScore,
          percentage,
          wellnessLevel
        );
      }

      // 3. Navigate to personalized dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl gradient-primary mx-auto flex items-center justify-center text-white shadow-md">
          <span className="material-symbols-outlined text-2xl">spa</span>
        </div>
        <h1 className="text-3xl font-heading font-bold text-on-surface">Create Your Sanctuary Account</h1>
        <p className="text-xs text-on-surface-variant">Your wellness data will remain 100% confidential and encrypted.</p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-surface-container-lowest border border-surface-variant/30 shadow-soft space-y-5">
        {error && (
          <div className="p-4 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-2xl">
            {error}
          </div>
        )}
        <div className="space-y-1.5">
          <label className="block text-xs font-heading font-bold text-on-surface">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Aanya Sharma"
            className="w-full p-3.5 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
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
          className="w-full py-4 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple transition-all scale-105"
        >
          {loading ? "Creating Account..." : "Complete Registration →"}
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
