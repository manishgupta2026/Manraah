import { AssessmentQuestion } from "../types";

export const workingProfessionalQuestions: AssessmentQuestion[] = [
  {
    id: 6,
    key: "wp_workload",
    text: "How has your workload been feeling lately?",
    description: "Personalize recommendations based on how heavy your workload is.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q6_opt1", text: "Very manageable", score: 5 },
      { id: "wp_q6_opt2", text: "Mostly manageable", score: 4 },
      { id: "wp_q6_opt3", text: "A little heavy", score: 3 },
      { id: "wp_q6_opt4", text: "Very overwhelming", score: 2 }
    ]
  },
  {
    id: 7,
    key: "wp_deadlines",
    text: "How often do work deadlines leave you feeling stressed?",
    description: "Determine baseline workplace stress triggers.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q7_opt1", text: "Rarely", score: 5 },
      { id: "wp_q7_opt2", text: "Sometimes", score: 4 },
      { id: "wp_q7_opt3", text: "Often", score: 3 },
      { id: "wp_q7_opt4", text: "Almost always", score: 2 }
    ]
  },
  {
    id: 8,
    key: "wp_work_life_balance",
    text: "How satisfied are you with your work-life balance?",
    description: "Understand work boundaries and personal recovery constraints.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q8_opt1", text: "Very satisfied", score: 5 },
      { id: "wp_q8_opt2", text: "Mostly satisfied", score: 4 },
      { id: "wp_q8_opt3", text: "Somewhat dissatisfied", score: 3 },
      { id: "wp_q8_opt4", text: "Very dissatisfied", score: 2 }
    ]
  },
  {
    id: 9,
    key: "wp_focus",
    text: "How easy is it for you to stay focused during your workday?",
    description: "Gauge concentration levels during working hours.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q9_opt1", text: "Very easy", score: 5 },
      { id: "wp_q9_opt2", text: "Mostly easy", score: 4 },
      { id: "wp_q9_opt3", text: "Somewhat difficult", score: 3 },
      { id: "wp_q9_opt4", text: "Very difficult", score: 2 }
    ]
  },
  {
    id: 10,
    key: "wp_energy",
    text: "How would you describe your energy during most workdays?",
    description: "Track energy depletion patterns.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q10_opt1", text: "High", score: 5 },
      { id: "wp_q10_opt2", text: "Good", score: 4 },
      { id: "wp_q10_opt3", text: "Low", score: 3 },
      { id: "wp_q10_opt4", text: "Very low", score: 2 }
    ]
  },
  {
    id: 11,
    key: "wp_sleep",
    text: "How has your sleep been affecting your work?",
    description: "Analyze sleep disruption relative to work productivity.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q11_opt1", text: "Not at all", score: 5 },
      { id: "wp_q11_opt2", text: "A little", score: 4 },
      { id: "wp_q11_opt3", text: "Moderately", score: 3 },
      { id: "wp_q11_opt4", text: "Significantly", score: 2 }
    ]
  },
  {
    id: 12,
    key: "wp_support",
    text: "How supported do you feel in your professional environment?",
    description: "Gauge office community and structural alignment.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q12_opt1", text: "Very supported", score: 5 },
      { id: "wp_q12_opt2", text: "Mostly supported", score: 4 },
      { id: "wp_q12_opt3", text: "Somewhat unsupported", score: 3 },
      { id: "wp_q12_opt4", text: "Not supported", score: 2 }
    ]
  },
  {
    id: 13,
    key: "wp_recover",
    text: "How often do you get enough time to recover after work?",
    description: "Identify availability of daily recovery slots.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q13_opt1", text: "Almost always", score: 5 },
      { id: "wp_q13_opt2", text: "Often", score: 4 },
      { id: "wp_q13_opt3", text: "Sometimes", score: 3 },
      { id: "wp_q13_opt4", text: "Rarely", score: 2 }
    ]
  },
  {
    id: 14,
    key: "wp_emotional_wellbeing",
    text: "How would you describe your overall emotional wellbeing recently?",
    description: "Self-report baseline mood status.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q14_opt1", text: "Very good", score: 5 },
      { id: "wp_q14_opt2", text: "Good", score: 4 },
      { id: "wp_q14_opt3", text: "Okay", score: 3 },
      { id: "wp_q14_opt4", text: "Struggling", score: 2 }
    ]
  },
  {
    id: 15,
    key: "wp_assistance_goals",
    text: "What would you most like Manraah to help you with?",
    description: "Identify user targets for platform customization.",
    type: "category",
    category: "working_professional",
    options: [
      { id: "wp_q15_opt1", text: "Reducing work stress", score: 5 },
      { id: "wp_q15_opt2", text: "Improving focus", score: 5 },
      { id: "wp_q15_opt3", text: "Work-life balance", score: 5 },
      { id: "wp_q15_opt4", text: "Better sleep", score: 5 },
      { id: "wp_q15_opt5", text: "Managing emotions", score: 5 },
      { id: "wp_q15_opt6", text: "Building healthier routines", score: 5 }
    ]
  }
];
