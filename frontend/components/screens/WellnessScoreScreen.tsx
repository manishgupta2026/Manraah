"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCategory } from "@/frontend/lib/context/CategoryContext";
import { useAssessment } from "@/frontend/lib/context/AssessmentContext";
import { getWellnessLevel, getWellnessMessage } from "@/frontend/lib/assessment/wellness";
import { motion } from "framer-motion";
import ScreenHeader from "@/frontend/components/ui/ScreenHeader";

export default function WellnessScoreScreen() {
  const router = useRouter();
  const { categoryDetails } = useCategory();
  const { assessmentResult, detailedAnswers, selectedCategory } = useAssessment();
  const [result, setResult] = useState<any>(assessmentResult);
  const [loading, setLoading] = useState(!assessmentResult);

  useEffect(() => {
    if (!assessmentResult) {
      // Fetch latest assessment from backend if user refreshed page
      fetch("/api/assessment")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.latestAssessment) {
            const a = data.latestAssessment;
            setResult({
              totalScore: a.total_score,
              maxScore: a.max_score || 50,
              percentage: a.percentage,
              wellnessLevel: a.wellness_level,
              message: getWellnessMessage(a.wellness_level),
              answers: a.answers || [],
            });
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setResult(assessmentResult);
      setLoading(false);
    }
  }, [assessmentResult]);

  const finalResult = result || {
    totalScore: 42,
    maxScore: 50,
    percentage: 84,
    wellnessLevel: "Flourishing",
    message: "You are experiencing a solid level of inner balance and emotional resilience.",
  };

  const levelStyles: Record<
    string,
    { badge: string; text: string; bg: string; stroke: string }
  > = {
    Flourishing: {
      badge: "bg-mint/15 text-[#006B56] border-mint/40",
      text: "text-[#006B56]",
      bg: "bg-[#e8faf5]",
      stroke: "#5FCFB0",
    },
    Stable: {
      badge: "bg-primary/10 text-primary border-primary/20",
      text: "text-primary",
      bg: "bg-primary/5",
      stroke: "#7C6BC4",
    },
    "Needs Attention": {
      badge: "bg-[#fff9e6] text-[#b38600] border-[#ffe080]",
      text: "text-[#b38600]",
      bg: "bg-[#fffbf0]",
      stroke: "#F5C99B",
    },
    "High Risk": {
      badge: "bg-pink/15 text-tertiary border-pink/30",
      text: "text-tertiary",
      bg: "bg-pink/5",
      stroke: "#F4A6B8",
    },
    Critical: {
      badge: "bg-error/10 text-error border-error/20",
      text: "text-error",
      bg: "bg-error/5",
      stroke: "#ba1a1a",
    },
  };

  const currentStyles = levelStyles[finalResult.wellnessLevel] || levelStyles.Stable;

  const formatKeyToLabel = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-fadeIn relative select-none">
      <ScreenHeader
        title="✨ Your Sanctuary Score"
        showBackButton={true}
        fallbackRoute="/dashboard"
        onBack={() => router.push("/dashboard")}
      />

      {/* Ambient background glows */}
      <div className="fixed inset-0 z-[-2] opacity-35 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-container blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary-container blur-[120px] opacity-30" />
      </div>

      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_20px_50px_rgba(95,78,165,0.08)] text-center space-y-3 relative overflow-hidden"
      >
        <div className="text-4xl filter drop-shadow-xs">🌿</div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-on-surface tracking-tight">
          Your Sanctuary Score
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Thank you for taking a thoughtful moment to understand your inner wellness.
        </p>
      </motion.div>

      {/* Score Gauge Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-8 md:p-12 rounded-[32px] bg-white/75 backdrop-blur-xl border border-white/60 shadow-ambient text-center space-y-6 z-10 relative"
      >
        {/* Animated Circular Gauge */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#F2EBFF"
              strokeWidth="7.5"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={currentStyles.stroke}
              strokeWidth="7.5"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * finalResult.percentage) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center space-y-0.5">
            <span className="text-4xl font-heading font-black text-on-surface">
              {finalResult.totalScore}
            </span>
            <span className="text-[10px] text-on-surface-variant/70 font-bold uppercase tracking-wider">
              / {finalResult.maxScore || 50} Score
            </span>
            <span className="text-xs text-primary font-black">
              {finalResult.percentage}%
            </span>
          </div>
        </div>

        {/* Wellness Level Badge */}
        <div className="flex justify-center">
          <span
            className={`px-5 py-2 rounded-full border text-xs md:text-sm font-heading font-extrabold tracking-wide uppercase shadow-xs ${currentStyles.badge}`}
          >
            {finalResult.wellnessLevel}
          </span>
        </div>

        {/* Dynamic Calm Feedback Card */}
        <div
          className={`p-6 rounded-2xl border text-left space-y-2 max-w-xl mx-auto ${currentStyles.bg} border-surface-variant/30`}
        >
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-on-surface">
            <span className="material-symbols-outlined text-lg text-primary">spa</span>
            <span>Personalized Sanctuary Understanding</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            {finalResult.message}
          </p>
        </div>

        {/* Question Breakdown Preview if available */}
        {detailedAnswers.length > 0 && (
          <div className="max-w-xl mx-auto space-y-3 pt-4 border-t border-surface-variant/20 text-left">
            <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-on-surface-variant">
              Assessment Summary ({detailedAnswers.length} Questions)
            </h4>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {detailedAnswers.map((ans) => (
                <div
                  key={ans.questionId}
                  className="p-3 rounded-xl bg-white/60 border border-surface-variant/20 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-on-surface truncate max-w-[280px]">
                    {formatKeyToLabel(ans.questionKey)}
                  </span>
                  <span className="font-black text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                    {ans.score} / 5
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Action CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex justify-center pt-2 z-10 relative"
      >
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full sm:w-auto px-12 py-4 rounded-full bg-primary hover:bg-[#7C6BC4] text-white font-heading font-bold text-sm shadow-[0_10px_25px_rgba(95,78,165,0.25)] hover:shadow-[0_12px_30px_rgba(95,78,165,0.35)] transition-all hover:-translate-y-0.5 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue to Dashboard</span>
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </button>
      </motion.div>
    </div>
  );
}
