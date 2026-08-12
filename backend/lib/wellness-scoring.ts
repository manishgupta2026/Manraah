/**
 * Server-side Transparent Wellness Scoring Engine
 */

export interface WellnessScoreInput {
  mood: string | number;
  stress: string | number;
  energy: number;
  sleep: number;
  workLifeBalance: number;
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
  if (typeof stress === "number") {
    const s = Math.min(5, Math.max(1, stress));
    return (6 - s) * 20;
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

export function calculateWellnessScore(input: WellnessScoreInput) {
  const moodNorm = normalizeMood(input.mood);
  const stressNorm = normalizeStress(input.stress);
  const energyNorm = normalize1To5(input.energy);
  const sleepNorm = normalize1To5(input.sleep);
  const balanceNorm = normalize1To5(input.workLifeBalance);

  const rawScore =
    moodNorm * 0.20 +
    stressNorm * 0.20 +
    energyNorm * 0.15 +
    sleepNorm * 0.20 +
    balanceNorm * 0.25;

  const score = Math.round(Math.min(100, Math.max(10, rawScore)));
  const mindScore = Math.round(moodNorm * 0.5 + stressNorm * 0.5);

  let level = "STABLE";
  if (score >= 85) level = "THRIVING";
  else if (score >= 70) level = "STABLE";
  else if (score >= 50) level = "ATTENTIVE";
  else level = "NEEDS CARE";

  return {
    score,
    level,
    breakdown: {
      mind: mindScore,
      energy: energyNorm,
      rest: sleepNorm,
      balance: balanceNorm,
    },
  };
}
