import { AssessmentQuestion } from "./types";

export const FamilyQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "family_support",
    text: "How strongly do you feel you can rely on family members during difficult personal times?",
    description: "A strong family support network enhances resilience and reduces isolation.",
    options: [
      { id: "fam_q6_opt1", text: "Completely rely", score: 5 },
      { id: "fam_q6_opt2", text: "Mostly rely", score: 4 },
      { id: "fam_q6_opt3", text: "Sometimes rely", score: 3 },
      { id: "fam_q6_opt4", text: "Rarely rely", score: 2 },
      { id: "fam_q6_opt5", text: "Cannot rely at all", score: 1 },
    ],
  },
  {
    id: 7,
    key: "household_conflict",
    text: "How often do unresolved household friction or arguments disrupt your wellness?",
    description: "Continuous household conflicts can be emotionally exhausting.",
    options: [
      { id: "fam_q7_opt1", text: "Almost never", score: 5 },
      { id: "fam_q7_opt2", text: "Occasionally", score: 4 },
      { id: "fam_q7_opt3", text: "Sometimes", score: 3 },
      { id: "fam_q7_opt4", text: "Frequently", score: 2 },
      { id: "fam_q7_opt5", text: "Almost every day", score: 1 },
    ],
  },
  {
    id: 8,
    key: "shared_activities",
    text: "How often does your household engage in pleasant activities or group discussions together?",
    description: "Shared positive experiences build bond and family wellness.",
    options: [
      { id: "fam_q8_opt1", text: "Very frequently", score: 5 },
      { id: "fam_q8_opt2", text: "Occasionally", score: 4 },
      { id: "fam_q8_opt3", text: "Sometimes", score: 3 },
      { id: "fam_q8_opt4", text: "Rarely", score: 2 },
      { id: "fam_q8_opt5", text: "Almost never", score: 1 },
    ],
  },
  {
    id: 9,
    key: "individual_respect",
    text: "How respected do you feel regarding your privacy and personal boundaries within the family?",
    description: "Respecting personal space is vital for individual wellness within a home.",
    options: [
      { id: "fam_q9_opt1", text: "Fully respected", score: 5 },
      { id: "fam_q9_opt2", text: "Mostly respected", score: 4 },
      { id: "fam_q9_opt3", text: "Somewhat neutral", score: 3 },
      { id: "fam_q9_opt4", text: "Frequently violated", score: 2 },
      { id: "fam_q9_opt5", text: "Not respected at all", score: 1 },
    ],
  },
  {
    id: 10,
    key: "family_adaptation",
    text: "How constructively does your family adapt and handle stressful changes or transitions?",
    description: "Resilience as a household determines how well transitions are navigated.",
    options: [
      { id: "fam_q10_opt1", text: "Highly constructively", score: 5 },
      { id: "fam_q10_opt2", text: "Mostly positive", score: 4 },
      { id: "fam_q10_opt3", text: "Sometimes struggle", score: 3 },
      { id: "fam_q10_opt4", text: "Frequently panic", score: 2 },
      { id: "fam_q10_opt5", text: "Fall apart completely", score: 1 },
    ],
  },
];
