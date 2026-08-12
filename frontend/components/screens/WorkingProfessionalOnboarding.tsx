"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/frontend/components/ui/Logo";
import { calculateWellnessScore } from "@/frontend/lib/wellness-scoring";

const WORK_SITUATIONS = [
  { id: "Comfortable", label: "Comfortable", icon: "🌿", desc: "Workload feels manageable and steady" },
  { id: "Busy", label: "Busy", icon: "💼", desc: "Full days, but holding things together" },
  { id: "Highly stressful", label: "Highly stressful", icon: "⚡", desc: "Heavy pressure and tight timelines" },
  { id: "Burned out", label: "Burned out", icon: "🌧", desc: "Drained, overwhelmed, needing space" },
];

const WELLNESS_GOALS = [
  { id: "Stress management", label: "Stress management", icon: "🧘" },
  { id: "Better sleep", label: "Better sleep & recovery", icon: "🌙" },
  { id: "Work-life balance", label: "Work-life boundaries", icon: "⚖️" },
  { id: "Anxiety management", label: "Anxiety relief", icon: "💜" },
  { id: "Better focus", label: "Mindful focus", icon: "🎯" },
  { id: "Emotional wellbeing", label: "Emotional wellbeing", icon: "🌱" },
];

const SCHEDULES = ["Hybrid", "Remote", "On-site", "Flexible schedule"];
const WORKING_HOURS = ["Under 35 hrs/wk", "35 – 45 hrs/wk", "45 – 55 hrs/wk", "55+ hrs/wk"];

const MOODS = [
  { label: "Good", emoji: "😊", desc: "Content & steady" },
  { label: "Okay", emoji: "🙂", desc: "Managing alright" },
  { label: "Drained", emoji: "😐", desc: "Low on reserves" },
  { label: "Stressed", emoji: "😟", desc: "Pressure building" },
  { label: "Overwhelmed", emoji: "😣", desc: "Needing a pause" },
];

export default function WorkingProfessionalOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [workSchedule, setWorkSchedule] = useState<string>("Hybrid");
  const [workingHours, setWorkingHours] = useState<string>("35 – 45 hrs/wk");
  const [workSituation, setWorkSituation] = useState<string>("Busy");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Stress management",
    "Work-life balance",
  ]);

  // Initial Wellness Baseline State
  const [mood, setMood] = useState<string>("Good");
  const [stress, setStress] = useState<string>("Manageable");
  const [energy, setEnergy] = useState<number>(4);
  const [sleep, setSleep] = useState<number>(4);
  const [workLifeBalance, setWorkLifeBalance] = useState<number>(3);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    const preliminary = calculateWellnessScore({
      mood,
      stress,
      energy,
      sleep,
      workLifeBalance,
    });
    setCalculatedScore(preliminary.score);

    try {
      const res = await fetch("/api/onboarding/working-professional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          age: age ? parseInt(age, 10) : undefined,
          profession: profession.trim() || undefined,
          industry: industry.trim() || undefined,
          workSchedule,
          workingHours,
          workSituation,
          wellnessGoals: selectedGoals,
          mood,
          stress,
          energy,
          sleep,
          workLifeBalance,
        }),
      });

      if (res.ok) {
        // Allow brief moment to view animated score before entering sanctuary
        setTimeout(() => {
          router.push("/dashboard/working-professional");
        }, 1200);
      } else {
        router.push("/dashboard/working-professional");
      }
    } catch (err) {
      console.warn("Onboarding network notice:", err);
      router.push("/dashboard/working-professional");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FE] dark:bg-[#120F1D] text-[#231E39] dark:text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-12 select-none relative overflow-x-hidden">
      {/* Background Soft Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-200/30 dark:bg-purple-900/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-100/30 dark:bg-teal-900/10 blur-[120px]" />
      </div>

      {/* Header Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between z-10">
        <Logo size="md" />
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i
                  ? "w-8 bg-[#6351A5]"
                  : step > i
                  ? "w-4 bg-purple-300"
                  : "w-4 bg-purple-100 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8 z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: Personal & Work Context */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="rounded-[36px] bg-white/95 dark:bg-[#1E1933]/95 border border-purple-100/70 dark:border-purple-500/20 p-8 sm:p-10 shadow-[0_12px_40px_rgba(95,78,165,0.05)] space-y-6"
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-medium bg-[#F6F0FD] text-[#6351A5] border border-purple-100/80">
                  💼 Working Professional Sanctuary
                </span>
                <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#231E39] dark:text-white">
                  Welcome. Let's personalize your sanctuary.
                </h1>
                <p className="text-xs sm:text-sm text-[#746F89] dark:text-purple-200/70">
                  Tell us a little about your workday rhythm so we can support your peace.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                      Your preferred name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ashutosh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6351A5]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                      Age <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6351A5]/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                      Role / Profession
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer, Designer, Consultant"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6351A5]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                      Industry <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tech, Healthcare, Finance"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6351A5]/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                      Work schedule
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {SCHEDULES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setWorkSchedule(s)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                            workSchedule === s
                              ? "bg-[#6351A5] text-white border-[#6351A5] shadow-xs"
                              : "bg-[#FAF8FE] dark:bg-white/5 text-[#534F64] dark:text-purple-200/80 border-purple-100 dark:border-white/10 hover:bg-purple-50"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                      Weekly working hours
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKING_HOURS.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => setWorkingHours(h)}
                          className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all text-center ${
                            workingHours === h
                              ? "bg-[#6351A5] text-white border-[#6351A5] shadow-xs"
                              : "bg-[#FAF8FE] dark:bg-white/5 text-[#534F64] dark:text-purple-200/80 border-purple-100 dark:border-white/10 hover:bg-purple-50"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-7 py-3 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Work Situation & Wellness Goals */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="rounded-[36px] bg-white/95 dark:bg-[#1E1933]/95 border border-purple-100/70 dark:border-purple-500/20 p-8 sm:p-10 shadow-[0_12px_40px_rgba(95,78,165,0.05)] space-y-6"
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-medium bg-[#F6F0FD] text-[#6351A5] border border-purple-100/80">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#231E39] dark:text-white">
                  How has work been feeling lately?
                </h2>
                <p className="text-xs sm:text-sm text-[#746F89] dark:text-purple-200/70">
                  Choose the situation that best describes your current experience.
                </p>
              </div>

              {/* Work Situation Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {WORK_SITUATIONS.map((sit) => {
                  const isSel = workSituation === sit.id;
                  return (
                    <button
                      key={sit.id}
                      type="button"
                      onClick={() => setWorkSituation(sit.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSel
                          ? "bg-[#F5EFFE] dark:bg-purple-900/30 border-[#6351A5] shadow-xs"
                          : "bg-[#FAF8FE] dark:bg-white/5 border-purple-100 dark:border-white/10 hover:border-purple-200"
                      }`}
                    >
                      <span className="text-2xl shrink-0">{sit.icon}</span>
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-heading font-bold text-[#231E39] dark:text-white">
                          {sit.label}
                        </div>
                        <p className="text-[11px] text-[#746F89] dark:text-purple-200/70">
                          {sit.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Wellness Goals */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                  What are your primary sanctuary goals? <span className="text-gray-400 font-normal">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WELLNESS_GOALS.map((g) => {
                    const isSel = selectedGoals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                          isSel
                            ? "bg-[#6351A5] text-white border-[#6351A5] shadow-2xs"
                            : "bg-[#FAF8FE] dark:bg-white/5 text-[#534F64] dark:text-purple-200/80 border-purple-100 dark:border-white/10 hover:bg-purple-50"
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span className="truncate">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#746F89] hover:text-[#231E39] font-medium cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-7 py-3 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Continue to Wellness Baseline →
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Initial Wellness Check-in Baseline */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="rounded-[36px] bg-white/95 dark:bg-[#1E1933]/95 border border-purple-100/70 dark:border-purple-500/20 p-8 sm:p-10 shadow-[0_12px_40px_rgba(95,78,165,0.05)] space-y-6"
            >
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-medium bg-[#F6F0FD] text-[#6351A5] border border-purple-100/80">
                  Step 3 of 3 • Initial Baseline
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#231E39] dark:text-white">
                  How are you arriving right now?
                </h2>
                <p className="text-xs sm:text-sm text-[#746F89] dark:text-purple-200/70">
                  This will calculate your initial Sanctuary Wellness Score.
                </p>
              </div>

              {/* Mood Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-heading font-bold text-[#231E39] dark:text-purple-200">
                  Current mood
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {MOODS.map((m) => {
                    const isSel = mood === m.label;
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => setMood(m.label)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          isSel
                            ? "bg-[#6351A5] text-white border-[#6351A5] shadow-xs scale-[1.02]"
                            : "bg-[#FAF8FE] dark:bg-white/5 border-purple-100 dark:border-white/10 hover:border-purple-200"
                        }`}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[11px] font-heading font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders Grid: Stress, Energy, Sleep, Work-Life Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Stress */}
                <div className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-[#231E39] dark:text-white">⚡ Stress Level</span>
                    <span className="text-[#6351A5] font-semibold">{stress}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {["Peaceful", "Manageable", "Stressful", "Overwhelming"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStress(s)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-medium border text-center transition-all ${
                          stress === s
                            ? "bg-[#6351A5] text-white border-[#6351A5]"
                            : "bg-white dark:bg-white/5 text-[#534F64] border-purple-100 dark:border-white/10"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy */}
                <div className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-[#231E39] dark:text-white">🌿 Energy Level</span>
                    <span className="text-[#1F7A65] font-semibold">{energy} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value))}
                    className="w-full accent-[#1F7A65] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Drained</span>
                    <span>Fully Energized</span>
                  </div>
                </div>

                {/* Sleep Quality */}
                <div className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-[#231E39] dark:text-white">🌙 Sleep &amp; Rest</span>
                    <span className="text-[#7C6BC4] font-semibold">{sleep} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full accent-[#7C6BC4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Restless</span>
                    <span>Restorative</span>
                  </div>
                </div>

                {/* Work-Life Balance */}
                <div className="p-4 rounded-2xl bg-[#FAF8FE] dark:bg-white/5 border border-purple-100 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-bold text-[#231E39] dark:text-white">⚖️ Work-Life Balance</span>
                    <span className="text-[#6351A5] font-semibold">{workLifeBalance} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={workLifeBalance}
                    onChange={(e) => setWorkLifeBalance(Number(e.target.value))}
                    className="w-full accent-[#6351A5] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Needs Space</span>
                    <span>Well Balanced</span>
                  </div>
                </div>
              </div>

              {/* Submission / Animation State */}
              {isSubmitting ? (
                <div className="p-6 rounded-2xl bg-[#F6F0FD] border border-purple-200/80 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#6351A5] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs sm:text-sm font-heading font-extrabold text-[#231E39]">
                    Calculating your personalized Sanctuary Score...
                  </p>
                  {calculatedScore && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-2xl font-heading font-black text-[#6351A5]"
                    >
                      {calculatedScore} / 100
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-[#746F89] hover:text-[#231E39] font-medium cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="px-8 py-3.5 rounded-full bg-[#6351A5] hover:bg-[#7360B8] text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    Complete &amp; Enter Sanctuary 🌿
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer reassurance */}
      <div className="max-w-md w-full mx-auto text-center z-10">
        <p className="text-[11px] text-[#746F89] dark:text-purple-200/60">
          Your answers are private, protected, and used solely to personalize your sanctuary.
        </p>
      </div>
    </div>
  );
}
