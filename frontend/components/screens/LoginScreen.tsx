"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/backend/auth/client";
import { FormInput } from "@/frontend/components/ui/FormInput";
import { motion } from "framer-motion";
import Logo from "@/frontend/components/ui/Logo";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";

export default function LoginScreen() {
  const router = useRouter();
  const { selectedCategory, detailedAnswers, computedScore, assessmentResult } = useAssessment();
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
      const session = await signIn(
        email,
        password,
        selectedCategory || "",
        detailedAnswers || [],
        computedScore || 0,
        assessmentResult?.percentage || computedScore || 0,
        assessmentResult?.wellnessLevel || ""
      );

      // Clear userType temporary cookies
      document.cookie = "userType=; path=/; max-age=0";
      document.cookie = "manraah_userType=; path=/; max-age=0";

      const categoryRaw = session.user?.selectedCategory || "";
      let targetRoute = getCategoryDashboardRoute(categoryRaw);

      router.push(targetRoute);
    } catch (err: any) {
      console.error("Login authentication error:", err);
      setError("We couldn't find an account matching those credentials. Please check your email and password and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-12 select-none">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT PANEL (Desktop): Illustration + Reassurance Banner */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6"
        >
          {/* Brand header */}
          <Link href="/" className="inline-flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <Logo size="lg" priority className="h-10 sm:h-12" />
          </Link>

          <div className="space-y-3 max-w-md">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-heading font-bold bg-primary-container/15 text-primary border border-primary/20 uppercase tracking-widest inline-block">
              🌿 Welcome Back
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight leading-tight">
              Your Private Space is Always Here for You
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed font-normal">
              Step inside to access your personalized wellness score, active AI companion, guided journals, and peer listening sanctuary.
            </p>
          </div>

          {/* SVG Illustration Banner */}
          <div className="w-full max-w-[320px] sm:max-w-[380px] py-2">
            <svg viewBox="0 0 400 260" className="w-full h-auto drop-shadow-md">
              <defs>
                <linearGradient id="loginSky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F2EEFC" />
                  <stop offset="100%" stopColor="#FAF9FC" />
                </linearGradient>
                <linearGradient id="loginMtn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C6BC4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#5F4EA5" stopOpacity="0.85" />
                </linearGradient>
              </defs>

              <rect width="400" height="260" rx="24" fill="url(#loginSky)" />
              <circle cx="320" cy="80" r="28" fill="#F5C99B" opacity="0.8" />
              <path d="M 40 260 L 160 140 L 280 260 Z" fill="url(#loginMtn)" />
              <path d="M 160 260 L 270 110 L 380 260 Z" fill="#2E2A3D" opacity="0.75" />
              <ellipse cx="200" cy="245" rx="140" ry="15" fill="#5FCFB0" opacity="0.3" />

              {/* Floating Lotus */}
              <g transform="translate(170, 190) scale(0.7)">
                <path d="M 50 80 C 10 70, 0 40, 50 10 C 60 40, 50 70, 50 80 Z" fill="#F4A6B8" opacity="0.85" />
                <path d="M 50 80 C 90 70, 100 40, 50 10 C 60 40, 50 70, 50 80 Z" fill="#F4A6B8" opacity="0.85" />
                <path d="M 50 80 C 25 50, 25 20, 50 0 C 75 20, 75 50, 50 80 Z" fill="#7C6BC4" opacity="0.95" />
              </g>
            </svg>
          </div>

          {/* Reassurance Badges */}
          <div className="hidden sm:flex items-center gap-6 text-xs text-on-surface-variant font-medium pt-2">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">lock</span>
              <span>100% Encrypted</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-mint text-base">visibility_off</span>
              <span>Anonymous Identity</span>
            </span>
          </div>
        </motion.div>

        {/* RIGHT PANEL: Login Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          <div className="p-8 sm:p-10 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-6">
            <div className="space-y-1 text-left">
              <h3 className="text-2xl font-heading font-extrabold text-on-surface">
                Log In to Your Account
              </h3>
              <p className="text-xs text-on-surface-variant font-normal">
                Enter your registered credentials below to access your sanctuary.
              </p>
            </div>

            {/* Error Callout */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 flex items-start gap-2.5"
              >
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                required
                icon="mail"
                placeholder="aanya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <FormInput
                  label="Password"
                  isPassword={true}
                  required
                  icon="key"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <div className="flex justify-end pt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-heading font-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to Sanctuary</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom link to Signup */}
            <div className="text-center pt-2 border-t border-surface-variant/20">
              <p className="text-xs text-on-surface-variant font-normal">
                Don&apos;t have an account yet?{" "}
                <Link href="/signup" className="font-heading font-bold text-primary hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
