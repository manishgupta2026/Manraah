"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";

interface QuestionItem {
  id: number;
  categoryId: string;
  questionText: string;
  questionOrder: number;
  reverseScored: boolean;
  optionsJson?: { score: number; text: string }[];
}

const DEFAULT_OPTIONS = [
  { score: 1, text: "Never / Rarely" },
  { score: 2, text: "Seldom" },
  { score: 3, text: "Sometimes" },
  { score: 4, text: "Often" },
  { score: 5, text: "Almost Always" },
];

export default function WellnessAssessmentModal() {
  const {
    isAssessmentModalOpen,
    activeAssessmentCategory,
    allCategories,
    closeAssessment,
    submitAssessment,
  } = useWellnessScore();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionStep, setQuestionStep] = useState(0); // 0 to 4
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const activeCategoryInfo =
    allCategories.find((c) => c.id === activeAssessmentCategory) || {
      id: activeAssessmentCategory,
      name:
        activeAssessmentCategory === "working-professional"
          ? "Working Professional"
          : activeAssessmentCategory.charAt(0).toUpperCase() + activeAssessmentCategory.slice(1),
      icon: "🌱",
      description: "Category wellness assessment",
    };

  // Reset state and load questions whenever modal opens
  useEffect(() => {
    if (!isAssessmentModalOpen) return;

    setQuestionStep(0);
    setAnswers({});
    setSubmittedScore(null);
    setSubmissionError(null);
    setIsCompleted(false);

    async function loadQuestions() {
      try {
        setLoadingQuestions(true);
        const res = await fetch(`/api/wellness/category/${activeAssessmentCategory}/questions`);
        if (!res.ok) {
          throw new Error("Failed to load questions for this category.");
        }
        const data = await res.json();
        if (Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      } catch (err: any) {
        console.error("Error loading assessment questions:", err);
        setSubmissionError("Unable to load assessment questions. Please try again.");
      } finally {
        setLoadingQuestions(false);
      }
    }

    loadQuestions();
  }, [isAssessmentModalOpen, activeAssessmentCategory]);

  if (!isAssessmentModalOpen) return null;

  const currentQ = questions[questionStep];
  const isCurrentQAnswered = currentQ && answers[currentQ.id] !== undefined;

  const handleSelectOption = (score: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: score }));
  };

  const handleNextQuestion = () => {
    if (questionStep < questions.length - 1) {
      setQuestionStep((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionStep > 0) {
      setQuestionStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (questions.length !== 5) return;

    for (const q of questions) {
      if (answers[q.id] === undefined) {
        setSubmissionError("Please answer all 5 questions before calculating your score.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id],
      }));

      const res = await submitAssessment(activeAssessmentCategory, formattedAnswers);

      setSubmittedScore(res.score);
      setIsCompleted(true);
    } catch (err: any) {
      console.error("Failed to submit assessment:", err);
      setSubmissionError(err.message || "Failed to calculate wellness score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white dark:bg-[#102F27] border border-[#E2ECE6] dark:border-[#23483E] rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2ECE6] dark:border-[#23483E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex items-center justify-center text-xl shadow-xs">
              ✦
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-tight">
                {activeCategoryInfo.name} Wellness Assessment
              </h2>
              <p className="text-[11.5px] text-[#789389] dark:text-[#78958C] font-medium">
                5 targeted questions to calculate your category wellness score.
              </p>
            </div>
          </div>
          <button
            onClick={closeAssessment}
            className="w-8 h-8 rounded-full bg-[#F4FAF7] dark:bg-[#14382F] text-[#4F685F] dark:text-[#A9C5BC] flex items-center justify-center hover:bg-[#E2ECE6] dark:hover:bg-[#1A483C] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 pr-1">
          {loadingQuestions ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-9 h-9 border-3 border-[#008968] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#789389] dark:text-[#78958C] font-medium">
                Loading assessment questions...
              </p>
            </div>
          ) : isCompleted && submittedScore !== null ? (
            /* RESULT SCREEN */
            <div className="space-y-6 text-center py-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative w-32 h-32 mx-auto flex items-center justify-center"
              >
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-[#E9F3EE] dark:text-[#14382F]"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="text-[#008968] dark:text-[#00A982]"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{
                      strokeDashoffset: 251.2 - (251.2 * submittedScore) / 100,
                    }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                    {submittedScore}%
                  </span>
                  <span className="text-[9px] font-bold text-[#789389] dark:text-[#78958C] uppercase tracking-wider">
                    Score
                  </span>
                </div>
              </motion.div>

              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] border border-[#008968]/20">
                  Assessment Complete
                </span>
                <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  {activeCategoryInfo.name} Wellness Score Saved!
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] max-w-sm mx-auto leading-relaxed">
                  Your wellness baseline is calculated and stored. It will remain saved on your dashboard and won&apos;t recalculate unless you choose to re-attempt.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E2ECE6] dark:border-[#23483E] flex items-center justify-center">
                <button
                  onClick={closeAssessment}
                  className="px-8 py-3 rounded-full bg-[#004D3D] hover:bg-[#003B2E] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold shadow-md shadow-[#004D3D]/20 transition-all cursor-pointer"
                >
                  View on Dashboard →
                </button>
              </div>
            </div>
          ) : questions.length === 5 ? (
            /* 5 ASSESSMENT QUESTIONS */
            <div className="space-y-5">
              {/* Progress & Breadcrumb */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006C56] dark:text-[#00A982]">
                  Question {questionStep + 1} of 5
                </span>
                <span className="text-xs font-bold text-[#789389] dark:text-[#78958C]">
                  {Math.round(((questionStep + 1) / 5) * 100)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] overflow-hidden">
                <motion.div
                  className="h-full bg-[#006C56] dark:bg-[#00A982] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((questionStep + 1) / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Question Text */}
              {currentQ && (
                <div className="space-y-4 pt-1">
                  <h3 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] leading-snug">
                    {currentQ.questionText}
                  </h3>

                  {/* Likert Scale Options */}
                  <div className="space-y-2 pt-2">
                    {(currentQ.optionsJson && currentQ.optionsJson.length > 0
                      ? currentQ.optionsJson
                      : DEFAULT_OPTIONS
                    ).map((opt) => {
                      const isSelected = answers[currentQ.id] === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleSelectOption(opt.score)}
                          className={`w-full p-3.5 rounded-2xl flex items-center justify-between border transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#008968] dark:border-[#00A982] ring-2 ring-[#008968]/20 dark:ring-[#00A982]/20"
                              : "bg-[#F8FCFA] dark:bg-[#0E2A23] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#008968]/40 dark:hover:border-[#00A982]/40"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold ${
                              isSelected
                                ? "text-[#006C56] dark:text-[#00A982]"
                                : "text-[#19332A] dark:text-[#F4FAF7]"
                            }`}
                          >
                            {opt.text}
                          </span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? "bg-[#006C56] border-[#006C56] text-white"
                                : "border-[#789389]/40 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {submissionError && (
                <p className="text-xs font-bold text-red-500 dark:text-red-400">
                  {submissionError}
                </p>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE6] dark:border-[#23483E]">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={questionStep === 0}
                  className="px-4 py-2.5 rounded-xl bg-[#F4FAF7] dark:bg-[#14382F] hover:bg-[#E2ECE6] dark:hover:bg-[#1C4E40] text-[#4F685F] dark:text-[#A9C5BC] text-xs font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  ← Previous
                </button>

                {questionStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!isCurrentQAnswered}
                    className="px-6 py-2.5 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold transition-all shadow-md shadow-[#006C56]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next Question →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isCurrentQAnswered || isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#006C56] hover:bg-[#005241] dark:bg-[#00A982] dark:hover:bg-[#00916F] text-white dark:text-[#071C17] text-xs font-bold transition-all shadow-md shadow-[#006C56]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Calculating Score...</span>
                      </>
                    ) : (
                      <>
                        <span>Calculate Wellness Score</span>
                        <span>✦</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#789389] dark:text-[#78958C]">
              No questions found for this category.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
