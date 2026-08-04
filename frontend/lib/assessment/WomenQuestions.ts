import { AssessmentQuestion } from "./types";

export const WomenQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "self_care_guilt",
    text: "How often do you struggle with prioritizing self-care over caring for others?",
    description: "Women often juggle multiple caretaking roles, making guilt-free self-care difficult.",
    options: [
      { id: "wom_q6_opt1", text: "Almost never", score: 5 },
      { id: "wom_q6_opt2", text: "Occasionally", score: 4 },
      { id: "wom_q6_opt3", text: "Sometimes", score: 3 },
      { id: "wom_q6_opt4", text: "Frequently", score: 2 },
      { id: "wom_q6_opt5", text: "Almost constantly", score: 1 },
    ],
  },
  {
    id: 7,
    key: "life_transitions",
    text: "How confidently are you managing recent life transitions (career, body changes, motherhood, etc.)?",
    description: "Various developmental stages bring unique hormonal and emotional milestones.",
    options: [
      { id: "wom_q7_opt1", text: "Very confidently", score: 5 },
      { id: "wom_q7_opt2", text: "Mostly confident", score: 4 },
      { id: "wom_q7_opt3", text: "Sometimes confident", score: 3 },
      { id: "wom_q7_opt4", text: "Rarely confident", score: 2 },
      { id: "wom_q7_opt5", text: "Not confident at all", score: 1 },
    ],
  },
  {
    id: 8,
    key: "female_solidarity",
    text: "How strong is your connection to a supportive circle of female friends or mentors?",
    description: "Sharing experiences in safe peer environments is highly therapeutic.",
    options: [
      { id: "wom_q8_opt1", text: "Extremely strong", score: 5 },
      { id: "wom_q8_opt2", text: "Mostly strong", score: 4 },
      { id: "wom_q8_opt3", text: "Somewhat connected", score: 3 },
      { id: "wom_q8_opt4", text: "Quite isolated", score: 2 },
      { id: "wom_q8_opt5", text: "No support circle", score: 1 },
    ],
  },
  {
    id: 9,
    key: "societal_expectations",
    text: "How often do you feel pressured by external expectations regarding your appearance or lifestyle?",
    description: "Societal and cultural expectations can trigger significant cognitive load.",
    options: [
      { id: "wom_q9_opt1", text: "Almost never", score: 5 },
      { id: "wom_q9_opt2", text: "Rarely", score: 4 },
      { id: "wom_q9_opt3", text: "Sometimes", score: 3 },
      { id: "wom_q9_opt4", text: "Frequently", score: 2 },
      { id: "wom_q9_opt5", text: "Constantly", score: 1 },
    ],
  },
  {
    id: 10,
    key: "physical_emotional_sync",
    text: "How in tune do you feel with your body's physical cycles and emotional patterns?",
    description: "Listening to biological signals is a foundational element of women's wellness.",
    options: [
      { id: "wom_q10_opt1", text: "Fully in tune", score: 5 },
      { id: "wom_q10_opt2", text: "Mostly in tune", score: 4 },
      { id: "wom_q10_opt3", text: "Sometimes in tune", score: 3 },
      { id: "wom_q10_opt4", text: "Rarely in tune", score: 2 },
      { id: "wom_q10_opt5", text: "Completely disconnected", score: 1 },
    ],
  },
];
