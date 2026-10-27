"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { updateClientSession } from "@/backend/auth/client";
import { FormInput } from "@/frontend/components/ui/FormInput";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { useAuth } from "@/frontend/lib/context/AuthContext";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCategory, detailedAnswers, computedScore, assessmentResult } = useAssessment();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Emergency contact intake step state
  const [showEmergencyContactStep, setShowEmergencyContactStep] = useState(false);
  const [loggedInSession, setLoggedInSession] = useState<any>(null);
  const [ecName, setEcName] = useState("");
  const [ecPhone, setEcPhone] = useState("");
  const [ecRelation, setEcRelation] = useState("Parent");
  const [ecSaving, setEcSaving] = useState(false);
  const [ecError, setEcError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
      const queryCat = searchParams?.get("category") || searchParams?.get("selected") || "";
      const cookieCat = readCookie("userType") || readCookie("manraah_userType") || "";
      const effectiveCategory = queryCat || selectedCategory || cookieCat || "";

      const session = await login(
        email.trim().toLowerCase(),
        password,
        effectiveCategory || "",
        detailedAnswers || [],
        computedScore || 0,
        assessmentResult?.percentage || computedScore || 0,
        assessmentResult?.wellnessLevel || ""
      );

      // Clear userType temporary cookies
      document.cookie = "userType=; path=/; max-age=0";
      document.cookie = "manraah_userType=; path=/; max-age=0";

      const hasEmergencyContact = Boolean(
        session?.user?.emergencyContact &&
        (typeof session.user.emergencyContact === "object" ? session.user.emergencyContact.phone : false)
      );

      if (!hasEmergencyContact) {
        setLoggedInSession(session);
        setShowEmergencyContactStep(true);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login authentication error:", err);
      setError(
        err.message ||
          "We couldn't find an account matching those credentials. Please check your email and password and try again."
      );
      setLoading(false);
    }
  };

  const handleSaveEmergencyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setEcError(null);

    const name = ecName.trim();
    const phone = ecPhone.trim();

    if (!name) {
      setEcError("Please enter your contact's name.");
      return;
    }
    if (!phone || phone.length < 5) {
      setEcError("Please enter a valid phone number.");
      return;
    }

    setEcSaving(true);
    try {
      const contactObj = {
        name,
        phone,
        relation: ecRelation || "Family",
      };

      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyContact: contactObj }),
      });

      if (loggedInSession) {
        updateClientSession({
          ...loggedInSession,
          user: {
            ...loggedInSession.user,
            emergencyContact: contactObj,
          },
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      setEcError(err.message || "Failed to save contact. You can continue and set this up later.");
      setEcSaving(false);
    }
  };

  const handleSkipEmergencyContact = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#FDF7FF] via-[#F8F9FD] to-[#E6F4F0] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-12 select-none relative overflow-x-hidden">
      {/* Calming background auras matching Signup */}
      <div className="absolute top-1/4 left-1/6 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] bg-[#006C56]/8 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/6 translate-x-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-[#E6F4F0] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-[580px] w-full mx-auto">
        {/* Top Header Section */}
        <div className="mb-6 sm:mb-8 text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#006C56] border border-emerald-200/80 text-xs font-heading font-bold mb-3 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#006C56] animate-pulse" />
            <span>ACCOUNT ACCESS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#211D26] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-slate-600 mt-1.5 font-medium">
            Sign in to continue your Manraah wellness journey.
          </p>
        </div>

        {/* Centered Form Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 transition-all">
          <AnimatePresence mode="wait">
            {showEmergencyContactStep ? (
              <motion.div
                key="emergency-contact"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5"
              >
                <div className="space-y-1.5 pb-4 border-b border-slate-200/80 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-[11px] font-heading font-bold">
                    <span className="material-symbols-outlined text-sm animate-pulse">health_and_safety</span>
                    <span>SAFETY FIRST</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#211D26]">
                    Add an Emergency Contact
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    In moments of overwhelming distress, who should we help connect you to in a single tap? This is private to you and accessible anytime from your crisis tab.
                  </p>
                </div>

                {ecError && (
                  <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-start gap-2 text-left">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                    <span>{ecError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEmergencyContact} className="space-y-4 text-left">
                  <FormInput
                    label="Contact Full Name *"
                    type="text"
                    required
                    icon="person"
                    placeholder="e.g. Priya Sharma, Mom, Rahul"
                    value={ecName}
                    onChange={(e) => setEcName(e.target.value)}
                  />

                  <FormInput
                    label="Phone Number *"
                    type="tel"
                    required
                    icon="call"
                    placeholder="e.g. +91 98765 43210"
                    value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-heading font-bold text-[#211D26] mb-1.5">
                      Relationship
                    </label>
                    <select
                      value={ecRelation}
                      onChange={(e) => setEcRelation(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-surface-variant/40 text-xs font-medium text-on-surface focus:outline-hidden focus:ring-2 focus:ring-[#006C56] cursor-pointer"
                    >
                      <option value="Parent">Parent</option>
                      <option value="Partner / Spouse">Partner / Spouse</option>
                      <option value="Family / Sibling">Family / Sibling</option>
                      <option value="Close Friend">Close Friend</option>
                      <option value="Doctor / Therapist">Doctor / Therapist</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={ecSaving}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#006C56] hover:bg-[#005241] text-white font-heading font-bold text-sm shadow-lg shadow-[#006C56]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {ecSaving ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Saving Contact...</span>
                        </>
                      ) : (
                        <>
                          <span>Save &amp; Continue to Dashboard</span>
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipEmergencyContact}
                      className="w-full py-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-heading font-semibold transition-colors cursor-pointer text-center"
                    >
                      Skip for now — I&apos;ll set this up later
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Error Callout */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-red-500 shrink-0 text-xl">error</span>
                    <p className="flex-1 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Login Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <FormInput
                      label="Email Address"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      icon="mail"
                    />
                  </div>

                  <div>
                    <FormInput
                      label="Password"
                      name="password"
                      type="password"
                      isPassword={true}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      icon="lock"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-[#006C56] focus:ring-[#006C56] accent-[#006C56] cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 font-medium">Remember me</span>
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-xs font-heading font-bold text-[#006C56] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* Primary Action Button (Matching Signup 'Continue to Details' Green Style) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#006C56] hover:bg-[#005241] text-white font-heading font-bold text-sm sm:text-base shadow-lg shadow-[#006C56]/20 hover:shadow-xl hover:shadow-[#006C56]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In to Manraah</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Bottom Section: Subtle divider + Create Account link */}
                <div className="pt-6 mt-6 border-t border-slate-200/80 text-center">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Don&apos;t have an account yet?{" "}
                    <Link
                      href="/signup"
                      className="text-[#006C56] font-heading font-bold hover:underline ml-1"
                    >
                      Create Manraah Account
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
