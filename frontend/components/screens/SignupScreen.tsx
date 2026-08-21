"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/backend/auth/client";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { FormInput } from "@/frontend/components/ui/FormInput";
import { CustomSelect, CustomSelectOption } from "@/frontend/components/ui/CustomSelect";
import { DobPicker } from "@/frontend/components/ui/DobPicker";
import { GenderSelect } from "@/frontend/components/ui/GenderSelect";
import { motion } from "framer-motion";
import Logo from "@/frontend/components/ui/Logo";
import { getCategoryDashboardRoute } from "@/frontend/lib/category-routes";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

const COUNTRY_OPTIONS: CustomSelectOption[] = [
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "United Arab Emirates", label: "United Arab Emirates" },
  { value: "Singapore", label: "Singapore" },
  { value: "Other", label: "Other Country" },
];

export default function SignupScreen() {
  const router = useRouter();
  const { selectedCategory, detailedAnswers, computedScore, assessmentResult } = useAssessment();

  const [resolvedCategory, setResolvedCategory] = useState<string>("");
  const [sanctuaryName, setSanctuaryName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
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

    if (!agreedTerms) {
      setError("Please confirm that you agree to the Terms of Service and Privacy Policy.");
      return;
    }

    if (password.length < 6) {
      setError("Please choose a password with at least 6 characters for security.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const session = await signUp(
        fullName || sanctuaryName,
        email,
        password,
        resolvedCategory,
        detailedAnswers || [],
        detailedAnswers || [],
        computedScore || 0,
        assessmentResult?.percentage || computedScore || 0,
        assessmentResult?.wellnessLevel || "",
        phone,
        dob,
        country,
        gender
      );

      // Clear userType temporary cookie
      document.cookie = "userType=; path=/; max-age=0";

      const categoryRaw = session.user?.selectedCategory || resolvedCategory;
      let targetRoute = getCategoryDashboardRoute(categoryRaw);

      router.push(targetRoute);
    } catch (err: any) {
      console.error("Signup authentication error:", err);
      setError(
        err.message ||
          "We couldn't create your account. This email address might already be registered or there was a connection issue."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-12 select-none relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-mint/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT PANEL: Signup Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-7 w-full max-w-lg mx-auto order-2 lg:order-1"
        >
          <div className="p-7 sm:p-9 rounded-[32px] bg-surface-container-lowest border border-surface-variant/30 shadow-card-lift space-y-6">
            
            <div className="space-y-1.5 text-left border-b border-surface-variant/20 pb-4">
              <p className="text-xs font-heading font-bold text-primary tracking-widest uppercase">
                Create Account
              </p>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-on-surface">
                Join Manraah
              </h2>
              <p className="text-xs text-on-surface-variant font-normal">
                Enter your details in sequence to unlock your sanctuary dashboard.
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
              
              {/* FIELD 1: Username / Sanctuary Alias */}
              <FormInput
                label="Username / Sanctuary Alias"
                sublabel="(Private Handle)"
                type="text"
                icon="face"
                placeholder="Gentle Bloom"
                value={sanctuaryName}
                onChange={(e) => setSanctuaryName(e.target.value)}
              />

              {/* FIELD 2: Full Name */}
              <FormInput
                label="Full Name"
                sublabel="(Optional)"
                type="text"
                icon="person"
                placeholder="Ashutosh Sahu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              {/* FIELD 3: Email Address */}
              <FormInput
                label="Email Address"
                type="email"
                required
                icon="mail"
                placeholder="aanya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* FIELD 4: Gender Identity */}
              <GenderSelect
                label="Gender Identity"
                sublabel="(Optional)"
                value={gender}
                onChange={(selectedGender) => setGender(selectedGender)}
              />

              {/* FIELD 5: Date of Birth */}
              <DobPicker
                label="Date of Birth"
                sublabel="(Optional)"
                value={dob}
                onChange={(formattedDate) => setDob(formattedDate)}
              />

              {/* FIELD 6: Phone Number & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormInput
                  label="Phone Number"
                  sublabel="(Optional)"
                  type="tel"
                  icon="call"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <CustomSelect
                  label="Country"
                  sublabel="(Optional)"
                  placeholder="Select country"
                  options={COUNTRY_OPTIONS}
                  value={country}
                  onChange={(val) => setCountry(val)}
                />
              </div>

              {/* FIELD 7: Password */}
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
                <p className="text-[11px] text-on-surface-variant/70 mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">info</span>
                  <span>Must be at least 6 characters</span>
                </p>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-2 border-t border-surface-variant/20">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-surface-variant/40 text-primary focus:ring-primary/40 accent-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-on-surface-variant leading-relaxed cursor-pointer select-none">
                  I agree to the{" "}
                  <Link href="/terms" className="font-heading font-bold text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-heading font-bold text-primary hover:underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Unlocking Sanctuary...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Unlock</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom link to Login */}
            <div className="text-center pt-2 border-t border-surface-variant/20">
              <p className="text-xs text-on-surface-variant font-normal">
                Already have an account?{" "}
                <Link href="/login" className="font-heading font-bold text-primary hover:underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL (Desktop): Illustration & Info Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 flex flex-col items-center text-center lg:items-start lg:text-left space-y-6 order-1 lg:order-2 sticky top-12"
        >
          {/* Brand header */}
          <Link href="/" className="inline-flex items-center gap-2 group hover:opacity-90 transition-opacity">
            <Logo size="lg" priority className="h-10 sm:h-12" />
          </Link>

          <div className="space-y-3 max-w-md">
            <p className="text-xs font-heading font-bold text-[#006B56] tracking-widest uppercase">
              Begin Your Journey
            </p>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-on-surface tracking-tight leading-tight">
              Your Personalized Sanctuary is Ready
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
              Step through our registration sequence to personalize your AI companion tone and community spaces.
            </p>
          </div>

          {/* Readiness Checklist */}
          <div className="w-full max-w-sm p-5 rounded-2xl bg-surface-container-lowest border border-surface-variant/30 shadow-ambient space-y-3 text-left">
            <div className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-emerald-500 font-bold text-xl">check_circle</span>
              <span className="text-xs font-heading font-bold">Category & Age-Based Adaptation</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-emerald-500 font-bold text-xl">check_circle</span>
              <span className="text-xs font-heading font-bold">End-to-End Encrypted Profile</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-emerald-500 font-bold text-xl">check_circle</span>
              <span className="text-xs font-heading font-bold">24/7 AI & Peer Companion Access</span>
            </div>
          </div>

          {/* SVG Illustration Banner */}
          <div className="w-full max-w-[320px] sm:max-w-[360px] py-1">
            <svg viewBox="0 0 400 240" className="w-full h-auto drop-shadow-md">
              <defs>
                <linearGradient id="signupSky5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FAF9FC" />
                  <stop offset="100%" stopColor="#F2EEFC" />
                </linearGradient>
                <linearGradient id="signupMtn5" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5FCFB0" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#7C6BC4" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              <rect width="400" height="240" rx="24" fill="url(#signupSky5)" />
              <circle cx="90" cy="70" r="30" fill="#F4A6B8" opacity="0.75" />
              <path d="M 60 240 L 190 120 L 320 240 Z" fill="url(#signupMtn5)" />
              <path d="M 170 240 L 290 100 L 400 240 Z" fill="#5F4EA5" opacity="0.85" />
              <ellipse cx="200" cy="225" rx="150" ry="14" fill="#F5C99B" opacity="0.4" />
            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
