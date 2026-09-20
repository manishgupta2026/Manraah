"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellnessScore } from "@/frontend/lib/context/WellnessScoreContext";
import { useWellness } from "@/frontend/lib/context/WellnessContext";

interface QuestionItem {
  id: number;
  categoryId: string;
  questionText: string;
  questionOrder: number;
  reverseScored: boolean;
  optionsJson?: { score: number; text: string }[];
}

const MOOD_OPTIONS = [
  { id: "Happy", label: "Happy", emoji: "😊", color: "from-amber-400/20 to-emerald-400/20" },
  { id: "Calm", label: "Calm", emoji: "😌", color: "from-emerald-400/20 to-teal-400/20" },
  { id: "Neutral", label: "Neutral", emoji: "😐", color: "from-slate-400/20 to-zinc-400/20" },
  { id: "Anxious", label: "Anxious", emoji: "😟", color: "from-violet-400/20 to-indigo-400/20" },
  { id: "Sad", label: "Sad", emoji: "😔", color: "from-blue-400/20 to-cyan-400/20" },
  { id: "Stressed", label: "Stressed", emoji: "😤", color: "from-rose-400/20 to-orange-400/20" },
  { id: "Tired", label: "Tired", emoji: "😴", color: "from-purple-400/20 to-blue-400/20" },
  { id: "Motivated", label: "Motivated", emoji: "💪", color: "from-orange-400/20 to-amber-400/20" },
];

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
    submitFullCheckIn,
  } = useWellnessScore();

  const { refetchWellnessData } = useWellness();

  // Modal Steps:
  // 0: Mood selection
  // 1: Optional Note
  // 2 to 6: 5 Category Questions (question 0 to 4)
  // 7: Result Screen
  const [step, setStep] = useState<number>(0);
  const [selectedMood, setSelectedMood] = useState<string>("Calm");
  const [note, setNote] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionStep, setQuestionStep] = useState(0); // 0 to 4
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);
  const [newStreak, setNewStreak] = useState<number>(1);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const activeCategoryInfo =
    allCategories.find((c) => c.id === activeAssessmentCategory) || {
      id: activeAssessmentCategory,
      name:
        activeAssessmentCategory === "working-professional"
          ? "Working Professional"
          : activeAssessmentCategory.charAt(0).toUpperCase() + activeAssessmentCategory.slice(1),
      icon: "🌱",
      description: "Daily wellness check-in",
    };

  // Reset state and load questions whenever modal opens
  useEffect(() => {
    if (!isAssessmentModalOpen) return;

    setStep(0);
    setSelectedMood("Calm");
    setNote("");
    setQuestionStep(0);
    setAnswers({});
    setSubmittedScore(null);
    setSubmissionError(null);

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

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleSelectOption = (score: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: score }));
  };

  const handleNextFromMood = () => {
    setStep(1); // Go to optional note
  };

  const handleNextFromNote = () => {
    setStep(2); // Go to question 1
    setQuestionStep(0);
  };

  const handleNextQuestion = () => {
    if (questionStep < questions.length - 1) {
      setQuestionStep((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionStep > 0) {
      setQuestionStep((prev) => prev - 1);
    } else {
      setStep(1); // Back to note
    }
  };

  const handleSubmit = async () => {
    if (questions.length !== 5) return;

    for (const q of questions) {
      if (answers[q.id] === undefined) {
        setSubmissionError("Please answer all 5 questions before completing.");
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

      const res = await submitFullCheckIn(
        selectedMood,
        note,
        activeAssessmentCategory,
        formattedAnswers
      );

      setSubmittedScore(res.score);
      setNewStreak(res.currentStreak || 1);
      setStep(3); // Result step

      // Refresh background wellness & journey data
      await refetchWellnessData();
    } catch (err: any) {
      console.error("Failed to submit check-in:", err);
      setSubmissionError(err.message || "Failed to submit check-in. Please try again.");
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
                Today&apos;s Wellness Check-In
              </h2>
              <p className="text-[11.5px] text-[#789389] dark:text-[#78958C] font-medium">
                Take one minute for yourself.
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
                Preparing your check-in...
              </p>
            </div>
          ) : step === 0 ? (
            /* STEP 1: MOOD SELECTION */
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006C56] dark:text-[#00A982]">
                  Step 1 of 3
                </span>
                <h3 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mt-0.5">
                  How are you feeling right now?
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
                  Select the mood that best resonates with your current state.
                </p>
              </div>

              {/* 8 Large Emoji Buttons with Spring Animation & Glow */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = selectedMood === mood.id;
                  return (
                    <motion.button
                      key={mood.id}
                      type="button"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      onClick={() => handleSelectMood(mood.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all cursor-pointer select-none relative overflow-hidden ${
                        isSelected
                          ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#008968] dark:border-[#00A982] shadow-lg shadow-[#008968]/15 ring-2 ring-[#008968]/30 dark:ring-[#00A982]/30"
                          : "bg-[#F8FCFA] dark:bg-[#0E2A23] border-[#E2ECE6] dark:border-[#23483E] hover:border-[#008968]/50 dark:hover:border-[#00A982]/50 hover:bg-[#F2FAF6] dark:hover:bg-[#13352B]"
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl filter drop-shadow-xs">
                        {mood.emoji}
                      </span>
                      <span
                        className={`text-xs font-bold leading-tight ${
                          isSelected
                            ? "text-[#006C56] dark:text-[#00A982] font-black"
                            : "text-[#19332A] dark:text-[#F4FAF7]"
                        }`}
                      >
                        {mood.label}
                      </span>

                      {isSelected && (
                        <motion.div
                          layoutId="activeMoodCheck"
                          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#006C56] text-white flex items-center justify-center text-[9px] font-bold"
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 2: OPTIONAL NOTE / REFLECTION */
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006C56] dark:text-[#00A982]">
                  Step 2 of 3
                </span>
                <h3 className="text-base sm:text-lg font-heading font-black text-[#19332A] dark:text-[#F4FAF7] mt-0.5">
                  Want to share what&apos;s on your mind?
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium mt-1">
                  Optional reflection to look back on in your journey timeline.
                </p>
              </div>

              {/* Selected Mood Preview */}
              <div className="flex items-center gap-2 p-2.5 px-3 rounded-xl bg-[#EAF6F0] dark:bg-[#14382F] border border-[#D2E8DC] dark:border-[#23483E] text-xs font-bold text-[#006C56] dark:text-[#00A982] w-fit">
                <span>Selected Mood:</span>
                <span>
                  {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.emoji}{" "}
                  {selectedMood}
                </span>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-[#4F685F] dark:text-[#A9C5BC]">
                  Personal note or triggers (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="I had a stressful class today, but feeling grounded after a short walk..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl bg-[#F8FCFA] dark:bg-[#0E2A23] border border-[#E2ECE6] dark:border-[#23483E] text-[#19332A] dark:text-[#F4FAF7] text-xs placeholder:text-[#A0B8AF] focus:outline-none focus:ring-2 focus:ring-[#008968] dark:focus:ring-[#00A982] transition-all resize-none"
                />
              </div>
            </div>
          ) : step === 2 && questions.length === 5 ? (
            /* STEP 3: 5 CATEGORY WELLNESS QUESTIONS */
            <div className="space-y-5">
              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-[#789389] dark:text-[#78958C]">
                  <span>
                    {activeCategoryInfo.name} Wellness: Question {questionStep + 1} of 5
                  </span>
                  <span>{Math.round(((questionStep + 1) / 5) * 100)}%</span>
                </div>
                <div className="w-full bg-[#EAF6F0] dark:bg-[#14382F] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#008968] dark:bg-[#00A982] h-full rounded-full transition-all duration-300"
                    style={{ width: `${((questionStep + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="min-h-[58px] flex items-center">
                <h3 className="text-sm sm:text-base font-heading font-bold text-[#19332A] dark:text-[#F4FAF7] leading-snug">
                  {currentQ?.questionText}
                </h3>
              </div>

              {/* 5 Likert Options */}
              <div className="space-y-2 pt-1">
                {(currentQ?.optionsJson && currentQ.optionsJson.length === 5
                  ? currentQ.optionsJson
                  : DEFAULT_OPTIONS
                ).map((opt) => {
                  const isSelected = answers[currentQ?.id] === opt.score;
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => handleSelectOption(opt.score)}
                      className={`w-full p-3.5 rounded-2xl text-left text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#EAF6F0] dark:bg-[#14382F] border-[#008968] dark:border-[#00A982] text-[#006C56] dark:text-[#00A982] shadow-xs ring-1 ring-[#008968]/30"
                          : "bg-[#F8FCFA] dark:bg-[#0E2A23] border-[#E2ECE6] dark:border-[#23483E] text-[#19332A] dark:text-[#F4FAF7] hover:border-[#008968]/50"
                      }`}
                    >
                      <span>{opt.text}</span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                          isSelected
                            ? "bg-[#006C56] text-white border-[#006C56]"
                            : "border-[#A9C5BC] dark:border-[#2E584C] text-[#789389]"
                        }`}
                      >
                        {opt.score}
                      </span>
                    </button>
                  );
                })}
              </div>

              {submissionError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold text-center pt-2">
                  {submissionError}
                </p>
              )}
            </div>
          ) : step === 3 && submittedScore !== null ? (
            /* STEP 4: CELEBRATION & RESULTS SCREEN */
            <div className="py-6 text-center space-y-5">
              {/* Score & Streak Badges */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] flex flex-col items-center justify-center shadow-md border border-[#D2E8DC] dark:border-[#23483E]">
                  <span className="text-2xl font-heading font-black">{submittedScore}%</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#789389] dark:text-[#78958C]">
                    Score
                  </span>
                </div>

                <div className="w-20 h-20 rounded-full bg-[#FFF8F2] dark:bg-[#14382F] text-[#F28C4B] flex flex-col items-center justify-center shadow-md border border-[#FDE5D2] dark:border-[#23483E]">
                  <span className="text-xl">🔥</span>
                  <span className="text-xs font-heading font-black">Day {newStreak}</span>
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#789389] dark:text-[#78958C]">
                    Streak
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5 max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6F0] dark:bg-[#14382F] text-[#006C56] dark:text-[#00A982] text-xs font-bold">
                  <span>Mood: {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.emoji} {selectedMood}</span>
                </div>

                <h3 className="text-xl font-heading font-black text-[#19332A] dark:text-[#F4FAF7]">
                  Today&apos;s Check-In Complete!
                </h3>
                <p className="text-xs text-[#6B857C] dark:text-[#A9C5BC] font-medium leading-relaxed">
                  Your daily mood and {activeCategoryInfo.name} wellness score have been securely saved. Your dashboard, streak, and My Journey timeline are now updated.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={closeAssessment}
                  className="px-6 py-2.5 rounded-2xl bg-[#006C56] hover:bg-[#005241] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#789389]">
              Loading check-in questions...
            </div>
          )}
        </div>

        {/* Footer Navigation Actions */}
        {step !== 3 && !loadingQuestions && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E2ECE6] dark:border-[#23483E]">
            {step === 0 ? (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={handleNextFromMood}
                  className="px-5 py-2.5 rounded-xl bg-[#006C56] text-white text-xs font-bold shadow-sm transition-all hover:bg-[#005241] cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              </div>
            ) : step === 1 ? (
              <div className="w-full flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F] transition-colors cursor-pointer"
                >
                  ← Back to Mood
                </button>
                <button
                  type="button"
                  onClick={handleNextFromNote}
                  className="px-5 py-2.5 rounded-xl bg-[#006C56] text-white text-xs font-bold shadow-sm transition-all hover:bg-[#005241] cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next: Wellness Questions</span>
                  <span>→</span>
                </button>
              </div>
            ) : step === 2 ? (
              <div className="w-full flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4F685F] dark:text-[#A9C5BC] hover:bg-[#F4FAF7] dark:hover:bg-[#14382F] transition-colors cursor-pointer disabled:opacity-50"
                >
                  ← Previous
                </button>

                {questionStep === questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isCurrentQAnswered || isSubmitting}
                    className={`px-5 py-2.5 rounded-xl bg-[#006C56] text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${
                      !isCurrentQAnswered || isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#005241]"
                    }`}
                  >
                    {isSubmitting ? "Saving Check-In..." : "Complete Check-In ✓"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={!isCurrentQAnswered}
                    className={`px-5 py-2.5 rounded-xl bg-[#006C56] text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${
                      !isCurrentQAnswered
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-[#005241]"
                    }`}
                  >
                    Next Question →
                  </button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </motion.div>
    </div>
  );
}
