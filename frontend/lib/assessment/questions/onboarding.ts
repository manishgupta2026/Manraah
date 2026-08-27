import { studentQuestions } from "./student";
import { coupleQuestions } from "./couple";
import { parentQuestions } from "./parent";

export const STUDENT_ONBOARDING_QUESTIONS = [
  {
    id: "workload",
    question: "How has your academic workload been feeling lately?",
    options: [
      { text: "Very manageable", val: "Very manageable", id: "stud_q6_opt1", score: 5 },
      { text: "Mostly manageable", val: "Mostly manageable", id: "stud_q6_opt2", score: 4 },
      { text: "A little heavy", val: "A little heavy", id: "stud_q6_opt3", score: 3 },
      { text: "Very overwhelming", val: "Very overwhelming", id: "stud_q6_opt4", score: 2 }
    ]
  },
  {
    id: "stress",
    question: "How would you describe your academic stress levels today?",
    options: [
      { text: "Calm & relaxed", val: "Calm & relaxed", id: "stud_q7_opt1", score: 5 },
      { text: "Manageable", val: "Manageable", id: "stud_q7_opt2", score: 4 },
      { text: "Elevated", val: "Elevated", id: "stud_q7_opt3", score: 3 },
      { text: "Overwhelming", val: "Overwhelming", id: "stud_q7_opt4", score: 2 }
    ]
  },
  {
    id: "sleep",
    question: "How many hours of quality sleep are you getting per night?",
    options: [
      { text: "8+ hours", val: "8+ hours", id: "stud_q8_opt1", score: 5 },
      { text: "6 to 8 hours", val: "6 to 8 hours", id: "stud_q8_opt2", score: 4 },
      { text: "4 to 6 hours", val: "4 to 6 hours", id: "stud_q8_opt3", score: 3 },
      { text: "Under 4 hours", val: "Under 4 hours", id: "stud_q8_opt4", score: 2 }
    ]
  },
  {
    id: "focus",
    question: "How easy is it for you to maintain focus during study sessions?",
    options: [
      { text: "Very easy", val: "Very easy", id: "stud_q9_opt1", score: 5 },
      { text: "Mostly easy", val: "Mostly easy", id: "stud_q9_opt2", score: 4 },
      { text: "Easily distracted", val: "Easily distracted", id: "stud_q9_opt3", score: 3 },
      { text: "Extremely difficult", val: "Extremely difficult", id: "stud_q9_opt4", score: 2 }
    ]
  },
  {
    id: "routine",
    question: "How consistent is your study routine?",
    options: [
      { text: "Highly disciplined", val: "Highly disciplined", id: "stud_q10_opt1", score: 5 },
      { text: "Moderately regular", val: "Moderately regular", id: "stud_q10_opt2", score: 4 },
      { text: "Mostly cramming", val: "Mostly cramming", id: "stud_q10_opt3", score: 3 },
      { text: "Very chaotic", val: "Very chaotic", id: "stud_q10_opt4", score: 2 }
    ]
  },
  {
    id: "examPressure",
    question: "How do you feel about your upcoming exams?",
    options: [
      { text: "Confident & prepared", val: "Confident & prepared", id: "stud_q11_opt1", score: 5 },
      { text: "Mildly anxious", val: "Mildly anxious", id: "stud_q11_opt2", score: 4 },
      { text: "Quite stressed", val: "Quite stressed", id: "stud_q11_opt3", score: 3 },
      { text: "Panicked / Unprepared", val: "Panicked / Unprepared", id: "stud_q11_opt4", score: 2 }
    ]
  },
  {
    id: "motivation",
    question: "How is your motivation to complete academic tasks today?",
    options: [
      { text: "High & inspired", val: "High & inspired", id: "stud_q12_opt1", score: 5 },
      { text: "Moderate", val: "Moderate", id: "stud_q12_opt2", score: 4 },
      { text: "Low", val: "Low", id: "stud_q12_opt3", score: 3 },
      { text: "Completely drained", val: "Completely drained", id: "stud_q12_opt4", score: 2 }
    ]
  },
  {
    id: "balance",
    question: "How well are you balancing study time with your social/personal life?",
    options: [
      { text: "Excellent balance", val: "Excellent balance", id: "stud_q13_opt1", score: 5 },
      { text: "Good balance", val: "Good balance", id: "stud_q13_opt2", score: 4 },
      { text: "Study takes over", val: "Study takes over", id: "stud_q13_opt3", score: 3 },
      { text: "No personal time", val: "No personal time", id: "stud_q13_opt4", score: 2 }
    ]
  },
  {
    id: "mood",
    question: "How is your general mood baseline this week?",
    options: [
      { text: "Good / Happy", val: "Good / Happy", id: "stud_q14_opt1", score: 5 },
      { text: "Okay / Neutral", val: "Okay / Neutral", id: "stud_q14_opt2", score: 4 },
      { text: "Stressed / Anxious", val: "Stressed / Anxious", id: "stud_q14_opt3", score: 3 },
      { text: "Down / Sad", val: "Down / Sad", id: "stud_q14_opt4", score: 2 }
    ]
  },
  {
    id: "supportPreference",
    question: "What kind of support is most important for you right now?",
    options: [
      { text: "Stress & anxiety relief", val: "Stress & anxiety relief", id: "stud_q15_opt1", score: 5 },
      { text: "Focus & study planning", val: "Focus & study planning", id: "stud_q15_opt2", score: 4 },
      { text: "Sleep & rest optimization", val: "Sleep & rest optimization", id: "stud_q15_opt3", score: 3 },
      { text: "AI companion conversations", val: "AI companion conversations", id: "stud_q15_opt4", score: 2 }
    ]
  }
];

export const WORKING_PROFESSIONAL_ONBOARDING_QUESTIONS = [
  {
    id: "workload",
    question: "How has your workload been feeling lately?",
    options: [
      { text: "Very manageable", val: "Very manageable", id: "wp_q6_opt1", score: 5 },
      { text: "Mostly manageable", val: "Mostly manageable", id: "wp_q6_opt2", score: 4 },
      { text: "A little heavy", val: "A little heavy", id: "wp_q6_opt3", score: 3 },
      { text: "Very overwhelming", val: "Very overwhelming", id: "wp_q6_opt4", score: 2 }
    ]
  },
  {
    id: "deadlines",
    question: "How often do work deadlines leave you feeling stressed?",
    options: [
      { text: "Rarely", val: "Rarely", id: "wp_q7_opt1", score: 5 },
      { text: "Sometimes", val: "Sometimes", id: "wp_q7_opt2", score: 4 },
      { text: "Often", val: "Often", id: "wp_q7_opt3", score: 3 },
      { text: "Almost always", val: "Almost always", id: "wp_q7_opt4", score: 2 }
    ]
  },
  {
    id: "workLifeBalance",
    question: "How satisfied are you with your work-life balance?",
    options: [
      { text: "Very satisfied", val: "Very satisfied", id: "wp_q8_opt1", score: 5 },
      { text: "Mostly satisfied", val: "Mostly satisfied", id: "wp_q8_opt2", score: 4 },
      { text: "Somewhat dissatisfied", val: "Somewhat dissatisfied", id: "wp_q8_opt3", score: 3 },
      { text: "Very dissatisfied", val: "Very dissatisfied", id: "wp_q8_opt4", score: 2 }
    ]
  },
  {
    id: "focus",
    question: "How easy is it for you to stay focused during your workday?",
    options: [
      { text: "Very easy", val: "Very easy", id: "wp_q9_opt1", score: 5 },
      { text: "Mostly easy", val: "Mostly easy", id: "wp_q9_opt2", score: 4 },
      { text: "Somewhat difficult", val: "Somewhat difficult", id: "wp_q9_opt3", score: 3 },
      { text: "Very difficult", val: "Very difficult", id: "wp_q9_opt4", score: 2 }
    ]
  },
  {
    id: "energy",
    question: "How would you describe your energy during most workdays?",
    options: [
      { text: "High", val: "High", id: "wp_q10_opt1", score: 5 },
      { text: "Good", val: "Good", id: "wp_q10_opt2", score: 4 },
      { text: "Low", val: "Low", id: "wp_q10_opt3", score: 3 },
      { text: "Very low", val: "Very low", id: "wp_q10_opt4", score: 2 }
    ]
  },
  {
    id: "sleep",
    question: "How has your sleep been affecting your work?",
    options: [
      { text: "Not at all", val: "Not at all", id: "wp_q11_opt1", score: 5 },
      { text: "A little", val: "A little", id: "wp_q11_opt2", score: 4 },
      { text: "Moderately", val: "Moderately", id: "wp_q11_opt3", score: 3 },
      { text: "Significantly", val: "Significantly", id: "wp_q11_opt4", score: 2 }
    ]
  },
  {
    id: "support",
    question: "How supported do you feel in your professional environment?",
    options: [
      { text: "Very supported", val: "Very supported", id: "wp_q12_opt1", score: 5 },
      { text: "Mostly supported", val: "Mostly supported", id: "wp_q12_opt2", score: 4 },
      { text: "Somewhat unsupported", val: "Somewhat unsupported", id: "wp_q12_opt3", score: 3 },
      { text: "Not supported", val: "Not supported", id: "wp_q12_opt4", score: 2 }
    ]
  },
  {
    id: "recover",
    question: "How often do you get enough time to recover after work?",
    options: [
      { text: "Almost always", val: "Almost always", id: "wp_q13_opt1", score: 5 },
      { text: "Often", val: "Often", id: "wp_q13_opt2", score: 4 },
      { text: "Sometimes", val: "Sometimes", id: "wp_q13_opt3", score: 3 },
      { text: "Rarely", val: "Rarely", id: "wp_q13_opt4", score: 2 }
    ]
  },
  {
    id: "emotionalWellbeing",
    question: "How would you describe your overall emotional wellbeing recently?",
    options: [
      { text: "Very good", val: "Very good", id: "wp_q14_opt1", score: 5 },
      { text: "Good", val: "Good", id: "wp_q14_opt2", score: 4 },
      { text: "Okay", val: "Okay", id: "wp_q14_opt3", score: 3 },
      { text: "Struggling", val: "Struggling", id: "wp_q14_opt4", score: 2 }
    ]
  },
  {
    id: "assistanceGoals",
    question: "What would you most like Manraah to help you with?",
    options: [
      { text: "Reducing work stress", val: "Reducing work stress", id: "wp_q15_opt1", score: 5 },
      { text: "Improving focus", val: "Improving focus", id: "wp_q15_opt2", score: 5 },
      { text: "Work-life balance", val: "Work-life balance", id: "wp_q15_opt3", score: 5 },
      { text: "Better sleep", val: "Better sleep", id: "wp_q15_opt4", score: 5 },
      { text: "Managing emotions", val: "Managing emotions", id: "wp_q15_opt5", score: 5 },
      { text: "Building healthier routines", val: "Building healthier routines", id: "wp_q15_opt6", score: 5 }
    ]
  }
];

export const COUPLE_ONBOARDING_QUESTIONS = coupleQuestions.map(q => ({
  id: q.key || String(q.id),
  question: q.text,
  options: q.options.map(o => ({ text: o.text, val: o.text, id: o.id, score: o.score }))
}));

export const PARENT_ONBOARDING_QUESTIONS = parentQuestions.map(q => ({
  id: q.key || String(q.id),
  question: q.text,
  options: q.options.map(o => ({ text: o.text, val: o.text, id: o.id, score: o.score }))
}));

export const PERSONAL_ONBOARDING_QUESTIONS = [
  {
    id: "stress",
    question: "How would you describe your general stress levels recently?",
    options: [
      { text: "Calm & relaxed", val: "Calm & relaxed", id: "pers_q6_opt1", score: 5 },
      { text: "Manageable", val: "Manageable", id: "pers_q6_opt2", score: 4 },
      { text: "Elevated", val: "Elevated", id: "pers_q6_opt3", score: 3 },
      { text: "Overwhelming", val: "Overwhelming", id: "pers_q6_opt4", score: 2 }
    ]
  },
  {
    id: "energy",
    question: "How satisfied are you with your daily energy levels?",
    options: [
      { text: "Very satisfied", val: "Very satisfied", id: "pers_q7_opt1", score: 5 },
      { text: "Mostly satisfied", val: "Mostly satisfied", id: "pers_q7_opt2", score: 4 },
      { text: "Somewhat dissatisfied", val: "Somewhat dissatisfied", id: "pers_q7_opt3", score: 3 },
      { text: "Very dissatisfied", val: "Very dissatisfied", id: "pers_q7_opt4", score: 2 }
    ]
  },
  {
    id: "sleep",
    question: "How many hours of quality sleep are you getting per night?",
    options: [
      { text: "8+ hours", val: "8+ hours", id: "pers_q8_opt1", score: 5 },
      { text: "6 to 8 hours", val: "6 to 8 hours", id: "pers_q8_opt2", score: 4 },
      { text: "4 to 6 hours", val: "4 to 6 hours", id: "pers_q8_opt3", score: 3 },
      { text: "Under 4 hours", val: "Under 4 hours", id: "pers_q8_opt4", score: 2 }
    ]
  },
  {
    id: "focus",
    question: "How easy is it for you to maintain focus on your daily tasks?",
    options: [
      { text: "Very easy", val: "Very easy", id: "pers_q9_opt1", score: 5 },
      { text: "Mostly easy", val: "Mostly easy", id: "pers_q9_opt2", score: 4 },
      { text: "Somewhat difficult", val: "Somewhat difficult", id: "pers_q9_opt3", score: 3 },
      { text: "Very difficult", val: "Very difficult", id: "pers_q9_opt4", score: 2 }
    ]
  },
  {
    id: "routine",
    question: "How consistent is your daily self-care routine?",
    options: [
      { text: "Highly consistent", val: "Highly consistent", id: "pers_q10_opt1", score: 5 },
      { text: "Moderately consistent", val: "Moderately consistent", id: "pers_q10_opt2", score: 4 },
      { text: "Rarely consistent", val: "Rarely consistent", id: "pers_q10_opt3", score: 3 },
      { text: "No routine at all", val: "No routine at all", id: "pers_q10_opt4", score: 2 }
    ]
  },
  {
    id: "socialSupport",
    question: "How satisfied are you with your social connections and support?",
    options: [
      { text: "Very satisfied", val: "Very satisfied", id: "pers_q11_opt1", score: 5 },
      { text: "Mostly satisfied", val: "Mostly satisfied", id: "pers_q11_opt2", score: 4 },
      { text: "Somewhat dissatisfied", val: "Somewhat dissatisfied", id: "pers_q11_opt3", score: 3 },
      { text: "Very dissatisfied", val: "Very dissatisfied", id: "pers_q11_opt4", score: 2 }
    ]
  },
  {
    id: "overwhelmed",
    question: "How often do you feel overwhelmed by your daily responsibilities?",
    options: [
      { text: "Rarely", val: "Rarely", id: "pers_q12_opt1", score: 5 },
      { text: "Sometimes", val: "Sometimes", id: "pers_q12_opt2", score: 4 },
      { text: "Often", val: "Often", id: "pers_q12_opt3", score: 3 },
      { text: "Almost always", val: "Almost always", id: "pers_q12_opt4", score: 2 }
    ]
  },
  {
    id: "relax",
    question: "How often do you get enough time to relax and recover?",
    options: [
      { text: "Almost always", val: "Almost always", id: "pers_q13_opt1", score: 5 },
      { text: "Often", val: "Often", id: "pers_q13_opt2", score: 4 },
      { text: "Sometimes", val: "Sometimes", id: "pers_q13_opt3", score: 3 },
      { text: "Rarely", val: "Rarely", id: "pers_q13_opt4", score: 2 }
    ]
  },
  {
    id: "emotionalWellbeing",
    question: "How would you describe your overall emotional wellbeing recently?",
    options: [
      { text: "Very good", val: "Very good", id: "pers_q14_opt1", score: 5 },
      { text: "Good", val: "Good", id: "pers_q14_opt2", score: 4 },
      { text: "Okay", val: "Okay", id: "pers_q14_opt3", score: 3 },
      { text: "Struggling", val: "Struggling", id: "pers_q14_opt4", score: 2 }
    ]
  },
  {
    id: "assistanceGoals",
    question: "What would you most like Manraah to help you with?",
    options: [
      { text: "Reducing daily stress", val: "Reducing daily stress", id: "pers_q15_opt1", score: 5 },
      { text: "Improving focus", val: "Improving focus", id: "pers_q15_opt2", score: 5 },
      { text: "Better sleep", val: "Better sleep", id: "pers_q15_opt3", score: 5 },
      { text: "Managing emotions", val: "Managing emotions", id: "pers_q15_opt4", score: 5 },
      { text: "Building healthier routines", val: "Building healthier routines", id: "pers_q15_opt5", score: 5 },
      { text: "AI companion chat", val: "AI companion chat", id: "pers_q15_opt6", score: 5 }
    ]
  }
];

export function getOnboardingQuestions(category: string | null): any[] {
  if (!category) return STUDENT_ONBOARDING_QUESTIONS;
  const key = category.toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (key.includes("working") || key.includes("professional") || key === "young_pro" || key === "youngprofessional") {
    return WORKING_PROFESSIONAL_ONBOARDING_QUESTIONS;
  }
  if (key === "couple" || key === "couples") {
    return COUPLE_ONBOARDING_QUESTIONS;
  }
  if (key === "parent" || key === "parents") {
    return PARENT_ONBOARDING_QUESTIONS;
  }
  if (key === "student") {
    return STUDENT_ONBOARDING_QUESTIONS;
  }
  return PERSONAL_ONBOARDING_QUESTIONS;
}

export function getAssessmentMetadata(category: string | null) {
  const normalized = (category || "student").toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (normalized.includes("working") || normalized.includes("professional") || normalized === "young_pro" || normalized === "youngprofessional") {
    return {
      title: "WORKING PROFESSIONAL WELLNESS ASSESSMENT",
      description: "Help us understand your work, stress, and wellness needs so we can personalize your Manraah experience.",
      questions: WORKING_PROFESSIONAL_ONBOARDING_QUESTIONS
    };
  }
  if (normalized === "couple" || normalized === "couples") {
    return {
      title: "COUPLE WELLNESS ASSESSMENT",
      description: "Help us understand your relationship connection, communication, and shared wellness goals.",
      questions: COUPLE_ONBOARDING_QUESTIONS
    };
  }
  if (normalized === "parent" || normalized === "parents") {
    return {
      title: "PARENT WELLNESS ASSESSMENT",
      description: "Help us understand your family dynamics, parenting stress, and self-care balance.",
      questions: PARENT_ONBOARDING_QUESTIONS
    };
  }
  if (normalized === "student") {
    return {
      title: "STUDENT WELLNESS ASSESSMENT",
      description: "Help us understand your academic pressure, study habits, and campus life balance.",
      questions: STUDENT_ONBOARDING_QUESTIONS
    };
  }
  return {
    title: "PERSONAL WELLNESS ASSESSMENT",
    description: "Help us understand your daily stress, sleep quality, and emotional wellbeing.",
    questions: PERSONAL_ONBOARDING_QUESTIONS
  };
}
