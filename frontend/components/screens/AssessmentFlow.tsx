"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { COMMON_QUESTIONS } from "@/frontend/lib/assessment/commonQuestions";
import { assessmentEngine } from "@/frontend/lib/assessment/assessmentEngine";

export default function AssessmentFlow() {
  const router = useRouter();
  const { categoryDetails } = useCategory();
  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    detailedAnswers,
    setDetailedAnswers,
  } = useAssessment();

  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  // Total questions is 10 (5 common + 5 category specific planned)
  const totalQuestions = 10;
  const isPlaceholderScreen = currentQuestionIndex === 5;

  const question = !isPlaceholderScreen ? COMMON_QUESTIONS[currentQuestionIndex] : null;

  // Find if there is an existing answer for this question to pre-fill selection
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Sync selectedOptionId when current index or answers change
  useEffect(() => {
    if (question) {
      const ans = detailedAnswers.find((a) => a.questionId === question.id);
      setSelectedOptionId(ans ? ans.selectedOptionId : null);
    } else {
      setSelectedOptionId(null);
    }
  }, [currentQuestionIndex, detailedAnswers, question]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleNext = () => {
    if (isPlaceholderScreen) {
      // Navigate to login
      router.push("/login");
      return;
    }

    if (!question || !selectedOptionId) return;

    // Create the structured answer
    const newAnswer = assessmentEngine.createAnswer(question.id, selectedOptionId);
    if (!newAnswer) return;

    // Update detailedAnswers array in Context
    const updatedAnswers = [...detailedAnswers];
    const existingIndex = updatedAnswers.findIndex((ans) => ans.questionId === question.id);
    if (existingIndex > -1) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
    setDetailedAnswers(updatedAnswers);

    setDirection(1);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Custom premium bezier transition
  const transitionSettings = {
    duration: 0.6,
    ease: [0.25, 1, 0.5, 1],
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  // Progress percentage (out of 10 questions)
  const progressPercentage = ((currentQuestionIndex) / totalQuestions) * 100;

  return (
    <div className="bg-background text-on-background min-h-screen relative flex flex-col justify-between py-12 px-4 md:px-8 overflow-hidden">
      {/* Calming Backdrop Glows */}
      <div className="fixed inset-0 z-[-2] opacity-35 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-primary-container blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-secondary-container blur-[120px] opacity-30" />
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between gap-8 z-10">
        
        {/* Progress Area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs md:text-sm text-on-surface-variant/80 font-medium">
            <span className="px-3.5 py-1.5 rounded-full bg-surface-container-high border border-surface-variant/50 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Focus: {categoryDetails.name}
            </span>
            <span className="font-bold text-primary tracking-wide">
              {isPlaceholderScreen ? "Milestone Reached" : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden shadow-inner border border-surface-variant/20">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-purple rounded-full"
              initial={{ width: `${(currentQuestionIndex) * 10}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated Content */}
        <div className="flex-1 flex flex-col justify-center min-h-[420px] py-4">
          <AnimatePresence mode="wait" custom={direction}>
            {!isPlaceholderScreen ? (
              question && (
                <motion.div
                  key={`q-${currentQuestionIndex}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transitionSettings}
                  className="space-y-8"
                >
                  {/* Question block */}
                  <div className="space-y-3 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-on-surface leading-snug tracking-tight">
                      {question.text}
                    </h2>
                    <p className="text-sm md:text-base text-on-surface-variant/80 font-medium italic opacity-90">
                      "There are no right or wrong answers. Your responses help us personalise your experience."
                    </p>
                  </div>

                  {/* Option cards */}
                  <div className="space-y-3.5" role="radiogroup" aria-label={question.text}>
                    {question.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => handleSelectOption(opt.id)}
                          className={`w-full flex items-center justify-between p-5 rounded-[24px] transition-all border text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            isSelected
                              ? "bg-surface-container-lowest border-primary shadow-card-lift ring-2 ring-primary/20 text-primary font-bold"
                              : "bg-surface-container-lowest border-surface-variant/30 shadow-soft hover:shadow-md hover:border-primary/30 text-on-surface-variant"
                          }`}
                        >
                          <span className="text-sm md:text-base font-medium">{opt.text}</span>
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-outline-variant group-hover:border-primary/50"
                            }`}
                          >
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )
            ) : (
              <motion.div
                key="placeholder-screen"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transitionSettings}
                className="text-center space-y-8 max-w-md mx-auto py-6"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-inner">
                  <span className="text-5xl select-none">✨</span>
                </div>

                <div className="space-y-4">
                  <h2 className="text-3xl font-heading font-bold text-on-surface">
                    Great!
                  </h2>
                  <p className="text-base text-on-surface-variant leading-relaxed">
                    You've completed the first part of your assessment.
                  </p>
                  <p className="text-sm text-on-surface-variant/70 italic bg-surface-container/30 py-3 px-6 rounded-2xl border border-surface-variant/20 inline-block font-semibold">
                    Category-specific questions will continue here.<br />
                    (Currently under development.)
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center border-t border-surface-variant/20 pt-6">
          {currentQuestionIndex > 0 ? (
            <button
              onClick={handleBack}
              type="button"
              className="px-6 py-3.5 rounded-full bg-surface-container-low text-on-surface-variant font-bold text-sm hover:bg-surface-container hover:scale-102 active:scale-98 transition-all flex items-center gap-2 border border-surface-variant/20 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Previous
            </button>
          ) : (
            <div className="w-10" />
          )}

          <button
            onClick={handleNext}
            type="button"
            disabled={!isPlaceholderScreen && !selectedOptionId}
            className="ml-auto px-10 py-3.5 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple hover:scale-102 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {isPlaceholderScreen ? "Continue to Sign In" : "Continue"}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}

