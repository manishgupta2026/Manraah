"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/backend/auth/client";
import { FormInput } from "@/frontend/components/ui/FormInput";
import { motion } from "framer-motion";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";

export default function LoginScreen() {
  const router = useRouter();
  const { selectedCategory, detailedAnswers, computedScore, assessmentResult } = useAssessment();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const session = await signIn(
        email.trim().toLowerCase(),
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
      const targetRoute = getCategoryDashboardRoute(categoryRaw);

      router.push(targetRoute);
    } catch (err: any) {
      console.error("Login authentication error:", err);
      setError(
        err.message ||
          "We couldn't find an account matching those credentials. Please check your email and password and try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-surface via-[#FAF7FF] to-[#F2FAF7] flex flex-col justify-center py-6 sm:py-10 px-4 sm:px-6 lg:px-12 select-none relative overflow-x-hidden">
      
      {/* Ambient background auras */}
      <div className="absolute top-1/4 left-1/6 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] bg-primary/8 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/6 translate-x-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-mint/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-3/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-peach/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
        
        {/* ========================================================= */}
        {/* DESKTOP LEFT / HERO COLUMN                                */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:col-span-5 flex-col space-y-6"
        >
          {/* Welcome Badge with pulsing indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-surface-container-low border border-primary/20 shadow-xs w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-heading font-bold text-primary">
              WELCOME BACK • MANRAAH
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-heading font-black text-on-surface tracking-tight leading-snug">
              Your Private Space for Inner Calm &amp; Growth
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Step inside to access your personalized wellness tools, active companion conversations, reflective journals, and compassionate community.
            </p>
          </div>

          {/* 3 Value Pillars */}
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/75 dark:bg-surface-container-low/75 border border-surface-variant/40 shadow-ambient flex items-start gap-3.5 transition-all hover:bg-white hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">encrypted</span>
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-heading font-bold text-on-surface">
                  100% Encrypted &amp; Confidential
                </h4>
                <p className="text-[12px] text-on-surface-variant/80 leading-relaxed">
                  Your identity and reflections are completely private. Zero ads, zero selling of personal data.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/75 dark:bg-surface-container-low/75 border border-surface-variant/40 shadow-ambient flex items-start gap-3.5 transition-all hover:bg-white hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-mint/20 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">psychology_alt</span>
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-heading font-bold text-on-surface">
                  Adaptive AI &amp; Peer Circles
                </h4>
                <p className="text-[12px] text-on-surface-variant/80 leading-relaxed">
                  Compassionate, active listening tailored to your lifestyle, pace, and daily intentions.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/75 dark:bg-surface-container-low/75 border border-surface-variant/40 shadow-ambient flex items-start gap-3.5 transition-all hover:bg-white hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-peach/20 text-[#9E5D28] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl">monitoring</span>
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-heading font-bold text-on-surface">
                  Evidence-Based Wellness Pulse
                </h4>
                <p className="text-[12px] text-on-surface-variant/80 leading-relaxed">
                  Daily mood trends, guided breathing exercises, and emotional wellness celebrations.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof / Calm Quote */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-center gap-3 text-left">
            <div className="flex -space-x-2 shrink-0">
              <span className="w-7 h-7 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">🌸</span>
              <span className="w-7 h-7 rounded-full bg-mint/30 border-2 border-white flex items-center justify-center text-[10px] font-bold text-secondary">🌱</span>
              <span className="w-7 h-7 rounded-full bg-peach/30 border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#9E5D28]">✨</span>
            </div>
            <p className="text-[12px] font-heading font-medium text-on-surface-variant">
              Join thousands finding balance, clarity, and genuine companionship every day.
            </p>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: LOGIN FORM CARD                              */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 w-full max-w-lg mx-auto"
        >
          {/* Mobile Header Greeting */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-primary/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-heading font-bold text-primary">
                WELCOME BACK • MANRAAH
              </span>
            </div>
            <h2 className="text-2xl font-heading font-black text-on-surface tracking-tight">
              Sign In to Your Space
            </h2>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              Continue your journey to daily balance and calm.
            </p>
          </div>

          {/* Main Card Container */}
          <div className="p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] bg-white/90 dark:bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-variant/40 shadow-card-lift">
            
            {/* Desktop Card Header */}
            <div className="space-y-1 pb-4 border-b border-surface-variant/30 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-heading font-bold text-primary uppercase tracking-wider">
                    Account Access
                  </p>
                  <h3 className="text-2xl font-heading font-extrabold text-on-surface">
                    Sign In
                  </h3>
                </div>
                {/* <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-heading font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Confidential Space</span>
                </div> */}
              </div>
              <p className="text-xs text-on-surface-variant pt-1">
                Enter your registered credentials below to access your account.
              </p>
            </div>

            {/* Error Callout */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 my-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 flex items-start gap-2.5 text-left"
              >
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                required
                icon="mail"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <FormInput
                  label="Password"
                  isPassword={true}
                  required
                  icon="lock"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-surface-variant text-primary focus:ring-primary/40 accent-primary cursor-pointer"
                    />
                    <span className="text-xs text-on-surface-variant">Remember me</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-heading font-bold text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Manraah</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom link to Signup / Category Selection */}
            <div className="text-center pt-4 mt-4 border-t border-surface-variant/30">
              <p className="text-xs text-on-surface-variant font-normal">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/category-selection"
                  className="font-heading font-bold text-primary hover:underline"
                >
                  Create Free Account
                </Link>
              </p>
            </div>

          </div>

          {/* Reassurance footer icons for mobile */}
          <div className="flex sm:hidden items-center justify-center gap-4 text-[11px] text-on-surface-variant/70 font-medium pt-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-600">lock</span>
              <span>100% Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">visibility_off</span>
              <span>Anonymous Identity</span>
            </span>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
