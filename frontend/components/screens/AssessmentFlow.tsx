"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { assessmentEngine } from "@/frontend/lib/assessment/assessmentEngine";
import { getClientSession } from "@/backend/auth/client";
import { getCategoryJourneyBadge } from "@/frontend/lib/constants";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

interface TimeTheme {
  background: string;
  glowColor: string;
}

const TIME_THEMES: Record<"morning" | "afternoon" | "evening" | "night", TimeTheme> = {
  morning: {
    background: "from-[#FFFDF4] via-[#FFF5EC] to-[#EAE4F5]",
    glowColor: "bg-amber-200/20",
  },
  afternoon: {
    background: "from-[#F2F4FD] via-[#ECE6F6] to-[#FCE6EC]",
    glowColor: "bg-primary-container/20",
  },
  evening: {
    background: "from-[#FFF4E4] via-[#FDE4EB] to-[#ECE7F6]",
    glowColor: "bg-orange-300/15",
  },
  night: {
    background: "from-[#090C16] via-[#10172A] to-[#20183B]",
    glowColor: "bg-indigo-300/10",
  },
};

const AMBIENT_PARTICLES = [
  { id: 1, type: "leaf", x: "8%", size: "text-lg", delay: 0, duration: 22 },
  { id: 2, type: "petal", x: "28%", size: "text-base", delay: 4, duration: 17 },
  { id: 3, type: "leaf", x: "48%", size: "text-xl", delay: 1.5, duration: 24 },
  { id: 4, type: "petal", x: "72%", size: "text-sm", delay: 6.5, duration: 19 },
  { id: 5, type: "leaf", x: "90%", size: "text-lg", delay: 3, duration: 20 },
];

function getQuestionEmoji(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("academic") || lower.includes("exam") || lower.includes("study") || lower.includes("grade")) return "🎓";
  if (lower.includes("workload") || lower.includes("burnout") || lower.includes("career") || lower.includes("job")) return "💼";
  if (lower.includes("family") || lower.includes("parent") || lower.includes("child") || lower.includes("home")) return "🏡";
  if (lower.includes("relationship") || lower.includes("couple") || lower.includes("partner") || lower.includes("love")) return "💖";
  if (lower.includes("sleep") || lower.includes("night") || lower.includes("restful")) return "🌙";
  if (lower.includes("stress") || lower.includes("anxious") || lower.includes("pressure") || lower.includes("worry")) return "😣";
  if (lower.includes("energy") || lower.includes("fatigue") || lower.includes("tired")) return "⚡";
  if (lower.includes("focus") || lower.includes("mind") || lower.includes("clarity")) return "🧠";
  if (lower.includes("friend") || lower.includes("peer") || lower.includes("social")) return "👥";
  return "🌿";
}

function getOptionEmoji(score: number): string {
  if (score === 5) return "😌";
  if (score === 4) return "🙂";
  if (score === 3) return "😐";
  if (score === 2) return "😟";
  return "😔";
}

export default function AssessmentFlow() {
  const router = useRouter();
  const { category: contextCategory } = useCategory();
  const {
    selectedCategory,
    setSelectedCategory,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    detailedAnswers,
    setDetailedAnswers,
    setAssessmentResult,
    setAssessmentCompleted,
  } = useAssessment();

  const [activeCategory, setActiveCategory] = useState<string>("student");
  const [direction, setDirection] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("afternoon");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync category with session or context
  useEffect(() => {
    const session = getClientSession();
    const cat = session.user?.selectedCategory || selectedCategory || contextCategory || "student";
    setActiveCategory(cat);
    if (selectedCategory !== cat) {
      setSelectedCategory(cat as any);
    }
  }, [selectedCategory, contextCategory, setSelectedCategory]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
    else if (hour >= 17 && hour < 21) setTimeOfDay("evening");
    else setTimeOfDay("night");
  }, []);

  // Load the 10 category-specific questions
  const questions = assessmentEngine.getQuestionsForCategory(activeCategory);
  const totalQuestions = questions.length || 10;
  const safeIndex = Math.min(Math.max(0, currentQuestionIndex), Math.max(0, totalQuestions - 1));
  const question = questions[safeIndex] || questions[0] || null;

  // Selected option state for current question
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      const ans = detailedAnswers.find((a) => a.questionId === question.id);
      setSelectedOptionId(ans ? ans.selectedOptionId : null);
    } else {
      setSelectedOptionId(null);
    }
  }, [safeIndex, detailedAnswers, question]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setErrorMessage(null);

    if (!question) return;
    const newAnswer = assessmentEngine.createAnswer(activeCategory, question.id, optionId);
    if (!newAnswer) return;

    const updatedAnswers = [...detailedAnswers];
    const existingIndex = updatedAnswers.findIndex((ans) => ans.questionId === question.id);
    if (existingIndex > -1) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
    setDetailedAnswers(updatedAnswers);
  };

  const handleNext = async () => {
    if (!question || !selectedOptionId || isSubmitting) return;

    let currentAnswers = [...detailedAnswers];
    const hasAnswer = currentAnswers.some((ans) => ans.questionId === question.id);
    if (!hasAnswer) {
      const newAnswer = assessmentEngine.createAnswer(activeCategory, question.id, selectedOptionId);
      if (newAnswer) {
        currentAnswers.push(newAnswer);
        setDetailedAnswers(currentAnswers);
      }
    }

    if (safeIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentQuestionIndex(safeIndex + 1);
    } else {
      // Last question reached -> Submit to backend
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const res = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: currentAnswers }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to save your Sanctuary Score. Please try again.");
        }

        // Store result from backend response
        setAssessmentResult({
          totalScore: data.totalScore,
          maxScore: data.maxScore || 50,
          percentage: data.percentage,
          wellnessLevel: data.wellnessLevel,
          message: data.message,
        });
        setAssessmentCompleted(true);

        // Store completion in session/local storage
        try {
          localStorage.setItem("manraah_assessment_completed", "true");
        } catch {}

        router.push("/wellness-score");
      } catch (err: any) {
        console.error("Assessment submission error:", err);
        setErrorMessage(err.message || "Something went wrong while saving your score. Please try again.");
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (safeIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(safeIndex - 1);
      setErrorMessage(null);
    } else {
      router.push("/dashboard");
    }
  };

  const currentTheme = TIME_THEMES[timeOfDay];
  const isNight = timeOfDay === "night";

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    }),
  };

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const qEmoji = getQuestionEmoji(question.text);
  const progressPercent = Math.round(((safeIndex + 1) / totalQuestions) * 100);

  return (
    <div
      className={`min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-gradient-to-b ${currentTheme.background} transition-colors duration-1000 select-none py-6 px-4 md:px-8`}
    >
      <ScreenHeader
        title="🌿 Sanctuary Score Assessment"
        showBackButton={true}
        fallbackRoute="/dashboard"
        onBack={handleBack}
      />

      {/* Floating Animated Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {AMBIENT_PARTICLES.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{ y: "105vh", opacity: 0, rotate: 0 }}
            animate={{
              y: "-10vh",
              opacity: [0, 0.4, 0.4, 0],
              rotate: 360,
              x: [0, 30, -30, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
            className="absolute text-emerald-600/15 select-none"
            style={{ left: particle.x }}
          >
            {particle.type === "leaf" ? "🍃" : "🌸"}
          </motion.span>
        ))}
      </div>

      {/* Dynamic Glow Blurs */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 25, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-[10%] right-[10%] w-[360px] h-[360px] rounded-full blur-[110px] opacity-35 ${currentTheme.glowColor}`}
        />
        <motion.div
          animate={{ scale: [1.1, 0.9, 1.1], x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[10%] w-[320px] h-[320px] rounded-full bg-secondary-container/15 blur-[100px] opacity-25"
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto flex flex-col justify-center py-4 md:py-8 z-10 relative">
        {/* Top Header Card */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 shadow-xs">
              {getCategoryJourneyBadge(activeCategory)}
            </span>
          </div>

          {/* Progress Indicator */}
          <div className="px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-primary/20 text-xs font-heading font-bold text-primary shadow-xs">
            Question {safeIndex + 1} of {totalQuestions}
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-[#7C6BC4] to-secondary-container rounded-full"
            initial={{ width: `${(safeIndex / totalQuestions) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs font-semibold text-red-600 animate-fadeIn flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 font-bold ml-2 hover:underline"
            >
              ✕
            </button>
          </div>
        )}

        {/* Question Box */}
        <div className="p-6 md:p-10 rounded-[32px] bg-white/75 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(95,78,165,0.08)] space-y-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Question header */}
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-2xl filter drop-shadow-xs">{qEmoji}</span>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-primary">
                    Sanctuary Score Inquiry
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-heading font-black text-on-surface leading-tight tracking-tight">
                  {question.text}
                </h2>
                {question.description && (
                  <p className="text-xs text-on-surface-variant/80 font-medium leading-relaxed">
                    {question.description}
                  </p>
                )}
              </div>

              {/* 5 Options List */}
              <div className="space-y-3">
                {question.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const optEmoji = getOptionEmoji(opt.score);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? "bg-primary-container/25 border-primary shadow-sm ring-2 ring-primary/25"
                          : "bg-white/60 hover:bg-white/90 border-surface-variant/30 hover:border-primary/30 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl filter drop-shadow-xs">{optEmoji}</span>
                        <span
                          className={`text-xs md:text-sm font-semibold leading-snug ${
                            isSelected ? "text-primary font-bold" : "text-on-surface"
                          }`}
                        >
                          {opt.text}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-surface-variant/50 group-hover:border-primary/40 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-xs font-bold leading-none">
                            check
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-variant/20 gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-full border border-[#7C6BC4]/20 hover:bg-primary/5 text-on-surface-variant font-heading font-bold text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>{safeIndex > 0 ? "Back" : "Dashboard"}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedOptionId || isSubmitting}
              className={`px-8 py-3.5 rounded-full font-heading font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                selectedOptionId && !isSubmitting
                  ? "bg-primary hover:bg-[#7C6BC4] text-white cursor-pointer shadow-[0_10px_25px_rgba(95,78,165,0.25)]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving your Sanctuary Score...</span>
                </>
              ) : (
                <>
                  <span>{safeIndex === totalQuestions - 1 ? "Submit Sanctuary Score" : "Continue"}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Calm privacy reminder */}
      <footer className="w-full max-w-2xl mx-auto text-center z-10 relative">
        <p className="text-[10px] text-on-surface-variant/70 font-medium">
          🌿 Your responses are encrypted and personalized strictly for your inner wellbeing journey.
        </p>
      </footer>
    </div>
  );
}
