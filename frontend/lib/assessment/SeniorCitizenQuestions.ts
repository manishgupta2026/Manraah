import { AssessmentQuestion } from "./types";

export const SeniorCitizenQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "physical_vitality",
    text: "How satisfied are you with your general level of physical comfort and energy daily?",
    description: "Physical health changes significantly affect emotional balance in later years.",
    options: [
      { id: "sr_q6_opt1", text: "Very satisfied", score: 5 },
      { id: "sr_q6_opt2", text: "Mostly satisfied", score: 4 },
      { id: "sr_q6_opt3", text: "Somewhat neutral", score: 3 },
      { id: "sr_q6_opt4", text: "Slightly uncomfortable", score: 2 },
      { id: "sr_q6_opt5", text: "Extremely uncomfortable", score: 1 },
    ],
  },
  {
    id: 7,
    key: "social_connectedness",
    text: "How often do you communicate or interact with family, friends, or neighbors?",
    description: "Regular social connection protects against feelings of isolation or loneliness.",
    options: [
      { id: "sr_q7_opt1", text: "Almost every day", score: 5 },
      { id: "sr_q7_opt2", text: "Most days", score: 4 },
      { id: "sr_q7_opt3", text: "Occasionally", score: 3 },
      { id: "sr_q7_opt4", text: "Rarely", score: 2 },
      { id: "sr_q7_opt5", text: "Almost never", score: 1 },
    ],
  },
  {
    id: 8,
    key: "daily_purpose",
    text: "How strongly do you feel a sense of purpose or interest in your daily activities?",
    description: "Hobbies, reading, gardening, or community roles support cognitive wellness.",
    options: [
      { id: "sr_q8_opt1", text: "Very strong purpose", score: 5 },
      { id: "sr_q8_opt2", text: "Mostly purposeful", score: 4 },
      { id: "sr_q8_opt3", text: "Somewhat neutral", score: 3 },
      { id: "sr_q8_opt4", text: "Rarely motivated", score: 2 },
      { id: "sr_q8_opt5", text: "No purpose at all", score: 1 },
    ],
  },
  {
    id: 9,
    key: "change_acceptance",
    text: "How comfortably are you adapting to retirement, family changes, or lifestyle shifts?",
    description: "Embracing change and finding new routines supports mental peace.",
    options: [
      { id: "sr_q9_opt1", text: "Very comfortably", score: 5 },
      { id: "sr_q9_opt2", text: "Mostly comfortable", score: 4 },
      { id: "sr_q9_opt3", text: "Somewhat neutral", score: 3 },
      { id: "sr_q9_opt4", text: "Struggle to adapt", score: 2 },
      { id: "sr_q9_opt5", text: "Deeply distressed", score: 1 },
    ],
  },
  {
    id: 10,
    key: "gentle_reflection",
    text: "How often do you feel a sense of calm, gratitude, or peace when looking back on life?",
    description: "Gentle reflection helps build deep emotional resilience and contentment.",
    options: [
      { id: "sr_q10_opt1", text: "Almost always", score: 5 },
      { id: "sr_q10_opt2", text: "Most days", score: 4 },
      { id: "sr_q10_opt3", text: "Sometimes", score: 3 },
      { id: "sr_q10_opt4", text: "Rarely", score: 2 },
      { id: "sr_q10_opt5", text: "Almost never", score: 1 },
    ],
  },
];
