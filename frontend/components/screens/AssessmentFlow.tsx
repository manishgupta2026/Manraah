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
    <div className="bg-surface text-on-surface h-screen max-h-screen overflow-hidden relative flex flex-col justify-between py-6 px-4 md:px-8 select-none">
      <ScreenHeader
        title="📋 Assessment"
        showBackButton={true}
        onBack={onBackAction}
        action={{ label: "Skip", onClick: handleSkip }}
      />

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between gap-6 z-10 my-2 overflow-hidden">
        {/* Progress Area */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
            <div>
              <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 justify-center md:justify-start">
                🌸 Let's get to know you
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest block text-center md:text-left mt-0.5 text-on-surface-variant/70">
                Focus: {categoryDetails.name}
              </span>
            </div>
            <span className="font-bold text-xs md:text-sm text-primary tracking-wide text-center md:text-right block">
              Question {safeIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden shadow-inner border border-surface-variant/30">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-purple rounded-full"
              initial={{ width: `${(safeIndex / (totalQuestions || 15)) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated Question Content */}
        <div className="flex-1 flex flex-col justify-center py-2 overflow-hidden">
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
                className="rounded-[36px] bg-surface-container-lowest border border-surface-variant/30 shadow-soft p-6 md:p-10 space-y-6 relative z-20 flex flex-col justify-between overflow-hidden"
              >
                {/* Question block */}
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-heading font-extrabold text-on-surface leading-relaxed tracking-tight flex flex-col md:flex-row items-center gap-3">
                    <span className="text-3xl filter drop-shadow-sm shrink-0 mb-1.5 md:mb-0">
                      {getQuestionEmoji(question.text)}
                    </span>
                    <span className="flex-1">{question.text}</span>
                  </h2>
                  <p className="text-xs md:text-sm font-semibold italic max-w-lg mx-auto md:mx-0 text-on-surface-variant/75">
                    "There are no right or wrong answers. Answer honestly so we can better support you."
                  </p>
                </div>

                {/* Option Cards Grid */}
                <div className="space-y-3.5 relative z-20 overflow-y-auto max-h-[42vh] pr-1" role="radiogroup" aria-label={question.text}>
                  {question.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectOption(opt.id)}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        animate={isSelected ? { y: -2, scale: 1.015 } : { y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-full flex items-center justify-between p-5 rounded-[24px] border text-left cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? "bg-primary-container/10 border-primary text-primary font-bold shadow-md ring-2 ring-primary/20"
                            : "bg-surface-container-low border-surface-variant/30 text-on-surface-variant hover:bg-surface-container-high hover:border-primary/20"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 select-none pointer-events-none">
                          <span className="text-xl shrink-0 filter drop-shadow-sm">{getOptionEmoji(opt.score)}</span>
                          <span className="text-sm md:text-base font-semibold leading-normal">{opt.text}</span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all pointer-events-none ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-outline-variant bg-surface-container"
                          }`}
                        >
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 22 }}
                              className="material-symbols-outlined text-white text-[12px] font-extrabold"
                            >
                              check
                            </motion.span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center border-t border-surface-variant/20 pt-6">
          {safeIndex > 0 ? (
            <button
              onClick={handleBack}
              type="button"
              className="px-6 py-3.5 rounded-full font-bold text-sm bg-surface-container border border-surface-variant/30 text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Previous
            </button>
          ) : (
            <button
              onClick={() => router.push("/category-selection")}
              type="button"
              className="px-6 py-3.5 rounded-full font-bold text-sm bg-surface-container border border-surface-variant/30 text-on-surface hover:bg-surface-container-high transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Categories
            </button>
          )}

          {safeIndex < totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={!selectedOptionId}
              type="button"
              className="px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-white hover:bg-primary-purple transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next Question
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selectedOptionId}
              type="button"
              className="px-8 py-3.5 rounded-full font-bold text-sm bg-primary text-white hover:bg-primary-purple transition-all flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Complete Assessment ✨
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
