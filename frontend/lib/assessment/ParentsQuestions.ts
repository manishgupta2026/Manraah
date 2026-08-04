import { AssessmentQuestion } from "./types";

export const ParentsQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "parental_overwhelm",
    text: "How often have you felt overwhelmed by parenting responsibilities during the past two weeks?",
    description: "Raising a family is rewarding but introduces unique daily pressures.",
    options: [
      { id: "par_q6_opt1", text: "Almost never", score: 5 },
      { id: "par_q6_opt2", text: "Occasionally", score: 4 },
      { id: "par_q6_opt3", text: "Sometimes", score: 3 },
      { id: "par_q6_opt4", text: "Frequently", score: 2 },
      { id: "par_q6_opt5", text: "Almost every day", score: 1 },
    ],
  },
  {
    id: 7,
    key: "mindful_patience",
    text: "How easily can you maintain calm and practice mindful patience with your children?",
    description: "Patience levels drop when parent self-care is neglected.",
    options: [
      { id: "par_q7_opt1", text: "Very easily", score: 5 },
      { id: "par_q7_opt2", text: "Mostly calm", score: 4 },
      { id: "par_q7_opt3", text: "Sometimes lose patience", score: 3 },
      { id: "par_q7_opt4", text: "Frequently frustrated", score: 2 },
      { id: "par_q7_opt5", text: "Extremely difficult", score: 1 },
    ],
  },
  {
    id: 8,
    key: "partner_coordination",
    text: "How satisfied are you with the support and division of parenting tasks in your home?",
    description: "Shared parenting responsibilities build strong family dynamics and lower stress.",
    options: [
      { id: "par_q8_opt1", text: "Very satisfied", score: 5 },
      { id: "par_q8_opt2", text: "Mostly satisfied", score: 4 },
      { id: "par_q8_opt3", text: "Somewhat neutral", score: 3 },
      { id: "par_q8_opt4", text: "Slightly dissatisfied", score: 2 },
      { id: "par_q8_opt5", text: "Extremely dissatisfied", score: 1 },
    ],
  },
  {
    id: 9,
    key: "parent_personal_time",
    text: "How often do you manage to secure personal time for self-care or relaxation without guilt?",
    description: "Parents must fill their own cup first to support their family effectively.",
    options: [
      { id: "par_q9_opt1", text: "Almost always", score: 5 },
      { id: "par_q9_opt2", text: "Most days", score: 4 },
      { id: "par_q9_opt3", text: "Occasionally", score: 3 },
      { id: "par_q9_opt4", text: "Rarely", score: 2 },
      { id: "par_q9_opt5", text: "Almost never", score: 1 },
    ],
  },
  {
    id: 10,
    key: "family_harmony",
    text: "How would you describe the general level of emotional harmony and peace in your household?",
    description: "A peaceful environment supports the mental well-being of all family members.",
    options: [
      { id: "par_q10_opt1", text: "Very peaceful & harmonious", score: 5 },
      { id: "par_q10_opt2", text: "Mostly peaceful", score: 4 },
      { id: "par_q10_opt3", text: "Moderate conflicts", score: 3 },
      { id: "par_q10_opt4", text: "Frequently tense", score: 2 },
      { id: "par_q10_opt5", text: "Highly stressful", score: 1 },
    ],
  },
];
