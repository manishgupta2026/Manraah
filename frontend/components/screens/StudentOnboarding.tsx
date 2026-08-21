"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getClientSession } from "@/backend/auth/client";
import Logo from "@/frontend/components/ui/Logo";

const ONBOARDING_QUESTIONS = [
  {
    id: "workload",
    question: "How has your academic workload been feeling lately?",
    options: [
      { text: "Very manageable", val: "Very manageable" },
      { text: "Mostly manageable", val: "Mostly manageable" },
      { text: "A little heavy", val: "A little heavy" },
      { text: "Very overwhelming", val: "Very overwhelming" }
    ]
  },
  {
    id: "stress",
    question: "How would you describe your academic stress levels today?",
    options: [
      { text: "Calm & relaxed", val: "Calm & relaxed" },
      { text: "Manageable", val: "Manageable" },
      { text: "Elevated", val: "Elevated" },
      { text: "Overwhelming", val: "Overwhelming" }
    ]
  },
  {
    id: "sleep",
    question: "How many hours of quality sleep are you getting per night?",
    options: [
      { text: "8+ hours", val: "8+ hours" },
      { text: "6 to 8 hours", val: "6 to 8 hours" },
      { text: "4 to 6 hours", val: "4 to 6 hours" },
      { text: "Under 4 hours", val: "Under 4 hours" }
    ]
  },
  {
    id: "focus",
    question: "How easy is it for you to maintain focus during study sessions?",
    options: [
      { text: "Very easy", val: "Very easy" },
      { text: "Mostly easy", val: "Mostly easy" },
      { text: "Easily distracted", val: "Easily distracted" },
      { text: "Extremely difficult", val: "Extremely difficult" }
    ]
  },
  {
    id: "routine",
    question: "How consistent is your study routine?",
    options: [
      { text: "Highly disciplined", val: "Highly disciplined" },
      { text: "Moderately regular", val: "Moderately regular" },
      { text: "Mostly cramming", val: "Mostly cramming" },
      { text: "Very chaotic", val: "Very chaotic" }
    ]
  },
  {
    id: "examPressure",
    question: "How do you feel about your upcoming exams?",
    options: [
      { text: "Confident & prepared", val: "Confident & prepared" },
      { text: "Mildly anxious", val: "Mildly anxious" },
      { text: "Quite stressed", val: "Quite stressed" },
      { text: "Panicked / Unprepared", val: "Panicked / Unprepared" }
    ]
  },
  {
    id: "motivation",
    question: "How is your motivation to complete academic tasks today?",
    options: [
      { text: "High & inspired", val: "High & inspired" },
      { text: "Moderate", val: "Moderate" },
      { text: "Low", val: "Low" },
      { text: "Completely drained", val: "Completely drained" }
    ]
  },
  {
    id: "balance",
    question: "How well are you balancing study time with your social/personal life?",
    options: [
      { text: "Excellent balance", val: "Excellent balance" },
      { text: "Good balance", val: "Good balance" },
      { text: "Study takes over", val: "Study takes over" },
      { text: "No personal time", val: "No personal time" }
    ]
  },
  {
    id: "mood",
    question: "How is your general mood baseline this week?",
    options: [
      { text: "Good / Happy", val: "Good / Happy" },
      { text: "Okay / Neutral", val: "Okay / Neutral" },
      { text: "Stressed / Anxious", val: "Stressed / Anxious" },
      { text: "Down / Sad", val: "Down / Sad" }
    ]
  },
  {
    id: "supportPreference",
    question: "What kind of support is most important for you right now?",
    options: [
      { text: "Stress & anxiety relief", val: "Stress & anxiety relief" },
      { text: "Focus & study planning", val: "Focus & study planning" },
      { text: "Sleep & rest optimization", val: "Sleep & rest optimization" },
      { text: "AI companion conversations", val: "AI companion conversations" }
    ]
  }
];

export default function StudentOnboarding() {
  const router = useRouter();
  
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [onboardingStep, setOnboardingStep] = useState<number>(0); // 0 = welcome, 1-10 = questions
  const [answers, setAnswers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load session client-side to enforce route protection
  useEffect(() => {
    const activeSession = getClientSession();
    if (!activeSession || !activeSession.isAuthenticated || !activeSession.user) {
      router.replace("/login");
      return;
    }

    if (activeSession.user.selectedCategory !== "student") {
      // If not a student, redirect to their appropriate category dashboard
      const cat = activeSession.user.selectedCategory;
      const target = cat === "working_professional" || cat === "working-professional" ? "/dashboard/working-professional" : `/dashboard/${cat}`;
      router.replace(target);
      return;
    }

    // Redirect students directly to the student dashboard where they will complete onboarding
    router.replace("/dashboard/student");
  }, [router]);

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#FAF8FE] dark:bg-[#120F1D] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-t-[#5F4EA5] border-purple-200 animate-spin" />
          <span className="text-xs font-bold text-[#5F4EA5] dark:text-purple-300">Loading sanctuary profile...</span>
        </div>
      </div>
    );
  }

  const handleOptionSelect = (qIdx: number, val: string) => {
    const newAnswers = [...answers];
    newAnswers[qIdx] = {
      questionId: ONBOARDING_QUESTIONS[qIdx].id,
      question: ONBOARDING_QUESTIONS[qIdx].question,
      answer: val
    };
    setAnswers(newAnswers);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (answers.length < 10 || answers.some((a) => !a)) {
      setSubmitError("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "We couldn't save your responses. Please try again.");
      }

      // Sync onboardingCompleted in client session
      const updatedSession = {
        ...session,
        user: {
          ...session.user,
          onboardingCompleted: true
        }
      };

      localStorage.setItem("manraah_auth_session", JSON.stringify(updatedSession));
      document.cookie = `manraah_session=${JSON.stringify(updatedSession)}; path=/; max-age=2592000`;

      // Redirect to student dashboard
      router.push("/dashboard/student");
    } catch (err: any) {
      console.error("[Onboarding submit error]:", err);
      setSubmitError(err.message || "We couldn't save your responses. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FE] dark:bg-[#120F1D] text-[#231E39] dark:text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-12 select-none relative overflow-x-hidden font-sans">
      {/* Background Soft Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-200/30 dark:bg-purple-900/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-100/30 dark:bg-teal-900/10 blur-[120px]" />
      </div>

      {/* Header Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between z-10">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                onboardingStep === i + 1
                  ? "w-8 bg-[#6351A5]"
                  : onboardingStep > i + 1
                  ? "w-4 bg-purple-300"
                  : "w-4 bg-purple-100 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-lg w-full mx-auto my-auto py-8 z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {onboardingStep === 0 ? (
            <motion.div
              key="welcome"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 space-y-6 shadow-xl text-center"
            >
              <span className="text-5xl block select-none">✨</span>
              <h3 className="text-2xl font-heading font-black text-[#100E26] dark:text-slate-100">
                Let's personalize your sanctuary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Welcome to Manraah. Answer 10 quick questions to help us tailor wellness recommendations, focus support, and insights specifically for your academic journey.
              </p>
              
              <button
                onClick={() => setOnboardingStep(1)}
                className="w-full py-4 rounded-2xl bg-[#5F4EA5] hover:bg-[#100E26] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all text-center block"
              >
                Start Onboarding →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-white dark:bg-[#132E3F] border border-slate-200/60 dark:border-slate-800 rounded-[32px] p-8 space-y-6 shadow-xl"
            >
              {/* Question Index */}
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Student Assessment</span>
                <span>Question {onboardingStep} of 10</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5F4EA5] transition-all duration-300"
                  style={{ width: `${(onboardingStep / 10) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <h4 className="text-sm md:text-base font-heading font-black text-[#100E26] dark:text-slate-100 leading-snug text-left">
                {ONBOARDING_QUESTIONS[onboardingStep - 1].question}
              </h4>

              {/* Options list */}
              <div className="space-y-2 text-left">
                {ONBOARDING_QUESTIONS[onboardingStep - 1].options.map((opt) => {
                  const isSelected = answers[onboardingStep - 1]?.answer === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => handleOptionSelect(onboardingStep - 1, opt.val)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#F5F3FC] dark:bg-[#1C1635]/60 border-[#5F4EA5] text-[#5F4EA5] dark:text-purple-300 font-extrabold"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{opt.text}</span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Error block */}
              {submitError && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-bold border border-red-200/20 text-left">
                  ⚠️ {submitError}
                </div>
              )}

              {/* Bottom Nav Bar */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={onboardingStep === 1}
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                    onboardingStep === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">arrow_back</span>
                  Back
                </button>

                {onboardingStep < 10 ? (
                  <button
                    type="button"
                    disabled={!answers[onboardingStep - 1]}
                    onClick={() => setOnboardingStep(onboardingStep + 1)}
                    className={`py-3 px-6 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                      !answers[onboardingStep - 1]
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#5F4EA5] hover:bg-[#100E26] text-white"
                    }`}
                  >
                    Next
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!answers[onboardingStep - 1] || isSubmitting}
                    onClick={handleSubmit}
                    className={`py-3 px-6 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all ${
                      !answers[onboardingStep - 1] || isSubmitting
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#5FAF8A] hover:bg-[#4d9774] text-white"
                    }`}
                  >
                    {isSubmitting ? "Personalizing your sanctuary..." : "Complete"}
                    <span className="material-symbols-outlined text-xs">done_all</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer copyright */}
      <div className="max-w-3xl w-full mx-auto text-center text-[10px] text-slate-400 dark:text-slate-500 z-10 mt-4">
        © {new Date().getFullYear()} Manraah. All rights reserved. 🌿
      </div>
    </div>
  );
}
