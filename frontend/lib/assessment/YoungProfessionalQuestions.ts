import { AssessmentQuestion } from "./types";

export const YoungProfessionalQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "career_anxiety",
    text: "How often do you feel anxious about your early career progression or finding your footing?",
    description: "Navigating new workplaces and roles is exciting but often creates performance pressure.",
    options: [
      { id: "yp_q6_opt1", text: "Almost never", score: 5 },
      { id: "yp_q6_opt2", text: "Occasionally", score: 4 },
      { id: "yp_q6_opt3", text: "Sometimes", score: 3 },
      { id: "yp_q6_opt4", text: "Frequently", score: 2 },
      { id: "yp_q6_opt5", text: "Almost every day", score: 1 },
    ],
  },
  {
    id: 7,
    key: "workplace_integration",
    text: "How comfortable and supported do you feel fitting into your team or office culture?",
    description: "Feeling welcome at work increases confidence and lowers daily stress.",
    options: [
      { id: "yp_q7_opt1", text: "Extremely comfortable", score: 5 },
      { id: "yp_q7_opt2", text: "Mostly comfortable", score: 4 },
      { id: "yp_q7_opt3", text: "Somewhat neutral", score: 3 },
      { id: "yp_q7_opt4", text: "Slightly uncomfortable", score: 2 },
      { id: "yp_q7_opt5", text: "Very isolated", score: 1 },
    ],
  },
  {
    id: 8,
    key: "mentor_access",
    text: "How easily can you access mentorship or guidance when you feel stuck?",
    description: "Guidance from experienced peers is a strong buffer against beginner's anxiety.",
    options: [
      { id: "yp_q8_opt1", text: "Always accessible", score: 5 },
      { id: "yp_q8_opt2", text: "Mostly accessible", score: 4 },
      { id: "yp_q8_opt3", text: "Sometimes accessible", score: 3 },
      { id: "yp_q8_opt4", text: "Rarely accessible", score: 2 },
      { id: "yp_q8_opt5", text: "No guidance available", score: 1 },
    ],
  },
  {
    id: 9,
    key: "financial_stress",
    text: "How often do concerns about salary, rent, or budgeting disrupt your peace of mind?",
    description: "Financial independence is a major milestone that can come with budgeting stress.",
    options: [
      { id: "yp_q9_opt1", text: "Almost never", score: 5 },
      { id: "yp_q9_opt2", text: "Rarely", score: 4 },
      { id: "yp_q9_opt3", text: "Sometimes", score: 3 },
      { id: "yp_q9_opt4", text: "Frequently", score: 2 },
      { id: "yp_q9_opt5", text: "Constantly", score: 1 },
    ],
  },
  {
    id: 10,
    key: "after_work_recovery",
    text: "How successfully are you able to disconnect from work duties during evenings or weekends?",
    description: "Learning to set clear work boundaries early on prevents future burnout.",
    options: [
      { id: "yp_q10_opt1", text: "Completely disconnect", score: 5 },
      { id: "yp_q10_opt2", text: "Mostly disconnect", score: 4 },
      { id: "yp_q10_opt3", text: "Sometimes check emails", score: 3 },
      { id: "yp_q10_opt4", text: "Hard to disconnect", score: 2 },
      { id: "yp_q10_opt5", text: "Never disconnect", score: 1 },
    ],
  },
];
