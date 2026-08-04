import { AssessmentQuestion } from "./types";

export const MenQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "vulnerability_comfort",
    text: "How comfortable do you feel opening up about your fears or struggles to someone close?",
    description: "Opening up is key to preventing emotional stress and isolation.",
    options: [
      { id: "men_q6_opt1", text: "Very comfortable", score: 5 },
      { id: "men_q6_opt2", text: "Mostly comfortable", score: 4 },
      { id: "men_q6_opt3", text: "Somewhat neutral", score: 3 },
      { id: "men_q6_opt4", text: "Slightly uncomfortable", score: 2 },
      { id: "men_q6_opt5", text: "Extremely difficult", score: 1 },
    ],
  },
  {
    id: 7,
    key: "performance_pressure",
    text: "How often do expectations of provider strength or status impact your sleep and wellness?",
    description: "Traditional standards can trigger stress regarding work and career achievements.",
    options: [
      { id: "men_q7_opt1", text: "Almost never", score: 5 },
      { id: "men_q7_opt2", text: "Occasionally", score: 4 },
      { id: "men_q7_opt3", text: "Sometimes", score: 3 },
      { id: "men_q7_opt4", text: "Frequently", score: 2 },
      { id: "men_q7_opt5", text: "Almost constantly", score: 1 },
    ],
  },
  {
    id: 8,
    key: "stress_isolation",
    text: "When you feel stressed or low, how often do you withdraw and isolate yourself from others?",
    description: "Isolating during stress can delay emotional recovery and support.",
    options: [
      { id: "men_q8_opt1", text: "Almost never", score: 5 },
      { id: "men_q8_opt2", text: "Occasionally", score: 4 },
      { id: "men_q8_opt3", text: "Sometimes", score: 3 },
      { id: "men_q8_opt4", text: "Frequently", score: 2 },
      { id: "men_q8_opt5", text: "Almost always", score: 1 },
    ],
  },
  {
    id: 9,
    key: "healthy_outlets",
    text: "How regularly do you engage in healthy physical or creative outlets to release tension?",
    description: "Physical movement, sports, or creative tasks help release cortisol.",
    options: [
      { id: "men_q9_opt1", text: "Multiple times a week", score: 5 },
      { id: "men_q9_opt2", text: "Weekly", score: 4 },
      { id: "men_q9_opt3", text: "Sometimes", score: 3 },
      { id: "men_q9_opt4", text: "Rarely", score: 2 },
      { id: "men_q9_opt5", text: "No outlets at all", score: 1 },
    ],
  },
  {
    id: 10,
    key: "men_support_system",
    text: "How strong is your sense of camaraderie and connection to trusted male friends?",
    description: "Male friendships built on trust offer an important space to talk and decompress.",
    options: [
      { id: "men_q10_opt1", text: "Extremely strong", score: 5 },
      { id: "men_q10_opt2", text: "Mostly strong", score: 4 },
      { id: "men_q10_opt3", text: "Somewhat connected", score: 3 },
      { id: "men_q10_opt4", text: "Quite isolated", score: 2 },
      { id: "men_q10_opt5", text: "No close connections", score: 1 },
    ],
  },
];
