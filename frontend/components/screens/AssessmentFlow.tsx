"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { assessmentEngine } from "@/frontend/lib/assessment/assessmentEngine";
import { evaluateWellness } from "@/frontend/lib/assessment/wellness";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";
import { getClientSession } from "@/backend/auth/client";

function getQuestionEmoji(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("happy") || lower.includes("calm") || lower.includes("balance") || lower.includes("emotion")) return "😊";
  if (lower.includes("stress") || lower.includes("overwhelm") || lower.includes("anxious") || lower.includes("worry") || lower.includes("pressure")) return "😣";
  if (lower.includes("sleep") || lower.includes("night") || lower.includes("restful") || lower.includes("wake")) return "😴";
  if (lower.includes("motivate") || lower.includes("energy") || lower.includes("energetic") || lower.includes("drive")) return "⚡";
  if (lower.includes("difficult") || lower.includes("handling") || lower.includes("confident") || lower.includes("cope") || lower.includes("handle")) return "🌱";
  if (lower.includes("focus") || lower.includes("concentrat") || lower.includes("mind") || lower.includes("clear")) return "🧠";
  if (lower.includes("social") || lower.includes("peer") || lower.includes("friend") || lower.includes("lonely") || lower.includes("connect")) return "👥";
  if (lower.includes("work") || lower.includes("career") || lower.includes("job") || lower.includes("professional") || lower.includes("burnout")) return "💼";
  if (lower.includes("family") || lower.includes("parent") || lower.includes("child") || lower.includes("home")) return "🏡";
  if (lower.includes("relationship") || lower.includes("couple") || lower.includes("partner") || lower.includes("love")) return "💖";
  if (lower.includes("body") || lower.includes("physical") || lower.includes("health") || lower.includes("fitness")) return "💪";
  return "🌿";
}

function getOptionEmoji(score: number): string {
  if (score === 5) return "😊";
  if (score === 4) return "🙂";
  if (score === 3) return "😐";
  if (score === 2) return "😕";
  return "😞";
}

export default function AssessmentFlow() {
  const router = useRouter();
  const { categoryDetails } = useCategory();
  const {
    selectedCategory,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    detailedAnswers,
    setDetailedAnswers,
    setAssessmentResult,
    setAssessmentCompleted,
  } = useAssessment();

  const [direction, setDirection] = useState(1);

  // Fall back to session/cookie category if user comes directly from dashboard
  const [effectiveCategory, setEffectiveCategory] = useState<string>(selectedCategory || "student");

  useEffect(() => {
    if (!selectedCategory) {
      const session = getClientSession();
      const sessionCat = session?.user?.selectedCategory;
      const cookieCat = typeof document !== "undefined"
        ? (document.cookie.match(/(?:^|; )userType=([^;]*)/))?.[1]
        : null;
      setEffectiveCategory(sessionCat || cookieCat || "student");
    } else {
      setEffectiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const questions = assessmentEngine.getQuestionsForCategory(effectiveCategory);
  const totalQuestions = questions.length;
  const safeIndex = Math.min(Math.max(0, currentQuestionIndex), Math.max(0, totalQuestions - 1));
  const question = questions[safeIndex] || questions[0] || null;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      const ans = detailedAnswers.find((a) => a.questionId === question.id);
      setSelectedOptionId(ans ? ans.selectedOptionId : null);
    } else {
      setSelectedOptionId(null);
    }
  }, [safeIndex, detailedAnswers, question?.id]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    if (!question) return;

    const newAnswer = assessmentEngine.createAnswer(effectiveCategory, question.id, optionId);
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

  // Reset assessment flow if retake flag is set
  useEffect(() => {
    if (typeof window !== "undefined") {
      const shouldReset = localStorage.getItem("parent_reset_assessment_flow") === "true";
      if (shouldReset) {
        localStorage.removeItem("parent_reset_assessment_flow");
        sessionStorage.removeItem("manraah_onboarding_assessment");
        setCurrentQuestionIndex(0);
        setDetailedAnswers([]);
      }
    }
  }, [setCurrentQuestionIndex, setDetailedAnswers]);

  const handleNext = () => {
    if (!question || !selectedOptionId) return;

    let currentAnswers = detailedAnswers;
    const hasAnswer = detailedAnswers.some((ans) => ans.questionId === question.id);
    if (!hasAnswer) {
      const newAnswer = assessmentEngine.createAnswer(effectiveCategory, question.id, selectedOptionId);
      if (newAnswer) {
        currentAnswers = [...detailedAnswers, newAnswer];
        setDetailedAnswers(currentAnswers);
      }
    }

    if (safeIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentQuestionIndex(safeIndex + 1);
    } else {
      const results = evaluateWellness(currentAnswers);
      setAssessmentResult(results);
      setAssessmentCompleted(true);

      const userType = effectiveCategory || "student";
      document.cookie = `userType=${userType}; path=/; max-age=86400`;

      router.push("/wellness-score");
    }
  };

  const handleBack = () => {
    if (safeIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(safeIndex - 1);
    } else {
      router.push("/category-selection");
    }
  };

  const handleSkip = () => {
    let currentAnswers = [...detailedAnswers];
    for (let i = safeIndex; i < totalQuestions; i++) {
      const q = questions[i];
      const hasAnswer = currentAnswers.some((ans) => ans.questionId === q.id);
      if (!hasAnswer) {
        const midOption = q.options[Math.floor(q.options.length / 2)] || q.options[0];
        const newAnswer = assessmentEngine.createAnswer(effectiveCategory, q.id, midOption.id);
        if (newAnswer) {
          currentAnswers.push(newAnswer);
        }
      }
    }
    const results = evaluateWellness(currentAnswers);
    setAssessmentResult(results);
    setAssessmentCompleted(true);

    const userType = effectiveCategory || "student";
    document.cookie = `userType=${userType}; path=/; max-age=86400`;

    router.push("/wellness-score");
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
    }),
  };

  const transitionSettings = {
    duration: 0.5,
    ease: [0.25, 0.8, 0.25, 1],
  };

  const progressPercentage = (safeIndex / totalQuestions) * 100;
  const onBackAction = safeIndex > 0 ? handleBack : () => router.push("/category-selection");

  return (
    <div className="bg-[#EAEAF3] dark:bg-[#0D1F2D] h-screen max-h-screen overflow-hidden relative flex flex-col justify-center items-center py-6 px-4 md:px-8 select-none">
      {/* Immersive Mockup Card */}
      <div className="max-w-2xl w-full rounded-[40px] bg-white dark:bg-[#132E3F] border border-slate-100 dark:border-slate-800 shadow-xl p-8 md:p-10 flex flex-col justify-between h-[85vh] max-h-[640px] overflow-hidden relative">
        
        {/* Top Header inside Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#B2B0BD]">
            <span>{effectiveCategory.replace(/_/g, " ")} assessment</span>
            <span>Question {safeIndex + 1} of {totalQuestions}</span>
          </div>

          {/* Progress Bar inside Card */}
          <div className="w-full bg-[#EAEAF3] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#5F4BB6] rounded-full"
              initial={{ width: `${(safeIndex / (totalQuestions || 10)) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated Question Content inside Card */}
        <div className="flex-1 flex flex-col justify-center py-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {question && (
              <motion.div
                key={`q-${safeIndex}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transitionSettings}
                className="space-y-6 flex flex-col justify-between overflow-hidden"
              >
                {/* Question text (No emoji, bold text) */}
                <h2 className="text-xl md:text-2xl font-sans font-extrabold text-slate-800 dark:text-slate-100 leading-snug tracking-tight">
                  {question.text}
                </h2>

                {/* Option Cards Grid (No emoji, left aligned, bg light gray capsule) */}
                <div className="space-y-3 relative z-20" role="radiogroup" aria-label={question.text}>
                  {question.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectOption(opt.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-full py-4 px-6 rounded-[20px] text-left cursor-pointer transition-all duration-200 font-sans font-bold text-sm ${
                          isSelected
                            ? "bg-[#5F4BB6] text-white shadow-md font-extrabold"
                            : "bg-[#F4F5F9] dark:bg-[#1E3E52] text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 font-semibold"
                        }`}
                      >
                        {opt.text}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls inside Card */}
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-2">
          {safeIndex > 0 ? (
            <button
              onClick={handleBack}
              type="button"
              className="flex items-center gap-1 font-bold text-xs uppercase text-[#B2B0BD] hover:text-[#5F4BB6] transition-all cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
              Back
            </button>
          ) : (
            <button
              onClick={() => router.push("/category-selection")}
              type="button"
              className="flex items-center gap-1 font-bold text-xs uppercase text-[#B2B0BD] hover:text-[#5F4BB6] transition-all cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-sm font-black">arrow_back</span>
              Categories
            </button>
          )}

          {safeIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={!selectedOptionId}
              type="button"
              className="px-8 py-3.5 rounded-full font-bold text-xs uppercase bg-[#5F4BB6] text-white hover:bg-[#4E3CA3] transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
              <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedOptionId}
              type="button"
              className="px-8 py-3.5 rounded-full font-bold text-xs uppercase bg-[#5F4BB6] text-white hover:bg-[#4E3CA3] transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Complete ✨
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
