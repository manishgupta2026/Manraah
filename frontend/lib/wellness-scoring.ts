/**
 * Transparent Wellness Scoring Engine
 * Normalized 0–100 formula across Mood (20%), Stress (20%), Energy (15%), Sleep (20%), and Work-Life Balance (25%).
 */

export interface WellnessScoreInput {
  mood: string | number; // "Good" | "Okay" | "Drained" | "Stressed" | "Overwhelmed" or 1-5
  stress: string | number; // "Peaceful" | "Manageable" | "A little stressful" | "Stressful" | "Overwhelming" or 1-5
  energy: number; // 1-5
  sleep: number; // 1-5
  workLifeBalance: number; // 1-5
}

export interface WellnessScoreResult {
  score: number; // 0 - 100
  level: "THRIVING" | "STABLE" | "ATTENTIVE" | "NEEDS CARE";
  summary: string;
  breakdown: {
    mind: number; // 0 - 100
    energy: number; // 0 - 100
    rest: number; // 0 - 100
    balance: number; // 0 - 100
  };
  strengths: string;
  opportunities: string;
}

export function normalizeMood(mood: string | number): number {
  if (typeof mood === "number") {
    return Math.min(100, Math.max(0, mood * 20));
  }
  const m = (mood || "").toLowerCase().trim();
  switch (m) {
    case "good":
    case "joyful":
    case "great":
      return 100;
    case "okay":
    case "calm":
    case "peaceful":
      return 80;
    case "drained":
    case "tired":
      return 50;
    case "stressed":
    case "anxious":
      return 30;
    case "overwhelmed":
    case "burned out":
      return 15;
    default:
      return 75;
  }
}

export function normalizeStress(stress: string | number): number {
  // Stress is negative metric: higher stress = lower normalized score
  if (typeof stress === "number") {
    const s = Math.min(5, Math.max(1, stress));
    return (6 - s) * 20; // 1 -> 100, 5 -> 20
  }
  const s = (stress || "").toLowerCase().trim();
  switch (s) {
    case "peaceful":
    case "low":
    case "none":
      return 100;
    case "manageable":
      return 80;
    case "a little stressful":
    case "moderate":
      return 60;
    case "stressful":
    case "high":
      return 40;
    case "very overwhelming":
    case "overwhelming":
    case "very high":
      return 20;
    default:
      return 65;
  }
}

export function normalize1To5(val: number): number {
  const v = Math.min(5, Math.max(1, Number(val) || 3));
  return v * 20;
}

export function calculateWellnessScore(input: WellnessScoreInput): WellnessScoreResult {
  const moodNorm = normalizeMood(input.mood);
  const stressNorm = normalizeStress(input.stress);
  const energyNorm = normalize1To5(input.energy);
  const sleepNorm = normalize1To5(input.sleep);
  const balanceNorm = normalize1To5(input.workLifeBalance);

  // Core formula: 20% mood, 20% stress, 15% energy, 20% sleep, 25% balance
  const rawScore =
    moodNorm * 0.20 +
    stressNorm * 0.20 +
    energyNorm * 0.15 +
    sleepNorm * 0.20 +
    balanceNorm * 0.25;

  const score = Math.round(Math.min(100, Math.max(10, rawScore)));

  const mindScore = Math.round(moodNorm * 0.5 + stressNorm * 0.5);

  let level: "THRIVING" | "STABLE" | "ATTENTIVE" | "NEEDS CARE" = "STABLE";
  let summary = "Your mindset is steadier than last week.";

  if (score >= 85) {
    level = "THRIVING";
    summary = "Your mental rhythm is steady, focused, and restorative.";
  } else if (score >= 70) {
    level = "STABLE";
    summary = "Your mindset is steadier than last week.";
  } else if (score >= 50) {
    level = "ATTENTIVE";
    summary = "Work has felt busy lately. Protect a few moments of quiet renewal.";
  } else {
    level = "NEEDS CARE";
    summary = "You have been carrying a lot. Take gentle 2-minute mindful resets.";
  }

  // Determine strengths & opportunities
  const metrics = [
    { name: "energy", val: energyNorm, label: "energy reserves" },
    { name: "mind", val: mindScore, label: "mental calm" },
    { name: "rest", val: sleepNorm, label: "sleep & rest quality" },
    { name: "balance", val: balanceNorm, label: "work-life boundaries" },
  ];

  metrics.sort((a, b) => b.val - a.val);
  const strengths = metrics[0].label;
  const opportunities = metrics[metrics.length - 1].label;

  return {
    score,
    level,
    summary,
    breakdown: {
      mind: mindScore,
      energy: energyNorm,
      rest: sleepNorm,
      balance: balanceNorm,
    },
    strengths,
    opportunities,
  };
}
