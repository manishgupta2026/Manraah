"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/backend/auth/client";
import { FormInput } from "@/frontend/components/ui/FormInput";
import { CustomSelect, CustomSelectOption } from "@/frontend/components/ui/CustomSelect";
import { DobPicker } from "@/frontend/components/ui/DobPicker";
import { GenderSelect } from "@/frontend/components/ui/GenderSelect";
import { motion, AnimatePresence } from "framer-motion";

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

interface CategoryChoice {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
}

const CATEGORY_CHOICES: CategoryChoice[] = [
  {
    id: "student",
    title: "Student & Academics",
    subtitle: "Manage academic stress, exam anxiety, focus, and emotional balance.",
    icon: "school",
    badge: "🎓 Academics",
  },
  {
    id: "working_professional",
    title: "Working Professional",
    subtitle: "Navigate workplace pressure, career balance, and burnout prevention.",
    icon: "work",
    badge: "💼 Career",
  },
  {
    id: "parent",
    title: "Parents & Families",
    subtitle: "Decompress parenting stress, family harmony, and personal renewal.",
    icon: "family_restroom",
    badge: "🍼 Family",
  },
  {
    id: "couple",
    title: "Couples & Relationships",
    subtitle: "Nurture relationship harmony, emotional intimacy, and communication.",
    icon: "favorite",
    badge: "💖 Relationships",
  },
  {
    id: "other",
    title: "Other / General",
    subtitle: "Personalized mindfulness and gentle support tailored to your unique journey.",
    icon: "spa",
    badge: "✨ General",
  },
];

export default function SignupScreen() {
  const router = useRouter();

  // Wizard Step: 1 = Create Account, 2 = Personal Details, 3 = Category Selection
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Step 2 Details
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("India");

  // Step 3 Category
  const [selectedCategory, setSelectedCategory] = useState("student");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "bg-surface-variant" };
    if (pwd.length < 6) return { score: 1, label: "Needs min 6 chars", color: "bg-red-400" };
    let s = 1;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 8) s++;

    if (s <= 2) return { score: 2, label: "Fair", color: "bg-amber-400" };
    if (s === 3) return { score: 3, label: "Good", color: "bg-[#006C56]" };
    return { score: 4, label: "Strong & Secure", color: "bg-emerald-600" };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateStep1 = (): boolean => {
    if (!fullName.trim()) {
      setError("Please enter your full name.");
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
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
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

  const handleNextFromStep1 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleNextFromStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!validateStep2()) return;
    setStep(3);
  };

  const handleCompleteSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      await signUp(
        fullName.trim(),
        email.trim().toLowerCase(),
        password,
        selectedCategory,
        {},
        [],
        68,
        68,
        "Balanced",
        phone.trim(),
        dob.trim(),
        country.trim(),
        gender.trim()
      );

      // Clean legacy cookies
      document.cookie = "userType=; path=/; max-age=0";
      document.cookie = "manraah_userType=; path=/; max-age=0";

      // Redirect directly to unified /dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "We couldn't create your account. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#FDF7FF] via-[#F8F9FD] to-[#E6F4F0] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-12 select-none relative overflow-x-hidden">
      {/* Calming background auras */}
      <div className="absolute top-1/4 left-1/6 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] bg-[#006C56]/8 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/6 translate-x-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-[#E6F4F0] rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl w-full mx-auto">
        {/* Step Indicator Header */}
        <div className="mb-8 text-center max-w-md mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step === s
                      ? "bg-[#006C56] text-white shadow-md ring-4 ring-[#006C56]/20"
                      : step > s
                      ? "bg-emerald-100 text-[#006C56] border border-emerald-300"
                      : "bg-white text-slate-400 border border-slate-200"
                  }`}
                >
                  {step > s ? (
                    <span className="material-symbols-outlined text-base font-bold">check</span>
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 rounded-full transition-all duration-300 ${
                      step > s ? "bg-[#006C56]" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#211D26] tracking-tight">
            {step === 1 && "Create Your Manraah Account"}
            {step === 2 && "Personal Details"}
            {step === 3 && "What Best Describes You?"}
          </h2>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {step === 1 && "Step 1 of 3 • Basic account credentials"}
            {step === 2 && "Step 2 of 3 • Helps tailor your wellness experience"}
            {step === 3 && "Step 3 of 3 • Tailors your recommendations on your unified dashboard"}
          </p>
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 transition-all">
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

          <AnimatePresence mode="wait">
            {/* ========================================================================= */}
            {/* STEP 1: CREATE ACCOUNT                                                   */}
            {/* ========================================================================= */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNextFromStep1}
                className="space-y-5"
              >
                <div>
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    type="text"
                    required
                    placeholder="e.g. Aditi Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon="person"
                  />
                </div>

                <div>
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    required
                    placeholder="aditi@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon="mail"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FormInput
                      label="Password"
                      name="password"
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon="lock"
                    />
                    {password && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden flex gap-1">
                          {[1, 2, 3, 4].map((seg) => (
                            <div
                              key={seg}
                              className={`flex-1 h-full rounded-full transition-all duration-300 ${
                                passwordStrength.score >= seg ? passwordStrength.color : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {passwordStrength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <FormInput
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon="lock_reset"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#006C56] focus:ring-[#006C56]"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                    I agree to Manraah's{" "}
                    <Link href="/terms" className="text-[#006C56] underline font-semibold">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#006C56] underline font-semibold">
                      Privacy Policy
                    </Link>
                    . Your data remains 100% confidential.
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#006C56] font-bold hover:underline">
                      Log In
                    </Link>
                  </p>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#006C56] text-white font-bold text-sm hover:bg-[#005241] shadow-lg shadow-[#006C56]/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Details</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: PERSONAL DETAILS                                                 */}
            {/* ========================================================================= */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleNextFromStep2}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <DobPicker
                      label="Date of Birth"
                      value={dob}
                      onChange={(val) => setDob(val)}
                    />
                  </div>

                  <div>
                    <GenderSelect
                      value={gender}
                      onChange={(val) => setGender(val)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <CustomSelect
                      label="Country"
                      options={COUNTRY_OPTIONS}
                      value={country}
                      onChange={(val) => setCountry(val)}
                      icon="public"
                    />
                  </div>

                  <div>
                    <FormInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      icon="call"
                    />
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(1);
                    }}
                    className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-[#006C56] text-white font-bold text-sm hover:bg-[#005241] shadow-lg shadow-[#006C56]/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to Category</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: CATEGORY SELECTION                                               */}
            {/* ========================================================================= */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-600 font-medium">
                    Select the option that best describes your current focus. This personalizes your recommendations inside your unified dashboard.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CATEGORY_CHOICES.map((choice) => {
                    const isSelected = selectedCategory === choice.id;
                    return (
                      <div
                        key={choice.id}
                        onClick={() => setSelectedCategory(choice.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 text-left ${
                          isSelected
                            ? "border-[#006C56] bg-[#006C56]/5 shadow-md"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#006C56] text-white"
                              : "bg-[#E6F4F0] text-[#006C56]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">{choice.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-heading font-black text-[#211D26]">
                              {choice.title}
                            </h3>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSelected
                                  ? "bg-[#006C56] text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {choice.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {choice.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-[#E6F4F0]/60 border border-[#006C56]/20 flex items-center gap-3 text-xs text-[#006C56]">
                  <span className="material-symbols-outlined text-lg shrink-0">verified_user</span>
                  <span>
                    Your dashboard is unified. You can explore all features, tools, and therapists at any time.
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep(2);
                    }}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompleteSignup}
                    disabled={loading}
                    className="px-8 py-3.5 rounded-2xl bg-[#006C56] text-white font-bold text-sm hover:bg-[#005241] shadow-lg shadow-[#006C56]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                        <span>Creating Your Sanctuary...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Setup & Enter Dashboard</span>
                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
