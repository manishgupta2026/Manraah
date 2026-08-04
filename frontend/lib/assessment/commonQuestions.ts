import { AssessmentQuestion } from "./types";

export const COMMON_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    key: "emotional_balance",
    text: "Over the past two weeks, how often have you felt happy, calm, or emotionally balanced?",
    description: "Reflecting on your emotional stability helps calibrate your baseline balance.",
    options: [
      { id: "q1_opt1", text: "Almost always", score: 5 },
      { id: "q1_opt2", text: "Most days", score: 4 },
      { id: "q1_opt3", text: "Sometimes", score: 3 },
      { id: "q1_opt4", text: "Rarely", score: 2 },
      { id: "q1_opt5", text: "Almost never", score: 1 },
    ],
  },
  {
    id: 2,
    key: "stress_level",
    text: "How often have you felt stressed or overwhelmed during the past two weeks?",
    description: "Recognizing moments of pressure is the first step toward finding calm.",
    options: [
      { id: "q2_opt1", text: "Almost never", score: 5 },
      { id: "q2_opt2", text: "Occasionally", score: 4 },
      { id: "q2_opt3", text: "Sometimes", score: 3 },
      { id: "q2_opt4", text: "Frequently", score: 2 },
      { id: "q2_opt5", text: "Almost every day", score: 1 },
    ],
  },
  {
    id: 3,
    key: "sleep_quality",
    text: "How would you describe your sleep during the past two weeks?",
    description: "Sleep is the foundation of emotional resilience and physical energy.",
    options: [
      { id: "q3_opt1", text: "Slept well most nights", score: 5 },
      { id: "q3_opt2", text: "Mostly good", score: 4 },
      { id: "q3_opt3", text: "Sometimes restful", score: 3 },
      { id: "q3_opt4", text: "Poor sleep on many nights", score: 2 },
      { id: "q3_opt5", text: "Very poor sleep", score: 1 },
    ],
  },
  {
    id: 4,
    key: "motivation_energy",
    text: "How motivated and energetic have you felt to do your daily activities?",
    description: "Acknowledge your current energy levels without judgment.",
    options: [
      { id: "q4_opt1", text: "Very motivated", score: 5 },
      { id: "q4_opt2", text: "Mostly motivated", score: 4 },
      { id: "q4_opt3", text: "Sometimes motivated", score: 3 },
      { id: "q4_opt4", text: "Rarely motivated", score: 2 },
      { id: "q4_opt5", text: "No motivation", score: 1 },
    ],
  },
  {
    id: 5,
    key: "confidence_coping",
    text: "When life becomes difficult, how confident do you feel about handling it?",
    description: "Confidence in difficult times reflects your inner resources and coping strategies.",
    options: [
      { id: "q5_opt1", text: "Very confident", score: 5 },
      { id: "q5_opt2", text: "Mostly confident", score: 4 },
      { id: "q5_opt3", text: "Sometimes confident", score: 3 },
      { id: "q5_opt4", text: "Rarely confident", score: 2 },
      { id: "q5_opt5", text: "Not confident at all", score: 1 },
    ],
  },
];
