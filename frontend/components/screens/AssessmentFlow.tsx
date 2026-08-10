"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { assessmentEngine } from "@/frontend/lib/assessment/assessmentEngine";
import { evaluateWellness } from "@/frontend/lib/assessment/wellness";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

interface TimeTheme {
  background: string;
  glowColor: string;
}

const TIME_THEMES: Record<"morning" | "afternoon" | "evening" | "night", TimeTheme> = {
  morning: {
    background: "from-[#FFFDF4] via-[#FFF5EC] to-[#EAE4F5]", // Warm sunlight
    glowColor: "bg-amber-200/20",
  },
  afternoon: {
    background: "from-[#F2F4FD] via-[#ECE6F6] to-[#FCE6EC]", // Calming Lavender
    glowColor: "bg-primary-container/20",
  },
  evening: {
    background: "from-[#FFF4E4] via-[#FDE4EB] to-[#ECE7F6]", // Golden sunset twilight
    glowColor: "bg-orange-300/15",
  },
  night: {
    background: "from-[#090C16] via-[#10172A] to-[#20183B]", // Starlit moonlight
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

  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "afternoon" | "evening" | "night">("afternoon");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
    else if (hour >= 17 && hour < 21) setTimeOfDay("evening");
    else setTimeOfDay("night");
  }, []);

  // Load the 15 questions dynamically based on selected category (5 common + 10 category-specific)
  const questions = assessmentEngine.getQuestionsForCategory(selectedCategory);
  const totalQuestions = questions.length;
  const safeIndex = Math.min(Math.max(0, currentQuestionIndex), Math.max(0, totalQuestions - 1));
  const question = questions[safeIndex] || questions[0] || null;

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
  }, [safeIndex, detailedAnswers, question?.id]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);

    if (!question) return;
    const newAnswer = assessmentEngine.createAnswer(selectedCategory, question.id, optionId);
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
      const newAnswer = assessmentEngine.createAnswer(selectedCategory, question.id, selectedOptionId);
      if (newAnswer) {
        currentAnswers = [...detailedAnswers, newAnswer];
        setDetailedAnswers(currentAnswers);
      }
    }

    if (safeIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentQuestionIndex(safeIndex + 1);
    } else {
      // Completed all questions
      const results = evaluateWellness(currentAnswers);
      setAssessmentResult(results);
      setAssessmentCompleted(true);
      
      const userType = selectedCategory === "couples" || selectedCategory === "couple" ? "couples" : (selectedCategory === "parents" || selectedCategory === "parent" ? "parents" : "student");
      document.cookie = `userType=${userType}; path=/; max-age=86400`;
      console.log("[Trace Point 1] After assessment: userType =", userType);

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
        const newAnswer = assessmentEngine.createAnswer(selectedCategory, q.id, midOption.id);
        if (newAnswer) {
          currentAnswers.push(newAnswer);
        }
      }
    }
    const results = evaluateWellness(currentAnswers);
    setAssessmentResult(results);
    setAssessmentCompleted(true);

    const userType = selectedCategory === "couples" || selectedCategory === "couple" ? "couples" : (selectedCategory === "parents" || selectedCategory === "parent" ? "parents" : "student");
    document.cookie = `userType=${userType}; path=/; max-age=86400`;
    console.log("[Trace Point 1] After assessment: userType =", userType);

    router.push("/wellness-score");
  };

  // Conversational view sliding variants (slower, calming curves)
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
    duration: 0.65,
    ease: [0.25, 0.8, 0.25, 1], // Smooth calming cubic-bezier curve
  };

  const progressPercentage = ((safeIndex) / totalQuestions) * 100;
  const activeTheme = TIME_THEMES[timeOfDay];
  const onBackAction = safeIndex > 0 ? handleBack : () => router.push("/category-selection");

  return (
    <div className={`bg-gradient-to-b ${activeTheme.background} ${timeOfDay === "night" ? "text-slate-100" : "text-on-background"} min-h-screen relative flex flex-col justify-between py-10 px-4 md:px-8 overflow-hidden transition-all duration-1000`}>
      <ScreenHeader
        title="📋 Assessment"
        showBackButton={true}
        onBack={onBackAction}
        action={{ label: "Skip", onClick: handleSkip }}
      />
      
      {/* 1. Breathing Glow Blobs (Time-based light source) */}
      <div className="fixed inset-0 z-[-2] pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute top-[-15%] left-[-15%] w-[70vw] md:w-[600px] h-[70vw] md:h-[600px] rounded-full ${activeTheme.glowColor} filter blur-[120px]`}
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute bottom-[-15%] right-[-15%] w-[65vw] md:w-[550px] h-[65vw] md:h-[550px] rounded-full bg-secondary-container/15 filter blur-[130px]`}
        />
      </div>

      {/* 2. Ambient Falling Elements (Leafs & Petals) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        {AMBIENT_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -50, opacity: 0, rotate: 0 }}
            animate={{
              y: "110vh",
              opacity: [0, 0.4, 0.4, 0],
              x: [0, 50, -50, 15],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
            }}
            className={`absolute ${p.size} text-primary-purple/35 select-none`}
            style={{ left: p.x }}
          >
            {p.type === "leaf" ? "🍃" : "🌸"}
          </motion.div>
        ))}
      </div>

      {/* 3. Faint Mountain Silhouette Outline */}
      <div className={`absolute bottom-0 left-0 w-full pointer-events-none ${timeOfDay === "night" ? "opacity-[0.06] text-white" : "opacity-[0.04] text-primary"} z-[-1] overflow-hidden`}>
        <svg viewBox="0 0 1440 320" className="w-full h-auto min-h-[220px]" fill="currentColor" preserveAspectRatio="none">
          <path d="M0,224L60,197.3C120,171,240,117,360,112C480,107,600,149,720,181.3C840,213,960,235,1080,218.7C1200,203,1320,149,1380,122.7L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
        </svg>
      </div>

      {/* 4. Subtle Pulsing Lotuses in Corners */}
      <div className={`absolute top-[18%] left-[4%] text-[150px] ${timeOfDay === "night" ? "text-indigo-400/5" : "text-primary/5"} pointer-events-none select-none animate-pulse duration-[8s] hidden lg:block`}>
        🪷
      </div>
      <div className={`absolute bottom-[22%] right-[2%] text-[180px] ${timeOfDay === "night" ? "text-purple-400/5" : "text-secondary/5"} pointer-events-none select-none animate-pulse duration-[11s] hidden lg:block`}>
        🪷
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-between gap-8 z-10">
        
        {/* Progress Area */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
            <div>
              <span className="text-xs md:text-sm font-bold text-primary/75 tracking-wider uppercase flex items-center gap-1.5 justify-center md:justify-start">
                🌸 Let's get to know you
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest block text-center md:text-left mt-0.5 ${timeOfDay === "night" ? "text-slate-400" : "text-on-surface-variant/60"}`}>
                Focus: {categoryDetails.name}
              </span>
            </div>
            <span className="font-bold text-xs md:text-sm text-primary tracking-wide text-center md:text-right block">
              Question {safeIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Progress Bar */}
          <div className={`w-full ${timeOfDay === "night" ? "bg-slate-800/80 border-slate-700/30" : "bg-white/40 border-white/20"} h-2.5 rounded-full overflow-hidden shadow-inner border`}>
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary-purple rounded-full"
              initial={{ width: `${((safeIndex) / (totalQuestions || 15)) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated Question Content */}
        <div className="flex-1 flex flex-col justify-center min-h-[460px] py-2">
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
                // Glassmorphic Question Card
                className={`rounded-[36px] border shadow-2xl p-6 md:p-10 space-y-8 relative z-20 flex flex-col justify-between ${
                  timeOfDay === "night" 
                    ? "bg-slate-900/60 border-slate-800/50" 
                    : "bg-white/40 border-white/30 backdrop-blur-xl"
                }`}
              >
                {/* Question block */}
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-xl md:text-2xl font-heading font-extrabold leading-relaxed tracking-tight flex flex-col md:flex-row items-center gap-3">
                    <span className="text-3xl filter drop-shadow-sm shrink-0 mb-1.5 md:mb-0">
                      {getQuestionEmoji(question.text)}
                    </span>
                    <span className="flex-1">{question.text}</span>
                  </h2>
                  <p className={`text-xs md:text-sm font-semibold italic max-w-lg mx-auto md:mx-0 ${timeOfDay === "night" ? "text-slate-400" : "text-on-surface-variant/75"}`}>
                    "There are no right or wrong answers. Answer honestly so we can better support you."
                  </p>
                </div>

                {/* Option Cards Grid */}
                <div className="space-y-3.5 relative z-20" role="radiogroup" aria-label={question.text}>
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
                        animate={isSelected ? { y: -4, scale: 1.025 } : { y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-full flex items-center justify-between p-5 rounded-[24px] border text-left cursor-pointer group focus:outline-none transition-all duration-300 relative z-20 ${
                          isSelected
                            ? timeOfDay === "night"
                              ? "bg-slate-800/80 border-primary-purple shadow-[0_0_20px_rgba(124,107,196,0.3),_0_12px_36px_rgba(95,78,165,0.18)] ring-2 ring-primary/30 text-white font-bold"
                              : "bg-white/60 border-primary-purple shadow-[0_0_20px_rgba(124,107,196,0.2),_0_12px_36px_rgba(95,78,165,0.12)] ring-2 ring-primary/20 text-primary font-bold"
                            : timeOfDay === "night"
                              ? "bg-slate-900/40 border-slate-800/60 shadow-soft hover:shadow-md hover:border-slate-700/50 hover:bg-slate-800/30 text-slate-300"
                              : "bg-white/40 border-white/30 shadow-soft hover:shadow-md hover:border-primary/20 hover:bg-white/50 text-on-surface-variant"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 select-none pointer-events-none">
                          <span className="text-xl shrink-0 filter drop-shadow-sm">{getOptionEmoji(opt.score)}</span>
                          <span className="text-sm md:text-base font-semibold leading-normal">{opt.text}</span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all pointer-events-none ${
                            isSelected
                              ? "border-primary bg-primary"
                              : timeOfDay === "night"
                                ? "border-slate-700 bg-slate-800/40 group-hover:border-primary/45"
                                : "border-outline-variant bg-white/20 group-hover:border-primary/40"
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
        <div className={`flex justify-between items-center border-t pt-6 ${timeOfDay === "night" ? "border-slate-800/50" : "border-surface-variant/20"}`}>
          {safeIndex > 0 ? (
            <button
              onClick={handleBack}
              type="button"
              className={`px-6 py-3.5 rounded-full font-bold text-sm hover:scale-102 active:scale-98 transition-all flex items-center gap-2 border shadow-sm cursor-pointer ${
                timeOfDay === "night"
                  ? "bg-slate-900/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/60"
                  : "bg-white/50 border-surface-variant/20 text-on-surface-variant hover:bg-white/80"
              }`}
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Previous
            </button>
          ) : (
            <button
              onClick={() => router.push("/category-selection")}
              type="button"
              className={`px-6 py-3.5 rounded-full font-bold text-sm hover:scale-102 active:scale-98 transition-all flex items-center gap-2 border shadow-sm cursor-pointer ${
                timeOfDay === "night"
                  ? "bg-slate-900/60 border-slate-800/60 text-slate-300 hover:bg-slate-800/60"
                  : "bg-white/50 border-surface-variant/20 text-on-surface-variant hover:bg-white/80"
              }`}
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Category
            </button>
          )}

          <button
            onClick={handleNext}
            type="button"
            disabled={!selectedOptionId}
            className="ml-auto px-10 py-3.5 rounded-full bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-purple hover:scale-102 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 cursor-pointer"
          >
            {safeIndex === totalQuestions - 1 ? "Complete Assessment" : "Continue"}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  );
}
