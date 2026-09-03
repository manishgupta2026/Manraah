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
import { motion, AnimatePresence } from "framer-motion";
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

const CATEGORY_META: Record<string, { badge: string; title: string; subtitle: string; icon: string }> = {
  student: {
    badge: "🎓 Student Journey",
    title: "Tailored for Students",
    subtitle: "Exam calm, study balance, and 24/7 empathetic peer listening.",
    icon: "school",
  },
  working_professional: {
    badge: "💼 Professional Haven",
    title: "Tailored for Professionals",
    subtitle: "Burnout decompression, deep focus timers, and work-life balance.",
    icon: "work",
  },
  young_pro: {
    badge: "💼 Professional Journey",
    title: "Tailored for Professionals",
    subtitle: "Burnout decompression, deep focus timers, and work-life balance.",
    icon: "work",
  },
  parent: {
    badge: "🌱 Parents Circle",
    title: "Tailored for Caregivers",
    subtitle: "Caregiver emotional calm, parent reflection, and family peace.",
    icon: "family_restroom",
  },
  parents: {
    badge: "🌱 Parents Circle",
    title: "Tailored for Caregivers",
    subtitle: "Caregiver emotional calm, parent reflection, and family peace.",
    icon: "family_restroom",
  },
  couple: {
    badge: "💖 Couples  ",
    title: "Tailored for Relationships",
    subtitle: "Emotional intimacy, mindful connection, and shared reflection.",
    icon: "favorite",
  },
  couples: {
    badge: "💖 Couples",
    title: "Tailored for Relationships",
    subtitle: "Emotional intimacy, mindful connection, and shared reflection.",
    icon: "favorite",
  },
  senior_citizen: {
    badge: "🕊️ Wisdom & Serenity",
    title: "Tailored for Seniors",
    subtitle: "Mindful reflection, gentle daily vitality, and heartfelt peace.",
    icon: "elderly",
  },
  other: {
    badge: "🌿 Others",
    title: "Personalized Mental Wellness",
    subtitle: "A confidential haven for daily clarity, calm, and emotional resilience.",
    icon: "spa",
  },
};

export default function SignupScreen() {
  const router = useRouter();
  const { selectedCategory, detailedAnswers, computedScore, assessmentResult } = useAssessment();

  const [step, setStep] = useState<1 | 2>(1);
  const [resolvedCategory, setResolvedCategory] = useState<string>("student");
  const [sanctuaryName, setSanctuaryName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");
  const [password, setPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [showAliasInput, setShowAliasInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromContext = selectedCategory;
    const fromCookie = readCookie("userType") || readCookie("manraah_userType");
    const resolved = fromContext || fromCookie || "student";
    setResolvedCategory(resolved.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_"));
  }, [selectedCategory]);

  const catInfo = CATEGORY_META[resolvedCategory] || CATEGORY_META["other"];

  // Live password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-surface-variant" };
    if (pwd.length < 6) return { score: 1, label: "Needs min 6 chars", color: "bg-red-400" };
    let s = 1;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8) s++;

    if (s <= 2) return { score: 2, label: "Fair", color: "bg-amber-400" };
    if (s === 3) return { score: 3, label: "Good", color: "bg-primary-purple" };
    return { score: 4, label: "Strong & Secure", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateStep1 = (): boolean => {
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (showAliasInput && !sanctuaryName.trim()) {
      setError("Please enter your community alias.");
      return false;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password.trim()) {
      setError("Please enter a password.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (!agreedTerms) {
      setError("Please confirm agreement with the Terms of Service & Privacy Policy.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!dob.trim()) {
      setError("Please select your date of birth.");
      return false;
    }
    if (!gender.trim()) {
      setError("Please select your gender identity.");
      return false;
    }
    if (!country.trim()) {
      setError("Please select your country.");
      return false;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return false;
    }
    const cleanPhoneDigits = phone.replace(/[^0-9]/g, "");
    if (cleanPhoneDigits.length < 7 || cleanPhoneDigits.length > 15) {
      setError("Please enter a valid phone number (between 7 and 15 digits).");
      return false;
    }
    return true;
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!validateStep1()) return;
    setStep(2);
  };

  const executeSignUp = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }
    if (!validateStep2()) {
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const displayName = fullName.trim() || sanctuaryName.trim();
      const session = await signUp(
        displayName,
        email.trim().toLowerCase(),
        password,
        resolvedCategory,
        detailedAnswers || [],
        detailedAnswers || [],
        computedScore || 0,
        assessmentResult?.percentage || computedScore || 0,
        assessmentResult?.wellnessLevel || "Balanced",
        phone.trim(),
        dob.trim(),
        country.trim(),
        gender.trim()
      );

      // Clear temporary onboarding cookies
      document.cookie = "userType=; path=/; max-age=0";
      document.cookie = "manraah_userType=; path=/; max-age=0";

      const categoryRaw = session.user?.selectedCategory || resolvedCategory;
      const targetRoute = getCategoryDashboardRoute(categoryRaw);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleNextStep();
    } else {
      executeSignUp();
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
        {/* DESKTOP LEFT / HERO COLUMN (Hidden or minimal on mobile)  */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:col-span-5 flex-col space-y-6"
        >
          {/* Category Badge with pulsing indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-surface-container-low border border-primary/20 shadow-xs w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-heading font-bold text-primary">
              {catInfo.badge}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl xl:text-4xl font-heading font-black text-on-surface tracking-tight leading-snug">
              Your Private Space for Inner Calm &amp; Growth
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Step inside a judgment-free space designed to support your mental well-being, celebrate daily wins, and keep your thoughts safe.
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
                  100% Encrypted &amp; Anonymous
                </h4>
                <p className="text-[12px] text-on-surface-variant/80 leading-relaxed">
                  Your identity and reflections are private. Zero ads, zero selling of personal data.
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
                  Active, compassionate listening calibrated to your lifestyle and daily goals.
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
                  Daily mood tracking, focus timers, and mindful streak celebrations.
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
        {/* SIGNUP FORM CARD (Mobile-First & Desktop High-Fidelity)   */}
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
                {catInfo.badge}
              </span>
            </div>
            <h2 className="text-2xl font-heading font-black text-on-surface tracking-tight">
              Create Your Account
            </h2>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              {catInfo.subtitle}
            </p>
          </div>

          {/* Main Card Container */}
          <div className="p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] bg-white/90 dark:bg-surface-container-lowest/95 backdrop-blur-xl border border-surface-variant/40 shadow-card-lift">
            
            {/* Desktop Card Title & Step Navigation */}
            <div className="space-y-4 pb-4 border-b border-surface-variant/30">
              <div className="hidden lg:flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-heading font-bold text-primary uppercase tracking-wider">
                    Step {step} of 2
                  </p>
                  <h3 className="text-2xl font-heading font-extrabold text-on-surface">
                    {step === 1 ? "Account Credentials" : "Personal Details"}
                  </h3>
                </div>
                {/* <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-heading font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Confidential Space</span>
                </div> */}
              </div>

              {/* Progress Step Pills */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    step === 1
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/25 text-[10px] flex items-center justify-center">
                    1
                  </span>
                  <span>Credentials</span>
                  {fullName && email && password.length >= 6 && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    if (validateStep1()) {
                      setStep(2);
                    }
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    step === 2
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/25 text-[10px] flex items-center justify-center">
                    2
                  </span>
                  <span>Personal Details</span>
                  {dob && gender && country && phone && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              </div>
            </div>

            {/* Error Callout */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 my-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-600 flex items-start gap-2.5"
              >
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Step Form Wrapper */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  /* ========================================= */
                  /* STEP 1: CREDENTIALS                       */
                  /* ========================================= */
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5"
                  >
                    {/* Full Name Input */}
                    <div>
                      <FormInput
                        label="Full Name"
                        required
                        type="text"
                        icon="face"
                        placeholder="e.g. Ashutosh Sahu"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (!showAliasInput) setSanctuaryName(e.target.value);
                        }}
                      />
                      
                      {!showAliasInput ? (
                        <button
                          type="button"
                          onClick={() => setShowAliasInput(true)}
                          className="text-[11px] font-heading font-semibold text-primary hover:underline mt-1.5 flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">shield_person</span>
                          <span>Set a different public community alias</span>
                        </button>
                      ) : (
                        <div className="mt-2.5 animate-fadeIn">
                          <FormInput
                            label="Community Alias"
                            sublabel="(Shown in anonymous peer spaces)"
                            required
                            type="text"
                            icon="visibility_off"
                            placeholder="e.g. Calm Breeze"
                            value={sanctuaryName}
                            onChange={(e) => setSanctuaryName(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Email Input */}
                    <FormInput
                      label="Email Address"
                      type="email"
                      required
                      icon="mail"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Password Input with Live Strength Bar */}
                    <div>
                      <FormInput
                        label="Password"
                        isPassword={true}
                        required
                        icon="lock"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2 space-y-1 animate-fadeIn">
                          <div className="flex items-center justify-between text-[11px] font-heading font-bold">
                            <span className="text-on-surface-variant">Security Strength</span>
                            <span className={
                              passwordStrength.score >= 3
                                ? "text-emerald-600"
                                : passwordStrength.score === 2
                                ? "text-amber-600"
                                : "text-red-500"
                            }>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-surface-container overflow-hidden flex gap-1">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                passwordStrength.score >= 1 ? passwordStrength.color : "bg-transparent"
                              } ${
                                passwordStrength.score === 1
                                  ? "w-1/4"
                                  : passwordStrength.score === 2
                                  ? "w-2/4"
                                  : passwordStrength.score === 3
                                  ? "w-3/4"
                                  : "w-full"
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Terms Agreement Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-surface-variant text-primary focus:ring-primary/40 accent-primary cursor-pointer"
                        />
                        <span className="text-xs text-on-surface-variant leading-snug">
                          I agree to Manraah&apos;s{" "}
                          <Link href="/terms" className="font-heading font-bold text-primary hover:underline">
                            Terms
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="font-heading font-bold text-primary hover:underline">
                            Privacy Policy
                          </Link>.
                        </span>
                      </label>
                    </div>

                    {/* Action Button for Step 1 */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleNextStep()}
                        className="w-full py-3.5 sm:py-4 rounded-2xl bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                      >
                        <span>Continue to Personal Details</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  /* ========================================= */
                  /* STEP 2: PERSONAL DETAILS                  */
                  /* ========================================= */
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5"
                  >
                    <div className="p-3 rounded-2xl bg-primary/5 border border-primary/15 text-left flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                        auto_awesome
                      </span>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        Please provide all details below to personalize your experience, calibrate your AI companion tone, and adapt wellness routines.
                      </p>
                    </div>

                    {/* Date of Birth */}
                    <DobPicker
                      label="Date of Birth"
                      value={dob}
                      onChange={(val) => setDob(val)}
                    />

                    {/* Gender Identity */}
                    <GenderSelect
                      label="Gender Identity"
                      value={gender}
                      onChange={(selectedGender) => setGender(selectedGender)}
                    />

                    {/* Country & Phone Side-by-side or stacked on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <CustomSelect
                        label="Country"
                        placeholder="Select country"
                        options={COUNTRY_OPTIONS}
                        value={country}
                        onChange={(val) => setCountry(val)}
                      />

                      <FormInput
                        label="Phone Number"
                        required
                        type="tel"
                        icon="call"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    {/* Action Buttons for Step 2 */}
                    <div className="pt-3 space-y-2.5">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 sm:py-4 rounded-2xl bg-primary hover:bg-primary-purple text-white font-heading font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <span>Complete Registration</span>
                            <span className="material-symbols-outlined text-base">auto_awesome</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-start pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setStep(1);
                          }}
                          className="text-xs font-heading font-semibold text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">arrow_back</span>
                          <span>Back to Credentials</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </form>

            {/* Bottom Log In link */}
            <div className="text-center pt-4 mt-4 border-t border-surface-variant/30">
              <p className="text-xs text-on-surface-variant font-normal">
                Already have a Manraah account?{" "}
                <Link href="/login" className="font-heading font-bold text-primary hover:underline">
                  Log In
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
              <span>Anonymous Profile</span>
            </span>
          </div>

        </motion.div>

      </div>
    </div>
  );
}
