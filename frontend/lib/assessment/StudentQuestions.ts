import { AssessmentQuestion } from "./types";

export const StudentQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "academic_pressure",
    text: "How often have you felt overwhelmed by academic deadlines or exam preparation recently?",
    description: "Tracking study stress helps identify when workloads become difficult to handle.",
    options: [
      { id: "stud_q6_opt1", text: "Almost never", score: 5 },
      { id: "stud_q6_opt2", text: "Occasionally", score: 4 },
      { id: "stud_q6_opt3", text: "Sometimes", score: 3 },
      { id: "stud_q6_opt4", text: "Frequently", score: 2 },
      { id: "stud_q6_opt5", text: "Almost constantly", score: 1 },
    ],
  },
  {
    id: 7,
    key: "peer_belonging",
    text: "How connected and supported do you feel by your friends or study groups?",
    description: "Peer connection provides critical emotional support during academic challenges.",
    options: [
      { id: "stud_q7_opt1", text: "Extremely supported", score: 5 },
      { id: "stud_q7_opt2", text: "Mostly supported", score: 4 },
      { id: "stud_q7_opt3", text: "Sometimes supported", score: 3 },
      { id: "stud_q7_opt4", text: "Rarely supported", score: 2 },
      { id: "stud_q7_opt5", text: "Not supported at all", score: 1 },
    ],
  },
  {
    id: 8,
    key: "study_focus",
    text: "How easy has it been for you to focus during class or study hours?",
    description: "Cognitive focus can fluctuate significantly with high stress or lack of rest.",
    options: [
      { id: "stud_q8_opt1", text: "Very easy to focus", score: 5 },
      { id: "stud_q8_opt2", text: "Mostly focused", score: 4 },
      { id: "stud_q8_opt3", text: "Sometimes distracted", score: 3 },
      { id: "stud_q8_opt4", text: "Highly distracted", score: 2 },
      { id: "stud_q8_opt5", text: "Unable to focus at all", score: 1 },
    ],
  },
  {
    id: 9,
    key: "future_clarity",
    text: "How optimistic and clear do you feel about your future career or academic path?",
    description: "Uncertainty about the future is a major driver of student anxiety.",
    options: [
      { id: "stud_q9_opt1", text: "Very optimistic & clear", score: 5 },
      { id: "stud_q9_opt2", text: "Mostly positive", score: 4 },
      { id: "stud_q9_opt3", text: "Somewhat neutral", score: 3 },
      { id: "stud_q9_opt4", text: "Anxious & uncertain", score: 2 },
      { id: "stud_q9_opt5", text: "Completely lost", score: 1 },
    ],
  },
  {
    id: 10,
    key: "extracurricular_balance",
    text: "How well are you balancing schoolwork with self-care, hobbies, and social life?",
    description: "Maintaining a balanced routine is essential to prevent academic burnout.",
    options: [
      { id: "stud_q10_opt1", text: "Excellently balanced", score: 5 },
      { id: "stud_q10_opt2", text: "Mostly balanced", score: 4 },
      { id: "stud_q10_opt3", text: "Sometimes balanced", score: 3 },
      { id: "stud_q10_opt4", text: "Rarely balanced", score: 2 },
      { id: "stud_q10_opt5", text: "Completely out of balance", score: 1 },
    ],
  },
];
