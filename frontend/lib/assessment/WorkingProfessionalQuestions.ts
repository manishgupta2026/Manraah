import { AssessmentQuestion } from "./types";

export const WorkingProfessionalQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "workload_burnout",
    text: "How often have you felt physically or emotionally exhausted due to your workload?",
    description: "Chronic stress at work is a leading cause of burnout and fatigue.",
    options: [
      { id: "wp_q6_opt1", text: "Almost never", score: 5 },
      { id: "wp_q6_opt2", text: "Occasionally", score: 4 },
      { id: "wp_q6_opt3", text: "Sometimes", score: 3 },
      { id: "wp_q6_opt4", text: "Frequently", score: 2 },
      { id: "wp_q6_opt5", text: "Almost constantly", score: 1 },
    ],
  },
  {
    id: 7,
    key: "work_life_harmony",
    text: "How satisfied are you with the boundary between your work commitments and personal life?",
    description: "Maintaining clear boundaries ensures time for rest, connection, and hobbies.",
    options: [
      { id: "wp_q7_opt1", text: "Very satisfied", score: 5 },
      { id: "wp_q7_opt2", text: "Mostly satisfied", score: 4 },
      { id: "wp_q7_opt3", text: "Somewhat neutral", score: 3 },
      { id: "wp_q7_opt4", text: "Slightly dissatisfied", score: 2 },
      { id: "wp_q7_opt5", text: "Extremely dissatisfied", score: 1 },
    ],
  },
  {
    id: 8,
    key: "workplace_conflict",
    text: "How often do team friction or difficult workplace communications impact your peace of mind?",
    description: "Interpersonal issues at work can be mentally taxing to process.",
    options: [
      { id: "wp_q8_opt1", text: "Almost never", score: 5 },
      { id: "wp_q8_opt2", text: "Rarely", score: 4 },
      { id: "wp_q8_opt3", text: "Sometimes", score: 3 },
      { id: "wp_q8_opt4", text: "Frequently", score: 2 },
      { id: "wp_q8_opt5", text: "Almost every day", score: 1 },
    ],
  },
  {
    id: 9,
    key: "professional_recognition",
    text: "How valued and appreciated do you feel for your work contributions?",
    description: "Feeling recognized boosts morale and provides intrinsic motivation.",
    options: [
      { id: "wp_q9_opt1", text: "Highly valued", score: 5 },
      { id: "wp_q9_opt2", text: "Mostly valued", score: 4 },
      { id: "wp_q9_opt3", text: "Somewhat neutral", score: 3 },
      { id: "wp_q9_opt4", text: "Underappreciated", score: 2 },
      { id: "wp_q9_opt5", text: "Not valued at all", score: 1 },
    ],
  },
  {
    id: 10,
    key: "stress_recovery",
    text: "How effectively are you practicing daily self-care habits or stress relief methods?",
    description: "Dedicated daily habits help reset your stress response cycle.",
    options: [
      { id: "wp_q10_opt1", text: "Extremely effectively", score: 5 },
      { id: "wp_q10_opt2", text: "Mostly effectively", score: 4 },
      { id: "wp_q10_opt3", text: "Sometimes effectively", score: 3 },
      { id: "wp_q10_opt4", text: "Rarely effectively", score: 2 },
      { id: "wp_q10_opt5", text: "Not practicing at all", score: 1 },
    ],
  },
];
