"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface InitialAnswer {
  questionId: number;
  questionText: string;
  selectedOption: string;
  emoji: string;
}

const INITIAL_QUESTIONS = [
  {
    id: 1,
    title: "What brings you to your sanctuary today?",
    subtitle: "Select the primary intention that resonates with your heart right now.",
    options: [
      { id: "peace_stress", text: "Finding daily peace & managing stress", emoji: "🌿" },
      { id: "focus_clarity", text: "Improving focus, clarity & daily routine", emoji: "🧠" },
      { id: "sleep_rest", text: "Better sleep quality & restful nights", emoji: "🌙" },
      { id: "healing_selfcare", text: "Emotional healing, reflection & self-care", emoji: "💛" },
      { id: "burnout_habits", text: "Overcoming burnout & building healthy habits", emoji: "🌸" },
    ],
  },
  {
    id: 2,
    title: "How is your energy and mind feeling right now?",
    subtitle: "There is no wrong answer. Honor your honest baseline.",
    options: [
      { id: "calm_centered", text: "Calm, centered and open to reflect", emoji: "😌" },
      { id: "tired_cluttered", text: "A bit tired, distracted or mentally cluttered", emoji: "😐" },
      { id: "stressed_pressure", text: "Stressed, anxious, or facing heavy pressure", emoji: "🌪️" },
      { id: "overwhelmed_drained", text: "Low energy, emotionally drained or overwhelmed", emoji: "🌧️" },
      { id: "hopeful_peace", text: "Hopeful and seeking a quiet moment of calm", emoji: "✨" },
    ],
  },
  {
    id: 3,
    title: "What kind of support feels most comforting to you?",
    subtitle: "We will gently tailor your sanctuary experience around this.",
    options: [
      { id: "breathing_sounds", text: "Guided calm breathing & soothing soundscapes", emoji: "🧘" },
      { id: "journaling_reflection", text: "Reflective journaling & private thought release", emoji: "📖" },
      { id: "ai_companion", text: "Gentle AI companion conversations anytime", emoji: "🤖" },
      { id: "daily_checkins", text: "Personalized daily check-ins & mood tracking", emoji: "🌿" },
      { id: "community_support", text: "Safe anonymous peer support & compassionate listening", emoji: "🤝" },
    ],
  },
];

interface InitialQuestionsFlowProps {
  onComplete: () => void;
}

export default function InitialQuestionsFlow({ onComplete }: InitialQuestionsFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<InitialAnswer[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const currentQ = INITIAL_QUESTIONS[currentIndex];
  const isLast = currentIndex === INITIAL_QUESTIONS.length - 1;

  const handleSelectOption = (option: { id: string; text: string; emoji: string }) => {
    setSelectedOptionId(option.id);

    const newAnswer: InitialAnswer = {
      questionId: currentQ.id,
      questionText: currentQ.title,
      selectedOption: option.text,
      emoji: option.emoji,
    };

    const updated = [...answers.filter((a) => a.questionId !== currentQ.id), newAnswer];
    setAnswers(updated);

    // Save temporary answers to browser storage
    try {
      localStorage.setItem("manraah_initial_answers", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save initial answers to localStorage:", e);
    }
  };

  const handleContinue = () => {
    if (!selectedOptionId) return;

    if (!isLast) {
      setDirection(1);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const existing = answers.find((a) => a.questionId === INITIAL_QUESTIONS[nextIndex].id);
      const matchedOpt = existing
        ? INITIAL_QUESTIONS[nextIndex].options.find((o) => o.text === existing.selectedOption)
        : null;
      setSelectedOptionId(matchedOpt ? matchedOpt.id : null);
    } else {
      // Mark initial questions completed
      try {
        localStorage.setItem("manraah_initial_questions_completed", "true");
        localStorage.setItem("manraah_initial_answers", JSON.stringify(answers));
      } catch (e) {
        console.error("Failed to persist initial questions flag:", e);
      }
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const existing = answers.find((a) => a.questionId === INITIAL_QUESTIONS[prevIndex].id);
      const matchedOpt = existing
        ? INITIAL_QUESTIONS[prevIndex].options.find((o) => o.text === existing.selectedOption)
        : null;
      setSelectedOptionId(matchedOpt ? matchedOpt.id : null);
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.25, ease: "easeIn" },
    }),
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden bg-gradient-to-b from-[#FFFDF4] via-[#F2EEFC] to-[#ECE5F5] select-none py-6 px-4 md:px-8">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[15%] right-[10%] w-[380px] h-[380px] rounded-full bg-primary-container/25 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[340px] h-[340px] rounded-full bg-secondary-container/20 blur-[110px]" />
      </div>

      {/* Header bar */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
            <span className="material-symbols-outlined text-xl font-bold select-none">spa</span>
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-sm text-primary tracking-tight leading-none">Manraah</h2>
            <p className="text-[8px] text-on-surface-variant/75 font-bold uppercase tracking-wider mt-0.5">Sanctuary for Mind</p>
          </div>
        </div>

        {/* Progress pill */}
        <div className="px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-primary/20 text-xs font-heading font-bold text-primary shadow-xs">
          {currentIndex + 1} of {INITIAL_QUESTIONS.length}
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 max-w-2xl w-full mx-auto flex flex-col justify-center py-6 md:py-10 z-10 relative">
        {/* Progress bar line */}
        <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-[#7C6BC4] rounded-full"
            initial={{ width: `${(currentIndex / INITIAL_QUESTIONS.length) * 100}%` }}
            animate={{ width: `${((currentIndex + 1) / INITIAL_QUESTIONS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="p-6 md:p-10 rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(95,78,165,0.08)] space-y-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              {/* Question heading */}
              <div className="space-y-2 text-left">
                <span className="px-3 py-1 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/15 inline-block">
                  🌱 Personal Understanding
                </span>
                <h1 className="text-2xl md:text-3xl font-heading font-black text-on-surface leading-tight tracking-tight">
                  {currentQ.title}
                </h1>
                <p className="text-xs md:text-sm text-on-surface-variant font-medium leading-relaxed">
                  {currentQ.subtitle}
                </p>
              </div>

              {/* Option buttons */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between gap-3 group cursor-pointer ${
                        isSelected
                          ? "bg-primary-container/20 border-primary shadow-sm ring-2 ring-primary/25"
                          : "bg-white/60 hover:bg-white/90 border-surface-variant/30 hover:border-primary/30 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-2xl filter drop-shadow-xs">{opt.emoji}</span>
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

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-surface-variant/20 gap-4">
            {currentIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-3 rounded-full border border-[#7C6BC4]/20 hover:bg-primary/5 text-on-surface-variant font-heading font-bold text-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedOptionId}
              className={`px-8 py-3.5 rounded-full font-heading font-bold text-xs shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                selectedOptionId
                  ? "bg-primary hover:bg-[#7C6BC4] text-white cursor-pointer shadow-[0_10px_25px_rgba(95,78,165,0.25)]"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>{isLast ? "Enter Sanctuary" : "Continue"}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer calm note */}
      <footer className="w-full max-w-2xl mx-auto text-center z-10 relative">
        <p className="text-[10px] text-on-surface-variant/70 font-medium">
          🔒 Private & Confidential · No account required for initial discovery
        </p>
      </footer>
    </div>
  );
}
